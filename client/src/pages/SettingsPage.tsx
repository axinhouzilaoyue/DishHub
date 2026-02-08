import React, { useEffect, useState } from 'react';
import { Cloud, DatabaseBackup, ShieldCheck, Key, Info, ChevronRight } from 'lucide-react';
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
    <div className="space-y-10 max-w-[900px] mx-auto p-6 lg:p-12 animate-in fade-in duration-1000">
      <header className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-[32px] font-black tracking-tightest text-[#1C1C1E]">系统设置</h1>
          <p className="text-[14px] font-bold text-system-gray-1 mt-1">管理您的数据备份与边缘运行环境</p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full vibrancy-panel ring-1 ring-black/[0.03]">
          <Cloud className="h-4 w-4 text-system-brand" />
          <span className="text-[12px] font-black tracking-[0.1em] text-[#1C1C1E] uppercase">Cloudflare Only</span>
        </div>
      </header>

      {message && (
        <div className="rounded-2xl bg-system-success/5 border border-system-success/10 p-4 text-[13px] font-bold text-system-success shadow-sm flex items-center gap-3">
          <Info className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-system-accent/5 border border-system-accent/10 p-4 text-[13px] font-bold text-system-accent shadow-sm flex items-center gap-3">
          <Info className="h-4 w-4" />
          {error}
        </div>
      )}

      <section>
        <h2 className="mac-header-title">数据维护 (MAINTENANCE)</h2>
        <div className="vibrancy-panel rounded-2xl overflow-hidden divide-y divide-black/[0.04]">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-system-brand/10 text-system-brand">
                <DatabaseBackup className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-black text-[#1C1C1E]">D1 数据库一键快照</h3>
                <p className="text-[13px] font-bold text-system-gray-1">导出完整的 SQL 结构与数据，确保您的美味资产安全。</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] font-black text-system-gray-1 uppercase px-1">
                  <Key className="h-3 w-3" />
                  备份验证口令
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl bg-black/[0.04] p-3 text-[14px] font-bold text-[#1C1C1E] outline-none placeholder:text-system-gray-3 focus:bg-white focus:ring-2 focus:ring-system-brand/20 transition-all"
                  value={backupKey}
                  onChange={(e) => setBackupKey(e.target.value)}
                  placeholder="若配置了 BACKUP_KEY，请在此输入"
                />
              </div>

              <button
                disabled={exporting}
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-system-brand py-3.5 text-[14px] font-black text-white shadow-mac-glow-brand active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {exporting ? '正在生成 SQL...' : '立即导出 SQL 备份'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mac-header-title">运行安全 (SECURITY)</h2>
        <div className="vibrancy-panel rounded-2xl overflow-hidden divide-y divide-black/[0.04]">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-system-success" />
              <span className="text-[15px] font-bold text-[#1C1C1E]">边缘计算完整性校验</span>
            </div>
            <span className="text-[12px] font-black px-2.5 py-1 rounded-lg bg-system-success/10 text-system-success uppercase">Verified</span>
          </div>
          <div className="p-6 bg-black/[0.01]">
            <ul className="space-y-3">
              {[
                '每次重大更新前，建议导出一次数据备份。',
                '迁移文件存储在 client/migrations 目录中。',
                '多人协作时，务必在 Functions 中设置 BACKUP_KEY。',
                '系统目前运行在 Cloudflare D1 Serverless 环境。'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-system-gray-1">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-system-brand/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
