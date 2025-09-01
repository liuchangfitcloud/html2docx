# html2docx
html转docx


使用 Docker 运行 html2docx

构建镜像：

    docker build -t html2docx:latest .

运行镜像（将 docs 目录映射到宿主机以实现外置存储，并注入 BASE_URL）：

    docker run -d \
      -p 3000:3000 \
      -e BASE_URL="http://your.host:3000" \
      -v /path/on/host/docs:/usr/src/app/docs \
      --name html2docx html2docx:latest

说明：
- 通过 -e BASE_URL 注入外部可访问的基础 URL（例如反向代理地址或机器 IP:端口）。
- 通过 -v 将宿主机目录挂载到容器内的 `/usr/src/app/docs`，也可以通过设置环境变量 `DOCS_DIR` 指定不同路径。

示例：如果你希望容器内的文档存放在 `/data/docs`，可以：

    docker run -d -p 3000:3000 -e BASE_URL="http://your.host:3000" -e DOCS_DIR=/data/docs -v /path/on/host/docs:/data/docs --name html2docx html2docx:latest
