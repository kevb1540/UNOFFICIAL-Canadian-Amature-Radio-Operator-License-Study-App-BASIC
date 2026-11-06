#!/usr/bin/env python3
"""Reject test questions without matching lesson material. ©️ Kevin W. Brown 2026."""
from html import escape
from pathlib import Path
import json
import re


def validate(course, bank):
    chapters = {c['id']: c for c in course['chapters']}
    guides = course.get('questionGuides', {})
    missing = []
    topics = set()
    for q in bank:
        guide = guides.get(q['id'], {})
        chapter = chapters.get(guide.get('chapterId'), {})
        lesson = next((l for l in chapter.get('lessons', [])
                       if l.get('id') == guide.get('lessonId')), {})
        body = lesson.get('body', '')
        teaching_words = len(re.sub('<[^>]+>', ' ', lesson.get('teaching', '')).split())
        if not (chapter.get('id') == q['chapter'] and lesson.get('topic') == q['topic']
                and q['id'] in lesson.get('questionIds', []) and teaching_words >= 100
                and 'data-teaches="' + q['id'] + '"' in body
                and escape(q['text']) in body and escape(q['options'][0]) in body):
            missing.append(q['id'])
        else:
            topics.add(lesson['id'])
    if missing:
        raise ValueError('Cannot build: lesson material is missing or mismatched for '
                         + ', '.join(missing[:20]))
    return {'covered_questions': len(bank), 'detailed_lessons': len(topics)}


if __name__ == '__main__':
    assets = Path(__file__).resolve().parents[1] / 'app/src/main/assets'
    print(json.dumps(validate(json.loads((assets / 'course.json').read_text()),
                              json.loads((assets / 'questions.json').read_text())), indent=2))
