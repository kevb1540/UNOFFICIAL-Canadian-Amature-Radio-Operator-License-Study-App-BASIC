"""Original teaching notes for every ISED Basic topic. ©️ Kevin W. Brown 2026.

Exam wording and answer keys remain in questions.json with ISED attribution.
These notes explain the concepts before the separately labelled exam examples.
"""
TOPICS = {}


def topic(code, title, teaching):
    if code in TOPICS:
        raise ValueError('Duplicate topic ' + code)
    TOPICS[code] = {'title': title, 'teaching': teaching.strip()}


topic('B-001-001', 'Who makes the rules?', '''
Canada's Radiocommunication Act is the enabling law: it gives the federal government authority to regulate radiocommunications and publish operating standards. Innovation, Science and Economic Development Canada (ISED) administers it. The Radiocommunication Regulations give more detailed legal requirements and define the amateur radio service. RBR-4 contains the operating standards, including bands, bandwidths and power restrictions.

Think of three layers: the Act gives authority; the Regulations implement requirements; the standards supply operating details. The Broadcasting Act concerns broadcasting and is not the enabling law for amateur radio. The International Telecommunication Union (ITU) coordinates internationally; it does not replace Canada's domestic legislation.

Worked distinction: a question asking which document gives authority points to the Act. A question asking which document defines the Canadian amateur radio service points to the Regulations. A question asking which department administers the Act points to ISED.
''')
topic('B-001-002', 'Your certificate, address changes and fees', '''
An Amateur Radio Operator Certificate is valid for life. There is no annual certificate renewal. Keep the certificate at the station/address supplied to ISED, and update ISED within 30 days after your mailing address changes. If an inspector requests your certificate or a copy, the examination bank allows 48 hours to produce it. Lifetime validity does not remove these administrative duties.

| Service | Fee in the official bank |
| First certificate and initial call sign | Free |
| Replacement prefix after moving to another province or territory | Free |
| Changing an existing call sign, including a two-letter call sign | $60 |

Example: moving from Ontario to another province can require an address/prefix update; notifying ISED is still due within 30 days even though the qualifying replacement is free. Choosing a different existing call sign for preference is a different service and has the $60 fee. Fees and procedures should be checked with ISED before an actual application.
''')
topic('B-001-003', 'Offences, inspections and fair process', '''
Your certificate authorizes operation only within its privileges. Deliberate obstruction, false information and a false distress call are prohibited. Calling MAYDAY when there is no distress is a false or fraudulent message. The official bank asks for a maximum $5,000 fine, one year of imprisonment, or both, for the stated individual false-distress/interference offences. Do not confuse a question's specified offence with every possible penalty under the Act.

The Minister can suspend a certificate for contraventions, misrepresentation or unpaid required fees, subject to applicable notice and opportunity to make representations. The claim that suspension can simply occur with neither notice nor an opportunity to respond is the incorrect selection in the bank's NOT-correct question.

An inspector does not have an unrestricted right to enter a dwelling without consent and without a warrant. A warrant may authorize necessary entry, and using force requires the specified authorization and peace-officer involvement. Read NOT questions carefully: the selected answer can be the false statement, rather than a rule you should follow.
''')
topic('B-001-004', 'Qualifying and adding endorsements', '''
There is no minimum or maximum age for Basic certification. Candidates need a valid address in Canada, and Basic is the entry examination before an Amateur Radio Operator Certificate is issued. Some specified existing Canadian radio qualifications, such as the Radiocommunication Operator General Certificate Maritime (RGMC), can support the certificate arrangements described by ISED.

After Basic you may pursue the Advanced and Morse qualifications in either order. The separate Morse endorsement uses 5 words per minute sending and receiving. You do not need that endorsement merely to use Morse on bands already authorized by your qualifications.

Advanced is an amateur radio qualification. It does not itself grant aviation, marine or land-mobile operating authority. A certificate's amateur privileges and a different service's equipment/operator requirements are separate matters.
''')
topic('B-001-005', 'Installing or repairing a station for someone else', '''
An amateur authorization is not permission to install transmitting equipment for an unqualified customer or friend. For installing, placing in service or repairing an amateur transmitter on another person's behalf, both you and that person must hold Amateur Radio Operator Certificates with the qualifications required for the activity.

The owner needs the appropriate authorization for the apparatus. An Advanced-qualified amateur working on equipment for someone else does not substitute their own certificate for the other person's authorization. Reprogramming a land-mobile transmitter for someone else's use on 2 metres requires that other person to hold amateur certification, as well as compliance with the applicable amateur apparatus rules.

Distinguish helping a qualified station owner from letting an unqualified person transmit while supervised. The latter is a separate operating situation taught in the control-operator lesson.
''')
topic('B-001-006', 'Amateur authority and equipment certification', '''
Even a 2-watt amateur transmitter requires supervision by a qualified amateur with a call sign. Low power alone does not make amateur operation licence-exempt. Amateur stations normally communicate with stations under similar authorizations; amateur certification does not confer a general entitlement to use marine, aeronautical or land-mobile channels.

Frequency capability is not permission. A radio programmed onto a commercial channel must meet the certification and licensing requirements of that service. An amateur radio that can tune there is not automatically certified there. Conversely, equipment originally made for another service may be usable within amateur bands when the appropriate amateur conditions are met.

Do not add an amplifier to a licence-exempt transmitter under the assumption that an amateur certificate authorizes it. The licence-exempt device has its own equipment and emission conditions. For ordinary operation, use the bands and equipment authorization applicable to the service you are actually using.
''')
topic('B-001-008', 'Basic versus Advanced station privileges', '''
Basic permits operating amateur stations anywhere in Canada within the holder's privileges, assembling professionally designed commercially available transmitter kits, and operating cross-band repeaters. These are different activities from installing a same-band voice repeater or establishing a club station.

Basic plus Advanced is required for the bank's examples of installing a same-band voice repeater, installing an amateur club station, using transmitting equipment or an RF amplifier that is neither professionally designed nor commercially manufactured for amateur use, and remotely controlling frequency, mode or power.

A beacon is an example of permitted one-way amateur communication. A general-public broadcast is not made permissible merely by calling it a beacon. Operating an existing repeater is also different from being qualified to install it.

Memory aid: read the verb in the question—operate, assemble, install, design and remotely control can have different qualification requirements.
''')
topic('B-001-015', 'Bands and the privileges of visiting operators', '''
The privileges used at a station cannot exceed either the station authorization being used or the control operator's own qualifications. Inviting an Advanced operator to use your more restricted station/call sign does not automatically upgrade its privileges. An operator with fewer qualifications at an Advanced station cannot use privileges they personally lack.

For access below 30 MHz, the usual current routes are Basic with Honours (80% or better), Basic plus Advanced, or Basic plus the Morse qualification. Basic passes at 70%. Radio control of models uses amateur bands above 30 MHz. A separate repeater-output exception is covered in the repeater-rules lesson.

| Band name | Canadian frequency range asked in the bank |
| 160 metres | 1.8–2.0 MHz |
| 80 metres | 3.5–4.0 MHz |
| 40 metres | 7.0–7.3 MHz |
| 20 metres | 14.000–14.350 MHz |
| 15 metres | 21.000–21.450 MHz |
| 10 metres | 28.000–29.700 MHz |

These are allocation edges, not guarantees that every mode fits at every frequency. The entire occupied signal must remain inside the band and satisfy its bandwidth and power limits.
''')
topic('B-001-016', 'Occupied bandwidth and band edges', '''
Bandwidth is the span occupied by a transmission, not its centre frequency. Keep the complete signal inside the permitted band. Selecting a dial frequency just inside an edge is insufficient if a sideband extends beyond it.

| Band or range in the exam | Maximum occupied bandwidth |
| 7–25 MHz bands, except 30 metres | 6 kHz |
| 30 metres: 10.100–10.150 MHz | 1 kHz |
| 10 metres: 28.000–29.700 MHz | 20 kHz |
| 6 metres: 50–54 MHz | 30 kHz |
| 2 metres: 144–148 MHz | 30 kHz |

Ordinary SSB voice is about 2–3 kHz wide, so it does not fit the 30-metre 1-kHz limit: SSB at 10.12 MHz is prohibited. Fast-scan television is much wider than the allowed limits on 2 metres and 20 metres, so the bank's ATV examples at 145 MHz and 14.23 MHz are prohibited.

Worked band-edge example: an LSB signal with audio extending to 3 kHz is transmitted below its suppressed-carrier frequency. At a lower band edge, allow that occupied width above the edge in your dial setting. USB extends above its suppressed-carrier setting instead.
''')
topic('B-001-017', 'Power limits: read the measurement being asked', '''
Use the minimum legal power needed for communication. DC input power, carrier/RF output, peak envelope power (PEP), ERP and EIRP measure different things and cannot be substituted for one another. PEP is the RF-cycle-average power at the crest of the modulation envelope.

| Qualification | Final-stage DC input | Non-SSB carrier output | SSB PEP output |
| Without Advanced | 250 W | 190 W | 560 W |
| With Advanced | 1000 W | 750 W | 2250 W |

For example, Basic with Honours and Basic plus Morse have HF access, but neither alone supplies Advanced power privileges: the bank's SSB examples at 7055 kHz and 3750 kHz use a 560-W PEP limit. The 250-W figure is DC input to the final amplifier, not 250 W of RF output.

Special-band radiated-power limits can be lower: the bank asks for 100 W ERP as PEP on 60 metres, even with Advanced. On 630 and 2200 metres, limits are expressed as EIRP, so antenna gain must be included. Verify allowed transmitter/amplifier output at that device's output connector after accounting for exposure and radiated-power restrictions. A general maximum never overrides a stricter band-specific or RF-exposure limit.
''')
topic('B-001-020', 'International amateur communications', '''
International amateur contacts are for amateur-service purposes and personal remarks, not commercial traffic. They are generally allowed unless an administration has registered an objection. The International Telecommunication Union (ITU) publishes international Radio Regulations; Canada implements its own national requirements within that framework.

An international regulation does not require every country to impose the same Morse test. Administrations decide whether Morse proficiency is required for their authorizations. Canada's Basic, Honours, Advanced and Morse arrangements must therefore be learned as Canadian rules rather than inferred from another country's licence classes.

For an international contact, ask two questions: is communication with that administration allowed, and does the proposed content fit amateur purposes/personal remarks? Third-party traffic has its own additional conditions and is covered with operating procedures.
''')
topic('B-001-021', 'ITU regions and operating abroad', '''
The ITU divides the world into three radio regions. Region 1 includes Europe and Africa; Region 2 includes Canada and the Americas; Region 3 includes Australia, Japan and Southeast Asia. Allocations can differ by region and country.

When visiting another country, obey that country's frequency limits and the privileges allowed by the applicable agreement. A Canadian station in Florida, including the bank's example 7 km offshore, uses the US band limits. Basic is the minimum Canadian qualification asked for visiting operation in the United States. For US voice identification, say your Canadian call sign, portable or mobile as appropriate, and the US call-area prefix.

For the CEPT Amateur Radio Licence arrangement in the bank, the Canadian minimum is Advanced. In a participating country, identify with that country's prefix, then stroke, then your Canadian call sign. CEPT and the Canada–US arrangements are not identical: check current permit documents and operating conditions before travelling.
''')
topic('B-001-022', 'Exam administration and accommodations', '''
ISED office qualification examinations have no examination fee. An accredited examiner may recover the costs of administering an exam; that is distinct from a fee for issuing the first certificate. An accredited examiner must hold Basic, Advanced and Morse qualifications under the criteria used in this bank.

Accommodations change how a candidate demonstrates knowledge; they do not excuse portions of the required knowledge. Examples include an oral examination for appropriate reading/language difficulties and an adapted Morse sending method. Medical evidence may be requested for an accommodation. An interpreter is not the bank's permitted substitute for demonstrating the required English/French examination knowledge.

Three NOT-correct traps select false claims: a $5-per-qualification ISED-office fee; exemption from parts of the examination due to disability; and bringing an interpreter as described in the question. Do not memorize those claims as true rules. Discuss an appropriate accommodation with the examiner before booking.
''')

