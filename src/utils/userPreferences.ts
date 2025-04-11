
type TimerSettings = {
  focusTime: number;
  breakTime: number;
};

const TIMER_SETTINGS_KEY = 'attention-please-timer-settings';

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
