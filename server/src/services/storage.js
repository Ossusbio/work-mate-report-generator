const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

let storage = null;
let bucket = null;
const bucketName = 'ossusbio-monthly-reports';

try {
  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : null,
    path.join(__dirname, '../../firebase_service.json'),
    path.join(__dirname, '../../firebase-service-account.json'),
  ].filter(Boolean);

  const keyFile = candidatePaths.find(p => fs.existsSync(p));

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || 'grafana-494005',
      credentials: sa
    });
    bucket = storage.bucket(bucketName);
    console.log(`✅ Storage GCS client initialized via Secret Manager JSON (bucket: ${bucketName})`);
  } else

  if (keyFile) {
    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || 'grafana-494005',
      keyFilename: keyFile,
    });
    bucket = storage.bucket(bucketName);
    console.log(`✅ Storage GCS client initialized (project: ${process.env.GCP_PROJECT_ID || 'grafana-494005'}, bucket: ${bucketName})`);
  } else {
    storage = new Storage({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005' });
    bucket = storage.bucket(bucketName);
    console.log(`✅ Storage GCS client initialized via ADC (project: ${process.env.GCP_PROJECT_ID || 'grafana-494005'}, bucket: ${bucketName})`);
  }
} catch (err) {
  console.warn('⚠️ GCS SDK initialization warning:', err.message);
}

/**
 * Generates a secure temporary signed URL for a file in GCS.
 * If GCS client is not initialized, returns a mock local static URL path.
 */
async function generateSignedUrl(gcsPath) {
  if (!gcsPath) return null;
  // If it's already a full signed Google Storage URL, return as-is
  if (gcsPath.startsWith('https://storage.googleapis.com')) {
    return gcsPath;
  }

  const cleanPath = gcsPath.startsWith('/') ? gcsPath.substring(1) : gcsPath;

  if (!bucket) {
    return `/${cleanPath}`;
  }

  try {
    const [url] = await bucket.file(cleanPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 6 * 24 * 60 * 60 * 1000 // 6 days
    });
    return url;
  } catch (err) {
    console.error('Error generating signed URL for:', cleanPath, err);
    return `/${cleanPath}`;
  }
}

/**
 * Uploads binary buffer or Base64 data to GCS bucket
 */
