#!/usr/bin/env python3
# ©️ Kevin W. Brown 2026
"""Optional self-hosted email recovery. Never receives passwords or study progress."""
import base64, hashlib, hmac, json, os, re, secrets, smtplib, sqlite3, ssl, threading, time
from collections import defaultdict, deque
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class RecoveryError(Exception):
    def __init__(self,message,status=400):super().__init__(message);self.status=status

def decode32(value):
    try:
        raw=base64.b64decode(value,validate=True)
        if len(raw)!=32:raise ValueError()
        return raw
    except Exception:raise RecoveryError('Invalid recovery credentials.')

class Service:
    def __init__(self,database,master_key,mailer,clock=time.time):
        if len(master_key)!=32:raise ValueError('RECOVERY_MASTER_KEY must encode exactly 32 bytes')
        self.master=master_key;self.aes=AESGCM(master_key);self.mailer=mailer;self.clock=clock
        self.db=sqlite3.connect(database,check_same_thread=False);self.db.row_factory=sqlite3.Row
        self.db.execute('''CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,email TEXT NOT NULL,owner_hash TEXT NOT NULL,key_cipher BLOB NOT NULL,
            verified INTEGER DEFAULT 0,code_hash TEXT,code_purpose TEXT,expires REAL DEFAULT 0,
            tries INTEGER DEFAULT 0,last_sent REAL DEFAULT 0)''');self.db.commit()
        self.lock=threading.RLock();self.rates=defaultdict(deque)
    def digest(self,value):return hmac.new(self.master,value.encode(),hashlib.sha256).hexdigest()
    def limit(self,key,maximum,seconds):
        now=self.clock();bucket=self.rates[key]
        while bucket and bucket[0]<=now-seconds:bucket.popleft()
        if len(bucket)>=maximum:raise RecoveryError('Too many requests. Please try again later.',429)
        bucket.append(now)
        if len(self.rates)>10000:
            self.rates=defaultdict(deque,{k:v for k,v in self.rates.items() if v and v[-1]>now-3600})
    def challenge(self,row,purpose):
        now=self.clock()
        if row['last_sent'] and now-row['last_sent']<60:raise RecoveryError('Please wait one minute before requesting another code.',429)
        self.limit('email:'+row['email'].casefold(),5,3600)
        code=f'{secrets.randbelow(100000000):08d}'
        code_hash=self.digest(row['id']+':'+purpose+':'+code)
        self.db.execute('UPDATE users SET code_hash=?,code_purpose=?,expires=?,tries=0,last_sent=? WHERE id=?',(code_hash,purpose,now+600,now,row['id']));self.db.commit()
        subject='Canadian radio workbook: '+('verify recovery email' if purpose=='verify' else 'password reset code')
        text=f'Your {"email verification" if purpose=="verify" else "password reset"} code is: {code}\n\nEnter it in the Canadian Amature Radio Unofficial Basic Certificate Study Guide And Reference app.\nIt expires in 10 minutes and can be used once.\n\nIf you did not request this code, ignore this message. Never share the code.\nNo password or study progress is included in this email.'
        try:self.mailer(row['email'],subject,text)
        except Exception:
            self.db.execute('UPDATE users SET code_hash=NULL,expires=0 WHERE id=?',(row['id'],));self.db.commit()
            raise RecoveryError('Email delivery failed. Try again later or contact the service owner.',503)
    def check_code(self,row,code,purpose):
        valid=isinstance(code,str) and re.fullmatch(r'\d{8}',code)
        if not row or not valid or row['code_purpose']!=purpose or not row['code_hash'] or row['expires']<=self.clock() or row['tries']>=5:raise RecoveryError('Invalid or expired code. Request a new code.')
        self.db.execute('UPDATE users SET tries=tries+1 WHERE id=?',(row['id'],));self.db.commit()
        if not hmac.compare_digest(row['code_hash'],self.digest(row['id']+':'+purpose+':'+code)):raise RecoveryError('Invalid or expired code. Request a new code.')
    def handle(self,action,data,ip='local'):
        if not isinstance(data,dict) or not isinstance(data.get('id'),str) or not re.fullmatch('[a-f0-9]{32}',data['id']):raise RecoveryError('Invalid profile identifier.')
        profile_id=data['id']
        with self.lock:
            self.limit('ip:'+ip,30,60);self.limit('profile:'+profile_id,30,60)
            row=self.db.execute('SELECT * FROM users WHERE id=?',(profile_id,)).fetchone()
            if action=='enrol':
                email=data.get('email','')
                if not isinstance(email,str) or len(email)>254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email):raise RecoveryError('Enter a valid email address.')
                owner=decode32(data.get('owner_token',''));key=decode32(data.get('key',''))
                owner_hash=hashlib.sha256(owner).hexdigest()
                if row and not hmac.compare_digest(row['owner_hash'],owner_hash):raise RecoveryError('Recovery registration could not be verified.',403)
                self.limit('enrol-ip:'+ip,10,3600)
                if row and row['last_sent'] and self.clock()-row['last_sent']<60:raise RecoveryError('Please wait one minute before requesting another code.',429)
                nonce=secrets.token_bytes(12);cipher=nonce+self.aes.encrypt(nonce,key,profile_id.encode())
                self.db.execute('INSERT INTO users(id,email,owner_hash,key_cipher) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,key_cipher=excluded.key_cipher,verified=0',(profile_id,email,owner_hash,cipher));self.db.commit()
                row=self.db.execute('SELECT * FROM users WHERE id=?',(profile_id,)).fetchone();self.challenge(row,'verify');return {'ok':True}
            if action=='verify':
                owner=decode32(data.get('owner_token',''))
                if not row or not hmac.compare_digest(row['owner_hash'],hashlib.sha256(owner).hexdigest()):raise RecoveryError('Recovery registration could not be verified.',403)
                self.check_code(row,data.get('code'),'verify')
                self.db.execute('UPDATE users SET verified=1,code_hash=NULL,expires=0 WHERE id=?',(profile_id,));self.db.commit();return {'ok':True}
            if action=='request-reset':
                # IDs are opaque random identifiers; the response never confirms registration.
                if row and row['verified']:self.challenge(row,'reset')
                return {'ok':True,'message':'If this profile has a verified recovery email, a code was requested.'}
            if action=='reset':
                if not row or not row['verified']:raise RecoveryError('Invalid or expired code. Request a new code.')
                self.check_code(row,data.get('code'),'reset')
                cipher=row['key_cipher'];key=self.aes.decrypt(cipher[:12],cipher[12:],profile_id.encode())
                self.db.execute('UPDATE users SET code_hash=NULL,expires=0 WHERE id=?',(profile_id,));self.db.commit()
                try:self.mailer(row['email'],'Canadian radio workbook: recovery code used','A one-time password recovery code for your radio workbook profile was used.\nIf this was not you, contact the recovery service owner. No password is included in this email.')
                except Exception:pass
                return {'key':base64.b64encode(key).decode()}
            raise RecoveryError('Unknown recovery operation.',404)

