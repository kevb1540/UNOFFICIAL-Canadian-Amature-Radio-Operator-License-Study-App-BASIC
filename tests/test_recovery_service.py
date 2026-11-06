# ©️ Kevin W. Brown 2026
import base64,importlib.util,re,secrets,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('recovery',Path(__file__).parents[1]/'recovery_service/server.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.mail=[];self.now=10000
        self.service=mod.Service(str(Path(self.temp.name)/'test.sqlite'),secrets.token_bytes(32),lambda *a:self.mail.append(a),clock=lambda:self.now)
        self.id=secrets.token_hex(16);self.owner=base64.b64encode(secrets.token_bytes(32)).decode();self.key=base64.b64encode(secrets.token_bytes(32)).decode()
    def tearDown(self):self.service.db.close();self.temp.cleanup()
    def enrol(self):return self.service.handle('enrol',{'id':self.id,'email':'kevin@example.org','owner_token':self.owner,'key':self.key})
    def code(self):return re.search(r'code is: (\d{8})',self.mail[-1][2]).group(1)
    def verified(self):self.enrol();self.service.handle('verify',{'id':self.id,'owner_token':self.owner,'code':self.code()});self.now+=61
    def test_verified_email_reset_is_single_use_and_key_is_encrypted_in_database(self):
        self.verified();row=self.service.db.execute('SELECT * FROM users').fetchone();self.assertNotIn(base64.b64decode(self.key),row['key_cipher'])
        self.service.handle('request-reset',{'id':self.id});code=self.code();row=self.service.db.execute('SELECT * FROM users').fetchone();self.assertNotIn(code,row['code_hash']);self.assertEqual(len(self.mail),2)
        self.assertEqual(self.service.handle('reset',{'id':self.id,'code':code})['key'],self.key)
        with self.assertRaises(mod.RecoveryError):self.service.handle('reset',{'id':self.id,'code':code})
        self.assertEqual(len(self.mail),3);self.assertNotIn(self.key,str(self.mail))
    def test_unverified_or_unknown_profiles_do_not_send_reset_mail(self):
        self.enrol();self.now+=61;a=self.service.handle('request-reset',{'id':self.id});b=self.service.handle('request-reset',{'id':'a'*32});self.assertEqual(a,b);self.assertEqual(len(self.mail),1)
    def test_expired_code_cannot_recover_key(self):
        self.verified();self.service.handle('request-reset',{'id':self.id});code=self.code();self.now+=601
        with self.assertRaisesRegex(mod.RecoveryError,'expired'):self.service.handle('reset',{'id':self.id,'code':code})
    def test_five_wrong_codes_invalidate_the_challenge(self):
        self.verified();self.service.handle('request-reset',{'id':self.id});code=self.code();wrong='00000000' if code!='00000000' else '11111111'
        for i in range(5):
            with self.assertRaises(mod.RecoveryError):self.service.handle('reset',{'id':self.id,'code':wrong})
        with self.assertRaises(mod.RecoveryError):self.service.handle('reset',{'id':self.id,'code':code})
    def test_rate_limit_and_ownership_prevent_email_floods_and_registration_takeover(self):
        self.verified();self.service.handle('request-reset',{'id':self.id})
        with self.assertRaisesRegex(mod.RecoveryError,'wait'):self.service.handle('request-reset',{'id':self.id})
        self.now+=61
        with self.assertRaisesRegex(mod.RecoveryError,'verified'):self.service.handle('enrol',{'id':self.id,'email':'attacker@example.org','owner_token':base64.b64encode(secrets.token_bytes(32)).decode(),'key':self.key})
    def test_email_delivery_failure_is_reported_and_code_invalidated(self):
        def fail(*args):raise OSError('SMTP unavailable')
        self.service.mailer=fail
        with self.assertRaisesRegex(mod.RecoveryError,'delivery failed'):self.enrol()
        self.assertIsNone(self.service.db.execute('SELECT code_hash FROM users').fetchone()[0])
    def test_validation_rejects_email_header_injection_and_invalid_keys(self):
        for email in ['bad\r\nBcc: other@example.org','not-an-email']:
            with self.assertRaises(mod.RecoveryError):self.service.handle('enrol',{'id':self.id,'email':email,'owner_token':self.owner,'key':self.key})
        with self.assertRaises(mod.RecoveryError):self.service.handle('enrol',{'id':self.id,'email':'k@example.org','owner_token':self.owner,'key':'bad'})
if __name__=='__main__':unittest.main(verbosity=2)
