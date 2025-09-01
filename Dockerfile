# 使用官方 Node.js 运行时镜像（LTS）
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在），先安装依赖
COPY package*.json ./

RUN npm ci --only=production

# 复制应用源代码
COPY . .

# 创建默认 docs 目录（容器内默认路径），允许通过挂载外部目录覆盖
RUN mkdir -p /app/docs

ENV BASE_URL=http://127.0.0.1:3000
ENV PORT=3000

# 运行时使用非 root 用户（可选）
# RUN useradd --user-group --create-home --shell /bin/false appuser && chown -R appuser:appuser /usr/src/app
# USER appuser

# 暴露端口（默认 3000）
EXPOSE 3000

# 启动命令，支持通过环境变量注入 BASE_URL 和 DOCS_DIR
CMD ["node", "app.js"]
