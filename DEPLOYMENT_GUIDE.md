# 雨夜山庄谜案 - 部署指南

本指南将帮助您将这个侦探游戏打包并分享给其他人体验。

## 项目概述

这是一个基于Web技术的侦探推理游戏，具有以下特点：
- 纯前端项目，使用HTML、CSS、JavaScript开发
- 集成AI对话系统，支持本地Ollama和在线DeepSeek API
- 包含完整的游戏逻辑、角色系统、线索收集和指证系统

## 部署方式选择

### 方式一：在线部署（推荐）

#### 1. Vercel部署（免费，最简单）

**步骤：**
1. 将项目上传到GitHub仓库
2. 访问 [vercel.com](https://vercel.com)
3. 使用GitHub账号登录
4. 点击"New Project"，选择您的GitHub仓库
5. 部署设置保持默认，点击"Deploy"
6. 等待部署完成，获得在线访问链接

**优点：**
- 完全免费
- 自动HTTPS
- 全球CDN加速
- 支持自定义域名

#### 2. Netlify部署（免费）

**步骤：**
1. 访问 [netlify.com](https://netlify.com)
2. 注册并登录账号
3. 拖拽整个项目文件夹到Netlify部署区域
4. 等待部署完成

#### 3. GitHub Pages部署（免费）

**步骤：**
1. 将项目上传到GitHub仓库
2. 进入仓库设置 → Pages
3. 选择部署分支（通常是main）
4. 等待部署完成

### 方式二：本地部署

#### 1. 简单HTTP服务器

**使用Python（推荐）：**
```bash
# 进入项目目录
cd /path/to/detectivegame

# Python 3
python -m http.server 8080

# 或 Python 2
python -m SimpleHTTPServer 8080
```

**使用Node.js：**
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**使用其他工具：**
```bash
# 使用live-server
npx live-server --port=8080

# 使用serve
npx serve -s . -l 8080
```

#### 2. 打包为桌面应用

**使用Electron：**
1. 安装Electron
```bash
npm install electron --save-dev
```

2. 创建main.js文件
3. 配置package.json
4. 打包为可执行文件

## AI服务配置

### 选项一：使用本地Ollama（推荐给技术用户）

**优点：**
- 完全离线运行
- 数据隐私安全
- 无API费用

**配置步骤：**
1. 安装Ollama：访问 [ollama.com](https://ollama.com) 下载
2. 下载推荐模型：
```bash
ollama pull qwen2:1.5b
```
3. 启动Ollama服务
4. 游戏会自动连接本地服务

### 选项二：使用在线API（适合普通用户）

**当前配置：**
- 已配置DeepSeek API
- 需要有效的API密钥

**注意：** 当前代码中包含API密钥，部署前请：
1. 替换为您自己的API密钥
2. 或移除API密钥，让用户自行配置

## 部署前准备

### 1. 清理敏感信息

**移除API密钥：**
编辑 `js/config/aiConfig.js`：
```javascript
export const AIConfig = {
    deepseek: {
        baseUrl: 'https://api.deepseek.com',
        apiKey: '', // 清空或提示用户输入
        model: 'deepseek-chat'
    }
};
```

### 2. 优化文件结构

**删除不必要的文件：**
```bash
# 删除测试文件
rm test_*.html
rm test_*.js

# 删除开发文档
rm -rf to_fix/
rm *.md（保留README.md）

# 删除开发依赖
rm package-lock.json
```

### 3. 创建用户说明

创建 `USER_GUIDE.md`：
```markdown
# 雨夜山庄谜案 - 用户指南

## 游戏介绍
这是一个AI驱动的侦探推理游戏...

## 如何开始
1. 打开index.html
2. 配置AI服务（可选）
3. 开始游戏

## AI配置说明
...
```

## 分发方式

### 1. 压缩包分发

**创建分发包：**
```bash
# 创建干净的分发目录
mkdir detectivegame-release
cp -r assets/ css/ js/ index.html detectivegame-release/
cp USER_GUIDE.md detectivegame-release/

# 压缩
zip -r detectivegame-v1.0.zip detectivegame-release/
```

### 2. 在线链接分发

部署到在线平台后，直接分享链接：
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`
- GitHub Pages: `https://username.github.io/repository-name`

## 用户体验优化

### 1. 添加加载提示

在index.html中添加：
```html
<div id="loading-screen">
    <div class="loading-text">游戏加载中...</div>
    <div class="loading-tips">
        <p>首次启动可能需要较长时间</p>
        <p>请确保网络连接正常</p>
    </div>
</div>
```

### 2. 添加错误处理

为AI服务连接失败添加友好提示。

### 3. 移动端适配

确保游戏在手机和平板上正常运行。

## 技术支持

### 常见问题

**Q: 游戏无法启动？**
A: 检查浏览器控制台错误，确保所有文件路径正确。

**Q: AI对话无响应？**
A: 检查AI服务配置，确保Ollama运行或API密钥有效。

**Q: 游戏卡顿？**
A: 尝试使用性能更好的AI模型或减少对话频率。

### 联系方式

如需技术支持，请提供：
1. 浏览器类型和版本
2. 错误信息截图
3. 控制台日志

## 版本更新

### 当前版本：v1.0
- 完整的游戏流程
- AI对话系统
- 指证系统
- 多结局支持

### 后续计划
- 更多案例
- 多语言支持
- 音效优化
- 移动端专版

---

**祝您游戏愉快！**