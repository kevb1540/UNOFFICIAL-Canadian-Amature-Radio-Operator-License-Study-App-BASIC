# 2.3.42 (272)

- Add a small pale-pink HELP shortcut below Glossary and an offline Help page covering the app's study, narration, double-tap, ITU, notes, profile, settings, backup and update functions.
- Back at the top, Android Back and Escape restore the original mounted screen, scroll, forms, expanded sections and focus. Pause active narration, recordings and guided tuning while Help is open, then continue on return; preserve already-paused restart anchors.
- Retain Play ITU Alphabet ONLY and paused double-tap restart from the preceding work.

# 2.3.41 (271)

- While lesson speech is paused, double-tap a word in the current lesson to set where the next Play/Resume starts, without starting audio immediately.
- Support touch double-taps and mouse double-clicks, exact repeated-word positions and inline/saved-highlight text. Ignore other lessons, controls and blank space; reject scroll gestures and long holds as double taps.
- Keep selection/highlighting as another way to choose a paused restart point and retain the new Play ITU Alphabet ONLY control from 2.3.40.

# 2.3.40 (270)

- Add Play ITU Alphabet ONLY below the existing Play button in the home ITU alphabet box, available with the chart collapsed or expanded.
- Read just Alfa through Zulu in alphabetical order, using the selected installed voice at the alphabet's existing 0.8× speed.
- Share Pause/Resume, floating playback and Stop with the existing reader; restarting begins at Alfa. Keep the original letter-is-for-word playback available through Play.

# 2.3.39 (269)

- Show the current spoken word in red text with a transparent background.
- Remove background rectangles from the older-WebView speech overlay; draw only red glyphs while retaining inline fonts and the existing page/saved-highlight background.
- Preserve continuous narration, exam-answer cues, source offsets and saved highlights.

# 2.3.38 (268)

- Read the answers and worked explanations in Apply this lesson to the exam even when their Show Answer panels are collapsed.
- Say "Answer." once before each answer. Replace the ordinary "Correct answer:" label in speech while retaining false-statement warnings and explanations.
- Keep visual answer toggles, source text and saved-highlight offsets unchanged. Other hidden sections and collapsed details remain excluded; lesson speech stays continuous.

# 2.3.37 (267)

- Fix pauses after every lesson word by removing the one-word timing probe and the per-word speech fallback. All lesson voices now read continuous, bounded passages.
- Phrase-only callbacks no longer cancel and restart the current utterance. Precise word callbacks still drive read-along highlighting; without precise timing the reader leaves the cursor clear.
- Preserve the selected voice/speed, Preview voice, pause/resume, selection-based restart and the phonetic alphabet's 0.8× reading speed.

# 2.3.36 (266)

- Play a spoken sample when Preview voice is pressed, using a fresh snapshot of the voice and speech speed currently shown in Settings, including the slider's live value.
- Stop other app sounds before the sample. Preview remains available when sound effects are disabled and keeps the existing Preview voice / Stop reading button behavior.
- Keep lesson reading on the saved profile preferences and retain the phonetic alphabet's fixed 0.8× speed.

# 2.3.35 (265)

- Use the same fixed-size Settings button for Preview voice and Stop reading; Stop appears only while the test voice plays.
- Restore Preview after stopping, pausing, finishing, errors, background cancellation or navigation.
- Hide Refresh voices until a saved voice or speed edit, or opening Phone voice settings. Give it a dedicated amber colour across all themes and hide it immediately when clicked.
- Keep refresh visibility local to the current profile session; failed or unchanged saves and unrelated settings do not reveal it.

# 2.3.34 (264)

- Read the home ITU phonetic alphabet at 80% of normal TTS speed (0.8×), including after Pause / Resume. Lesson narration continues to use the profile’s chosen speed.

# 2.3.33 (263)

- While lesson TTS is paused, selecting or highlighting a word sets the starting point for Play / Resume, including the floating Play button.
- Remember the exact selected occurrence after selection dismissal or saved-highlight rendering. Without a new selection, resume from the paused word.

# 2.3.32 (262)

- Use the exact ITU equivalent for every spoken phrase: [letter] is for [ITU equivalent], including A is for Alfa.

# 2.3.31 (261)

- Add top-right Play/Pause and Stop controls to the home phonetic alphabet box using Android TTS and the selected reading voice/speed.
- Read A is for Alpha through Z is for Zulu, one phrase at a time. Resume repeats the interrupted letter; Stop resets playback.