topic('B-001-007', 'Permitted content: personal, public and secret', '''
Amateur radio is for personal, non-commercial communication and technical self-training. Business planning on a club net and even occasional business traffic are prohibited in the bank's examples. Broadcasting programmes to the general public is not an amateur-service purpose.

Publicly understood codes, Q signals and procedural abbreviations are allowed. Encoding is not necessarily encryption: a new digital method may be used when it is published in the public domain and is not a secret cipher. A message intended to hide its meaning with a secret code is not permitted in the situations asked here.

Keep background music and non-amateur broadcasts out of the microphone by reducing background audio. A permitted beacon or safety transmission is not permission to relay entertainment to the public. If a question asks which statement is NOT correct, the claim that occasional business is allowed is the false answer to select.
''')
topic('B-001-009', 'The control operator and shared responsibility', '''
Both the station owner and the control operator are responsible for lawful station operation. A qualified owner may choose another appropriately qualified amateur as control operator. A control operator is required whenever the station transmits and must be at its control point.

An unqualified friend or family member may speak through your station only under the supervision and in the presence of someone holding the appropriate qualifications. Leaving equipment available at home does not authorize an unqualified person to be the control operator when alone.

Worked situation: a visiting friend speaks on your microphone while you remain present, monitor the conversation and control the transmitter. That is supervised operation. Giving them your call sign and leaving is not equivalent. Visiting operators and station qualifications can also limit which bands and powers may be used.
''')
topic('B-001-011', 'Distress exceptions and disaster relief', '''
Ordinary amateur contacts are with other amateur stations. Do not turn the existence of a disaster into general permission to use out-of-band channels. The bank explicitly distinguishes routine relief operations after a disaster from an immediate distress situation involving safety of life or property.

A station actually in distress may use any means of radiocommunication, and the distress question does not impose ordinary transmitter-power limits. If you hear an unanswered distress call on an amateur band where you normally lack privileges, the bank allows you to respond and offer assistance. These narrow distress provisions are not a general operating exemption.

Disaster-relief communications are appropriate when ordinary systems are damaged, disrupted or overloaded. Operators not directly involved should avoid needless transmissions near the relief-net frequency. Messages for recognized public-service agencies can be handled in peacetime exercises as well as emergencies. Distress-related necessary intervention is different from deliberate interference with ordinary contacts.
''')
topic('B-001-012', 'No payment and the privacy of intercepted communications', '''
Do not demand or accept payment for handling amateur or third-party messages. The service is not a paid message-delivery business. A friendly request and a third-party message do not create an exception for remuneration.

Amateur transmissions are among the communications that may be divulged or used under the applicable rules. Do not extend that to every radio signal you can receive. Non-broadcast, non-amateur communications can remain protected even when audible with ordinary receiving equipment. Supplying intercepted protected content to answer a media organization's questions is an offence in the example asked.

Separate the right to receive a signal from the right to disclose or use its contents. The fact that a receiver or SDR can tune a frequency does not itself settle the disclosure question.
''')
topic('B-001-013', 'Call signs and identification intervals', '''
Identify your amateur station by transmitting its assigned call sign at the beginning and end of each contact and at intervals no longer than 30 minutes. Each station identifies itself. The same identification requirements apply to test transmissions; saying testing instead of a call sign is insufficient.

Identification may be in English or French. Normal Canadian amateur prefixes include VA, VE, VO and VY; VA3RAC is a valid-format example in the bank. Phonetics clarify the letters but do not replace the assigned call sign.

The exception asked for unidentified operation is controlling a model craft. Do not apply that exception to conversation or to equipment testing. Example: for a 45-minute contact, identify at the start, again before the first 30 minutes elapse, and at its end.
''')
topic('B-001-014', 'Third parties and foreign visitors in Canada', '''
A third party is someone on whose behalf an amateur communicates, including a supervised person without amateur certification. Both non-certified friends at the two ends are third parties. Third-party content must remain personal and non-commercial, and the certified operators remain responsible.

Canada does not prohibit international third-party amateur communications. Check the foreign administration's conditions; emergency/disaster-relief third-party communications are expressly permitted unless that administration specifically prohibits them. If a foreign amateur joins while your unqualified friend is speaking, remain present and continue monitoring; do not abandon supervision.

Foreign visitors need the applicable reciprocal authority or permit. CEPT visitors receive Canadian privileges equivalent to Advanced, subject to the conditions of their own authorization. A US visitor operating by voice in Canada uses their US call sign with mobile/portable as appropriate and the Canadian geographic prefix, and supplies city and province at least once during the contact. International objection and reciprocity requirements still matter.
''')
topic('B-001-018', 'Repeater rules and the below-30-MHz exception', '''
A repeater automatically receives and retransmits another station's signal, usually on a separate input/output frequency. It increases useful coverage; it does not give the user the installer's qualifications or unrestricted access to new bands.

The bank's special Basic-only example permits use of repeater outputs in 29.500–29.700 MHz: the lowest output frequency asked is 29.500 MHz. Learn that specific exception separately from the general requirement for additional privileges below 30 MHz.

An unmodulated carrier below 30 MHz is permitted for brief tests. Keep it brief, identify as required and avoid interference. Repeatedly sending an empty carrier is not a substitute for proper on-air procedure.
''')
topic('B-002-001', 'Using a repeater courteously', '''
Listen first. To call a known station, say its call sign and then your own. To join a conversation, give your call sign during a pause. Leave pauses so others, especially a station with an emergency, can enter. Keep transmissions short; a repeater's time-out timer interrupts excessive continuous transmissions.

Repeaters extend portable/mobile range by receiving at a favourable location and retransmitting. Frequency coordination recommends compatible repeater frequencies to reduce mutual interference. The common 2-metre offset is 600 kHz, but check the actual repeater's setting and direction.

CTCSS is a low-frequency, usually sub-audible access/squelch tone. A matching tone lets the receiver pass audio; it does not encrypt a conversation. Ask where are you in ordinary voice conversation rather than forcing a Q code into every sentence.

Example: if the repeater output is 146.940 MHz with a minus 600-kHz offset, you listen on 146.940 MHz and transmit on 146.340 MHz. A correct output frequency with an incorrect offset or access tone can prevent successful access.
''')
topic('B-002-002', 'The full ITU phonetic alphabet', '''
Use the ITU phonetic alphabet to make call-sign letters clear through noise and accents. Spell the actual letters of your assigned call sign; numbers remain numbers. The standardized spellings include Alfa and Juliett.

| Letters | Phonetic words |
| A B C D E F | Alfa · Bravo · Charlie · Delta · Echo · Foxtrot |
| G H I J K L | Golf · Hotel · India · Juliett · Kilo · Lima |
| M N O P Q R | Mike · November · Oscar · Papa · Quebec · Romeo |
| S T U V W X | Sierra · Tango · Uniform · Victor · Whiskey · X-ray |
| Y Z | Yankee · Zulu |

Worked example: VE3ABC becomes Victor Echo Three Alfa Bravo Charlie. Phonetics improve intelligibility and correct identification; they do not change the station's call sign or its operating privileges.
''')
topic('B-002-003', 'CQ, direct calls, simplex and sidebands', '''
CQ is a general invitation for any station to answer. For the exam's voice format, say CQ three times, this is, then your call sign three times. To answer, give the other station's call sign once, this is, then your own. A direct call to a specific station similarly puts the called call sign first.

Simplex means both stations transmit and receive on the same frequency. Use it when the direct path is reliable so the repeater remains available to others. Listening for the other station on the repeater input tests whether direct communication may work. Choose a simplex frequency that is not a local repeater input/output; consult the band plan.

VHF/UHF are generally preferred for local communication, keeping HF less congested for longer paths. For ordinary SSB voice convention, 20 metres uses USB; the bank's 3755-kHz example uses LSB. Convention does not eliminate the need to satisfy legal bandwidth and band-edge limits.
''')
topic('B-002-004', 'Listen, choose a frequency and test without interference', '''
Listen carefully before transmitting, then check whether the frequency is in use. No net or regular user owns a frequency. A net finding its normal channel occupied should politely ask about a move or choose a clear frequency; moving courteously can also help a net begin without conflict.

Use the minimum needed power. A dummy load absorbs RF for lengthy tests instead of radiating it. When antenna-tuner adjustment must be radiated near an ongoing HF SSB net, the bank recommends a clear frequency 3–5 kHz away, after checking that it is unused and legal.

Allow approximately 3 kHz separation from an SSB contact to avoid overlapping occupied bandwidth. If propagation changes bring rising interference, move to another clear frequency. A band plan is a voluntary division of a band among incompatible modes; it supports cooperation but is not the same as the legally binding allocation and bandwidth limits.
''')
topic('B-002-005', 'CW calling and common operating abbreviations', '''
For the bank's Morse CQ format, send CQ three times, DE, then your call sign three times. A routine reply sends the called station twice, DE, then your call sign twice. Send at a speed you can reliably receive.

| Signal | Meaning |
| CQ | Calling any station |
| DE | From |
| K | Any station may reply |
| R | All received |
| DX | A distant station |
| 73 | Best regards |

Full break-in CW, or QSK, returns the receiver to service between transmitted dits and dahs, making it possible to hear an interruption. For adjacent CW contacts, the bank's suggested separation is 150–500 Hz; allow enough room for the actual filters, keying bandwidth and other signal. An electronic keyer helps form correctly timed characters but does not decide what call sign or procedure to send.
''')
topic('B-002-006', 'RS/RST reports and S-meter changes', '''
RS means readability and signal strength; RST adds tone for CW. Readability runs 1–5, signal strength 1–9, and tone 1–9. A 57 voice report is perfectly readable and moderately strong. A 33 is readable with considerable difficulty and weak. A 11 is unreadable and barely perceptible. In CW, 579 adds perfect tone; 459 is quite readable, fair strength and perfect tone.

An ideal calibrated S-meter changes 6 dB per S-unit, corresponding to a factor of four in power. Real meters vary, but use the stated standard when the question specifies it. S9 plus 20 dB is 20 dB stronger than S9, not twenty more S-units.

Worked example: if 100 W produces S9, reducing by 6 dB to 25 W produces S8 under unchanged propagation. Raising S8 to S9 requires four times the power. On a repeater, report the remote station's received audio/signal quality through the repeater rather than pretending your meter directly measures the remote transmitter's RF strength.
''')
topic('B-002-007', 'Q codes you will hear and read', '''
Q codes are public procedural abbreviations. A question mark turns an appropriate statement into a question; context matters. On voice, ordinary words are often clearer, but learn the codes for CW and examination questions.

| Code | Meaning in these questions |
| QRS | Send more slowly |
| QTH | My location is… |
| QRL? | Is this frequency in use? |
| QSY | Change frequency |
| QSB | The signal is fading |
| QRZ? | Who is calling me? |
| QRM | Interference from other signals |
| QRN | Static or natural noise |
| QRX | I will call you again; wait |

Example: before a CW CQ, send QRL? and listen for a response. Do not confuse QRM, QRN and QSB: interference, static and fading describe different causes of difficulty and may call for different remedies.
''')
topic('B-002-008', 'Distress priority and practical emergency readiness', '''
Use MAYDAY in voice or SOS in Morse for a life-threatening distress situation. The voice distress signal is MAYDAY repeated three times. Being stranded without immediate danger is urgent traffic, not automatically distress. Distress takes priority over the lower-priority emergency traffic described in the bank.

To seek distress assistance through a busy repeater, break in during a pause, identify yourself and state the situation. If you hear a distress call, acknowledge it, establish the location and determine the assistance needed. If you cannot directly help, contact appropriate authorities and maintain a watch. Keep the channel available.

Prepare for loss of commercial AC power with charged batteries and a viable antenna. An adequate supply of charged handheld batteries matters more than optional accessories. A portable HF dipole or vertical can be deployed for emergency communication. Learn and practise deployment before it is needed; an emergency is a poor time to discover that connectors or power leads do not fit.
''')
topic('B-002-009', 'Logs, QSLs, maps, bearings and UTC', '''
A QSL card or compatible web log entry confirms that two amateur stations communicated. Keeping a station log is useful but is not a regulatory requirement in the bank's NOT-correct question. Record accurate call signs, dates, UTC times, bands and modes to support confirmations.

An azimuthal map centred on your location gives great-circle bearings to other places. The long path is opposite the short-path bearing: turn the antenna 180 degrees. For a short-path heading of 70 degrees, the long path is 250 degrees. A Maidenhead grid square expresses location as a four- or six-character code used in many VHF contacts and contests.

UTC is referenced to the Greenwich meridian. Convert using the stated offset, remembering date changes and daylight-saving differences. Worked example: local time at UTC−6 for a 19:00 UTC net is 19:00−6:00 = 13:00, or 1 PM. CHU, WWV and WWVH supply precise time/frequency reference signals; they are useful for checking equipment and schedules.
''')

