OnlyUs v37 — Whiteboard troubleshooting build

IMPORTANT: This package preserves the existing app files and membership-based Firestore rules. Do not replace firestore.rules with any public allow read/write rules.

Tamil steps:
1. Backup your current OnlyUs project folder first.
2. Extract this ZIP into a NEW folder (do not extract over your only copy).
3. Open index.html only if testing the website; for Android Studio, copy the updated web files into the same app assets folder used by your project.
4. In Firebase Console > Firestore Database > Rules, confirm the published rules include the members-only paths /chats/{cid}/share/{sid} and /chats/{cid}/share/{sid}/ice/{iid}. Publish only the secure firestore.rules included here if your current rules are missing those paths.
5. Sign in on both phone and laptop, open the SAME partner chat on both devices, then try Whiteboard.
6. This build reports the actual Firestore/WebRTC error in the app toast (instead of hiding it). If it still fails, send me the exact error text shown. Do not send passwords, API keys, or private login details.

Known status: Calls were already not connecting before. This package is focused on identifying the whiteboard failure first; a TURN server may be required for some networks, but we should use the displayed error to choose the next fix rather than guessing.

V38 FIXES
- Whiteboard: if the direct peer-to-peer link cannot connect (different networks / mobile data), drawing now continues through Firestore instead of cutting the session. Screen VIDEO still needs a direct link (set a TURN server for that).

V39 GAMES
- Added 3 games to the existing Play together hub (same request/accept/score/play-again flow, same share/game document, no rules change):
  Would You Rather (8 questions, co-op: how often you match), Truth or Dare (turns, cards drawn for both), Ludo (2 players, 4 coins each, 6 to start, exact roll to finish, capture, safe stars, extra turn on 6/capture/home, three 6s lose the turn).
- Fully close and reopen the app once so the new cache loads.

V40 US+ (built on v39 games)
- Our Space > "✨ Us+" tab opens 5 couple features (file couple-plus.js). Data is stored in chats/{cid}/coupleHub/cp_* which firestore.rules already allows for the two members: NO rules change.
  1) Days: "Been together" day counter, anniversaries (yearly), birthdays, countdowns.
  2) Sleep: each logs hours, ring + 7-day bars for both, rating Excellent/Good/Fair/Poor, "Get some sleep, babe" sends a chat nudge.
  3) Diary: month calendar + entries with mood, 4-8 digit PIN lock. The PIN only locks the screen on that device; entries are shared with your partner and stored unencrypted in Firestore. Photos are not included.
  4) Wordle: one sets a 5-letter secret word, the other has 6 tries. The word is stored in Firestore, so a tech-savvy partner could peek.
  5) Word Search: same 9x9 puzzle on both phones (generated from a shared seed), found words are shared and colored per person.
- Avatars: put your own bubu.png and dudu.png next to index.html (square PNGs). Without them, emoji 🐼 (you) and 🐻 (partner) are shown. Bubu/Dudu artwork is not included.
- Open-once photo errors now show the Firebase error code.
- Fully close and reopen the app once (cache v6).

V41 MOTION + PHOTO SAVE + REPLY JUMP
- fx-anim.js: every screen, overlay and tab now animates in (games hub tabs/boards, Our Space tabs and cards, tools grid, chat list, Us+, AI chat, photo viewer); buttons give press feedback; new messages pop in; floating AI/QR buttons float. Turned off automatically if the phone uses "reduce motion".
- Photo/video viewer has a "Save" button (downloads the file; if the browser blocks it, long-press to save). It is hidden for view-once photos/videos.
- Tap the quoted reply inside a message to scroll to the original message and flash it. Works for replies that stored the message id; if the original was deleted you get a small notice.
- Cache v7: fully close and reopen the app once.

V42 GALLERY WALLPAPER
- Chat tools (the tools grid inside a chat) > 🎨 Wallpaper > "🖼 Choose from gallery": pick any photo as the chat background. A slider dims it so messages stay readable; "Remove photo" goes back.
- The photo is resized (max 1280 px) and saved on THIS device only, separately for each chat. It is not uploaded and your partner does not see it. Picking one of the 5 built-in designs replaces the photo.
- New file wallpaper-gallery.js. Cache v8: fully close and reopen the app once.

