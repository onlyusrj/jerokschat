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