topic('B-005-001', 'Metric prefixes and reliable unit conversion', '''
Convert units before substituting numbers into a formula. Kilo (k) means 10³, mega (M) 10⁶ and giga (G) 10⁹. Milli (m) means 10⁻³, micro (µ) 10⁻⁶ and pico (p) 10⁻¹². Capitalization matters: mW and MW differ by a billion.

| Conversion | Result |
| 3.525 MHz × 1000 | 3525 kHz |
| 7040 kHz ÷ 1000 | 7.040 MHz |
| 3000 mA ÷ 1000 | 3 A |
| 0.25 A × 1000 | 250 mA |
| 500 mW ÷ 1000 | 0.5 W |
| 2 V × 1000 | 2000 mV |
| 1,000,000 pF ÷ 1,000,000 | 1 µF |
| 10,000 µH ÷ 1000 | 10 mH |

One kilohm is 1000 ohms; one kilohertz is 1000 hertz. To convert MHz into GHz divide by 1000. A useful sense check: expressing a quantity in smaller units makes the numerical value bigger. The physical quantity itself has not changed.
''')
topic('B-005-002', 'Charge, current, voltage, resistance and conductance', '''
Current is the rate of flow of electric charge and is measured in amperes. Voltage, also called electromotive force or potential difference, drives current around a closed circuit. Resistance, R, opposes current and is measured in ohms. Conductance is the inverse: G = 1/R, measured in siemens.

Gold, silver, copper and aluminum are good conductors because their resistance is low. Glass, porcelain and air under ordinary conditions are good insulators. The question asking for the best conductor means the best among its particular answer choices; it does not mean copper outperforms silver in every comparison.

Polarity describes the positive/negative orientation in a DC circuit. A voltage drop develops as current passes through resistance: V = IR. Conductor resistance changes with temperature. A material's temperature coefficient determines the direction and rate; do not assume every material's resistance changes identically.

Worked example: 2 A through a 0.1-ohm wire path loses 0.2 V. Even a low resistance can cause a significant supply drop when current is large.
''')
topic('B-005-003', 'Power, continuity, open circuits and shorts', '''
Power is the rate of using or converting energy, measured in watts. For DC, P = VI: volts multiplied by amperes gives watts. A 100-W lamp uses energy faster than 40-, 50- or 60-W lamps. Energy over time is a different quantity: watt-hours = watts × hours.

A closed circuit has continuity: an unbroken conducting path. An open circuit interrupts that path, so the ideal battery/resistor circuit draws no current. A short circuit creates an unintended very-low-resistance path, which can draw excessive current and blow a fuse immediately.

A burning resistor is dissipating more power as heat than its construction can safely remove. A fuse protects against overcurrent; never solve an immediately blowing fuse by simply fitting a larger one. First locate the short or other fault.

Worked example: a 12-V load drawing 2 A consumes 24 W. If a fault reduces circuit resistance to nearly zero, current can rise far beyond 2 A; the normal load rating does not limit the fault current.
''')
topic('B-005-004', 'Ohm’s law with all three unknowns', '''
Ohm's law is V = IR. The bank sometimes writes E instead of V for voltage. Rearrange before calculating: I = V/R and R = V/I. Use volts, amperes and ohms; convert milliamperes into amperes first.

| Given | Calculation | Result |
| 0.5 A through 2 Ω | V = 0.5 × 2 | 1 V |
| 12 V and 0.25 A | R = 12/0.25 | 48 Ω |
| 9-V drop at 10 mA | R = 9/0.010 | 900 Ω |
| 0.44 A through 50 Ω | V = 0.44 × 50 | 22 V |
| 6 V across 30 Ω | I = 6/30 | 0.2 A |
| 200 mA through 25 Ω | V = 0.200 × 25 | 5 V |
| 3 V and 300 mA | R = 3/0.300 | 10 Ω |

Check direction: at fixed resistance, more voltage means more current. At fixed voltage, more resistance means less current. If your result contradicts that relationship, check the rearrangement or the units before choosing an answer.
''')
topic('B-005-005', 'Series and parallel resistor circuits', '''
In series, every resistor carries the same current and the resistances add: Rtotal = R1 + R2 + …. Thus five 10-ohm resistors make 50 ohms, and five 24-ohm resistors make 120 ohms. Total series resistance exceeds any individual positive resistor.

In parallel, each branch has the same voltage and branch currents add. Use 1/Rtotal = 1/R1 + 1/R2 + …. For n equal resistors of value R, Rtotal = R/n. Parallel resistance is below the smallest individual positive resistance. A branch drawing twice the current at the same voltage has half the resistance.

Worked examples: four 100-ohm parallel branches each draw 12/100 = 0.12 A at 12 V; total is 4 × 0.12 = 0.48 A, or 480 mA. Two 1000-ohm resistors at 12 V each draw 12 mA, so total is 24 mA. Four 68-ohm resistors in parallel make 68/4 = 17 ohms.

Avoid adding parallel resistances directly. The extra paths reduce the equivalent resistance, even though the number of components increases.
''')
topic('B-005-006', 'Resistor heating and load power calculations', '''
For a resistive DC load use P = VI = I²R = V²/R. A physically larger resistor of the same resistance can normally dissipate more heat; wattage rating is not another way of stating resistance. At a fixed resistance, doubling voltage makes four times the power because voltage is squared.

Two equal 1-W resistors can together dissipate 2 W when each shares the heat equally, in series or parallel. Two 100-ohm resistors in parallel replace 50 ohms while doubling the available power rating. Four 200-ohm, 2-W resistors in parallel make 50 ohms with 8 W of total rating, enough for a 5-W dummy load under the stated ideal sharing conditions.

Worked examples: 12 V × 5 A = 60 W minimum ideal transformer output; 12 V × 0.500 A = 6 W DC input; a 30-W lamp at 12 V takes 30/12 = 2.5 A. Two 10-ohm resistors in series at 10 V make 20 ohms: P = 10²/20 = 5 W total, 2.5 W in each equal resistor.

Practical designs need thermal margin, ventilation and appropriate RF construction; a calculated DC wattage alone does not prove a home-built load behaves well at RF.
''')
topic('B-005-007', 'AC cycles, phase, frequency and wavelength', '''
Frequency counts complete cycles per second, in hertz. A 60-Hz sine wave completes 60 cycles each second. Household AC is nominally sinusoidal; DC has a fixed polarity. Two same-frequency waves whose cycles occur at different times have a phase difference.

The approximate human audio range is 20 Hz–20 kHz. Amateur speech equipment commonly uses a narrower portion. HF is 3–30 MHz, so 7125 kHz = 7.125 MHz is HF. A harmonic is an integer multiple of a fundamental: 4 kHz is the second harmonic of 2 kHz.

Wavelength is the distance a wave travels during one complete cycle. In free space, λ = c/f, approximately λ(m) = 300/f(MHz). Increasing frequency reduces wavelength; decreasing wavelength implies increasing frequency. Period is the time per cycle, T = 1/f. At 1 kHz, T = 1 ms. Do not confuse a distance (wavelength) with a time (period).
''')
topic('B-005-008', 'Decibels, power ratios and signal reports', '''
A decibel expresses a ratio. For power, dB = 10 log10(Pout/Pin). Positive dB is gain; negative dB is loss. Memorize power steps: +3 dB is approximately ×2, +6 dB ×4, +9 dB ×8, +10 dB ×10. For a loss, divide by the same factor. Add dB values for cascaded gain/loss; do not add the linear power ratios.

Worked examples: 2 W with 9 dB gain becomes about 16 W. A 100-W signal with 6 dB line loss delivers about 25 W to the antenna. Increasing 5 W to 50 W is a ×10 ratio, or +10 dB.

For a calibrated report, reducing 200 W to 20 W removes 10 dB: S9+10 dB becomes S9. Reducing 150 W to 15 W changes S9+20 dB into S9+10 dB. Removing 30 dB from 100 W divides by 1000 and leaves 0.1 W. These examples assume unchanged paths and a properly calibrated receiver; actual S-meters and propagation vary.
''')
topic('B-005-013', 'Measuring voltage, current, resistance and RF power', '''
A voltmeter measures potential difference across a component, so connect it in parallel. Its high input resistance limits the current it draws from the circuit. An ammeter measures the current through a path, so insert it in series. Its very low resistance minimizes the added voltage drop.

A multimeter commonly measures voltage, current and resistance. Use a resistance range only on a de-energized circuit after safely removing stored energy; the meter supplies its own small test source. The proper instrument for final-amplifier DC current is an ammeter. For direct transmitter RF output-power measurement use an RF wattmeter and a suitable load/line arrangement, rather than assuming DC input equals RF output.

Accuracy means closeness to the true value, not how many digits the display has. Check the correct input jack, range and rating before connecting probes. In particular, placing an ammeter directly across a supply creates a short through the meter, which can damage it or cause injury.
''')

