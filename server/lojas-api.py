#!/usr/bin/env python3
"""Diretório público de lojas, lido diretamente do cadastro do Survival."""
import json, math, os, re, socketserver
from http.server import BaseHTTPRequestHandler
from pathlib import Path
import yaml

SOURCE = Path('/opt/app/servers/c8d8ca53-c50a-4ce6-b804-3a3ec0a59a15/plugins/DuskValeLojas/config.yml')
SOCKET = '/run/duskvale-lojas/api.sock'
PLAYER = re.compile(r'^[.A-Za-z0-9_-]{1,32}$')
SHOP = re.compile(r'^[\w-]{1,20}$', re.UNICODE)

def read_shops():
    data = yaml.safe_load(SOURCE.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or not isinstance(data.get('lojas'), dict):
        raise ValueError('Cadastro de lojas inválido')
    shops = []
    for owner_id, owner in data['lojas'].items():
        if not isinstance(owner, dict): continue
        name = owner.get('jogador')
        points = owner.get('pontos')
        if not isinstance(name, str) or not PLAYER.fullmatch(name) or not isinstance(points, dict): continue
        for key, point in points.items():
            if not isinstance(key, str) or not SHOP.fullmatch(key) or not isinstance(point, dict): continue
            location = point.get('local')
            if not isinstance(location, dict): continue
            world = location.get('world')
            if not isinstance(world, str) or len(world) > 100: continue
            coords = [location.get(k) for k in ('x', 'y', 'z')]
            if any(isinstance(v, bool) or not isinstance(v, (float, int)) or not math.isfinite(v) for v in coords): continue
            label = point.get('nome', key)
            if not isinstance(label, str) or not SHOP.fullmatch(label): label = key
            shops.append({'id': str(owner_id) + ':' + key, 'jogador': name, 'nome': label, 'mundo': world,
                          'x': math.floor(coords[0]), 'y': math.floor(coords[1]), 'z': math.floor(coords[2]),
                          'comando': '/loja ' + name + ' ' + key})
    return sorted(shops, key=lambda item: (item['jogador'].casefold(), item['nome'].casefold()))

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?', 1)[0] != '/api/lojas':
            self.send_error(404); return
        try:
            payload = json.dumps({'lojas': read_shops()}, ensure_ascii=False).encode('utf-8')
            status = 200
        except (OSError, ValueError, yaml.YAMLError) as error:
            print(f'Falha ao ler lojas: {error}', flush=True)
            payload = b'{"erro":"Diretorio temporariamente indisponivel"}'
            status = 503
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
    def log_message(self, fmt, *args): pass

class Server(socketserver.ThreadingMixIn, socketserver.UnixStreamServer):
    daemon_threads = True

if __name__ == '__main__':
    if os.path.exists(SOCKET): os.unlink(SOCKET)
    with Server(SOCKET, Handler) as server:
        os.chmod(SOCKET, 0o666)
        server.serve_forever()
