
type SessionLog = {
  id: string;
  taskName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in milliseconds
  distractions: DistractionEvent[];
};

export type DistractionEvent = {
  id: string;
  timestamp: Date;
  type: 'idle' | 'app_switch' | 'typing_inactivity' | 'mouse_inactivity' | 'manual';
  duration: number; // in milliseconds
  notes?: string;
};

const SESSION_LOGS_KEY = 'attention-please-session-logs';

// Get all session logs
export const getSessionLogs = (): SessionLog[] => {
  try {
    const storedLogs = localStorage.getItem(SESSION_LOGS_KEY);
    if (storedLogs) {
      const logs = JSON.parse(storedLogs);
      
      // Convert string dates back to Date objects
      return logs.map((log: any) => ({
        ...log,
        startTime: new Date(log.startTime),
        endTime: log.endTime ? new Date(log.endTime) : null,
        distractions: log.distractions.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error("Failed to load session logs:", error);
  }
  
  return [];
};

// Add a new session log
export const startSession = (taskName: string): SessionLog => {
  const logs = getSessionLogs();
  const newSession: SessionLog = {
    id: generateId(),
    taskName,
    startTime: new Date(),
    endTime: null,
    duration: 0,
    distractions: []
  };
  
  const updatedLogs = [...logs, newSession];
  saveSessionLogs(updatedLogs);
  
  return newSession;
};

// End a session
export const endSession = (sessionId: string): SessionLog | null => {
  const logs = getSessionLogs();
  const sessionIndex = logs.findIndex(log => log.id === sessionId);
  
  if (sessionIndex === -1) return null;
  
  const endTime = new Date();
  const updatedSession = {
    ...logs[sessionIndex],
    endTime,
    duration: endTime.getTime() - new Date(logs[sessionIndex].startTime).getTime()
  };
  
  logs[sessionIndex] = updatedSession;
  saveSessionLogs(logs);
  
  return updatedSession;
};

// Add a distraction event to a session
export const addDistractionEvent = (
  sessionId: string,
  type: DistractionEvent['type'],
  duration: number,
  notes?: string
): DistractionEvent | null => {
  const logs = getSessionLogs();
  const sessionIndex = logs.findIndex(log => log.id === sessionId);
  
  if (sessionIndex === -1) return null;
  
  const distractionEvent: DistractionEvent = {
    id: generateId(),
    timestamp: new Date(),
    type,
    duration,
    notes
  };
  
  logs[sessionIndex].distractions.push(distractionEvent);
  saveSessionLogs(logs);
  
  return distractionEvent;
};

// Save session logs to localStorage
const saveSessionLogs = (logs: SessionLog[]): void => {
  try {
    localStorage.setItem(SESSION_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to save session logs:", error);
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current active session (if any)
export const getCurrentSession = (): SessionLog | null => {
  const logs = getSessionLogs();
  return logs.find(log => !log.endTime) || null;
};

// Get all sessions for a specific date range
export const getSessionsByDateRange = (startDate: Date, endDate: Date): SessionLog[] => {
  const logs = getSessionLogs();
  return logs.filter(log => {
    const sessionStart = new Date(log.startTime);
    return sessionStart >= startDate && sessionStart <= endDate;
  });
};
