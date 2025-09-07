import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Image, MessageSquare, X, ChefHat } from 'lucide-react';
import { cookingLogAPI } from '../services/api';
import { CookingLog, CookingLogFormData } from '../types';

interface CookingLogsProps {
  dishId: number;
  dishName: string;
}

const CookingLogs: React.FC<CookingLogsProps> = ({ dishId, dishName }) => {
  const [logs, setLogs] = useState<CookingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CookingLogFormData>({
    image_url: '',
    notes: ''
  });

  // 加载烹饪日志
  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await cookingLogAPI.getCookingLogs(dishId);
      setLogs(data);
    } catch (error) {
      console.error('加载烹饪日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [dishId]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url && !formData.notes) {
      alert('请至少输入图片链接或烹饪笔记');
      return;
    }

    try {
      setSubmitting(true);
      await cookingLogAPI.addCookingLog(dishId, formData);
      setFormData({ image_url: '', notes: '' });
      setShowForm(false);
      await loadLogs(); // 重新加载日志
    } catch (error) {
      console.error('添加烹饪日志失败:', error);
      alert('添加失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <ChefHat className="h-5 w-5 text-primary-600" />
          <span>烹饪记录</span>
          {logs.length > 0 && (
            <span className="bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full">
              {logs.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center space-x-1"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showForm ? '取消' : '记录本次烹饪'}</span>
        </button>
      </div>

      {/* 添加烹饪日志表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-medium text-gray-900">记录你的 "{dishName}" 烹饪体验</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="inline h-4 w-4 mr-1" />
              成品照片链接（可选）
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="预览"
                  className="w-32 h-24 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              烹饪笔记（可选）
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录制作心得、调味技巧、改进建议等..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? '保存中...' : '保存记录'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 烹饪日志列表 */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有烹饪记录</h3>
          <p className="text-gray-600 mb-6">
            快来记录你的第一次 "{dishName}" 制作体验吧！
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            开始记录
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(log.cooked_at)}</span>
              </div>

              {log.image_url && (
                <div className="mb-4">
                  <img
                    src={log.image_url}
                    alt="烹饪成果"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {log.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{log.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CookingLogs;
