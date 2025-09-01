import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, TrendingUp, History } from "lucide-react";
import { getLanguage } from "@/lib/i18n";

interface BottomNavigationProps {
  onNavigate: (section: 'dashboard' | 'betting' | 'history') => void;
  activeSection: string;
}

export default function BottomNavigation({ onNavigate, activeSection }: BottomNavigationProps) {
  const language = getLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: language === 'th' ? 'บัญชี' : 'Account',
      icon: User,
      testId: 'bottom-nav-dashboard'
    },
    {
      id: 'betting',
      label: language === 'th' ? 'เดิมพัน' : 'Betting',
      icon: TrendingUp,
      testId: 'bottom-nav-betting'
    },
    {
      id: 'history',
      label: language === 'th' ? 'ประวัติ' : 'History',
      icon: History,
      testId: 'bottom-nav-history'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center space-y-1 h-16 flex-1 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => onNavigate(item.id as 'dashboard' | 'betting' | 'history')}
              data-testid={item.testId}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}