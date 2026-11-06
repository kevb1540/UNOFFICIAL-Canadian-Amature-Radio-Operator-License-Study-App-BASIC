# Validation for version 2.3.45 (275) — 30 October 2026

**213 automated checks passed:** 73 unit checks and 140 browser checks, including
8 completed-chapter generation/backup checks, 11 dedicated completed-chapter UI
checks and 40 general study/UI checks. All eleven production JavaScript files
passed syntax checks. All suites listed in validation-summary.json were rerun;
older reports remain historical.

- Tests now offers Completed chapters test. The profile's Mark chapter complete
  list determines eligibility. With no completions, Start is disabled and Go to
  Learn is available. The card shows included chapters and the total before
  starting. One chapter gives 8 questions, three give 24 and all twelve give 96.
- Core chapters receive exactly eight random questions each. Duplicate completion
  entries do not increase the quota. Chapter 12 adds eight unique cumulative
  review questions after the core selections. Questions/answers are shuffled;
  the official bank and completion list remain unchanged.
- Verified no short/duplicate tests, exact quotas across seeded runs, the
  96-question limit, grading and JSON backup/merge validation. Existing storage
  schema and profile encryption formats are unchanged.
- Real UI flows verify marking complete, starting, replacement/cancel, selecting
  answers/flags, Save & leave, app reopening, resume, submission, score filtering
  and answer review. Retry uses the saved chapter set; Tests uses the latest
  completion list. Combined scores do not award individual chapter badges.
- Profile isolation and light/dark layouts pass at 320×740, 393×852, 852×393 and
  800×1280. Reviewed the phone card screenshot. Help explains the new option.
- The general study suite and all listed Help, speech, gesture, preview, ITU,
  narration and floating-control regressions pass without JavaScript errors.
- Built 2.3.45 (275), verified APK v2/v3 signatures, 16 KiB alignment, package,
  version and unchanged signing certificate. All 54 bundled assets match source.
  Native Java/resources, recordings, lessons, official questions, profile
  encryption and backup formats remain unchanged from the supplied 2.3.44.
- Physical Android installation/update, audio, double taps and long presses were
  not tested. Browser speech checks use controlled callbacks.

# Validation for version 2.3.44 (274) — 30 October 2026

**154 automated checks passed:** 65 core/reading/voice unit checks and 89 browser
checks, including 13 word-jump and 17 Help checks. All eleven production
JavaScript files passed syntax checks. The suites listed in
validation-summary.json were rerun for this release; older reports remain
historical.

- During active narration, a real touch double-tap or mouse double-click starts
  continuous reading immediately at that exact visible word occurrence. The
  existing voice, speed, inline Pause and floating Pause state are retained.
- Verified backward/forward jumps, later repeated words, inline formatting and
  saved highlights. Old completion/error/boundary callbacks cannot change the
  restarted passage. A compatibility mouse double-click following touch does
  not restart the passage a second time.
- Paused double-tapping still selects a restart word without playing. Play or
  Resume uses that word. Stopped sessions, other lessons, controls, links,
  dialogs and blank areas do not trigger a jump. Cancelled, dragged and
  long-held gestures do not seek either active or paused speech.
- Touch manipulation applies only to the active reading lesson and is removed
  on Stop/navigation. Both caret hit-test APIs and navigation cancellation pass.
- Search Help is included. Its filtering, Clear, empty state, sticky controls
  and exact return checks pass, including drafts, selections, quizzes, media
  and guided-lab playback. Existing voice, continuous narration, exam answers,
  red-word tracking, floating controls, themes and ITU checks also pass.
- Built 2.3.44 (274), verified APK v2/v3 signatures, 16 KiB alignment, package,
  version and unchanged signing certificate. All 54 assets match final source.
  Native Java/resources, recordings, profile storage, backups and study content
  remain byte-identical to the saved 2.3.43 source.
- Physical Android installation/update, audio, double taps and long presses were
  not tested. Gesture checks use browser input; speech callbacks are controlled.

# Validation for version 2.3.43 (273) — 30 October 2026

**149 automated checks passed:** 65 core/reading/voice unit checks and 84 browser
checks, including 17 Help checks. All eleven production JavaScript files passed
syntax checks. The suites listed in validation-summary.json were rerun for this
release; older reports remain historical.

- Search Help filters topic titles and instructions as you type, opens matching
  topics and displays a result count. Case, accents and extra spaces are ignored;
  multiple search words may occur in any order in the same topic.
- Verified body-text matches in initially closed topics, unmatched/literal-markup
  queries, Clear restoring prior expansion state, keyboard focus and blank search
  on reopening. Search and Back stay visible when results scroll.
- Searching Help preserves the underlying lesson DOM, open answers and scroll
  position on Back. Existing draft/caret, quiz, glossary, media and guided-lab
  return checks pass. Phone, landscape and tablet layout checks pass in light
  and dark themes. Reviewed the phone search-result screenshot.
- Existing continuous narration, exam-answer cues, red spoken words, selected
  voice previews, floating controls, ITU-only playback and paused double-tap
  checks pass without browser JavaScript errors.
- Built 2.3.43 (273), verified APK v2/v3 signatures, 16 KiB alignment, package,
  version and unchanged signing certificate. All 54 assets match final source.
  Native Java/resources, recordings, profile storage, backups and study content
  are byte-identical to the supplied 2.3.42 source.
- Physical Android installation/update, audio, double taps and long presses were
  not tested. Browser speech checks use controlled engine callbacks.

# Validation for version 2.3.42 (272) — 30 October 2026

**144 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8, narration UI 18,
exam-answer narration UI 8, home ITU TTS UI 9, paused double-tap UI 8 and Help UI
12. All eleven production JavaScript files passed syntax checks. Earlier results
below are historical unless explicitly listed in this release summary.

- Added 15 offline Help topics, including the new ITU-only and paused double-tap
  functions. Verified the small HELP shortcut below Glossary, its pale-pink
  #fce1eb background, dark text, and matching visibility on profile screens.
- Help keeps the underlying screen mounted. Back restores the same lesson DOM,
  open answer panels, expanded sections and scroll position. Tested a note draft,
  textarea scroll/caret/focus, a quiz answer/flag/navigator and glossary search.
- The top Back button, Android Back callback and Escape all return correctly.
  The Help Back control stays at the top while Help content scrolls.
- Active narration pauses for Help and continues on Back. An already-paused
  double-tap restart remains paused at the chosen occurrence. Letter recordings
  retain playback time, and guided antenna tuning holds its values then resumes.
- Help and header layout checks pass at 320×740, 393×852, 852×393 and 800×1280 in
  light and dark themes. Reviewed the header shortcut and Help page screenshots.
- All prior ITU-only, paused double-tap, red spoken-word text, continuous reading,
  exam-answer cues for 984 examples, preview and floating-control checks pass
  without browser JavaScript errors.
- Built 2.3.42 (272), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, unchanged signing certificate and all 54 assets against the final
  source. Native Java, resources, recordings, signing key, core/progress schema,
  profile encryption and study data remain unchanged from the saved 2.3.40
  baseline. The 2.3.41 double-tap working changes are included in this release.
- Actual phone audio, Android installation/update, physical Android double taps
  and physical long presses were not tested. Gesture checks use browser touch
  input; speech checks use controlled engine callbacks.

# Validation for version 2.3.41 (271) — 30 October 2026

**132 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8, narration UI 18,
exam-answer narration UI 8, home ITU TTS UI 9 and paused double-tap UI 8. All ten
production JavaScript files passed syntax checks. Earlier results are historical
unless explicitly listed in this release summary.

- Real browser touchscreen taps on the later repeated word update the paused
  restart point without issuing speech calls. Floating Play then reads from that
  exact occurrence. Mouse double-click and inline Resume work too.
