import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Clock, Bell, Activity, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEyeCareSettings, saveEyeCareSettings } from "@/utils/userPreferences";
import { playSound } from "@/utils/soundManager";

interface EyeCareReminderProps {
  className?: string;
}

type ReminderType = "eyeBreak" | "blink" | "screenBreak";

export function EyeCareReminder({ className }: EyeCareReminderProps) {
  const settings = getEyeCareSettings();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [reminderType, setReminderType] = useState<ReminderType>("eyeBreak");
  const [progress, setProgress] = useState(100);
  
  const [eyeBreakInterval, setEyeBreakInterval] = useState(settings.eyeBreakInterval);
  const [eyeBreakDuration, setEyeBreakDuration] = useState(settings.eyeBreakDuration);
  const [blinkInterval, setBlinkInterval] = useState(settings.blinkInterval);
  const [screenBreakInterval, setScreenBreakInterval] = useState(settings.screenBreakInterval);
  const [screenBreakDuration, setScreenBreakDuration] = useState(settings.screenBreakDuration);
  const [playSounds, setPlaySounds] = useState(settings.playSounds);
  
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const getCurrentInterval = () => {
    switch (reminderType) {
      case "eyeBreak": return eyeBreakInterval;
      case "blink": return blinkInterval;
      case "screenBreak": return screenBreakInterval;
      default: return eyeBreakInterval;
    }
  };

  const getCurrentDuration = () => {
    switch (reminderType) {
      case "eyeBreak": return eyeBreakDuration;
      case "blink": return 5;
      case "screenBreak": return screenBreakDuration;
      default: return eyeBreakDuration;
    }
  };
  
  const resetTimer = () => {
    setTimeElapsed(0);
    setProgress(100);
  };

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      resetTimer();
    }
  };

  const handleSaveSettings = () => {
    const newSettings = {
      eyeBreakInterval,
      eyeBreakDuration,
      blinkInterval,
      screenBreakInterval,
      screenBreakDuration,
      playSounds
    };
    
    saveEyeCareSettings(newSettings);
    
    toast({
      title: "Settings saved",
      description: "Your eye care preferences have been updated",
    });
  };

  const notifyUser = (title: string, message: string) => {
    toast({
      title: title,
      description: message,
    });
    
    if (playSounds) {
      playSound("eyecare");
    }
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico"
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const currentInterval = getCurrentInterval() * 60;
    const currentDuration = getCurrentDuration();
    let isInBreak = false;
    let breakTimeRemaining = 0;

    if (isActive) {
      interval = setInterval(() => {
        if (isInBreak) {
          if (breakTimeRemaining <= 0) {
            isInBreak = false;
            resetTimer();
            
            notifyUser("Break completed!", "Time to get back to work.");
          } else {
            breakTimeRemaining -= 1;
            const breakProgress = (breakTimeRemaining / currentDuration) * 100;
            setProgress(breakProgress);
          }
        } else {
          if (timeElapsed >= currentInterval) {
            let breakTitle = "";
            let breakDescription = "";
            
            switch (reminderType) {
              case "eyeBreak":
                breakTitle = "Time for an eye break!";
                breakDescription = "Look at something 20 feet away for 20 seconds.";
                setReminderType("blink");
                break;
              case "blink":
                breakTitle = "Time to blink!";
                breakDescription = "Blink rapidly for a few seconds to refresh your eyes.";
                setReminderType("screenBreak");
                break;
              case "screenBreak":
                breakTitle = "Time for a screen break!";
                breakDescription = "Stand up, stretch, and look away from your screen.";
                setReminderType("eyeBreak");
                break;
            }
            
            notifyUser(breakTitle, breakDescription);
            
            isInBreak = true;
            breakTimeRemaining = currentDuration;
            setProgress(100);
          } else {
            setTimeElapsed(timeElapsed + 1);
            const workProgress = ((currentInterval - timeElapsed) / currentInterval) * 100;
            setProgress(workProgress);
          }
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeElapsed, reminderType, eyeBreakInterval, eyeBreakDuration, blinkInterval, screenBreakInterval, screenBreakDuration, playSounds, toast]);

  const getTimerDisplay = () => {
    const currentInterval = getCurrentInterval() * 60;
    const timeRemaining = currentInterval - timeElapsed;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    return {
      title: reminderType === "eyeBreak" 
        ? "Eye Break" 
        : reminderType === "blink" 
          ? "Blink Reminder" 
          : "Screen Break",
      time: `${minutes}:${String(seconds).padStart(2, "0")}`,
      icon: reminderType === "eyeBreak" 
        ? <Eye className="h-6 w-6" /> 
        : reminderType === "blink" 
          ? <Activity className="h-6 w-6" /> 
          : <Bell className="h-6 w-6" />
    };
  };

  const timerDisplay = getTimerDisplay();

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Eye Care</span>
        </CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Tabs defaultValue="eyebreak">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="eyebreak">Eye Break</TabsTrigger>
                <TabsTrigger value="blink">Blink</TabsTrigger>
                <TabsTrigger value="screenbreak">Screen Break</TabsTrigger>
              </TabsList>
              
              <TabsContent value="eyebreak" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eye-break-interval">
                    Interval: {eyeBreakInterval} minutes
                  </Label>
                  <Slider
                    id="eye-break-interval"
                    min={1}
                    max={60}
                    step={1}
                    value={[eyeBreakInterval]}
                    onValueChange={(value) => setEyeBreakInterval(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eye-break-duration">
                    Duration: {eyeBreakDuration} seconds
                  </Label>
                  <Slider
                    id="eye-break-duration"
                    min={5}
                    max={60}
                    step={5}
                    value={[eyeBreakDuration]}
                    onValueChange={(value) => setEyeBreakDuration(value[0])}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="blink" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blink-interval">
                    Interval: {blinkInterval} minutes
                  </Label>
                  <Slider
                    id="blink-interval"
                    min={1}
                    max={30}
                    step={1}
                    value={[blinkInterval]}
                    onValueChange={(value) => setBlinkInterval(value[0])}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Blink reminders last for 5 seconds to promote eye moisture
                </p>
              </TabsContent>
              
              <TabsContent value="screenbreak" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="screen-break-interval">
                    Interval: {screenBreakInterval} minutes
                  </Label>
                  <Slider
                    id="screen-break-interval"
                    min={10}
                    max={120}
                    step={5}
                    value={[screenBreakInterval]}
                    onValueChange={(value) => setScreenBreakInterval(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screen-break-duration">
                    Duration: {screenBreakDuration} seconds
                  </Label>
                  <Slider
                    id="screen-break-duration"
                    min={30}
                    max={300}
                    step={30}
                    value={[screenBreakDuration]}
                    onValueChange={(value) => setScreenBreakDuration(value[0])}
                  />
                </div>
              </TabsContent>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="play-sounds">Play sounds</Label>
                  <p className="text-xs text-muted-foreground">
                    Audio notifications and calming sounds during breaks
                  </p>
                </div>
                <Switch 
                  id="play-sounds" 
                  checked={playSounds}
                  onCheckedChange={setPlaySounds}
                />
              </div>
              
              <Button onClick={handleSaveSettings} className="w-full mt-4">
                Save Settings
              </Button>
            </Tabs>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            "flex h-32 w-32 flex-col items-center justify-center rounded-full border-4",
            reminderType === "eyeBreak" 
              ? "border-attention-blue-300 bg-attention-blue-50" 
              : reminderType === "blink" 
                ? "border-attention-warm-300 bg-attention-warm-50 animate-pulse"
                : "border-secondary bg-secondary/10"
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {timerDisplay.icon}
            <span className="text-lg font-semibold mt-1">{timerDisplay.title}</span>
            <span className="timer-display text-sm">
              {timerDisplay.time}
            </span>
          </div>
        </div>

        <Progress 
          value={progress} 
          className={cn(
            "h-2 w-full", 
            reminderType === "eyeBreak" ? "bg-attention-blue-100" : 
            reminderType === "blink" ? "bg-attention-warm-100" : "bg-secondary/50"
          )} 
        />

        <div className="flex space-x-2">
          <Button
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={toggleActive}
            className="rounded-full"
          >
            {isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" /> Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="rounded-full"
          >
            <Clock className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {reminderType === "eyeBreak" 
            ? "20-20-20 rule: Every 20 minutes, look 20 feet away for 20 seconds" 
            : reminderType === "blink" 
              ? "Remember to blink frequently to keep your eyes moist"
              : "Take regular breaks to stand, stretch, and reduce strain"}
        </div>
      </CardContent>
    </Card>
  );
}
