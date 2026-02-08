import React, { useEffect, useState } from 'react';
import { Cloud, DatabaseBackup, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../services/api';

const triggerDownload = (blob: Blob, filename: string) => {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
};

const SettingsPage: React.FC = () => {
  const [backupKey, setBackupKey] = useState('');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('dishhub_backup_key') || '';
    setBackupKey(storedKey);
  }, []);

  const handleBackup = async () => {
    try {
      setExporting(true);
      setError(null);
      setMessage(null);

      const key = backupKey.trim();
      if (key) {
        localStorage.setItem('dishhub_backup_key', key);
      } else {
        localStorage.removeItem('dishhub_backup_key');
      }

      const { blob, filename } = await adminAPI.exportBackup(key || undefined);
      triggerDownload(blob, filename);
      setMessage(`备份导出成功：${filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败，请稍后再试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel settings-hero">
        <p className="eyebrow">设置</p>
        <h1 className="hero-title">备份与运维</h1>
        <p className="hero-subtitle">生产运维入口保持单一，避免分散操作路径。</p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Cloudflare 运维面板</h2>
          <div className="status-chip">
            <Cloud className="h-4 w-4" />
            <span>Cloudflare Only</span>
          </div>
        </div>

        <div className="setting-grid">
          <article className="setting-card">
            <div className="setting-head">
              <DatabaseBackup className="h-5 w-5" />
              <h2>一键导出 D1 备份</h2>
            </div>
            <p>
              点击后会自动下载 SQL 文件，可用于灾备留档。
              如果你配置了 `BACKUP_KEY`，请先输入口令。
            </p>

            <label className="field-label" htmlFor="backupKey">
              备份口令（可选）
            </label>
            <input
              id="backupKey"
              className="field-input"
              type="password"
              autoComplete="off"
              value={backupKey}
              onChange={(event) => setBackupKey(event.target.value)}
              placeholder="若 Functions 配置了 BACKUP_KEY，请在此输入"
            />

            <button
              type="button"
              className="btn btn-primary"
              disabled={exporting}
              onClick={handleBackup}
            >
              {exporting ? '导出中...' : '一键导出备份'}
            </button>

            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}
          </article>

          <article className="setting-card">
            <div className="setting-head">
              <ShieldCheck className="h-5 w-5" />
              <h2>建议的生产策略</h2>
            </div>
            <ul className="setting-list">
              <li>每次上线前先点击一次备份，保留版本快照。</li>
              <li>迁移统一走 `client/migrations`，避免手工改库。</li>
              <li>若多人管理，建议设置 `BACKUP_KEY`。</li>
              <li>上线后检查 `/api/health` 与 `/api/dishes`。</li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
