import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, User, Settings, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { setLanguage, getLanguage } from "@/lib/i18n";
export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());

  const handleLanguageChange = (lang: 'th' | 'en') => {
    console.log('Changing language to:', lang);
    setLanguage(lang);
    setCurrentLanguage(lang);
    // Force component re-render by updating state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const navItems = [
    { href: "/", label: currentLanguage === 'th' ? "กีฬา" : "Sports", section: "sports" },
    { href: "/?section=live", label: currentLanguage === 'th' ? "สด" : "Live", section: "live" },
    { href: "/?section=thai-sports", label: currentLanguage === 'th' ? "กีฬาไทย" : "Thai Sports", section: "thai-sports" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 slide-down">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg cursor-pointer glow wiggle logo-click-animation font-bold text-xl smooth-transition tracking-wide" 
                data-testid="logo"
                style={{ 
                  fontFamily: 'Playfair Display, serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '0.05em'
                }}
                onClick={(e) => {
                  const target = e.currentTarget;
                  if (target) {
                    target.classList.add('logo-bounce');
                    setTimeout(() => {
                      target.classList.remove('logo-bounce');
                    }, 600);
                  }
                }}
              >
                ThaiBC
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-muted-foreground hover:text-foreground smooth-transition hover-lift ${
                    location === item.href ? "text-foreground" : ""
                  }`}
                  data-testid={`nav-${item.section}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
              data-testid="theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Language Switcher */}
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32" data-testid="language-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="th">🇹🇭 ไทย</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>

            {user ? (
              <>
                {/* User Balance */}
                <div className="hidden lg:flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-secondary" />
                  <span className="text-sm">{currentLanguage === 'th' ? 'ยอดเงิน:' : 'Balance:'}</span>
                  <span className="font-semibold text-secondary" data-testid="header-balance">
                    ฿{parseFloat(user.balance || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu-trigger">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block max-w-32 truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2 w-full" data-testid="nav-dashboard">
                        <User className="h-4 w-4" />
                        <span>{currentLanguage === 'th' ? 'บัญชีของฉัน' : 'My Account'}</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 w-full" data-testid="nav-admin">
                          <Settings className="h-4 w-4" />
                          <span>{currentLanguage === 'th' ? 'แผงควบคุม' : 'Admin Panel'}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      className="flex items-center space-x-2 text-destructive focus:text-destructive"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{currentLanguage === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-login">
                    {currentLanguage === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" data-testid="button-register">
                    {currentLanguage === 'th' ? 'สมัครสมาชิก' : 'Register'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4" data-testid="mobile-menu">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.section}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
