#!/usr/bin/env python3
"""Compile complete topic lessons and audit every question. ©️ Kevin W. Brown 2026."""
from collections import defaultdict
from pathlib import Path
from html import escape, unescape
import hashlib
import json
import math
import re
from lesson_content import TOPICS

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'app/src/main/assets'

# Explain false selections as false, instead of presenting them as facts.
EXPLANATIONS = {
    'B-001-003-005': 'Select this because it is the false statement. Suspension is subject to the applicable notice and opportunity to make representations; do not memorize the selected wording as an unrestricted ministerial power.',
    'B-001-003-006': 'Select this because it is false: an inspector does not have a general power to enter a dwelling with neither consent nor a warrant. The other choices describe conditions associated with authorized inspection.',
    'B-001-006-005': 'This is the false statement. Amateur authority alone does not authorize aeronautical, marine or land-mobile operation. A separate service has its own licensing, certification and operator conditions.',
    'B-001-007-003': 'This statement is false. Occasional business communications do not become permissible merely because the station normally makes personal amateur contacts.',
    'B-001-022-001': 'This is the false fee statement: qualification examinations at an ISED office are free. An accredited examiner may separately recover their administration costs.',
    'B-001-022-002': 'This is false. An accommodation can change the examination method, but does not excuse the candidate from demonstrating the required knowledge.',
    'B-001-022-005': 'This is the false choice. The bank allows appropriate oral/adapted examination arrangements, not the described interpreter substitution for the examination language requirement.',
    'B-001-023-001': 'This is false. Consult the applicable local/ISED process and determine whether a defined exclusion applies. Amateur certification is not an unconditional permission for structures of any size.',
    'B-001-023-005': 'The question asks for the item that is NOT a required element of the default process. Written notice, a comment opportunity and responding to reasonable/relevant concerns are required; a public meeting is not automatically required.',
    'B-001-024-008': 'This statement is false: handheld transmitters are not excluded from RF-exposure requirements. Exposure depends on the actual operating arrangement, not just the equipment category.',
    'B-001-024-010': 'This is false. Safety Code 6 limits exposure quantities, such as fields, currents and energy absorption. Transmitter watts alone do not determine exposure.',
    'B-002-009-007': 'Select this because it is false. A log is useful for confirming contacts and troubleshooting, but the bank does not make keeping it a regulatory requirement.',
    'B-005-001-001': '1 MHz = 1000 kHz. Multiply 3.525 by 1000 to obtain 3525 kHz.',
    'B-005-001-002': '1 A = 1000 mA. Divide 3000 mA by 1000 to obtain 3 A.',
    'B-005-001-004': 'A microfarad is one million picofarads. Divide 1,000,000 pF by 1,000,000 to obtain 1 µF.',
    'B-005-001-005': 'A watt is 1000 milliwatts. 500/1000 = 0.5 W.',
    'B-005-001-007': 'Divide kilohertz by 1000: 7040/1000 = 7.040 MHz.',
    'B-005-001-008': 'One quarter ampere is 0.25 A. Multiplying by 1000 gives 250 mA.',
    'B-005-001-009': 'Multiply volts by 1000: 2 V = 2000 mV.',
    'B-005-001-011': 'There are 1000 µH in 1 mH, so 10,000/1000 = 10 mH.',
    'B-005-004-001': 'Use V = IR: 0.5 A × 2 Ω = 1.0 V.',
    'B-005-004-005': 'Use R = V/I: 12 V / 0.25 A = 48 Ω.',
    'B-005-004-006': 'First convert 10 mA to 0.010 A. R = 9/0.010 = 900 Ω.',
    'B-005-004-007': 'Use V = IR: 0.44 × 50 = 22 V.',
    'B-005-004-008': 'Use I = V/R: 6/30 = 0.2 A.',
    'B-005-004-009': 'Convert 200 mA to 0.200 A, then V = IR = 0.200 × 25 = 5 V.',
    'B-005-004-011': 'Convert 300 mA to 0.300 A, then R = V/I = 3/0.300 = 10 Ω.',
    'B-005-005-002': 'Each 100-Ω branch draws 12/100 = 0.12 A. Four parallel branches draw 4 × 0.12 = 0.48 A = 480 mA.',
    'B-005-005-004': 'Each 1000-Ω branch draws 12/1000 = 0.012 A. Two branches draw 0.024 A = 24 mA.',
    'B-005-005-006': 'Series resistances add: five × 10 Ω = 50 Ω.',
    'B-005-005-007': 'Five equal 24-Ω resistors in series give 5 × 24 = 120 Ω.',
    'B-005-005-009': 'For four equal parallel resistors, divide one resistance by four: 68/4 = 17 Ω.',
    'B-005-005-010': 'Parallel branches have the same voltage. I = V/R means twice the current requires half the resistance.',
    'B-005-006-002': 'The ideal minimum output power is V × I = 12 × 5 = 60 W. Real supply designs need additional margin.',
    'B-005-006-003': '500 mA = 0.5 A. DC input power is 12 × 0.5 = 6 W.',
    'B-005-006-004': 'The two equal series resistors share the heat equally. Each may dissipate 1 W, for 2 W total.',
    'B-005-006-005': 'The equal parallel resistors share the power equally. Two 1-W ratings allow 2 W total under the stated conditions.',
    'B-005-006-006': 'At unchanged resistance, P = V²/R. Doubling voltage multiplies power by 2² = 4.',
    'B-005-006-007': 'Four equal 200-Ω parallel resistors make 200/4 = 50 Ω. Their 2-W ratings total 8 W, exceeding the required 5 W.',
    'B-005-006-008': 'Rearrange P = VI into I = P/V: 30/12 = 2.5 A.',
    'B-005-006-009': 'The series resistance is 10 + 10 = 20 Ω. P = V²/R = 100/20 = 5 W total.',
    'B-005-008-004': '200 W to 20 W is a tenfold reduction, or −10 dB. Subtract 10 dB from S9+10 dB to obtain S9.',
    'B-005-008-005': '150 W to 15 W removes 10 dB. S9+20 dB therefore becomes S9+10 dB.',
    'B-005-008-008': '50/5 = 10 times the power. 10 log10(10) = 10 dB.',
    'B-005-008-009': '9 dB is approximately three 3-dB doublings: 2 W × 2 × 2 × 2 = 16 W.',
    'B-005-008-010': '6 dB loss is approximately division by four. 100/4 = 25 W.',
    'B-005-008-011': 'A 30-dB reduction divides power by 1000: 100 W / 1000 = 0.1 W.',
    'B-005-009-008': 'Uncoupled series inductances add: 12 + 12 = 24 mH.',
    'B-005-009-009': 'Two equal parallel inductors have half the individual inductance: 20/2 = 10 mH.',
    'B-005-009-010': 'Two equal series capacitors have half the individual capacitance: 20/2 = 10 µF.',
    'B-005-009-011': 'Parallel capacitances add: 24 + 24 = 48 µF.',
    'B-005-011-001': 'Neglecting losses, Iprimary = P/V = 250/120 ≈ 2.08 A, rounded to 2.1 A.',
    'B-005-011-003': 'Input power is 120 × 0.5 = 60 W. At a 12-V secondary, I = 60/12 = 5 A.',
    'B-005-011-004': 'The turns ratio is 500/250 = 2. Multiply the 120-V input by two to get 240 V.',
    'B-005-011-007': 'An ideal 10-W output at 5 V supplies I = P/V = 10/5 = 2 A.',
    'B-005-011-008': 'Voltage steps up by five, so current steps down by five. Primary current is 5 × 50 mA = 250 mA.',
    'B-004-006-004': '10% of 100 Ω is 10 Ω. The allowed range is 100−10 to 100+10, or 90–110 Ω.',
    'B-004-006-011': 'The first two bands make 27 and yellow is ×10⁴. Thus 27 × 10,000 = 270,000 Ω = 270 kΩ.',
    'B-003-010-006': 'For high-side injection, oscillator = receive frequency + IF. 3.540 MHz + 0.455 MHz = 3.995 MHz.',
    'B-003-011-007': 'Conventional AM occupies both sidebands, so bandwidth is twice the highest audio frequency: 2 × 3 kHz = 6 kHz.',
    'B-003-011-010': 'The difference is heat: 200 W DC input − 125 W RF output = 75 W of dissipation.',
    'B-003-012-010': '1000 Hz is 1 kHz. Lower sideband places the tone below the suppressed carrier: 7100−1 = 7099 kHz.',
    'B-003-016-009': 'Parallel matching batteries retain 12 V and add capacity: 20 + 20 = 40 Ah.',
    'B-003-016-010': 'Series batteries add voltage, 12 + 12 = 24 V, while retaining the 20-Ah capacity.',
    'B-003-017-009': 'The 3-m separation means 6 m of supply-and-return conductor. 6 × 0.07 V/m = 0.42 V, under the 0.5-V limit.',
    'B-002-006-007': 'One calibrated S-unit is 6 dB, a fourfold power change. 100/4 = 25 W.',
    'B-002-006-008': 'Raising one calibrated S-unit requires +6 dB, or approximately four times the transmitter power.',
    'B-002-009-010': 'The stated offset is UTC−6: 19:00 minus six hours = 13:00, or 1 PM.',
    'B-006-008-003': 'Use λ = 300/f with f in MHz: 300/25 = 12 m.',
    'B-006-008-011': 'Use λ = 300/f: 300/2 = 150 m.',
    'B-006-009-011': 'Subtract the dipole-over-isotropic reference: 4.1 dBi − 2.1 dB = 2.0 dBd.',
    'B-006-010-002': 'For this HF quarter-wave approximation, length = 71.3/21.125 ≈ 3.37 m.',
    'B-006-010-003': 'The approximate free-space half wavelength is 150/223 m ≈ 0.673 m = 67 cm.',
    'B-006-011-002': 'The driven-element approximation is 143/14.0 ≈ 10.21 m.',
    'B-006-011-003': 'The director is shorter than the driven element. Use about 136/21.1 ≈ 6.44 m for the bank’s choice.',
    'B-006-011-004': 'The reflector is longer. Use about 150/28.1 ≈ 5.34 m.',
    'B-006-011-011': 'Ideal stacking adds roughly 3 dB, so 10 dBi + 3 dB = 13 dBi, before real feed losses.',
    'B-006-012-001': 'The total HF dipole length is 143/28.150 ≈ 5.08 m; each leg is half of that.',
    'B-006-012-009': 'Total HF dipole length is 143/3.75 ≈ 38.13 m.',
    'B-006-013-003': 'Use the loop perimeter approximation 306/21.4 ≈ 14.30 m; this is all four sides together.',
    'B-006-013-004': 'Loop perimeter = 306/14.3 ≈ 21.40 m.',
    'B-006-013-005': 'Delta-loop perimeter = 306/28.7 ≈ 10.66 m; it is not the length of one triangular side.',
    'B-006-013-009': 'Full loop perimeter = 306/7.15 ≈ 42.80 m.',
    'B-006-006-011': 'The required impedance ratio is 300/50 = 6:1. Do not confuse this with the turns ratio, which is its square root.',
    'B-008-004-005': '21.375/7.125 = 3, identifying a third harmonic of the intended fundamental.',
    'B-008-004-007': 'A 15-metre signal near 21 MHz has a third harmonic near 63 MHz, inside the stated TV channel.',
    'B-008-004-010': 'A 10-metre transmission near 28 MHz has a second harmonic at 2 × 28 = 56 MHz.',
}

