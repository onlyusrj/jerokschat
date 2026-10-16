OnlyUs — Email + Password edition

WHAT CHANGED
- Login / create account uses Firebase Email/Password authentication. No phone number or SMS OTP is required.
- The existing OnlyUs premium design, Bubu & Dudu decoration, sounds, chat UI, and Firebase Firestore message flow are retained.
- Your profile name is set after first sign-in. The Firebase UID is used as the internal user identity.
- To add your partner, both people must create accounts in the same Firebase project. Each person copies their Firebase UID from the app and shares it privately. On the + form, enter partner name, optional email, partner Firebase UID, and the same private shared code (12+ characters) on both devices.

SETUP
1. Firebase Console > Authentication > Sign-in method (or Sign-in providers) > Email/Password > Enable > Save.
2. Authentication > Settings > Authorized domains: make sure your Netlify domain is listed.
3. Keep firebase-config.js beside index.html. Confirm it points to the intended Firebase project.
4. Firestore Database > Rules: review and publish firestore.rules. Never publish unrestricted rules.
5. Deploy the contents of the chatzip folder to Netlify. Then hard-refresh the site.
6. Each person chooses “Create account” once with their own email and a strong, unique password. Later use “Sign in”. Keep passwords private and do not share them with each other.
7. After sign-in, set your display name. Copy the Firebase UID shown in the app and share it privately with your partner. Add the partner UID and the same private shared code on both devices.

IMPORTANT
- This ZIP has been edited to use Email/Password in the interface and auth handlers, but live Firebase end-to-end behavior has not been tested here.
- Existing locally saved contacts created using phone-number IDs may not work with the new UID-based setup. Remove old contacts and add the partner again using their Firebase UID.
- Firestore rules must match the actual chat data model. Review rules before using real private messages.
- A public Netlify URL is accessible to anyone; privacy depends on Firebase Authentication and correct Firestore rules, not on the URL being hard to guess.

CLOUDINARY MEDIA STORAGE (photos, videos and voice notes up to 50 MB)
1. Cloudinary Cloud name: hb5szrd0.
2. Upload preset: onlyus_chat (Unsigned).
3. OnlyUs uploads chat images, videos and voice notes directly to Cloudinary. Firebase Storage is not used for chat media.
4. Firestore stores the Cloudinary secure URL plus basic media metadata; the media bytes stay on Cloudinary.
5. The app rejects media larger than 50 MB before upload.
6. Do NOT put a Cloudinary API secret in the frontend. This build uses the unsigned upload preset only.
7. View-once messages are marked opened in Firestore; automatic Cloudinary deletion is intentionally not attempted from the browser because deletion requires authenticated server-side credentials.


SCREEN SHARE + WHITEBOARD (🖍 button in a chat)
- Publish the updated firestore.rules (adds the share/ice signalling paths).
- Both people must have that chat open. Desktop browsers share a screen/window/tab; phones use the whiteboard mode (browsers cannot share a phone screen).
- Drawing goes peer-to-peer. Free STUN only: strict networks or mobile data may need a TURN server.


UPDATE: CHAT LIST BACKUP (login anywhere, chats stay)
- Your name and chat list (partner UID + shared code) are now saved in Firestore at users/<your uid>, so after Sign in on any device or browser your chats come back automatically. Messages were already stored in Firestore.
- You MUST publish the updated firestore.rules (adds the users/{uid} rule). Without it the app falls back to this-device-only storage and shows a toast.
- First sign-in after this update on a device that already has chats migrates them to the cloud automatically.
- Still stored only on the device: profile picture, theme/app-lock settings, and "delete for me" hides.
- Anyone who can read your Firebase project (the owner) can see users/<uid> including the shared code, same as messages.

UPDATE: TURN SERVER (screen share / whiteboard on strict networks)
1. Create a TURN account (example: Metered.ca > Dashboard > TURN Server > Add Credential).
2. In firebase-config.js fill TURN_CONFIG: meteredApp + meteredApiKey, OR servers: [{urls, username, credential}] for any provider/coturn.
3. Redeploy. If TURN_CONFIG is empty it still uses free STUN only.
4. The credential ends up in the public site code, so use a free/low-cap plan and rotate it if abused.


