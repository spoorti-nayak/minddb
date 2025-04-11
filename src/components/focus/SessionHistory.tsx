
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Calendar,
  Zap
} from "lucide-react";
import { getSessionLogs, DistractionEvent } from "@/utils/sessionTracker";
import { format, formatDistanceStrict } from "date-fns";

export function SessionHistory() {
  const [sessions, setSessions] = useState(getSessionLogs());
  
  // Refresh sessions data when component mounts
  useEffect(() => {
    setSessions(getSessionLogs());
  }, []);
  
  // Calculate session duration in a readable format
  const formatDuration = (startTime: Date, endTime: Date | null) => {
    if (!endTime) return "In progress";
    
    const duration = endTime.getTime() - startTime.getTime();
    return formatDistanceStrict(0, duration);
  };
  
  // Calculate the number of distractions in a session
  const getDistractionCount = (distractions: DistractionEvent[]) => {
    return distractions.length;
  };
  
  // Format the date for display
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy h:mm a");
  };
  
  // No sessions
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No focus sessions recorded yet</p>
            <p className="text-sm mt-1">Start a focus session to track your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Distractions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice().reverse().map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.taskName}</TableCell>
                  <TableCell>{formatDate(new Date(session.startTime))}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      {formatDuration(new Date(session.startTime), session.endTime ? new Date(session.endTime) : null)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getDistractionCount(session.distractions) > 0 ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {getDistractionCount(session.distractions)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Perfect Focus
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