topic('B-004-001', 'Amplifier gain, efficiency and feedback', '''
An amplifier increases a signal's voltage, current or power by drawing energy from a supply. An RF amplifier handles radio-frequency signals; an audio amplifier handles microphone or speaker signals. A speech amplifier commonly processes roughly 300–3000 Hz, a narrower band than full human hearing.

Gain is the increase or output-to-input ratio, often expressed in dB. A label such as gain = 10 dB suggests amplification. Efficiency instead compares useful output power with DC supply input: efficiency = RF output/DC input × 100%. Gain and efficiency do not describe the same ratio.

A linear amplifier preserves the waveform shape. Driving it into non-linear operation causes distortion and additional unwanted frequency components. Excessive positive feedback can make the amplifier oscillate instead of merely amplifying its input. Energy is supplied by the DC source; an amplifier does not create power without an energy input.
''')
topic('B-004-002', 'Diodes: direction, detection, regulation and light', '''
A semiconductor diode has an anode and cathode. In forward bias it conducts readily in one direction; reverse bias normally blocks current within its ratings. Conventional current flows anode to cathode; electron flow is cathode to anode. Questions about electrons therefore require the reverse direction from conventional-current diagrams.

A series diode in a radio's positive supply lead can block a reverse-polarity connection. Rectification converts alternating current to pulsating direct current; smoothing requires additional filtering. Detection recovers information from an RF signal. A Zener diode operates in its specified reverse-breakdown region to maintain or regulate voltage. An LED emits light, with colour determined by its semiconductor materials.

Worked distinction: a diode connected to AC does not produce perfectly smooth DC by itself. It passes one polarity of the waveform. A following filter capacitor reduces the resulting ripple; a regulator can then stabilize the voltage.
''')
topic('B-004-003', 'Bipolar transistors as amplifiers and switches', '''
A bipolar junction transistor has collector, base and emitter electrodes. A small change at the base controls a larger collector/emitter current, allowing a low-level signal to be amplified with relatively low supply voltages. The base also controls the state when the device is used as a switch.

NPN and PNP are the two basic polarities. Their supply/bias polarities are reversed, so a PNP is not a direct replacement for an NPN in an unchanged circuit. A part described as a general-purpose audio NPN device is a bipolar transistor.

In cut-off the transistor is effectively off; in saturation it is strongly on. Alternating between those states makes a switch. For faithful signal amplification, use the appropriate linear operating region instead. Excessive heat is a common cause of failure, so voltage/current/power ratings and cooling all matter.
''')
topic('B-004-004', 'Field-effect transistors and high input impedance', '''
A field-effect transistor has source, gate and drain. Charge carriers enter its channel at the source and leave at the drain. The gate controls channel conduction. N-channel and P-channel describe the two basic channel polarities.

The gate needs very little steady current in the idealized high-impedance model used by these questions. In a reverse-biased junction FET, decreasing the reverse gate bias allows more channel current. That particular rule describes the depletion/JFET context, not a universal statement for every MOSFET operating mode. Real devices have leakage and capacitance; the bank's phrase gate never conducts current is an idealization.

For functional comparisons, the bipolar transistor's emitter corresponds to a FET's source, collector to drain, and base is the controlling terminal analogous to the gate. Source and drain connect to the ends of the channel. High input impedance means the controlling input does not heavily load the preceding circuit.
''')
topic('B-004-005', 'Vacuum triodes and their transistor analogies', '''
A triode contains a cathode, one control grid and a plate (anode) inside an evacuated envelope. The cathode emits electrons, the positively biased plate collects them, and the grid controls the flow. Output current flows between cathode and plate; the plate normally has the highest positive operating voltage.

Both triodes and transistors can amplify. A field-effect transistor is the closest analogy among the semiconductor choices because a control voltage at the gate/grid regulates current with high input impedance. A tube may be selected for a high-power application, but it also requires heating and can involve dangerous supply voltages and stored energy.

Memory aid: cathode emits, grid controls, plate collects. Triode means three active electrodes; the vacuum is the environment that allows electrons to travel through the device without ordinary gas conduction.
''')
topic('B-004-006', 'Resistor colour codes, tolerance and temperature', '''
A four-band resistor uses two significant digits, a power-of-ten multiplier and a tolerance band. The first three bands give resistance in ohms; the fourth gives percentage tolerance. Changing 33 Ω to 39 Ω changes the second digit band. Changing 120 Ω to 1200 Ω changes the multiplier, or third band.

| Digit | Colour | Digit | Colour |
| 0 | Black | 5 | Green |
| 1 | Brown | 6 | Blue |
| 2 | Red | 7 | Violet |
| 3 | Orange | 8 | Grey |
| 4 | Yellow | 9 | White |

Worked code: red, violet, yellow means 27 × 10⁴ = 270,000 Ω = 270 kΩ. A 100-ohm resistor with ±10% tolerance can be 90–110 ohms. A smaller tolerance percentage is more precise: 0.1% is tighter than 20%. Gold commonly denotes ±5%, silver ±10%, and no band ±20%.

Temperature coefficient specifies fractional resistance change per degree Celsius, often in ppm/°C. Its sign and magnitude determine how resistance changes as temperature rises; tolerance and temperature coefficient are different ratings.
''')
topic('B-005-009', 'Combining inductors and capacitors', '''
An inductor stores energy in a magnetic field; a capacitor stores energy in an electric field between separated conductors. Coil diameter, length and number of turns determine an air-core coil's inductance. Capacitor plate area and spacing affect capacitance: larger area increases it and larger separation decreases it, with the dielectric also important.

Uncoupled inductors combine like resistors: series values add, while parallel values combine reciprocally. Two equal series inductors give twice one value; two equal parallel inductors give half. Capacitors use the opposite pattern: parallel capacitances add and series capacitances combine reciprocally.

Worked examples: two 12-mH series chokes make 24 mH; two 20-mH parallel coils make 10 mH. Two 20-µF series capacitors make 10 µF; two 24-µF parallel capacitors make 48 µF. These simple coil rules assume negligible mutual magnetic coupling.

Polarized electrolytic capacitors must not have reverse voltage applied. Observe voltage ratings as well as polarity; disconnecting a supply does not guarantee that a capacitor has discharged.
''')
topic('B-005-010', 'Reactance, impedance, RF chokes and bypasses', '''
Reactance is frequency-dependent opposition to AC. For an inductor, XL = 2πfL, so inductive reactance increases with frequency. For a capacitor, XC = 1/(2πfC), so capacitive reactance decreases with frequency. Use hertz, henries and farads in these formulas. Impedance combines resistance and reactance and is the AC voltage/current ratio.

An RF choke passes DC or low-frequency signals relatively easily but presents high impedance to unwanted RF. Winding a cable on ferrite can raise its common-mode impedance at radio frequencies. A small bypass capacitor does the complementary job: it provides a low-reactance path for RF while having higher reactance at audio frequencies.

Worked comparison: doubling frequency doubles XL but halves XC. A component chosen to block RF need not block audio, and a capacitor chosen to shunt RF need not short out the desired speech signal. Real ferrites and capacitors have losses and frequency limits, so this model explains the principle rather than every real component at every frequency.
''')
topic('B-005-011', 'Induction and transformer ratios', '''
Current creates a magnetic field; in air, field strength around a conductor is proportional to current. Changing magnetic flux induces voltage. The largest induced voltage occurs at the greatest rate of change, not necessarily the greatest instantaneous current. Nearby parallel wires couple more strongly; steel is a suitable permanent-magnet material.

An ideal transformer's voltage ratio equals its turns ratio: Vs/Vp = Ns/Np. Current changes inversely so input power equals output power when losses are ignored: VpIp = VsIs. Impedance transforms by the square of the turns ratio. Actual core and copper losses produce heat, including warm iron laminations.

Worked examples: 250 turns to 500 turns steps 120 V up to 240 V. A 120-V primary drawing 0.5 A supplies 60 W, so a 12-V secondary supplies 5 A. A 250-W load at 120 V draws 250/120 ≈ 2.1 A. A 10-W, 5-V secondary supplies 2 A. With a 1:5 step-up ratio, 50 mA secondary current requires 250 mA primary current.
''')
topic('B-005-012', 'Series and parallel resonance', '''
An inductor and capacitor form a tuned circuit. At resonance their reactances have equal magnitudes and opposite signs: XL = XC. The ideal frequency is f = 1/(2π√LC). Increasing L or C lowers this frequency; reducing either raises it.

A series-resonant circuit has minimum impedance and maximum current at resonance, limited by its resistance. A parallel-resonant circuit has high input impedance at resonance. Do not swap the series and parallel answers. These effects let tuned circuits select desired receiver frequencies and implement filters.

Bandwidth is the range around resonance over which the circuit has its useful response. In the simplified exam model, adding resistance does not change the L/C-defined resonant frequency, but it does affect damping, response and bandwidth. Real circuit peak frequencies can shift with losses and loading.

Worked example: 10 µH and 100 pF give about 5.03 MHz. Doubling both components makes their product four times larger, so frequency halves to about 2.52 MHz. Try these relationships in the LC resonance lab, then compare them with the antenna lab's matching network.
''')