V43 FIXES
- Send/receive sounds: the audio engine is unlocked on the first tap, the send sound plays immediately when you send (not after the server answers), and the volume is higher. This also works for photos/files/voice.
- Whiteboard requests now reach your partner even when they are on the chat list (not inside the chat), like calls. The sender sees "Partner got your request".
- Settings > "Calls & whiteboard check": runs a self-test (Firestore rules, mic permission, network path) and lets you paste a free Metered TURN app name + API key (saved on that phone). Without a TURN server, calls and screen video fail when the two phones are on different networks.
- Sound bug: the anti-spam check compared seconds with 100, so sounds were blocked almost always. Fixed (80 ms).
- Sending no longer waits for the server answer: the message appears at once with a clock and the send button is never locked, so you can keep typing offline and everything is delivered when you are back online.

V44 STICKERS + GIF BUTTON
- New sticker/GIF button right next to the attach (clip) button in every chat. It opens a panel with 4 tabs: Recent, Us (69 original animated panda & bear couple stickers: love, kiss, hug, miss you, good morning/night, sorry, angry, hungry, birthday, call me, etc.), Mine, GIF.
- Mine > Add stickers: pick many WhatsApp .webp / .png files at once (WhatsApp animated stickers keep moving), or a .wastickers / .zip sticker pack. Stored on THIS phone (IndexedDB). Long-press to delete. Each sticker must be under about 500 KB.
- GIF tab: save your own .gif files (under 500 KB each), or set window.GIPHY_KEY in firebase-config.js for online GIF search.
- The built-in panda & bear stickers are original artwork (not official Bubu/Dudu art). Old stickers from the emoji panel are still shown under Mine.
- New file stickers-pack.js. Cache v9: fully close and reopen the app once.

V44b NOTIFICATIONS + DELIVERED TICK
- BUG FIXED: sw.js crashed on start ("window is not defined" from firebase-config.js), so the service worker never registered. That is why push notifications did not arrive when the app was closed. sw.js now sets self.window=self first.
- Settings > "Hide text in notifications": Auto (hide when app lock is on) / On / Off. Hidden = notification only says "OnlyUs - You have a new message" (no text, no sender). Per phone.
- Double tick when the partner's app is closed but the phone is online: the service worker confirms the push to a new Cloud Function (ackDelivered) which marks the message delivered.
- Notification text now shows Photo / Sticker / Voice message / etc. instead of the same generic line.
- YOU MUST DEPLOY (once):  firebase deploy --only functions,firestore:rules
  (rules: devices docs may now hold hideMode + lock.) Both phones: fully close and reopen the app, then Settings > Notifications = On.
- Region: functions default to us-central1. If you deploy elsewhere set window.FUNCTIONS_REGION in firebase-config.js.

V45 VOICE NOTES
- Length bug fixed: a 15 s voice note showed 3-4 min because recorded WebM files carry no length. The sender now sends the real length with the voice note; older voice notes get it from the decoded audio. Seeking and the waveform progress use the same length.
- Clearer recording: mono 48 kHz with noise suppression, 96 kbps (was the low browser default).
- Waveform decoding no longer opens a new AudioContext per voice note (they piled up and could spoil playback).
- Settings > "Voice note text (transcript)" (default OFF): speech-to-text runs on the same microphone while recording and on many phones makes the voice note quiet/muffled. Turn it On only if you want the Aa text under voice notes.
- Both phones must update. Old voice notes show the right length after a moment. Cache v11: fully close and reopen the app once.

V46 DOUBLE TICK + GIF
- Double tick now also set when the partner's app is open on the chat list (not only inside the chat).
- GIPHY key added in firebase-config.js (GIF search works).
- Cache v12: fully close and reopen the app once.

V47 SETTINGS + PROFILE PHOTO
- Settings redesigned like WhatsApp: search, big profile photo, rows Profile / Account / Privacy / Chats / Notifications / Calls, Log out.
- Settings > Profile: Add / Change / Delete photo. The photo is saved on the phone AND in Firestore (chats/{cid}/coupleHub/pf_{uid}), so it stays until you delete it (also after reinstall) and your partner sees it in the chat list and chat header (tap it to enlarge). No rules change needed.
- New file profile-ui.js. Cache v13: fully close and reopen the app once.

