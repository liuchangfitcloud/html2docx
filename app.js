// server.js
import express from 'express';
import HtmlDocx from 'html-docx-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const app = express();
const port = process.env.PORT || 3000; // 可以通过环境变量配置端口

// 解析 JSON 请求体
app.use(express.json({ limit: '5mb' })); // 支持大 HTML

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 存放生成的 DOCX 文件：支持通过环境变量 DOCS_DIR 指定外置路径（可以是绝对或相对路径）
const docsDir = process.env.DOCS_DIR ? path.resolve(process.env.DOCS_DIR) : path.join(__dirname, 'docs');
if (!existsSync(docsDir)) {
    // 递归创建，兼容多层目录
    mkdirSync(docsDir, { recursive: true });
}

// 获取局域网 IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}

// 获取基础 URL，优先使用环境变量 BASE_URL，否则用局域网 IP + 端口
function getBaseURL() {
    return process.env.BASE_URL || `http://${getLocalIP()}:${port}`;
}

// 接口 1：生成 DOCX
app.post('/generate', async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ error: 'html 字段不能为空' });

        // 文件名用时间戳
        const filename = `doc_${Date.now()}.docx`;
        const filepath = path.join(docsDir, filename);

        // 生成 DOCX
        const docxBlob = HtmlDocx.asBlob(html);
        const arrayBuffer = await docxBlob.arrayBuffer();
        writeFileSync(filepath, Buffer.from(arrayBuffer));

        // 返回访问链接
        const fileUrl = `${getBaseURL()}/download/${filename}`;
        res.json({ fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '生成文档失败' });
    }
});

// 接口 2：下载 DOCX
app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(docsDir, filename);

    if (!existsSync(filepath)) {
        return res.status(404).send('文件不存在');
    }

    res.download(filepath, filename, (err) => {
        if (err) console.error(err);
    });
});

// 启动服务
app.listen(port, '0.0.0.0', () => {
    console.log(`DOCX 服务已启动: ${getBaseURL()}`);
    console.log(`docs 存储路径: ${docsDir}`);
});