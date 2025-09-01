import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Trophy, Target } from "lucide-react";
import { useBetting } from "@/hooks/use-betting";
import { getLanguage, t } from "@/lib/i18n";

interface MatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: any;
}

export default function MatchModal({ open, onOpenChange, fixture }: MatchModalProps) {
  const { addToBettingSlip } = useBetting();
  const language = getLanguage();
  const [selectedBet, setSelectedBet] = useState<{ market: string; odds: number; label: string } | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");

  if (!fixture) return null;

  const handleBetSelect = (market: string, odds: number, label: string) => {
    setSelectedBet({ market, odds, label });
  };

  const handleAddToBet = () => {
    if (!selectedBet || !stakeAmount || parseFloat(stakeAmount) <= 0) return;

    const betSelection = {
      fixtureId: fixture.id,
      match: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      market: selectedBet.market,
      odds: selectedBet.odds,
      league: fixture.league,
      stake: parseFloat(stakeAmount),
    };

    addToBettingSlip(betSelection);
    setSelectedBet(null);
    setStakeAmount("");
    onOpenChange(false);
  };

  const getMatchStatus = () => {
    if (fixture.isLive) {
      return <Badge className="bg-accent text-accent-foreground">LIVE</Badge>;
    } else if (new Date(fixture.startTime) > new Date()) {
      const time = new Date(fixture.startTime).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return <Badge variant="outline">{time}</Badge>;
    } else {
      return <Badge variant="outline">{language === 'th' ? 'จบแล้ว' : 'Finished'}</Badge>;
    }
  };

  const calculatePotentialWin = () => {
    if (!selectedBet || !stakeAmount) return 0;
    return (selectedBet.odds * parseFloat(stakeAmount)).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="match-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{fixture.homeTeam} vs {fixture.awayTeam}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-3">
            <span>{fixture.league}</span>
            {getMatchStatus()}
            {fixture.isLive && fixture.homeScore !== null && fixture.awayScore !== null && (
              <span className="text-accent font-medium">
                {fixture.homeScore}-{fixture.awayScore}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 items-center text-center">
                <div className="space-y-2">
                  <div className="font-semibold">{fixture.homeTeam}</div>
                  {fixture.homeScore !== null && (
                    <div className="text-2xl font-bold">{fixture.homeScore}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {fixture.isLive ? (language === 'th' ? 'กำลังแข่ง' : 'Live') : 
                     new Date(fixture.startTime).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">{fixture.awayTeam}</div>
                  {fixture.awayScore !== null && (
                    <div className="text-2xl font-bold">{fixture.awayScore}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betting Markets */}
          <Tabs defaultValue="match-winner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="match-winner">
                {language === 'th' ? 'ผลการแข่งขัน' : 'Match Winner'}
              </TabsTrigger>
              <TabsTrigger value="totals">
                {language === 'th' ? 'ทั้งหมด' : 'Totals'}
              </TabsTrigger>
            </TabsList>

            {/* Match Winner Tab */}
            <TabsContent value="match-winner" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'th' ? 'เลือกผู้ชนะ' : 'Select Winner'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {fixture.homeOdds && (
                      <Button
                        variant={selectedBet?.market === 'home' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('home', parseFloat(fixture.homeOdds), fixture.homeTeam)}
                        data-testid="bet-home-modal"
                      >
                        <div className="text-xs">{fixture.homeTeam}</div>
                        <div className="font-bold">{fixture.homeOdds}</div>
                      </Button>
                    )}
                    {fixture.drawOdds && (
                      <Button
                        variant={selectedBet?.market === 'draw' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('draw', parseFloat(fixture.drawOdds), language === 'th' ? 'เสมอ' : 'Draw')}
                        data-testid="bet-draw-modal"
                      >
                        <div className="text-xs">{language === 'th' ? 'เสมอ' : 'Draw'}</div>
                        <div className="font-bold">{fixture.drawOdds}</div>
                      </Button>
                    )}
                    {fixture.awayOdds && (
                      <Button
                        variant={selectedBet?.market === 'away' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('away', parseFloat(fixture.awayOdds), fixture.awayTeam)}
                        data-testid="bet-away-modal"
                      >
                        <div className="text-xs">{fixture.awayTeam}</div>
                        <div className="font-bold">{fixture.awayOdds}</div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Totals Tab */}
            <TabsContent value="totals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>
                      {language === 'th' ? 'ทั้งหมด' : 'Total Goals/Points'}
                      {fixture.totalLine && ` (${fixture.totalLine})`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {fixture.overOdds && (
                      <Button
                        variant={selectedBet?.market === 'over' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('over', parseFloat(fixture.overOdds), 
                          language === 'th' ? `เกิน ${fixture.totalLine || '2.5'}` : `Over ${fixture.totalLine || '2.5'}`)}
                        data-testid="bet-over-modal"
                      >
                        <div className="text-xs">
                          {language === 'th' ? `เกิน ${fixture.totalLine || '2.5'}` : `Over ${fixture.totalLine || '2.5'}`}
                        </div>
                        <div className="font-bold">{fixture.overOdds}</div>
                      </Button>
                    )}
                    {fixture.underOdds && (
                      <Button
                        variant={selectedBet?.market === 'under' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('under', parseFloat(fixture.underOdds), 
                          language === 'th' ? `ต่ำกว่า ${fixture.totalLine || '2.5'}` : `Under ${fixture.totalLine || '2.5'}`)}
                        data-testid="bet-under-modal"
                      >
                        <div className="text-xs">
                          {language === 'th' ? `ต่ำกว่า ${fixture.totalLine || '2.5'}` : `Under ${fixture.totalLine || '2.5'}`}
                        </div>
                        <div className="font-bold">{fixture.underOdds}</div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Stake Input Section */}
          {selectedBet && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">
                  {language === 'th' ? 'ตั๋วเดิมพัน' : 'Betting Slip'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{selectedBet.label}</span>
                  <Badge variant="secondary">{selectedBet.odds}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">
                    {language === 'th' ? 'จำนวนเงินเดิมพัน (฿)' : 'Stake Amount (฿)'}
                  </Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    data-testid="input-stake-modal"
                  />
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {['100', '500', '1000', '2000'].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => setStakeAmount(amount)}
                        data-testid={`quick-amount-${amount}-modal`}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                {stakeAmount && parseFloat(stakeAmount) > 0 && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {language === 'th' ? 'กำไรที่เป็นไปได้:' : 'Potential Win:'}
                      </span>
                      <span className="font-bold text-primary">
                        ฿{calculatePotentialWin()}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full betting-gradient"
                  onClick={handleAddToBet}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                  data-testid="button-add-to-bet"
                >
                  {language === 'th' ? 'เพิ่มเข้าตั๋วเดิมพัน' : 'Add to Betting Slip'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}