
type TimerSettings = {
  focusTime: number;
  breakTime: number;
};

type EyeCareSettings = {
  eyeBreakInterval: number;  // in minutes
  eyeBreakDuration: number;  // in seconds
  blinkInterval: number;     // in minutes
  screenBreakInterval: number; // in minutes
  screenBreakDuration: number; // in seconds
  playSounds: boolean;
};

const TIMER_SETTINGS_KEY = 'attention-please-timer-settings';
const EYE_CARE_SETTINGS_KEY = 'attention-please-eye-care-settings';

export const getTimerSettings = (): TimerSettings => {
  try {
    const storedSettings = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error("Failed to load timer settings:", error);
  }
  
  // Default settings
  return {
    focusTime: 25,
    breakTime: 5
  };
};

export const saveTimerSettings = (settings: TimerSettings): void => {
  try {
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save timer settings:", error);
  }
};

export const getEyeCareSettings = (): EyeCareSettings => {
  try {
    const storedSettings = localStorage.getItem(EYE_CARE_SETTINGS_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error("Failed to load eye care settings:", error);
  }
  
  // Default settings
  return {
    eyeBreakInterval: 20,     // 20 minutes (20-20-20 rule)
    eyeBreakDuration: 20,     // 20 seconds
    blinkInterval: 5,         // 5 minutes
    screenBreakInterval: 60,  // 60 minutes
    screenBreakDuration: 60,  // 60 seconds
    playSounds: true
  };
};

export const saveEyeCareSettings = (settings: EyeCareSettings): void => {
  try {
    localStorage.setItem(EYE_CARE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save eye care settings:", error);
  }
};