# 2.3.30 (260)

- Collapse the home ITU chart and source beneath the introductory text by default. Add an accessible arrow button to expand and collapse the contents.

# 2.3.29 (259)

- Remove SHAR LEE and OO NEE FORM alternatives from the home-page ITU pronunciation chart; retain CHAR LEE and YOU NEE FORM.

# 2.3.28 (258)

- Add the complete A–Z ITU phonetic alphabet chart immediately below the home hero card, with letter, ITU equivalent and pronunciation columns.
- Check spellings and pronunciation against ISED RIC-22 section 4.3 and link the source below the chart.

# 2.3.27 (257)

- Remove the Try antenna tuning shortcut from the home page. The antenna lab remains available under Labs.
- Play the user-supplied Welcome recording once on each new profile’s first successful login; preserve the normal greeting for returning users.
- Persist first-login completion in encrypted profile storage, including User backups, and honour the sound effects setting.

# 2.3.26

- Move References and Question Bank Attribution above the copyright; keep the version below.

# 2.3.25

- Show the installed app version below the copyright on every page.

# 2.3.24

- Added offline phonetic alphabet learning, word spelling and ten-letter listening practice.
- Bundled all 26 user-supplied audio clips.

## 2.3.23 (253)
- Added supplied Oops audio for incorrect passwords and mismatched confirmations; kept error text and mute support.

## 2.3.22 (252)
- Added accessible, independent Show/Hide controls to all password fields.

## 2.3.21 (251)
- Added Kevin’s farewell recording on sign out and in-app quit, with completion-aware playback, mute support and duplicate-quit protection.

# Version 2.3.18 — 24 October 2026

- Hid the Glossary shortcut on Choose your user profile, including initial load
  and returning after sign-out. It is available on other profile and study screens.
- Added a hard subtitle line break after “Guide,” placing “And Reference” below.
- Increased title and subtitle fonts, with larger lettering on the profile chooser
  and responsive sizing for small phones. Increased header space to keep text clear
  and existing speech controls below it.
- Built a compatible signed update with the original package and key, code 248.

# Version 2.3.17 — 24 October 2026

- Replaced the title subtitle with “Unofficial Basic Certificate Study Guide And
  Reference.” The complete app title is now “Canadian Amature Radio Unofficial
  Basic Certificate Study Guide And Reference.”
- Updated the header, page title, home-button accessible label, Android app label,
  Settings/About title, product documentation and bundled recovery-message copy.
- Retained the package ID and signing key for compatible updates, code 247.

# Version 2.3.16 — 24 October 2026

- Added a fixed Pause / Play control near the top-left corner below the app header
  during narration and voice preview. It stays available while paused and remains
  synchronized with the inline controls, including resume from the current word.
- Set the floating control to exactly 70% opacity when it covers visible text,
  returning to full opacity over empty space. Rechecks follow scrolling, viewport
  changes, text edits and layout changes without modifying lesson content.
- Hide the current-user banner and its Profile/Settings buttons on the
  Options/Settings page, matching the Profile Settings page.
- Clear the floating control when speech finishes, fails or stops, and on
  navigation, backgrounding and profile changes. Preserve saved highlights,
  word tracking, voices, speed, themes and profile data.
- Built a signed compatible update with the original package and key, code 246.

# Version 2.3.15 — 24 October 2026

- Highlighter Colour in the lesson long-press menu offers eight named colours.
  The choice is saved per profile for future highlights and immediately recolours
  the selected portions of existing marks without colouring surrounding plain text.
- Added Remove Highlight for selections that include saved highlights. Partial
  removal preserves surrounding colours and erases all older overlapping layers
  under the selected portion. Recolouring and removal survive reopening and backups.
- Changed the spoken-word cursor to a black background with white text in every
  theme, including the older-WebView fallback. Moving or stopping narration
  reveals the unchanged saved highlight beneath it.
- Retained the selected passage while Android dismisses its native menu to open
  the colour list. Failed writes roll back marks and the colour preference together.
- Built a signed compatible update with the original package and key, code 245.

# Version 2.3.14 — 24 October 2026

- Added a temporary highlight for the word currently being read, driven by native
  and browser speech timing. Voices without usable word timing use precise
  per-word playback. The spoken-word cursor is separate from saved highlights.
