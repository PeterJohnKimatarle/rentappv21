/**
 * Session Tracking Utilities
 * Tracks active user sessions in localStorage
 */

interface ActiveSession {
  userId: string;
  role: string;
  timestamp: number;
}

const ACTIVE_SESSIONS_KEY = 'rentapp_active_sessions';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const loadActiveSessions = (): ActiveSession[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
  if (!raw) return [];
  try {
    const sessions: ActiveSession[] = JSON.parse(raw);
    // Filter out expired sessions
    const now = Date.now();
    return sessions.filter(session => now - session.timestamp < SESSION_TIMEOUT_MS);
  } catch (error) {
    console.error('Error parsing active sessions:', error);
    localStorage.removeItem(ACTIVE_SESSIONS_KEY);
    return [];
  }
};

const saveActiveSessions = (sessions: ActiveSession[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
};

export const addActiveSession = (userId: string, email: string) => {
  const sessions = loadActiveSessions();
  const existingSessionIndex = sessions.findIndex(s => s.userId === userId);
  const newSession: ActiveSession = { userId, role: 'user', timestamp: Date.now() };

  if (existingSessionIndex > -1) {
    sessions[existingSessionIndex] = newSession;
  } else {
    sessions.push(newSession);
  }
  saveActiveSessions(sessions);
};

export const removeActiveSession = (userId?: string) => {
  if (!userId) return;
  const sessions = loadActiveSessions();
  const updatedSessions = sessions.filter(s => s.userId !== userId);
  saveActiveSessions(updatedSessions);
};

export const getActiveSessions = (): ActiveSession[] => {
  return loadActiveSessions();
};

export const getOnlineUserCount = (): number => {
  const sessions = getActiveSessions();
  return sessions.length;
};

export const clearAllSessions = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_SESSIONS_KEY);
};













