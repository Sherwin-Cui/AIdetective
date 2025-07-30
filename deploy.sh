#!/bin/bash

# 雨夜山庄谜案 - 部署脚本
# 使用方法: ./deploy.sh [选项]

set -e

echo "🎮 雨夜山庄谜案 - 部署工具"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印彩色信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    
    if ! command -v zip &> /dev/null; then
        print_error "zip 命令未找到，请安装 zip 工具"
        exit 1
    fi
    
    print_success "依赖检查完成"
}

# 清理敏感信息
clean_sensitive_data() {
    print_info "清理敏感信息..."
    
    # 备份原始配置
    if [ -f "js/config/aiConfig.js" ]; then
        cp "js/config/aiConfig.js" "js/config/aiConfig.js.backup"
        
        # 清空API密钥
        sed -i.tmp "s/apiKey: 'sk-[^']*'/apiKey: ''/g" "js/config/aiConfig.js"
        rm "js/config/aiConfig.js.tmp" 2>/dev/null || true
        
        print_success "API密钥已清理"
    fi
}

# 恢复敏感信息
restore_sensitive_data() {
    print_info "恢复原始配置..."
    
    if [ -f "js/config/aiConfig.js.backup" ]; then
        mv "js/config/aiConfig.js.backup" "js/config/aiConfig.js"
        print_success "原始配置已恢复"
    fi
}

# 创建发布包
create_release_package() {
    local version=${1:-"1.0"}
    local release_dir="detectivegame-v${version}"
    
    print_info "创建发布包 v${version}..."
    
    # 清理旧的发布目录
    rm -rf "$release_dir" "${release_dir}.zip" 2>/dev/null || true
    
    # 创建发布目录
    mkdir -p "$release_dir"
    
    # 复制核心文件
    print_info "复制游戏文件..."
    cp -r assets/ "$release_dir/"
    cp -r css/ "$release_dir/"
    cp -r js/ "$release_dir/"
    cp index.html "$release_dir/"
    cp favicon.ico "$release_dir/" 2>/dev/null || true
    
    # 复制文档
    cp DEPLOYMENT_GUIDE.md "$release_dir/" 2>/dev/null || true
    cp README.md "$release_dir/" 2>/dev/null || true
    
    # 创建用户指南
    cat > "$release_dir/USER_GUIDE.md" << 'EOF'
# 雨夜山庄谜案 - 用户指南

## 快速开始

### 方法一：直接打开（推荐）
1. 双击 `index.html` 文件
2. 在浏览器中开始游戏

### 方法二：本地服务器
如果遇到跨域问题，请使用本地服务器：

**使用Python：**
```bash
python -m http.server 8080
```
然后访问 http://localhost:8080

## AI配置

游戏支持两种AI服务：

### 1. 本地Ollama（推荐）
- 下载安装：https://ollama.com
- 安装模型：`ollama pull qwen2:1.5b`
- 启动服务后游戏自动连接

### 2. 在线API
- 需要配置API密钥
- 编辑 `js/config/aiConfig.js` 文件
- 填入您的API密钥

## 游戏说明

这是一个AI驱动的侦探推理游戏：
- 🔍 调查现场，收集线索
- 💬 与NPC对话，获取信息
- 🧩 推理分析，找出真相
- ⚖️ 指证凶手，揭示结局

## 技术支持

如遇问题，请检查：
1. 浏览器控制台是否有错误
2. AI服务是否正常运行
3. 网络连接是否正常

祝您游戏愉快！
EOF
    
    # 清理测试文件
    print_info "清理测试文件..."
    find "$release_dir" -name "test_*.html" -delete 2>/dev/null || true
    find "$release_dir" -name "test_*.js" -delete 2>/dev/null || true
    find "$release_dir" -name "debug_*.html" -delete 2>/dev/null || true
    rm -rf "$release_dir/to_fix" 2>/dev/null || true
    rm -rf "$release_dir/md" 2>/dev/null || true
    rm -f "$release_dir/package-lock.json" 2>/dev/null || true
    rm -f "$release_dir/eslint.config.js" 2>/dev/null || true
    rm -f "$release_dir/.eslintrc.json" 2>/dev/null || true
    
    # 创建压缩包
    print_info "创建压缩包..."
    zip -r "${release_dir}.zip" "$release_dir" > /dev/null
    
    # 显示结果
    local size=$(du -h "${release_dir}.zip" | cut -f1)
    print_success "发布包创建完成：${release_dir}.zip (${size})"
    
    # 清理临时目录
    rm -rf "$release_dir"
}

# 启动本地服务器
start_local_server() {
    local port=${1:-8080}
    
    print_info "启动本地服务器 (端口: $port)..."
    
    if command -v python3 &> /dev/null; then
        print_success "服务器已启动: http://localhost:$port"
        print_info "按 Ctrl+C 停止服务器"
        python3 -m http.server $port
    elif command -v python &> /dev/null; then
        print_success "服务器已启动: http://localhost:$port"
        print_info "按 Ctrl+C 停止服务器"
        python -m SimpleHTTPServer $port
    else
        print_error "Python 未安装，无法启动服务器"
        print_info "请安装 Python 或使用其他方式运行游戏"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -p, --package [版本]    创建发布包 (默认版本: 1.0)"
    echo "  -s, --server [端口]     启动本地服务器 (默认端口: 8080)"
    echo "  -c, --clean             清理敏感信息"
    echo "  -r, --restore           恢复原始配置"
    echo ""
    echo "示例:"
    echo "  $0 -p 1.1               创建 v1.1 发布包"
    echo "  $0 -s 3000              在端口 3000 启动服务器"
    echo "  $0 -c                   清理 API 密钥"
}

# 主函数
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            ;;
        -p|--package)
            check_dependencies
            clean_sensitive_data
            create_release_package "${2:-1.0}"
            restore_sensitive_data
            ;;
        -s|--server)
            start_local_server "${2:-8080}"
            ;;
        -c|--clean)
            clean_sensitive_data
            ;;
        -r|--restore)
            restore_sensitive_data
            ;;
        "")
            echo "请选择操作:"
            echo "1. 创建发布包"
            echo "2. 启动本地服务器"
            echo "3. 显示帮助"
            read -p "请输入选项 (1-3): " choice
            
            case $choice in
                1)
                    read -p "请输入版本号 (默认: 1.0): " version
                    check_dependencies
                    clean_sensitive_data
                    create_release_package "${version:-1.0}"
                    restore_sensitive_data
                    ;;
                2)
                    read -p "请输入端口号 (默认: 8080): " port
                    start_local_server "${port:-8080}"
                    ;;
                3)
                    show_help
                    ;;
                *)
                    print_error "无效选项"
                    exit 1
                    ;;
            esac
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 捕获中断信号
trap 'print_info "\n正在清理..."; restore_sensitive_data; exit 0' INT

# 运行主函数
main "$@"