V48 SHARED WALLPAPER
- Bug fixed: the chosen chat design / gallery photo was only applied after opening Chat tools > Wallpaper, so after closing the app it looked reset. It is now applied as soon as the chat opens.
- The wallpaper is now ONE per chat for both of you: when either of you picks a design or a gallery photo (or removes it), the other sees the same one. Stored in Firestore chats/{cid}/coupleHub/wallpaper (no rules change) and cached on each phone. Photos are resized to stay under ~700 KB.
- A wallpaper you had chosen on one phone before v48 is shared automatically the first time.
- Both phones must update. Cache v14: fully close and reopen the app once.

V49 LIQUID GLASS + BIG EMOJI + EMOJI SEARCH
- iPhone-26 style "liquid glass": header buttons, composer (text box + mic/send), emoji/sticker panel, attach menu, pop-up cards, tab bars and most buttons are now translucent glass with a blur, light edge and soft highlight.
- In a chat the messages now scroll UNDER the glass header and the glass composer, so the blurred messages show through the glass.
- Settings > Chats > "Liquid glass": On/Off, "Shade" slider (Light <-> Dark), "Blur" slider (Soft <-> Strong), live preview, Reset. Saved on THIS phone only.
- Top bar (Rok💕Jeru) is now slim and full width on phones (smaller buttons, no subtitle), and the chat header is slimmer too.
- One emoji sent alone is shown BIG with an animation (pop; hearts beat, laughing faces shake, fire flickers, party/stars spin) plus tiny floating emoji. 2-3 emoji alone are shown medium. Tap the big emoji to replay. Turned off by "reduce motion".
- Emoji panel has a search bar (English names, plus words like sirippu / kadhal / muthham; flags by country name). Names come from Unicode, so very new emoji (2023+) may not be found by name but are still in the categories.
- New files: liquid-glass.js, emoji-names.js. Cache v15: fully close and reopen the app once.

V50 FAST CHATS + OLD MESSAGES + SAVED FILES + PLAIN BACKGROUND
- Chat opens at once: the screen shows first, the room check runs quietly (after the first successful open on a phone), the security key is warmed up when you touch a chat row, and only the newest 50 messages are drawn (in one go, no layout thrash).
- Older messages: a card at the top asks "Do you need old messages?" [Yes] [No]. Yes loads 50 more (repeat until none are left); No hides the card until you reopen the chat. Settings > Chats > Show old chats: "Ask me" (card) or "Auto-load" (older messages load when you scroll to the top). Nothing is deleted: it is all still in the cloud.
- Saved files (service worker): photos, stickers, GIFs, voice notes and videos opened in chats are kept on the phone for 7 days, max 200 MB (oldest removed first), so reopening a chat uses no data. Settings > Chats shows the size and can clear them.
- Liquid glass is lighter on phones: smaller blur (default ~8 px instead of 25 px), no extra colour boost layer. Old saved blur is capped once. Photos load lazily, voice-note waveforms decode only when on screen and are remembered.
- Home background is now one solid colour. The faint "tiny boxes" were the browser dithering the old 3-colour gradient.
- Firebase demo mode got get()/endBefore() so paging can be tested without Firebase.
- Search/media views that read the open chat only see the messages loaded so far (50 + whatever you loaded).
- Cache v16: fully close and reopen the app once on both phones.

