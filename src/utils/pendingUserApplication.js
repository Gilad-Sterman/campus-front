const STORAGE_KEY = 'pendingAddToMyApplications';
const MAX_AGE_MS = 30 * 60 * 1000;

/**
 * Remember a program to add after the user signs in (used when logged out).
 * @param {string} programId
 * @param {string} universityId
 */
export function setPendingUserApplication(programId, universityId) {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      program_id: programId,
      university_id: universityId,
      ts: Date.now()
    })
  );
}

export function getPendingUserApplication() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.program_id || !data.university_id) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - (data.ts || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingUserApplication() {
  sessionStorage.removeItem(STORAGE_KEY);
}