- Added Read from here to the Android long-press menu and browser text-selection
  toolbar. It starts or moves narration to the selected word, including repeated
  words, inline formatting, saved highlights and spoken unit symbols.
- Kept the current word visible during reading; pause, resume, stop, completion,
  navigation and profile changes update or clear the cursor appropriately.
- Built a signed update with the existing package and signing key, version code 244.

# Version 2.3.13 — 24 October 2026

- Replaced the female/male voice controls with one list of available installed
  voices and one Preview voice button.
- Added a Speech speed slider from 0.5× to 2× with a live value and per-profile saving.
- Kept the selected voice, reading speed and theme separate for each profile
  and included in encrypted User backups.
- Migrated the previously active saved voice from version 2.3.12 profiles and
  backups into the single voice preference.
- Built a signed update with the existing package and signing key, version code 243.

# Version 2.3.12 — 24 October 2026

- Added lesson reading with play, pause/resume and stop, installed female/male
  voice assignments, previews and reading speed from 0.5× to 2×.
- Added profile Settings access beside Profile and eight colour themes, including
  Daylight and Warm paper. Voice and theme choices save inside each encrypted
  profile and its User backup. Progress merges keep current preferences.
- Added Android on-device speech, audio-focus handling, unavailable-voice guidance,
  speech settings access and automatic cancellation on navigation/profile changes
  and when the app leaves the foreground. No paid speech service is required.
- Expanded government source attribution and compared all 984 bilingual official
  questions and answer keys with the original ISED download; no differences.
- Retained the existing package and signing key and built version code 242.

# Government-source attribution work — 24 October 2026

- Replaced abbreviated government references with their full material titles;
  added institutional authors, source editions, page dates and original URLs.
- Added explicit copy-of-version notices in the credits, reference desk,
  question bank and each chapter's reading sources. Distinguished copied
  government wording from independently written study explanations.
- Compared all 984 English/French questions and answer keys with the live ISED
  download and checked the recorded SHA-256: no differences.
- Added a government-source catalogue, recorded review and repeatable source
  verification script. Preserved ©️ Kevin W. Brown 2026 and existing app features.
- These changes are included in the signed version-2.3.12 APK above.

# Version 2.3.11 — 17 October 2026

- Added On-air terms & phrases to Glossary & definitions and Mode definitions:
  61 common expressions in six groups, with meanings, examples, usage notes,
  and question/statement forms for Q codes. Added phonetics and sample contacts.
- Made all on-air terms searchable in the full glossary, reference desk and
  quick lookup. The On-air language filter includes all 61, including existing
  terms; the combined glossary contains 223 unique definitions.
- Preserved existing definitions, course content, question bank, profiles,
  coloured highlights, formula lessons and chapter test achievements.
- Built a compatible signed update, version code 241. See VALIDATION.md.

# Version 2.3.10 — 17 October 2026

- Made all 16 formula cards open dedicated offline teaching pages with definitions,
  variables and units, named symbols, rearrangements, examples, tips, related
  formulas and links to the existing labs. Back restores the formula list position.
- Added Highlighter Colour alongside Highlight in the Android lesson selection
  menu and browser selection toolbar. The picker offers Yellow, Green, Cyan,
  Blue, Purple, Pink, Orange and Red, with a saved preference per user.
- Stored each mark’s colour in encrypted progress and .carprog backups. Kept
  older yellow marks compatible, preserved surrounding colours when selections
  overlap, and allowed selected passages to be recoloured without duplicates.
- Added PASSED and bold gold PASSED WITH HONORS beside chapter names, using
  the best submitted chapter test at 70% and 80% respectively. Existing history
  counts; study mode, unfinished tests and full-exam results do not award labels.
- Retained all prior features, copyright and the compatible signing identity.
  Increased the Android version code to 240. See VALIDATION.md for checks.

# Version 2.3.9 — 17 October 2026

- Built a fresh signed APK update with version code 239.
- Retained lesson highlights, encrypted user backups, the built-in recovery
  address and all other 2.3.8 functionality.
- Re-ran all 128 automated checks and verified update identity, signatures,
  alignment and bundled assets. Physical Android installation remains untested.

# Version 2.3.8 — 17 October 2026

- Added Highlight to the Android lesson text-selection menu. Selected text is
  yellow with dark lettering; the browser preview has a selection toolbar.