V51 SEND FIX + CONTACT INFO + WHATSAPP CALL SCREENS
- Flicker fix: every time the tick changed (clock -> sent -> delivered -> read) the whole message bubble was rebuilt and its pop-in animation replayed, so it blinked. Now only the tick is updated in place and the pop-in plays once, for brand-new messages only. Also the send button is no longer disabled while sending.
- Send sound: it no longer plays the moment you press send. It plays when the clock turns into the first tick (sent to the server). Offline messages stay on the clock, silent, and the sound plays when they are finally sent.
- Contact info page: tap the name or photo in the chat header. Audio / Video / Search buttons, About, Mute notifications, Media-links-docs, Starred, Disappearing messages, Advanced chat privacy, Chat theme, Encryption (security code to compare on both phones), Add to Favorites, Add to list, Export chat, Clear chat, Delete chat.
  * Advanced chat privacy (per chat, this phone): blocks Export chat and the photo/video Save button. It cannot block screenshots.
  * Favorites show a heart in the chat list. Lists show as filter chips above the chat list.
  * Delete chat removes the chat from your list (messages stay in the cloud, add it again with the same code). Clear chat hides the loaded messages on this phone.
- Call screen (WhatsApp style, liquid glass): blurred photo background, big avatar with pulsing rings, name, Calling / Ringing / Connecting / timer. Glass control bar: Speaker, Flip camera (video only), Video, Mute, End. Minimise arrow (green bar at the top: tap to return). Switching a voice call to video ends it and places a new video call.
- Incoming call screen: full screen, caller photo/name, round red Decline and green Answer buttons. Back key is ignored while ringing / in a call.
- Ringtone: with the Android bridge (see ANDROID-BRIDGE.txt) the PHONE'S OWN ringtone and vibration play, following silent/vibrate mode. In a normal browser a built-in ring tone is used. The caller hears a soft ring-back tone while "Ringing...".
- New file chat-v51.js. Cache v17: fully close and reopen the app once on both phones.

V52 HOME SCREEN, TABS, CALL ICONS
- Home header: "Only Us" on top; under it one row of bigger buttons: Settings, Sounds, Theme, Our Space, New chat. (The Rok/Jeru name and the tagline are gone. The Games button moved to the bottom tabs.)
- Bottom tabs are now Chats | Status | Games with one shared bar and a sliding highlight. Tap the active tab to scroll to the top.
- Swipe right-to-left to go to the next tab, left-to-right to go back. The screen follows your finger, then slides in. (Not on inputs, the calendar, canvases or sideways-scrolling strips.)
- All screen changes slide/fade softly, and every button/row gives a small press animation.
- Games tab: cards for all 9 live games. Tap one: it asks for the chat if needed, opens the games hub and sends the game request.
- Period moved into Our Space (the heart button): Our Space > Period opens the Period calendar. Back returns to Chats.
- Chat header call buttons are now WhatsApp-style icons (phone handset, video camera).
- New file home-v52.js. Cache v18: fully close and reopen the app once on both phones.

V53 STATUS (WhatsApp style) + NO-BLINK SCREENS
- Blink fixed: fx-anim.js faded every screen up from transparent (.view.on fxFade), and v52 slid screens with a fade too. Screens now only slide, and the chat message area fades in by itself once messages are drawn.
- Status tab rebuilt like WhatsApp: "My status" row (+ button, count and time), "Recent updates" and "Viewed updates" with a ring around each photo (one segment per status, grey once viewed).
- Post a photo, a video (up to 30 s, max 50 MB) or a text status (coloured backgrounds, tap the palette). Camera or gallery, several photos at once, a caption for each. Lasts 24 hours.
- Your partner sees it in her Status tab, as a coloured ring around your photo in her chat list, and a dot on the Status tab. Tapping the ringed photo opens the status.
- Viewer: progress bars, tap right/left for next/previous, hold to pause, swipe down or back to close. On your own status you see "Seen by ...". The trash button deletes it for everyone.
- Stored in Firestore: chats/{chatId}/statuses/{id}. firestore.rules has a new block for it -> DEPLOY:  firebase deploy --only firestore:rules
- Text statuses are encrypted like chat text when end-to-end is on; photos and videos go to Cloudinary like chat media.
- Status is posted into every chat you have (one entry per chat, deleted together). No push notification yet for a new status (the dot / ring show when the app is open).
- New file status-v53.js. Cache v19: fully close and reopen the app once on both phones.

