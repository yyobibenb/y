import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LiveUpdates() {
  const { isConnected, lastUpdate } = useWebSocket();

  return (
    <div className="fixed bottom-4 left-4 z-40" data-testid="live-updates-indicator">
      <Card className="shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-primary animate-live-pulse' : 'bg-muted-foreground'
              }`}
              data-testid="connection-indicator"
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'อัปเดตสด' : 'ไม่ได้เชื่อมต่อ'}
            </span>
            {lastUpdate && (
              <span className="text-xs text-primary font-medium" data-testid="last-update">
                {lastUpdate}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
