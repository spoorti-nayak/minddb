
// Sound types available in the application
export type SoundType = 'notification' | 'focus' | 'break' | 'eyecare' | 'distraction';

// Sound settings structure
export interface SoundSettings {
  enabled: boolean;
  volume: number;
  focusBackgroundSound: boolean;
  notificationSounds: boolean;
  customSounds: Record<SoundType, string>;
}

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7,
  focusBackgroundSound: false,
  notificationSounds: true,
  customSounds: {
    notification: '/notification.mp3',
    focus: '/focus-ambient.mp3',
    break: '/break-chime.mp3',
    eyecare: '/calming.mp3',
    distraction: '/gentle-alert.mp3'
  }
};

const SOUND_SETTINGS_KEY = 'attention-please-sound-settings';

// Cache for audio elements to prevent multiple instances
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Get the sound settings from localStorage
 */
export const getSoundSettings = (): SoundSettings => {
  try {
    const storedSettings = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error("Failed to load sound settings:", error);
  }
  
  return DEFAULT_SOUND_SETTINGS;
};

/**
 * Save sound settings to localStorage
 */
export const saveSoundSettings = (settings: SoundSettings): void => {
  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save sound settings:", error);
  }
};

/**
 * Play a sound by type
 */
export const playSound = (soundType: SoundType): void => {
  const settings = getSoundSettings();
  
  if (!settings.enabled || !settings.notificationSounds) {
    return;
  }
  
  const soundPath = settings.customSounds[soundType];
  
  if (!soundPath) {
    console.warn(`No sound defined for type: ${soundType}`);
    return;
  }
  
  try {
    // Use cached audio element or create a new one
    if (!audioCache[soundType]) {
      audioCache[soundType] = new Audio(soundPath);
    }
    
    const audio = audioCache[soundType];
    audio.volume = settings.volume;
    
    // Reset audio to beginning if already playing
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.error(`Failed to play sound (${soundType}):`, err);
    });
  } catch (error) {
    console.error(`Error playing sound (${soundType}):`, error);
  }
};

/**
 * Start background ambient sound for focus session
 */
export const startBackgroundSound = (): HTMLAudioElement | null => {
  const settings = getSoundSettings();
  
  if (!settings.enabled || !settings.focusBackgroundSound) {
    return null;
  }
  
  try {
    const soundPath = settings.customSounds.focus;
    const audio = new Audio(soundPath);
    audio.volume = settings.volume * 0.4; // Lower volume for background
    audio.loop = true;
    audio.play().catch(err => {
      console.error("Failed to play background sound:", err);
    });
    return audio;
  } catch (error) {
    console.error("Error starting background sound:", error);
    return null;
  }
};

/**
 * Stop background sound
 */
export const stopBackgroundSound = (audioElement: HTMLAudioElement | null): void => {
  if (audioElement) {
    try {
      audioElement.pause();
      audioElement.currentTime = 0;
    } catch (error) {
      console.error("Error stopping background sound:", error);
    }
  }
};
