"""Verify the static approved snapshot and local HTML asset links, offline."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1] / 'site'
entries = json.loads((ROOT / 'sites.json').read_text())
manifest = json.loads((ROOT / 'export.json').read_text())
assert manifest['approved_count'] == len(entries)
assert manifest['canonical_repository'] == 'arislee1979-afk/50_github_learn'
assert manifest['canonical_path'] == 'site-directory/allowlist.json'
assert len(manifest['allowlist_sha256']) == 64
assert not (ROOT / 'allowlist.json').exists()
assert len({e['url'] for e in entries}) == len(entries)
allowed = {'title', 'repository', 'url', 'category', 'tags', 'published_at', 'file_created_at',
           'file_created_source', 'published_source', 'status', 'http_status', 'checked_at',
           'sort_at', 'date_basis', 'date_label'}
for entry in entries:
    assert set(entry) <= allowed
    assert urlsplit(entry['url']).scheme == 'https'
    assert urlsplit(entry['url']).netloc == 'arislee1979-afk.github.io'
    assert entry['status'] in ['LIVE', '404', 'UNKNOWN']

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.read_urls = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('class') == 'read':
            self.read_urls.append(attrs['href'])
        for key in ['src', 'href']:
            if attrs.get(key): self.links.append(attrs[key])

for path in ROOT.rglob('*.html'):
    parser = Parser()
    parser.feed(path.read_text())
    for url in parser.links:
        parts = urlsplit(url)
        if parts.scheme or parts.netloc or not parts.path: continue
        target = ROOT / unquote(parts.path).lstrip('/') if parts.path.startswith('/') else path.parent / unquote(parts.path)
        assert target.resolve().is_relative_to(ROOT.resolve()), (path, url)
        assert target.exists(), (path, url)
    if path == ROOT / 'pages/index.html':
        assert parser.read_urls == [e['url'] for e in entries]
config = json.loads((ROOT / 'assets/config.yml').read_text())
assert config['links'][0]['url'] == 'pages/'
assert (ROOT / 'pages/list.css').is_file() and (ROOT / 'pages/list.js').is_file()
print(f'PASS static snapshot: {len(entries)} approved rows; local HTML assets and public fields verified')
