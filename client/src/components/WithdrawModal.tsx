import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getLanguage, t } from "@/lib/i18n";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const language = getLanguage();

  const withdrawMutation = useMutation({
    mutationFn: async (withdrawData: any) => {
      return await apiRequest("POST", "/api/withdrawals", withdrawData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/user"] });
      onOpenChange(false);
      setMethod("");
      setAmount("");
      setAddress("");
      toast({
        title: t('withdrawSuccess'),
        description: t('withdrawSuccessDesc'),
        className: "bounce-in",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('withdrawFailed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawalMethods = [
    { value: "usdt-trc20", label: "USDT TRC20" },
    { value: "usdt-bep20", label: "USDT BEP20" },
    { value: "sol", label: "SOL" },
    { value: "thai-bank", label: language === 'th' ? "ธนาคารไทย" : "Thai Bank" },
  ];

  const handleSubmit = () => {
    if (!method || !amount || !address) {
      toast({
        title: t('fillAllFields'),
        description: language === 'th' ? "ข้อมูลทุกช่องจำเป็นต้องกรอก" : "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (!user || parseFloat(amount) > parseFloat(user.balance || '0')) {
      toast({
        title: t('insufficientBalance'),
        description: language === 'th' ? "จำนวนเงินถอนเกินยอดเงินในบัญชี" : "Withdrawal amount exceeds account balance",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) < 100) {
      toast({
        title: language === 'th' ? "จำนวนเงินต่ำเกินไป" : "Amount too low",
        description: t('minWithdrawAmount'),
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      method,
      amount,
      address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="withdraw-modal">
        <DialogHeader>
          <DialogTitle data-testid="withdraw-modal-title">{t('withdrawModalTitle')}</DialogTitle>
          <DialogDescription data-testid="withdraw-modal-description">
            {t('withdrawModalDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance */}
          {user && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('currentBalance')}</div>
                <div className="text-2xl font-bold text-primary" data-testid="current-balance">
                  ฿{parseFloat(user.balance || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Method */}
          <div className="space-y-2">
            <Label htmlFor="method">{t('withdrawMethod')}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger data-testid="select-withdrawal-method">
                <SelectValue placeholder={t('selectWithdrawMethod')} />
              </SelectTrigger>
              <SelectContent>
                {withdrawalMethods.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">{t('withdrawAmount')}</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.01"
              min="100"
              max={user && user.balance ? parseFloat(user.balance) : undefined}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-withdraw-amount"
            />
            <div className="text-xs text-muted-foreground">
              {language === 'th' 
                ? `ขั้นต่ำ ฿100 • สูงสุด ฿${user ? parseFloat(user.balance || '0').toLocaleString('th-TH') : '0'}`
                : `Min ฿100 • Max ฿${user ? parseFloat(user.balance || '0').toLocaleString('en-US') : '0'}`
              }
            </div>
          </div>

          {/* Address/Account */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {method.includes('usdt') || method === 'sol' 
                ? t('walletAddress') 
                : t('accountNumber')}
            </Label>
            <Input
              id="address"
              type="text"
              placeholder={
                method.includes('usdt') || method === 'sol'
                  ? (language === 'th' ? 'ที่อยู่กระเป๋าเงินของคุณ' : 'Your wallet address')
                  : (language === 'th' ? 'หมายเลขบัญชีธนาคาร' : 'Bank account number')
              }
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="input-withdraw-address"
            />
          </div>

          {/* Fees Information */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>{language === 'th' ? 'จำนวนถอน:' : 'Withdrawal amount:'}:</span>
                  <span className="font-semibold">฿{amount || '0.00'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>{language === 'th' ? 'ค่าธรรมเนียม:' : 'Fee:'}:</span>
                  <span className="font-semibold">฿0.00</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold">{language === 'th' ? 'จำนวนที่ได้รับ:' : 'Amount received:'}:</span>
                  <span className="font-semibold text-primary" data-testid="net-amount">
                    ฿{amount || '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full betting-gradient"
            onClick={handleSubmit}
            disabled={withdrawMutation.isPending}
            data-testid="button-submit-withdrawal"
          >
            {withdrawMutation.isPending 
              ? (language === 'th' ? 'กำลังส่งคำขอ...' : 'Submitting...') 
              : t('submitWithdraw')
            }
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            * {language === 'th' 
              ? 'การถอนเงินจะใช้เวลา 1-24 ชั่วโมงในการดำเนินการ' 
              : 'Withdrawals take 1-24 hours to process'
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
