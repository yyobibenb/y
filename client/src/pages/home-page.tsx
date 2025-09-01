import { useState } from "react";
import Header from "@/components/Header";
import SportsGrid from "@/components/SportsGrid";
import BettingSlip from "@/components/BettingSlip";
import LiveUpdates from "@/components/LiveUpdates";
import BottomNavigation from "@/components/BottomNavigation";
import BettingHistory from "@/components/BettingHistory";
import BonusBanner from "@/components/BonusBanner";
import DashboardPage from "@/pages/dashboard-page";
import { getLanguage } from "@/lib/i18n";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'betting' | 'history'>('betting');
  const language = getLanguage();

  const handleNavigation = (section: 'dashboard' | 'betting' | 'history') => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'history':
        return <BettingHistory />;
      case 'betting':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-3">
              {/* Bonus Banner */}
              <BonusBanner />
              <SportsGrid />
            </div>

            <div className="lg:col-span-1">
              <BettingSlip />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 emoji-background">
      {/* Фоновые плавающие эмодзи */}
      <div className="floating-emojis">
        <div className="floating-emoji">⚽</div>
        <div className="floating-emoji">🏀</div>
        <div className="floating-emoji">🎾</div>
        <div className="floating-emoji">💰</div>
        <div className="floating-emoji">🏆</div>
        <div className="floating-emoji">🎯</div>
        <div className="floating-emoji">🎲</div>
        <div className="floating-emoji">💎</div>
        <div className="floating-emoji">🔥</div>
        <div className="floating-emoji">⭐</div>
        <div className="floating-emoji">🚀</div>
        <div className="floating-emoji">💸</div>
      </div>
      
      <Header />
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="fade-in">
          {renderContent()}
        </div>
      </main>
      <LiveUpdates />
      <BottomNavigation 
        onNavigate={handleNavigation}
        activeSection={activeSection}
      />
    </div>
  );
}
