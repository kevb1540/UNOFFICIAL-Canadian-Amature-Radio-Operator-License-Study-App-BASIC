#!/usr/bin/env python3
"""Build with Android SDK tools + Eclipse ECJ; no Gradle or native dependencies."""
import os,sys,subprocess,zipfile,shutil,hashlib,json,xml.etree.ElementTree as ET
from pathlib import Path
from check_lesson_coverage import validate
root=Path(__file__).resolve().parents[1]
course=json.loads((root/'app/src/main/assets/course.json').read_text())
bank=json.loads((root/'app/src/main/assets/questions.json').read_text())
onair=json.loads((root/'app/src/main/assets/onair-guide.json').read_text())
glossary_count=len({g['term'].lower() for g in [*course['glossary'],*onair['entries']]})
coverage=validate(course,bank)
print('Lesson coverage verified:',coverage['covered_questions'],'questions in',coverage['detailed_lessons'],'topic lessons',flush=True)
version_code=int(os.environ.get('APP_VERSION_CODE','275'))
version_name=os.environ.get('APP_VERSION_NAME','2.3.45')
sdk=Path(os.environ.get('ANDROID_HOME',str(root.parent/'toolchain/sdk')))
platform=Path(os.environ.get('ANDROID_JAR',str(sdk/'android-36/android.jar')))
if not platform.exists():platform=sdk/'platforms/android-36/android.jar'
bt=Path(os.environ.get('ANDROID_BUILD_TOOLS',str(sdk/'android-16')))
if not (bt/'aapt2').exists():bt=sdk/'build-tools/36.0.0'
ecj=Path(os.environ.get('ECJ_JAR',str(root.parent/'toolchain/ecj.jar')))
out=root/'build';out.mkdir(exist_ok=True)
classes=out/'classes';shutil.rmtree(classes,ignore_errors=True);classes.mkdir()
def run(args):
    subprocess.run([str(a) for a in args],check=True)
run(['java','-jar',ecj,'-1.8','-nowarn','-classpath',platform,'-d',classes,*sorted((root/'app/src/main/java').rglob('*.java'))])
with zipfile.ZipFile(out/'classes.jar','w') as z:
    for p in sorted(classes.rglob('*.class')):z.write(p,p.relative_to(classes))
run([bt/'d8','--min-api','26','--lib',platform,'--output',out,out/'classes.jar'])
run([bt/'aapt2','compile','--dir',root/'app/src/main/res','-o',out/'resources.zip'])
ET.register_namespace('android','http://schemas.android.com/apk/res/android')
manifest=ET.parse(root/'app/src/main/AndroidManifest.xml');manifest.getroot().set('package','ca.kevin.maplewave')
manifest.getroot().set('{http://schemas.android.com/apk/res/android}versionCode',str(version_code))
manifest.getroot().set('{http://schemas.android.com/apk/res/android}versionName',version_name)
manifest.write(out/'AndroidManifest.xml',encoding='utf-8',xml_declaration=True)
run([bt/'aapt2','link','-I',platform,'--manifest',out/'AndroidManifest.xml','-A',root/'app/src/main/assets','--min-sdk-version','26','--target-sdk-version','36','--version-code',str(version_code),'--version-name',version_name,'-o',out/'unsigned.apk',out/'resources.zip'])
with zipfile.ZipFile(out/'unsigned.apk','a',compression=zipfile.ZIP_DEFLATED) as z:z.write(out/'classes.dex','classes.dex')
run([bt/'zipalign','-P','16','-f','4',out/'unsigned.apk',out/'aligned.apk'])
apk=Path(os.environ.get('APK_OUTPUT',str(root.parent/'Canadian_Amature_Radio_Study_Guide_and_Reference.apk')))
run([bt/'apksigner','sign','--ks',root/'android_development/debug.keystore','--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',apk,out/'aligned.apk'])
run([bt/'apksigner','verify','--verbose','--print-certs',apk])
run([bt/'zipalign','-c','-P','16','4',apk])
info={'app':'Canadian Amature Radio Unofficial Basic Certificate Study Guide And Reference','version':version_name,'version_code':version_code,'package':'ca.kevin.maplewave','min_sdk':26,'target_sdk':36,'architectures':'All Android ABIs; no native libraries','official_questions':984,'topic_groups':100,'glossary_terms':glossary_count,'on_air_terms':len(onair['entries']),**coverage,'lesson_coverage_verified':True,'apk_bytes':apk.stat().st_size,'apk_sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'permissions':['android.permission.REQUEST_INSTALL_PACKAGES','android.permission.INTERNET'],'profiles':'Password-encrypted local users with optional configured email recovery','physical_device_tested':False}
(root/'build-info.json').write_text(json.dumps(info,indent=2)+'\n')
print('APK:',apk,'('+str(apk.stat().st_size)+' bytes)')
