
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
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { getEyeCareSettings, saveEyeCareSettings } from "@/utils/userPreferences";

export function SettingsPanel() {
  const { toast } = useToast();
  const [eyeCareSettings, setEyeCareSettings] = useState(getEyeCareSettings());

  const handleSave = () => {
    // For eye care settings
    saveEyeCareSettings(eyeCareSettings);
    
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

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="eyecare">Eye Care</TabsTrigger>
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
    </Tabs>
  );
}
