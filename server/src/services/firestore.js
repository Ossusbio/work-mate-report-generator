const admin = require('firebase-admin');

// In-memory fallback store for local development without credentials
const memoryReports = new Map();

function getDb() {
  if (admin.apps.length) {
    try {
      return admin.firestore();
    } catch (err) {
      console.warn('Firestore getDb warning:', err.message);
    }
  }
  return null;
}

/**
 * Creates or updates a report draft
 */
async function saveReportDraft(reportData) {
  const { reportId } = reportData;
  const updatedData = {
    ...reportData,
    updatedAt: new Date().toISOString()
  };

  const db = getDb();
  if (db) {
    try {
      await db.collection('reports').doc(reportId).set(updatedData, { merge: true });
      return updatedData;
    } catch (err) {
      console.warn('Firestore write failed, falling back to memory store:', err.message);
    }
  }

  memoryReports.set(reportId, updatedData);
  return updatedData;
}

/**
 * Fetches a report by ID
 */
async function getReportById(reportId) {
  const db = getDb();
  if (db) {
    try {
      const doc = await db.collection('reports').doc(reportId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {
      console.warn('Firestore read failed, checking memory store:', err.message);
    }
  }

  return memoryReports.get(reportId) || null;
}

/**
 * Fetches all reports history
 */
async function getAllReports() {
  const db = getDb();
  if (db) {
    try {
      const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').limit(50).get();
      const list = [];
      snapshot.forEach(doc => list.push(doc.data()));
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Firestore query failed, returning memory store:', err.message);
    }
  }

  return Array.from(memoryReports.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Deletes a report by ID
 */
async function deleteReport(reportId) {
  const db = getDb();
  if (db) {
    try {
      await db.collection('reports').doc(reportId).delete();
      return true;
    } catch (err) {
      console.warn('Firestore delete failed, checking memory store:', err.message);
    }
  }

  memoryReports.delete(reportId);
  return true;
}

module.exports = {
  saveReportDraft,
  getReportById,
  getAllReports,
  deleteReport
};
