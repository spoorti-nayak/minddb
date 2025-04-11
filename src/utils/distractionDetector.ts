
import { useEffect, useRef, useState } from 'react';
import { getCurrentSession, addDistractionEvent } from './sessionTracker';

// Constants for inactivity thresholds
const DEFAULT_MOUSE_INACTIVITY_THRESHOLD = 60000; // 1 minute
const DEFAULT_KEYBOARD_INACTIVITY_THRESHOLD = 120000; // 2 minutes

export function useDistractionDetector(
  mouseInactivityThreshold = DEFAULT_MOUSE_INACTIVITY_THRESHOLD,
  keyboardInactivityThreshold = DEFAULT_KEYBOARD_INACTIVITY_THRESHOLD,
  enabled = true
) {
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionReason, setDistractionReason] = useState<string | null>(null);
  const [distractionStartTime, setDistractionStartTime] = useState<Date | null>(null);
  
  const lastActivityTime = useRef(Date.now());
  const lastKeyPressTime = useRef(Date.now());
  const mouseTimeout = useRef<NodeJS.Timeout | null>(null);
  const keyboardTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Track active session
  const activeSession = useRef(getCurrentSession());
  
  const resetMouseTimer = () => {
    if (mouseTimeout.current) {
      clearTimeout(mouseTimeout.current);
    }
    
    mouseTimeout.current = setTimeout(() => {
      const currentSession = getCurrentSession();
      if (enabled && currentSession) {
        setIsDistracted(true);
        setDistractionReason('mouse_inactivity');
        setDistractionStartTime(new Date());
        addDistractionEvent(
          currentSession.id,
          'mouse_inactivity',
          0,
          'Mouse inactive for too long'
        );
      }
    }, mouseInactivityThreshold);
  };
  
  const resetKeyboardTimer = () => {
    if (keyboardTimeout.current) {
      clearTimeout(keyboardTimeout.current);
    }
    
    keyboardTimeout.current = setTimeout(() => {
      const currentSession = getCurrentSession();
      if (enabled && currentSession) {
        setIsDistracted(true);
        setDistractionReason('typing_inactivity');
        setDistractionStartTime(new Date());
        addDistractionEvent(
          currentSession.id,
          'typing_inactivity',
          0,
          'Keyboard inactive for too long'
        );
      }
    }, keyboardInactivityThreshold);
  };
  
  const handleMouseActivity = () => {
    lastActivityTime.current = Date.now();
    
    if (isDistracted && distractionReason === 'mouse_inactivity') {
      endDistraction();
    }
    
    resetMouseTimer();
  };
  
  const handleKeyboardActivity = () => {
    lastKeyPressTime.current = Date.now();
    
    if (isDistracted && distractionReason === 'typing_inactivity') {
      endDistraction();
    }
    
    resetKeyboardTimer();
  };
  
  const endDistraction = () => {
    if (!isDistracted || !distractionStartTime) return;
    
    const currentSession = getCurrentSession();
    if (currentSession && distractionReason) {
      const duration = Date.now() - distractionStartTime.getTime();
      
      // Update the last distraction event with its duration
      addDistractionEvent(
        currentSession.id,
        distractionReason as any,
        duration,
        `${distractionReason} ended after ${Math.round(duration / 1000)} seconds`
      );
    }
    
    setIsDistracted(false);
    setDistractionReason(null);
    setDistractionStartTime(null);
  };
  
  // Handle app/tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentSession = getCurrentSession();
      
      if (document.hidden && enabled && currentSession) {
        // User switched to another tab or app
        setIsDistracted(true);
        setDistractionReason('app_switch');
        setDistractionStartTime(new Date());
        addDistractionEvent(
          currentSession.id,
          'app_switch',
          0,
          'Switched to another app or tab'
        );
      } else if (!document.hidden && isDistracted && distractionReason === 'app_switch') {
        // User came back
        endDistraction();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isDistracted, distractionReason]);
  
  // Set up activity listeners
  useEffect(() => {
    if (enabled) {
      // Update active session reference
      activeSession.current = getCurrentSession();
      
      // Set up event listeners for mouse and keyboard
      document.addEventListener('mousemove', handleMouseActivity);
      document.addEventListener('mousedown', handleMouseActivity);
      document.addEventListener('keydown', handleKeyboardActivity);
      document.addEventListener('scroll', handleMouseActivity);
      
      // Initialize timers
      resetMouseTimer();
      resetKeyboardTimer();
      
      return () => {
        // Clean up
        document.removeEventListener('mousemove', handleMouseActivity);
        document.removeEventListener('mousedown', handleMouseActivity);
        document.removeEventListener('keydown', handleKeyboardActivity);
        document.removeEventListener('scroll', handleMouseActivity);
        
        if (mouseTimeout.current) {
          clearTimeout(mouseTimeout.current);
        }
        if (keyboardTimeout.current) {
          clearTimeout(keyboardTimeout.current);
        }
      };
    }
  }, [enabled]);
  
  return {
    isDistracted,
    distractionReason,
    distractionStartTime,
    endDistraction,
    manuallyAddDistraction: (type: string, notes?: string) => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        addDistractionEvent(
          currentSession.id,
          'manual' as any,
          0,
          notes || `Manually recorded distraction: ${type}`
        );
      }
    }
  };
}

// Idle detection utility (uses Page Visibility API)
export function useIdleDetection(idleThreshold = 300000) {  // 5 minutes by default
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const idleStartTime = useRef<Date | null>(null);
  
  const resetIdleTimer = () => {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
    
    if (isIdle) {
      setIsIdle(false);
      const currentSession = getCurrentSession();
      if (currentSession && idleStartTime.current) {
        const duration = Date.now() - idleStartTime.current.getTime();
        addDistractionEvent(
          currentSession.id,
          'idle',
          duration,
          `User returned from idle state after ${Math.round(duration / 1000)} seconds`
        );
        idleStartTime.current = null;
      }
    }
    
    idleTimeout.current = setTimeout(() => {
      setIsIdle(true);
      idleStartTime.current = new Date();
      const currentSession = getCurrentSession();
      if (currentSession) {
        addDistractionEvent(
          currentSession.id,
          'idle',
          0,
          'User went idle'
        );
      }
    }, idleThreshold);
  };
  
  useEffect(() => {
    // Set up event listeners for any activity
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });
    
    // Initialize timer
    resetIdleTimer();
    
    return () => {
      // Clean up
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, [idleThreshold]);
  
  return isIdle;
}
