
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Play, Square, ZapOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startSession, endSession, getCurrentSession, DistractionEvent } from "@/utils/sessionTracker";
import { useDistractionDetector, useIdleDetection } from "@/utils/distractionDetector";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { playSound, startBackgroundSound, stopBackgroundSound } from "@/utils/soundManager";

export function FocusSessionTracker() {
  const [taskName, setTaskName] = useState("");
  const [activeSession, setActiveSession] = useState(getCurrentSession());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();
  
  // Background sound reference
  const backgroundSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize distraction detection
  const { isDistracted, distractionReason, distractionStartTime, manuallyAddDistraction } = 
    useDistractionDetector(60000, 120000, !!activeSession);
  
  // Initialize idle detection
  const isIdle = useIdleDetection(5 * 60 * 1000); // 5 minutes
  
  // Handle starting a new session
  const handleStartSession = () => {
    if (!taskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your focus task",
        variant: "destructive",
      });
      return;
    }
    
    const newSession = startSession(taskName);
    setActiveSession(newSession);
    setTaskName("");
    
    // Play sound and notification
    playSound("notification");
    
    // Start background sound if enabled
    backgroundSoundRef.current = startBackgroundSound();
    
    // Show desktop notification if browser supports it
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Focus session started", {
        body: `Working on: ${taskName}`,
        icon: "/favicon.ico"
      });
    }
    
    toast({
      title: "Focus session started",
      description: `Working on: ${taskName}`,
    });
  };
  
  // Handle ending the session
  const handleEndSession = () => {
    if (activeSession) {
      const completedSession = endSession(activeSession.id);
      setActiveSession(null);
      
      // Stop background sound
      stopBackgroundSound(backgroundSoundRef.current);
      backgroundSoundRef.current = null;
      
      // Play notification sound
      playSound("notification");
      
      const duration = completedSession?.duration || 0;
      const minutes = Math.floor(duration / 60000);
      
      // Show desktop notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Focus session completed", {
          body: `You focused for ${minutes} minutes on ${completedSession?.taskName}`,
          icon: "/favicon.ico"
        });
      }
      
      toast({
        title: "Focus session completed",
        description: `You focused for ${minutes} minutes on ${completedSession?.taskName}`,
      });
    }
  };
  
  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);
  
  // Update elapsed time
  useEffect(() => {
    let timer: number;
    
    if (activeSession) {
      timer = window.setInterval(() => {
        const startTime = new Date(activeSession.startTime).getTime();
        const currentElapsed = Date.now() - startTime;
        setElapsedTime(currentElapsed);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeSession]);
  
  // Handle distraction detection
  useEffect(() => {
    if (activeSession && isDistracted && !isIdle && distractionStartTime) {
      // Play distraction sound
      playSound("distraction");
      
      // Show desktop notification for distraction
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Distraction detected", {
          body: `You seem to be distracted. Try to refocus on your task.`,
          icon: "/favicon.ico"
        });
      }
    }
  }, [isDistracted, activeSession, isIdle, distractionStartTime]);
  
  // Format elapsed time
  const formatElapsedTime = (ms: number) => {
    const duration = intervalToDuration({ start: 0, end: ms });
    const formatted = formatDuration(duration, {
      format: ['hours', 'minutes', 'seconds'],
      delimiter: ':'
    });
    
    // Add zero-padding manually since 'padding' isn't a valid option
    const parts = (formatted || "").split(':');
    const paddedParts = parts.map(part => part.padStart(2, '0'));
    return paddedParts.join(':') || "00:00:00";
  };
  
  // Display distraction status
  const renderDistractionStatus = () => {
    if (!isDistracted) return null;
    
    let message = "You seem distracted";
    if (distractionReason === 'mouse_inactivity') {
      message = "Mouse inactive";
    } else if (distractionReason === 'typing_inactivity') {
      message = "Keyboard inactive";
    } else if (distractionReason === 'app_switch') {
      message = "You switched to another app";
    }
    
    const duration = distractionStartTime 
      ? formatDistanceToNow(distractionStartTime, { includeSeconds: true })
      : "";
    
    return (
      <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200 flex items-center gap-2">
        <AlertTriangle className="text-amber-500" size={18} />
        <div>
          <p className="text-amber-700 text-sm font-medium">{message}</p>
          {duration && (
            <p className="text-amber-600 text-xs">For {duration}</p>
          )}
        </div>
      </div>
    );
  };
  
  // Display idle status
  const renderIdleStatus = () => {
    if (!isIdle || !activeSession) return null;
    
    return (
      <div className="mt-4 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center gap-2">
        <ZapOff className="text-slate-500" size={18} />
        <div>
          <p className="text-slate-700 text-sm font-medium">Auto-paused: You seem to be away</p>
          <p className="text-slate-600 text-xs">Session tracking will resume when you return</p>
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Focus Tracker</span>
          {activeSession && (
            <Badge variant="secondary" className="ml-2 font-normal">
              <Clock className="mr-1 h-3 w-3" />
              {formatElapsedTime(elapsedTime)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeSession ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">What are you working on?</Label>
              <Input
                id="task-name"
                placeholder="Enter task name..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleStartSession} 
              className="w-full"
              disabled={!taskName.trim()}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Focus Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 p-3 rounded-md">
              <h3 className="font-medium text-primary">Currently working on:</h3>
              <p className="text-lg font-semibold mt-1">{activeSession.taskName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Started {formatDistanceToNow(new Date(activeSession.startTime), { addSuffix: true })}
              </p>
            </div>
            
            {renderDistractionStatus()}
            {renderIdleStatus()}
            
            <Button 
              onClick={handleEndSession} 
              variant="destructive" 
              className="w-full"
            >
              <Square className="mr-2 h-4 w-4" />
              End Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