- The latest tapped word wins, including a word spanning inline font elements.
  Source offsets remain valid after selection dismissal and saved-highlight
  repainting. Normal selection/highlighting remains another way to choose a word.
- Points must hit visible glyphs in the current paused lesson. Other lessons,
  controls, dialogs and blank space are ignored. Playing/stopped sessions cannot
  be restarted by a double tap. Cancelled, dragged and long-held pointer gestures
  do not count as double taps.
- Verified both caret hit-test APIs and removal of the pending restart on
  navigation. Touch manipulation applies only to the current paused lesson so
  double tapping can choose words while scrolling and pinch zoom remain available.
- The Play ITU Alphabet ONLY button from 2.3.40 remains included. Both 26-word
  and 26-full-phrase sequences pass at 0.8×, with shared controls and lifecycle
  cancellation. Existing red foreground, continuous reading, exam-answer cues,
  theme, preview and floating-reader tests pass without JavaScript errors.
- Built 2.3.41 (271), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, unchanged signing certificate and all 52 assets against the final
  source. Native Java, resources, recordings, signing key and study data remain
  unchanged from the saved 2.3.40 working baseline.
- Actual phone audio, Android installation/update, physical Android double taps
  and physical long presses were not tested. Gesture checks use browser touch
  input; speech checks use controlled engine callbacks.

# Validation for version 2.3.40 (270) — 30 October 2026

**124 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8, narration UI 18,
exam-answer narration UI 8 and home ITU TTS UI 9. All ten production JavaScript
files passed syntax checks. Earlier reports below are historical unless listed here.

- The new Play ITU Alphabet ONLY button is below Play and stays available with
  the chart collapsed or expanded. Checked its exact label and relative position.
- Verified all 26 emitted words from Alfa through Zulu, including Juliett and
  X-ray, with no letter-is-for-word prefix. The selected local voice is retained
  and the rate is 0.8× even when the profile's lesson rate is different.
- Verified the original Play button still emits all 26 complete A is for Alfa
  through Z is for Zulu phrases. Shared Play/Pause, floating Play and Stop retain
  the current word, restart correctly and ignore stale completions.
- Navigation, page hiding and sign-out cancel playback. Words-only playback does
  not alter saved profile/study state, and a new press starts at Alfa.
- Layout checks pass at 320×740, 393×852, 852×393 and 800×1280 in light and dark
  themes without horizontal overflow. Reviewed cropped home alphabet screenshots.
- Existing red spoken-word text, transparent background, continuous reading,
  selected-word restart, exam-answer cues for all 984 examples, preview and theme
  regressions pass without browser JavaScript errors.
- Built 2.3.40 (270), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, unchanged signing certificate and all 52 assets against the final
  source. Native Java, resources, recordings, signing key and study data remain
  unchanged from the supplied 2.3.39 source.
- Actual phone audio, Android installation/update and physical long-press
  interaction were not tested. Speech checks use controlled engine callbacks.

# Validation for version 2.3.39 (269) — 30 October 2026

**115 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8, narration UI 18
and exam-answer narration UI 8. All ten production JavaScript files passed syntax
checks. Earlier reports and results below are historical unless listed here.

