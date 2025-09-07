# 使用官方Node.js运行时作为基础镜像（debian 以避免 sqlite3 在 musl 上构建问题）
FROM node:18-bullseye-slim

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p data

# 暴露端口
EXPOSE 4001

# 启动应用
CMD ["npm", "start"]
