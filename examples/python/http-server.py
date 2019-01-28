#!/usr/bin/env python
from http.server import HTTPServer, BaseHTTPRequestHandler

class myHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Send response status code
        self.send_response(200)

        # Send headers
        self.send_header('Content-type','text/html')
        self.end_headers()

        # Send message back to client
        message = "OPENTHEPASTANDPRESENT"
        # Write content as utf-8 data
        self.wfile.write(bytes(message, "utf8"))
        return

# http
httpd = HTTPServer(('0.0.0.0', 80), myHandler)
print('starting http server...')
httpd.serve_forever()
