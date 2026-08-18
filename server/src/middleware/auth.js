const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { recordUserLogin } = require('../services/roles');

let initialized = false;

// Candidate paths for Service Account JSON
const candidatePaths = [
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH) : null,
  path.join(__dirname, '../../firebase_service.json'),
  path.join(__dirname, '../../firebase-service-account.json')
].filter(Boolean);

const foundPath = candidatePaths.find(p => fs.existsSync(p));

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string' 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) 
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      admin.initializeApp({
        credential: admin.credential.cert(sa)
      });
      initialized = true;
      console.log('✅ Firebase Admin SDK initialized with FIREBASE_SERVICE_ACCOUNT_JSON Secret');
    } catch (err) {
      console.warn('⚠️ Firebase Admin Secret init warning:', err.message);
    }
  } else
  if (foundPath) {
    try {
      const serviceAccount = require(foundPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
      console.log(`✅ Firebase Admin SDK initialized with Service Account Key (${path.basename(foundPath)})`);
    } catch (err) {
      console.warn('⚠️ Firebase Admin init warning:', err.message);
    }
  } else if (process.env.FIREBASE_PROJECT_ID) {
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      initialized = true;
      console.log('✅ Firebase Admin SDK initialized with Project ID:', process.env.FIREBASE_PROJECT_ID);
    } catch (err) {
      console.warn('⚠️ Firebase Admin init warning:', err.message);
    }
  }
} else {
  initialized = true;
}

/**
 * Middleware: Verifies Firebase ID Token & Checks Allowed Emails
 */
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // ── Dev bypass ─────────────────────────────────────────────────────────────
  // In development mode with no token: allow through with a default dev user.
  // This lets the "Dev Bypass" button on the login page work without a real
  // Firebase login. NEVER active in production (NODE_ENV=production).
  if (!authHeader && process.env.NODE_ENV !== 'production') {
    req.user = { email: 'parth@ossusbio.com', uid: 'dev-uid', role: 'operator' };
    return next();
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userEmail = decodedToken.email;

    // Check Email Allowlist
    const allowed = await isEmailAllowed(userEmail);
    if (!allowed) {
      return res.status(403).json({ 
        error: `Access Denied. Email '${userEmail}' is not in the operator access allowlist.` 
      });
    }

    req.user = decodedToken;
    recordUserLogin(decodedToken).catch(err => console.warn('[Auth Record Error]:', err.message));
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Helper: Check if email is in the authorized domain (@ossusbio.com)
 */
async function isEmailAllowed(email) {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@ossusbio.com');
}

module.exports = {
  verifyAuth,
  isEmailAllowed
};
