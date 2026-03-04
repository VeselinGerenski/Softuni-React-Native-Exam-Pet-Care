/**
 * Human-friendly Firebase Auth error messages.
 * We map known auth error codes to short, clear copy for a better UX.
 */

function extractAuthCode(err) {
  if (!err) return null;

  // Firebase JS SDK commonly exposes `code` like: "auth/invalid-credential"
  if (typeof err.code === "string" && err.code.includes("auth/")) return err.code;

  const msg = String(err.message || err?.toString?.() || "");

  // Try to extract from patterns like: "Firebase: Error (auth/invalid-credential)."
  const m = msg.match(/\(auth\/[^)]+\)/i);
  if (m?.[0]) return m[0].replace(/[()]/g, "");

  // Fallback: search for "auth/..."
  const m2 = msg.match(/auth\/[a-z0-9-]+/i);
  return m2?.[0] || null;
}

/**
 * @param {any} err Firebase Auth error (or anything thrown)
 * @param {"login"|"register"} context
 */
export function getAuthErrorMessage(err, context = "login") {
  const code = extractAuthCode(err);

  switch (code) {
    // Login-related
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password";

    case "auth/invalid-email":
      return "Please enter a valid email address";

    case "auth/missing-password":
      return "Password is required";

    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";

    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";

    // Register-related
    case "auth/email-already-in-use":
      return "An account with this email already exists";

    case "auth/weak-password":
      return "Your password is too weak. Try at least 6 characters.";

    case "auth/operation-not-allowed":
      return "Email/password sign-in is currently disabled.";

    default: {
      // If we have a non-Firebase custom error, prefer it.
      const msg = String(err?.message || "").trim();
      if (msg && !msg.includes("Firebase:")) return msg;

      return context === "register" ? "Registration failed. Please try again." : "Login failed. Please try again.";
    }
  }
}
