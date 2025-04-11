import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { getEyeCareSettings, saveEyeCareSettings } from "@/utils/userPreferences";
import { 
  getSoundSettings, 
  saveSoundSettings, 
  SoundSettings, 
  SoundType 
} from "@/utils/soundManager";
import { Slider } from "@/components/ui/slider";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Music, 
  List 
} from "lucide-react";

export function SettingsPanel() {
  const { toast } = useToast();
  const [eyeCareSettings, setEyeCareSettings] = useState(getEyeCareSettings());
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(getSoundSettings());
  const [appSettings, setAppSettings] = useState({
    productiveApps: ["Google Docs", "Visual Studio Code", "Slack", "Microsoft Office"],
    distractingApps: ["YouTube", "Facebook", "Twitter", "Instagram", "TikTok"]
  });

  const handleSave = () => {
    // For eye care settings
    saveEyeCareSettings(eyeCareSettings);
    
    // For sound settings
    saveSoundSettings(soundSettings);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleEyeCareChange = (key: keyof typeof eyeCareSettings, value: any) => {
    setEyeCareSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSoundSettingChange = (key: keyof SoundSettings, value: any) => {
    setSoundSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCustomSoundChange = (soundType: SoundType, value: string) => {
    setSoundSettings(prev => ({
      ...prev,
      customSounds: {
        ...prev.customSounds,
        [soundType]: value
      }
    }));
  };

  const handleAppListChange = (listType: 'productiveApps' | 'distractingApps', value: string) => {
    setAppSettings(prev => ({
      ...prev,
      [listType]: value.split(',').map(app => app.trim()).filter(app => app)
    }));
  };

  // Test sound function
  const testSound = (soundType: SoundType) => {
    // This would normally use the soundManager.playSound function
    // But for testing on click without importing the function here
    const audio = new Audio(soundSettings.customSounds[soundType]);
    audio.volume = soundSettings.volume;
    audio.play().catch(err => {
      console.error(`Failed to play test sound:`, err);
    });
    
    toast({
      title: "Playing sound",
      description: `Testing ${soundType} sound`,
    });
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="eyecare">Eye Care</TabsTrigger>
        <TabsTrigger value="sounds">Sounds</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure your basic app preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="JohnDoe" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autostart">Start app on system boot</Label>
                <p className="text-sm text-muted-foreground">
                  Launch automatically when you log in
                </p>
              </div>
              <Switch id="autostart" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="minimizeToTray">Minimize to system tray</Label>
                <p className="text-sm text-muted-foreground">
                  Keep running in the background when closed
                </p>
              </div>
              <Switch id="minimizeToTray" defaultChecked />
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">App Classification</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productiveApps">Productive Apps</Label>
              <Input 
                id="productiveApps"
                type="text"
                value={appSettings.productiveApps.join(', ')}
                onChange={(e) => handleAppListChange('productiveApps', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of apps that help you focus
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distractingApps">Distracting Apps</Label>
              <Input 
                id="distractingApps"
                type="text"
                value={appSettings.distractingApps.join(', ')}
                onChange={(e) => handleAppListChange('distractingApps', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of apps that might distract you
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Control how and when you receive alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusNotifications">Focus reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when you seem distracted
                </p>
              </div>
              <Switch id="focusNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="eyeCareNotifications">Eye care reminders</Label>
                <p className="text-sm text-muted-foreground">
                  20-20-20 rule notifications
                </p>
              </div>
              <Switch id="eyeCareNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="soundEffects">Sound effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds with notifications
                </p>
              </div>
              <Switch 
                id="soundEffects" 
                checked={eyeCareSettings.playSounds}
                onCheckedChange={(value) => handleEyeCareChange("playSounds", value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quietHours">Quiet hours</Label>
              <div className="flex space-x-2">
                <Input id="quietHoursStart" type="time" defaultValue="22:00" />
                <span className="flex items-center">to</span>
                <Input id="quietHoursEnd" type="time" defaultValue="08:00" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="distractionAlerts">Distraction alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you seem distracted
                </p>
              </div>
              <Switch id="distractionAlerts" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktopNotifications">Desktop notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Allow system notifications outside the app
                </p>
              </div>
              <Switch id="desktopNotifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sessionCompletionAlerts">Session alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when focus sessions start/end
                </p>
              </div>
              <Switch id="sessionCompletionAlerts" defaultChecked />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="eyecare">
        <Card>
          <CardHeader>
            <CardTitle>Eye Care Settings</CardTitle>
            <CardDescription>
              Customize your eye protection features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="eyeCareEnabled">Enable eye care</Label>
                <p className="text-sm text-muted-foreground">
                  Track screen time and provide reminders
                </p>
              </div>
              <Switch id="eyeCareEnabled" defaultChecked />
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">Eye Break Settings (20-20-20 rule)</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderInterval">Eye break interval (minutes)</Label>
              <Input
                id="reminderInterval"
                type="number"
                min="5"
                max="60"
                value={eyeCareSettings.eyeBreakInterval}
                onChange={(e) => handleEyeCareChange("eyeBreakInterval", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Standard recommendation is 20 minutes (20-20-20 rule)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restDuration">Eye break duration (seconds)</Label>
              <Input
                id="restDuration"
                type="number"
                min="5"
                max="60"
                value={eyeCareSettings.eyeBreakDuration}
                onChange={(e) => handleEyeCareChange("eyeBreakDuration", parseInt(e.target.value))}
              />
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">Blink Reminder Settings</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="blinkInterval">Blink reminder interval (minutes)</Label>
              <Input
                id="blinkInterval"
                type="number"
                min="1"
                max="30"
                value={eyeCareSettings.blinkInterval}
                onChange={(e) => handleEyeCareChange("blinkInterval", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Regular blinking helps keep your eyes moist
              </p>
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">Screen Break Settings</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="screenBreakInterval">Screen break interval (minutes)</Label>
              <Input
                id="screenBreakInterval"
                type="number"
                min="10"
                max="120"
                value={eyeCareSettings.screenBreakInterval}
                onChange={(e) => handleEyeCareChange("screenBreakInterval", parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Stand up, stretch, and look away from your screen
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="screenBreakDuration">Screen break duration (seconds)</Label>
              <Input
                id="screenBreakDuration"
                type="number"
                min="30"
                max="300"
                value={eyeCareSettings.screenBreakDuration}
                onChange={(e) => handleEyeCareChange("screenBreakDuration", parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screenDimming">Screen dimming during breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Slightly dim the screen to encourage looking away
                </p>
              </div>
              <Switch id="screenDimming" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="playSounds">Play sounds</Label>
                <p className="text-sm text-muted-foreground">
                  Play notification and calming sounds during breaks
                </p>
              </div>
              <Switch 
                id="playSounds" 
                checked={eyeCareSettings.playSounds}
                onCheckedChange={(value) => handleEyeCareChange("playSounds", value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="sounds">
        <Card>
          <CardHeader>
            <CardTitle>Sound Settings</CardTitle>
            <CardDescription>
              Customize sound effects and ambient audio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSounds">Enable sounds</Label>
                <p className="text-sm text-muted-foreground">
                  Master sound switch for all audio
                </p>
              </div>
              <Switch 
                id="enableSounds"
                checked={soundSettings.enabled}
                onCheckedChange={(value) => handleSoundSettingChange("enabled", value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volumeControl">
                Volume: {Math.round(soundSettings.volume * 100)}%
              </Label>
              <div className="flex items-center space-x-2">
                <VolumeX size={18} className="text-muted-foreground" />
                <Slider
                  id="volumeControl"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[soundSettings.volume]}
                  onValueChange={(value) => handleSoundSettingChange("volume", value[0])}
                />
                <Volume2 size={18} className="text-muted-foreground" />
              </div>
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">Notification Sounds</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificationSounds">Alert sounds</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds with notifications
                </p>
              </div>
              <Switch 
                id="notificationSounds"
                checked={soundSettings.notificationSounds}
                onCheckedChange={(value) => handleSoundSettingChange("notificationSounds", value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notificationSound">Notification sound</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="notificationSound"
                    value={soundSettings.customSounds.notification}
                    onChange={(e) => handleCustomSoundChange("notification", e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => testSound("notification")}
                  >
                    <Bell size={18} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eyecareSound">Eye care sound</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="eyecareSound"
                    value={soundSettings.customSounds.eyecare}
                    onChange={(e) => handleCustomSoundChange("eyecare", e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => testSound("eyecare")}
                  >
                    <Bell size={18} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distractionSound">Distraction alert</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="distractionSound"
                    value={soundSettings.customSounds.distraction}
                    onChange={(e) => handleCustomSoundChange("distraction", e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => testSound("distraction")}
                  >
                    <Bell size={18} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="breakSound">Break chime</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="breakSound"
                    value={soundSettings.customSounds.break}
                    onChange={(e) => handleCustomSoundChange("break", e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => testSound("break")}
                  >
                    <Bell size={18} />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 pb-1 border-b">
              <h3 className="font-medium text-sm">Background Sounds</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusBackgroundSound">Focus ambient sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play soothing background sound during focus sessions
                </p>
              </div>
              <Switch 
                id="focusBackgroundSound"
                checked={soundSettings.focusBackgroundSound}
                onCheckedChange={(value) => handleSoundSettingChange("focusBackgroundSound", value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="focusSound">Focus ambient sound</Label>
              <div className="flex space-x-2">
                <Input 
                  id="focusSound"
                  value={soundSettings.customSounds.focus}
                  onChange={(e) => handleCustomSoundChange("focus", e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => testSound("focus")}
                >
                  <Music size={18} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ambient sound file to play during focus sessions
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
