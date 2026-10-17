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
