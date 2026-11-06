// ©️ Kevin W. Brown 2026
package ca.kevin.maplewave;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Exposes only one temporary camera destination through an explicit URI grant. */
public final class AvatarProvider extends ContentProvider {
    @Override public boolean onCreate(){return true;}
    private File file(Uri uri) throws FileNotFoundException {
        if(!"/avatar.jpg".equals(uri.getPath()))throw new FileNotFoundException();
        return new File(getContext().getCacheDir(),"avatar-camera.jpg");
    }
    @Override public String getType(Uri uri){return "image/jpeg";}
    @Override public ParcelFileDescriptor openFile(Uri uri,String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(file(uri),ParcelFileDescriptor.parseMode(mode));
    }
    @Override public Cursor query(Uri uri,String[] projection,String selection,String[] args,String order){
        try{File f=file(uri);String[] columns=projection==null?new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE}:projection;MatrixCursor c=new MatrixCursor(columns);Object[] row=new Object[columns.length];for(int i=0;i<columns.length;i++)row[i]=OpenableColumns.DISPLAY_NAME.equals(columns[i])?"avatar.jpg":OpenableColumns.SIZE.equals(columns[i])?f.length():null;c.addRow(row);return c;}catch(Exception e){return null;}
    }
    @Override public Uri insert(Uri uri,ContentValues v){throw new UnsupportedOperationException();}
    @Override public int update(Uri uri,ContentValues v,String s,String[] a){throw new UnsupportedOperationException();}
    @Override public int delete(Uri uri,String s,String[] a){throw new UnsupportedOperationException();}
}