- Saved lesson highlights per user and included them in both progress and User
  .carprog backups. Added validation, legacy defaults and deduplicating merges.
- Kept marks anchored across navigation, reopen and answer-visibility changes,
  with quote checking, overlap handling and failed-save rollback.
- Built in https://radio-recovery.kevb1540.workers.dev and removed editable
  recovery-address fields. Email verification remains required per user.
- Preserved existing features, profiles, passwords, course content, backup
  naming and signing identity. Version code is 238; all 128 checks passed.
  Physical Android long-press and live recovery email delivery are untested.

# Version 2.3.7 — 17 October 2026

- Named backups <username>_<YYYY-MM-DD>.carprog using the backed-up user's name
  and the device's local calendar date, including exports before login and
  pre-update recovery exports. Safe spaces and Unicode names are preserved.
- Routed Android progress exports through the same named-backup path as User
  exports. Kept backup content, formatting, encryption and .carprog-only imports.
- Confirmed full User backups restore the avatar, optional call sign, account
  details, password protection and every populated study-progress field;
  clarified the complete User backup option in the app and README.
- Retained all existing study, profile and recovery features; increased the
  signed update version code to 237. Passed 116 checks and verified signatures,
  ZIP alignment and assets. Physical Android installation remains untested.

# Version 2.3.6 — 17 October 2026

- Changed all exported backup filenames to .carprog while preserving the
  existing file contents, JSON formatting and encrypted user-backup format.
- Restricted user and progress imports to .carprog only. Browser and Android
  paths reject other extensions before reading contents; invalid selections
  clear a previously selected user backup.
- Retained the lesson Show Answer / Hide Answer controls and optional encrypted
  profile call sign, together with existing passwords, avatars, progress and
  email recovery setup. Increased the signed update version code to 236.
- Passed all 116 checks, including real .carprog download/restore and wrong-
  extension rejection. Verified APK identity, signatures, alignment and assets.
  Physical Android installation and document pickers remain untested.

# Version 2.3.5 — 17 October 2026

- Added Show Answer / Hide Answer boxes beneath each question in Apply this
  lesson to the exam. Every answer and its worked explanation starts hidden;
  each control works independently and supports keyboard activation.
- Added an optional Call sign field in Profile Settings. Users can save, edit
  or remove it. It appears beneath their name while studying and stays private
  in the encrypted profile and user backup.
- Preserved existing profiles, passwords, study progress, course content,
  recovery setup and branding; increased the update version code to 235.
- Passed all 114 automated checks and verified signing, version increase,
  unchanged native DEX, bundled assets and ZIP alignment. Physical Android
  installation remains untested.

# Version 2.3.4 — 17 October 2026

- Changed the icon's bottom-right maple leaf to red, preserving its antenna design.
- Replaced the header's old symbol with a bundled copy of the same updated icon.
- Added PNG content typing in the native asset loader, with no text encoding for
  binary images, so the logo loads offline inside the installed app.
- Preserved profile warnings, progress formats, package and signing identity;
  increased the version code to 234.
- Passed all 109 automated checks; header/native icon pixels, signing and ZIP
  alignment verified. Physical Android installation remains untested.

# Version 2.3.3 — 17 October 2026

- Added a bold red Select an Avatar Image prompt in Profile settings when the
  user has no chosen image. It disappears after an image is selected and saved.
- Enlarged the red Profile exclamation to 24 px with heavy bold weight; it keeps
  the existing requirement for verified recovery email and an avatar image.
- Retained the package, signing identity, native implementation, profile format,
  study content and saved progress; increased the version code to 233.
- Passed all 109 automated checks, with expanded avatar-prompt assertions and
  enlarged badge styling checks; signing and ZIP alignment verified. Physical
  Android installation remains untested.

# Version 2.3.2 — 17 October 2026

- Highlighted incomplete email recovery in Profile settings with a bold red
  heading, a red exclamation mark to its left, and red disabled-recovery text.
  Verification restores the previous heading and status appearance.
- Added a red exclamation mark beside Profile until the signed-in user has
  both verified recovery email and a chosen avatar image. Default initials
  remain incomplete; warnings update per user and on return from settings.
- Preserved the profile format, native implementation, study data and update
  signing identity; increased the APK version code to 232.
- Kept placeholder banner avatars round and passed all 109 automated checks,
  including per-user warning state and persistence checks. Signing and ZIP
  alignment verified; physical Android installation remains untested.

