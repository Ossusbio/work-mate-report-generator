import { auth } from './firebase';

const API_BASE = '/api/reports';

async function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Token retrieval warning:', err);
  }
  return headers;
}

export async function uploadPhoto(formDataOrBase64, runId = null) {
  let body;
  let headers = await getAuthHeaders();

  if (formDataOrBase64 instanceof FormData) {
    if (runId) formDataOrBase64.append('runId', runId);
    body = formDataOrBase64;
  } else {
    body = JSON.stringify({ base64Image: formDataOrBase64, ...(runId ? { runId } : {}) });
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}/upload-image`, {
    method: 'POST',
    headers,
    body
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Photo upload failed');
  }

  return await res.json();
}

export async function uploadDocument(file, runId = null) {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('document', file);
  if (runId) formData.append('runId', runId);

  const res = await fetch(`${API_BASE}/upload-document`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Document upload failed');
  }

  return await res.json();
}

export async function previewData(params) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/preview-data`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to preview data');
  }

  return await res.json();
}

export async function generateReport(params) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Report generation failed');
  }

  return await res.json();
}

export async function fetchReport(reportId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/${reportId}`, { headers });
  if (!res.ok) throw new Error('Report fetch failed');
  return await res.json();
}

export async function updateReportDraft(reportId, payload) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/${reportId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Update failed');
  return await res.json();
}

export async function exportReport(reportId, format = 'excel', customName = null) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/${reportId}/export`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ format })
  });

  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const safeName = (customName || reportId).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = format === 'csv' ? `${safeName}.csv` : `${safeName}.xlsx`;
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchReportHistory() {
  const headers = await getAuthHeaders();
  const res = await fetch(API_BASE, { headers });
  if (!res.ok) throw new Error('History fetch failed');
  return await res.json();
}

export async function fetchLiveTelemetry(reportId) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/${reportId}/fetch-telemetry`, {
    method: 'POST',
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch telemetry data');
  }

  return await res.json();
}

export async function deleteReport(reportId, email) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/${reportId}?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete report');
  }

  return await res.json();
}

export async function setPasswordBypass(email, password) {
  const res = await fetch(`${API_BASE}/auth/set-password-bypass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to set password');
  }
  return await res.json();
}

// ==================== Role & Access Management API ====================
export async function fetchMyRole() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/roles/my-role', { headers });
  if (!res.ok) return { role: 'user' };
  return await res.json();
}

export async function fetchUsersList() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/roles/users', { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch users list');
  }
  return await res.json();
}

export async function updateUserRole(email, role) {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch('/api/roles/update', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, role })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update user role');
  }
  return await res.json();
}

export async function removeUserRole(email) {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/roles/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete user');
  }
  return response.json();
}

/**
 * Fetches BigQuery schema stream metadata and units for a site
 */
export async function fetchStreamMetadata(site = 'UCS') {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/reports/streams/metadata?site=${encodeURIComponent(site)}`, {
      headers
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.streams || {};
  } catch (err) {
    console.warn('Could not fetch stream metadata:', err.message);
    return {};
  }
}
