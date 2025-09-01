import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, TrendingUp } from "lucide-react";
import { getLanguage } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BonusBanner() {
  const { user, refreshUser } = useAuth();
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const language = getLanguage();
  const { toast } = useToast();

  const handleClaimBonus = async () => {
    if (!user || user.hasClaimedWelcomeBonus) return;

    setIsClaimingBonus(true);
    try {
      const response = await fetch('/api/bonus/claim-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to claim bonus');
      }

      await refreshUser();
      
      toast({
        title: language === 'th' ? "ได้รับโบนัส!" : "Bonus Claimed!",
        description: language === 'th' 
          ? "คุณได้รับโบนัสต้อนรับ 100% จากการฝากครั้งแรก!" 
          : "You've received 100% welcome bonus on your first deposit!",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: language === 'th' ? "เกิดข้อผิดพลาด" : "Error",
        description: language === 'th' 
          ? "ไม่สามารถรับโบนัสได้ กรุณาลองใหม่อีกครั้ง" 
          : "Could not claim bonus. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsClaimingBonus(false);
    }
  };

  // Don't show banner if user hasn't made a deposit yet or already claimed
  if (!user || user.hasClaimedWelcomeBonus) {
    return null;
  }

  return (
    <Card className="mb-3 bg-background border-transparent card-hover bounce-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Gift className="h-12 w-12 text-primary wiggle" />
              <div className="absolute -top-1 -right-1">
                <Star className="h-5 w-5 text-secondary fill-secondary pulse-emoji" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">
                  {language === 'th' ? "โบนัสต้อนรับพิเศษ!" : "Special Welcome Bonus!"}
                </h3>
                <Badge className="bg-secondary text-secondary-foreground">
                  {language === 'th' ? "ใหม่" : "NEW"}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'th' 
                  ? "รับโบนัส 100% จากการฝากครั้งแรก สูงสุด ฿5,000" 
                  : "Get 100% bonus on your first deposit, up to ฿5,000"}
              </p>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span>{language === 'th' ? "เพิ่มทุนการเดิมพัน" : "Boost betting capital"}</span>
                </div>
                <div className="text-muted-foreground">
                  {language === 'th' ? "ไม่มีค่าธรรมเนียม" : "No fees"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleClaimBonus}
              disabled={isClaimingBonus}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 font-semibold"
              data-testid="claim-bonus-button"
            >
              {isClaimingBonus ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {language === 'th' ? "กำลังรับโบนัส..." : "Claiming..."}
                </div>
              ) : (
                language === 'th' ? "รับโบนัสเลย!" : "Claim Bonus!"
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              {language === 'th' ? "หลังจากฝากเงินครั้งแรก" : "After first deposit"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}