// Firebase web app configuration for Chat only with me.
// This config identifies your Firebase project; Firestore security rules must still protect chat data.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBcgTW2YM3Bdtr8mMQer01WZe4MsI7u7kU",
  authDomain: "chat-only-with-you.firebaseapp.com",
  projectId: "chat-only-with-you",
  storageBucket: "chat-only-with-you.firebasestorage.app",
  messagingSenderId: "923926282487",
  appId: "1:923926282487:web:de47682ebfd2e838d353f2",
  // Firebase Console > Project settings > Cloud Messaging > Web Push certificates.
  // Paste the PUBLIC VAPID key here to enable push notifications.
  vapidKey: "BMnkBAVyO_xY9FGVvNSTDyuxoJuGitZhWbFUiOIer6cudwSVXSKua-7yni_kIiPxZJlBmpkpEHsEcnvuHlpCazE"
};

// Region of your Cloud Functions (default us-central1). Used by the service worker to confirm message delivery.
window.FUNCTIONS_REGION = "us-central1";

// TURN relay for screen share / whiteboard on strict networks (optional).
// Option 1 (easy): Metered.ca. Fill both fields from dashboard.metered.ca (app name + the TURN credential's API key).
// Option 2: any TURN provider / your own coturn: list servers below, e.g.
//   servers: [{ urls: ["turn:your.host:443?transport=tcp"], username: "user", credential: "pass" }]
// Leave everything empty to keep using free STUN only.
window.TURN_CONFIG = {
  meteredApp: "",
  meteredApiKey: "",
  servers: []
};

// Optional: free GIPHY API key (developers.giphy.com) to enable GIF search in the emoji panel.
window.GIPHY_KEY = "Ox0y3gHvzHrrJJUWCCbluLAYAInNMHJL";

// OnlyUs AI: do NOT put your Gemini key here. A key in a public GitHub repo is found by Google and revoked.
// Each person pastes their own free key (aistudio.google.com/apikey) with the 🔑 button inside the AI chat.
// Optional: model name from AI Studio (names change often). Default if empty: gemini-flash-latest
window.GEMINI_MODEL = "";