class Handler(BaseHTTPRequestHandler):
    def log_message(self,format,*args):pass  # Never log email addresses, request bodies, codes or keys.
    def setup(self):super().setup();self.connection.settimeout(15)
    def do_GET(self):self.reply(200,{'status':'ok'}) if self.path=='/health' else self.reply(404,{'error':'Not found.'})
    def do_POST(self):
        try:
            if self.headers.get('Content-Type','').split(';')[0]!='application/json':raise RecoveryError('Use application/json.',415)
            length=int(self.headers.get('Content-Length','0'))
            if length<1 or length>65536:raise RecoveryError('Invalid request size.',413)
            if not re.fullmatch('/v1/(enrol|verify|request-reset|reset)',self.path):raise RecoveryError('Not found.',404)
            data=json.loads(self.rfile.read(length));result=self.server.service.handle(self.path.split('/')[-1],data,self.client_address[0]);self.reply(200,result)
        except RecoveryError as e:self.reply(e.status,{'error':str(e)})
        except (ValueError,UnicodeError):self.reply(400,{'error':'Invalid JSON request.'})
        except Exception:self.reply(500,{'error':'Recovery service unavailable. Try again later.'})
    def reply(self,status,data):
        body=json.dumps(data,separators=(',',':')).encode();self.send_response(status)
        self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)

def smtp_mailer():
    host=os.environ['SMTP_HOST'];port=int(os.environ.get('SMTP_PORT','587'));user=os.environ.get('SMTP_USER','');secret=os.environ.get('SMTP_PASSWORD','');sender=os.environ['SMTP_FROM'];mode=os.environ.get('SMTP_SECURITY','starttls')
    if mode not in ('starttls','ssl'):raise ValueError('SMTP_SECURITY must be starttls or ssl')
    if '\n' in sender or '\r' in sender:raise ValueError('Invalid SMTP_FROM')
    def send(recipient,subject,text):
        msg=EmailMessage();msg['From']=sender;msg['To']=recipient;msg['Subject']=subject;msg.set_content(text)
        ctx=ssl.create_default_context()
        if mode=='ssl':client=smtplib.SMTP_SSL(host,port,timeout=20,context=ctx)
        else:client=smtplib.SMTP(host,port,timeout=20)
        with client:
            if mode=='starttls':client.ehlo();client.starttls(context=ctx);client.ehlo()
            if user:client.login(user,secret)
            client.send_message(msg)
    return send

def main():
    database=Path(os.environ.get('RECOVERY_DATABASE','recovery.sqlite3')).resolve();database.parent.mkdir(parents=True,exist_ok=True)
    master=decode32(os.environ['RECOVERY_MASTER_KEY']);mailer=smtp_mailer();service=Service(str(database),master,mailer)
    os.chmod(database,0o600)
    server=ThreadingHTTPServer((os.environ.get('RECOVERY_BIND','127.0.0.1'),int(os.environ.get('RECOVERY_PORT','8787'))),Handler);server.service=service
    print('Recovery service listening. Put it behind a trusted HTTPS reverse proxy. SMTP settings loaded.',flush=True)
    server.serve_forever()
if __name__=='__main__':main()
