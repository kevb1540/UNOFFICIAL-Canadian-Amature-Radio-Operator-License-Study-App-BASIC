"""Install the actual APK and verify locked startup/glossary on an Android emulator.
Runs emulator and ADB in one process tree so they share the sandbox network.
"""
import os,subprocess,time,json,re,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT.parent;SDK=WORK/'toolchain/sdk'
OUT=WORK/'research/android';OUT.mkdir(parents=True,exist_ok=True)
avds=WORK/'toolchain/avd';avd=avds/'RadioTest.avd';avd.mkdir(parents=True,exist_ok=True)
(avds/'RadioTest.ini').write_text('avd.ini.encoding=UTF-8\npath='+str(avd)+'\ntarget=android-35\n')
image=WORK/'toolchain/system-image/x86_64'
(avd/'config.ini').write_text('\n'.join(['avd.ini.encoding=UTF-8','AvdId=RadioTest','abi.type=x86_64','hw.cpu.arch=x86_64','hw.cpu.ncore=2','hw.ramSize=2048','hw.keyboard=yes','hw.gpu.enabled=yes','hw.gpu.mode=swiftshader','hw.lcd.width=393','hw.lcd.height=852','hw.lcd.density=160','disk.dataPartition.size=2G','image.sysdir.1='+str(image),'tag.id=default','tag.display=Default','target=android-35','showDeviceFrame=no','PlayStore.enabled=false'])+'\n')
env=os.environ.copy();env.update(ANDROID_HOME=str(SDK),ANDROID_SDK_ROOT=str(SDK),ANDROID_AVD_HOME=str(avds),LD_LIBRARY_PATH=str(WORK/'toolchain/emulator-deps/usr/lib/x86_64-linux-gnu'),ANDROID_I_WANT_MY_TCG='yes')
adb=SDK/'platform-tools/adb';serial='emulator-5580'
def call(args,timeout=30,check=True,raw=False):
 r=subprocess.run([str(x) for x in args],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
 if check and r.returncode:raise RuntimeError((r.stderr or r.stdout).decode(errors='replace')[:2000])
 return r.stdout if raw else r.stdout.decode(errors='replace')
def shell(*args,**kw):return call([adb,'-s',serial,'shell',*args],**kw)
def dump():
 shell('uiautomator','dump','/sdcard/window.xml',timeout=40)
 return shell('cat','/sdcard/window.xml')
def click(text):
 xml=dump();tree=ET.fromstring(xml)
 for n in tree.iter('node'):
  if text in n.attrib.get('text','') or text in n.attrib.get('content-desc',''):
   nums=[int(x) for x in re.findall(r'\d+',n.attrib['bounds'])]
   if len(nums)==4 and nums[2]>nums[0] and nums[3]>nums[1]:
    shell('input','tap',str((nums[0]+nums[2])//2),str((nums[1]+nums[3])//2));return
 raise RuntimeError('Could not locate '+text+'; visible: '+re.sub('<[^>]*>',' ',xml)[:1500])
log=(OUT/'emulator.log').open('w');emulator=None;report={'android_api':35,'physical_device':False,'checks':[]}
try:
 call([adb,'start-server'])
 emulator=subprocess.Popen([str(SDK/'emulator/emulator'),'-avd','RadioTest','-no-window','-no-snapshot','-no-audio','-no-boot-anim','-gpu','swiftshader','-accel','off','-memory','2048','-cores','2','-port','5580','-no-metrics','-feature','-Vulkan'],env=env,stdout=log,stderr=subprocess.STDOUT)
 start=time.monotonic();last=-30
 while time.monotonic()-start<420:
  if emulator.poll() is not None:raise RuntimeError('Emulator stopped: '+(OUT/'emulator.log').read_text()[-3000:])
  try:
   if shell('getprop','sys.boot_completed',timeout=5,check=False).strip()=='1':break
  except subprocess.TimeoutExpired:pass
  if time.monotonic()-start-last>=30:print('Waiting for Android boot:',round(time.monotonic()-start),'s',flush=True);last=time.monotonic()-start
  time.sleep(3)
 else:raise RuntimeError('Android did not boot within seven minutes')
 print('Android booted in',round(time.monotonic()-start),'seconds',flush=True)
 report['boot_seconds']=round(time.monotonic()-start)
 shell('settings','put','global','window_animation_scale','0');shell('settings','put','global','transition_animation_scale','0');shell('settings','put','global','animator_duration_scale','0')
 print(call([adb,'-s',serial,'install','-r',WORK/'Canadian_Amature_Radio_Study_Guide_and_Reference.apk'],timeout=90),flush=True)
 report['checks'].append('APK installed')
 shell('am','start','-n','ca.kevin.maplewave/.MainActivity');time.sleep(8)
 xml=dump();(OUT/'login.xml').write_text(xml)
 if 'Choose your user profile' not in xml:raise RuntimeError('Login content absent: '+xml[:2000])
 if 'Add New User' not in xml or 'Lost password' not in xml:raise RuntimeError('Required login actions absent')
 report['checks'].append('Native WebView starts locked at the user list with required actions')
 (OUT/'login.png').write_bytes(call([adb,'-s',serial,'exec-out','screencap','-p'],raw=True))
 click('Add New User');time.sleep(1)
 click('Open glossary without leaving this page');time.sleep(1)
 xml=dump();(OUT/'glossary.xml').write_text(xml)
 if 'Glossary & definitions' not in xml:raise RuntimeError('Glossary overlay absent from the Add New User screen')
 report['checks'].append('Glossary opens from Add New User before login')
 shell('input','keyevent','4');time.sleep(1)
 if 'Add New User' not in dump():raise RuntimeError('Back did not return to the new-user form')
 report['checks'].append('Android Back closes glossary without authenticating')
 click('Cancel');time.sleep(1)
 shell('am','force-stop','ca.kevin.maplewave');shell('am','start','-n','ca.kevin.maplewave/.MainActivity');time.sleep(4)
 if 'Choose your user profile' not in dump():raise RuntimeError('App did not reopen locked')
 report['checks'].append('Force-stop and reopen returns to user login')
 report['webview']=shell('dumpsys','webviewupdate')[:2500]
 report['passed']=True
 print(json.dumps(report,indent=2),flush=True)
except Exception as e:
 report['passed']=False;report['error']=str(e)
 print('ANDROID TEST FAILURE:',str(e),flush=True)
 try:(OUT/'logcat.txt').write_text(call([adb,'-s',serial,'logcat','-d'],timeout=10,check=False))
 except Exception:pass
finally:
 (ROOT/'android-test-report.json').write_text(json.dumps(report,indent=2))
 if emulator:
  try:call([adb,'-s',serial,'emu','kill'],timeout=5,check=False)
  except Exception:emulator.terminate()
 log.close()
if not report.get('passed'):raise SystemExit(1)