# Version 2.3.1 — 16 October 2026

- Built a new update installer with version code 231 and the same package and
  development signing identity as 2.3.0.
- Clarified the app's email recovery address field: use the deployed HTTPS
  origin without /health or /v1; email credentials and master keys stay on the
  recovery service. The Cloudflare endpoint remains user-configurable.
- Retained local user profiles, encrypted progress and user transfers, avatars,
  email reset integration, all lessons and tests, glossary, notes and credits.
- Included the Cloudflare/D1/Brevo deployment files and guide in the source.
- Passed all 107 automated checks; signing, version increase, bundled assets
  and ZIP alignment verified. Physical Android installation remains untested.

# Cloudflare hosting addition — 16 October 2026

- Added a standalone Cloudflare module Worker, persistent D1 schema and Brevo
  transactional email integration, compatible with APK 2.3.0; no APK changes.
- Added dashboard setup, approved-recipient settings, a browser-local master-key
  generator, database request/mail budgets and atomic code replacement/use.
- Preserved the Python/SMTP service and its original self-hosting instructions.
- Passed 17 local Worker checks with SQLite and intercepted Brevo HTTP,
  including the existing app profile module's recovery flow. Live deployment
  and email delivery require setup in Kevin's accounts.

# Version 2.3.0 — 16 October 2026

- Added a startup user list with avatars and an Add New User form requiring a
  profile name, password/confirmation and email. Each user's password page shows
  the selected identity; study pages identify the signed-in user and offer logout.
- Encrypted each user's progress separately; migrated existing shared progress
  into the first created profile and kept all other users independent.
- Added avatar selection from files and Android camera capture, plus avatar and
  password changes in Profile settings.
- Added password-authenticated encrypted user export/import before login,
  including credentials, avatar and progress. Duplicate imports use a named copy.
- Included verified-email password reset integration and a self-hosted SMTP
  recovery service. Email delivery needs a configured HTTPS service and SMTP
  account; it is not preconfigured. Passwords are never emailed or stored in
  plaintext. Added Email_Recovery_Setup.md.
- Kept pre-update snapshot export scoped to the current user and preserved
  the legacy progress JSON option for compatibility/emergency recovery.
- Retained the package/signing identity, official content, lessons, glossary,
  titled notes, tests, scores and labs. Added Internet permission for recovery;
  camera/files use system activities without broad storage or camera permission.
- Passed 89 automated checks. Actual Android installation, camera/pickers and
  live SMTP delivery remain untested.

# Version 2.2.1 — 16 October 2026

- Routed the attribution footer to a dedicated source-owner credits page.
- Identified the official question bank as Government of Canada (Crown
  copyright) material published by ISED, with original bank and rights links.
- Credited every government and manufacturer reference, including the IC-T10
  source and the RT95 manual's separate manufacturer and mirror host.
- Distinguished Kevin's original app and teaching material from source rights.
- Preserved the questions, lessons, glossary overlay, notes and saved progress;
  retained the package and signing identity with version code 221.
- Passed 26 core and 35 browser checks; native installation remains untested.

# Version 2.2.0 — 15 October 2026

- Replaced the brief readings with 100 detailed topic lessons: over 15,000
  words of concept teaching, plus tables, worked examples and all tested facts.
- Every official question is mapped to an explicit contextual teaching example.
- Review feedback links the exact topic; worked calculation and false-statement
  feedback explain the actual question rather than a generic chapter reminder.
- Marked chapter 12 as cumulative and linked every prerequisite topic. Removed
  the stale claim about an old 124-question question pool.
- Added a persistent glossary overlay on every screen; lookup preserves tests,
  page position, antenna settings and unfinished note drafts.
- Kept official questions, scoring, data storage, package and signing identity.
- 26 core and 34 browser checks passed; native installation remains untested.

# Version 2.1.0 — 14 October 2026

- Added Personal Notes to Home and the main navigation.
- Each saved note requires a title; notes support editing, search and deletion
  with confirmation.
- Unfinished drafts save separately and resume after reopening the app.
- Progress backups and merge imports now include personal notes and drafts.
- Existing version-2.0.0 scores and chapter notes continue to load.
- Kept the package ID and signing key; increased the version code to 210.
- Fixed direct-build version overrides to update the actual APK manifest.
- Passed 20 core and 24 browser checks; APK signatures and alignment verified.
  Native Android installation still requires a phone check.
