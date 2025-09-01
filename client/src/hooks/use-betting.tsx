import { createContext, ReactNode, useContext, useState } from "react";

interface BetSelection {
  fixtureId: string;
  match: string;
  market: string;
  odds: number;
  league: string;
  stake?: number;
}

interface BettingContextType {
  bettingSlip: BetSelection[];
  addToBettingSlip: (bet: BetSelection) => void;
  removeFromBettingSlip: (fixtureId: string, market: string) => void;
  updateStake: (fixtureId: string, stake: number) => void;
  clearBettingSlip: () => void;
}

const BettingContext = createContext<BettingContextType | null>(null);

export function BettingProvider({ children }: { children: ReactNode }) {
  const [bettingSlip, setBettingSlip] = useState<BetSelection[]>([]);

  const addToBettingSlip = (bet: BetSelection) => {
    setBettingSlip(prev => {
      // Remove existing bet on same fixture and market
      const filtered = prev.filter(
        existing => !(existing.fixtureId === bet.fixtureId && existing.market === bet.market)
      );
      return [...filtered, bet];
    });
  };

  const removeFromBettingSlip = (fixtureId: string, market: string) => {
    setBettingSlip(prev => 
      prev.filter(bet => !(bet.fixtureId === fixtureId && bet.market === market))
    );
  };

  const updateStake = (fixtureId: string, stake: number) => {
    setBettingSlip(prev =>
      prev.map(bet => 
        bet.fixtureId === fixtureId ? { ...bet, stake } : bet
      )
    );
  };

  const clearBettingSlip = () => {
    setBettingSlip([]);
  };

  return (
    <BettingContext.Provider value={{
      bettingSlip,
      addToBettingSlip,
      removeFromBettingSlip,
      updateStake,
      clearBettingSlip,
    }}>
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error("useBetting must be used within a BettingProvider");
  }
  return context;
}
