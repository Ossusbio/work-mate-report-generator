const express = require('express');
const router = express.Router();

/**
 * Helper to extract GCS path from signed URLs before saving to database
 */
function cleanReportForStorage(report) {
  if (!report) return report;

  const cleanImg = (img) => {
    if (!img) return img;
    if (typeof img === 'string') return extractGcsPath(img);
    if (img.url) img.url = extractGcsPath(img.url);
    return img;
  };

  const cleanImgs = (imgs) => {
    if (!imgs) return imgs;
    if (Array.isArray(imgs)) return imgs.map(cleanImg);
    return cleanImg(imgs);
  };

  const cleanDoc = (doc) => {
    if (!doc) return doc;
    if (typeof doc === 'string') return extractGcsPath(doc);
    if (doc.url) doc.url = extractGcsPath(doc.url);
    if (doc.documentUrl) doc.documentUrl = extractGcsPath(doc.documentUrl);
    return doc;
  };

  if (report.referenceImage) report.referenceImage = cleanImgs(report.referenceImage);
  if (report.referenceImages) report.referenceImages = cleanImgs(report.referenceImages);
  if (report.uploadedDoc) report.uploadedDoc = cleanDoc(report.uploadedDoc);

  if (report.parameters) {
    if (report.parameters.referenceImage) report.parameters.referenceImage = cleanImgs(report.parameters.referenceImage);
    if (report.parameters.referenceImages) report.parameters.referenceImages = cleanImgs(report.parameters.referenceImages);
    if (report.parameters.uploadedDoc) report.parameters.uploadedDoc = cleanDoc(report.parameters.uploadedDoc);
  }

  return report;
}

/**
 * Helper to dynamically generate secure signed URLs for reports sent to client
 */
async function signReportUrls(report) {
  if (!report) return report;
  const cloned = JSON.parse(JSON.stringify(report));

  const signImg = async (img) => {
    if (!img) return img;
    if (typeof img === 'string') return await generateSignedUrl(img);
    if (img.url) img.url = await generateSignedUrl(img.url);
    return img;
  };

  const signImgs = async (imgs) => {
    if (!imgs) return imgs;
    if (Array.isArray(imgs)) return await Promise.all(imgs.map(signImg));
    return await signImg(imgs);
  };

  const signDoc = async (doc) => {
    if (!doc) return doc;
    if (typeof doc === 'string') {
      return await generateSignedUrl(doc);
    }
    const targetUrl = doc.url || doc.documentUrl;
    if (targetUrl) {
      const signed = await generateSignedUrl(targetUrl);
      doc.url = signed;
      doc.documentUrl = signed;
    }
    return doc;
  };

  if (cloned.referenceImage) cloned.referenceImage = await signImgs(cloned.referenceImage);
  if (cloned.referenceImages) cloned.referenceImages = await signImgs(cloned.referenceImages);
  if (cloned.uploadedDoc) cloned.uploadedDoc = await signDoc(cloned.uploadedDoc);

  if (cloned.parameters) {
    if (cloned.parameters.referenceImage) cloned.parameters.referenceImage = await signImgs(cloned.parameters.referenceImage);
    if (cloned.parameters.referenceImages) cloned.parameters.referenceImages = await signImgs(cloned.parameters.referenceImages);
    if (cloned.parameters.uploadedDoc) cloned.parameters.uploadedDoc = await signDoc(cloned.parameters.uploadedDoc);
  }

  return cloned;
}

const multer = require('multer');
const { stringify } = require('csv-stringify/sync');
const { saveReferenceImage, saveReferenceDocument, generateSignedUrl, extractGcsPath, deleteFromGCS, streamGCSFile } = require('../services/storage');
const { fetchBigQueryData, getTableSchemaMetadata } = require('../services/bigquery');
const { saveReportDraft, getReportById, getAllReports } = require('../services/firestore');
const { generateExcelReport } = require('../services/excelGenerator');

const { verifyAuth } = require('../middleware/auth');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


