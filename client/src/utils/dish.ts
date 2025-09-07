// 菜品相关工具函数

export const getDifficultyText = (difficulty: number): string => {
  const levels = ['', '简单', '一般', '中等', '困难', '大师'];
  return levels[difficulty] || '未知';
};

export const getDifficultyColor = (difficulty: number): string => {
  const colors = ['', 'text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];
  return colors[difficulty] || 'text-gray-600';
};

export const formatTags = (tagsString: string): string[] => {
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
};
