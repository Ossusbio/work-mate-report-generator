const admin = require('firebase-admin');

const DEFAULT_DEV_EMAILS = [
  'parth@ossusbio.com'
];

let db = null;
function getDb() {
  if (!db && admin.apps.length > 0) {
    db = admin.firestore();
  }
  return db;
}

// In-memory fallback
const inMemoryRoles = new Map();
DEFAULT_DEV_EMAILS.forEach(email => {
  inMemoryRoles.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    displayName: 'Parth kulkarni',
    role: 'developer',
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  });
});

/**
 * Get the role for a specific email
 */
async function getUserRole(email) {
  if (!email) return 'user';
  const cleanEmail = email.trim().toLowerCase();

  // Super-admin Parth always has developer access
  if (DEFAULT_DEV_EMAILS.includes(cleanEmail)) {
    return 'developer';
  }

  const firestore = getDb();
  if (!firestore) {
    return inMemoryRoles.get(cleanEmail)?.role || 'user';
  }

  try {
    const doc = await firestore.collection('user_roles').doc(cleanEmail).get();
    if (doc.exists) {
      return doc.data().role || 'user';
    }
    return 'user';
  } catch (err) {
    console.warn(`[Roles] Error getting role for ${cleanEmail}:`, err.message);
    return inMemoryRoles.get(cleanEmail)?.role || 'user';
  }
}

/**
 * Record a user login and ensure they have a role entry
 */
async function recordUserLogin(user) {
  if (!user || !user.email) return;
  const cleanEmail = user.email.trim().toLowerCase();
  const firestore = getDb();
  
  const initialRole = DEFAULT_DEV_EMAILS.includes(cleanEmail) ? 'developer' : 'user';

  const userData = {
    email: cleanEmail,
    displayName: user.name || user.displayName || cleanEmail.split('@')[0],
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!firestore) {
    const existing = inMemoryRoles.get(cleanEmail) || {};
    inMemoryRoles.set(cleanEmail, {
      ...existing,
      ...userData,
      role: existing.role || initialRole
    });
    return;
  }

  try {
    const docRef = firestore.collection('user_roles').doc(cleanEmail);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({
        ...userData,
        role: initialRole,
        createdAt: new Date().toISOString()
      });
    } else {
      await docRef.update({
        displayName: userData.displayName,
        lastLoginAt: userData.lastLoginAt
      });
    }
  } catch (err) {
    console.warn(`[Roles] Error recording login for ${cleanEmail}:`, err.message);
  }
}

/**
 * Get all recognized users with roles (from Firestore user_roles + DEFAULT_DEV_EMAILS)
 */
async function getAllUsersWithRoles() {
  const firestore = getDb();
  const usersMap = new Map();

  // 1. Pre-seed Parth as Developer
  DEFAULT_DEV_EMAILS.forEach(email => {
    usersMap.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      displayName: 'Parth kulkarni',
      role: 'developer',
      updatedBy: 'system',
      lastLoginAt: null,
      updatedAt: new Date().toISOString()
    });
  });

  // 2. Fetch all registered users stored in Firestore collection 'user_roles'
  if (firestore) {
    try {
      const snapshot = await firestore.collection('user_roles').get();
      snapshot.forEach(doc => {
        const data = doc.data();
        const email = doc.id.toLowerCase();
        const existing = usersMap.get(email) || {};

        usersMap.set(email, {
          ...existing,
          email,
          displayName: data.displayName || existing.displayName || email.split('@')[0],
          role: data.role || (DEFAULT_DEV_EMAILS.includes(email) ? 'developer' : 'user'),
          lastLoginAt: data.lastLoginAt || existing.lastLoginAt || null,
          updatedBy: data.updatedBy || existing.updatedBy || 'system',
          updatedAt: data.updatedAt || null
        });
      });
    } catch (err) {
      console.warn('[Roles] Error querying user_roles in firestore:', err.message);
    }
  }

  // 3. Overlay in-memory entries if any
  inMemoryRoles.forEach((val, key) => {
    const existing = usersMap.get(key) || {};
    usersMap.set(key, { ...existing, ...val });
  });

  // Return sorted alphabetically by email
  return Array.from(usersMap.values()).sort((a, b) => a.email.localeCompare(b.email));
}

/**
 * Update the role for a user
 */
async function updateUserRole(email, newRole, updatedBy = 'developer') {
  if (!email) throw new Error('Email is required');
  const cleanEmail = email.trim().toLowerCase();

  if (!['developer', 'user'].includes(newRole)) {
    throw new Error('Role must be either "developer" or "user"');
  }

  const firestore = getDb();
  const payload = {
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    role: newRole,
    updatedBy,
    updatedAt: new Date().toISOString()
  };

  inMemoryRoles.set(cleanEmail, payload);

  if (firestore) {
    const docRef = firestore.collection('user_roles').doc(cleanEmail);
    await docRef.set(payload, { merge: true });
  }

  console.log(`[Roles] Updated role for ${cleanEmail} -> ${newRole} (by ${updatedBy})`);
  return payload;
}

/**
 * Delete a user role from database
 */
async function deleteUserRole(email) {
  if (!email) throw new Error('Email is required');
  const cleanEmail = email.trim().toLowerCase();

  if (DEFAULT_DEV_EMAILS.includes(cleanEmail)) {
    throw new Error('Cannot delete primary developer account');
  }

  inMemoryRoles.delete(cleanEmail);

  const firestore = getDb();
  if (firestore) {
    await firestore.collection('user_roles').doc(cleanEmail).delete();
  }

  console.log(`[Roles] Deleted user ${cleanEmail}`);
  return { success: true, email: cleanEmail };
}

module.exports = {
  getUserRole,
  recordUserLogin,
  getAllUsersWithRoles,
  updateUserRole,
  deleteUserRole,
  DEFAULT_DEV_EMAILS
};
