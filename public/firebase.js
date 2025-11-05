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
    // Small helper to render inline error on current form
    function showAuthError(message) {
      try {
        var active = document.activeElement;
        var form = (active && (active.closest && active.closest('form'))) || document.querySelector('form');
        if (!form) return console.error(message);
        var existing = form.querySelector('#auth-error');
        if (!existing) {
          existing = document.createElement('div');
          existing.id = 'auth-error';
          existing.setAttribute('role', 'alert');
          existing.style.marginTop = '8px';
          existing.style.padding = '8px 10px';
          existing.style.borderRadius = '6px';
          existing.style.background = 'rgba(255, 0, 0, 0.08)';
          existing.style.color = '#b00020';
          existing.style.fontSize = '12px';
          existing.style.border = '1px solid rgba(176,0,32,0.25)';
          // Insert under email field if present, else at form top
          var emailEl = form.querySelector('#email') || form.querySelector('input[type="email"]');
          if (emailEl && emailEl.parentElement) {
            emailEl.parentElement.insertAdjacentElement('afterend', existing);
          } else {
            form.insertAdjacentElement('afterbegin', existing);
          }
        }
        existing.textContent = message;
      } catch (e) {
        console.error(message);
      }
    }


    // Session persistence (LOCAL)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (e) {
      console.error("Persistence error:", e);
    });

    // Wire up Farmer Signup (route-based, capture phase to block React handler)
    function wireFarmerSignup() {
      var path = (window && window.location && window.location.pathname) || "/";
      if (path !== "/farmer-register") return;
      function onSubmitCapture(ev) {
        // Ensure it's a form submit
        var target = ev.target;
        if (!target || target.nodeName !== "FORM") return;
        ev.preventDefault();
        if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
        ev.stopPropagation();

        var firstName = (document.getElementById("firstName") || {}).value || "";
        var lastName = (document.getElementById("lastName") || {}).value || "";
        var phone = (document.getElementById("phone") || {}).value || "";
        var email = (document.getElementById("email") || {}).value || "";
        var password = (document.getElementById("password") || {}).value || "";
        var address = (document.getElementById("address") || {}).value || "";
        var aadhar = (document.getElementById("aadhar") || {}).value || "";
        var landArea = (document.getElementById("landArea") || {}).value || "";
        var landType = (document.getElementById("landType") || {}).value || "";

        auth
          .createUserWithEmailAndPassword(String(email).trim(), String(password))
          .then(function (userCredential) {
            var user = userCredential.user;
            var name = (String(firstName).trim() + " " + String(lastName).trim()).trim();
            return db
              .collection("users")
              .doc(user.uid)
              .set({
                name: name,
                phone: String(phone).trim(),
                address: String(address).trim(),
                aadhar: String(aadhar).trim(),
                landArea: String(landArea).trim(),
                landType: String(landType).trim(),
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
            showAuthError("Signup failed: " + (error && error.message ? error.message : "Unexpected error"));
          });
      }
      document.addEventListener("submit", onSubmitCapture, true);
    }

    // Wire up Farmer Login form if present
    function wireFarmerLogin() {
      var path = (window && window.location && window.location.pathname) || "/";
      if (path !== "/farmer-login") return;
      function onSubmitCapture(ev) {
        var target = ev.target;
        if (!target || target.nodeName !== "FORM") return;
        ev.preventDefault();
        if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
        ev.stopPropagation();

        var email = (document.getElementById("email") || {}).value || "";
        var password = (document.getElementById("password") || {}).value || "";

        auth
          .signInWithEmailAndPassword(String(email).trim(), String(password))
          .then(function (cred) {
            var user = cred.user;
            // Ensure user is registered in Firestore and has Farmer role
            return db
              .collection("users")
              .doc(user.uid)
              .get()
              .then(function (docSnap) {
                if (!docSnap.exists) {
                  // Not registered in app DB
                  return auth.signOut().then(function () {
                    console.error("Login blocked: user not registered in Firestore users collection");
                  });
                }
                var data = docSnap.data() || {};
                if (String(data.role || "") !== "Farmer") {
                  return auth.signOut().then(function () {
                    console.error("Login blocked: role is not Farmer");
                  });
                }
                var url = (window && window.__AFTER_LOGIN_URL__) || "/";
                window.location.href = url;
              });
          })
          .catch(function (error) {
            console.error("Login error:", error);
            showAuthError("Incorrect email or password. Please try again.");
          });
      }
      document.addEventListener("submit", onSubmitCapture, true);
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

    // On-auth change (optional exposure + guarded redirects after role verification)
    auth.onAuthStateChanged(function (user) {
      if (typeof window !== "undefined") {
        window.currentUser = user || null;
        try {
          var path = window.location.pathname || "/";
          var protectedPaths = ["/dashboard", "/farmer-profile"]; // add more if needed
          var loginPaths = ["/farmer-login", "/farmer-register", "/farmer-forgot-password"]; 

          if (!user && protectedPaths.indexOf(path) !== -1) {
            window.location.replace("/farmer-login");
            return;
          }

          if (user) {
            db
              .collection("users")
              .doc(user.uid)
              .get()
              .then(function (docSnap) {
                var role = (docSnap.exists && (docSnap.data() || {}).role) || null;
                if (loginPaths.indexOf(path) !== -1 && role === "Farmer") {
                  window.location.replace((window && window.__AFTER_LOGIN_URL__) || "/");
                }
                if (protectedPaths.indexOf(path) !== -1 && role !== "Farmer") {
                  // logged in but not farmer → bounce to login
                  auth.signOut().finally(function () {
                    window.location.replace("/farmer-login");
                  });
                }
              })
              .catch(function () {
                // If user doc fetch fails, do not redirect to dashboard
              });
          }
        } catch (e) {
          // no-op guard errors
        }
      }
    });

    function wireAll() {
      wireFarmerSignup();
      wireFarmerLogin();
      wireGenericAuthCapture();
      wireLogout();
    }

    // Attach listeners on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", wireAll);
    } else {
      wireAll();
    }

    // Re-run wiring on SPA route changes
    try {
      var _pushState = history.pushState;
      var _replaceState = history.replaceState;
      function onRouteChange() {
        // Small delay to let React render inputs
        setTimeout(wireAll, 0);
      }
      history.pushState = function () {
        var ret = _pushState.apply(this, arguments);
        onRouteChange();
        return ret;
      };
      history.replaceState = function () {
        var ret = _replaceState.apply(this, arguments);
        onRouteChange();
        return ret;
      };
      window.addEventListener("popstate", onRouteChange);
    } catch (_) {
      // no-op if history API not available
    }

    // Generic fallback: capture ANY form submit and pick login vs signup by fields
    function wireGenericAuthCapture() {
      if (window.__GENERIC_AUTH_CAPTURE_WIRED__) return;
      window.__GENERIC_AUTH_CAPTURE_WIRED__ = true;
      document.addEventListener(
        "submit",
        function (ev) {
          var form = ev.target;
          if (!form || form.nodeName !== "FORM") return;
          // look for common fields
          var emailEl = document.getElementById("email") || form.querySelector('input[type="email"]');
          var passEl = document.getElementById("password") || form.querySelector('input[type="password"]');
          if (!emailEl || !passEl) return; // not an auth form

          var hasRegistrationSignals =
            document.getElementById("firstName") ||
            document.getElementById("lastName") ||
            document.getElementById("aadhar") ||
            document.getElementById("address") ||
            document.getElementById("landArea") ||
            document.getElementById("landType");

          // Prevent default app handler; run our flow
          ev.preventDefault();
          if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
          ev.stopPropagation();

          var email = (emailEl && emailEl.value) || "";
          var password = (passEl && passEl.value) || "";

          if (hasRegistrationSignals) {
            // Treat as registration
            var firstName = (document.getElementById("firstName") || {}).value || "";
            var lastName = (document.getElementById("lastName") || {}).value || "";
            var phone = (document.getElementById("phone") || {}).value || "";
            var address = (document.getElementById("address") || {}).value || "";
            var aadhar = (document.getElementById("aadhar") || {}).value || "";
            var landArea = (document.getElementById("landArea") || {}).value || "";
            var landType = (document.getElementById("landType") || {}).value || "";

            auth
              .createUserWithEmailAndPassword(String(email).trim(), String(password))
              .then(function (userCredential) {
                var user = userCredential.user;
                var name = (String(firstName).trim() + " " + String(lastName).trim()).trim();
                return db
                  .collection("users")
                  .doc(user.uid)
                  .set({
                    name: name,
                    phone: String(phone).trim(),
                    address: String(address).trim(),
                    aadhar: String(aadhar).trim(),
                    landArea: String(landArea).trim(),
                    landType: String(landType).trim(),
                    role: "Farmer",
                    email: String(email).trim(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  })
                  .then(function () {
                    var url = (window && window.__AFTER_SIGNUP_URL__) || "/dashboard";
                    window.location.href = url;
                  });
              })
              .catch(function (error) {
                console.error("Signup error:", error);
              });
            return;
          }

          // Treat as login
          auth
            .signInWithEmailAndPassword(String(email).trim(), String(password))
            .then(function (cred) {
              var user = cred.user;
              return db
                .collection("users")
                .doc(user.uid)
                .get()
                .then(function (docSnap) {
                  if (!docSnap.exists) {
                    return auth.signOut().then(function () {
                      console.error("Login blocked: user not registered in Firestore users collection");
                    });
                  }
                  var data = docSnap.data() || {};
                  if (String(data.role || "") !== "Farmer") {
                    return auth.signOut().then(function () {
                      console.error("Login blocked: role is not Farmer");
                    });
                  }
                  var url = (window && window.__AFTER_LOGIN_URL__) || "/dashboard";
                  window.location.href = url;
                });
            })
            .catch(function (error) {
              console.error("Login error:", error);
            });
        },
        true
      );
    }
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err);
  }
})();


