from gevent.monkey import patch_all;
patch_all();
from gevent_jsonrpc import RpcServer;
import json;
RpcServer(
    "/run/shared/agent.sock",
    "foo",
    root=None,
    root_factory=lambda c,a: c.send(json.dumps({"jsonrpc":"2.0","result":True,"id": json.loads(c.recv(1024))["id"]})))._accepter_greenlet.get();
