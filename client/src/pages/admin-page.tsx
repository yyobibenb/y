import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Target, ArrowDown, ArrowUp, Settings, Wallet, Plus, Edit, Ban, Eye, BarChart3, DollarSign, CreditCard } from "lucide-react";
import { formatDateWith2025, getCurrentDateWith2025, getLocaleForDateFormatting } from "@/lib/utils";
import { t } from "@/lib/i18n";

// Type definitions for admin API responses
interface SystemStats {
  totalUsers: number;
  totalBets: number;
  totalDeposits: string;
  totalWithdrawals: string;
}

interface UserWithdrawalStats {
  count: number;
  totalAmount: string;
  withdrawals: Array<{
    id: string;
    amount: string;
    method: string;
    status: string;
    createdAt: string;
  }>;
}
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");
  const [matchesText, setMatchesText] = useState<string>("");
  const [viewUserStatsId, setViewUserStatsId] = useState<string>("");
  const [depositFilter, setDepositFilter] = useState<string>("");
  const [withdrawalFilter, setWithdrawalFilter] = useState<string>("");
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [isEditMatchDialogOpen, setIsEditMatchDialogOpen] = useState<boolean>(false);
  const [bettingHistoryUserId, setBettingHistoryUserId] = useState<string>("");
  const [showBettingHistoryDialog, setShowBettingHistoryDialog] = useState<boolean>(false);
  const [editingBet, setEditingBet] = useState<any>(null);
  const [showEditBetDialog, setShowEditBetDialog] = useState<boolean>(false);
  const [editBetMarket, setEditBetMarket] = useState<string>("");
  const [editBetStatus, setEditBetStatus] = useState<string>("");
  const [editingUserStats, setEditingUserStats] = useState<any>(null);
  const [showEditUserStatsDialog, setShowEditUserStatsDialog] = useState<boolean>(false);
  const [editUserId, setEditUserId] = useState<string>("");
  const [editUserEmail, setEditUserEmail] = useState<string>("");
  const [editUserBalance, setEditUserBalance] = useState<string>("");
  const [editUserIsActive, setEditUserIsActive] = useState<boolean>(true);
  const [showEditUserDialog, setShowEditUserDialog] = useState<boolean>(false);
  const [showCreateBetDialog, setShowCreateBetDialog] = useState<boolean>(false);
  const [newBetUserId, setNewBetUserId] = useState<string>("");
  const [newBetFixtureId, setNewBetFixtureId] = useState<string>("");
  const [newBetMarket, setNewBetMarket] = useState<string>("home");
  const [newBetOdds, setNewBetOdds] = useState<string>("");
  const [newBetStake, setNewBetStake] = useState<string>("");
  const [newBetUseCustomMatch, setNewBetUseCustomMatch] = useState<boolean>(false);
  const [newBetCustomHomeTeam, setNewBetCustomHomeTeam] = useState<string>("");
  const [newBetCustomAwayTeam, setNewBetCustomAwayTeam] = useState<string>("");
  const [newBetCustomLeague, setNewBetCustomLeague] = useState<string>("");
  const [newBetCustomHomeScore, setNewBetCustomHomeScore] = useState<string>("");
  const [newBetCustomAwayScore, setNewBetCustomAwayScore] = useState<string>("");
  const [newBetStatus, setNewBetStatus] = useState<string>("pending");
  const [newBetCustomMatchDate, setNewBetCustomMatchDate] = useState<string>("");
  
  // States for editing deposits
  const [editingDeposit, setEditingDeposit] = useState<any>(null);
  const [showEditDepositDialog, setShowEditDepositDialog] = useState<boolean>(false);
  const [editDepositAmount, setEditDepositAmount] = useState<string>("");
  const [editDepositMethod, setEditDepositMethod] = useState<string>("");
  const [editDepositStatus, setEditDepositStatus] = useState<string>("");
  const [editDepositTxId, setEditDepositTxId] = useState<string>("");
  
  // States for editing withdrawals
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const [showEditWithdrawalDialog, setShowEditWithdrawalDialog] = useState<boolean>(false);
  const [editWithdrawalAmount, setEditWithdrawalAmount] = useState<string>("");
  const [editWithdrawalMethod, setEditWithdrawalMethod] = useState<string>("");
  const [editWithdrawalStatus, setEditWithdrawalStatus] = useState<string>("");
  const [editWithdrawalAddress, setEditWithdrawalAddress] = useState<string>("");

  // States for editing statistics
  const [showEditDepositStatsDialog, setShowEditDepositStatsDialog] = useState<boolean>(false);
  const [editDepositStats, setEditDepositStats] = useState<string>("");
  const [showEditWithdrawalStatsDialog, setShowEditWithdrawalStatsDialog] = useState<boolean>(false);
  const [editWithdrawalStats, setEditWithdrawalStats] = useState<string>("");

  // States for creating user deposits and withdrawals
  const [showCreateUserDepositDialog, setShowCreateUserDepositDialog] = useState<boolean>(false);
  const [showCreateUserWithdrawalDialog, setShowCreateUserWithdrawalDialog] = useState<boolean>(false);
  const [selectedUserForTransaction, setSelectedUserForTransaction] = useState<any>(null);
  const [newUserDepositAmount, setNewUserDepositAmount] = useState<string>("");
  const [newUserDepositMethod, setNewUserDepositMethod] = useState<string>("bank_card");
  const [newUserDepositDate, setNewUserDepositDate] = useState<string>(getCurrentDateWith2025());
  const [newUserWithdrawalAmount, setNewUserWithdrawalAmount] = useState<string>("");
  const [newUserWithdrawalMethod, setNewUserWithdrawalMethod] = useState<string>("bank_card");
  const [newUserWithdrawalDate, setNewUserWithdrawalDate] = useState<string>(getCurrentDateWith2025());
  const [newUserWithdrawalAddress, setNewUserWithdrawalAddress] = useState<string>("");

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: adminUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: adminDeposits } = useQuery({
    queryKey: ["/api/admin/deposits"],
  });

  const { data: adminWithdrawals } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
  });

  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: walletSettings } = useQuery({
    queryKey: ["/api/admin/wallets"],
  });

  const { data: adminMatches } = useQuery({
    queryKey: ["/api/admin/fixtures"],
  });

  const { data: userWithdrawalStats } = useQuery<UserWithdrawalStats>({
    queryKey: ["/api/admin/users", viewUserStatsId, "withdrawals"],
    enabled: !!viewUserStatsId,
  });

  const { data: allBets } = useQuery<any[]>({
    queryKey: ["/api/admin/bets"],
  });

  const { data: userBettingHistory } = useQuery<any[]>({
    queryKey: ["/api/admin/users", bettingHistoryUserId, "bets"],
    enabled: !!bettingHistoryUserId,
  });

  const { data: userStats } = useQuery<any>({
    queryKey: ["/api/admin/users", bettingHistoryUserId, "stats"],
    enabled: !!bettingHistoryUserId,
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, note }: { userId: string; amount: string; note: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/balance`, { amount, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "อัปเดตยอดเงินสำเร็จ",
        description: "ยอดเงินผู้ใช้ได้รับการอัปเดตแล้ว",
      });
      setSelectedUserId("");
      setBalanceAmount("");
      setBalanceNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "อัปเดตยอดเงินไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDepositMutation = useMutation({
    mutationFn: async ({ depositId, status }: { depositId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/deposits/${depositId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "อัปเดตสถานะการฝากสำเร็จ",
        description: "สถานะการฝากเงินได้รับการอัปเดตแล้ว",
      });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, adminNote }: { withdrawalId: string; status: string; adminNote?: string }) => {
      await apiRequest("PATCH", `/api/admin/withdrawals/${withdrawalId}`, { status, adminNote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "อัปเดตสถานะการถอนสำเร็จ",
        description: "สถานะการถอนเงินได้รับการอัปเดตแล้ว",
      });
    },
  });

  const updateWalletsMutation = useMutation({
    mutationFn: async (wallets: { usdtTrc20?: string; usdtBep20?: string; sol?: string }) => {
      await apiRequest("POST", "/api/admin/wallets", wallets);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
      toast({
        title: "อัปเดตกระเป๋าเงินสำเร็จ",
        description: "ที่อยู่กระเป๋าเงินได้รับการอัปเดตแล้ว",
      });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (userData: { userId: string; email: string; balance: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/admin/users/${userData.userId}`, {
        email: userData.email,
        balance: userData.balance,
        isActive: userData.isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Updated",
        description: "User data successfully updated",
      });
      setShowEditUserDialog(false);
      setEditUserId("");
      setEditUserEmail("");
      setEditUserBalance("");
      setEditUserIsActive(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = () => {
    if (!editUserId || !editUserEmail || !editUserBalance) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    editUserMutation.mutate({
      userId: editUserId,
      email: editUserEmail,
      balance: editUserBalance,
      isActive: editUserIsActive
    });
  };

  const editDepositMutation = useMutation({
    mutationFn: async ({ depositId, updates }: { depositId: string; updates: any }) => {
      await apiRequest("PUT", `/api/admin/deposits/${depositId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Deposit Updated",
        description: "Deposit data successfully updated",
      });
      setShowEditDepositDialog(false);
      setEditingDeposit(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update deposit",
        variant: "destructive",
      });
    },
  });

  const editWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, updates }: { withdrawalId: string; updates: any }) => {
      await apiRequest("PUT", `/api/admin/withdrawals/${withdrawalId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Withdrawal Updated",
        description: "Withdrawal data successfully updated",
      });
      setShowEditWithdrawalDialog(false);
      setEditingWithdrawal(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal",
        variant: "destructive",
      });
    },
  });

  const addMatchesMutation = useMutation({
    mutationFn: async ({ matchesText }: { matchesText: string }) => {
      await apiRequest("POST", "/api/admin/matches", { matchesText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      toast({
        title: "Matches Added",
        description: "Matches successfully added to system",
      });
      setMatchesText("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка добавления матчей",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, updates }: { matchId: string; updates: any }) => {
      await apiRequest("PATCH", `/api/admin/fixtures/${matchId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      toast({
        title: "Матч обновлен",
        description: "Данные матча успешно обновлены",
      });
      setIsEditMatchDialogOpen(false);
      setEditingMatch(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления матча",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBetMutation = useMutation({
    mutationFn: async ({ betId, updates }: { betId: string; updates: any }) => {
      await apiRequest("PUT", `/api/admin/bets/${betId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", bettingHistoryUserId, "bets"] });
      toast({
        title: "Ставка обновлена",
        description: "Данные ставки успешно обновлены",
      });
      setShowEditBetDialog(false);
      setEditingBet(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления ставки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserStatsMutation = useMutation({
    mutationFn: async ({ userId, stats }: { userId: string; stats: any }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/stats`, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", bettingHistoryUserId, "stats"] });
      toast({
        title: "Статистика обновлена",
        description: "Статистика пользователя успешно обновлена",
      });
      setShowEditUserStatsDialog(false);
      setEditingUserStats(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления статистики",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDepositStatsMutation = useMutation({
    mutationFn: async ({ totalDeposits }: { totalDeposits: string }) => {
      await apiRequest("POST", "/api/admin/stats/deposits", { totalDeposits });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Статистика депозитов обновлена",
        description: "Общая сумма депозитов успешно изменена",
      });
      setShowEditDepositStatsDialog(false);
      setEditDepositStats("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления статистики",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWithdrawalStatsMutation = useMutation({
    mutationFn: async ({ totalWithdrawals }: { totalWithdrawals: string }) => {
      await apiRequest("POST", "/api/admin/stats/withdrawals", { totalWithdrawals });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Статистика выводов обновлена",
        description: "Общая сумма выводов успешно изменена",
      });
      setShowEditWithdrawalStatsDialog(false);
      setEditWithdrawalStats("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления статистики",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUserDepositMutation = useMutation({
    mutationFn: async ({ userId, amount, method, date }: { userId: string, amount: string, method: string, date: string }) => {
      await apiRequest("POST", "/api/admin/user-deposits", { userId, amount, method, createdAt: date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Deposit Created",
        description: "User deposit successfully added",
      });
      setShowCreateUserDepositDialog(false);
      setNewUserDepositAmount("");
      setNewUserDepositMethod("bank_card");
      setNewUserDepositDate("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit Creation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUserWithdrawalMutation = useMutation({
    mutationFn: async ({ userId, amount, method, address, date }: { userId: string, amount: string, method: string, address: string, date: string }) => {
      await apiRequest("POST", "/api/admin/user-withdrawals", { userId, amount, method, address, createdAt: date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Withdrawal Created",
        description: "User withdrawal successfully added",
      });
      setShowCreateUserWithdrawalDialog(false);
      setNewUserWithdrawalAmount("");
      setNewUserWithdrawalMethod("bank_card");
      setNewUserWithdrawalDate("");
      setNewUserWithdrawalAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Creation Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createBetMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      fixtureId, 
      market, 
      odds, 
      stake, 
      useCustomMatch,
      customHomeTeam,
      customAwayTeam,
      customLeague,
      customHomeScore,
      customAwayScore,
      customMatchDate,
      status
    }: { 
      userId: string; 
      fixtureId?: string; 
      market: string; 
      odds: string; 
      stake: string; 
      useCustomMatch: boolean;
      customHomeTeam?: string;
      customAwayTeam?: string;
      customLeague?: string;
      customHomeScore?: string;
      customAwayScore?: string;
      customMatchDate?: string;
      status?: string;
    }) => {
      const potentialWin = (parseFloat(odds) * parseFloat(stake)).toFixed(2);
      const betData: any = {
        userId,
        market,
        odds: parseFloat(odds),
        stake: parseFloat(stake),
        potentialWin: parseFloat(potentialWin)
      };

      if (useCustomMatch) {
        betData.customHomeTeam = customHomeTeam;
        betData.customAwayTeam = customAwayTeam;
        betData.customLeague = customLeague;
        betData.customHomeScore = customHomeScore ? parseInt(customHomeScore) : null;
        betData.customAwayScore = customAwayScore ? parseInt(customAwayScore) : null;
        betData.customMatchDate = customMatchDate;
      } else {
        betData.fixtureId = fixtureId;
      }
      
      // Add status to bet data
      betData.status = status || 'pending';

      await apiRequest("POST", "/api/admin/bets", betData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", bettingHistoryUserId, "bets"] });
      toast({
        title: "Ставка создана",
        description: "Новая ставка успешно добавлена",
      });
      setShowCreateBetDialog(false);
      setNewBetUserId("");
      setNewBetFixtureId("");
      setNewBetMarket("home");
      setNewBetOdds("");
      setNewBetStake("");
      setNewBetUseCustomMatch(false);
      setNewBetCustomHomeTeam("");
      setNewBetCustomAwayTeam("");
      setNewBetCustomLeague("");
      setNewBetCustomHomeScore("");
      setNewBetCustomAwayScore("");
      setNewBetCustomMatchDate("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка создания ставки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: "bg-yellow-500 hover:bg-yellow-600", text: `🕰️ ${t('pending')}` },
      confirmed: { color: "bg-green-500 hover:bg-green-600", text: `✅ ${t('confirmed')}` },
      processed: { color: "bg-green-500 hover:bg-green-600", text: `✅ ${t('processed')}` },
      failed: { color: "bg-red-500 hover:bg-red-600", text: `❌ ${t('failed')}` },
      rejected: { color: "bg-red-500 hover:bg-red-600", text: `❌ ${t('rejected')}` },
      active: { color: "bg-green-500 hover:bg-green-600", text: "✅ Активен" },
      suspended: { color: "bg-red-500 hover:bg-red-600", text: "⛔ Заблокирован" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: "bg-gray-500", text: status };

    return (
      <Badge className={`${statusInfo.color} text-white font-medium transition-colors`}>
        {statusInfo.text}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" data-testid="admin-title">Admin Control Panel</h1>
          <p className="text-muted-foreground" data-testid="admin-description">Manage users, matches, and finances</p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary" data-testid="stat-total-users">{systemStats?.totalUsers || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-secondary" data-testid="stat-total-bets">{(systemStats as any)?.totalBets || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Bets</div>
                  </div>
                  <Target className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-500" data-testid="stat-total-deposits">
                      ฿{parseFloat((systemStats as any)?.totalDeposits || '0').toLocaleString('th-TH')}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Deposits</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditDepositStats((systemStats as any)?.totalDeposits || '0');
                        setShowEditDepositStatsDialog(true);
                      }}
                      data-testid="button-edit-deposit-stats"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <ArrowDown className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-500" data-testid="stat-total-withdrawals">
                      ฿{parseFloat((systemStats as any)?.totalWithdrawals || '0').toLocaleString('th-TH')}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Withdrawals</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditWithdrawalStats((systemStats as any)?.totalWithdrawals || '0');
                        setShowEditWithdrawalStatsDialog(true);
                      }}
                      data-testid="button-edit-withdrawal-stats"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <ArrowUp className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="matches" className="space-y-6 bounce-in">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="matches" data-testid="admin-tab-matches">Matches</TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users">Users</TabsTrigger>
            <TabsTrigger value="bets" data-testid="admin-tab-bets">Bets</TabsTrigger>
            <TabsTrigger value="deposits" data-testid="admin-tab-deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" data-testid="admin-tab-withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="wallets" data-testid="admin-tab-wallets">Wallets</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Match Management</span>
                </CardTitle>
                <CardDescription>Add and manage live and upcoming matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="matches-input">Add Matches (one per line)</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Formats:</p>
                      <p><code>foot:live:team1:team2:score1:score2:homeOdds:drawOdds:awayOdds:totalLine:overOdds:minute</code></p>
                      <p><code>foottai:live:team1:team2:score1:score2:homeOdds:drawOdds:awayOdds:totalLine:overOdds:minute</code></p>
                      <p><code>bask:live:team1:team2:score1:score2:homeOdds:awayOdds:minute</code></p>
                      <p><code>ten:live:team1:team2:score1:score2:homeOdds:awayOdds:minute</code></p>
                    </div>
                    <Textarea
                      id="matches-input"
                      placeholder="foot:live:Arsenal:Chelsea:2:1:1.85:3.20:4.50:2.5:1.90:65&#10;bask:live:Lakers:Celtics:98:95:1.95:2.10:75&#10;ten:live:Djokovic:Nadal:1:0:1.50:2.80:90&#10;foottai:live:BG Pathum:Buriram:0:0:2.10:3.00:3.40:1.5:2.20:30"
                      value={matchesText}
                      onChange={(e) => setMatchesText(e.target.value)}
                      rows={8}
                      data-testid="textarea-matches-input"
                    />
                    <Button
                      className="betting-gradient"
                      onClick={() => {
                        if (matchesText.trim()) {
                          addMatchesMutation.mutate({ matchesText });
                        }
                      }}
                      disabled={addMatchesMutation.isPending || !matchesText.trim()}
                      data-testid="button-add-matches"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Matches
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Existing Matches</h3>
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sport</TableHead>
                            <TableHead>Teams</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Minutes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {((adminMatches as any) || []).map((match: any) => (
                            <TableRow key={match.id}>
                              <TableCell>
                                <Badge variant="outline">{match.sport}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                                <div className="text-sm text-muted-foreground">{match.league}</div>
                              </TableCell>
                              <TableCell>
                                {match.isLive ? `${match.homeScore || 0} : ${match.awayScore || 0}` : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={match.isLive ? "default" : "secondary"}>
                                  {match.isLive ? 'LIVE' : match.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {match.isLive ? `${match.currentMinute || 0}'` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMatch(match);
                                      setIsEditMatchDialogOpen(true);
                                    }}
                                    data-testid={`button-edit-match-${match.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      try {
                                        await apiRequest("DELETE", `/api/admin/fixtures/${match.id}`);
                                        queryClient.invalidateQueries({ queryKey: ["/api/admin/fixtures"] });
                                        toast({
                                          title: "Match Deleted",
                                          description: "Match successfully removed from system",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete match",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    data-testid={`button-delete-match-${match.id}`}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>История ставок</span>
                </CardTitle>
                <CardDescription>Детальная информация о всех ставках пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Поиск истории ставок по ID пользователя */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Поиск истории ставок по пользователю</h3>
                  <div className="flex space-x-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="betting-history-search">ID пользователя или Email</Label>
                      <Input
                        id="betting-history-search"
                        placeholder="Введите ID пользователя или email..."
                        value={bettingHistoryUserId}
                        onChange={(e) => setBettingHistoryUserId(e.target.value)}
                        data-testid="input-betting-history-search"
                      />
                    </div>
                    <Button
                      onClick={() => setShowBettingHistoryDialog(true)}
                      disabled={!bettingHistoryUserId.trim()}
                      className="betting-gradient"
                      data-testid="button-view-betting-history"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Посмотреть историю
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Матч</TableHead>
                        <TableHead>Счет</TableHead>
                        <TableHead>Рынок</TableHead>
                        <TableHead>Коэффициент</TableHead>
                        <TableHead>Ставка</TableHead>
                        <TableHead>Потенциальный выигрыш</TableHead>
                        <TableHead>Прибыль/Убыток</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(allBets) ? allBets : []).map((bet: any) => {
                        const profit = bet.status === 'won' 
                          ? parseFloat(bet.potentialWin) - parseFloat(bet.stake)
                          : bet.status === 'lost' 
                            ? -parseFloat(bet.stake)
                            : 0;
                        
                        return (
                          <TableRow key={bet.id} data-testid={`bet-row-${bet.id}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{bet.user?.email || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  ID: {bet.user?.accountId || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {bet.customHomeTeam && bet.customAwayTeam 
                                    ? `${bet.customHomeTeam} vs ${bet.customAwayTeam}`
                                    : bet.fixture?.homeTeam && bet.fixture?.awayTeam
                                      ? `${bet.fixture.homeTeam} vs ${bet.fixture.awayTeam}`
                                      : 'Матч не указан'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {bet.customLeague || bet.fixture?.league || ''} • {bet.fixture?.sport || bet.customLeague ? '' : 'ФУТБОЛ'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(bet.customHomeScore !== null && bet.customAwayScore !== null) ||
                               (bet.fixture?.homeScore !== null && bet.fixture?.awayScore !== null) ? (
                                <span className="font-mono">
                                  {bet.customHomeScore !== null 
                                    ? `${bet.customHomeScore} : ${bet.customAwayScore}`
                                    : `${bet.fixture?.homeScore} : ${bet.fixture?.awayScore}`}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {bet.market}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              {parseFloat(bet.odds).toFixed(2)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ฿{parseFloat(bet.stake).toFixed(2)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ฿{parseFloat(bet.potentialWin).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {profit > 0 ? '+' : ''}฿{profit.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                bet.status === 'won' ? 'bg-green-500 text-white' :
                                bet.status === 'lost' ? 'bg-red-500 text-white' :
                                bet.status === 'pending' ? 'bg-yellow-500 text-white' :
                                'bg-gray-500 text-white'
                              }>
                                {bet.status === 'won' ? 'Выигрыш' :
                                 bet.status === 'lost' ? 'Проигрыш' :
                                 bet.status === 'pending' ? 'В ожидании' :
                                 bet.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDateWith2025(bet.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingBet(bet);
                                  setEditBetMarket(bet.market);
                                  setEditBetStatus(bet.status);
                                  setShowEditBetDialog(true);
                                }}
                                data-testid={`button-edit-bet-${bet.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {(!allBets || !Array.isArray(allBets) || allBets.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет ставок для отображения
                    </div>
                  )}
                </div>

                {/* Общая статистика по ставкам */}
                {allBets && Array.isArray(allBets) && allBets.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {Array.isArray(allBets) ? allBets.length : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Всего ставок</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Array.isArray(allBets) ? allBets.filter((bet: any) => bet.status === 'won').length : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Выиграно</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Array.isArray(allBets) && allBets.length > 0 ? 
                              Math.round((allBets.filter((bet: any) => bet.status === 'won').length / allBets.length) * 100) 
                              : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">Винрейт</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
(Array.isArray(allBets) ? allBets.reduce((total: number, bet: any) => {
                              const profit = bet.status === 'won' 
                                ? parseFloat(bet.potentialWin) - parseFloat(bet.stake)
                                : bet.status === 'lost' 
                                  ? -parseFloat(bet.stake)
                                  : 0;
                              return total + profit;
                            }, 0) : 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ฿{(Array.isArray(allBets) ? allBets.reduce((total: number, bet: any) => {
                              const profit = bet.status === 'won' 
                                ? parseFloat(bet.potentialWin) - parseFloat(bet.stake)
                                : bet.status === 'lost' 
                                  ? -parseFloat(bet.stake)
                                  : 0;
                              return total + profit;
                            }, 0) : 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Общий профит</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="betting-gradient" data-testid="button-update-balance">
                        <Wallet className="h-4 w-4 mr-2" />
                        Update Balance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update User Balance</DialogTitle>
                        <DialogDescription>Add or deduct money from user account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-select">Select User</Label>
                          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger data-testid="select-user">
                              <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                              {((adminUsers as any) || []).map((user: any) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email} (ID: {user.accountId})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (+ Add, - Deduct)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={balanceAmount}
                            onChange={(e) => setBalanceAmount(e.target.value)}
                            data-testid="input-balance-amount"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note">Note</Label>
                          <Textarea
                            id="note"
                            placeholder="Note for balance adjustment"
                            value={balanceNote}
                            onChange={(e) => setBalanceNote(e.target.value)}
                            data-testid="textarea-balance-note"
                          />
                        </div>

                        <Button
                          className="w-full betting-gradient"
                          onClick={() => {
                            if (selectedUserId && balanceAmount) {
                              updateBalanceMutation.mutate({
                                userId: selectedUserId,
                                amount: balanceAmount,
                                note: balanceNote,
                              });
                            }
                          }}
                          disabled={updateBalanceMutation.isPending || !selectedUserId || !balanceAmount}
                          data-testid="button-submit-balance-update"
                        >
                          Update Balance
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((adminUsers as any) || []).map((user: any) => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell className="font-mono" data-testid={`user-account-id-${user.id}`}>
                            {user.accountId}
                          </TableCell>
                          <TableCell data-testid={`user-email-${user.id}`}>{user.email}</TableCell>
                          <TableCell className="font-semibold" data-testid={`user-balance-${user.id}`}>
                            ฿{parseFloat(user.balance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.isActive ? "active" : "suspended")}
                          </TableCell>
                          <TableCell data-testid={`user-created-${user.id}`}>
                            {formatDateWith2025(user.createdAt, 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditUserId(user.id);
                                      setEditUserEmail(user.email);
                                      setEditUserBalance(user.balance);
                                      setEditUserIsActive(user.isActive);
                                      setShowEditUserDialog(true);
                                    }}
                                    data-testid={`button-edit-${user.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Редактировать пользователя</DialogTitle>
                                    <DialogDescription>
                                      Изменить данные и статус пользователя
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-user-email">Email</Label>
                                      <Input
                                        id="edit-user-email"
                                        value={editUserEmail}
                                        onChange={(e) => setEditUserEmail(e.target.value)}
                                        data-testid="input-edit-user-email"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-user-balance">Баланс</Label>
                                      <Input
                                        id="edit-user-balance"
                                        type="number"
                                        step="0.01"
                                        value={editUserBalance}
                                        onChange={(e) => setEditUserBalance(e.target.value)}
                                        data-testid="input-edit-user-balance"
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="edit-user-active"
                                        checked={editUserIsActive}
                                        onCheckedChange={setEditUserIsActive}
                                        data-testid="switch-edit-user-active"
                                      />
                                      <Label htmlFor="edit-user-active">Активный пользователь</Label>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleEditUser} data-testid="button-save-user-edit">
                                      Save
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setViewUserStatsId(user.id)}
                                    data-testid={`button-view-stats-${user.id}`}
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Статистика пользователя: {user.email}</DialogTitle>
                                    <DialogDescription>
                                      Детальная статистика выводов и активности
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {userWithdrawalStats && (
                                      <>
                                        <div className="grid grid-cols-3 gap-4">
                                          <Card>
                                            <CardContent className="p-4">
                                              <div className="text-2xl font-bold text-primary">
                                                {userWithdrawalStats?.count || 0}
                                              </div>
                                              <div className="text-sm text-muted-foreground">Всего выводов</div>
                                            </CardContent>
                                          </Card>
                                          <Card>
                                            <CardContent className="p-4">
                                              <div className="text-2xl font-bold text-secondary">
                                                ฿{parseFloat(userWithdrawalStats?.totalAmount || '0').toLocaleString('th-TH')}
                                              </div>
                                              <div className="text-sm text-muted-foreground">Общая сумма</div>
                                            </CardContent>
                                          </Card>
                                          <Card>
                                            <CardContent className="p-4">
                                              <div className="text-2xl font-bold text-green-500">
                                                {user.winRate}%
                                              </div>
                                              <div className="text-sm text-muted-foreground">Win Rate</div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-4">История выводов</h4>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Сумма</TableHead>
                                                <TableHead>Способ</TableHead>
                                                <TableHead>Статус</TableHead>
                                                <TableHead>Дата</TableHead>
                                                <TableHead>Действия</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {(userWithdrawalStats?.withdrawals || []).map((withdrawal) => (
                                                <TableRow key={withdrawal.id}>
                                                  <TableCell>฿{parseFloat(withdrawal.amount).toFixed(2)}</TableCell>
                                                  <TableCell className="uppercase">{withdrawal.method}</TableCell>
                                                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                                  <TableCell>{formatDateWith2025(withdrawal.createdAt, 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                                  <TableCell>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        setEditingWithdrawal(withdrawal);
                                                        setEditWithdrawalAmount(withdrawal.amount);
                                                        setEditWithdrawalMethod(withdrawal.method);
                                                        setEditWithdrawalStatus(withdrawal.status);
                                                        setEditWithdrawalAddress('');
                                                        setShowEditWithdrawalDialog(true);
                                                      }}
                                                      data-testid={`button-edit-user-withdrawal-${withdrawal.id}`}
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setBettingHistoryUserId(user.accountId);
                                  setShowBettingHistoryDialog(true);
                                }}
                                data-testid={`button-betting-history-${user.id}`}
                              >
                                <Target className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedUserForTransaction(user);
                                  setNewUserDepositAmount("");
                                  setNewUserDepositMethod("bank_card");
                                  setNewUserDepositDate("");
                                  setShowCreateUserDepositDialog(true);
                                }}
                                data-testid={`button-create-deposit-${user.id}`}
                                title="Добавить депозит"
                              >
                                <ArrowDown className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedUserForTransaction(user);
                                  setNewUserWithdrawalAmount("");
                                  setNewUserWithdrawalMethod("bank_card");
                                  setNewUserWithdrawalDate("");
                                  setNewUserWithdrawalAddress("");
                                  setShowCreateUserWithdrawalDialog(true);
                                }}
                                data-testid={`button-create-withdrawal-${user.id}`}
                                title="Добавить вывод"
                              >
                                <ArrowUp className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-suspend-${user.id}`}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowDown className="h-5 w-5 text-green-500" />
                  <span>💰 Управление депозитами</span>
                </CardTitle>
                <CardDescription>💳 Одобрение или отклонение пополнений баланса</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Фильтр по пользователю */}
                <div className="mb-4">
                  <Label htmlFor="deposit-filter">Поиск по ID пользователя или email</Label>
                  <Input
                    id="deposit-filter"
                    type="text"
                    placeholder="Введите Account ID или email для фильтрации..."
                    value={depositFilter}
                    onChange={(e) => setDepositFilter(e.target.value)}
                    className="mt-2"
                    data-testid="input-deposit-filter"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>👤 Пользователь</TableHead>
                        <TableHead>💳 Метод</TableHead>
                        <TableHead>💰 Сумма</TableHead>
                        <TableHead>🔗 TX ID</TableHead>
                        <TableHead>📊 Статус</TableHead>
                        <TableHead>📅 Дата</TableHead>
                        <TableHead>⚡ Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((adminDeposits as any) || [])
                        .filter((deposit: any) => {
                          if (!depositFilter) return true;
                          const searchText = depositFilter.toLowerCase();
                          return (
                            deposit.user?.accountId?.toLowerCase().includes(searchText) ||
                            deposit.user?.email?.toLowerCase().includes(searchText)
                          );
                        })
                        .map((deposit: any) => (
                        <TableRow key={deposit.id} data-testid={`deposit-row-${deposit.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{deposit.user?.email || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground font-mono">{deposit.user?.accountId || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="uppercase">{deposit.method}</TableCell>
                          <TableCell className="font-semibold">
                            ฿{parseFloat(deposit.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {deposit.txId ? `${deposit.txId.substring(0, 10)}...` : "-"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(deposit.status)}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            📅 {formatDateWith2025(deposit.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-blue-50 border-blue-200"
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  setEditDepositAmount(deposit.amount);
                                  setEditDepositMethod(deposit.method);
                                  setEditDepositStatus(deposit.status);
                                  setEditDepositTxId(deposit.txId || '');
                                  setShowEditDepositDialog(true);
                                }}
                                data-testid={`button-edit-deposit-${deposit.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                📝 Редактировать
                              </Button>
                              {deposit.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => updateDepositMutation.mutate({ depositId: deposit.id, status: 'confirmed' })}
                                    data-testid={`button-approve-deposit-${deposit.id}`}
                                  >
                                    ✅ Одобрить
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="hover:bg-red-700"
                                    onClick={() => updateDepositMutation.mutate({ depositId: deposit.id, status: 'failed' })}
                                    data-testid={`button-reject-deposit-${deposit.id}`}
                                  >
                                    ❌ Отклонить
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUp className="h-5 w-5 text-red-500" />
                  <span>💸 Управление выводами</span>
                </CardTitle>
                <CardDescription>💵 Одобрение или отклонение выводов средств</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Фильтр по пользователю */}
                <div className="mb-4">
                  <Label htmlFor="withdrawal-filter">Поиск по ID пользователя или email</Label>
                  <Input
                    id="withdrawal-filter"
                    type="text"
                    placeholder="Введите Account ID или email для фильтрации..."
                    value={withdrawalFilter}
                    onChange={(e) => setWithdrawalFilter(e.target.value)}
                    className="mt-2"
                    data-testid="input-withdrawal-filter"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>👤 Пользователь</TableHead>
                        <TableHead>💳 Метод</TableHead>
                        <TableHead>💰 Сумма</TableHead>
                        <TableHead>📱 Адрес</TableHead>
                        <TableHead>📊 Статус</TableHead>
                        <TableHead>📅 Дата</TableHead>
                        <TableHead>⚡ Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((adminWithdrawals as any) || [])
                        .filter((withdrawal: any) => {
                          if (!withdrawalFilter) return true;
                          const searchText = withdrawalFilter.toLowerCase();
                          return (
                            withdrawal.user?.accountId?.toLowerCase().includes(searchText) ||
                            withdrawal.user?.email?.toLowerCase().includes(searchText)
                          );
                        })
                        .map((withdrawal: any) => (
                        <TableRow key={withdrawal.id} data-testid={`withdrawal-row-${withdrawal.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{withdrawal.user?.email || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground font-mono">{withdrawal.user?.accountId || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="uppercase">{withdrawal.method}</TableCell>
                          <TableCell className="font-semibold">
                            ฿{parseFloat(withdrawal.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            N/A
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(withdrawal.status)}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            📅 {formatDateWith2025(withdrawal.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-blue-50 border-blue-200"
                                onClick={() => {
                                  setEditingWithdrawal(withdrawal);
                                  setEditWithdrawalAmount(withdrawal.amount);
                                  setEditWithdrawalMethod(withdrawal.method);
                                  setEditWithdrawalStatus(withdrawal.status);
                                  setEditWithdrawalAddress('');
                                  setShowEditWithdrawalDialog(true);
                                }}
                                data-testid={`button-edit-withdrawal-${withdrawal.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                📝 Редактировать
                              </Button>
                              {withdrawal.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => updateWithdrawalMutation.mutate({ 
                                      withdrawalId: withdrawal.id, 
                                      status: 'processed',
                                      adminNote: 'Approved by admin'
                                    })}
                                    data-testid={`button-approve-withdrawal-${withdrawal.id}`}
                                  >
                                    ✅ Одобрить
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="hover:bg-red-700"
                                    onClick={() => updateWithdrawalMutation.mutate({ 
                                      withdrawalId: withdrawal.id, 
                                      status: 'rejected',
                                      adminNote: 'Rejected by admin'
                                    })}
                                    data-testid={`button-reject-withdrawal-${withdrawal.id}`}
                                  >
                                    ❌ Отклонить
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>ตั้งค่ากระเป๋าเงิน</span>
                </CardTitle>
                <CardDescription>จัดการที่อยู่กระเป๋าเงินสำหรับรับเงินฝาก</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    updateWalletsMutation.mutate({
                      usdtTrc20: formData.get('usdtTrc20') as string,
                      usdtBep20: formData.get('usdtBep20') as string,
                      sol: formData.get('sol') as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="usdtTrc20">USDT TRC20 Wallet Address</Label>
                    <Input
                      id="usdtTrc20"
                      name="usdtTrc20"
                      defaultValue={(walletSettings as any)?.usdtTrc20 || ""}
                      placeholder="TQrfqvkFc5qd8uGWXqYbXm7QqTiPdZ8cR9"
                      data-testid="input-usdt-trc20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usdtBep20">USDT BEP20 Wallet Address</Label>
                    <Input
                      id="usdtBep20"
                      name="usdtBep20"
                      defaultValue={(walletSettings as any)?.usdtBep20 || ""}
                      placeholder="0x742d35Cc6334C0532925a3b8bc1b6847e9dC6b8A"
                      data-testid="input-usdt-bep20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sol">SOL Wallet Address</Label>
                    <Input
                      id="sol"
                      name="sol"
                      defaultValue={(walletSettings as any)?.sol || ""}
                      placeholder="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
                      data-testid="input-sol"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full betting-gradient"
                    disabled={updateWalletsMutation.isPending}
                    data-testid="button-update-wallets"
                  >
                    อัปเดตกระเป๋าเงิน
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>สถิติและรายงาน</span>
                </CardTitle>
                <CardDescription>ภาพรวมผลประกอบการ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">สถิติผู้ใช้</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>ผู้ใช้ใหม่วันนี้</span>
                        <span className="font-semibold" data-testid="new-users-today">0</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>ผู้ใช้ออนไลน์</span>
                        <span className="font-semibold" data-testid="online-users">0</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">สถิติการเงิน</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>รายได้วันนี้</span>
                        <span className="font-semibold text-green-500" data-testid="daily-revenue">฿0.00</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>การเดิมพันวันนี้</span>
                        <span className="font-semibold" data-testid="daily-bets">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog для редактирования матча */}
      <Dialog open={isEditMatchDialogOpen} onOpenChange={setIsEditMatchDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать матч</DialogTitle>
            <DialogDescription>Изменить данные матча</DialogDescription>
          </DialogHeader>
          
          {editingMatch && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                
                const updates = {
                  homeTeam: formData.get('homeTeam') as string,
                  awayTeam: formData.get('awayTeam') as string,
                  league: formData.get('league') as string,
                  sport: formData.get('sport') as string,
                  homeOdds: formData.get('homeOdds') as string,
                  drawOdds: formData.get('drawOdds') as string,
                  awayOdds: formData.get('awayOdds') as string,
                  homeScore: formData.get('homeScore') ? parseInt(formData.get('homeScore') as string) : null,
                  awayScore: formData.get('awayScore') ? parseInt(formData.get('awayScore') as string) : null,
                  status: formData.get('status') as string,
                  isLive: formData.get('isLive') === 'true',
                  currentMinute: formData.get('currentMinute') ? parseInt(formData.get('currentMinute') as string) : 0,
                };

                updateMatchMutation.mutate({
                  matchId: editingMatch.id,
                  updates
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Домашняя команда</Label>
                  <Input
                    id="homeTeam"
                    name="homeTeam"
                    defaultValue={editingMatch.homeTeam}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Гостевая команда</Label>
                  <Input
                    id="awayTeam"
                    name="awayTeam"
                    defaultValue={editingMatch.awayTeam}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="league">Лига</Label>
                  <Input
                    id="league"
                    name="league"
                    defaultValue={editingMatch.league}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sport">Спорт</Label>
                  <Select name="sport" defaultValue={editingMatch.sport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeOdds">Коэф. дома</Label>
                  <Input
                    id="homeOdds"
                    name="homeOdds"
                    type="number"
                    step="0.01"
                    defaultValue={editingMatch.homeOdds}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawOdds">Коэф. ничьи</Label>
                  <Input
                    id="drawOdds"
                    name="drawOdds"
                    type="number"
                    step="0.01"
                    defaultValue={editingMatch.drawOdds}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayOdds">Коэф. гостей</Label>
                  <Input
                    id="awayOdds"
                    name="awayOdds"
                    type="number"
                    step="0.01"
                    defaultValue={editingMatch.awayOdds}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeScore">Счет дома</Label>
                  <Input
                    id="homeScore"
                    name="homeScore"
                    type="number"
                    min="0"
                    defaultValue={editingMatch.homeScore || ''}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awayScore">Счет гостей</Label>
                  <Input
                    id="awayScore"
                    name="awayScore"
                    type="number"
                    min="0"
                    defaultValue={editingMatch.awayScore || ''}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select name="status" defaultValue={editingMatch.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Запланирован</SelectItem>
                      <SelectItem value="live">В прямом эфире</SelectItem>
                      <SelectItem value="finished">Завершен</SelectItem>
                      <SelectItem value="postponed">Отложен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMinute">Текущая минута</Label>
                  <Input
                    id="currentMinute"
                    name="currentMinute"
                    type="number"
                    min="0"
                    max="120"
                    defaultValue={editingMatch.currentMinute || 0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Прямой эфир</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="isLive-false"
                    name="isLive"
                    value="false"
                    defaultChecked={!editingMatch.isLive}
                  />
                  <Label htmlFor="isLive-false">Нет</Label>
                  <input
                    type="radio"
                    id="isLive-true"
                    name="isLive"
                    value="true"
                    defaultChecked={editingMatch.isLive}
                  />
                  <Label htmlFor="isLive-true">Да</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMatchDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="betting-gradient"
                  disabled={updateMatchMutation.isPending}
                >
                  {updateMatchMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog для истории ставок пользователя */}
      <Dialog open={showBettingHistoryDialog} onOpenChange={setShowBettingHistoryDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История ставок пользователя</DialogTitle>
            <DialogDescription>Детальная информация по пользователю: {bettingHistoryUserId}</DialogDescription>
          </DialogHeader>
          
          {bettingHistoryUserId && (
            <div className="space-y-6">
              {/* Статистика пользователя */}
              {userStats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary" data-testid="user-total-bets">
                          {userStats?.totalBets || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Всего ставок</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600" data-testid="user-win-rate">
                          {userStats?.winRate || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Винрейт</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${parseFloat(userStats?.totalProfit || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="user-profit">
                          ฿{parseFloat(userStats?.totalProfit || '0').toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Общий профит</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600" data-testid="user-balance">
                          ฿{parseFloat(userStats?.user?.balance || '0').toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Текущий баланс</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Кнопка редактирования статистики */}
              {userStats && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUserStats(userStats);
                      setShowEditUserStatsDialog(true);
                    }}
                    data-testid="button-edit-user-stats"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать статистику
                  </Button>
                </div>
              )}

              {/* История ставок */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>История ставок</span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewBetUserId(bettingHistoryUserId);
                        setShowCreateBetDialog(true);
                      }}
                      data-testid="button-create-bet"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Создать ставку
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Матч</TableHead>
                          <TableHead>Счет</TableHead>
                          <TableHead>Рынок</TableHead>
                          <TableHead>Коэффициент</TableHead>
                          <TableHead>Ставка</TableHead>
                          <TableHead>Потенциал</TableHead>
                          <TableHead>Прибыль</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {((userBettingHistory as any) || []).map((bet: any) => {
                          const profit = bet.status === 'won' 
                            ? parseFloat(bet.potentialWin) - parseFloat(bet.stake)
                            : bet.status === 'lost' 
                              ? -parseFloat(bet.stake)
                              : 0;
                          
                          return (
                            <TableRow key={bet.id} data-testid={`user-bet-${bet.id}`}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {bet.customHomeTeam && bet.customAwayTeam 
                                      ? `${bet.customHomeTeam} vs ${bet.customAwayTeam}`
                                      : bet.fixture?.homeTeam && bet.fixture?.awayTeam
                                        ? `${bet.fixture.homeTeam} vs ${bet.fixture.awayTeam}`
                                        : 'Матч не указан'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {bet.customLeague || bet.fixture?.league || ''}
                                  </div>
                                  {bet.customMatchDate && (
                                    <div className="text-xs text-muted-foreground">
                                      {bet.customMatchDate}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {((bet.customHomeScore !== null && bet.customAwayScore !== null) ||
                                  (bet.fixture && bet.fixture.homeScore !== null && bet.fixture.awayScore !== null)) ? (
                                  <span className="font-mono">
                                    {bet.customHomeScore !== null 
                                      ? `${bet.customHomeScore} : ${bet.customAwayScore}`
                                      : `${bet.fixture?.homeScore} : ${bet.fixture?.awayScore}`}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {bet.market}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono">
                                {parseFloat(bet.odds).toFixed(2)}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ฿{parseFloat(bet.stake).toFixed(2)}
                              </TableCell>
                              <TableCell className="font-semibold text-blue-600">
                                ฿{parseFloat(bet.potentialWin).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <span className={`font-semibold ${
                                  profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {profit > 0 ? '+' : ''}฿{profit.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  bet.status === 'won' ? 'bg-green-500 text-white' :
                                  bet.status === 'lost' ? 'bg-red-500 text-white' :
                                  bet.status === 'pending' ? 'bg-yellow-500 text-white' :
                                  'bg-gray-500 text-white'
                                }>
                                  {bet.status === 'won' ? 'Выигрыш' :
                                   bet.status === 'lost' ? 'Проигрыш' :
                                   bet.status === 'pending' ? 'В ожидании' :
                                   bet.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDateWith2025(bet.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingBet(bet);
                                    setEditBetMarket(bet.market);
                                    setEditBetStatus(bet.status);
                                    setShowEditBetDialog(true);
                                  }}
                                  data-testid={`button-edit-bet-${bet.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {(!userBettingHistory || userBettingHistory.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        Нет ставок у данного пользователя
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* История депозитов и выводов */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowDown className="h-5 w-5" />
                      <span>История депозитов</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {((adminDeposits as any) || [])
                        .filter((deposit: any) => deposit.user?.accountId === bettingHistoryUserId || deposit.user?.email === bettingHistoryUserId)
                        .map((deposit: any) => (
                          <div key={deposit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`user-deposit-${deposit.id}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{deposit.method.toUpperCase()}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateWith2025(deposit.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-sm font-semibold">฿{parseFloat(deposit.amount).toFixed(2)}</div>
                              <Badge className={
                                deposit.status === 'confirmed' ? 'bg-green-500 text-white' :
                                deposit.status === 'pending' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }>
                                {deposit.status === 'confirmed' ? 'Подтвержден' :
                                 deposit.status === 'pending' ? 'В ожидании' : 'Отклонен'}
                              </Badge>
                            </div>
                            <div className="ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  setEditDepositAmount(deposit.amount);
                                  setEditDepositMethod(deposit.method);
                                  setEditDepositStatus(deposit.status);
                                  setEditDepositTxId(deposit.txId || '');
                                  setShowEditDepositDialog(true);
                                }}
                                data-testid={`button-edit-user-deposit-${deposit.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowUp className="h-5 w-5" />
                      <span>История выводов</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {((adminWithdrawals as any) || [])
                        .filter((withdrawal: any) => withdrawal.user?.accountId === bettingHistoryUserId || withdrawal.user?.email === bettingHistoryUserId)
                        .map((withdrawal: any) => (
                          <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`user-withdrawal-${withdrawal.id}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{withdrawal.method.toUpperCase()}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                N/A
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateWith2025(withdrawal.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-sm font-semibold">฿{parseFloat(withdrawal.amount).toFixed(2)}</div>
                              <Badge className={
                                withdrawal.status === 'processed' ? 'bg-green-500 text-white' :
                                withdrawal.status === 'pending' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }>
                                {withdrawal.status === 'processed' ? t('processed') :
                                 withdrawal.status === 'pending' ? t('pending') : t('rejected')}
                              </Badge>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования ставки */}
      <Dialog open={showEditBetDialog} onOpenChange={setShowEditBetDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать ставку</DialogTitle>
            <DialogDescription>
              Изменение всех данных ставки включая информацию о матче
            </DialogDescription>
          </DialogHeader>
          {editingBet && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates = {
                market: editBetMarket,
                odds: parseFloat(formData.get('odds') as string),
                stake: parseFloat(formData.get('stake') as string),
                potentialWin: parseFloat(formData.get('potentialWin') as string),
                status: editBetStatus,
                customHomeTeam: formData.get('customHomeTeam'),
                customAwayTeam: formData.get('customAwayTeam'),
                customLeague: formData.get('customLeague'),
                customHomeScore: formData.get('customHomeScore') ? parseInt(formData.get('customHomeScore') as string) : null,
                customAwayScore: formData.get('customAwayScore') ? parseInt(formData.get('customAwayScore') as string) : null,
                customMatchDate: formData.get('customMatchDate'),
                adminNotes: formData.get('adminNotes')
              };
              updateBetMutation.mutate({ betId: editingBet.id, updates });
            }} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                {/* Левая колонка - данные ставки */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Данные ставки</h3>
                  
                  <div>
                    <Label htmlFor="market">Рынок</Label>
                    <Select value={editBetMarket} onValueChange={setEditBetMarket}>
                      <SelectTrigger data-testid="select-edit-bet-market">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Победа хозяев</SelectItem>
                        <SelectItem value="draw">Ничья</SelectItem>
                        <SelectItem value="away">Победа гостей</SelectItem>
                        <SelectItem value="over">Больше</SelectItem>
                        <SelectItem value="under">Меньше</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="odds">Коэффициент</Label>
                      <Input id="odds" name="odds" type="number" step="0.01" defaultValue={editingBet.odds} data-testid="input-edit-bet-odds" />
                    </div>
                    <div>
                      <Label htmlFor="stake">Ставка</Label>
                      <Input id="stake" name="stake" type="number" step="0.01" defaultValue={editingBet.stake} data-testid="input-edit-bet-stake" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="potentialWin">Потенциальный выигрыш</Label>
                    <Input id="potentialWin" name="potentialWin" type="number" step="0.01" defaultValue={editingBet.potentialWin} data-testid="input-edit-bet-potential-win" />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Статус</Label>
                    <Select value={editBetStatus} onValueChange={setEditBetStatus}>
                      <SelectTrigger data-testid="select-edit-bet-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">В ожидании</SelectItem>
                        <SelectItem value="won">Выигрыш</SelectItem>
                        <SelectItem value="lost">Проигрыш</SelectItem>
                        <SelectItem value="void">Отменена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Правая колонка - данные матча */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Данные матча</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="customHomeTeam">Команда хозяев</Label>
                      <Input 
                        id="customHomeTeam" 
                        name="customHomeTeam" 
                        defaultValue={editingBet.customHomeTeam || editingBet.fixture?.homeTeam || ''} 
                        placeholder="Название команды"
                        data-testid="input-edit-custom-home-team" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customAwayTeam">Команда гостей</Label>
                      <Input 
                        id="customAwayTeam" 
                        name="customAwayTeam" 
                        defaultValue={editingBet.customAwayTeam || editingBet.fixture?.awayTeam || ''} 
                        placeholder="Название команды"
                        data-testid="input-edit-custom-away-team" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="customLeague">Лига/Турнир</Label>
                    <Input 
                      id="customLeague" 
                      name="customLeague" 
                      defaultValue={editingBet.customLeague || editingBet.fixture?.league || ''} 
                      placeholder="Например: Premier League"
                      data-testid="input-edit-custom-league" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="customHomeScore">Счет хозяев</Label>
                      <Input 
                        id="customHomeScore" 
                        name="customHomeScore" 
                        type="number" 
                        min="0" 
                        defaultValue={editingBet.customHomeScore ?? editingBet.fixture?.homeScore ?? ''} 
                        placeholder="0"
                        data-testid="input-edit-custom-home-score" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customAwayScore">Счет гостей</Label>
                      <Input 
                        id="customAwayScore" 
                        name="customAwayScore" 
                        type="number" 
                        min="0" 
                        defaultValue={editingBet.customAwayScore ?? editingBet.fixture?.awayScore ?? ''} 
                        placeholder="0"
                        data-testid="input-edit-custom-away-score" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customMatchDate">Дата матча</Label>
                      <Input 
                        id="customMatchDate" 
                        name="customMatchDate" 
                        defaultValue={editingBet.customMatchDate || ''} 
                        placeholder="01.09.2024"
                        data-testid="input-edit-custom-match-date" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Заметки администратора */}
              <div>
                <Label htmlFor="adminNotes">Заметки администратора</Label>
                <Textarea 
                  id="adminNotes" 
                  name="adminNotes" 
                  defaultValue={editingBet.adminNotes || ''} 
                  placeholder="Дополнительные заметки о ставке..."
                  rows={3}
                  data-testid="textarea-edit-admin-notes" 
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEditBetDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="betting-gradient" data-testid="button-save-bet">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования статистики пользователя */}
      <Dialog open={showEditUserStatsDialog} onOpenChange={setShowEditUserStatsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать статистику пользователя</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Изменение статистики и VIP уровня пользователя
          </DialogDescription>
          {editingUserStats && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const stats = {
                winRate: formData.get('winRate'),
                totalBetsPlaced: parseInt(formData.get('totalBetsPlaced') as string),
                totalWinsCount: parseInt(formData.get('totalWinsCount') as string),
                totalLossesCount: parseInt(formData.get('totalLossesCount') as string),
                totalProfit: formData.get('totalProfit'),
                vipLevel: parseInt(formData.get('vipLevel') as string),
                adminNotes: formData.get('adminNotes')
              };
              updateUserStatsMutation.mutate({ userId: bettingHistoryUserId, stats });
            }} className="space-y-4">
              <div>
                <Label htmlFor="winRate">Винрейт (%)</Label>
                <Input id="winRate" name="winRate" type="number" step="0.01" min="0" max="100" defaultValue={editingUserStats.winRate || 0} data-testid="input-edit-user-win-rate" />
              </div>
              <div>
                <Label htmlFor="totalBetsPlaced">Всего ставок</Label>
                <Input id="totalBetsPlaced" name="totalBetsPlaced" type="number" min="0" defaultValue={editingUserStats.totalBetsPlaced || 0} data-testid="input-edit-user-total-bets" />
              </div>
              <div>
                <Label htmlFor="totalWinsCount">Выигрышей</Label>
                <Input id="totalWinsCount" name="totalWinsCount" type="number" min="0" defaultValue={editingUserStats.totalWinsCount || 0} data-testid="input-edit-user-wins" />
              </div>
              <div>
                <Label htmlFor="totalLossesCount">Проигрышей</Label>
                <Input id="totalLossesCount" name="totalLossesCount" type="number" min="0" defaultValue={editingUserStats.totalLossesCount || 0} data-testid="input-edit-user-losses" />
              </div>
              <div>
                <Label htmlFor="totalProfit">Общая прибыль (฿)</Label>
                <Input id="totalProfit" name="totalProfit" type="number" step="0.01" defaultValue={editingUserStats.totalProfit || 0} data-testid="input-edit-user-total-profit" />
              </div>
              <div>
                <Label htmlFor="vipLevel">VIP уровень</Label>
                <Input id="vipLevel" name="vipLevel" type="number" min="0" max="10" defaultValue={editingUserStats.vipLevel || 0} data-testid="input-edit-user-vip-level" />
              </div>
              <div>
                <Label htmlFor="adminNotes">Заметки администратора</Label>
                <textarea id="adminNotes" name="adminNotes" defaultValue={editingUserStats.adminNotes || ''} className="w-full p-2 border rounded" rows={3} data-testid="textarea-edit-user-notes"></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEditUserStatsDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="betting-gradient" data-testid="button-save-user-stats">
                  Save
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог создания новой ставки */}
      <Dialog open={showCreateBetDialog} onOpenChange={setShowCreateBetDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать новую ставку</DialogTitle>
            <DialogDescription>
              Добавить ставку для пользователя
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const isValid = newBetUserId && newBetOdds && newBetStake && 
              (newBetUseCustomMatch 
                ? (newBetCustomHomeTeam && newBetCustomAwayTeam) 
                : newBetFixtureId);
            
            if (isValid) {
              createBetMutation.mutate({
                userId: newBetUserId,
                fixtureId: newBetFixtureId,
                market: newBetMarket,
                odds: newBetOdds,
                stake: newBetStake,
                useCustomMatch: newBetUseCustomMatch,
                customHomeTeam: newBetCustomHomeTeam,
                customAwayTeam: newBetCustomAwayTeam,
                customLeague: newBetCustomLeague,
                customHomeScore: newBetCustomHomeScore,
                customAwayScore: newBetCustomAwayScore,
                customMatchDate: newBetCustomMatchDate,
                status: newBetStatus
              });
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="new-bet-user">Пользователь</Label>
              <Select value={newBetUserId} onValueChange={setNewBetUserId}>
                <SelectTrigger data-testid="select-bet-user">
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent>
                  {((adminUsers as any) || []).map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} (ID: {user.accountId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-custom-match"
                  checked={newBetUseCustomMatch}
                  onCheckedChange={setNewBetUseCustomMatch}
                  data-testid="switch-custom-match"
                />
                <Label htmlFor="use-custom-match">Ввести данные матча вручную</Label>
              </div>
            </div>
            
            {!newBetUseCustomMatch ? (
              <div>
                <Label htmlFor="new-bet-fixture">Матч</Label>
                <Select value={newBetFixtureId} onValueChange={setNewBetFixtureId}>
                  <SelectTrigger data-testid="select-bet-fixture">
                    <SelectValue placeholder="Выберите матч" />
                  </SelectTrigger>
                  <SelectContent>
                    {((adminMatches as any) || []).map((match: any) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.homeTeam} vs {match.awayTeam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Данные матча</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="custom-home-team">Команда хозяев</Label>
                    <Input
                      id="custom-home-team"
                      value={newBetCustomHomeTeam}
                      onChange={(e) => setNewBetCustomHomeTeam(e.target.value)}
                      placeholder="Название команды"
                      data-testid="input-custom-home-team"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-away-team">Команда гостей</Label>
                    <Input
                      id="custom-away-team"
                      value={newBetCustomAwayTeam}
                      onChange={(e) => setNewBetCustomAwayTeam(e.target.value)}
                      placeholder="Название команды"
                      data-testid="input-custom-away-team"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom-league">Лига/Турнир</Label>
                  <Input
                    id="custom-league"
                    value={newBetCustomLeague}
                    onChange={(e) => setNewBetCustomLeague(e.target.value)}
                    placeholder="Например: Premier League"
                    data-testid="input-custom-league"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="custom-home-score">Счет хозяев</Label>
                    <Input
                      id="custom-home-score"
                      type="number"
                      min="0"
                      value={newBetCustomHomeScore}
                      onChange={(e) => setNewBetCustomHomeScore(e.target.value)}
                      placeholder="0"
                      data-testid="input-custom-home-score"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-away-score">Счет гостей</Label>
                    <Input
                      id="custom-away-score"
                      type="number"
                      min="0"
                      value={newBetCustomAwayScore}
                      onChange={(e) => setNewBetCustomAwayScore(e.target.value)}
                      placeholder="0"
                      data-testid="input-custom-away-score"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-match-date">Дата матча</Label>
                    <Input
                      id="custom-match-date"
                      value={newBetCustomMatchDate}
                      onChange={(e) => setNewBetCustomMatchDate(e.target.value)}
                      placeholder="01.09.2024"
                      data-testid="input-custom-match-date"
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="new-bet-market">Рынок</Label>
              <Select value={newBetMarket} onValueChange={setNewBetMarket}>
                <SelectTrigger data-testid="select-bet-market">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Победа хозяев</SelectItem>
                  <SelectItem value="draw">Ничья</SelectItem>
                  <SelectItem value="away">Победа гостей</SelectItem>
                  <SelectItem value="over">Больше</SelectItem>
                  <SelectItem value="under">Меньше</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-bet-odds">Коэффициент</Label>
              <Input 
                id="new-bet-odds" 
                type="number" 
                step="0.01" 
                min="1.01"
                value={newBetOdds}
                onChange={(e) => setNewBetOdds(e.target.value)}
                placeholder="1.85"
                data-testid="input-bet-odds"
              />
            </div>
            <div>
              <Label htmlFor="new-bet-stake">Сумма ставки</Label>
              <Input 
                id="new-bet-stake" 
                type="number" 
                step="0.01" 
                min="0.01"
                value={newBetStake}
                onChange={(e) => setNewBetStake(e.target.value)}
                placeholder="100.00"
                data-testid="input-bet-stake"
              />
            </div>
            {newBetOdds && newBetStake && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Потенциальный выигрыш:</div>
                <div className="text-lg font-semibold text-green-600">
                  ฿{(parseFloat(newBetOdds) * parseFloat(newBetStake)).toFixed(2)}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="new-bet-status">Статус ставки</Label>
              <Select value={newBetStatus || 'pending'} onValueChange={setNewBetStatus}>
                <SelectTrigger data-testid="select-bet-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">В ожидании</SelectItem>
                  <SelectItem value="won">Выигрыш</SelectItem>
                  <SelectItem value="lost">Проигрыш</SelectItem>
                  <SelectItem value="void">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateBetDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="betting-gradient" 
                disabled={createBetMutation.isPending || !newBetUserId || !newBetOdds || !newBetStake || 
                  (newBetUseCustomMatch 
                    ? (!newBetCustomHomeTeam || !newBetCustomAwayTeam) 
                    : !newBetFixtureId)}
                data-testid="button-save-new-bet"
              >
                {createBetMutation.isPending ? "Создание..." : "Создать ставку"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования депозита */}
      <Dialog open={showEditDepositDialog} onOpenChange={setShowEditDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать депозит</DialogTitle>
            <DialogDescription>
              Изменить данные депозита
            </DialogDescription>
          </DialogHeader>
          {editingDeposit && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const updates = {
                amount: editDepositAmount,
                method: editDepositMethod,
                status: editDepositStatus,
                txId: editDepositTxId
              };
              editDepositMutation.mutate({ depositId: editingDeposit.id, updates });
            }} className="space-y-4">
              <div>
                <Label htmlFor="edit-deposit-amount">Сумма</Label>
                <Input
                  id="edit-deposit-amount"
                  type="number"
                  step="0.01"
                  value={editDepositAmount}
                  onChange={(e) => setEditDepositAmount(e.target.value)}
                  data-testid="input-edit-deposit-amount"
                />
              </div>
              <div>
                <Label htmlFor="edit-deposit-method">Метод</Label>
                <Select value={editDepositMethod} onValueChange={setEditDepositMethod}>
                  <SelectTrigger data-testid="select-edit-deposit-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                    <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                    <SelectItem value="sol">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-deposit-status">Статус</Label>
                <Select value={editDepositStatus} onValueChange={setEditDepositStatus}>
                  <SelectTrigger data-testid="select-edit-deposit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="confirmed">Подтвержден</SelectItem>
                    <SelectItem value="failed">Отклонен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-deposit-txid">Transaction ID</Label>
                <Input
                  id="edit-deposit-txid"
                  value={editDepositTxId}
                  onChange={(e) => setEditDepositTxId(e.target.value)}
                  placeholder="Хеш транзакции"
                  data-testid="input-edit-deposit-txid"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDepositDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-deposit-edit">
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования вывода */}
      <Dialog open={showEditWithdrawalDialog} onOpenChange={setShowEditWithdrawalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать вывод</DialogTitle>
            <DialogDescription>
              Изменить данные вывода
            </DialogDescription>
          </DialogHeader>
          {editingWithdrawal && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const updates = {
                amount: editWithdrawalAmount,
                method: editWithdrawalMethod,
                status: editWithdrawalStatus,
                address: editWithdrawalAddress
              };
              editWithdrawalMutation.mutate({ withdrawalId: editingWithdrawal.id, updates });
            }} className="space-y-4">
              <div>
                <Label htmlFor="edit-withdrawal-amount">Сумма</Label>
                <Input
                  id="edit-withdrawal-amount"
                  type="number"
                  step="0.01"
                  value={editWithdrawalAmount}
                  onChange={(e) => setEditWithdrawalAmount(e.target.value)}
                  data-testid="input-edit-withdrawal-amount"
                />
              </div>
              <div>
                <Label htmlFor="edit-withdrawal-method">Метод</Label>
                <Select value={editWithdrawalMethod} onValueChange={setEditWithdrawalMethod}>
                  <SelectTrigger data-testid="select-edit-withdrawal-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                    <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                    <SelectItem value="sol">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-withdrawal-status">Статус</Label>
                <Select value={editWithdrawalStatus} onValueChange={setEditWithdrawalStatus}>
                  <SelectTrigger data-testid="select-edit-withdrawal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="processed">{t('processed')}</SelectItem>
                    <SelectItem value="rejected">{t('rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-withdrawal-address">Адрес</Label>
                <Input
                  id="edit-withdrawal-address"
                  value={editWithdrawalAddress}
                  onChange={(e) => setEditWithdrawalAddress(e.target.value)}
                  placeholder="Адрес кошелька"
                  data-testid="input-edit-withdrawal-address"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditWithdrawalDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-withdrawal-edit">
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования статистики депозитов */}
      <Dialog open={showEditDepositStatsDialog} onOpenChange={setShowEditDepositStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать статистику депозитов</DialogTitle>
            <DialogDescription>
              Изменить общую сумму депозитов в системе
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            updateDepositStatsMutation.mutate({ totalDeposits: editDepositStats });
          }} className="space-y-4">
            <div>
              <Label htmlFor="edit-total-deposits">Общая сумма депозитов (฿)</Label>
              <Input
                id="edit-total-deposits"
                type="number"
                step="0.01"
                value={editDepositStats}
                onChange={(e) => setEditDepositStats(e.target.value)}
                placeholder="0.00"
                data-testid="input-edit-total-deposits"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDepositStatsDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="betting-gradient" data-testid="button-save-deposit-stats">
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования статистики выводов */}
      <Dialog open={showEditWithdrawalStatsDialog} onOpenChange={setShowEditWithdrawalStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать статистику выводов</DialogTitle>
            <DialogDescription>
              Изменить общую сумму выводов в системе
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            updateWithdrawalStatsMutation.mutate({ totalWithdrawals: editWithdrawalStats });
          }} className="space-y-4">
            <div>
              <Label htmlFor="edit-total-withdrawals">Общая сумма выводов (฿)</Label>
              <Input
                id="edit-total-withdrawals"
                type="number"
                step="0.01"
                value={editWithdrawalStats}
                onChange={(e) => setEditWithdrawalStats(e.target.value)}
                placeholder="0.00"
                data-testid="input-edit-total-withdrawals"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditWithdrawalStatsDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="betting-gradient" data-testid="button-save-withdrawal-stats">
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог создания депозита пользователю */}
      <Dialog open={showCreateUserDepositDialog} onOpenChange={setShowCreateUserDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить депозит пользователю</DialogTitle>
            <DialogDescription>
              Создать депозит для пользователя: {selectedUserForTransaction?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedUserForTransaction && newUserDepositAmount && newUserDepositDate) {
              createUserDepositMutation.mutate({
                userId: selectedUserForTransaction.id,
                amount: newUserDepositAmount,
                method: newUserDepositMethod,
                date: newUserDepositDate
              });
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="new-user-deposit-amount">Сумма (฿)</Label>
              <Input
                id="new-user-deposit-amount"
                type="number"
                step="0.01"
                value={newUserDepositAmount}
                onChange={(e) => setNewUserDepositAmount(e.target.value)}
                placeholder="0.00"
                required
                data-testid="input-new-user-deposit-amount"
              />
            </div>
            <div>
              <Label htmlFor="new-user-deposit-method">Метод</Label>
              <Select value={newUserDepositMethod} onValueChange={setNewUserDepositMethod}>
                <SelectTrigger data-testid="select-new-user-deposit-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_card">Банковская карта</SelectItem>
                  <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                  <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                  <SelectItem value="sol">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-user-deposit-date">Дата</Label>
              <Input
                id="new-user-deposit-date"
                type="date"
                value={newUserDepositDate}
                onChange={(e) => setNewUserDepositDate(e.target.value)}
                required
                data-testid="input-new-user-deposit-date"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateUserDepositDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="betting-gradient" 
                disabled={createUserDepositMutation.isPending}
                data-testid="button-save-user-deposit"
              >
                {createUserDepositMutation.isPending ? "Creating..." : "Create Deposit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог создания вывода пользователю */}
      <Dialog open={showCreateUserWithdrawalDialog} onOpenChange={setShowCreateUserWithdrawalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить вывод пользователю</DialogTitle>
            <DialogDescription>
              Создать вывод для пользователя: {selectedUserForTransaction?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedUserForTransaction && newUserWithdrawalAmount && newUserWithdrawalDate) {
              createUserWithdrawalMutation.mutate({
                userId: selectedUserForTransaction.id,
                amount: newUserWithdrawalAmount,
                method: newUserWithdrawalMethod,
                address: newUserWithdrawalAddress,
                date: newUserWithdrawalDate
              });
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="new-user-withdrawal-amount">Сумма (฿)</Label>
              <Input
                id="new-user-withdrawal-amount"
                type="number"
                step="0.01"
                value={newUserWithdrawalAmount}
                onChange={(e) => setNewUserWithdrawalAmount(e.target.value)}
                placeholder="0.00"
                required
                data-testid="input-new-user-withdrawal-amount"
              />
            </div>
            <div>
              <Label htmlFor="new-user-withdrawal-method">Метод</Label>
              <Select value={newUserWithdrawalMethod} onValueChange={setNewUserWithdrawalMethod}>
                <SelectTrigger data-testid="select-new-user-withdrawal-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_card">Банковская карта</SelectItem>
                  <SelectItem value="usdt_trc20">USDT TRC20</SelectItem>
                  <SelectItem value="usdt_bep20">USDT BEP20</SelectItem>
                  <SelectItem value="sol">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-user-withdrawal-address">Адрес/Реквизиты</Label>
              <Input
                id="new-user-withdrawal-address"
                value={newUserWithdrawalAddress}
                onChange={(e) => setNewUserWithdrawalAddress(e.target.value)}
                placeholder="Адрес кошелька или банковские реквизиты"
                required
                data-testid="input-new-user-withdrawal-address"
              />
            </div>
            <div>
              <Label htmlFor="new-user-withdrawal-date">Дата</Label>
              <Input
                id="new-user-withdrawal-date"
                type="date"
                value={newUserWithdrawalDate}
                onChange={(e) => setNewUserWithdrawalDate(e.target.value)}
                required
                data-testid="input-new-user-withdrawal-date"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateUserWithdrawalDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="betting-gradient" 
                disabled={createUserWithdrawalMutation.isPending}
                data-testid="button-save-user-withdrawal"
              >
                {createUserWithdrawalMutation.isPending ? "Creating..." : "Create Withdrawal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getStatusBadge(status: string) {
  const statusMap = {
    pending: { color: "bg-yellow-500", text: t('pending') },
    confirmed: { color: "bg-green-500", text: t('confirmed') },
    processed: { color: "bg-green-500", text: t('processed') },
    failed: { color: "bg-red-500", text: t('failed') },
    rejected: { color: "bg-red-500", text: t('rejected') },
    active: { color: "bg-green-500", text: "ใช้งาน" },
    suspended: { color: "bg-red-500", text: "ระงับ" },
  };

  const statusInfo = statusMap[status as keyof typeof statusMap] || { color: "bg-gray-500", text: status };

  return (
    <Badge className={`${statusInfo.color} text-white`}>
      {statusInfo.text}
    </Badge>
  );
}
