import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("usdt-trc20");
  const [amount, setAmount] = useState<string>("");
  const [txId, setTxId] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");

  const { data: walletSettings } = useQuery({
    queryKey: ["/api/admin/wallets"],
    enabled: open,
  });

  const depositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      return await apiRequest("POST", "/api/deposits", depositData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onOpenChange(false);
      setAmount("");
      setTxId("");
      setCardNumber("");
      setExpiryDate("");
      setCardHolder("");
      toast({
        title: "ส่งคำขอฝากเงินสำเร็จ",
        description: "คำขอฝากเงินของคุณอยู่ระหว่างการตรวจสอบ",
        className: "bounce-in",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "ส่งคำขอฝากเงินไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cryptoOptions = [
    { id: "usdt-trc20", label: "USDT TRC20", icon: "₮" },
    { id: "usdt-bep20", label: "USDT BEP20", icon: "₮" },
    { id: "sol", label: "SOL", icon: "◎" },
  ];

  const getWalletAddress = () => {
    if (!walletSettings) return "";
    
    switch (selectedCrypto) {
      case "usdt-trc20":
        return walletSettings.usdtTrc20 || "TQrfqvkFc5qd8uGWXqYbXm7QqTiPdZ8cR9";
      case "usdt-bep20":
        return walletSettings.usdtBep20 || "0x742d35Cc6334C0532925a3b8bc1b6847e9dC6b8A";
      case "sol":
        return walletSettings.sol || "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
      default:
        return "";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "คัดลอกสำเร็จ",
        description: "คัดลอกที่อยู่กระเป๋าเงินแล้ว",
      });
    } catch (error) {
      toast({
        title: "คัดลอกไม่สำเร็จ",
        description: "ไม่สามารถคัดลอกได้",
        variant: "destructive",
      });
    }
  };

  const handleCryptoDeposit = () => {
    if (!amount || !txId) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "จำนวนเงินและ Transaction ID จำเป็นต้องกรอก",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      method: selectedCrypto,
      amount,
      txId,
      walletAddress: getWalletAddress(),
    });
  };

  const handleCardDeposit = () => {
    if (!amount || !cardNumber || !expiryDate || !cardHolder) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ข้อมูลบัตรทุกช่องจำเป็นต้องกรอก",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      method: "thai-card",
      amount,
      cardNumber: cardNumber.replace(/\s/g, ''),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="deposit-modal">
        <DialogHeader>
          <DialogTitle data-testid="deposit-modal-title">ฝากเงิน</DialogTitle>
          <DialogDescription data-testid="deposit-modal-description">
            เลือกวิธีการฝากเงินที่คุณต้องการ
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="crypto" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto" data-testid="tab-crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="thai-card" data-testid="tab-thai-card">บัตรไทย</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4">
            {/* Crypto Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {cryptoOptions.map((crypto) => (
                <Button
                  key={crypto.id}
                  variant={selectedCrypto === crypto.id ? "default" : "outline"}
                  className={`flex items-center justify-center space-x-2 p-4 h-auto ${
                    selectedCrypto === crypto.id ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => setSelectedCrypto(crypto.id)}
                  data-testid={`crypto-${crypto.id}`}
                >
                  <span className="text-lg">{crypto.icon}</span>
                  <span className="font-medium">{crypto.label}</span>
                </Button>
              ))}
            </div>

            {/* Wallet Address */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    ที่อยู่กระเป๋า {cryptoOptions.find(c => c.id === selectedCrypto)?.label}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="bg-background border border-border rounded-md p-3 font-mono text-sm break-all flex-1"
                      data-testid="wallet-address"
                    >
                      {getWalletAddress()}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getWalletAddress())}
                      data-testid="copy-address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="crypto-amount">จำนวนเงิน (USDT/SOL)</Label>
              <Input
                id="crypto-amount"
                type="number"
                step="0.01"
                min="10"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-crypto-amount"
              />
            </div>

            {/* Transaction ID */}
            <div className="space-y-2">
              <Label htmlFor="tx-id">Transaction ID</Label>
              <Input
                id="tx-id"
                type="text"
                placeholder="กรอก TX ID หลังการโอน"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                data-testid="input-tx-id"
              />
            </div>

            <Button
              className="w-full betting-gradient"
              onClick={handleCryptoDeposit}
              disabled={depositMutation.isPending}
              data-testid="button-submit-crypto-deposit"
            >
              {depositMutation.isPending ? "กำลังส่งคำขอ..." : "ยืนยันการฝากเงิน"}
            </Button>
          </TabsContent>

          <TabsContent value="thai-card" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">หมายเลขบัตร</Label>
                <Input
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardNumber(value);
                  }}
                  data-testid="input-card-number"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">วันหมดอายุ</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
                      setExpiryDate(value);
                    }}
                    data-testid="input-expiry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-holder">ชื่อผู้ถือบัตร</Label>
                  <Input
                    id="card-holder"
                    type="text"
                    placeholder="ชื่อบนบัตร"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    data-testid="input-card-holder"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card-amount">จำนวนเงิน (฿)</Label>
                <Input
                  id="card-amount"
                  type="number"
                  step="0.01"
                  min="100"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-card-amount"
                />
              </div>
            </div>

            <Button
              className="w-full betting-gradient"
              onClick={handleCardDeposit}
              disabled={depositMutation.isPending}
              data-testid="button-submit-card-deposit"
            >
              {depositMutation.isPending ? "กำลังส่งคำขอ..." : "ยืนยันการฝากเงิน"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
