import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, LayoutGrid, Library, History, ListChecks, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: '首页', icon: LayoutGrid },
    { to: '/library', label: '菜谱库', icon: Library },
    { to: '/logs', label: '累计下厨', icon: History },
    { to: '/order', label: '点菜', icon: ListChecks },
  ];

  const isActiveRoute = (to: string) => {
    if (to === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-paper-light md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex flex-col border-r border-paper bg-paper-light/90 backdrop-blur-xl">
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <Link
            to="/settings"
            className="h-10 w-10 rounded-xl bg-sage text-white shadow-paper inline-flex items-center justify-center"
            title="设置"
          >
            <ChefHat className="h-5 w-5" />
          </Link>
          <Link to="/" className="text-[19px] font-black tracking-tightest text-ink">DishHub</Link>
        </div>

        <nav className="px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[14px] font-black transition-all ${
                  isActive
                    ? 'border-paper-stone bg-white text-ink shadow-paper'
                    : 'border-transparent text-ink-light hover:border-paper hover:bg-white/70 hover:text-ink'
                }`}
              >
                <item.icon
                  className={`h-4 w-4 transition-colors ${isActive ? 'text-sage' : 'text-ink-light group-hover:text-sage'}`}
                  strokeWidth={2.4}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 pb-6">
          <Link to="/dish/new" className="paper-button w-full !rounded-xl !px-4 !py-2.5 text-[13px]">
            <Plus className="h-4 w-4" strokeWidth={3} />
            新增菜品
          </Link>
        </div>
      </aside>

      <div className="min-h-screen flex flex-col">
        <header className="md:hidden paper-header">
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                to="/settings"
                className="h-9 w-9 rounded-xl bg-sage text-white shadow-paper inline-flex items-center justify-center"
                title="设置"
              >
                <ChefHat className="h-5 w-5" />
              </Link>
              <Link to="/" className="text-[18px] font-black tracking-tightest text-ink">DishHub</Link>
            </div>

            <Link to="/dish/new" className="paper-button !px-4 !py-2 text-[12px]">
              <Plus className="h-4 w-4" strokeWidth={3} />
              新增菜品
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1280px] mx-auto p-5 md:p-8 lg:p-10 animate-in fade-in duration-700">
          {children}
        </main>

        <footer className="py-10 border-t border-paper text-center">
          <p className="text-[11px] font-bold text-ink-light/45 uppercase tracking-[0.2em]">
            Handcrafted by Chef axin · 2026
          </p>
        </footer>
      </div>

      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-white/92 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-7 shadow-paper-deep border border-paper">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={`transition-colors ${isActive ? 'text-sage' : 'text-ink-light hover:text-ink'}`}
            >
              <item.icon className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