topic('B-003-001', 'The complete HF station and accessory order', '''
An HF transmitter delivers RF through accessories to the feedline and antenna. A low-pass filter suppresses harmonics and belongs close to the last RF power-producing stage: the transceiver output when there is no external amplifier, or the external amplifier output when one is used.

The study station places the SWR meter after the low-pass filter so it can measure the antenna system's impedance match. An antenna switch selects an antenna or a dummy load. A dummy load turns RF into heat with minimal radiation, allowing tests without using the antenna. An antenna tuner transforms a mismatched antenna-system impedance to a suitable load for the transmitter.

Example signal order: transmitter, optional external amplifier, low-pass filter, SWR meter, tuner as required, antenna switch/load arrangement, feedline and antenna. Real installations can use other instrument positions for a particular measurement; learn what load the instrument sees. A modern solid-state final normally needs no manual plate tuning, but its antenna tuner may need adjustment after a frequency change.
''')
topic('B-003-002', 'Follow a signal through an FM transmitter', '''
The microphone converts air-pressure changes into a small electrical audio signal. A speech amplifier raises its level. The FM modulator uses that audio to vary an oscillator's instantaneous frequency. This distinguishes the oscillator path from the ordinary AM/CW examples: the modulation acts on frequency.

A frequency multiplier produces a useful harmonic, bringing the oscillator signal to the required carrier frequency. It also multiplies the deviation, which must be considered in a real design. The power amplifier raises RF power for the antenna and normally draws the most electrical power of the transmitter stages.

| Stage | Main job |
| Microphone | Sound pressure to electrical audio |
| Speech amplifier | Increase microphone signal level |
| Modulator/oscillator | Produce frequency variation |
| Frequency multiplier | Produce the needed RF harmonic |
| Power amplifier | Supply transmitted RF power |

Trace the information separately from the power supply: the microphone controls the modulation, while most transmitted energy comes from the DC supply through the power amplifier.
''')
topic('B-003-003', 'Superheterodyne FM reception, one block at a time', '''
A superheterodyne receiver converts different received frequencies to a fixed intermediate frequency (IF). Its RF amplifier is the front end and should add very little noise, especially on VHF. A tunable local oscillator sets the selected receive frequency; the mixer combines that oscillator with the incoming signal to produce the IF.

The IF filter rejects adjacent channels, providing selectivity. The IF amplifier supplies most of the required signal level before detection. An FM limiter removes unwanted amplitude variations; the discriminator recovers the audio from frequency variation. The AF amplifier drives the speaker. Volume and the muting action of squelch are associated with the audio stage in the bank's block diagram.

Memory route: RF amplifier → mixer/local oscillator → IF filter/amplifier → limiter → discriminator → AF amplifier/speaker. A mixer changes frequency; a filter selects frequencies; an amplifier changes signal level; a detector recovers information. Knowing those four verbs makes most block questions easier than memorizing a drawing's positions.
''')
topic('B-003-004', 'The basic three-stage CW transmitter', '''
The simplest CW transmitter has an RF oscillator, a driver/buffer and a power amplifier. In the basic diagram the oscillator is at the transmitted frequency. Every stage receives DC electrical power; the signal between RF stages is not the same thing as its supply connection.

The buffer isolates the oscillator from changing loads. Without isolation, a changing amplifier/antenna load could pull the oscillator's frequency. The power amplifier increases output power. The Morse key turns the carrier on and off, thereby controlling its amplitude and the timing of dits and dahs.

Worked distinction: changing the oscillator frequency tunes the station; closing the key does not normally tune it. Keying changes whether the carrier is present. Controlled rise and fall times prevent abrupt switching from producing broad key-click interference.
''')
topic('B-003-005', 'SSB/CW receiver blocks and the BFO', '''
The antenna converts an electromagnetic wave into an electrical signal. The RF amplifier helps sensitivity. A mixer and local oscillator convert the selected RF signal to the IF. The IF filter provides most selectivity and the IF amplifier most gain in the simplified receiver model.

SSB lacks a full carrier, and keyed CW needs an audible beat note. A beat frequency oscillator (BFO) supplies a local reference to the product detector. Mixing the BFO with the IF lets the detector recover transmitted modulation or create the CW audio tone. The AF amplifier raises that recovered audio to drive the speaker; an audio band-pass filter can be included in that stage.

| Block | Do not confuse its job with |
| Mixer | RF gain; it performs frequency conversion |
| IF filter | Amplification; it selects the wanted band |
| Product detector/BFO | An AM envelope detector alone |
| AF amplifier | Selecting the incoming RF frequency |

Follow both the incoming-signal arrow and the local-oscillator/BFO arrows when studying a diagram. An oscillator supplies a locally generated signal rather than taking its output from the antenna.
''')
topic('B-003-006', 'Building an SSB signal and moving it to RF', '''
The microphone's small signal needs a speech amplifier. A fixed RF oscillator supplies a carrier to the balanced modulator, which combines carrier and audio while suppressing the carrier. Its immediate output has two sidebands. A following filter removes the unwanted sideband; it operates near the fixed oscillator frequency.

A mixer driven by a variable frequency oscillator (VFO) translates the already formed SSB signal to the operating band. Adjusting the VFO changes the final transmit frequency. The balanced modulator first moves the message from audio to radio frequencies; the later mixer moves that RF signal to the selected final frequency.

The final RF amplifier supplies output power and commonly includes excessive-SWR protection. It must preserve the SSB envelope linearly. The filter after the balanced modulator is not the same filter as the transmitter's output low-pass harmonic filter: one removes an unwanted sideband, the other unwanted higher-frequency RF products.
''')
topic('B-003-007', 'Computer sound-card interfaces', '''
A sound-card interface converts received analog audio into digital samples for the computer and converts computer-generated digital samples into transmit audio. It couples the transceiver's audio-frequency paths to the software; it does not need to digitize the RF signal directly in this arrangement.

Most such interfaces also provide push-to-talk control, changing the transceiver between receive and transmit. Isolation transformers break unwanted ground-current paths between computer and radio, helping prevent hum and interference. Proper signal levels and isolation matter as much as choosing the software mode.

Some transceivers include an audio codec and present an integrated computer audio connection, removing the need for a separate external sound card. Do not confuse a computer's Universal Serial Bus connection with the radio modulation abbreviation USB, meaning upper sideband. The always-available glossary explains both meanings.
''')
topic('B-003-008', 'Linear power-supply stages', '''
A conventional linear supply follows transformer, rectifier, filter, regulator. The transformer changes mains AC voltage and supplies isolation. The rectifier changes AC into pulsating DC. The filter smooths that DC, and the regulator holds the output approximately constant as input or load varies.

Overvoltage protection monitors the regulated output, where an excessive voltage could damage the transceiver. The regulator often dissipates significant heat and requires a heat sink: the voltage it drops multiplied by current becomes heat.

Worked example: a regulator dropping 5 V while supplying 3 A dissipates about 15 W, even though the output voltage is correct. A large filter capacitor reduces ripple but stores energy after disconnection. A rectifier alone is not a regulator, and a regulator is not the mains-isolation transformer.
''')
topic('B-003-010', 'Sensitivity, selectivity, dynamic range and tuning', '''
Sensitivity states how small an RF input gives a specified signal-to-noise ratio. Selectivity describes rejection of nearby unwanted frequencies. Dynamic range describes handling weak and strong signals without overload/distortion. AGC automatically adjusts gain to reduce changes in audio level as signal strength varies.

Use a filter wide enough for the wanted information but no wider than needed: the bank's SSB choice is 2.4 kHz, while 250 Hz is useful for CW with strong nearby interference. A 750–850 Hz audio passband covers a narrow CW tone. Excessively narrow filters remove wanted information. Typical bandwidth order is CW, SSB voice, then FM voice, from narrowest to widest.

SSB needs accurate tuning, within about 100 Hz in the question, or voice pitch becomes unnatural. A waterfall shows frequency and amplitude (often brightness/colour), with time represented as the image scrolls.

Worked mixer example: with a high-side local oscillator and a 455-kHz IF, receiving 3.540 MHz needs 3.540 + 0.455 = 3.995 MHz at the oscillator. Use the stated oscillator side; low-side conversion would subtract instead.
''')
topic('B-003-014', 'Keyers, VOX, speech processing and noise controls', '''
An electronic keyer controls dit/dah timing so a paddle can produce correctly formed Morse characters. A dynamic microphone works on a moving-coil principle similar to a loudspeaker. Adjust microphone gain for the transceiver, rather than assuming every microphone supplies the same level.

VOX starts transmission when microphone audio crosses its threshold. Transmit/receive switching lets one antenna serve both receiving and transmitting, while isolating/protecting the receiver appropriately. Correctly adjusted SSB speech processing increases average transmitted power and intelligibility without increasing the allowed peak envelope power; too much processing causes distortion.

Noise blanking targets short, high-amplitude impulses, such as ignition pulses. DSP noise reduction analyzes signal/noise characteristics to reduce noise more generally. They are different tools: a blanker is not the first choice for every steady hiss, and aggressive noise reduction can also affect wanted audio.
''')
topic('B-003-016', 'Battery voltage, capacity and combinations', '''
A battery provides DC electromotive force with positive and negative terminals. A conventional starter battery is nominally 12 V. Rechargeable or storage batteries, including NiMH and lithium-ion types, can be repeatedly charged using the correct system. Lithium-based batteries offer high capacity per kilogram compared with lead-acid types.

Internal resistance makes terminal voltage fall when current is drawn: voltage drop = current × internal resistance. Ampere-hours describe capacity at specified discharge conditions. Drawing more than the specified current can discharge the battery faster than a simple ideal time estimate suggests.

Two matching 12-V, 20-Ah batteries in parallel give 12 V and 40 Ah. In series they give 24 V and 20 Ah. Series adds voltage; parallel adds capacity. These examples assume suitable matching and connection/protection arrangements. Never short-circuit a lithium-ion battery; its energy and fault current can cause severe heating or fire. A battery's low nominal voltage does not mean its short-circuit current is harmless.
''')
topic('B-003-017', 'Choosing supplies, fuses and DC wiring', '''
A power supply converts household AC to the DC required by the transceiver. Canadian homes nominally receive 120/240 V. For a 13.8-V radio supply, adequate output-current capability is critical, particularly on transmit. Linear supplies often present less RF-noise risk; switching supplies are generally smaller, lighter and more efficient, but need effective interference suppression.

Heavy-gauge DC leads reduce voltage drop and heating. Fuse the battery feed close to the battery so the wiring is protected if it shorts along its route. Fuses protect against overcurrent/fire; do not bypass one because a radio appears to work without it.

Worked wiring example: a battery 3 m away requires about 6 m of outgoing-and-return conductor. At 22 A, number-10 wire specified at 0.07 V per metre loses 6 × 0.07 = 0.42 V, below the stated 0.5-V limit. Forgetting the return conductor would underestimate the loss.

Poorly regulated supply voltage can cause CW chirp. A loud low-frequency transmitted hum points first to the power supply and its ripple/filtering. Choose supplies for clean voltage under real transmit load, not just a correct no-load reading.
''')

topic('B-003-011', 'CW, AM, frequency stability and waste heat', '''
CW Morse is an interrupted RF carrier. Chirp is a small unwanted frequency change as each dit or dah begins/ends, often due to supply voltage varying with keying load. A steady supply and a mechanically/electrically stable oscillator prevent unwanted chirp and drift. A VFO allows tuning beyond the set of frequencies supplied by individual crystals.

AM varies the RF envelope amplitude with the modulating audio. Conventional AM contains a carrier and both sidebands. Its occupied bandwidth is approximately twice the highest modulating-audio frequency. Thus speech extending to 3 kHz produces about 6 kHz total AM bandwidth.

An amplifier converts only part of its DC input into useful RF output. The rest becomes heat. Worked example: with 200 W DC input and 125 W RF output, 200−125 = 75 W is dissipated as heat, and efficiency is 125/200 × 100% = 62.5%. Do not confuse DC input, RF output, gain and efficiency.
''')
topic('B-003-012', 'SSB generation, PEP, ALC and sideband arithmetic', '''
SSB voice transmits one sideband with the carrier suppressed. Typical occupied bandwidth is 2–3 kHz. Suppressing the carrier lets more output power serve the information-bearing sidebands. A balanced modulator suppresses the carrier and initially passes both sidebands; the following filter selects one.

The RF power amplifier must be linear to preserve the voice envelope. Excessive microphone gain or processing causes clipping, distortion, extra bandwidth and splatter onto adjacent contacts. Adjust gain so voice peaks stay within the maker's recommended ALC-meter range. ALC limits drive to avoid overdriving the transmitter; it is not a target to maximize at any cost.

Peak envelope power is the average RF power over one RF cycle at the envelope's crest. It is not long-term average speech power. For a single audio tone, USB places RF above the suppressed carrier by the audio frequency; LSB places it below. Worked example: 7100 kHz LSB with a 1000-Hz (=1-kHz) tone produces RF at 7100−1 = 7099 kHz.
''')
topic('B-003-013', 'FM deviation, NFM, capture and occupied width', '''
FM conveys information by changing instantaneous carrier frequency. Deviation is the maximum departure from the unmodulated carrier frequency. More audio drive gives larger deviation, not simply more RF amplitude. Phase modulation is closely related. If the microphone fails, an FM transmitter can still send an unmodulated carrier.

Conventional amateur FM with ±5-kHz deviation occupies roughly 10–20 kHz. Carson's approximate rule gives bandwidth ≈ 2(deviation + highest audio frequency): with 5-kHz deviation and 3-kHz audio this is about 16 kHz. Using 2.5-kHz narrow-FM deviation into a 5-kHz-deviation repeater produces quieter audio. Match the receiver/repeater's expected wide/narrow setting; shouting can overdeviate and distort.

An FM receiver's high gain creates loud noise without a signal, hence squelch. FM capture means it tends to recover the strongest of multiple co-channel signals. FM is useful for local VHF/UHF voice, but ordinary voice FM below 28 MHz exceeds the permitted bandwidth in the bank's HF examples.
''')
topic('B-003-015', 'Digital modes, packet networks and clean audio', '''
Digital information uses discrete agreed values, unlike a continuously varying analog quantity. Voice and images can be digitized too. A sound-card mode converts symbols to/from audio for an SSB transceiver; its digital nature does not imply encryption or secrecy.

A digipeater receives packets and retransmits ones marked for forwarding. A packet network links stations for messaging over longer distances. Automatic repeat request (ARQ) detects problems and requests retransmission, providing error recovery/correction at the protocol level. Reliable messaging means confirmed delivery or a failure notification; it does not guarantee that a broken radio path always succeeds.

FT8 occupies a small fraction of one SSB voice channel, allowing many simultaneous contacts and reception at very low signal-to-noise ratios when measured in a 2500-Hz reference bandwidth. The bank's RTTY spacing example is 250–500 Hz centre to centre.

Excess sound-card audio overdrives the transmitter and produces splatter/out-of-channel emissions. Set audio levels conservatively with the appropriate meters, and ask a nearby station to verify a clean transmitted spectrum/signal. A successful decode does not prove a signal is free from unwanted emissions.
''')