async function uploadToGCS(fileData, destinationPath, contentType) {
  if (!bucket) {
    const localPath = path.join(__dirname, '../../', destinationPath);
    const parentDir = path.dirname(localPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(localPath, fileData);
    return `/${destinationPath}`;
  }

  return new Promise((resolve, reject) => {
    const file = bucket.file(destinationPath);
    const stream = file.createWriteStream({
      metadata: { contentType },
      resumable: false
    });

    stream.on('error', (err) => reject(err));
    stream.on('finish', () => resolve(destinationPath));
    stream.end(fileData);
  });
}

/**
 * Saves uploaded photo (base64 or file buffer) to GCS bucket and returns GCS path & signed URL
 */
async function saveReferenceImage(fileData, fileNamePrefix = 'ref-img') {
  try {
    const timestamp = Date.now();
    const filename = `${fileNamePrefix}-${timestamp}.jpg`;
    const gcsPath = `uploads/images/${filename}`;

    let buffer;
    if (typeof fileData === 'string' && fileData.startsWith('data:image')) {
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else {
      throw new Error('Invalid file format');
    }

    const uploadedPath = await uploadToGCS(buffer, gcsPath, 'image/jpeg');
    const imageUrl = await generateSignedUrl(uploadedPath);

    return {
      filename,
      filepath: uploadedPath,
      imageUrl,
      uploadedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error saving image to GCS:', err);
    throw err;
  }
}

/**
 * Saves uploaded document (file buffer) to GCS bucket and returns GCS path & signed URL
 */
async function saveReferenceDocument(buffer, originalName) {
  try {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}_${safeName}`;
    const gcsPath = `uploads/documents/${filename}`;

    let contentType = 'application/octet-stream';
    if (originalName.endsWith('.pdf')) contentType = 'application/pdf';
    else if (originalName.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (originalName.endsWith('.csv')) contentType = 'text/csv';

    const uploadedPath = await uploadToGCS(buffer, gcsPath, contentType);
    const downloadUrl = await generateSignedUrl(uploadedPath);

    return {
      filename,
      filepath: uploadedPath,
      downloadUrl,
      uploadedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error saving document to GCS:', err);
    throw err;
  }
}


/**
 * Extracts the bare GCS object path from a full signed URL or local path.
 * Used to store only the GCS path in database, not the expiring signed URL.
 */
function extractGcsPath(urlOrPath) {
  if (!urlOrPath) return urlOrPath;
  // If it's a signed URL, extract the object path
  if (urlOrPath.includes('storage.googleapis.com')) {
    try {
      const url = new URL(urlOrPath);
      // pathname is like /bucket-name/uploads/documents/file.pdf
      const parts = url.pathname.split('/');
      // Remove first empty string and bucket name, rejoin the rest
      parts.shift(); // ''
      parts.shift(); // bucket name
      return parts.join('/');
    } catch (e) {
      return urlOrPath;
    }
  }
  // Already a path like /uploads/images/... or uploads/images/...
  return urlOrPath.startsWith('/') ? urlOrPath.substring(1) : urlOrPath;
}


/**
 * Deletes a file from GCS bucket by its path
 */
async function deleteFromGCS(gcsPath) {
  if (!gcsPath || !bucket) return;
  const cleanPath = gcsPath.startsWith('/') ? gcsPath.substring(1) : gcsPath;
  try {
    await bucket.file(cleanPath).delete();
    console.log('[GCS] Deleted:', cleanPath);
  } catch (err) {
    if (err.code === 404) {
      console.log('[GCS] File not found (already deleted):', cleanPath);
    } else {
      console.error('[GCS] Error deleting file:', cleanPath, err.message);
    }
  }
}


/**
 * Streams a file from GCS or returns file metadata
 */
/**
 * Streams a file from GCS with fuzzy fallback search and custom filename
 */
async function streamGCSFile(gcsPath, res, customFilename) {
  if (!gcsPath || !bucket) return false;
  let cleanPath = extractGcsPath(gcsPath);

  try {
    let file = bucket.file(cleanPath);
    let [exists] = await file.exists();

    // If not found by exact path, try searching for matching filename in uploads/documents/
    if (!exists) {
      console.warn('[GCS Stream] Exact file not found:', cleanPath, '- searching fallback...');
      const baseName = cleanPath.split('/').pop();
      const rawName = customFilename || (baseName.includes('_') ? baseName.substring(baseName.indexOf('_') + 1) : baseName);

      const [files] = await bucket.getFiles({ prefix: 'uploads/documents/' });
      const matched = files.find(f => f.name.endsWith(rawName) || f.name.includes(rawName));
      if (matched) {
        console.log('[GCS Stream] Found matching fallback file:', matched.name);
        file = matched;
        exists = true;
        cleanPath = matched.name;
      }
    }

    if (!exists) {
      console.warn('[GCS Stream] No file found in GCS for:', cleanPath);
      return false;
    }

    const [metadata] = await file.getMetadata();
    const isPdf = cleanPath.toLowerCase().endsWith('.pdf');
    const isExcel = cleanPath.toLowerCase().endsWith('.xlsx') || cleanPath.toLowerCase().endsWith('.xls');
    const isCsv = cleanPath.toLowerCase().endsWith('.csv');

    let contentType = metadata.contentType || 'application/octet-stream';
    if (isPdf) contentType = 'application/pdf';
    else if (isExcel) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (isCsv) contentType = 'text/csv';

    const filename = customFilename || metadata.name?.split('/').pop() || 'document.pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    file.createReadStream()
      .on('error', (err) => {
        console.error('[GCS Stream Error]:', err);
        if (!res.headersSent) res.status(500).send('Error streaming document file');
      })
      .pipe(res);

    return true;
  } catch (err) {
    console.error('[GCS Stream Exception]:', err.message);
    return false;
  }
}

module.exports = {
  streamGCSFile,
  saveReferenceImage,
  saveReferenceDocument,
  generateSignedUrl,
  extractGcsPath,
  deleteFromGCS
};