V54 SOUNDS (new file sounds-v54.js + 3 audio files)
- sound_send.mp3: your cleaned WhatsApp send sound. Plays exactly when your message gets its first tick (not before).
- sound_media.mp3: one single beep (cut from your 3-beep file). Plays when your partner sends a voice note / photo / video while you are inside that chat.
- ringtone.mp3: "Shape of You" rings in a loop on an incoming voice or video call, stops when you answer / decline / the call ends.
- All three respect the existing Sound switch. If the phone blocks auto-play, the old ringtone is used as a fallback.
- ANDROID STUDIO: in your WebView setup add  webView.settings.mediaPlaybackRequiresUserGesture = false  so the ringtone can start by itself when a call comes in.
- Copy ALL files (including the 3 .mp3) into the assets folder. Cache v20: fully close and reopen the app once.

V55 VOICE NOTE PLAY FIX (voice-fix.js)
- If a voice note will not play from its web address, the app now downloads it, detects its real format (mp4 / webm / ogg / mp3) and plays it from the phone's memory. If that also fails, the real reason is shown in a small toast (for example "format not supported") instead of silently doing nothing.
- Cache v21: copy the files, fully close and reopen the app once.

V56 VOICE NOTE FIX 2 (voice-fix.js)
- Every voice note is now downloaded ONCE when its bubble is on screen, the real format is read from the file header, and it plays from the phone's memory (no more problems with CDN / service-worker range requests). The same download draws the waveform and the length.
- If the download itself fails, the plain web address is tried; if that fails too, a toast shows the real reason.
- All voice notes now have the SAME size (before they stretched to the width of long reply quotes).
- Cache v22: copy all files, fully close and reopen the app once.

V57 VOICE NOTE FIX 3 (voice-fix.js)
- After you press play the app now checks that the sound really moves. If it is stuck (the problem that only a restart fixed), the player is reset and the voice note is downloaded again from scratch, then the plain web address is tried. If all fail, a toast shows details (ready/net state, error, format).
- Cache v23: copy all files, fully close and reopen the app once.

V58 VOICE NOTES: "READ" COLOUR + AUTO-PLAY NEXT (voice-fix.js)
- A voice note you have listened to (it started playing for more than half a second, or finished) is marked as heard on this phone. Its waveform then shows in the chat's accent colour (Settings > Chats > accent colour). Not heard yet = grey waveform. While playing, the part already played is bright and the rest is dimmed.
- When a voice note finishes, the next voice note right below it that you have not heard plays by itself. It stops at the first message that is not a voice note, and never jumps between your voice notes and your partner's.
- Settings > Chats has a new row "Auto-play next voice note" (On/Off).
- Cache v24: copy all files, fully close and reopen the app once.

V59 💞 LOVE CORNER (new file love-v59.js)
Open it from: Chat tools (⋯) > 💞 Love Corner, or Our Space > 💞 Love Corner. The old ⏰ Schedule button now opens the new server-side scheduler.
- 💓 Heartbeat: tap = one beat, hold = keeps beating (max ~15). Your partner gets a glowing heart, vibration and a soft "lub-dub" if the app is open, or a push (with a heartbeat vibration) if it is closed. Counters for both of you.
- 🌦️ Heart weather: Sunny / Okay / Cloudy / Rainy / Stormy / Rainbow. A small badge shows next to the partner's name in the chat header for 24 h. Rainy or Stormy also sends a gentle "send some love" nudge to the partner (the other moods stay quiet).
- 🌙 Good night: the button (floating chip in the chat + card in Love Corner) appears ONLY from 9 PM to 5 AM. It sends a sweet good-night message and when both of you have pressed it you both get a starry-night animation + chime and a night streak.
- ⏰ Scheduled messages: now sent by the SERVER at the chosen time, even if both phones are off. The text is encrypted on your phone first (end-to-end stays on). Cancel any time in the list. (Old device-only schedules still fire if the app is open.)
- 🥺 Miss-o-meter + 🎁 Our Wrapped: tap 🥺 any time (partner gets a push). Wrapped (This month / This year / All time) is a tap-through story: who talked more, "love you" count, WHO MISSED WHOM MORE (typed "miss you" / "miss pannuren" + 🥺 taps), who starts the chat, reply speed, night owls, favourite emoji, voice notes and photos, longest streak. Everything is calculated on the phone; nothing leaves the device.
- 🍚 Care nudges: one tap asks Saptiya? / Thanni kudichiya? / Medicine edutiya? / Safe ah reach aayitiya? / Thoongala?  The partner answers with one tap (Ate ✅ / Not yet 🥺). Daily auto reminders at a time you choose (server, works with the app closed). Optional switch "Share my period tips with partner": the partner gets a daily sweet heads-up (day 1, period days, PMS days). Off by default, only the owner can switch it.
- YOU MUST DEPLOY (once):  firebase deploy --only functions,firestore:rules
  New rules: lvSched + lvRules (owner only). New functions: lvBeat, lvMiss, lvMood, lvCare, lvScheduler (every minute), lvCareScheduler (every 15 min), lvPeriodTips (hourly). Scheduled functions need the Blaze plan (you already use scheduled functions).