topic('B-003-009', 'Recognize the parts of a three-element Yagi', '''
A three-element Yagi uses a driven element connected to the feedline, a slightly longer reflector behind it, and a slightly shorter director in front. The forward beam is toward the director, away from the reflector. The unconnected elements are energized by coupling from the driven element.

The boom holds the elements in their relative positions; its primary role in this question is mechanical support. The reflector is the longest of the three radiating elements; the director is the shortest. Do not identify the boom as the feedline-connected element merely because it runs through the centre of a drawing.

Worked recognition: locate the feedline attachment first to find the driven element. Compare the two other lengths to identify rear and front. This gives both the element names and the approximate forward beam direction without relying on the drawing being oriented left-to-right.
''')
topic('B-006-007', 'Polarization and the isotropic reference', '''
Polarization is the orientation of the electromagnetic wave's electric field, not its direction of travel or the magnetic-field orientation. Horizontal polarization has its electric field parallel to the Earth's surface; vertical polarization has it perpendicular. A straight dipole or Yagi generally has polarization parallel to its radiating elements.

A vertical mobile whip is best received with a similarly vertical antenna, such as a vertical ground plane. Rotating one end to horizontal can introduce a severe polarization mismatch. A ground wave leaving vertically polarized normally remains vertical. Ionospheric propagation can rotate polarization, which is why HF sky-wave behaviour differs from simple local VHF paths.

An isotropic radiator is a hypothetical point source radiating equally in every direction. Its three-dimensional pattern is a sphere. Real antenna gain quoted in dBi uses this ideal reference, not a physical isotropic antenna you can install.
''')
topic('B-006-008', 'Wavelength, wire length, loading and traps', '''
Radio waves in free space travel at approximately 300,000 km/s, the speed of light. Wavelength in metres is approximately 300 divided by frequency in MHz. Thus 25 MHz has a 12-m wavelength and 2 MHz a 150-m wavelength.

Lengthening a simple wire antenna lowers its fundamental resonant frequency; shortening it raises the frequency. To move a dipole from 3900 to 3600 kHz, lengthen it. To move from 3600 to 3900 kHz, shorten it. End insulators stop the support structure from extending the intended electrical length.

A series loading inductor can electrically lengthen a physically short antenna and lower its resonant frequency. A trap is a parallel coil-and-capacitor resonant circuit built into an antenna. At its tuned frequency its high impedance can isolate part of the element, enabling multiband use.

Try this before a calculation: predict which way the resonance must move, then change length in the antenna lab. An impedance match from a tuner is a separate issue; changing the match does not automatically make the wire's natural resonance move.
''')
topic('B-006-009', 'Radiation patterns, gain and bandwidth', '''
A half-wave dipole in free space radiates most strongly broadside to the wire, with nulls along its ends. Its three-dimensional pattern resembles a torus around the wire. Antenna gain compares signal concentration in a direction with a reference, not energy created by the antenna.

A half-wave dipole has about 2.1 dB gain over isotropic. Therefore gain in dBd is approximately dBi minus 2.1: a 4.1-dBi antenna has about 2.0 dBd. The i stands for isotropic. Quote the reference when comparing antenna specifications.

Parasitic elements receive energy by induction/radiation from the driven element and reshape its pattern. Add a shorter director and the main radiation favours the new element's direction. Add a longer reflector and the radiation favours the direction away from it. Useful antenna bandwidth is the range over which performance remains acceptable; more gain does not automatically mean more bandwidth.
''')
topic('B-006-010', 'Vertical antennas, ground planes and loading coils', '''
A quarter-wave vertical uses a conducting ground plane or radial system as the other part of its antenna system. It radiates approximately equally around the horizon and is vertically polarized. A roof-mounted mobile whip uses the vehicle body as its ground-plane structure.

For the HF quarter-wave wire approximation in this bank, length(m) = 71.3/f(MHz). At 21.125 MHz this is 71.3/21.125 ≈ 3.37 m. For the bank's simple half-wave vertical at 223 MHz, use the approximate free-space half wavelength, 150/223 ≈ 0.67 m, or 67 cm. Identify which approximation the problem requests.

Downward-sloping quarter-wave radials raise a ground plane's feedpoint resistance toward 50 ohms, making 50-ohm coax a convenient match. Ground-mounted HF verticals benefit from radials to reduce loss in the soil. A loading coil in series with a short mobile whip cancels its capacitive reactance, allowing a 2-m physical whip to resonate on 80 metres; this does not make its efficiency equal to a full-size antenna.

A properly designed five-eighths-wave VHF/UHF vertical can provide more useful low-angle gain than a quarter wave. The matching arrangement remains important.
''')
topic('B-006-011', 'Yagi dimensions, front-to-back ratio and stacking', '''
Yagis concentrate radiation in a forward direction using a driven element, reflector and directors. Front-to-back ratio compares forward radiated power with power in the opposite direction. Increasing the boom length, adding directors and optimizing spacing can increase gain. Shorter HF wavelengths make rotatable high-gain antennas practical on 20–10 metres.

| Exam length approximation | Worked result |
| Driven element ≈ 143/f(MHz) metres | 143/14.0 = 10.21 m |
| Director ≈ 136/f(MHz) metres | 136/21.1 ≈ 6.44 m |
| Reflector ≈ 150/f(MHz) metres | 150/28.1 ≈ 5.34 m |

For a three-element Yagi, about 0.20 wavelength spacing is the bank's gain/front-to-back compromise. Thicker elements can broaden bandwidth. Element traps allow a single structure to operate on several bands. Ideal stacking of two identical properly fed antennas adds about 3 dB, so two 10-dBi Yagis can provide about 13 dBi. Actual gain depends on spacing, phase, feed losses and the physical environment.
''')
topic('B-006-012', 'Dipoles, end-fed wires and practical patterns', '''
For an HF half-wave wire dipole, the bank uses approximately length(m) = 143/f(MHz), measured tip-to-tip. Each equal leg is half the total. At 28.150 MHz, total length is 143/28.150 ≈ 5.08 m. At 3.75 MHz it is 143/3.75 ≈ 38.13 m. Begin slightly long in practical work and trim both legs symmetrically after measuring.

An isolated half-wave dipole has about 73 ohms feed resistance and a toroidal free-space pattern. A horizontal north–south dipole radiates strongest east/west, broadside to the wire. Ground, height and nearby conductors modify both impedance and pattern.

An end-fed half-wave antenna can operate on several harmonically related bands but presents high feedpoint impedance and needs suitable matching/common-mode control. A random wire can cause RF feedback in the station. Traps make multiband use convenient, but an antenna that also accepts harmonic frequencies can radiate transmitter harmonics more readily, so the transmitter still needs clean output filtering.
''')
topic('B-006-013', 'Quad and delta loops: perimeter and polarization', '''
A quad uses two or more approximately full-wave square loops as driven/parasitic elements. A delta-loop array uses approximately full-wave triangular loops. The total loop perimeter—not one side—is about one wavelength. Each square side is about one quarter of the perimeter and each triangular side about one third when equilateral.

For these wire-loop exam examples use approximately perimeter(m) = 306/f(MHz). At 21.4 MHz a quad driven loop is 14.30 m; at 14.3 MHz it is 21.40 m. A delta loop at 28.7 MHz is 10.66 m total, and a horizontal loop at 7.15 MHz is 42.80 m total. These practical wire approximations differ slightly from the 300/f free-space wavelength calculation.

Feeding a quad at the centre of a horizontal side gives horizontal polarization; moving the feedpoint to a vertical side changes it to vertical. Feed the centre of the bottom horizontal element of the described delta loop for horizontal polarization. Large loops can be more susceptible to weather damage than comparable Yagis because of their supporting geometry and wire structures.
''')

