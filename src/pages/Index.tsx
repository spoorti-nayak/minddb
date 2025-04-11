
import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { PomodoroTimer } from "@/components/timers/PomodoroTimer";
import { EyeCareReminder } from "@/components/eyecare/EyeCareReminder";
import { FocusSessionTracker } from "@/components/focus/FocusSessionTracker";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { AppUsageList } from "@/components/dashboard/AppUsageList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Clock, Eye, Activity, Zap, Settings, BarChart3, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTimerSettings, saveTimerSettings } from "@/utils/userPreferences";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timerSettings, setTimerSettings] = useState({ focusTime: 25, breakTime: 5 });
  const { toast } = useToast();

  // Load saved timer settings on initial load
  useEffect(() => {
    const savedSettings = getTimerSettings();
    setTimerSettings(savedSettings);
  }, []);

  const handleTimerSettingsChange = (focusMinutes: number, breakMinutes: number) => {
    const newSettings = {
      focusTime: focusMinutes,
      breakTime: breakMinutes
    };
    
    setTimerSettings(newSettings);
    saveTimerSettings(newSettings);
    
    toast({
      title: "Settings updated",
      description: `Focus: ${focusMinutes} min, Break: ${breakMinutes} min`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto py-6">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" />
              <span>Focus Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="eyecare" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Eye Care</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Focus Score"
                value="85%"
                icon={<Activity />}
                description="How focused you've been today"
                trend="up"
                trendValue="5% from yesterday"
              />
              <StatCard
                title="Screen Time"
                value="4h 15m"
                icon={<Clock />}
                description="Total screen time today"
                trend="down"
                trendValue="45m from yesterday"
              />
              <StatCard
                title="Eye Breaks"
                value="12"
                icon={<Eye />}
                description="Eye care breaks taken today"
                trend="up"
                trendValue="3 more than yesterday"
              />
              <StatCard
                title="Distractions"
                value="8"
                icon={<Zap />}
                description="Times you got distracted"
                trend="down"
                trendValue="2 less than yesterday"
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ActivityChart />
              <AppUsageList />
            </div>
          </TabsContent>

          <TabsContent value="focus" className="animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <FocusSessionTracker />
                <PomodoroTimer 
                  initialMinutes={timerSettings.focusTime} 
                  breakMinutes={timerSettings.breakTime} 
                  onSettingsChange={handleTimerSettingsChange}
                />
              </div>
              <SessionHistory />
            </div>
          </TabsContent>

          <TabsContent value="eyecare" className="animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <EyeCareReminder />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
