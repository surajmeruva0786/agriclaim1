/* global firebase */

(function () {
  // Allow config to be provided via window.__FIREBASE_CONFIG__ or inline below
  var firebaseConfig =
    (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) || {
      // Replace with your Firebase project config
      apiKey: "AIzaSyDny41-nAzLxg6zGgHM7jc0Q0QxQCkCxO0",
  authDomain: "agriclaim1.firebaseapp.com",
  projectId: "agriclaim1",
  storageBucket: "agriclaim1.firebasestorage.app",
  messagingSenderId: "1042995668917",
  appId: "1:1042995668917:web:eb8c8251ee9ada6244dbfc",
  measurementId: "G-T287PS5V1T",

    };

  try {
    if (!firebase || !firebase.initializeApp) {
      throw new Error("Firebase SDK not loaded");
    }

    // Initialize Firebase (namespaced SDK)
    firebase.initializeApp(firebaseConfig);

    // Initialize services
    var auth = firebase.auth();
    var db = firebase.firestore();
    var storage = firebase.storage();

    // Expose for app usage if needed
    if (typeof window !== "undefined") {
      window.firebaseAuth = auth;
      window.firebaseDb = db;
      window.firebaseStorage = storage;
    }

    console.log("✅ Firebase Connected");
    // Persistence (LOCAL)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (e) {
      console.error("Persistence error:", e);
    });
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err);
  }
})();

