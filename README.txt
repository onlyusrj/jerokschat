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
