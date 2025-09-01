import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Ticket } from "lucide-react";
import { useBetting } from "@/hooks/use-betting";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { t, getLanguage } from "@/lib/i18n";

export default function BettingSlip() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { bettingSlip, removeFromBettingSlip, updateStake, clearBettingSlip } = useBetting();
  const [stakes, setStakes] = useState<{ [key: string]: string }>({});

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      return await apiRequest("POST", "/api/bets", betData);
    },
    onSuccess: () => {
      clearBettingSlip();
      setStakes({});
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bets/user"] });
      toast({
        title: t('betSuccess'),
        description: t('betSuccessDesc'),
        className: "bounce-in",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('betFailed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStakeChange = (betId: string, value: string) => {
    setStakes(prev => ({ ...prev, [betId]: value }));
    updateStake(betId, parseFloat(value) || 0);
  };

  const handleQuickAmount = (betId: string, amount: string) => {
    let value = amount;
    if (amount === 'max' && user) {
      value = user.balance || '0';
    }
    handleStakeChange(betId, value);
  };

  const calculatePotentialWin = (odds: number, stake: number) => {
    return (odds * stake).toFixed(2);
  };

  const getTotalStake = () => {
    return Object.values(stakes).reduce((sum, stake) => sum + (parseFloat(stake) || 0), 0);
  };

  const getTotalPotentialWin = () => {
    return bettingSlip.reduce((sum, bet) => {
      const stake = parseFloat(stakes[bet.fixtureId] || "0");
      return sum + (bet.odds * stake);
    }, 0);
  };

  const handlePlaceBets = () => {
    if (!user) {
      toast({
        title: t('pleaseLogin'),
        description: t('loginRequired'),
        variant: "destructive",
      });
      return;
    }

    const totalStake = getTotalStake();
    if (totalStake <= 0) {
      toast({
        title: t('enterStakeAmount'),
        description: t('stakeGreaterThanZero'),
        variant: "destructive",
      });
      return;
    }

    if (totalStake > parseFloat(user.balance || '0')) {
      toast({
        title: t('insufficientFunds'),
        description: t('stakeExceedsBalance'),
        variant: "destructive",
      });
      return;
    }

    // Place all bets
    bettingSlip.forEach((bet) => {
      const stake = parseFloat(stakes[bet.fixtureId] || "0");
      if (stake > 0) {
        placeBetMutation.mutate({
          fixtureId: bet.fixtureId,
          market: bet.market,
          odds: bet.odds.toString(),
          stake: stake.toString(),
          potentialWin: calculatePotentialWin(bet.odds, stake),
        });
      }
    });
  };

  return (
    <Card className="sticky top-24 card-hover glow" data-testid="betting-slip">
      <CardHeader className="fade-in">
        <CardTitle className="flex items-center space-x-2">
          <Ticket className="h-5 w-5 text-primary pulse-emoji" />
          <span>🎯 {t('bettingSlip')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bettingSlip.length === 0 ? (
          <div className="text-center py-8" data-testid="empty-betting-slip">
            <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">{t('clickOddsToAdd')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Bets */}
            {bettingSlip.map((bet, index) => (
              <div key={`${bet.fixtureId}-${bet.market}`} className="bg-background rounded-lg p-3 border border-border" data-testid={`bet-slip-item-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm">
                    <div className="font-medium" data-testid={`bet-selection-${index}`}>
                      {bet.market === 'home' ? `${bet.match.split(' vs ')[0]} ${t('homeWin')}` : 
                       bet.market === 'draw' ? t('draw') :
                       bet.market === 'away' ? `${bet.match.split(' vs ')[1]} ${t('awayWin')}` :
                       bet.market}
                    </div>
                    <div className="text-muted-foreground text-xs" data-testid={`bet-match-${index}`}>{bet.match}</div>
                    <div className="text-muted-foreground text-xs" data-testid={`bet-league-${index}`}>{bet.league}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromBettingSlip(bet.fixtureId, bet.market)}
                    className="text-muted-foreground hover:text-accent p-1"
                    data-testid={`remove-bet-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">{t('odds')}</span>
                  <span className="font-semibold text-primary" data-testid={`bet-odds-${index}`}>{bet.odds}</span>
                </div>

                {/* Stake Input */}
                <div className="space-y-2">
                  <Label htmlFor={`stake-${index}`} className="text-sm">{t('stakeAmount')}</Label>
                  <Input
                    id={`stake-${index}`}
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={stakes[bet.fixtureId] || ""}
                    onChange={(e) => handleStakeChange(bet.fixtureId, e.target.value)}
                    data-testid={`input-stake-${index}`}
                  />
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    {['100', '500', '1000', 'max'].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => handleQuickAmount(bet.fixtureId, amount)}
                        data-testid={`quick-amount-${amount}-${index}`}
                      >
                        {amount === 'max' ? t('max').toUpperCase() : amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Potential Win */}
                {stakes[bet.fixtureId] && parseFloat(stakes[bet.fixtureId]) > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{t('totalPotentialWinShort')}</span>
                      <span className="font-bold text-primary text-sm" data-testid={`potential-win-${index}`}>
                        ฿{calculatePotentialWin(bet.odds, parseFloat(stakes[bet.fixtureId]))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Separator />

            {/* Total Summary */}
            {getTotalStake() > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('allBets')}:</span>
                  <span className="font-semibold" data-testid="total-stake">
                    ฿{getTotalStake().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('totalPotentialWinShort')}:</span>
                  <span className="font-semibold text-primary" data-testid="total-potential-win">
                    ฿{getTotalPotentialWin().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <Button
              className="w-full betting-gradient font-semibold btn-bounce hover-lift glow"
              onClick={handlePlaceBets}
              disabled={placeBetMutation.isPending || bettingSlip.length === 0 || getTotalStake() <= 0}
              data-testid="button-place-bets"
            >
              {placeBetMutation.isPending ? t('placing') : t('placeBet')}
            </Button>

            {user && (
              <div className="text-xs text-muted-foreground text-center mt-2" data-testid="user-balance-info">
                {t('remainingBalance')}: ฿{parseFloat(user.balance || '0').toLocaleString(getLanguage() === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
