import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { getLanguage } from "@/lib/i18n";
import { formatDateWith2025 } from "@/lib/utils";

export default function BettingHistory() {
  const language = getLanguage();
  
  const { data: bets, isLoading } = useQuery({
    queryKey: ["/api/bets"],
    queryFn: async () => {
      const response = await fetch("/api/bets");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {language === 'th' ? 'ประวัติการเดิมพัน' : 'Betting History'}
        </h2>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return (
          <Badge className="bg-green-500 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            {language === 'th' ? 'ชนะ' : 'Won'}
          </Badge>
        );
      case 'lost':
        return (
          <Badge className="bg-red-500 text-white">
            <TrendingDown className="w-3 h-3 mr-1" />
            {language === 'th' ? 'แพ้' : 'Lost'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            {language === 'th' ? 'รอผล' : 'Pending'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {language === 'th' ? 'ยกเลิก' : 'Cancelled'}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-2xl font-bold">
        {language === 'th' ? 'ประวัติการเดิมพัน' : 'Betting History'}
      </h2>
      
      {!bets || bets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'th' ? 'ยังไม่มีประวัติการเดิมพัน' : 'No betting history yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bets.map((bet: any) => (
            <Card key={bet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm" data-testid={`bet-match-${bet.id}`}>
                      {bet.match || `${bet.fixture?.homeTeam} vs ${bet.fixture?.awayTeam}`}
                    </h3>
                    <p className="text-xs text-muted-foreground" data-testid={`bet-league-${bet.id}`}>
                      {bet.fixture?.league}
                    </p>
                  </div>
                  {getStatusBadge(bet.status)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {language === 'th' ? 'ตลาด' : 'Market'}
                    </p>
                    <p className="font-medium" data-testid={`bet-market-${bet.id}`}>
                      {bet.market}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {language === 'th' ? 'ราคา' : 'Odds'}
                    </p>
                    <p className="font-medium" data-testid={`bet-odds-${bet.id}`}>
                      {bet.odds}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {language === 'th' ? 'เงินเดิมพัน' : 'Stake'}
                    </p>
                    <p className="font-medium" data-testid={`bet-stake-${bet.id}`}>
                      ฿{parseFloat(bet.stake).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {formatDateWith2025(bet.createdAt, language === 'th' ? 'th-TH' : 'en-US')}
                  </span>
                  <span className="font-semibold" data-testid={`bet-potential-${bet.id}`}>
                    {language === 'th' ? 'อาจได้รับ:' : 'Potential:'} ฿{parseFloat(bet.potentialWin).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}