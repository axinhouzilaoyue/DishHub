import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, LayoutGrid, Library, Settings2, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: '首页', icon: LayoutGrid },
    { to: '/library', label: '菜谱库', icon: Library },
    { to: '/settings', label: '设置', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="paper-header">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sage flex items-center justify-center text-white shadow-paper">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-[18px] font-black tracking-tightest text-ink">DishHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = item.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-[14px] font-bold transition-all ${
                    isActive ? 'text-sage scale-105' : 'text-ink-light hover:text-sage'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link to="/dish/new" className="paper-button !px-4 !py-2 text-[13px]">
            <Plus className="h-4 w-4" strokeWidth={3} />
            新增菜品
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-10 animate-in fade-in duration-700">
        {children}
      </main>

      <footer className="py-12 border-t border-paper text-center">
        <p className="text-[11px] font-bold text-ink-light/40 uppercase tracking-[0.2em]">
          Handcrafted by Chef axin · 2026
        </p>
      </footer>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-sage/90 backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-10 shadow-paper-deep text-white border border-white/10">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="opacity-70 hover:opacity-100 transition-opacity">
            <item.icon className="h-5.5 w-5.5" strokeWidth={2.5} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Layout;
