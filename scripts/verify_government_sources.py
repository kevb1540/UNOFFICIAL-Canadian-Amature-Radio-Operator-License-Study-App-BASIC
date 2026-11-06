"""Check source titles/versions and every reproduced ISED question and answer.

Run from any directory: python3 scripts/verify_government_sources.py
Uses only Python's standard library. A changed or unreachable source is reported
as a failed check, never silently accepted or used to rewrite study content.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from hashlib import sha256
from html.parser import HTMLParser
from io import BytesIO
import argparse
import json
from pathlib import Path
import re
from urllib.request import urlopen
from zipfile import ZipFile
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'app/src/main/assets'


def normalized(value):
    return ' '.join(value.split()).casefold()


class SourcePage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.heading = []
        self.text = []
        self.metadata = {}
        self.in_heading = False
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1':
            self.in_heading = True
        if tag in ('script', 'style'):
            self.skip += 1
        if tag == 'meta':
            self.metadata[attrs.get('name', attrs.get('property', ''))] = attrs.get('content', '')

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.in_heading = False
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, data):
        if self.in_heading:
            self.heading.append(data)
        if not self.skip:
            self.text.append(data)


def download(url):
    with urlopen(url, timeout=30) as response:
        if not response.url.startswith('https://'):
            raise ValueError('Source redirected away from HTTPS')
        return response.read(), response.url


def check_page(source):
    result = {'id': source['id'], 'url': source['url'], 'expected_title': source.get('page_title', source['title'])}
    try:
        data, resolved_url = download(source['url'])
        page = SourcePage()
        page.feed(data.decode('utf-8-sig'))
        title = ' '.join(''.join(page.heading).split())
        body = normalized(' '.join(page.text))
        checks = {'complete_title': normalized(title) == normalized(result['expected_title'])}
        checks['version_markers'] = all(normalized(marker) in body for marker in source.get('version_markers', []))
        if source.get('page_modified'):
            checks['page_modified'] = page.metadata.get('dcterms.modified') == source['page_modified']
        if source.get('source_author_metadata'):
            checks['source_author'] = page.metadata.get('author') == source['source_author_metadata']
        if source.get('source_creator_metadata'):
            checks['source_creator'] = page.metadata.get('dcterms.creator') == source['source_creator_metadata']
        result.update(title=title, resolved_url=resolved_url, sha256_html=sha256(data).hexdigest(),
                      metadata={k: v for k, v in page.metadata.items() if k in ('author', 'dcterms.creator', 'dcterms.modified')},
                      checks=checks, passed=all(checks.values()))
    except Exception as exc:
        result.update(passed=False, error=str(exc))
    return result


def check_bank(info):
    result = {'url': info['source'], 'title': info['title'], 'author': info['author']}
    try:
        data, resolved_url = download(info['source'])
        with ZipFile(BytesIO(data)) as archive:
            raw = archive.read('amat_basic_quest_delim.txt')
        official = {}
        for line in raw.decode('utf-8-sig').splitlines()[1:]:
            if not line.strip():
                continue
            fields = line.split(';')
            if len(fields) != 11 or not re.fullmatch(r'B-\d{3}-\d{3}-\d{3}', fields[0]):
                raise ValueError('Unexpected official question format')
            qid, text, answer, *tail = fields
            if qid in official:
                raise ValueError('Duplicate official question ID: ' + qid)
            official[qid] = {'text': text, 'options': [answer, *tail[:3]],
                             'fr': {'text': tail[3], 'options': tail[4:8]}}
        bundled = json.loads((ASSETS / 'questions.json').read_text(encoding='utf-8'))
        mismatches = [q['id'] for q in bundled if any(q.get(k) != v for k, v in official.get(q['id'], {}).items()) or q['id'] not in official]
        checks = {
            'all_ids_and_counts': len(bundled) == len(official) == info['count'] and {q['id'] for q in bundled} == set(official),
            'english_french_wording_and_answer_keys': not mismatches,
            'topic_count': len({qid.rsplit('-', 1)[0] for qid in official}) == info['topics'],
            'recorded_source_sha256': sha256(raw).hexdigest() == info['sha256_delimited'],
        }
        result.update(resolved_url=resolved_url, questions=len(official), mismatches=mismatches,
                      sha256_delimited=sha256(raw).hexdigest(), sha256_zip=sha256(data).hexdigest(),
                      checks=checks, passed=all(checks.values()))
    except Exception as exc:
        result.update(passed=False, error=str(exc))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'government-source-verification.json')
    args = parser.parse_args()
    course = json.loads((ASSETS / 'course.json').read_text(encoding='utf-8'))
    info = json.loads((ASSETS / 'bank-info.json').read_text(encoding='utf-8'))
    terms = {'id': 'terms', 'title': 'Terms and conditions', 'url': info['terms'],
             'version_markers': ['Non-commercial reproduction', 'due diligence', 'complete title', 'copy of the version']}
    with ThreadPoolExecutor(max_workers=5) as pool:
        pages = list(pool.map(check_page, [*course['sources'], terms]))
    bank = check_bank(info)
    report = {'checked_at': datetime.now(ZoneInfo('America/Toronto')).isoformat(),
              'scope': 'Live source titles, author metadata, editions and page dates; exact English/French question and answer comparison. Does not certify every authored explanation.',
              'pages': pages, 'question_bank': bank, 'passed': all(p['passed'] for p in pages) and bank['passed']}
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for page in pages:
        print(('PASS' if page['passed'] else 'FAIL'), page['id'], page.get('error') or page.get('checks'))
    print(('PASS' if bank['passed'] else 'FAIL'), 'official question bank:', bank.get('questions'), 'questions;', bank.get('error') or bank.get('checks'))
    print('Report:', args.output)
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
