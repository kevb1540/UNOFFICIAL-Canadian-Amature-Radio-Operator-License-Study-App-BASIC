"""Convert the official ISED delimited bank without changing question/answer wording."""
from pathlib import Path
import json, hashlib, sys, collections
ROOT=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
def chapter(cat,topic):
    if cat==1:
        if topic in [7,9,11,12,13,14,18]:return 'operating'
        if topic in [23,24]:return 'safety'
        if topic in [10,19,25]:return 'interference'
        return 'certificate'
    if cat==2:return 'operating'
    if cat==3:
        if topic==9:return 'antennas'
        if topic in [11,12,13,15]:return 'signals'
        if topic>=18:return 'safety'
        return 'station'
    if cat==4:return 'components'
    if cat==5:return 'components' if topic in [9,10,11,12] else 'electricity'
    if cat==6:return 'tuning' if topic<=6 else 'antennas'
    if cat==7:return 'propagation'
    if cat==8:return 'interference'
    raise ValueError(cat)
questions=[]
for line in source.read_text(encoding='utf-8-sig').splitlines()[1:]:
    if not line.strip():continue
    fields=line.split(';')
    assert len(fields)==11
    qid,en,correct,*tail=fields
    parts=qid.split('-');cat,topic=int(parts[1]),int(parts[2])
    questions.append(dict(id=qid,topic='-'.join(parts[:-1]),chapter=chapter(cat,topic),text=en,options=[correct,*tail[:3]],fr=dict(text=tail[3],options=tail[4:8])))
assert len(questions)==984 and len({q['id'] for q in questions})==984
assert len({q['topic'] for q in questions})==100
out=ROOT/'app/src/main/assets'
(out/'questions.json').write_text(json.dumps(questions,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
meta={'title':'Basic Qualification Question Bank for Amateur Radio Operator Certificate Examinations','author':'Innovation, Science and Economic Development Canada (ISED)','copyright_owner':'Government of Canada (Crown copyright)','effective':'2025-07-15','retrieved':'2026-10-14','count':len(questions),'topics':100,'source':'https://apc-cap.ic.gc.ca/datafiles/amat_basic_quest.zip','downloads':'https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/en/downloads','pdf':'https://ised-isde.canada.ca/site/amateur-radio-operator-certificate-services/sites/default/files/documents/amateur_basic_questions_en_2025-07-15.pdf','terms':'https://ised-isde.canada.ca/site/ised/en/terms-and-conditions','sha256_delimited':hashlib.sha256(source.read_bytes()).hexdigest(),'notice':'Non-commercial study reproduction of the ISED source version. Original question and answer wording retained; answer positions are randomized. Independent app; not produced or endorsed by ISED.'}
# Keep explicit attribution when rebuilding the bundled question data. A live
# verification date is retained only for the identical, previously checked source.
previous_info=json.loads((out/'bank-info.json').read_text(encoding='utf-8'))
meta.update(reproduction_statement='This reproduction is a copy of the version available at',
            reproduction_url=meta['source'],
            notice='Non-commercial study reproduction. This reproduction is a copy of the version available at '+meta['source']+'. Original English and French question and answer wording and ISED answer keys are retained; answer positions may be randomized. Independent app; not produced or endorsed by ISED.')
if previous_info.get('sha256_delimited')==meta['sha256_delimited']:
    for key in ['verified','verification_method']:
        if key in previous_info:meta[key]=previous_info[key]
(out/'bank-info.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
course=json.loads((out/'course.json').read_text())
for s in course['sources']:
    if s['id']=='bank':s['url']=meta['downloads'];s['detail']='All 984 official Basic questions, effective July 15, 2025, included offline. Retrieved October 14, 2026.'
(out/'course.json').write_text(json.dumps(course,ensure_ascii=False),encoding='utf-8')
print('Official bank:',len(questions),'questions;',len({q['topic'] for q in questions}),'topics;',dict(collections.Counter(q['chapter'] for q in questions)))
