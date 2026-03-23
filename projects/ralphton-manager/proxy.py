#!/usr/bin/env python3
"""OpenClaw Hub Proxy Server - CORS 해결을 위한 API 프록시"""
import http.server, json, urllib.request, urllib.error, sys

PORT = 8081
HUB_DIR = '/data/data/com.termux/files/home/.openclaw/workspace/projects/ralphton-manager'
GATEWAY = 'http://127.0.0.1:18789'

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HUB_DIR, **kw)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/invoke':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                req = urllib.request.Request(
                    f'{GATEWAY}/tools/invoke',
                    data=body,
                    headers={'Content-Type': 'application/json', 'Authorization': self.headers.get('Authorization', '')},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/chat':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                req = urllib.request.Request(
                    f'{GATEWAY}/v1/chat/completions',
                    data=body,
                    headers={'Content-Type': 'application/json', 'Authorization': self.headers.get('Authorization', '')},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', resp.headers.get('Content-Type', 'application/json'))
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        print(f'[PROXY] {args[0]}')

print(f'🚀 OpenClaw Hub Proxy on :{PORT}')
print(f'   Files: {HUB_DIR}')
print(f'   API:   {GATEWAY}')
print(f'   CORS:  enabled')
sys.stdout.flush()
http.server.HTTPServer(('', PORT), ProxyHandler).serve_forever()