FALSE_STATEMENTS = {
    'B-001-003-005', 'B-001-003-006', 'B-001-006-005',
    'B-001-007-003', 'B-001-022-001', 'B-001-022-002',
    'B-001-022-005', 'B-001-023-001', 'B-001-024-008',
    'B-001-024-010', 'B-002-009-007',
}


def prose_html(text):
    blocks = []
    for block in text.strip().split('\n\n'):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        if all(line.startswith('|') for line in lines):
            rows = [[cell.strip() for cell in line.strip('|').split('|')] for line in lines]
            table = '<div class="table-wrap"><table><thead><tr>'
            table += ''.join('<th>' + escape(x) + '</th>' for x in rows[0])
            table += '</tr></thead><tbody>'
            table += ''.join('<tr>' + ''.join('<td>' + escape(x) + '</td>' for x in row) + '</tr>' for row in rows[1:])
            blocks.append(table + '</tbody></table></div>')
        else:
            blocks.append('<p>' + escape(' '.join(lines)) + '</p>')
    return ''.join(blocks)


def main():
    course = json.loads((ASSETS / 'course.json').read_text())
    bank = json.loads((ASSETS / 'questions.json').read_text())
    by_topic = defaultdict(list)
    for q in bank:
        by_topic[q['topic']].append(q)
    assert set(TOPICS) == set(by_topic), {
        'missing': sorted(set(by_topic) - set(TOPICS)),
        'extra': sorted(set(TOPICS) - set(by_topic)),
    }
    ids = {q['id'] for q in bank}
    assert set(EXPLANATIONS) <= ids
    guides = {}
    report = {'version': '2.2.0', 'bank_questions': len(bank), 'topics': len(TOPICS),
              'bank_verified': '2026-10-15', 'chapters': [], 'questions_without_lessons': []}
    for ch in course['chapters']:
        if ch['id'] == 'exam-ready':
            continue
        ch.pop('introLessons', None)
        chapter_topics = sorted({q['topic'] for q in bank if q['chapter'] == ch['id']})
        lessons = []
        for code in chapter_topics:
            notes = TOPICS[code]
            questions = by_topic[code]
            assert {q['chapter'] for q in questions} == {ch['id']}
            teaching = prose_html(notes['teaching'])
            facts = '<div class="exam-facts"><h3>Apply this lesson to the exam</h3><p class="helper">The concept explanation above comes first. These official question examples make every tested detail explicit. Correct choices are written out because answer letters change in tests.</p>'
            for q in questions:
                kind = 'false-statement' if q['id'] in FALSE_STATEMENTS else 'not-required' if q['id'] == 'B-001-023-005' else 'answer'
                label = 'False statement to select' if kind == 'false-statement' else 'Item not required by this process' if kind == 'not-required' else 'Correct answer'
                custom = EXPLANATIONS.get(q['id'], '')
                facts += '<div class="teaching-example" id="study-' + q['id'] + '" data-teaches="' + q['id'] + '">'
                facts += '<p class="helper">ISED ' + q['id'] + '</p><h4>' + escape(q['text']) + '</h4>'
                facts += '<p class="teaching-answer"><strong>' + label + ':</strong> ' + escape(q['options'][0]) + '</p>'
                if custom:
                    facts += '<p class="small-text">' + escape(custom) + '</p>'
                facts += '</div>'
                guides[q['id']] = {'chapterId': ch['id'], 'lessonId': code,
                                    'selectionKind': kind, 'explanation': custom}
            facts += '</div>'
            paragraphs = [p.strip().replace('\n', ' ') for p in notes['teaching'].split('\n\n') if p.strip() and not p.lstrip().startswith('|')]
            lessons.append({'id': code, 'topic': code, 'title': notes['title'],
                            'questionIds': [q['id'] for q in questions],
                            'teachingSummary': paragraphs[0], 'teaching': teaching,
                            'body': teaching + facts})
        ch['lessons'] = lessons
        words = sum(len(unescape(re.sub('<[^>]+>', ' ', l['body'])).split()) for l in lessons)
        ch['minutes'] = max(1, math.ceil(words / 180))
        ch['coverage'] = {'questions': sum(len(l['questionIds']) for l in lessons),
                          'topics': len(lessons), 'words': words}
        report['chapters'].append({'id': ch['id'], 'title': ch['title'], **ch['coverage'],
                                   'topic_ids': chapter_topics, 'unsupported_questions': []})
    final = next(ch for ch in course['chapters'] if ch['id'] == 'exam-ready')
    final['summary'] = 'Cumulative review of chapters 1–11. This chapter’s mixed test draws from the full official bank; use the linked topic lessons below to revisit any prerequisite.'
    final['lessons'] = [
        {'title': 'This is a cumulative chapter', 'body': prose_html('''This chapter reviews the material taught in chapters 1–11. Its short mixed test can draw from any of the 984 official Basic questions, not just these review paragraphs. The prerequisite topic index below links to all 100 detailed lessons, including their worked examples and question-specific facts. Use it before the test whenever a subject is unfamiliar.\n\nA full practice exam is a separate 100-question activity. Each full exam selects one question from every official topic group. The question bank, official answers and chapter pools are unchanged in this update; the teaching material has been expanded to match them.''')},
        {'title': 'Solve a calculation in five steps', 'body': prose_html('''Identify the requested quantity, write the known values with units, choose and rearrange the formula, convert prefixes, then calculate. Finally check the direction of change: more resistance at a fixed voltage lowers current; doubling voltage at a fixed resistance quadruples power; a shorter wire resonates higher.\n\n| Quantity | Useful relationship |\n| Voltage, current, resistance | V = IR; I = V/R; R = V/I |\n| DC power | P = VI = I²R = V²/R |\n| Free-space wavelength | λ(m) ≈ 300/f(MHz) |\n| HF wire dipole / quarter wave | Total dipole ≈ 143/f; quarter wave ≈ 71.3/f |\n| Full wire-loop perimeter | Approximately 306/f(MHz) |\n| Transformer | Voltage ratio = turns ratio; impedance ratio = turns ratio squared |\n| Power in dB | +3 ≈ ×2; +6 ≈ ×4; +10 = ×10 |\n\nRead the wording carefully: a full dipole, one dipole leg, a loop perimeter and one side of a loop are different lengths. Similarly DC input, RF output, PEP, ERP and EIRP are different power quantities.''')},
        {'title': 'Read the question, especially NOT and minimum', 'body': prose_html('''Before choosing an answer, identify whether the question asks for a true answer, a false statement, the minimum qualification, or the most suitable option among those listed. In the detailed lessons, false-statement selections are explicitly labelled false and followed by the true rule.\n\nCompare Basic, Honours and Advanced privileges using the qualification lesson; installation and operating tasks can require different qualifications. For technical questions distinguish the job of a mixer, filter, amplifier and detector. For antennas distinguish resonance, impedance match, pattern and efficiency. For interference distinguish overload, audio rectification, harmonics and splatter. The topic index takes you directly to the full explanation for each distinction.''')},
        {'title': 'Prepare for the real examination', 'body': prose_html('''Basic passes at 70%; Basic with Honours begins at 80%. The app stores each submitted practice attempt with its answers, so review mistakes, read the linked lesson, practise the relevant lab and try again after studying. Aim for several strong results on fresh full exams rather than memorizing answer letters.\n\nThe glossary is available from the persistent header on every screen. You may use it while learning or practising; for a realistic readiness check, try a complete exam without consulting it. The actual examiner determines the permitted reference aids, identity checks, format and accommodations. ISED provides labelled formula/block-diagram study material and an unlabelled permitted examination aid. A practice score never grants operating privileges.\n\nUse the topic index below for the complete prerequisite readings. Your notes, completed chapters and earlier scores remain available as you review.''')},
    ]
    final['reviewTopics'] = [{'chapterId': ch['id'], 'chapterTitle': ch['title'],
                              'lessonId': l['id'], 'title': l['title']}
                             for ch in course['chapters'] if ch['id'] != 'exam-ready'
                             for l in ch['lessons']]
    final['coverage'] = {'questions': len(bank), 'topics': len(TOPICS), 'cumulative': True}
    course['questionGuides'] = guides
    course['teachingVersion'] = '2.2.0'
    course['teachingVerified'] = '2026-10-15'
    course['coverage'] = {'questions': len(guides), 'topics': len(TOPICS),
                          'detailedLessons': sum(len(ch['lessons']) for ch in course['chapters'][:-1]),
                          'uncovered': [], 'coreTeachingWords': sum(len(t['teaching'].split()) for t in TOPICS.values())}
    for q in bank:
        guide = guides.get(q['id'])
        assert guide, q['id']
        ch = next(ch for ch in course['chapters'] if ch['id'] == guide['chapterId'])
        lesson = next(l for l in ch['lessons'] if l['id'] == guide['lessonId'])
        assert q['id'] in lesson['questionIds']
        assert 'data-teaches="' + q['id'] + '"' in lesson['body']
        assert escape(q['options'][0]) in lesson['body']
    course['coverage']['bank_sha256'] = hashlib.sha256((ASSETS / 'questions.json').read_bytes()).hexdigest()
    report['covered_questions'] = len(guides)
    report['core_teaching_words'] = course['coverage']['coreTeachingWords']
    report['detailed_lessons'] = course['coverage']['detailedLessons']
    (ASSETS / 'course.json').write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n')
    info = json.loads((ASSETS / 'bank-info.json').read_text())
    info['verified'] = '2026-10-15'
    (ASSETS / 'bank-info.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'lesson-coverage-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({**course['coverage'], 'course_bytes': (ASSETS / 'course.json').stat().st_size}, indent=2))


if __name__ == '__main__':
    main()