/**
 * Public direct download endpoints (for clicks from generated PDF reports & shared links)
 */
const handleExportReport = async (req, res) => {
  try {
    const format = req.query.format || req.body?.format || 'excel';
    const report = await getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Merge edited data back to bigqueryData for export
    const dataToExport = report.editedData || report.bigqueryData || [];

    if (format === 'csv') {
      const csvString = stringify(dataToExport, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.runId || 'report'}_raw_data.csv"`);
      return res.send(csvString);
    }

    // Default: Excel format
    report.bigqueryData = dataToExport;
    const buffer = await generateExcelReport(report);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report.runId || 'report'}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export report: ' + err.message });
  }
};

const handleDocumentDownload = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) {
      return res.status(404).send('Report not found');
    }

    const doc = report.parameters?.uploadedDoc || report.uploadedDoc;
    if (!doc) {
      return res.status(404).send('No document attached to this report');
    }

    const rawPath = doc.filepath || doc.url || doc.documentUrl;
    const filename = doc.name || doc.filename || 'attached_document.pdf';

    if (rawPath) {
      const streamed = await streamGCSFile(rawPath, res, filename);
      if (streamed) return;
    }

    // Clean HTML fallback instead of ugly GCS XML error
    res.status(404).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Document Notice</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .icon { font-size: 42px; margin-bottom: 16px; }
    h2 { margin: 0 0 12px 0; color: #38bdf8; font-size: 1.25rem; font-weight: 600; }
    p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { background: #0284c7; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; display: inline-block; transition: all 0.2s ease; }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📄</div>
    <h2>Attached Document Notice</h2>
    <p>The file <strong>${filename}</strong> was attached to a past draft or is no longer stored in the cloud storage bucket.</p>
    <a href="https://grafana-494005.web.app" class="btn">Return to Console</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error('Error opening document:', err);
    res.status(500).send('Error opening document: ' + err.message);
  }
};

router.get('/:id/export', handleExportReport);
router.get('/:id/document', handleDocumentDownload);

// Apply auth middleware to protected report endpoints
router.use(verifyAuth);

router.post('/:id/export', handleExportReport);

/**
 * Upload Reference Image
 */
