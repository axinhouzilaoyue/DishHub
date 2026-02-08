import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Home, Library, Plus, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: '总览',
      icon: Home,
      active: location.pathname === '/',
    },
    {
      to: '/library',
      label: '菜谱库',
      icon: Library,
      active:
        location.pathname.startsWith('/library') ||
        (location.pathname.startsWith('/dish/') && !location.pathname.endsWith('/edit')),
    },
    {
      to: '/settings',
      label: '设置',
      icon: Settings,
      active: location.pathname.startsWith('/settings'),
    },
  ];

  const createActive = location.pathname === '/dish/new' || location.pathname.endsWith('/edit');

  return (
    <div className="app-shell">
      <div className="app-frame">
        <aside className="app-sidebar">
          <Link to="/" className="brand-wrap">
            <span className="brand-logo">
              <ChefHat className="h-5 w-5" />
            </span>
            <span>
              <span className="brand-text">DishHub</span>
              <span className="brand-subtitle">家庭菜单管理</span>
            </span>
          </Link>

          <nav className="side-nav" aria-label="主导航">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={`side-link ${item.active ? 'is-active' : ''}`}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <Link to="/dish/new" className={`create-entry ${createActive ? 'is-active' : ''}`}>
            <Plus className="h-4 w-4" />
            <span>新增菜品</span>
          </Link>
        </aside>

        <div className="app-content">
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <p>© 2026 DishHub · 家庭菜单管理系统</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
