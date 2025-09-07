import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, X, ExternalLink } from 'lucide-react';
import { dishAPI } from '../services/api';
import { DishFormData, Dish } from '../types';

interface DishFormProps {
  dish?: Dish;
  isEditing?: boolean;
}

const DishForm: React.FC<DishFormProps> = ({ dish, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    category: '家常菜',
    difficulty: 1,
    cooking_time: 30,
    servings: 2,
    ingredients: [''],
    instructions: [''],
    image: '',
    tags: [],
    tutorial_url: '',
  });

  // 如果是编辑模式，填充表单数据
  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        category: dish.category,
        difficulty: dish.difficulty,
        cooking_time: dish.cooking_time,
        servings: dish.servings,
        ingredients: dish.ingredients.length > 0 ? dish.ingredients : [''],
        instructions: dish.instructions.length > 0 ? dish.instructions : [''],
        image: dish.image || '',
        tags: dish.tags,
        tutorial_url: dish.tutorial_url || '',
      });
    }
  }, [dish]);

  // 处理基本字段变化
  const handleInputChange = (field: keyof DishFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理数组字段变化
  const handleArrayChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  // 添加数组项
  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  // 删除数组项
  const removeArrayItem = (field: 'ingredients' | 'instructions', index: number) => {
    if (formData[field].length <= 1) return;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // 处理标签
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!formData.name.trim()) {
      alert('请输入菜品名称');
      return;
    }

    const validIngredients = formData.ingredients.filter(item => item.trim());
    const validInstructions = formData.instructions.filter(item => item.trim());

    if (validIngredients.length === 0) {
      alert('请至少添加一个食材');
      return;
    }

    if (validInstructions.length === 0) {
      alert('请至少添加一个制作步骤');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        ingredients: validIngredients,
        instructions: validInstructions,
      };

      if (isEditing && dish) {
        await dishAPI.updateDish(dish.id, submitData);
        navigate(`/dish/${dish.id}`);
      } else {
        const result = await dishAPI.createDish(submitData);
        navigate(`/dish/${result.id}`);
      }
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['家常菜', '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '徽菜', '闽菜', '西餐', '日料', '韩料', '其他'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? '编辑菜品' : '添加新菜品'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                菜品名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input"
                placeholder="请输入菜品名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                难度等级
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                className="input"
              >
                <option value={1}>简单</option>
                <option value={2}>一般</option>
                <option value={3}>中等</option>
                <option value={4}>困难</option>
                <option value={5}>大师</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                制作时间（分钟）
              </label>
              <input
                type="number"
                value={formData.cooking_time}
                onChange={(e) => handleInputChange('cooking_time', parseInt(e.target.value) || 0)}
                className="input"
                min="1"
                max="1440"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                份量（人份）
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                className="input"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片URL（可选）
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="input"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教程链接（可选）
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.tutorial_url}
                  onChange={(e) => handleInputChange('tutorial_url', e.target.value)}
                  className="input pr-10"
                  placeholder="https://www.bilibili.com/video/..."
                />
                {formData.tutorial_url && (
                  <a
                    href={formData.tutorial_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600"
                    title="在新窗口打开教程"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                可以添加B站、YouTube等视频教程链接
              </p>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="input"
              placeholder="例如：辣, 下饭, 简单"
            />
          </div>

          {/* 食材列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所需食材 *
            </label>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                    className="input flex-1"
                    placeholder={`食材 ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('ingredients', index)}
                    disabled={formData.ingredients.length <= 1}
                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('ingredients')}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                <span>添加食材</span>
              </button>
            </div>
          </div>

          {/* 制作步骤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              制作步骤 *
            </label>
            <div className="space-y-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                    className="textarea flex-1"
                    rows={2}
                    placeholder={`步骤 ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('instructions', index)}
                    disabled={formData.instructions.length <= 1}
                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400 mt-1"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('instructions')}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                <span>添加步骤</span>
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>取消</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishForm;