router.post('/upload-image', upload.single('photo'), async (req, res) => {
  try {
    let result;
    if (req.file) {
      result = await saveReferenceImage(req.file.buffer, 'operator-photo');
    } else if (req.body.base64Image) {
      result = await saveReferenceImage(req.body.base64Image, 'operator-cam');
    } else {
      return res.status(400).json({ error: 'No photo provided' });
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      filename: result.filename,
      uploadedAt: result.uploadedAt
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

/**
 * Upload Reference Document (PDF/DOC, max 5MB)
 */
router.post('/upload-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document provided' });
    }

    const result = await saveReferenceDocument(req.file.buffer, req.file.originalname);
    res.json({
      success: true,
      documentUrl: result.downloadUrl,
      filepath: result.filepath,
      filename: req.file.originalname,
      size: req.file.size,
      uploadedAt: result.uploadedAt
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * Generate Report Draft (Fetch BigQuery & Save to Firestore)
 */
router.post('/generate', async (req, res) => {
  try {
    const params = req.body;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const existingReport = params.reportId ? await getReportById(params.reportId) : null;

    // Run name deduplication check (global)
    if (params.runName && params.runName.trim()) {
      const allReports = await getAllReports();
      const duplicate = allReports.find(r => {
        const rName = (r.parameters?.runName || r.runName || '').trim().toLowerCase();
        return rName === params.runName.trim().toLowerCase() && r.reportId !== (params.reportId || '');
      });
      if (duplicate) {
        return res.status(409).json({ error: 'Name already taken' });
      }
    }

    const reportId = params.reportId || existingReport?.reportId || `RPT-${dateStr}-${randomSuffix}`;
    const runId = params.runId || existingReport?.runId || `RUN-${dateStr}-${randomSuffix}`;
    const createdAt = existingReport?.createdAt || new Date().toISOString();

    // 1. Fetch BigQuery raw process telemetry (skip if draftOnly is true, preserving existing if available)
    let bigqueryData = existingReport?.bigqueryData || [];
    let editedData = existingReport?.editedData || [];
    
    if (!params.draftOnly) {
      const fetched = await fetchBigQueryData(params);
      bigqueryData = fetched;
      editedData = fetched;
    }

    // 2. Build report payload
    const reportPayload = {
      ...existingReport,
      reportId,
      runId,
      createdAt,
      updatedAt: new Date().toISOString(),
      status: params.draftOnly ? 'DRAFT' : 'COMPLETED',
      createdBy: existingReport?.createdBy || params.createdBy || req.user?.email || params.user || 'Operator',
      lastEditedBy: params.user || req.user?.email || req.user?.name || existingReport?.lastEditedBy || 'Operator',
      lastEditedAt: new Date().toISOString(),
      parameters: {
        ...(existingReport?.parameters || {}),
        ...params,
        reportId,
        runId,
        dateTime: params.dateTime || existingReport?.parameters?.dateTime || new Date().toLocaleString()
      },
      bigqueryData,
      editedData,
      editHistory: [
        ...(existingReport?.editHistory || []),
        ...(params.draftOnly ? [] : [{
          timestamp: new Date().toISOString(),
          user: params.user || req.user?.email || req.user?.name || 'Operator',
          note: 'Generated final report'
        }])
      ]
    };

    // 3. Save to Firestore (or in-memory fallback)
    const cleanedPayload = cleanReportForStorage(reportPayload);
    const saved = await saveReportDraft(cleanedPayload);
    const signedReport = await signReportUrls(saved);

    res.json({
      success: true,
      reportId,
      report: signedReport
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report: ' + err.message });
  }
});

/**
 * Preview BigQuery Data (without saving a report)
 * Used by the Raw Data tab in the wizard
 */
router.post('/preview-data', async (req, res) => {
  try {
    const params = req.body;
    console.log(`[Preview Data] Fetching BigQuery rows (Freq: ${params.dataFrequency || 'all'}min)`);
    const bigqueryData = await fetchBigQueryData(params);
    res.json({
      success: true,
      rows: bigqueryData,
      count: bigqueryData.length
    });
  } catch (err) {
    console.error('Error previewing data:', err);
    res.status(500).json({ error: 'Failed to fetch preview data: ' + err.message });
  }
});

/**
 * Get Report Draft by ID
 */

router.get('/:id', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const signedReport = await signReportUrls(report);
    res.json(signedReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * Fetch BigQuery Telemetry for Saved Draft Parameters
 */
router.post('/:id/fetch-telemetry', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report draft not found' });
    }

    console.log(`[Fetch Telemetry] Fetching BigQuery rows for report: ${req.params.id}`);
    const bigqueryData = await fetchBigQueryData(report.parameters);

    const updatedReport = {
      ...report,
      bigqueryData,
      editedData: bigqueryData, // Overwrite editedData since we just fetched it for the first time
      updatedAt: new Date().toISOString()
    };

    const cleanedReport = cleanReportForStorage(updatedReport);
    const saved = await saveReportDraft(cleanedReport);
    const signedReport = await signReportUrls(saved);
    res.json({
      success: true,
      report: signedReport
    });
  } catch (err) {
    console.error('Error fetching live telemetry:', err);
    res.status(500).json({ error: 'Failed to fetch telemetry data: ' + err.message });
  }
});

/**
 * Save Edits to Draft Table
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('[Server] PUT request body:', req.body);
    const { editedData, editNote, user } = req.body;
    const existing = await getReportById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const editorEmail = user || req.user?.email || req.user?.name || 'Operator';

    // Ownership check: only creator can edit (unless dev admin override)
    const DEV_EMAILS = ['parth@ossusbio.com', 'nagendra@ossusbio.com', 'thamunna@ossusbio.com'];
    if (existing.createdBy && existing.createdBy !== editorEmail && !DEV_EMAILS.includes(editorEmail?.toLowerCase())) {
      return res.status(403).json({ error: 'Only the report creator can edit this report.' });
    }
    const updated = {
      ...existing,
      status: req.body.status || existing.status,
      editedData: editedData || existing.editedData,
      parameters: req.body.parameters || existing.parameters,
      lastEditedBy: editorEmail,
      lastEditedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editHistory: [
        ...(existing.editHistory || []),
        {
          timestamp: new Date().toISOString(),
          user: editorEmail,
          note: editNote || 'Updated parameters'
        }
      ]
    };

    const cleanedUpdated = cleanReportForStorage(updated);
    const saved = await saveReportDraft(cleanedUpdated);
    const signedReport = await signReportUrls(saved);
    res.json({ success: true, report: signedReport });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report draft' });
  }
});

/**
 * Export Final Report (Excel / CSV)
 */
/**
 * Export Final Report (Excel / CSV) - Supports GET and POST
 */


/**
 * Get All Reports History
 */
router.get('/', async (req, res) => {
  try {
    const list = await getAllReports();
    const signedList = await Promise.all(list.map(r => signReportUrls(r)));
    res.json(signedList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports history' });
  }
});

/**
 * Delete Report
 */
router.delete('/:id', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email confirmation is required to delete' });
    }

    // Verify email matches active user session if configured
    if (req.user && req.user.email && req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Entered email does not match your active session email' });
    }

    // Fetch report details first to get Run ID and Run Name
    const { getReportById, deleteReport } = require('../services/firestore');
    const report = await getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const runId = report.runId || report.parameters?.runId || '';
    const runName = report.runName || report.parameters?.runName || '';

    // Log deletion audit event safely
    try {
      const { logReportDeletion } = require('../services/bigquery');
      if (typeof logReportDeletion === 'function') {
        await logReportDeletion(runId, runName, email.trim());
      }
    } catch (auditErr) {
      console.warn('[Audit] Deletion log warning:', auditErr.message);
    }

    // Clean up GCS files (images + documents)
    try {
      const params = report.parameters || {};
      // Delete reference images from GCS
      const imgs = params.referenceImage || report.referenceImage;
      if (imgs) {
        const imgArr = Array.isArray(imgs) ? imgs : [imgs];
        for (const img of imgArr) {
          const imgPath = typeof img === 'string' ? img : img?.url;
          if (imgPath) await deleteFromGCS(extractGcsPath(imgPath));
        }
      }
      // Delete reference document from GCS
      const doc = params.uploadedDoc || report.uploadedDoc;
      if (doc?.url || doc?.documentUrl) {
        await deleteFromGCS(extractGcsPath(doc.url || doc.documentUrl));
      }
      console.log('[Delete] GCS files cleaned up for report:', req.params.id);
    } catch (gcsErr) {
      console.warn('[Delete] GCS cleanup warning:', gcsErr.message);
    }

    // Perform deletion from Firestore
    await deleteReport(req.params.id);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report: ' + err.message });
  }
});

/**
 * Admin Bypass: Set or update user password directly
 */
router.post('/auth/set-password-bypass', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const clean = email.trim().toLowerCase();
  if (!clean.endsWith('@ossusbio.com')) {
    return res.status(403).json({ error: 'Access Denied: Only @ossusbio.com emails are authorized.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(clean);
    } catch (getErr) {
      if (getErr.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: clean,
          password: password,
          emailVerified: true
        });
        console.log(`[Admin Auth] Created new user: ${clean}`);
        return res.json({ success: true, message: 'Account created and password set successfully!' });
      } else {
        throw getErr;
      }
    }

    await admin.auth().updateUser(userRecord.uid, { password });
    console.log(`[Admin Auth] Updated password for user: ${clean}`);
    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    console.error('[Admin Auth] Error setting password:', err);
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

module.exports = router;