- sw.js: notifications now vibrate (heartbeat pattern for 💓). Cache v25: copy all files, fully close and reopen the app once on both phones.

V60 GAMES FIX (home-v52.js + index.html)
- Games tab (next to Status): the game list can now be scrolled all the way down (it was stuck because the grid had no scroll area).
- Games tab: the game you tap is now the game that starts. Before, the hub reopened the old Draw & Guess (still saved from the last time) whatever you picked. Now: if the old game is finished / not running, the chosen game's request is sent straight away; if a different game is still running, it asks "Quit it and start <game>?"; if your partner already sent you a request, that request is shown.
- Cache v26: copy all files, fully close and reopen the app once.

V61 NEW GAMES (new file games-v60.js + small hook in index.html)
Play together hub (and the Games tab) now has 4 more live 2-player games. Same request / accept / score / play-again flow, same share/game document (NO firestore.rules change).
- 🔲 Dots & Boxes (4x4 boxes): tap a dotted line; closing a box gives you another line. Most boxes wins.
- 🚢 Battleship: each of you gets a random fleet (Shuffle until you like it, then Ready). Hit = shoot again, miss = turn passes. Sinking a ship is announced. First to sink all 5 ships wins.
- ❓ Trivia Duel: 10 questions (general, India, Tamil Nadu), 20 seconds each, both answer at the same time, 1 point per correct answer.
- 🃏 Color Cards (Uno-style): match colour or number, Skip (opponent loses turn), +2, Wild, Wild +4. Draw a card if you cannot play; if the drawn card fits you may play it or pass. First to empty the hand wins.
- Like Wordle / Ludo dice, the hidden info (ships, hands) is stored in Firestore, so a very tech-savvy partner could peek.
- Cache v27: copy ALL files (games-v60.js is new), fully close and reopen the app once on both phones.

V64 (couple-v64.js + small edits)
- Header: logo removed, "OnlyUs" text in the top-left corner.
- "Our Space" is now a bottom tab right after Chats (couples mode only).
- Default theme is Light (Settings > Chats > Theme still lets you pick Dark or System).
- Games: cover pictures replace emojis. To use real photos, put <game>.jpg in img/games/ (ttt, c4, rps, memory, duel, draw, wyr, tod, ludo, dots, bship, trivia, cards); the .svg covers are the fallback.
- Couples extras: floating hearts, "Together for N days" card, question of the day, heart burst on tap, bubble pop-in.
- Cache v31: copy ALL files (couple-v64.js and img/ are new), then fully close and reopen the app once.

- v64b: 3-dots menu now opens as a row inside the header (Settings, Sound, Theme, New chat, Hide). Cache v32.

- v64c: game covers are now embedded inside couple-v64.js (no img/ folder needed). Cache v33.

- v64d: home screen scrolls as one page with animated scenes + date idea; PDFs open in an in-app viewer. Cache v34.


