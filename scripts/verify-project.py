"""Check the delivered static app, including an actual loopback HTTP startup."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from threading import Thread
from queue import Queue
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]

class Entry(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        value = attrs.get('src') if tag == 'script' else attrs.get('href') if tag == 'link' else None
        if value:
            self.paths.append(value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--images', action='store_true', help='Also require all 101 supplied original images.')
    args = parser.parse_args()
    entry = Entry()
    entry.feed((ROOT / 'dist/index.html').read_text())
    runtime = ROOT / 'dist'
    for name in entry.paths:
        assert not re.match(r'\w+://', name), 'Unexpected external dependency: ' + name
        assert (runtime / name).is_file(), 'Missing runtime file: ' + name
    declared = set(entry.paths) | {'index.html'}
    for stylesheet in runtime.glob('*.css'):
        for asset in re.findall(r'url\([\"\']?([^\)\"\']+)', stylesheet.read_text()):
            assert not re.match(r'\w+://', asset), 'Unexpected external asset: ' + asset
            if asset.startswith('data:'):
                continue
            asset_path = (stylesheet.parent / asset).resolve()
            declared.add(str(asset_path.relative_to(runtime.resolve())))
            assert asset_path.is_file(), 'Missing stylesheet asset: ' + asset
    assert {str(p.relative_to(runtime)) for p in runtime.rglob('*') if p.is_file()} == declared, 'Unreferenced runtime file or obsolete directory.'
    node = shutil.which('node')
    assert node, 'Node.js is needed for source validation.'
    for path in runtime.glob('*.js'):
        subprocess.run([node, '--check', str(path)], check=True, capture_output=True)
    code = "const M=require('./dist/project-menu.js');console.log(JSON.stringify(M.items().map(x=>({source:x.source,used:x.used}))))"
    items = json.loads(subprocess.check_output([node, '-e', code], cwd=ROOT, text=True))
    assert len(items) == 101 and all(x['used'] for x in items)
    assert len({x['source'] for x in items}) == 101
    names = {x['source'] for x in items}
    manifest = set(re.findall(r'^t\d+\.(?:png|jpg)$', (ROOT / 'images/README.txt').read_text(), re.M))
    assert names == manifest, 'Image instructions disagree with the current catalogue.'
    if args.images:
        for name in names:
            assert (ROOT / 'images' / name).is_file(), 'Missing image: ' + name
    process = subprocess.Popen([sys.executable, str(ROOT / 'start-local.py'), '--port', '0'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    lines = Queue()
    Thread(target=lambda: lines.put(process.stdout.readline()), daemon=True).start()
    try:
        line = lines.get(timeout=10)
        match = re.search(r'http://localhost:(\d+)', line)
        assert match, 'Local launcher failed to start: ' + line
        base = 'http://127.0.0.1:' + match[1]
        paths = ['/', '/dist/index.html'] + ['/dist/' + name for name in sorted(declared - {'index.html'})]
        if args.images:
            paths += ['/images/' + name for name in sorted(names)]
        for name in paths:
            with urlopen(base + name, timeout=10) as response:
                assert response.status == 200 and response.read(), 'Empty response: ' + name
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
    print(f'OK: HTTP startup, {len(declared)} runtime resources, JavaScript syntax, 101 image assignments' + (' and all image files.' if args.images else '.'))

if __name__ == '__main__':
    try:
        main()
    except (AssertionError, subprocess.CalledProcessError) as error:
        sys.exit('Verification failed: ' + str(error))
