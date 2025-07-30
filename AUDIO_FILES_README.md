# 音频文件说明

## 为什么音频文件没有上传到GitHub？

由于GitHub对单个文件大小有限制（100MB），而我们的游戏音频文件（特别是 `assets/BGM/opening/opening.mp3` 约60MB）超过了合理的上传大小，因此这些文件被添加到了 `.gitignore` 中。

## 音频文件列表

以下音频文件需要单独处理：

```
assets/BGM/opening/opening.mp3 (60MB)
assets/BGM/accusation/accusation.mp3 (5.9MB)
assets/assets/大野克夫 - 「名探偵コナン」~メインテーマ.mp3 (5.9MB)
assets/BGM/confession/confession.mp3 (5.3MB)
assets/BGM/all_scenes/scene3.mp3 (4.8MB)
assets/BGM/be/be.mp3 (4.2MB)
assets/BGM/all_scenes/scene2.mp3 (4.0MB)
assets/BGM/all_scenes/scene4.mp3 (3.3MB)
assets/BGM/all_scenes/scene1.mp3 (2.2MB)
```

## 解决方案

### 方案1：使用Git LFS（推荐）

1. 安装Git LFS：
   ```bash
   git lfs install
   ```

2. 跟踪音频文件：
   ```bash
   git lfs track "*.mp3"
   git add .gitattributes
   ```

3. 添加音频文件：
   ```bash
   git add assets/BGM/
   git commit -m "Add audio files with Git LFS"
   ```

### 方案2：压缩音频文件

1. 使用音频压缩工具减小文件大小
2. 考虑使用更高效的音频格式（如OGG）
3. 降低音频质量/比特率

### 方案3：使用外部存储

1. 将音频文件上传到云存储（如阿里云OSS、腾讯云COS）
2. 在代码中使用URL引用
3. 提供下载脚本

### 方案4：分离音频包

1. 创建单独的音频资源仓库
2. 使用Git Submodule管理
3. 或提供单独的音频包下载

## 当前状态

- ✅ 代码已成功上传到GitHub
- ❌ 音频文件需要单独处理
- ✅ 游戏核心功能完整
- ✅ 可以正常部署（需要添加音频文件）

## 部署说明

如果要完整部署游戏，需要：

1. 克隆代码仓库
2. 按照上述方案之一添加音频文件
3. 运行 `npm install`
4. 启动服务器

注意：没有音频文件的情况下，游戏仍然可以正常运行，只是没有背景音乐。