V65 EVERYDAY CHAT FEATURES  (new files: pro-v65.js, pro-media-v65.js, functions/linkpreview.js)
What is new
 Chat list     - Press and hold a chat (or right-click): Pin chat (up to 3), Archive chat, Remove chat. Archived chats sit under an "Archived" row.
 Saved messages- Bookmark button in the three-dots row on the home screen. A private chat with yourself for notes, links, photos, PDFs.
 Message info  - Press and hold a message > Info (type, sent, delivered, read, size, disappearing time).
 Labels        - Press and hold a message > Label (Important, To-do, Idea, Money, Read later, Personal). Chat tools > Labels lists them all. Labels are saved on this phone.
 @mention      - Type @ and the contact's first name to pick it. Mentions are highlighted; a mention of you has a soft highlight.
 Link preview  - Links in messages are clickable and show a card with title, text and picture. Settings > Storage and data > Link previews turns it off.
 Location      - Attach menu > Location. Sends a map card (OpenStreetMap). The location travels inside the encrypted message text.
 Auto-translate- Chat tools > Auto-translate. Pick English / Tamil / Hindi / Telugu / Malayalam / Kannada. Incoming messages get a translation under them. Works for English <-> Indian scripts. Tanglish is NOT translated.
 Chat sound    - Chat tools > Chat sound. A different tone (or silent) for each chat while the app is open.
 Video message - Attach menu > Video message. Records up to 60 seconds, shown as a round video.
 Scan document - Attach menu > Scan. Photo > straighten the corners > Enhanced / Black & white > many pages > one PDF.
 Edit photo    - Pick a photo, then tap the pencil on the preview: crop, rotate, draw, text, emoji.
 Storage       - Settings > Storage and data: how much media each chat uses on this phone, clear all or per chat.
 Auto-download - Same page. Photos and videos: Always / Wi-Fi only / Never. Not downloaded media shows a Download button.
 Backup        - Same page. Back up to a file or to the cloud, and restore. Only harmless settings are saved (theme, stickers, labels, pins, starred...). PIN, lock, encryption keys, AI key and contacts are never included. Your messages are already in the cloud.
 Picture-in-picture - Button on the video call screen (browser). Android app: see ANDROID-BRIDGE.txt part C.

How to install (IMPORTANT, in this order)
 1. Firebase Console > Firestore > Rules: paste the new firestore.rules and Publish (adds the cloud backup document).
 2. Functions: copy the functions folder, run  firebase deploy --only functions  (adds linkPreview). Without it links still work, you only get a simple card for YouTube links and no card for other sites.
 3. Hosting: copy ALL files (pro-v65.js and pro-media-v65.js are new; index.html, sw.js changed). Cache is now v35, close and reopen the app once.
 4. Android app: see ANDROID-BRIDGE.txt part A-E for location, camera and picture-in-picture.

Limits to know
 - Archive, pins, labels, chat sounds and download settings are saved on each phone separately (not shared with your partner and not synced between your phones, except through the backup).
 - Notification sound when the app is fully closed is chosen by Android, not by the per-chat sound.
 - Auto-translate and the map picture use free outside services (MyMemory, OpenStreetMap). Link previews use your own Firebase function.
 - Scanner corner detection works best when the paper is brighter than the table. You can always drag the four corners.


V66 INTRO, LANGUAGES, HOME + OUR SPACE  (new files: i18n-v66.js, onboard-v66.js)  Cache v36
- First launch: premium intro with a language picker, then sign up, then (after the name step) welcome, age (12+), gender, love start date and a short animated tour.
- Languages (13): English (default, never changes by itself), English (India), Hindi, Tamil, Spanish, Mandarin Chinese, Arabic (right-to-left), French, German, Japanese, Korean, Portuguese, Russian. Pick in the intro or Settings (first row).
  Translated so far: intro, onboarding, home feature cards, Our Space title, tab names, care nudges, good-night messages. Other screens are still English.
- Tanglish text removed: care nudges ("Did you eat?" ...), good-night messages, AI key messages, server reminders (functions/index.js, redeploy functions).
- Home: animated heart next to OnlyUs, animated "What you can do" cards.
- Our Space: fixed "Rok Jeru" title removed. Default is "Name 💕 Name" (or "Our Space"); tap the title to set your own.
- firestore.rules: users/{uid} may now hold an "ob" map (age, gender, since, title, lang). Publish the rules again.
- Install: copy ALL files, publish firestore.rules, firebase deploy --only functions, fully close and reopen the app.
