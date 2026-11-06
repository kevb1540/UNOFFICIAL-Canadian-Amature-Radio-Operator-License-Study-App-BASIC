// ©️ Kevin W. Brown 2026
package ca.kevin.maplewave;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.content.ClipData;
import android.provider.MediaStore;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.provider.Settings;
import android.util.AtomicFile;
import android.util.Base64;
import android.view.View;
import android.webkit.*;
import android.widget.FrameLayout;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** A single offline Android app. Only bundled assets can reach the storage bridge. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://maplewave.local";
    private static final int EXPORT = 41, IMPORT = 42, UPDATE = 43, INSTALL_PERMISSION = 44, AVATAR_FILE=51, AVATAR_CAMERA=52;
    private static final int MAX_STATE = 64 * 1024 * 1024;
    private WebView web;
    private FrameLayout appRoot;
    private LessonSpeech lessonSpeech;
    private LessonSelectionCallback currentLessonSelection;
    private AtomicFile state;
    private AtomicFile profileVault;
    private String pendingExport;
    private String pendingUpdateVersion;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        state = new AtomicFile(new File(getFilesDir(), "maplewave-v2.json"));
        profileVault = new AtomicFile(new File(getFilesDir(), "maplewave-profiles-v1.json"));
        getWindow().setStatusBarColor(Color.rgb(11, 18, 31));
        getWindow().setNavigationBarColor(Color.rgb(11, 18, 31));
        FrameLayout root = new FrameLayout(this);
        appRoot = root;
        root.setBackgroundColor(Color.rgb(11,18,31));
        web = new LessonWebView();
        web.setBackgroundColor(Color.rgb(11,18,31));
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        setContentView(root);
        root.requestApplyInsets();
        if(Build.VERSION.SDK_INT>=33){getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0,()->dispatchBack());}
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        web.addJavascriptInterface(new StorageBridge(), "AndroidApp");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!ORIGIN.equals(uri.getScheme()+"://"+uri.getHost())) return denied();
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..") || !path.matches("/[a-zA-Z0-9_./-]+")) return denied();
                String mime = path.endsWith(".js") ? "application/javascript" :
                    path.endsWith(".css") ? "text/css" : path.endsWith(".json") ? "application/json" :
                    path.endsWith(".png") ? "image/png" : path.endsWith(".mp3") ? "audio/mpeg" : "text/html";
                try { return new WebResourceResponse(mime,(mime.startsWith("image/")||mime.startsWith("audio/"))?null:"UTF-8",getAssets().open(path.substring(1))); }
                catch (IOException e) { return denied(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (ORIGIN.equals(request.getUrl().getScheme()+"://"+request.getUrl().getHost())) return false;
                if(request.isForMainFrame()) openExternal(request.getUrl().toString());
                return true;
            }
        });
        lessonSpeech = new LessonSpeech(this, new LessonSpeech.Events() {
            public void speech(String id, String event, String message) {
                if(web!=null)web.evaluateJavascript("window.onLessonSpeechEvent && window.onLessonSpeechEvent("+JSONObject.quote(id)+","+JSONObject.quote(event)+","+JSONObject.quote(message)+")",null);
            }
            public void boundary(String id, int start, int end) {
                if(web!=null)web.evaluateJavascript("window.onLessonSpeechBoundary && window.onLessonSpeechBoundary("+JSONObject.quote(id)+","+start+","+end+")",null);
            }
            public void voicesChanged() {
                if(web!=null)web.evaluateJavascript("window.onLessonVoicesChanged && window.onLessonVoicesChanged()",null);
            }
        });
        web.loadUrl(ORIGIN+"/index.html");
    }
    private final class LessonWebView extends WebView {
        LessonWebView(){super(MainActivity.this);}
        private android.view.ActionMode.Callback withHighlights(android.view.ActionMode.Callback callback){
            return callback instanceof LessonSelectionCallback?callback:new LessonSelectionCallback(callback);
        }
        @Override public android.view.ActionMode startActionMode(android.view.ActionMode.Callback callback){
            return super.startActionMode(withHighlights(callback),android.view.ActionMode.TYPE_PRIMARY);
        }
        @Override public android.view.ActionMode startActionMode(android.view.ActionMode.Callback callback,int type){
            return super.startActionMode(withHighlights(callback),type);
        }
    }
    private final class LessonSelectionCallback extends android.view.ActionMode.Callback2 {
        private static final int HIGHLIGHT=0x6d770001;
        private static final int HIGHLIGHT_COLOUR=0x6d770002;
        private static final int READ_FROM_HERE=0x6d770003;
        private static final int REMOVE_HIGHLIGHT=0x6d770004;
        private final android.view.ActionMode.Callback original;
        private boolean closed=false,available=false,highlighted=false;
        private android.view.ActionMode currentMode;
        private int revision=0;
        LessonSelectionCallback(android.view.ActionMode.Callback original){this.original=original;}
        private boolean addHighlight(android.view.Menu menu){
            boolean changed=false;
            if(menu.findItem(HIGHLIGHT)==null){menu.add(android.view.Menu.NONE,HIGHLIGHT,60,"Highlight").setVisible(available).setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_IF_ROOM);changed=true;}
            if(menu.findItem(HIGHLIGHT_COLOUR)==null){menu.add(android.view.Menu.NONE,HIGHLIGHT_COLOUR,61,"Highlighter Colour").setVisible(available).setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_NEVER);changed=true;}
            if(menu.findItem(READ_FROM_HERE)==null){menu.add(android.view.Menu.NONE,READ_FROM_HERE,62,"Read from here").setVisible(available).setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_NEVER);changed=true;}
            if(menu.findItem(REMOVE_HIGHLIGHT)==null){menu.add(android.view.Menu.NONE,REMOVE_HIGHLIGHT,63,"Remove Highlight").setVisible(available&&highlighted).setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_NEVER);changed=true;}
            return changed;
        }
        private void setAvailable(android.view.Menu menu,boolean next,boolean marked){
            available=next;highlighted=next&&marked;
            for(int id:new int[]{HIGHLIGHT,HIGHLIGHT_COLOUR,READ_FROM_HERE}){android.view.MenuItem item=menu.findItem(id);if(item!=null)item.setVisible(available);}
            android.view.MenuItem remove=menu.findItem(REMOVE_HIGHLIGHT);if(remove!=null)remove.setVisible(highlighted);
        }
        void selectionChanged(boolean next,boolean marked){
            if(closed||currentMode==null)return;
            revision++;
            if(next!=available||(next&&marked)!=highlighted){setAvailable(currentMode.getMenu(),next,marked);currentMode.invalidate();}
        }
        private void refresh(android.view.ActionMode mode,android.view.Menu menu){
            final int request=++revision;
            web.evaluateJavascript("window.lessonHighlightSelectionState ? window.lessonHighlightSelectionState() : {available:false,highlighted:false}",result->{
                if(closed||request!=revision)return;
                boolean next=false,marked=false;
                try{JSONObject selection=new JSONObject(result);next=selection.optBoolean("available");marked=selection.optBoolean("highlighted");}catch(Exception ignored){}
                if(next!=available||(next&&marked)!=highlighted){setAvailable(menu,next,marked);mode.invalidate();}
            });
        }
        @Override public boolean onCreateActionMode(android.view.ActionMode mode,android.view.Menu menu){
            if(!original.onCreateActionMode(mode,menu))return false;
            currentMode=mode;currentLessonSelection=this;
            addHighlight(menu);refresh(mode,menu);return true;
        }
        @Override public boolean onPrepareActionMode(android.view.ActionMode mode,android.view.Menu menu){
            boolean changed=original.onPrepareActionMode(mode,menu);changed=addHighlight(menu)||changed;refresh(mode,menu);return changed;
        }
        @Override public boolean onActionItemClicked(android.view.ActionMode mode,android.view.MenuItem item){
            if(item.getItemId()==REMOVE_HIGHLIGHT){
                web.evaluateJavascript("Boolean(window.removeLessonHighlightSelection && window.removeLessonHighlightSelection())",result->{if(!closed&&"true".equals(result))mode.finish();});
                return true;
            }
            if(item.getItemId()==READ_FROM_HERE){
                web.evaluateJavascript("Boolean(window.readLessonFromSelection && window.readLessonFromSelection())",result->{if(!closed&&"true".equals(result))mode.finish();});
                return true;
            }
            if(item.getItemId()==HIGHLIGHT_COLOUR){
                web.evaluateJavascript("Boolean(window.openLessonHighlighterColours && window.openLessonHighlighterColours())",result->{if(!closed&&"true".equals(result))mode.finish();});
                return true;
            }
            if(item.getItemId()!=HIGHLIGHT)return original.onActionItemClicked(mode,item);
            web.evaluateJavascript("Boolean(window.highlightLessonSelection && window.highlightLessonSelection())",result->{if(!closed&&"true".equals(result))mode.finish();});
            return true;
        }
        @Override public void onDestroyActionMode(android.view.ActionMode mode){
            closed=true;revision++;if(currentLessonSelection==this)currentLessonSelection=null;original.onDestroyActionMode(mode);web.evaluateJavascript("window.clearLessonHighlightSelection && window.clearLessonHighlightSelection()",null);
        }
        @Override public void onGetContentRect(android.view.ActionMode mode,View view,android.graphics.Rect rect){
            if(original instanceof android.view.ActionMode.Callback2)((android.view.ActionMode.Callback2)original).onGetContentRect(mode,view,rect);
            else super.onGetContentRect(mode,view,rect);
        }
    }
    private WebResourceResponse denied() {
        return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));
    }
    private void openExternal(String url) {
        Uri uri=Uri.parse(url);
        if(!"https".equals(uri.getScheme())) return;
        runOnUiThread(() -> { try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
            catch(Exception e) { alert("No browser available", "Install a browser to open this reference."); } });
    }
    private void alert(String title,String message) {
        new AlertDialog.Builder(this).setTitle(title).setMessage(message).setPositiveButton("OK",null).show();
    }
    private synchronized String readState() {
        try (InputStream in=state.openRead()) { return new String(readBounded(in),StandardCharsets.UTF_8); }
        catch(FileNotFoundException e){ return ""; }
        catch(Exception e){ return "{\"loadError\":true}"; }
    }
    private byte[] readBounded(InputStream in) throws IOException {
        ByteArrayOutputStream out=new ByteArrayOutputStream();
        byte[] b=new byte[8192]; int n;
        while((n=in.read(b))!=-1){ if(out.size()+n>MAX_STATE)throw new IOException("Backup exceeds 64 MiB");out.write(b,0,n); }
        return out.toByteArray();
    }
    private synchronized boolean writeState(String text) {
        FileOutputStream out=null;
        try {
            byte[] bytes=text.getBytes(StandardCharsets.UTF_8);
            if(bytes.length>MAX_STATE) return false;
            JSONObject data=new JSONObject(text);
            if(data.optInt("schema")!=2 || !data.has("attempts") || !data.has("completed"))return false;
            out=state.startWrite();out.write(bytes);state.finishWrite(out);return true;
        }catch(Exception e){if(out!=null)state.failWrite(out);return false;}
    }
    private synchronized String readProfiles() {
        try(InputStream in=profileVault.openRead()){return new String(readBounded(in),StandardCharsets.UTF_8);}
        catch(FileNotFoundException e){return "";}catch(Exception e){return "{\"loadError\":true}";}
    }
    private synchronized boolean writeProfiles(String text) {
        FileOutputStream out=null;
        try{byte[] data=text.getBytes(StandardCharsets.UTF_8);if(data.length>MAX_STATE)return false;
            JSONObject v=new JSONObject(text);if(v.optInt("schema")!=1||!"Maplewave profiles".equals(v.optString("app"))||v.getJSONArray("profiles").length()>50)return false;
            out=profileVault.startWrite();out.write(data);profileVault.finishWrite(out);return true;
        }catch(Exception e){if(out!=null)profileVault.failWrite(out);return false;}
    }
    private void avatarResult(Uri uri) {
        new Thread(()->{try{
            byte[] data;try(InputStream in=getContentResolver().openInputStream(uri)){data=readBounded(in);}
            if(data.length>20*1024*1024)throw new IOException("Choose an image smaller than 20 MiB.");
            BitmapFactory.Options o=new BitmapFactory.Options();o.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(data,0,data.length,o);
            if(o.outWidth<1||o.outHeight<1)throw new IOException("Choose a supported image file.");
            o.inSampleSize=1;while(o.outWidth/o.inSampleSize>1024||o.outHeight/o.inSampleSize>1024)o.inSampleSize*=2;
            o.inJustDecodeBounds=false;Bitmap bitmap=BitmapFactory.decodeByteArray(data,0,data.length,o);
            if(bitmap==null)throw new IOException("Could not read that image.");
            Matrix matrix=new Matrix();
            try{int orientation=new ExifInterface(new ByteArrayInputStream(data)).getAttributeInt(ExifInterface.TAG_ORIENTATION,1);
                if(orientation==2)matrix.setScale(-1,1);else if(orientation==3)matrix.setRotate(180);else if(orientation==4)matrix.setScale(1,-1);
                else if(orientation==5){matrix.setRotate(90);matrix.postScale(-1,1);}else if(orientation==6)matrix.setRotate(90);
                else if(orientation==7){matrix.setRotate(270);matrix.postScale(-1,1);}else if(orientation==8)matrix.setRotate(270);
            }catch(Exception ignored){}
            Bitmap rotated=Bitmap.createBitmap(bitmap,0,0,bitmap.getWidth(),bitmap.getHeight(),matrix,true);
            int side=Math.min(rotated.getWidth(),rotated.getHeight());Bitmap cropped=Bitmap.createBitmap(rotated,(rotated.getWidth()-side)/2,(rotated.getHeight()-side)/2,side,side);
            Bitmap small=Bitmap.createScaledBitmap(cropped,256,256,true);ByteArrayOutputStream out=new ByteArrayOutputStream();small.compress(Bitmap.CompressFormat.JPEG,82,out);
            String picture="data:image/jpeg;base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);
            runOnUiThread(()->web.evaluateJavascript("window.receiveAvatar("+JSONObject.quote(picture)+")",null));
        }catch(Exception e){runOnUiThread(()->web.evaluateJavascript("window.avatarError("+JSONObject.quote(e.getMessage()==null?"Could not read that avatar.":e.getMessage())+")",null));}
        finally{File photo=new File(getCacheDir(),"avatar-camera.jpg");photo.delete();}}).start();
    }
    private void recoveryRequest(String endpoint,String action,String body,String requestId) {
        new Thread(()->{String result;HttpsURLConnection connection=null;
            try{URL origin=new URL(endpoint);
                if(!"https".equals(origin.getProtocol())||origin.getUserInfo()!=null||origin.getQuery()!=null||origin.getRef()!=null||(!origin.getPath().isEmpty()&&!origin.getPath().equals("/"))||origin.getHost().equals("maplewave.local"))throw new IOException("Use a valid HTTPS recovery service address.");
                if(!action.matches("enrol|verify|request-reset|reset")||body.length()>65536||requestId.length()>30)throw new IOException("Invalid recovery request.");
                connection=(HttpsURLConnection)new URL(endpoint.replaceAll("/+$","")+"/v1/"+action).openConnection();
                connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(10000);connection.setReadTimeout(15000);connection.setRequestMethod("POST");connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type","application/json");connection.setRequestProperty("Accept","application/json");
                try(OutputStream out=connection.getOutputStream()){out.write(body.getBytes(StandardCharsets.UTF_8));}
                int status=connection.getResponseCode();InputStream response=status<400?connection.getInputStream():connection.getErrorStream();
                if(response==null)throw new IOException("The recovery service did not return a response.");
                try(InputStream in=response){ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))!=-1){if(out.size()+n>65536)throw new IOException("Invalid recovery response.");out.write(b,0,n);}result=out.toString("UTF-8");}
                JSONObject parsed=new JSONObject(result);if(status<200||status>=300)throw new IOException(parsed.optString("error","The recovery request failed. Try again later."));
            }catch(Exception e){try{result=new JSONObject().put("error",e instanceof javax.net.ssl.SSLException?"Could not verify the recovery service’s HTTPS certificate.":e.getMessage()==null?"Could not reach the recovery service.":e.getMessage()).toString();}catch(Exception ignored){result="{\"error\":\"Recovery service unavailable.\"}";}}
            finally{if(connection!=null)connection.disconnect();}
            final String response=result;runOnUiThread(()->web.evaluateJavascript("window.receiveRecovery("+JSONObject.quote(requestId)+","+JSONObject.quote(response)+")",null));
        }).start();
    }
    public final class StorageBridge {
        @JavascriptInterface public String lessonVoices(){return lessonSpeech==null?"{\"ready\":false,\"voices\":[]}":lessonSpeech.catalogue();}
        @JavascriptInterface public void refreshLessonVoices(){runOnUiThread(()->{if(lessonSpeech!=null)lessonSpeech.refresh();});}
        @JavascriptInterface public void speakLessonChunk(String text,String voice,double rate,String id){runOnUiThread(()->{if(lessonSpeech!=null)lessonSpeech.speak(text,voice,rate,id);});}
        @JavascriptInterface public void stopLessonSpeech(){runOnUiThread(()->{if(lessonSpeech!=null)lessonSpeech.stop();});}
        @JavascriptInterface public void openSpeechSettings(){runOnUiThread(()->{if(lessonSpeech!=null)lessonSpeech.openSettings();});}
        @JavascriptInterface public void applyColourTheme(String colour,boolean light){
            if(colour==null||!colour.matches("#[0-9a-fA-F]{6}"))return;
            runOnUiThread(()->{int c=Color.parseColor(colour);getWindow().setStatusBarColor(c);getWindow().setNavigationBarColor(c);if(appRoot!=null)appRoot.setBackgroundColor(c);if(web!=null){web.setBackgroundColor(c);int mask=View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;int flags=web.getSystemUiVisibility();web.setSystemUiVisibility(light?flags|mask:flags&~mask);}});
        }
        @JavascriptInterface public boolean lessonHighlightMenu(){return true;}
        @JavascriptInterface public void lessonHighlightSelectionChanged(boolean available){
            runOnUiThread(()->{if(currentLessonSelection!=null)currentLessonSelection.selectionChanged(available,false);});
        }
        @JavascriptInterface public void lessonHighlightSelectionStateChanged(boolean available,boolean highlighted){
            runOnUiThread(()->{if(currentLessonSelection!=null)currentLessonSelection.selectionChanged(available,highlighted);});
        }
        @JavascriptInterface public String load() { return readState(); }
        @JavascriptInterface public String loadProfiles(){return readProfiles();}
        @JavascriptInterface public boolean saveProfiles(String text){return writeProfiles(text);}
        @JavascriptInterface public void clearLegacy(){state.delete();new AtomicFile(new File(getFilesDir(),"before-last-update.json")).delete();}
        @JavascriptInterface public String sealProfile(String text,String key,String aad){try{if(text.length()>32*1024*1024)throw new IOException("Profile exceeds 32 MiB");return ProfileCrypto.seal(text,key,aad);}catch(Exception e){throw new IllegalStateException("Profile encryption failed");}}
        @JavascriptInterface public void recoveryRequest(String endpoint,String action,String body,String requestId){MainActivity.this.recoveryRequest(endpoint,action,body,requestId);}
        @JavascriptInterface public void chooseAvatar(String source){runOnUiThread(()->{try{
            if("camera".equals(source)){
                File photo=new File(getCacheDir(),"avatar-camera.jpg");photo.delete();Uri output=Uri.parse("content://"+getPackageName()+".avatars/avatar.jpg");
                Intent i=new Intent(MediaStore.ACTION_IMAGE_CAPTURE);i.putExtra(MediaStore.EXTRA_OUTPUT,output);i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION);i.setClipData(ClipData.newRawUri("Avatar",output));startActivityForResult(i,AVATAR_CAMERA);
            }else{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("image/*");startActivityForResult(i,AVATAR_FILE);}
        }catch(Exception e){web.evaluateJavascript("window.avatarError("+JSONObject.quote("camera".equals(source)?"No camera app is available. Choose an image from files instead.":"Could not open the image picker.")+")",null);}});}
        @JavascriptInterface public void exportNamedBackup(String text,String name){exportBackup(text,name.replaceAll("[\\p{Cntrl}<>:\"/\\\\|?*]","_"));}
        @JavascriptInterface public boolean save(String text) { return writeState(text); }
        @JavascriptInterface public void close() {runOnUiThread(()->finish());}
        @JavascriptInterface public String recovery() {
            try(InputStream in=new AtomicFile(new File(getFilesDir(),"before-last-update.json")).openRead()){
                return new String(readBounded(in),StandardCharsets.UTF_8);
            }catch(Exception e){return "";}
        }
        @JavascriptInterface public String version() {
            try {PackageInfo p=getPackageManager().getPackageInfo(getPackageName(),0);return new JSONObject().put("name",p.versionName).put("code",versionCode(p)).toString();}
            catch(Exception e){return "{}";}
        }
        @JavascriptInterface public void chooseUpdate() {
            runOnUiThread(() -> {
                Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("application/vnd.android.package-archive");
                try{startActivityForResult(i,UPDATE);}catch(Exception e){alert("Update picker unavailable","Open the downloaded update APK in your Files app to install it over this version.");}
            });
        }
        private void exportBackup(String text,String name) {
            pendingExport=text;
            runOnUiThread(() -> {
                Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/octet-stream");i.putExtra(Intent.EXTRA_TITLE,name);
                try {startActivityForResult(i,EXPORT);}catch(Exception e){alert("Export unavailable","Your device has no document picker.");}
            });
        }
        @JavascriptInterface public void importBackup() {
            runOnUiThread(() -> {
                Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");
                try{startActivityForResult(i,IMPORT);}catch(Exception e){alert("Import unavailable","Your device has no document picker.");}
            });
        }
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==INSTALL_PERMISSION){
            if(getPackageManager().canRequestPackageInstalls())launchInstaller();
            else alert("Update not started","You can allow updates from this app in Android settings, or open the newer APK in Files.");
            return;
        }
        if(request==AVATAR_CAMERA){
            Uri output=Uri.parse("content://"+getPackageName()+".avatars/avatar.jpg");revokeUriPermission(output,Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            if(result==RESULT_OK&&new File(getCacheDir(),"avatar-camera.jpg").isFile())avatarResult(output);else new File(getCacheDir(),"avatar-camera.jpg").delete();return;
        }
        if(result!=RESULT_OK || data==null || data.getData()==null){if(request==EXPORT)pendingExport=null;return;}
        if(request==AVATAR_FILE){avatarResult(data.getData());return;}
        try {
            if(request==EXPORT && pendingExport!=null){
                try(OutputStream out=getContentResolver().openOutputStream(data.getData(),"wt")){
                    out.write(pendingExport.getBytes(StandardCharsets.UTF_8));
                }pendingExport=null;web.evaluateJavascript("window.nativeNotice('Backup saved')",null);
            }else if(request==UPDATE){
                final Uri selected=data.getData();
                new Thread(() -> verifyUpdate(selected)).start();
            }else if(request==IMPORT){
                String name=carprogBackupName(data.getData());
                String encoded;
                try(InputStream in=getContentResolver().openInputStream(data.getData())){
                    encoded=Base64.encodeToString(readBounded(in),Base64.NO_WRAP);
                }
                web.evaluateJavascript("window.receiveBackup("+JSONObject.quote(encoded)+","+JSONObject.quote(name)+")",null);
            }
        }catch(Exception e){alert("File operation failed",e.getMessage()==null?"Please try another file.":e.getMessage());}
    }
    private String carprogBackupName(Uri uri) throws IOException {
        String name=null;
        try(android.database.Cursor cursor=getContentResolver().query(uri,new String[]{android.provider.OpenableColumns.DISPLAY_NAME},null,null,null)){
            if(cursor!=null&&cursor.moveToFirst()){
                int column=cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME);
                if(column>=0)name=cursor.getString(column);
            }
        }
        if(name==null||!name.toLowerCase(java.util.Locale.ROOT).endsWith(".carprog"))
            throw new IOException("Choose a .carprog backup file. Other file extensions are not supported.");
        return name;
    }
    private long versionCode(PackageInfo p){return Build.VERSION.SDK_INT>=28?p.getLongVersionCode():p.versionCode;}
    private String[] signerIds(PackageInfo p){
        Signature[] signatures=Build.VERSION.SDK_INT>=28?(p.signingInfo==null?null:p.signingInfo.getApkContentsSigners()):p.signatures;
        if(signatures==null)return new String[0];String[] ids=new String[signatures.length];
        for(int i=0;i<ids.length;i++)ids[i]=Base64.encodeToString(signatures[i].toByteArray(),Base64.NO_WRAP);
        java.util.Arrays.sort(ids);return ids;
    }
    private void verifyUpdate(Uri selected){
        File copy=new File(getCacheDir(),"pending-update.apk");
        try {
            try(InputStream in=getContentResolver().openInputStream(selected);OutputStream out=new FileOutputStream(copy)){
                byte[] buffer=new byte[32768];long total=0;int n;
                while((n=in.read(buffer))!=-1){total+=n;if(total>128L*1024*1024)throw new IOException("Update APK exceeds 128 MiB");out.write(buffer,0,n);}
            }
            int flags=Build.VERSION.SDK_INT>=28?PackageManager.GET_SIGNING_CERTIFICATES:PackageManager.GET_SIGNATURES;
            PackageInfo installed=getPackageManager().getPackageInfo(getPackageName(),flags);
            PackageInfo update=getPackageManager().getPackageArchiveInfo(copy.getAbsolutePath(),flags);
            if(update==null)throw new IOException("The selected file is not a readable Android APK.");
            if(!getPackageName().equals(update.packageName))throw new IOException("This APK belongs to a different app.");
            String[] signers=signerIds(installed),newSigners=signerIds(update);
            if(signers.length==0||!java.util.Arrays.equals(signers,newSigners))throw new IOException("The signing certificate does not match. Select an update signed with this app’s original certificate.");
            if(versionCode(update)<=versionCode(installed))throw new IOException("Select a newer version. This APK is version "+update.versionName+" ("+versionCode(update)+"), while the installed version is "+installed.versionName+" ("+versionCode(installed)+").");
            // Make a private recovery copy before starting a package replacement.
            String progress=profileVault.getBaseFile().exists()?readProfiles():readState();if(!progress.isEmpty()){
                AtomicFile backup=new AtomicFile(new File(getFilesDir(),"before-last-update.json"));FileOutputStream b=backup.startWrite();
                try{b.write(progress.getBytes(StandardCharsets.UTF_8));backup.finishWrite(b);}catch(Exception e){backup.failWrite(b);throw e;}
            }
            pendingUpdateVersion=update.versionName;
            runOnUiThread(() -> new AlertDialog.Builder(this).setTitle("Install version "+pendingUpdateVersion+"?")
                .setMessage("The app identity and signing certificate match. Android will review the update. Your scores, notes and progress remain in the app’s data. A private recovery copy has also been saved. Export a backup in Settings if you want a separate copy.")
                .setNegativeButton("Cancel",null).setPositiveButton("Continue",(dialog,which)->requestInstall()).show());
        }catch(Exception e){copy.delete();runOnUiThread(()->alert("Update not started",e.getMessage()==null?"Please select another APK.":e.getMessage()));}
    }
    private void requestInstall(){
        if(getPackageManager().canRequestPackageInstalls())launchInstaller();
        else {
            try{startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+getPackageName())),INSTALL_PERMISSION);}
            catch(Exception e){alert("Open the APK in Files","Your Android version could not open the update-source setting. Install the newer APK from Files instead.");}
        }
    }
    private void launchInstaller(){
        try {
            Intent i=new Intent(Intent.ACTION_INSTALL_PACKAGE,Uri.parse("content://"+getPackageName()+".updates/update.apk"));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);i.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE,true);startActivity(i);
        }catch(Exception e){alert("Could not open Android installer","Open the downloaded update APK from Files instead. Your current app and progress are unchanged.");}
    }
    private void dispatchBack(){if(web!=null)web.evaluateJavascript("window.appBack && window.appBack()",null);}
    @Override public void onBackPressed() { dispatchBack(); }
    @Override protected void onPause() { super.onPause(); if(lessonSpeech!=null)lessonSpeech.stop();if(web!=null){web.evaluateJavascript("window.stopSoundEffects && window.stopSoundEffects();window.stopLessonReading && window.stopLessonReading()",null);web.evaluateJavascript("window.flushProgress && window.flushProgress()",null);web.onPause();} }
    @Override protected void onResume() { super.onResume();if(web!=null)web.onResume();if(lessonSpeech!=null)lessonSpeech.refresh(); }
    @Override protected void onDestroy() { if(lessonSpeech!=null)lessonSpeech.shutdown();if(web!=null){web.removeJavascriptInterface("AndroidApp");web.destroy();}super.onDestroy(); }
}
