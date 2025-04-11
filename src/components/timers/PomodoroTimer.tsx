
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";

interface TimerProps {
  initialMinutes?: number;
  breakMinutes?: number;
  className?: string;
  onSettingsChange?: (focusMinutes: number, breakMinutes: number) => void;
}

export function PomodoroTimer({
  initialMinutes = 25,
  breakMinutes = 5,
  className,
  onSettingsChange,
}: TimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [progress, setProgress] = useState(100);
  const [focusTime, setFocusTime] = useState(initialMinutes);
  const [breakTime, setBreakTime] = useState(breakMinutes);
  
  // Use ref to track the current timer mode's total seconds
  const totalSecondsRef = useRef(isBreak ? breakTime * 60 : focusTime * 60);
  const { toast } = useToast();

  // Update total seconds when mode or settings change
  useEffect(() => {
    totalSecondsRef.current = isBreak ? breakTime * 60 : focusTime * 60;
  }, [isBreak, focusTime, breakTime]);

  const resetTimer = (isBreakTime: boolean = false) => {
    setIsActive(false);
    if (isBreakTime) {
      setMinutes(breakTime);
      setIsBreak(true);
    } else {
      setMinutes(focusTime);
      setIsBreak(false);
    }
    setSeconds(0);
    setProgress(100);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleFocusTimeChange = (value: number[]) => {
    const newValue = value[0];
    setFocusTime(newValue);
    // If we're not in break mode and the timer isn't active, update the displayed time
    if (!isBreak && !isActive) {
      setMinutes(newValue);
      setSeconds(0);
    }
    if (onSettingsChange) {
      onSettingsChange(newValue, breakTime);
    }
  };

  const handleBreakTimeChange = (value: number[]) => {
    const newValue = value[0];
    setBreakTime(newValue);
    // If we're in break mode and the timer isn't active, update the displayed time
    if (isBreak && !isActive) {
      setMinutes(newValue);
      setSeconds(0);
    }
    if (onSettingsChange) {
      onSettingsChange(focusTime, newValue);
    }
  };

  const applySettings = () => {
    // If timer is not active, reset with new settings
    if (!isActive) {
      resetTimer(isBreak);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval as NodeJS.Timeout);
            // Timer completed
            if (isBreak) {
              toast({
                title: "Break time is over!",
                description: "Time to get back to work!",
              });
              resetTimer(false);
            } else {
              toast({
                title: "Great job! Time for a break",
                description: "Take a moment to rest your eyes and stretch.",
              });
              resetTimer(true);
            }
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }

        // Calculate progress
        const currentTotalSeconds = minutes * 60 + seconds;
        const newProgress = (currentTotalSeconds / totalSecondsRef.current) * 100;
        setProgress(newProgress);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak, totalSecondsRef, toast]);

  const formatTime = (min: number, sec: number): string => {
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center flex-1">
          {isBreak ? "Break Time" : "Focus Time"}
        </CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Timer Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-time">Focus Time: {focusTime} minutes</Label>
                </div>
                <Slider
                  id="focus-time"
                  min={5}
                  max={60}
                  step={5}
                  defaultValue={[focusTime]}
                  onValueChange={handleFocusTimeChange}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="break-time">Break Time: {breakTime} minutes</Label>
                </div>
                <Slider
                  id="break-time"
                  min={1}
                  max={30}
                  step={1}
                  defaultValue={[breakTime]}
                  onValueChange={handleBreakTimeChange}
                />
              </div>
              <DialogClose asChild>
                <Button onClick={applySettings} className="w-full">
                  Apply
                </Button>
              </DialogClose>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-muted">
          <div className="animate-pulse-gentle text-3xl font-bold">
            {formatTime(minutes, seconds)}
          </div>
          <div className="absolute -bottom-2 w-full px-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="h-10 w-10 rounded-full"
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => resetTimer(isBreak)}
            className="h-10 w-10 rounded-full"
          >
            <RotateCcw size={20} />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isBreak
            ? "Take a break and rest your eyes"
            : "Stay focused on your task"}
        </div>
      </CardContent>
    </Card>
  );
}