- Modern WebViews use red (#ff0000) spoken-word text with a transparent custom
  highlight background. Verified computed colours in light and dark themes.
- The older-WebView path draws only red glyphs on transparent spans; it no longer
  creates any background rectangles. Verified the original inline font weights,
  source text and lesson DOM remain intact, and inspected the resulting screenshot.
- Existing saved-highlight edit, repeated-word mapping, selection/restart,
  pause/resume, stale callback, continuous reading and browser/native timing
  regressions pass. Persistent highlight storage/paint code is unchanged.
- All 984 exam examples still include one Answer. cue and their collapsed answers;
  worked explanations and the visible answer-toggle state remain correct.
- Settings and floating controls pass existing theme, phone, landscape and tablet
  layout checks with no browser JavaScript errors.
- Built 2.3.39 (269), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, unchanged signing certificate and all 52 bundled assets against the
  final source. Native Java, resources, signing key, study data and speech
  controller remain unchanged from the supplied 2.3.38 source.
- Actual phone audio, Android installation/update and physical long-press
  interaction were not tested. Speech checks use controlled engine callbacks.

# Validation for version 2.3.38 (268) — 29 October 2026

**115 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8, narration UI 18
and exam-answer narration UI 8. All ten production JavaScript files passed syntax
checks. Earlier reports and results below are historical unless listed above.

- Checked all 984 official exam examples in the actual rendered chapter pages:
  each collapsed answer is included with exactly one spoken Answer. cue. The
  ordinary Correct answer: label is replaced only in the speech text; false-
  statement labels and their explanations remain intact.
- The Read lesson button sends the expected answers to the Android speech bridge
  without revealing panels, changing the lesson DOM or saving study-state edits.
  Expanded answers produce the same speech text without duplicate cues. Worked
  calculations and explanations are included while collapsed.
- The exception applies only to the exam answer's collapsed wrapper. Unrelated
  hidden text, hidden ancestor sections, nested hidden elements and closed
  details remain excluded. Button labels are not narrated.
- Verified visible question/answer range mapping, selection source offsets,
  inline formatting and saved-highlight nodes. Synthetic Answer. cues and hidden
  answer words do not highlight unrelated visible text.
- Existing continuous-speech, exact word timing, no-timing and phrase-timing,
  pause/resume, selected-word restart, preview, floating controls, profile/theme
  and older-WebView highlight-overlay regressions pass without script errors.
- Built 2.3.38 (268), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, unchanged signing certificate and all 52 assets against the final
  source. Native Java, resources, signing key, question bank and course data are
  unchanged from the supplied 2.3.37 source.
- Actual phone audio, Android installation/update and physical long-press
  interaction were not tested. Speech checks use controlled engine callbacks.

# Validation for version 2.3.37 (267) — 28 October 2026

**107 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, voice preview 7,
continuous reading 8, Settings/reader UI 16, floating-reader UI 8 and narration UI
18. All ten production JavaScript files passed syntax checks. Older results and
reports below are historical unless explicitly included in this release summary.

- Reproduced the regression with voices that provide no word boundaries: the old
  reader first spoke a one-word probe, then queued a new utterance for each word.
  Removed both the probe and the per-word fallback. Full passages now remain
  intact regardless of missing or phrase-only timing.
- Verified native and browser voices with no timing, phrase-wide timing, repeated
  lessons, long multi-chunk lessons and exact word boundaries. Phrase callbacks
  do not cancel or replace the active utterance. Precise boundaries still move
  the word cursor; missing timing does not leave an inaccurate word highlighted.
- Verified selected voice/rate, Preview voice, pause/resume, stale callbacks,
  selected-word restart, saved-highlight editing, profile isolation and the
  phonetic alphabet's full-letter phrases at 0.8× speed.
- The complete narration UI suite passes. Updated its former per-word fallback
  expectations for continuous speech, its cross-inline Contact highlight check,
  its selection-toolbar scrolling setup and its current sign-out selector.
  No highlight or toolbar production implementation changes were required.
- All eight theme checks and phone/landscape/tablet layout checks pass, with no
  browser JavaScript errors. Existing word-cursor and older-WebView overlay
  appearance checks pass alongside the new continuous-speech behavior.
- Built 2.3.37 (267), verified v2/v3 APK signatures, 16 KiB alignment, package and
  version, matching signing certificate, and all 52 bundled assets byte-for-byte
  against the final source. Native Java, resources, signing key and study data
  remain unchanged from the supplied source.
- Actual phone audio, Android installation/update and physical long-press
  interaction were not tested. Speech tests use controlled engine callbacks.

# Validation for version 2.3.36 (266) — 28 October 2026

**81 focused automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, paused selection 4, phonetics 1, current-control voice
preview 7, Settings/reader UI 16 and floating-reader UI 8. All ten bundled
JavaScript files passed syntax checks. Earlier reports and validation below are
historical unless explicitly included above.

- Preview takes a fresh snapshot of the visible voice and speed controls on every
  press, including the live slider value. It does not overwrite saved preferences.
  Both the native bridge and browser synthesis receive the selected voice/rate.
- Checked default selection, unavailable voices, sound effects disabled, repeated
  samples, completion, cancellation, stale callbacks, pending saves and sign-out.
- Existing Settings tests verify profile persistence, failed-save rollback,
  all eight themes, the fixed Preview/Stop rectangle and keyboard focus. Layout
  checks pass at 320×740, 393×852, 852×393 and 800×1280. Floating-reader checks pass.
- A broader narration UI run stopped at a pre-existing test expectation that the
  cross-inline word Contact is contained in a single highlight element. The DOM
  uses separate marks for Con and tact. An exploratory correction allowed that
  check to pass, after which an unrelated selection-toolbar geometry check failed.
  No narration test or highlight implementation changes are included in this update.
  See narration-ui-baseline-comparison.json for the original-source comparison.
- Built 2.3.36 (266), verified APK v2/v3 signatures, 16 KiB ZIP alignment,
  package/version, unchanged signing certificate, and all 52 assets against the
  final source. Native Java, resources, study data and signing key are unchanged.
- Actual phone audio, Android installation/update and physical long-press behavior
  were not tested. Browser speech tests use controlled synthesis callbacks.

# Validation for version 2.3.35 (265) — 28 October 2026

**76 automated checks passed:** core 32, reading preferences/backups 7,
narration offsets/plans 6, highlight edits 8, Settings/reader UI 15 and
floating-reader UI 8. All ten bundled JavaScript files passed syntax checks.
Earlier results below and unrelated reports in this source archive are historical.

- Settings uses one fixed-size button for Preview voice and Stop reading. Its
  rectangle stays identical and keyboard focus remains on the button. Stop is
  visible only while the test voice plays; pause, completion, errors, explicit
  stop, navigation and background cancellation restore Preview.
- Refresh voices starts hidden, appears after a successful voice/speed change
  or opening Phone voice settings, and hides synchronously when clicked. Failed
  and unchanged saves, theme edits, sound-effects edits and automatic catalog
  callbacks do not reveal it. Pending refresh survives Settings navigation and
  resets on sign-out/profile changes or reload. The actual preferences remain
  saved and encrypted as before.
- Refresh uses a dedicated amber background (#ffc400), dark text and a dark
  border across all eight themes; measured text contrast exceeds 4.5:1.
- Measured the exact same Preview/Stop rectangle at 320×740, 393×852, 852×393
  and 800×1280 in light and dark themes. Reviewed phone screenshots and verified
  no horizontal overflow. Existing reader and floating-control regressions pass,
  including stale callbacks and cancellation. No browser JavaScript errors.
- UI automation uses controlled Android speech callbacks in Chrome Headless
  Shell 131. Actual on-device speech playback and Android installation/update
  were not tested.
- Recompiled all native sources and built 2.3.35 (265). Verified APK v2/v3
  signatures, 16 KiB alignment, package/version and byte-for-byte bundled assets.
  Existing signing key/package, native source, resources, study data, recordings,
  profile storage and backup formats are unchanged from the supplied 2.3.34 source.

See validation-summary.json, preferences-ui-test-report.json,
floating-reader-ui-test-report.json, build-info.json and apk-update-verification.json.

# Clean rebuild of version 2.3.18 — 25 October 2026

- Recompiled all five native Java sources from the attached v2.3.18 source,
  regenerated DEX and resources, repackaged all assets, aligned and signed a fresh APK.
- Used Android API 36 revision 2, Android build-tools 36.0.0, Eclipse ECJ 3.42.0
  and OpenJDK 17. The package, version (2.3.18 / 248) and signing key are retained.
- 53 pure automated checks passed: core 32, preferences/backups 7,
  narration mapping/plans 6 and highlight edits 8. All eight JavaScript files
  passed syntax checks. Lesson coverage verified 984 questions in 100 topic lessons.
- Verified APK v2/v3 signatures, 16 KiB ZIP alignment, package/version/title,
  unchanged signing certificate and all bundled assets against source.
- App code, resources, lessons, questions and build scripts match the attachment.
  Only build/verification metadata and this rebuild record were refreshed.
- Browser UI suites, Android installation, physical speech playback and native
  long-press interaction were not repeated for this rebuild. Earlier results below
  are historical.

See build-info.json, validation-summary.json and apk-update-verification.json.

# Validation for version 2.3.18 — 24 October 2026

**8 focused floating-reader checks passed.** Also exercised profile creation,
password sign-in, opening/closing Glossary during study, and returning to the
profile chooser after sign-out. Full unrelated suites were not repeated.

- Glossary is hidden on Choose your user profile at initial load and after
  signing out. It returns on the other profile forms and study screens.
- The subtitle includes a hard line break immediately after Guide. Visually
  inspected the chooser at 320x740 and 393x852: the subtitle uses two lines,
  ending its first line with Guide and starting its second with And Reference.
- The chooser's title/subtitle sizes are 16/10.56 px at 320 px and 16.8/12.16 px
  at 393 px, compared with 9.76/7.36 px and 11.52/8.8 px previously. Wider layouts
  use 19.2/14.4 px. Other screens also use larger branding fonts.
- Reviewed 16 combinations of chooser, Add New User, password and study screens
  across 320x740, 393x852, 852x393 and 800x1280. Text remains within the taller
  header and separate from Glossary; no horizontal overflow or JavaScript errors.
- Existing floating-reader checks confirm the pause/play control stays below the
  taller header, fits phone/landscape/tablet layouts, synchronizes with inline
  controls, and uses exactly 70% opacity over text. Cancellation and profile
  changes still clear it. Automated speech tests use controlled engine callbacks.
- Built 2.3.18 (248), verified APK v2/v3 signatures and 16 KiB ZIP alignment, checked
  package/version/application label, and compared bundled assets with final source.
  Existing package/signing key, study data, profile storage and backups are retained.
- Updated the existing Android smoke workflow to open Glossary from Add New User
  rather than the chooser; the native emulator workflow was not run this release.
- Physical phone installation, native long-press interaction and actual speech
  synchronization remain untested. Earlier validation records are historical.

See floating-reader-ui-test-report.json, apk-update-verification.json and
validation-summary.json. Earlier validation records follow as history.

# Validation for version 2.3.17 — 24 October 2026

This release changes product-title wording only. Full functional suites were
not repeated, and earlier test counts and reports below are historical.

- Confirmed the complete display title “Canadian Amature Radio Unofficial Basic
  Certificate Study Guide And Reference” in the page title, header home-button
  label, Android application label and Settings/About copy. The visible subtitle
  is exactly “Unofficial Basic Certificate Study Guide And Reference.”
- Rendered and visually reviewed the header at 320x740 and 393x852, with layout
  dimensions also reviewed at 852x393 and 800x1280. The subtitle wraps within the
  header, remains separate from Glossary and introduces no horizontal overflow.
  No JavaScript errors occurred during this review.
- Built 2.3.17 (247), verified APK v2/v3 signatures and 16 KiB ZIP alignment, checked
  package/version/label through Android tooling, and compared every bundled asset
  byte-for-byte with final source. The existing package and signing key are retained.
- Official questions, course/reference data, saved-highlight handling, narration,
  floating pause/play, themes, profile storage and backup formats are unchanged.
- Product-name references in bundled recovery-message source templates are updated;
  the deployed email service was not changed by this app-label release.
- Physical phone installation and launcher presentation remain untested.

See apk-update-verification.json and validation-summary.json.
Earlier validation records follow as history.

# Validation for version 2.3.16 — 24 October 2026

**106 focused automated checks passed:** core 32, preferences/backups 7,
narration offsets/plans 6, highlight edits 8, settings/reader UI 12,
saved-highlight UI 17, read-along UI 16, and floating-reader UI 8.
Earlier unrelated reports remain historical; not every bundled suite was repeated.

- The fixed 52-pixel Pause / Play control appears below the app header near the
  top-left corner during narration and voice preview. It stays visible while
  paused, synchronizes with inline controls, supports keyboard activation and
  resumes from the current spoken word. It stays fixed while scrolling.
- Measured exactly 0.7 opacity over visible text and 1.0 over empty space, including
  a container whose text lies outside the control. Mutating the text layout,
  scrolling and resizing trigger an update. Collision checks use text ranges;
  lesson text and saved progress are not altered.
- Completion, stop, engine errors, navigation, page/background cancellation and
  sign-out hide the control. Late callbacks cannot bring it back or affect a new
  request. Voice preview supports floating pause/play without changing progress.
- Verified 320x740 and 393x852 phones, 852x393 landscape and 800x1280 tablets in
  dark/light themes. The control remains below the header and inside the viewport.
- Visually inspected the floating control and 70% overlap state. Inspected the
  Options/Settings page with its current-user banner and Profile/Settings buttons
  hidden; its settings, profile-management card and bottom navigation remain usable.
- Saved highlight recolouring, removal, persistence and backups passed regression.
  Word mapping, white-on-black speech highlights, timing fallbacks, reading speed,
  voice choices, themes and profile isolation passed. No JavaScript errors.
- Built 2.3.16 (246) with the existing package and signing key. Verified APK v2/v3
  signatures, 16 KiB ZIP alignment, manifest identity/version, and all bundled
  assets against final source. Official questions, course/reference data, stored
  highlight logic and narration offset mapping are unchanged from the attachment.
- Physical phone installation, audio synchronization and Android long-press
  interaction remain untested. Automated speech checks use controlled callbacks.

See floating-reader-ui-test-report.json, preferences-ui-test-report.json,
narration-ui-test-report.json, highlight-ui-test-report.json,
validation-summary.json and apk-update-verification.json.
Earlier validation records follow as history.

# Validation for version 2.3.15 — 24 October 2026

**98 focused automated checks passed:** core 32, preferences/backups 7,
narration offsets/plans 6, highlight edits 8, settings/reader UI 12,
saved-highlight UI 17, and read-along UI 16. Earlier unrelated reports below
remain historical; this is not a claim that every bundled suite was repeated.

- Highlighter Colour offers eight named choices and saves the preference per
  profile. On selected saved marks it immediately recolours only the highlighted
  portions, including when the chosen colour already matches the preference.
- Remove Highlight appears only when selected lesson text intersects a saved
  mark. Partial removal retains both surrounding portions and their colours.
  It subtracts all overlapping layers so an older mark cannot reappear beneath it.
- Exercised native selection-state and action bridges after browser selection
  clearing and ActionMode dismissal. The colour dialog retains its own checked
  selection anchor; Close and Back cancel without changing existing marks.
- Verified failed recolour/removal saves preserve prior marks and preferences,
  coloured edits survive locked reopening, profiles remain separate, and both
  progress merging and encrypted User backups retain the edited marks.
- The spoken word has a black background and white text in light and dark themes.
  Modern custom highlights and the older-WebView glyph overlay both preserve the
  lesson DOM. Recolouring/removal during narration retain its current word.
- Checked repeated words, inline fonts, visible/hidden answers, symbol offsets,
  actual callback timing/fallbacks, stale callbacks and profile cancellation.
  The four-action selection toolbar and eight-colour dialog fit small phones,
  landscape and tablets without horizontal overflow. No JavaScript errors.
- Inspected the white-on-black cursor and fallback visually. Built version 2.3.15
  (245), verified APK v2/v3 signatures and 16 KiB ZIP alignment, and compared all
  bundled assets byte-for-byte with final source. The existing signing key,
  official question bank, course content and reference data are unchanged.
- Physical Android installation/update, native long-press menu interaction and
  actual speech synchronization still require a phone check. Speech UI tests use
  controlled engine callbacks; engines without timing may pause between words.

See tests/highlight-edits.test.cjs, highlight-ui-test-report.json,
narration-ui-test-report.json, preferences-ui-test-report.json,
validation-summary.json and apk-update-verification.json.
Earlier validation records follow as history.

# Validation for version 2.3.14 — 24 October 2026

**83 automated checks passed:** core 32, preferences/backups 7, narration plans
and offsets 6, settings/reader UI 12, saved-highlights UI 12, and read-along UI 14.

- The temporary spoken-word cursor follows native `onRangeStart` and browser word
  boundaries. Missing or phrase-only timing switches to individual word utterances
  and their actual start events. No estimated word-duration timer is used.
- Verified source mapping through inline formatting, whitespace, repeated words,
  decimals, spoken symbols and existing saved highlights. Cursor updates do not
  rewrite lesson text, saved anchors or exported progress data.
- Read from here starts or moves speech to the selected occurrence. Exercised
  the browser selection toolbar and the Android selection-menu bridge, including
  a word spanning inline nodes, stopped/active reading and saved highlights.
- Pause clears the cursor and resumes from the current word. Stop, completion,
  navigation, sign-out and background handling cancel or clear temporary state.
  Late callbacks cannot change another request or profile.
- Checked unavailable selection outside lessons and during dialogs, hidden answers
  and closed supplementary content, light/dark themes, small phones, landscape,
  tablets, and the visual overlay fallback for older WebViews. No JavaScript errors.
- Built version 2.3.14 (244), compiled the native range callback and selection action,
  verified APK v2/v3 signatures and 16 KiB ZIP alignment, and compared every bundled
  asset with the final source. Original signing key, official bank, course content
  and reference data are unchanged.
- Actual speech synchronization, physical long-press behavior and installation on
  a phone remain untested. Automated UI checks use controlled engine callbacks.
  A voice without usable word timing can have brief pauses between words.

See narration-ui-test-report.json, preferences-ui-test-report.json,
highlight-ui-test-report.json, validation-summary.json and apk-update-verification.json.
Earlier validation records follow as history.

# Validation for version 2.3.13 — 24 October 2026

**63 automated checks passed:** core 32, encrypted profiles 12, preference
validation/migration/backups 7, and settings/reading browser checks 12.

- Settings has one available-voice list and one Preview voice button. The sex
  selection and separate voice slots have been removed. Existing 2.3.12 profiles
  and backups retain their previously active saved voice when opened or restored.
- Speech speed uses a slider from 0.5× to 2× in 0.05 increments. Its numeric value
  updates during adjustment; the setting saves when the adjustment is committed.
  Preview and lesson narration use the saved voice and speed.
- Voice, speed and theme choices survive reopening and encrypted User restoration,
  remain separate between profiles, and keep current choices during progress merge.
- Checked saved/unavailable voices, cancellation and stale callbacks, long lessons,
  hidden-answer exclusion, eight themes and text contrast, and phone, landscape
  and tablet layouts. No JavaScript errors occurred.
- Native Android code compiled against SDK 36. Verified APK v2/v3 signatures,
  16 KiB ZIP alignment, the unchanged signing key and every bundled asset against
  the final source. Official questions, course data and reference data are unchanged.
- Physical Android installation/update and actual speech playback remain untested.
  Prior release results below are historical; unrelated suites were not repeated.

See validation-summary.json, preferences-ui-test-report.json and
apk-update-verification.json. Earlier validation records follow.

# Validation for version 2.3.12 — 24 October 2026

**84 automated checks passed in the focused suites listed below.** Additional
live government-source comparisons and Android build verification also passed.
Earlier release records below are historical and were not all repeated.

| Suite | Passed |
| --- | ---: |
| Course, quizzes, progress and RF core | 32 |
| Encrypted profiles, isolation and transfer | 12 |
| Preferences migration, validation, backups and speech chunking | 7 |
| Voice controls, theme contrast, profile switching and mobile layouts | 12 |
| Government attribution pages and chapter sources | 9 |
| Lesson highlights, profile isolation and both backup types | 12 |

- All eight themes apply to the selected profile. Measured normal-text contrast
  for body, secondary text and primary buttons is at least 4.5:1 in each palette.
  Checked 320/393 px phones, 852×393 landscape and 800×1280 tablet layouts.
- Female/male slots, selected sex, speed and theme survive reopening and encrypted
  User export/import. Another profile starts with its own defaults. Progress
  merge keeps the current user's preferences. Failed writes restore earlier choices.
- The shipped reading UI was tested with a controllable Android speech bridge:
  both voice slots/previews, bounded long-lesson chunks, completion, pause/resume,
  stop, stale callbacks, unavailable voice data and phone-settings errors.
  Navigation, sign-out and background handling cancel narration. Hidden answers,
  closed supplementary text and button labels are excluded from narration.
- Reading controls are outside the lesson text. Existing highlight anchors,
  colours, profile isolation, progress merges and encrypted User restores passed.
  The existing highlight import test now waits for persistence/dialog completion
  before navigating again, avoiding an asynchronous test race.
- The 12 government reference pages and reproduction terms were checked live for
  titles, author metadata, editions and dates. All 984 bilingual question/answer
  records and 100 topic groups match ISED's delimited bank, including its SHA-256.
- Android native code compiled against SDK 36. Built APK 2.3.12 (242), checked
  v2/v3 signatures and 16 KiB ZIP alignment, and compared every bundled asset
  byte-for-byte with the final source. Existing package and signing key match
  the supplied project. No new runtime permission was added for speech.
- The supplied legacy study-flow suite has a timing-sensitive failed-note-save
  assertion reproduced in the supplied source in this Chromium runtime. It was
  not counted as passing. Recovery/network and unrelated formula/on-air suites
  were not repeated; their earlier reports remain as history.
- Physical Android installation/update, actual speech playback, native long-press
  interaction and live recovery email delivery remain untested. Voice sex is
  assigned by the user after preview unless the installed engine supplies an
  explicit label. Voices must be available on the user's phone.

See validation-summary.json, preferences-ui-test-report.json,
preferences.test.cjs in tests/, government-source-verification.json and
apk-update-verification.json. Earlier validation records follow.

# Validation for version 2.3.11

**154 automated checks passed on 17 October 2026. All suites ran for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 32 |
| Profile encryption, isolation and transfer | 12 |
| Native / Web Crypto compatibility | 1 |
| Python recovery service | 7 |
| Study flows and chapter badges | 40 |
| Profile and email recovery browser flows | 15 |
| Eight-colour highlights and backups | 12 |
| Formula detail pages | 8 |
| On-air terminology and glossary integration | 9 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup UI | 1 |

- Added 61 on-air terms in six groups, with meanings, examples and usage notes.
  Q-code entries include question/statement forms. Spelling and conversation
  references are included offline, with optional external publisher links.
- The merged glossary has 223 unique entries. Existing definitions, categories,
  nonempty examples, references and related-lab links are retained. The On-air
  language category includes all 61 entries, including 20 existing terms.
- Both Glossary & definitions and Mode definitions open the new section.
  Search, topic filters, empty results, Android Back and unsigned reference
  access were exercised. Every on-air term is available in quick lookup.
- Quick lookup and reference browsing retain the current test, answer, flags,
  scores, notes and highlighter preference. No progress schema changes.
- Checked phone widths 320/393, landscape 852×393 and tablet 800×1280, including
  long entries, all topics expanded, and the 26-word spelling table. Inspected
  phone screenshots and kept search ahead of optional operating tips.
- Verified all current assets in APK 2.3.11 (241), unchanged native code, existing
  package/signing identity, ZIP alignment and signature compatibility with
  2.3.10 (240). Official questions and authored course lessons are unchanged.
- Physical Android installation, device menus, camera/document pickers, and
  live external email delivery remain untested. Local recovery fixtures were
  used. Previously documented native long-press limits still apply.

See validation-summary.json, apk-update-verification.json and the UI reports.
Earlier release records follow as history.

# Validation for version 2.3.10

**145 automated checks passed on 17 October 2026. All suites ran for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 32 |
| Profile encryption, isolation, migration and transfer | 12 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows, including chapter badges | 40 |
| Profile, avatar, transfer and email-reset browser flows | 15 |
| Eight-colour lesson highlighting and backup restoration | 12 |
| Formula detail pages and navigation | 8 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Every existing formula has a dedicated offline page covering its definition,
  letters and units, named symbols, inverse forms, worked example and tips.
  Verified all 16 pages at 320 px and 393 px phone widths, in landscape, and on
  a tablet. Related pages, labs, keyboard actions, Back position and glossary
  preservation work without external requests or changes to study progress.
- Highlight and Highlighter Colour are added to Android's native ActionMode
  callback. The picker offers eight named, accessible colours. The callback
  compiles against Android SDK 36, and the selection-to-picker bridge was
  exercised in Chromium, including ActionMode cleanup and Back cancellation.
- Verified each colour, per-user saved preference, readable dark text, old
  colourless highlights defaulting to yellow, overlap colours, recolouring
  without duplicate anchors, failed-save rollback, profile isolation, and
  reopening. Progress .carprog and encrypted User .carprog transfers retain
  coloured marks; full User restore also retains the colour preference.
- Learn lists PASSED from a best submitted chapter test of 70%, and bold gold
  PASSED WITH HONORS from 80%. Existing history works. Lower later attempts do
  not remove an earned label; study attempts, incomplete tests, full exams and
  reading-complete markers cannot award it. Verified reopening and layouts.
- All 984 official questions, 100 topic lessons, profiles and encryption code,
  copyright, icon and recovery-service configuration are preserved.
- APK 2.3.10 (240) keeps package ca.kevin.maplewave and the existing signing
  certificate, verified against 2.3.9 (239). Verified APK v2/v3 signatures,
  ZIP alignment, and every bundled asset against the final source files.
- Physical Android installation, native long-press/menu behavior, device camera
  and document pickers, and live external email delivery remain untested.

See validation-summary.json, apk-update-verification.json and the UI reports.
Earlier release records follow as history.

# Validation for version 2.3.9

**128 automated checks passed on 17 October 2026.** All suites were run again
for this signed update build: core 29, profiles 12, native crypto compatibility
1, Python recovery 7, study browser flows 38, profile browser flows 15,
highlight browser flows 8, Cloudflare Worker 17 and setup browser flow 1.

The APK is version 2.3.9 (239), with the same package and signing certificate as
2.3.8 (238). APK signatures, 16 KiB ZIP alignment and every bundled asset were
verified. Native DEX is byte-identical to 2.3.8. The only changed app asset is
the browser version fallback; lessons, all 984 official questions, saved
highlights, profiles, backup behavior and the fixed recovery origin are retained.

Physical Android installation, the native long-press menu, camera/document
providers and live email delivery remain untested. Browser selection tests
simulate the Android bridge; recovery tests use local fixtures without sending
production email. See the current JSON reports for details.

Previous release validation follows.

# Validation for version 2.3.8

**128 automated checks passed on 17 October 2026.** All suites were run for this
release; highlight browser checks were repeated after native visibility sync.

| Suite | Passed |
| --- | ---: |
| Course, progress, highlights and RF core | 29 |
| Profiles, full backups and fixed recovery origin | 12 |
| Native Java / Web Crypto compatibility | 1 |
| Python recovery service | 7 |
| Browser study and progress backup flows | 38 |
| Profile, avatar, call sign, transfer and recovery browser flows | 15 |
| Highlight selection, persistence, isolation and both backup types | 8 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Native WebView wraps both startActionMode overloads. It adds Highlight to the
  existing selection menu, preserves other actions, delegates Callback2 content
  positioning, and follows valid lesson selections through asynchronous checks
  and selection-change notifications. Stale/closed callbacks are ignored.
- Browser checks exercise real DOM selections and a fallback Highlight toolbar,
  yellow marks with dark text, overlapping paragraphs without nested marks,
  source-text preservation and stable anchors across Show Answer / Hide Answer.
  The Android JavaScript bridge and visibility notification are simulated.
- Each user's highlights stay in their encrypted progress. Tests cover reopen,
  isolation, duplicate imports, malformed anchors, failed-write rollback and
  rejection of selections outside lessons. An actual phone screenshot was not
  taken; inspected a Chromium phone-layout screenshot of the yellow highlights.
- Progress .carprog exports retain highlights and merge distinct ones. An actual
  encrypted User export/import restores highlights with the avatar, call sign,
  password and other saved data on a fresh browser context. Core/profile checks
  retain all existing populated progress fields with the new optional field.
- Recovery is preconfigured to https://radio-recovery.kevb1540.workers.dev.
  There are no editable service-origin fields. Each user still verifies their
  email. Local fixture enrol/verify/reset checks use that configured origin
  with intercepted requests; no production recovery email was sent.
- Existing verified recovery records are retained until reenrolled; private
  profile keys are not silently moved to another service.
- The optional highlights field defaults to empty for old progress without a
  schema change. Backup formatting, names and .carprog-only imports remain.
  Official question and course files, icons, native cryptography and server code
  remain unchanged. Lesson coverage remains 984 questions / 100 topics.
- APK 2.3.8 (238) retains the package/certificate and increases the version.
  Signatures, ZIP alignment and every bundled asset are verified.
- Physical Android installation, native long-press menu positioning, camera and
  document providers, and live external email delivery remain untested.

Android API references used for the selection-menu implementation:
https://developer.android.com/reference/android/view/ActionMode.Callback
https://developer.android.com/reference/android/view/ActionMode.Callback2

See the JSON verification and browser reports. Previous release notes follow.

# Validation for version 2.3.7

**116 automated checks passed on 17 October 2026.** All suites were run for this
release; profile data and browser checks were rerun after expanding the full
backup audit.

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, complete backup, call sign and isolation | 11 |
| Native Java / Web Crypto compatibility | 1 |
| Python recovery service | 7 |
| Browser study, lesson answer and progress backup flows | 38 |
| Profile, filename, avatar, call sign, user transfer and reset browser flows | 15 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Backup filenames use <username>_<YYYY-MM-DD>.carprog, with the device's local
  calendar date. Actual downloads verify Kevin and Casey filenames, including
  Kevin's selected-user export before login. Native progress exports now use
  the same named-backup route as encrypted User exports.
- Current-user, selected-user and pre-update profile exports use the backed-up
  profile's name. The native save dialog receives this supplied filename;
  safe spaces and Unicode are preserved, with unsafe filename characters
  replaced by underscores.
- The complete encrypted User backup restores the avatar, optional call sign,
  username, email, original password protection, profile timestamps, ownership
  token, recovery record and every progress field. The data check populates
  score history, completed chapters, chapter notes, titled notes, a draft,
  exercise responses, lab values/checks, an unfinished test and language.
  It compares the entire restored private payload and public profile record.
- Actual browser export/import also compares the entire restored study state,
  avatar, call sign and email after password authentication. The separate
  progress-only export remains available for merging study work.
- Backup JSON serialization, encryption, profile module, core logic, native
  UTF-8 writer, Android import validation and internal storage are unchanged.
  Only .carprog imports remain accepted. Wrong extensions and stale selections
  still pass the existing rejection checks without altering saved work.
- The lesson answer controls, glossary, notes, profile warnings, avatars and
  local recovery checks passed regression. Questions, teaching content and
  icon/logo remain unchanged.
- Verified version 2.3.7 (237), previous package and certificate, APK signatures,
  ZIP alignment, every source asset and matching header/native icon pixels.
- Physical Android installation, native document providers/camera and live
  email delivery remain untested. Recovery checks use local intercepted mail.

See apk-update-verification.json, validation-summary.json and browser reports.
Previous release notes are retained below as history.

# Validation for version 2.3.6

**116 automated checks passed on 17 October 2026.** All suites were run for this
release. The browser suites were run again after strict import enforcement.

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, call signs, migration and transfer | 11 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows, lesson answers and progress backups | 38 |
| Profile, call sign, user backup, avatar, warning and reset browser flows | 15 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- User, progress and pre-update recovery exports use .carprog filenames.
  Browser downloads assert the exact extension. Progress export text exactly
  matches the previous two-space JSON serialization of the current state;
  encrypted user envelopes retain their previous JSON formatting and schema.
- Only .carprog files are accepted for user and progress imports. Input controls
  advertise that extension alone; filename checks reject .json, .txt, duplicate
  suffixes such as .carprog.json, and bridge input without a filename. Invalid
  user selections clear a previously selected backup. Saved work stays intact.
- Real .carprog exports import with the same notes, scores, unfinished test,
  avatar, call sign and password. Repeated progress merges do not duplicate
  notes or attempts. Both browser suites finish without JavaScript errors.
- Android checks the document provider's display filename before opening its
  contents and passes the verified name to JavaScript. Export uses a generic
  binary document type so a provider can preserve the .carprog extension.
  The existing UTF-8 writer, payload formats, internal .json storage names,
  core validation/merge code and profile cryptography are unchanged.
- Every one of the 984 lesson exam questions still starts with its correct
  answer and worked explanation hidden. Independent Show Answer / Hide Answer
  controls, keyboard activation, focus retention and glossary behavior passed.
- Optional call signs can be saved, edited and cleared, stay encrypted per user,
  and survive user transfer, reopening and password reset. Existing profiles
  and the previous avatar/recovery warnings remain supported.
- APK 2.3.6 (236) has the existing package and signing certificate and a higher
  version code. Verified signatures, ZIP alignment and exact bundled assets.
  Official questions, teaching content, icon/logo and recovery code are unchanged.
- Physical Android installation, document-provider behavior, camera pickers and
  live external email delivery remain untested. Android code compiled successfully;
  filename-validation ordering and limited source changes were also inspected.

See apk-update-verification.json, validation-summary.json and browser reports.
Previous release notes are retained below as history.

# Validation for version 2.3.5

**114 automated checks passed on 17 October 2026. All suites were run for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, call signs, migration and transfer | 11 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows and lesson answer controls | 37 |
| Profile, call sign, avatar, warnings, transfer and email reset in Chromium | 14 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Every one of the 984 lesson exam questions starts with its answer hidden.
  Show Answer reveals that question's correct answer and worked explanation;
  Hide Answer closes both. Questions remain visible throughout.
- Browser checks exercise two separate question controls, their exact labels,
  ARIA expansion state, controlled answer IDs, Enter/Space activation and focus
  retention. Toggling keeps the existing lesson DOM and saved progress intact.
- The glossary preserves open answers. Reopening a lesson starts hidden again.
  Both expanded answers and the new profile form fit phones, landscape and
  tablets. Inspected actual shown/hidden answer and call sign screenshots.
- Profile Settings offers an optional Call sign field with save, edit and clear.
  Saved values are trimmed and capitalized and appear in the signed-in banner.
  The field is private in the existing encrypted payload, isolated per user,
  and retained through user export/import, reopening and password recovery.
- Older encrypted profiles that have no callSign field still load with it blank.
  Failed writes and invalid/oversized values retain the saved call sign and
  progress. Password algorithms, vault schema, progress format and native code
  are unchanged; the profile module adds the optional encrypted field.
- APK 2.3.5 (235) uses the previous package and certificate with a higher version
  code. Verified APK signatures, ZIP alignment, every bundled asset against
  source, and identical native classes.dex compared with 2.3.4.
- Questions, teaching content, core module, icon/logo and recovery-service code
  remain byte-identical. Existing notes, scores, glossary, profile warnings,
  avatars, encrypted transfers and recovery tests passed regression.
- Physical Android installation, camera/document pickers and live external
  email delivery remain untested. Recovery tests use intercepted HTTP or a
  test mailbox and do not verify a deployed account's configuration.

See apk-update-verification.json, validation-summary.json and browser reports.
Previous release notes are retained below as history.

# Validation for version 2.3.4

**109 automated checks passed on 17 October 2026. All suites were run for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, migration and transfer | 9 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows | 35 |
| Profile, avatar, warning, transfer and email-reset browser flows | 13 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- The existing icon was edited with the built-in image tool to give its corner
  maple leaf a vivid red color. The prompt and asset paths are in branding-edit.json.
- The header loads a bundled PNG copy of that same artwork. Browser checks decode
  it, verify its image/png response and compare it to the native icon source.
- After APK resource compilation, the native icon and header PNG have identical
  decoded pixels. Red leaf pixels are confined to the bottom-right region.
  The launcher bitmap is in drawable-nodpi to avoid automatic density upscaling.
- Inspected login, study and settings phone screenshots. Existing UI tests cover
  320 px phones, landscape and tablets without overflow or script errors.
- The native loader now returns image/png with null character encoding for PNG
  assets. Other native profile/storage behavior and the progress format are
  unchanged; the Java/Web Crypto checkpoint compatibility test passes.
- APK 2.3.4 (234) matches the previous package and signing certificate and has a
  higher version code. Signing, ZIP alignment and bundled assets are verified.
- Existing avatar/recovery warnings, encrypted user transfers, notes, course
  content, quizzes and glossary passed regression. Official questions and
  teaching content remain byte-identical.
- Physical Android installation, launcher masking, camera/document pickers and
  live external email delivery remain untested. Local recovery tests use
  intercepted HTTP or a test mailbox. Recovery-service configuration is retained.

See apk-update-verification.json, validation-summary.json and browser reports.
Android resource-response reference: https://developer.android.com/reference/android/webkit/WebResourceResponse
Previous release notes are retained below as history.

# Validation for version 2.3.3

**109 automated checks passed on 17 October 2026. All suites were run for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, migration and transfer | 9 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows | 35 |
| Profile, avatar, warning, transfer and email-reset browser flows | 13 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Extended existing profile-flow checks for the exact Select an Avatar Image
  prompt, red text and bold weight while no image is set. A profile with an
  existing image has no prompt; email verification alone keeps it visible.
  Saving an image removes it immediately and it remains absent after reload.
- Verified the Profile exclamation is heavy bold and more than 1.75 times the
  label font size. CSS uses 24 px at the standard 16 px root size and weight 900.
  Its original requirement for verified recovery plus a chosen image remains.
- Inspected phone screenshots of the missing-image prompt, enlarged Profile
  mark and completed settings page. No overflow on 320 and 393 px prompt pages;
  existing responsive study/profile checks also cover landscape and tablet.
- APK 2.3.3 (233) matches the previous package and signing certificate and has a
  higher version code. Signing, ZIP alignment and bundled assets are verified.
- Native code, compiled classes.dex, profile crypto/storage, saved-progress
  schema, official questions, teaching content and recovery service are unchanged.
- Physical Android installation, camera/document pickers and live external email
  delivery remain untested. Local recovery tests use intercepted HTTP or a test
  mailbox. The existing recovery-service address remains user-configurable.

See apk-update-verification.json, validation-summary.json and browser reports.
Previous release notes are retained below as history.

# Validation for version 2.3.2

**109 automated checks passed on 17 October 2026. All suites were run for this release.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, migration and transfer | 9 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows | 35 |
| Profile, avatar, warning, transfer and email-reset browser flows | 13 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- Browser tests verified the bold red recovery heading, red exclamation to its
  left, red disabled status, and normal styling after email verification.
- Checked all four verified-email/avatar combinations using real user flows.
  Merely requesting a verification code does not clear warnings. A verified
  profile without an avatar keeps its Profile mark; an avatar alone also keeps
  it. Completing both removes the mark, including after reload and user changes.
- Placeholder initials remain round in the banner. Screen-reader Profile labels
  identify missing setup; the decorative exclamation is hidden from speech.
- Inspected phone screenshots of pending recovery, verified recovery without an
  avatar, the remaining Profile mark and completed setup. The warning page fits
  320 and 393 px screens; existing responsive tests cover landscape and tablet.
- APK 2.3.2 (232) has the same package and signing certificate as 2.3.1 (231).
  Android tools verify signing and ZIP alignment; bundled assets match source.
- Native code, compiled classes.dex, profile crypto/storage and saved-progress
  schema are unchanged. Questions and teaching content are byte-identical.
- Physical Android installation, camera/document pickers and live external email
  delivery remain untested. Recovery tests use intercepted HTTP or a local test
  mailbox. The existing recovery-service address remains user-configurable.

See apk-update-verification.json, validation-summary.json and the browser reports.
Previous release notes are retained below as history.

# Validation for version 2.3.1

**107 automated checks passed on 16 October 2026. All suites were rerun for this APK update.**

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, migration and transfer | 9 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Python recovery service | 7 |
| Browser study flows | 35 |
| Profile, avatar, transfer and email-reset browser flows | 11 |
| Cloudflare Worker recovery | 17 |
| Cloudflare setup page in Chromium | 1 |

- APK version 2.3.1, code 231, package `ca.kevin.maplewave`; minimum API 26,
  target API 36. Android tools verify the APK's signing and ZIP alignment.
- The signing certificate matches the previous 2.3.0 APK. Its version code is
  greater, so the new file passes the existing app's identity/version checks.
- Every bundled asset matches the release source. Only the displayed fallback
  version and email service setup wording changed in the web assets.
- Native Java sources and compiled `classes.dex` are unchanged from 2.3.0.
  The profile crypto/storage module and saved-progress schema are unchanged.
  The original official question file is byte-identical.
- The study and profile browser suites cover saved scores, notes, drafts,
  unfinished tests, profile migration/isolation, password changes, user backups
  and email verification/reset. Responsive layout checks include 320 px phones.
- Local recovery tests intercept outgoing email or use a test mailbox. A live
  Cloudflare deployment, external Brevo delivery, actual Android installation,
  camera and system document pickers have not been exercised on a physical phone.
- Update the existing app instead of uninstalling it or clearing data. Email
  recovery still uses the HTTPS address configured by the user in the app.

See `apk-update-verification.json`, `validation-summary.json` and the UI reports.
The previous release's validation notes are retained below as history.

# Validation for version 2.3.0

**89 automated checks passed on 16 October 2026.**

The subsequent Cloudflare hosting addition passed **18 further checks**:
17 Worker/service checks and one Chromium setup-page check. These are new
hosting checks; the original 89 APK checks below were not rerun for this
source-only addition. App assets, native code, package and APK are unchanged.

## Cloudflare hosting addition

- Executed the supplied SQL against real SQLite through a D1-compatible test
  adapter. Intercepted outbound Brevo HTTP locally; no real emails were sent.
- Verified registration ownership, encrypted stored keys, code hashing,
  verification, expiry, five wrong guesses, cooldowns, resend invalidation,
  persistent request/mail budgets, registration capacity and provider failures.
- Concurrent code consumption returns exactly one recovery key. Concurrent
  enrolment keeps the winning address/key attached to its own challenge.
  Pending replacements preserve previously verified recovery until verified.
- The unchanged app profile module completed enrol/verify/reset/login against
  the Worker and retained titled notes, completed lessons and an unfinished test.
- Chromium generated distinct 32-byte keys on the setup page without network
  requests or script errors; layout fits 320, 393 and 800 pixel widths. The
  setup page was also inspected visually.
- No live Cloudflare account, production Worker runtime or actual Brevo email
  delivery was exercised. `/health` checks settings/tables, not provider delivery.
  Complete profile email verification in Kevin's configured app to test that.
- Details are in `cloudflare-validation-report.json`. The existing APK remains
  version 2.3.0 (230); no reinstall is required for the hosting setup.

## Original APK checks

| Suite | Passed |
| --- | ---: |
| Course, quiz, progress and RF core | 26 |
| Profile encryption, isolation, migration and transfer | 9 |
| Native Java / Web Crypto checkpoint compatibility | 1 |
| Email recovery service | 7 |
| Existing browser study flows | 35 |
| Profile, avatar, transfer and email-reset browser flows | 11 |

## Profiles and migration

- Every browser reload/cold launch starts locked at the user list. Study
  navigation cannot enter private pages before authentication. User names and
  avatars are visible; email and study data remain encrypted.
- The first created profile receives existing version-2 progress. The old
  plaintext progress file is removed only after the encrypted vault saves.
  A failed write leaves the original intact. Another profile starts fresh.
- Wrong passwords fail, repeated failures are throttled, and a password change
  invalidates the old local password while retaining progress.
- Profiles have separate notes, drafts, scores, active tests, flags, language
  and lab settings. Signing out clears private state and pending UI material.
- Passwords are never stored as plaintext. AES-256-GCM protects profile keys
  and payloads; PBKDF2-HMAC-SHA256 uses 600,000 iterations and random salts.
- Pre-login export requires the chosen user's password and includes only that
  user. Import preserves name, avatar, password protection and progress. Wrong
  backup passwords and malformed/tampered packets fail before saving. Duplicate
  users require a new name and are not overwritten.
- Pre-update recovery export filters to the authenticated user's snapshot and
  verifies the snapshot password; another user's snapshot is rejected.

## Avatars and Android integrations

- File images are cropped/resized to square JPEG avatars. Browser file selection
  and native camera callback routing preserve entered creation fields. Avatars
  render to the left of user names and identify the selected password page.
- Android uses ACTION_OPEN_DOCUMENT for images and ACTION_IMAGE_CAPTURE with
  a temporary, non-exported content-provider URI for full camera output. Native
  image handling applies orientation and resizes the result to 256×256.
- No direct camera or broad storage permission is added. INTERNET permission
  supports configured email recovery; the optional APK installer permission
  remains. WebView content continues to load exclusively from bundled assets.
- The native AES-GCM checkpoint compiles and decrypts correctly through Web
  Crypto, including Unicode; mismatched associated data and short keys fail.
  This test uses the desktop JVM, not an Android device.

## Email recovery

- A real local Python recovery service was exercised through the app's recovery
  request/callback protocol using a test-only mailbox. Verification, requesting
  a reset, rejecting a wrong code and setting a new password preserved the
  user's note and unfinished test. Normal login is required after reset.
- The service also passed expiry, single-use/replay, five wrong guesses,
  ownership checks, header-injection validation, rate limiting and delivery-
  failure tests. Recovery keys are encrypted in the database; code hashes are
  keyed. Neither profile passwords nor study progress are sent to the service.
- The APK requires a trusted HTTPS origin, refuses redirects and uses Android's
  TLS verification. SMTP secrets and the service master key stay on the server.
- **No live HTTPS recovery service or SMTP account is preconfigured.** A user
  must configure a service and verify their email before reset email works.
  The app states when recovery is disabled. See Email_Recovery_Setup.md.
- External SMTP delivery and real Android HTTPS/camera/document-picker flows
  were not exercised. No physical phone was available; the camera callback in
  browser tests is simulated. The service is a personal deployment reference,
  not a production security audit or a hosted service.

## Existing study features and layout

- All 984 official questions still map to 100 detailed topic lessons; each
  correct selection appears in its rendered teaching example. Questions,
  teaching content and RF models are unchanged from version 2.2.1.
- All twelve chapters, cumulative topic links, worked/false-statement feedback,
  chapter tests, 100-topic exams and eight interactive labs pass regression.
- Titled Personal Notes, failed-write preservation, drafts, legacy progress
  export/merge, scores and saved answers pass after profile authentication.
- The persistent glossary remains available on study and login/profile screens;
  it retains quiz answers, flags, scroll, note drafts and antenna settings.
- Login, selected-user password, creation, export, import, recovery and study
  pages fit 320×740, 393×852, 852×393 and 800×1280 without horizontal overflow
  or browser script errors. Login/password layouts were inspected visually.
- Source-owner attribution and every original reference link remain intact.

## Package identity and limits

- Version 2.3.0, code 230, package ca.kevin.maplewave; minimum API 26, target 36.
- The signing key matches version 2.2.1, and Android tools verify signatures
  and ZIP alignment. All bundled assets are compared with the source files.
- Profile storage uses a new encrypted envelope around the unchanged version-2
  study-progress schema. Automatic cloud progress sync is not implemented.
- Install with **Update** over the existing app. Do not uninstall or clear app
  data. Native installation and Android lifecycle/device behavior still need
  verification on a phone; browser checks do not substitute for that.

## 2.3.27 first-login audio

Profile, sound and password-error Node tests passed (19 tests). Covers first successful login, app restart, per-user isolation, failed passwords/writes, older profiles and mute. First-welcome MP3 matches the supplied recording byte-for-byte. APK not built for this source update; physical Android audio playback not tested.

## 2.3.28 home ITU chart

Verified 26 table rows, three columns, alphabetical order and placement directly below the home hero. Existing phonetics playback test passes. JavaScript syntax check passes. Pronunciations checked against ISED RIC-22 section 4.3. APK not rebuilt; physical-device layout not tested.

## 2.3.31 ITU TTS controls

Eight existing preferences/phonetics tests passed. A mocked Android bridge verified 26 phrase calls A–Z, pause/resume, completion and restart. JavaScript syntax check passed. Physical Android TTS playback has not been tested; APK not rebuilt.


## 2.3.33 — paused TTS selection

- Passed 26 automated checks across narration offsets (6), preferences (7), saved-highlight edits (8), paused selection (4), and phonetics (1).
- JavaScript syntax checks passed for changed production scripts and the extended narration UI suite.
- Added UI regression scenarios for selecting the later repeated word, floating Play after selection dismissal, and inline Resume after saving a highlight. These browser scenarios could not run in this environment: Chromium was absent and its download returned an invalid archive.
- Physical Android TTS and long-press interaction remain untested for this source update. No APK was built for this change.


## 2.3.34 — ITU at 80% speed

- Runtime checks confirm ITU starts and resumes at 0.8× while other speech retains the profile rate.
- Paused-selection and phonetics tests passed (5 checks).
- Built version 2.3.34 (264); APK v2/v3 signatures and alignment verified using the existing development signing identity. Bundled assets match the source.
- Physical phone audio remains untested.
