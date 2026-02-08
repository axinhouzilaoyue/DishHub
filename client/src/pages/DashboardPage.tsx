import React, { useEffect, useMemo, useState } from 'react';
import { Activity, FolderTree, Server, ShieldCheck, Soup, Timer } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import { AdminStats, ApiHealth } from '../types';

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '暂无记录';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '暂无记录';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [statsResult, healthResult] = await Promise.all([adminAPI.getStats(), adminAPI.getHealth()]);

        setStats(statsResult);
        setHealth(healthResult);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载总览数据失败');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = useMemo(
    () => [
      {
        icon: Soup,
        label: '总菜品',
        value: stats?.total_dishes ?? 0,
        color: 'text-blue-600',
      },
      {
        icon: FolderTree,
        label: '分类数量',
        value: stats?.total_categories ?? 0,
        color: 'text-indigo-600',
      },
      {
        icon: Activity,
        label: '烹饪记录',
        value: stats?.total_logs ?? 0,
        color: 'text-violet-600',
      },
      {
        icon: Timer,
        label: '最近更新',
        value: formatDateTime(stats?.last_updated),
        color: 'text-emerald-600',
        small: true,
      },
    ],
    [stats]
  );

  if (loading) {
    return <LoadingSpinner message="正在加载总览..." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel dashboard-hero">
        <p className="eyebrow">总览</p>
        <h1 className="hero-title">家庭菜单运营面板</h1>
        <p className="hero-subtitle">
          这里仅展示系统与数据状态；菜品查看与管理统一在左侧「菜谱库」中完成。
        </p>
      </section>

      {error && (
        <section className="alert-card">
          <p>{error}</p>
        </section>
      )}

      <section className="stats-grid">
        {cards.map((item) => (
          <article key={item.label} className="stat-card">
            <div className={`stat-icon ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="stat-label">{item.label}</p>
              <p className={`stat-value ${item.small ? 'stat-value-small' : ''}`}>{item.value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="panel status-panel">
        <div className="panel-header">
          <h2>系统状态</h2>
        </div>

        <div className="status-grid">
          <article className="status-item">
            <div className="status-head">
              <Server className="h-4 w-4" />
              <span>API 服务</span>
            </div>
            <p className="status-value">{health?.status === 'ok' ? '运行正常' : '状态未知'}</p>
          </article>

          <article className="status-item">
            <div className="status-head">
              <ShieldCheck className="h-4 w-4" />
              <span>运行环境</span>
            </div>
            <p className="status-value">{health?.runtime || 'cloudflare-pages-functions'}</p>
          </article>

          <article className="status-item">
            <div className="status-head">
              <Timer className="h-4 w-4" />
              <span>健康检查时间</span>
            </div>
            <p className="status-value">{formatDateTime(health?.timestamp || null)}</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