topic('B-006-001', 'Characteristic impedance and velocity factor', '''
A transmission line connects a transceiver to its antenna. Characteristic impedance is a property of the conductors' geometry and the dielectric between them. In coax it depends on the ratio of conductor diameters as well as dielectric properties; different outside sizes can therefore share the same nominal 50-ohm impedance.

Cutting a 20-m, 52-ohm cable to 10 m does not make its characteristic impedance 26 ohms: it remains 52 ohms. Length changes loss and electrical phase, not that basic line property. A purely resistive 50-ohm termination absorbs the incident energy in an ideal 50-ohm line with no reflected wave.

Velocity factor is signal propagation speed in the cable divided by free-space light speed and is strongly affected by dielectric material. It matters when cutting electrical quarter/half wavelengths. In open-wire line, conductor diameter and spacing affect impedance. Coax shielding permits flexible routing, including a suitably rated cable being buried; ordinary open-wire line is affected strongly by nearby ground and conductors.
''')
topic('B-006-002', 'Balanced lines, coax and baluns', '''
A balanced transmission line has two similar conductors carrying equal and opposite signal currents. Open-wire line uses insulated spreaders to maintain spacing; window or ladder line holds the conductors with a partly open insulating web. Such lines must be kept suitably clear of nearby metal and lossy material.

Coax is unbalanced: a centre conductor is surrounded by a shield. The desired RF current flows on the inner surface of the shield, while unwanted common-mode current may flow outside it. Its shielding makes coax easier to route in many station installations.

A balun provides a balanced-to-unbalanced transition. Use one when connecting coax to window line or an unbalanced-output tuner to a balanced feedline. A balun can also be designed to transform impedance, but the name by itself does not specify a transformation ratio. A 1:1 current balun mainly suppresses unwanted common-mode current rather than changing 50 ohms into a different nominal impedance.
''')
topic('B-006-003', 'Feedline construction, connectors and weather', '''
Coax works near metal fences and in icing conditions more predictably than exposed parallel lines. A solid outer shield gives the best shielding among the bank's choices. Foam dielectric can reduce cable loss; solid dielectric is more resistant to centre-conductor movement when tightly wound into a ferrite choke, reducing the risk of a short.

| Connector | Common application in the bank |
| PL-259 | RG-213 and many HF transceiver connections |
| SMA | Modern handheld radio antennas |
| N | RF connector designed for moisture resistance |
| BNC | Low-power radios and test instruments |

Keep connectors clean and tight to minimize contact resistance. Use suitable weatherproofing even when a connector is designed to resist moisture. A corroded or intermittent connector can add loss, generate interference and produce erratic SWR readings. Mechanical compatibility alone does not establish the connector's frequency/power capability.
''')
topic('B-006-004', 'Transmission-line loss and good cable choices', '''
Feedline loss generally increases with both length and frequency. It is usually quoted in dB per unit length at a stated frequency. Longer cable introduces more attenuation; a cable acceptable at HF can waste excessive power at 70 cm. Small RG-58 typically loses more than larger RG-213 under comparable conditions.

Shorten unnecessary excess cable rather than coiling it and assuming it is lossless. If the antennas are 15 m apart but the feedline is 60 m, a shorter practical route reduces loss. Doubling cable length doubles its attenuation in dB; this is the bank's 100% increase in line loss, not a claim that a fixed percentage of the original watts must simply double.

Open-wire line can have very low HF loss and tolerate high SWR without the excessive losses of a comparable lossy coax run, provided it is installed appropriately. Its low loss comes with routing/balance considerations. Choose the complete line system for frequency, length, installation and mismatch, not only purchase price or nominal impedance.
''')
topic('B-006-005', 'Read and diagnose SWR correctly', '''
Standing waves arise when incident and reflected waves combine because the antenna/load impedance differs from the line's characteristic impedance. An SWR of 1:1 means a match at the measurement point; under 1.5:1 is a fairly good match in the bank. An SWR meter senses forward and reflected quantities; the question specifically names forward and reflected voltage.

An open or short can produce high SWR. An intermittent connector can make the reading jump unpredictably. High mismatch increases transmission-line losses and can trigger transmitter protection. An antenna analyzer sweeps frequency to help locate SWR minima and guide adjustment of physical antenna length.

Lossy feedline attenuates reflected energy as it returns, so a station-end SWR can look lower than the SWR at the antenna. A good displayed value is not proof of high antenna efficiency. Calibrate an analyzer/NanoVNA at the intended measurement plane and account for any intervening line.

For a purely resistive load, SWR is the larger of Rload/Z0 and Z0/Rload: 100 ohms or 25 ohms on a 50-ohm line both give 2:1. Reactive loads need the full reflection-coefficient calculation.
''')
topic('B-006-006', 'Matching, tuners and the antenna lab', '''
An antenna tuner uses inductive/capacitive reactance to transform the antenna system's impedance into a load the transmitter can drive. Excessive mismatch makes modern solid-state radios reduce power; a tuner can restore a suitable transmitter-side match. It does not by itself remove feedline loss or move the wire's natural resonance.

For purely resistive source and load in the simplified matching question, matching their impedances maximizes delivery. Locating matching at the feedline–antenna junction keeps the line better matched and can reduce its losses compared with a tuner only at the radio.

A transformer can match a high-impedance EFHW to coax over a useful bandwidth. A 300-ohm folded dipole to 50-ohm line needs a 300/50 = 6:1 impedance transformation. Its turns ratio would be √6:1, not 6:1, because impedance transforms as turns ratio squared. Properly matched line length does not change the match, although it still changes loss and phase.

Lab procedure: bypass the LC network, vary wire length and watch the bare-antenna SWR dip move. Then detune the wire and use L/C matching. Compare bare SWR with the radio-side SWR; a low radio-side value while bare SWR stays high demonstrates matching rather than physical retuning. Try a series inductor on a short capacitive antenna, then examine how a shunt element completes the impedance transformation.
''')

topic('B-007-001', 'Ground wave, line of sight, sky wave and NVIS', '''
Nearby VHF stations usually communicate by line-of-sight paths. The radio horizon extends beyond the visible horizon because normal tropospheric refraction bends radio waves slightly. Ground wave follows the Earth's surface and generally reaches farther at lower frequencies; among 160–6 metres, 160 metres offers the greatest ground-wave reach.

Sky wave returns from the ionosphere, enabling HF contacts thousands of kilometres away. NVIS, near-vertical-incidence sky wave, sends HF energy steeply upward and back down to support medium-range communication, particularly over difficult terrain or within ordinary low-angle skip distances.

The bank associates lower-HF daytime paths out to about 200 km with ground wave and paths beyond 4000 km with ionospheric propagation. Actual range depends on frequency, ground conductivity, antennas and conditions. Do not call every non-visible HF path line of sight, or every short regional HF contact a ground-wave path; NVIS can also provide regional coverage.
''')
topic('B-007-002', 'The ionosphere’s D, E, F1 and F2 regions', '''
Solar radiation, especially ultraviolet, ionizes the upper atmosphere. From lowest to highest the important regions are D, E and F. The F region commonly separates into F1 and F2 during daylight. Ionization is broadly greatest around midday and least shortly before dawn in the simplified daily pattern used by the exam.

The D region is closest to Earth and is primarily an absorber of lower-frequency HF energy rather than a useful long-distance refractor. Its daytime absorption limits distant 160/80-metre contacts. The E region lies below F. The high F2 region supports the longest normal single-hop paths because of its height and ionization.

Nightfall reduces D-region absorption and changes F-region conditions, so the bands that worked at noon may not be the best after dark. Remember which property is being asked: a region's height, its ionization level and its absorption role are related but not identical.
''')
topic('B-007-003', 'Skip distance, skip zones and multiple hops', '''
Skip distance is the shortest ground distance at which a particular sky-wave path returns to Earth. A skip zone lies beyond useful ground-wave coverage but before that first sky-wave return. The returning wave is bent by ionospheric refraction, even though introductory descriptions sometimes call it reflection.

For a fixed ionospheric height, a lower launch angle gives a longer hop; a higher launch angle gives a shorter hop. Increasing the region height lengthens the possible hop. A normal maximum F2 hop is roughly 4000 km; an E-region hop roughly 2000 km in the bank.

A 5000-km HF path therefore commonly needs multiple hops. After a wave returns to Earth, surface reflection can launch the next ionospheric hop. Real paths include loss at each encounter, absorption and changing region heights. Geometry explains why a low-angle DX antenna and an NVIS regional antenna serve different purposes.
''')
topic('B-007-004', 'Absorption, multipath and selective fading', '''
Daytime D-region absorption weakens distant low-HF and AM-broadcast sky waves. At night that absorption usually falls. During a sudden ionospheric disturbance, trying a higher HF band can help because lower frequencies may be absorbed more strongly, provided a usable refracted path still exists.

Signals can reach a receiver by several paths. Their phases can reinforce or cancel, causing fading as the paths change. This can occur through one-hop versus two-hop HF paths or urban VHF reflections: moving a handheld less than a metre may move out of a cancellation point.

Selective fading affects different parts of a signal's spectrum differently, distorting wide signals more noticeably. Multipath can produce both varying strength and phase distortion. Ionospheric refraction/Faraday rotation and reflections can change polarization, so matching polarization is often less critical for HF sky wave than for a local direct VHF path. It remains crucial for ordinary vertically polarized mobile/repeater communication.
''')
topic('B-007-005', 'The Sun, sunspots and the solar-flux index', '''
Solar electromagnetic and particle radiation influence propagation throughout the spectrum, especially ionospheric paths beyond ground-wave/line-of-sight range. More sunspot activity generally increases ionization, allowing higher frequencies to be refracted back to Earth. The average sunspot cycle lasts about 11 years.

Solar flux is radio-frequency energy emitted by the Sun; a solar-flux index measures solar activity at a specified observing frequency. It is an indicator of solar conditions, not a direct measurement of the signal from your amateur station.

At high sunspot levels, long-distance ionospheric paths can extend to 40 MHz or higher. Solar activity also causes disturbances that can degrade communication. Do not assume more activity guarantees a better path at every instant. The cycle explains broad trends; daily illumination, disturbances, season and path geometry determine whether a specific contact works now.
''')
topic('B-007-006', 'Critical frequency, MUF and the working window', '''
Critical frequency is the highest frequency a region returns for a vertically incident test signal at that time. Maximum usable frequency (MUF) is the highest frequency that supports a particular oblique path to a destination. An inclined path can work above the local vertical critical frequency because its geometry differs.

MUF varies with solar ionization; increased daily ultraviolet radiation generally raises it. Frequencies within the supported sky-wave range can return to Earth, while frequencies above the path's MUF tend to pass through. The optimum working frequency is usually slightly below MUF, leaving operating margin. Hearing 10-metre beacons is a practical indication that a 28-MHz path may be open.

The 20-metre band can support worldwide daylight propagation at any part of the solar cycle, while 160 and 80 metres are particularly difficult for distant summer-daytime communication because of absorption. This is a tendency, not a guarantee: use beacons, forecasts and actual received signals alongside these basic relationships.
''')
topic('B-007-007', 'Sporadic E, tropospheric enhancement and aurora', '''
Sporadic E consists of dense patches of E-region ionization and is especially associated with extended 6-metre contacts. It is a different mechanism from the normal high-F-region paths used for much HF DX.

Tropospheric refraction bends VHF waves around the Earth's curvature. A temperature inversion can form a duct that carries signals much farther than ordinary paths. In the bank, normal VHF tropospheric range is approximated as 800 km and propagation over that distance points to ducting. Actual everyday station range is often much shorter; those exam figures are not a promise for a handheld.

Auroral propagation scatters signals from disturbed ionization at E-region heights. In the northern hemisphere, point toward the north to exploit the auroral region. It often distorts analog signals; CW remains more readable than voice because the timing of its carrier interruptions can survive that distortion.
''')
topic('B-007-008', 'Scatter into the skip zone and meteor trails', '''
Scattering redirects a small part of radio energy in many directions. HF scatter can make a weak, distorted signal audible in the nominal skip zone, especially near the MUF, where neither direct ground wave nor the main refracted sky-wave path would explain reception.

Scattered signals are weak because only a small fraction of the total energy reaches the unexpected direction. Many paths and phase differences can distort them. Tropospheric scatter on VHF/UHF uses small changes in the lower atmosphere's density and water-vapour properties to support paths beyond the ordinary radio horizon.

Meteor scatter uses the ionized trails left by meteors. The bank emphasizes about 30–100 MHz, particularly 6 metres. Distinguish meteor trails, sporadic-E patches, a weather-driven tropospheric duct and an HF skip-zone scatter path; they involve different regions or structures even though all can extend communication beyond a direct path.
''')

