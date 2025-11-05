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

    // Session persistence (LOCAL)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (e) {
      console.error("Persistence error:", e);
    });

    // Wire up Farmer Signup form if present
    function wireFarmerSignup() {
      var form = document.getElementById("farmer-signup-form") || document.getElementById("signup-form");
      if (!form) return;
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var name = (document.getElementById("name") || {}).value || "";
        var village = (document.getElementById("village") || {}).value || "";
        var phone = (document.getElementById("phone") || {}).value || "";
        var email = (document.getElementById("email") || {}).value || "";
        var password = (document.getElementById("password") || {}).value || "";

        auth
          .createUserWithEmailAndPassword(String(email).trim(), String(password))
          .then(function (userCredential) {
            var user = userCredential.user;
            return db
              .collection("users")
              .doc(user.uid)
              .set({
                name: String(name).trim(),
                village: String(village).trim(),
                phone: String(phone).trim(),
                role: "Farmer",
                email: String(email).trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(function () {
                var url = (window && window.__AFTER_SIGNUP_URL__) || "/";
                window.location.href = url;
              });
          })
          .catch(function (error) {
            console.error("Signup error:", error);
          });
      });
    }

    // Wire up Farmer Login form if present
    function wireFarmerLogin() {
      var form = document.getElementById("farmer-login-form") || document.getElementById("login-form");
      if (!form) return;
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var email = (document.getElementById("email") || {}).value || "";
        var password = (document.getElementById("password") || {}).value || "";

        auth
          .signInWithEmailAndPassword(String(email).trim(), String(password))
          .then(function () {
            var url = (window && window.__AFTER_LOGIN_URL__) || "/";
            window.location.href = url;
          })
          .catch(function (error) {
            console.error("Login error:", error);
          });
      });
    }

    // Wire up Logout button if present
    function wireLogout() {
      var btn = document.getElementById("logout-button") || document.getElementById("farmer-logout");
      if (!btn) return;
      btn.addEventListener("click", function () {
        auth
          .signOut()
          .then(function () {
            var url = (window && window.__AFTER_LOGOUT_URL__) || "/";
            window.location.href = url;
          })
          .catch(function (error) {
            console.error("Logout error:", error);
          });
      });
    }

    // On-auth change (optional exposure)
    auth.onAuthStateChanged(function (user) {
      if (typeof window !== "undefined") {
        window.currentUser = user || null;
      }
    });

    // Attach listeners on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        wireFarmerSignup();
        wireFarmerLogin();
        wireLogout();
      });
    } else {
      wireFarmerSignup();
      wireFarmerLogin();
      wireLogout();
    }
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err);
  }
})();


