# Test-only HTTP transport and mailbox. Never used by the Android release.
import importlib.util,json,sys,time
from http.server import ThreadingHTTPServer
from pathlib import Path
spec=importlib.util.spec_from_file_location('recovery',Path(__file__).parents[1]/'recovery_service/server.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
folder=Path(sys.argv[1]);mailbox=folder/'mail.json';clock=[time.time()];mail=[]
def deliver(recipient,subject,text):mail.append({'to':recipient,'subject':subject,'text':text});mailbox.write_text(json.dumps(mail))
class Handler(m.Handler):
    def do_POST(self):
        if self.path=='/test/advance':clock[0]+=61;self.reply(200,{'ok':True});return
        super().do_POST()
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);server.service=m.Service(str(folder/'test.sqlite'),b't'*32,deliver,clock=lambda:clock[0]);print(json.dumps({'port':server.server_port}),flush=True);server.serve_forever()