topic('B-001-010', 'Harmful interference, shared spectrum and priority', '''
Harmful interference seriously degrades, obstructs or repeatedly interrupts a radiocommunication service. Deliberate interference is not acceptable in ordinary amateur operation. Both amateurs wanting the same frequency have equal rights; neither owns it because of regular use or a scheduled net.

Secondary amateur allocations must protect the primary services. The bank's examples include protecting other services on 430–450 MHz and accepting the lack of protection from other services in 902–928 MHz, where licence-exempt devices may also be common. A listed amateur allocation does not necessarily have exclusive amateur use.

Tests are allowed only when they do not cause interference. If ISED determines that a station causes harmful interference, the Minister can order its operation changed or stopped. Cooperate in finding the mechanism: clean transmitter operation, receiver immunity and lawful spectrum-sharing status are separate questions.
''')
topic('B-001-019', 'Frequency accuracy and preventing overmodulation', '''
An amateur station must reliably determine its transmit frequency regardless of mode. Below 148 MHz, the bank requires frequency stability equivalent to crystal control. A transmitter that drifts can interfere or carry an occupied sideband outside its authorized allocation even when it began on a legal dial setting.

Voice stations need a means to indicate or prevent overmodulation; the bank specifically includes SSB. Its maximum-percentage answer is 100%. In SSB practice, watch the manufacturer's drive/ALC limits and envelope linearity rather than treating an AM-style percentage control as a universal physical meter for every mode.

Overmodulation distorts the signal and broadens occupied bandwidth. More microphone gain is not a reliable way to overcome a weak path. First verify clean modulation, suitable antenna/matching and the minimum power needed within all applicable limits.
''')
topic('B-001-025', 'EMCAB-2 and receiver immunity complaints', '''
EMCAB-2 provides criteria for considering whether an interference complaint points to excessive incident RF field strength or inadequate immunity in the affected equipment. The relevant field is at the affected premises, not simply the transmitter's rated watts.

In the bank's stereo example, a field below ISED's specified immunity criterion points to the stereo's lack of immunity. In the television example, a field above the applicable criterion points to the transmission as the cause under that test. Different equipment categories can have different applicable criteria.

Associated equipment includes home-entertainment devices not themselves strictly radio apparatus. A garage-door opener is classified as radio-sensitive equipment in the question. Identify the equipment category and use the appropriate current guidance; the fact that the neighbour hears something does not by itself establish a transmitter harmonic, an unlawful field or a receiver fault. Investigate cooperatively.
''')
topic('B-008-001', 'Receiver overload, desensitization and intermodulation', '''
A very strong signal can overload a receiver front end, including a signal outside the frequency being listened to. Loss of sensitivity is desensitization. If a television is affected by your transmitter across many amateur bands, overload is a likely explanation. Two nearby mobile transmitters can similarly desensitize each other's receivers.

Non-linear circuits can mix strong signals into new sum/difference products. This is intermodulation and can occur inside a receiver or in an external non-linear junction. An external gain antenna may worsen a handheld receiver's intermodulation by delivering stronger unwanted signals.

Place an appropriate filter before the vulnerable receiver stage. A high-pass filter at a TV can reject strong HF fundamentals; a suitable band-pass filter can protect a 2-metre receiver from nearby land-mobile bands. In the example with 92.5-MHz broadcast FM and a 14-MHz transmitter, their 78.5-MHz difference falls in TV channel 5, so rejecting the HF signal at the television input is a useful first step.
''')
topic('B-008-002', 'Audio rectification and unwanted common-mode RF', '''
RF can enter an audio device through speaker leads, interconnects or power cables. A non-linear junction can accidentally detect the RF, producing sound even in equipment with no intentional radio receiver. This is audio rectification. SSB may sound like muffled/distorted speech; keyed CW may sound like clicks or on-and-off hum.

An amplifier's volume setting may not remove it if RF enters after the volume control. Shorten unnecessarily long leads, fit suitable ferrite common-mode chokes and use appropriate device-side RFI filters. A telephone RFI filter belongs near the telephone. Passing/winding a cable through ferrite raises impedance to unwanted common-mode RF while leaving the intended differential signal comparatively unaffected.

Also control the RF at its source. An off-centre-fed or unbalanced HF antenna can place RF on the outside of its feedline and into the station. A common-mode choke in that line may reduce the station's RF feedback. That is a different function from merely transforming the antenna's impedance.
''')
topic('B-008-003', 'Spurious signals, key clicks and parasitic oscillation', '''
Spurious emissions are unintended transmitted frequency components outside the wanted signal. Operating equipment with its shielding removed can let such signals radiate. Intermodulation creates new products when signals encounter a non-linear device; it is not simply any two stations being heard together.

CW keying changes carrier amplitude. If its rise/fall edges are too abrupt or poorly shaped, the transmitter occupies excessive bandwidth and nearby stations hear key clicks. Investigate the keying filter and later stages that may distort the intended shape. Extremely fast switching makes an RF signal broader, not cleaner.

A parasitic oscillation is an unwanted self-sustained oscillation, often caused by unintended positive feedback. It can be above or below the intended operating frequency. Controlling stage layout, stability and shielding matters as well as filtering the final output. Do not assume every unexpected signal must be an integer harmonic.
''')
topic('B-008-004', 'Harmonics, splatter and overdrive', '''
A harmonic is an integer multiple of a fundamental. Non-linearity and overdriven amplifier stages create excessive harmonics, which can interfere far from the intended operating frequency. Unwanted energy just outside the necessary occupied bandwidth is described as out-of-band emission in these questions; splatter commonly results from overmodulation or clipping.

Worked examples: 7.125 MHz × 3 = 21.375 MHz, so hearing a 7.125-MHz transmitter there suggests its third harmonic. A 28-MHz transmitter can produce a 56-MHz second harmonic. A 21-MHz (15-metre) signal's third harmonic can fall near 63 MHz, within the bank's 60–66-MHz TV channel example.

Interference only on one or two TV channels while operating one band suggests a harmonic relationship more than broadband receiver overload. Excessive microphone gain can flat-top an SSB amplifier, causing non-linear products and splatter. Reduce drive and keep the amplifier linear; a downstream filter does not repair every distortion product that overlaps other wanted frequencies.
''')
topic('B-008-005', 'Choose the filter by what must pass', '''
Name a filter for the frequencies it passes or rejects. A low-pass passes frequencies below its cutoff; a high-pass passes frequencies above. A band-pass passes a selected range; a band-reject blocks a range. A notch is a narrow rejection near one offending frequency. Match filter impedance to the line to avoid unwanted reflections.

| Situation | Suitable response in the bank |
| Suppress harmonics above an HF transmitter | Low-pass at transmitter output |
| Keep RF noise off an AC supply path | Appropriately rated low-pass line filter |
| Reject strong out-of-band signals at a 2-m receiver | Band-pass |
| Reject one strong nearby received carrier | Notch |
| Reject the 31-m broadcast band while receiving 40/30 metres | Band-reject |
| Reject unexpectedly high-frequency signals at a shortwave SDR | Low-pass |

A 60-MHz cutoff rejecting everything below it is high-pass. A 40-MHz cutoff rejecting everything above it is low-pass. Place the filter before the stage that overloads; filtering audio afterward cannot undo RF mixing that has already created an unwanted in-band signal.
''')

topic('B-001-023', 'Antenna siting and the consultation process', '''
The federal Minister has authority over radio antenna installations. ISED's CPC-2-0-03 process also gives local land-use authorities an important consultation role. Certification does not grant permission to erect any structure of any size without consultation or compliance with other requirements.

Determine whether an applicable ISED or local-process exclusion removes the consultation requirement. If no municipal process exists and the system is not excluded, follow ISED's default process. The bank's exempt-height answer is the tallest structure exempted under the applicable authority's criteria, not a universal unconditional height.

The default process includes written notification, at least a 30-day public comment period and responding to reasonable/relevant written concerns. A public meeting is not automatically a required element of that default process. Where a municipality has its own consultation process, it determines how local consultation occurs. Unresolved stakeholder disputes can be referred to ISED for the final decision.

Check the current procedure before an actual installation; a consultation proposal is not itself an adopted rule. Consultation exclusion does not remove RF-safety, aeronautical or other applicable duties.
''')
topic('B-001-024', 'What Safety Code 6 actually limits', '''
Health Canada publishes Safety Code 6 for human exposure to RF fields. ISED applies the relevant requirements to transmitting installations. Its limits concern exposure—such as electric/magnetic fields, induced/contact currents and specific absorption rate—not simply a single allowed number of transmitter watts.

The exam identifies 48–300 MHz as a region of high whole-body absorption and low permitted exposure, and nerve stimulation as another established concern, especially below 10 MHz. Controlled and uncontrolled environments have different limits, with lower public exposure limits for uncontrolled areas.

No class of transmitter, including handhelds, is simply excluded from the requirements. There is no universal maximum safe handheld antenna power stated as a single wattage in the question. Antenna gain, frequency, distance, duty cycle and the physical arrangement affect exposure. The bank's claims that handhelds are excluded or that the code merely caps power fed into antennas are false statements selected in NOT-correct questions.

Use the applicable current assessment method for a real station. A low SWR or an amateur certificate does not demonstrate RF-exposure compliance.
''')
topic('B-003-018', 'Electrical hazards and preventing unauthorized use', '''
Keep unqualified people from using a station unsupervised: the bank suggests a key-operated main power switch at home and removing the microphone from an unused mobile station. A vehicle battery's major electrical hazard is its high short-circuit current, which can heat wiring and start fires despite the nominal 12-V supply.

High-voltage equipment should have appropriate interlocks. Before investigating a mains supply, turn it off and unplug it, then address stored charge using safe procedures. Working live creates an electric-shock risk; the heart can be affected by very small currents.

The bank asks for 20 mA as its minimum potentially fatal current and 30 V as a voltage usually considered hazardous. These are examination figures, not boundaries below which every exposure is safe; current path, contact conditions and duration matter. Do not use them to justify touching energized equipment.

If someone is in contact with a dangerous source, de-energize it before touching them, call emergency help and provide appropriate first aid when safe. Prevent becoming a second casualty.
''')
topic('B-003-019', 'Protective grounding, fuses and stored energy', '''
Ground and bond station equipment correctly. A mains protective-earth conductor, normally green in the bank's example, connects to the chassis to provide a fault-current path so protective devices can operate. A station single-point grounding arrangement and bonding between ground electrodes reduce dangerous voltage differences; separate isolated rods are not a substitute for proper bonding.

A copper-clad steel rod combines conductivity with mechanical strength. At RF, even an ordinary-looking long ground wire can have high impedance: the bank's 10-m wire from a third-floor station can cause RF on the chassis and burns. RF grounding, protective earthing and lightning protection have related but distinct requirements.

Use the specified fuse current rating. A higher rating may leave wiring/equipment unprotected and permit fire. A fuse's voltage rating specifies the voltage it can interrupt without continuing to arc.

After disconnecting a supply, filter capacitors can remain charged. Qualified service procedures use an insulated discharge tool with an appropriate series resistor and verify the voltage before contact. Do not assume unplugging alone eliminates stored energy or use a bare screwdriver to discharge a capacitor.
''')
topic('B-003-020', 'Towers, lightning and safe antenna access', '''
Antenna work involves fall, falling-object, RF and electrical hazards. Use approved fall-arrest equipment and appropriate training for tower work; ground helpers need hard hats. Keep antennas and their possible fall paths clear of power lines. Before repairs, disable the transmitter and disconnect the feedline so no one can unexpectedly energize the antenna.

Install wire antennas high enough that people cannot touch any part from the ground. RF voltage can burn at an antenna or open-wire feedline. Ground-mounted antennas need appropriate exclusion distance/barriers while transmitting; a convenient low location does not make them safe to touch.

Bond/ground antenna and rotator cables using an appropriate system. A feedline surge protector belongs outside, close to the grounding/bonding arrangement. Disconnecting equipment from antenna cables and power lines provides the bank's best equipment protection when a station is not used. Plan this before a storm; do not handle outdoor conductors or disconnect exposed cables during nearby lightning.
''')
topic('B-003-021', 'Reduce RF exposure with location and distance', '''
RF can heat body tissue; eyes are particularly vulnerable to heating. Keep a handheld's antenna away from your head and other people, especially while transmitting. Mount UHF/microwave antennas where people cannot approach the energized radiating structure, and prevent accidental power-up before removing an amplifier's shielding.

In the ideal far field of a free-space source, power density falls with the square of distance. Doubling distance reduces it to one quarter; tripling reduces it to one ninth. This simple model does not describe every near-field or reflective indoor situation.

Place indoor antennas as far as practicable from occupied living space. Mount directional high-gain antennas so their main beams do not illuminate people in nearby structures. Keep both the ends and centre of dipoles high and inaccessible, since current/voltage distribution alone is not a reason to allow contact with another part of the antenna. Use the actual RF-exposure assessment as well as these good layout principles.
''')