UPDATE: ADD PARTNER BY PHONE NUMBER
- Each person saves their own number (with country code, e.g. +91 98765 43210) on the first setup screen or in Settings > Phone number.
- To start a chat: tap +, type partner name, partner phone number, and the same shared code (12+ chars) on both devices. The Firebase UID box is only a fallback.
- Publish the updated firestore.rules (adds phones/{hash} and the phone field in users/{uid}).
- The number is NOT verified by SMS, so anyone could save a number that is not theirs (first come, first served). The shared code still keeps chats private: someone who claims your partner's number cannot open your chat without the code. Double-check the chat opens with your real partner.
- Only a hash of the number is stored in the directory, but phone numbers are guessable, so treat the directory as lookup-only convenience, not secret.

V7 ADDITIONS
- Voice/video calls: 📞 and 📹 in a chat. Rings anywhere in the app while it is open. Uses the same TURN config as screen share.
- Chat list shows last message, time and unread count. Notifications: allow them (Settings > Notifications). They arrive while the app/tab is open or in the background; push while fully closed needs Firebase Cloud Messaging + a Cloud Function.
- Login lasts 7 days, then asks again.
- Swipe a message right to reply; right-click (or tap) a message to react, ➕ opens all emojis.

V15 adds real-time multiplayer games: Tic-Tac-Toe, Connect 4, Rock Paper Scissors, Memory Match, Draw & Guess, and Quick Duel. Publish the included firestore.rules for game synchronization.


PUSH NOTIFICATIONS — NOW INCLUDED
- Web FCM support is wired into the app and service worker.
- Put the PUBLIC Web Push certificate/VAPID key from Firebase Console > Project settings > Cloud Messaging into firebase-config.js as vapidKey.
- Deploy the included functions folder to Firebase Functions. It sends notifications for new chat messages, couple gestures/updates, and daily period reminders.
- Browser permission must be granted from Settings > Notifications.
- Never put a Firebase/FCM private key or service-account JSON in the frontend.
- Scheduled Cloud Functions may require a Firebase/Google Cloud billing-enabled project depending on your plan/region.

OUR SPACE
- The 💕 button is now visible in the main chat-list header; the previous hidden #usb hook has been fixed.

V22 FIXES
- Pin and Edit message were blocked by firestore.rules (fields 'pinned' and 'edited' were not allowed). Rules updated: publish firestore.rules again.
- Removed a duplicated loadIce() function (screen share / TURN) and a duplicate push-setup call at sign-in.
- Cloud Functions runtime bumped to Node 22 (functions/package.json). Redeploy functions: firebase deploy --only functions
- Removed unused dev files from this package (script*.js, snippet.txt, check.js, glass.css): index.html already contains everything.

V24 PURPLE INTERFACE
- Removed the sky, clouds and all decorative animation (drifting clouds, message pop-in, hover lifts, blur effects).
- Back to the purple look: purple header with white text, soft lavender pages (light) or deep purple pages (dark), white or dark-purple cards and bubbles tinted by your accent colour. Light, Dark and System themes still work.
- App logic and Firebase code were not changed. The old conflicting CSS layers stay removed.
- Not tested in a real browser here. Send a screenshot of anything that looks wrong.

V25 PERIOD CALENDAR (rebuilt)
- Real month calendar: tap any day up to today to mark or unmark it as a period day. Swipe or use the arrows to change month, the calendar button jumps to today.
- Colours + shapes: filled pink = period, dashed pink = predicted period, green tint = fertile window, green dot = estimated ovulation, outlined = today.
- Learns from your marks: with two or more marked periods the cycle length is the average of your last cycles. Until then it uses the number you typed.
- Summary card: days until the next period (or how many days late), cycle day, fertile window. Estimates only, not medical advice or birth control.
- Saved on this device and, when signed in, to users/<uid>/period/config so it comes back on another device.
- Fixed: the Period and Status tab buttons threw a JavaScript error (show() was not defined in that scope), so the page never opened. The calendar grid, day cells and bottom bar also had no CSS at all.
- Cloud Function periodReminder fixed: it ran every hour and re-sent the reminder every hour of the reminder day. It now sends once, from 9am in your time zone, and respects the new reminder checkbox. Redeploy: firebase deploy --only functions
- Period data lives in your own Firestore doc, readable only by you (rules unchanged).

CHESS (v26)
- Chat tools (⋯) > Chess. Full rules (check, checkmate, castling, en passant, promotion), live sync, resign, rematch with colours swapped.
- Uses chess.js from cdnjs for move rules. No new Firestore rules needed (uses chats/{id}/share).
- Recent emojis show first when you open the emoji panel. Tapping a message no longer opens the menu: long-press or right-click it (swipe right to reply).
