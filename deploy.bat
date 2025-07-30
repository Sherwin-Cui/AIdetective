@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🎮 雨夜山庄谜案 - 部署工具
echo ================================
echo.

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: 函数定义
goto :main

:print_info
echo %BLUE%ℹ️  %~1%NC%
goto :eof

:print_success
echo %GREEN%✅ %~1%NC%
goto :eof

:print_warning
echo %YELLOW%⚠️  %~1%NC%
goto :eof

:print_error
echo %RED%❌ %~1%NC%
goto :eof

:check_dependencies
call :print_info "检查系统依赖..."

:: 检查PowerShell
powershell -Command "Get-Command Compress-Archive" >nul 2>&1
if errorlevel 1 (
    call :print_error "PowerShell 压缩功能不可用"
    exit /b 1
)

call :print_success "依赖检查完成"
goto :eof

:clean_sensitive_data
call :print_info "清理敏感信息..."

if exist "js\config\aiConfig.js" (
    copy "js\config\aiConfig.js" "js\config\aiConfig.js.backup" >nul
    
    :: 使用PowerShell替换API密钥
    powershell -Command "(Get-Content 'js\config\aiConfig.js') -replace 'apiKey: ''sk-[^'']*''', 'apiKey: ''''' | Set-Content 'js\config\aiConfig.js'"
    
    call :print_success "API密钥已清理"
)
goto :eof

:restore_sensitive_data
call :print_info "恢复原始配置..."

if exist "js\config\aiConfig.js.backup" (
    move "js\config\aiConfig.js.backup" "js\config\aiConfig.js" >nul
    call :print_success "原始配置已恢复"
)
goto :eof

:create_release_package
set "version=%~1"
if "%version%"=="" set "version=1.0"
set "release_dir=detectivegame-v%version%"

call :print_info "创建发布包 v%version%..."

:: 清理旧的发布目录
if exist "%release_dir%" rmdir /s /q "%release_dir%" >nul 2>&1
if exist "%release_dir%.zip" del "%release_dir%.zip" >nul 2>&1

:: 创建发布目录
mkdir "%release_dir%" >nul 2>&1

:: 复制核心文件
call :print_info "复制游戏文件..."
xcopy "assets" "%release_dir%\assets\" /e /i /q >nul
xcopy "css" "%release_dir%\css\" /e /i /q >nul
xcopy "js" "%release_dir%\js\" /e /i /q >nul
copy "index.html" "%release_dir%\" >nul
if exist "favicon.ico" copy "favicon.ico" "%release_dir%\" >nul

:: 复制文档
if exist "DEPLOYMENT_GUIDE.md" copy "DEPLOYMENT_GUIDE.md" "%release_dir%\" >nul
if exist "README.md" copy "README.md" "%release_dir%\" >nul

:: 创建用户指南
echo # 雨夜山庄谜案 - 用户指南 > "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ## 快速开始 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ### 方法一：直接打开（推荐） >> "%release_dir%\USER_GUIDE.md"
echo 1. 双击 `index.html` 文件 >> "%release_dir%\USER_GUIDE.md"
echo 2. 在浏览器中开始游戏 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ### 方法二：本地服务器 >> "%release_dir%\USER_GUIDE.md"
echo 如果遇到跨域问题，请使用本地服务器： >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo **使用Python：** >> "%release_dir%\USER_GUIDE.md"
echo ```bash >> "%release_dir%\USER_GUIDE.md"
echo python -m http.server 8080 >> "%release_dir%\USER_GUIDE.md"
echo ``` >> "%release_dir%\USER_GUIDE.md"
echo 然后访问 http://localhost:8080 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ## AI配置 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo 游戏支持两种AI服务： >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ### 1. 本地Ollama（推荐） >> "%release_dir%\USER_GUIDE.md"
echo - 下载安装：https://ollama.com >> "%release_dir%\USER_GUIDE.md"
echo - 安装模型：`ollama pull qwen2:1.5b` >> "%release_dir%\USER_GUIDE.md"
echo - 启动服务后游戏自动连接 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ### 2. 在线API >> "%release_dir%\USER_GUIDE.md"
echo - 需要配置API密钥 >> "%release_dir%\USER_GUIDE.md"
echo - 编辑 `js/config/aiConfig.js` 文件 >> "%release_dir%\USER_GUIDE.md"
echo - 填入您的API密钥 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ## 游戏说明 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo 这是一个AI驱动的侦探推理游戏： >> "%release_dir%\USER_GUIDE.md"
echo - 🔍 调查现场，收集线索 >> "%release_dir%\USER_GUIDE.md"
echo - 💬 与NPC对话，获取信息 >> "%release_dir%\USER_GUIDE.md"
echo - 🧩 推理分析，找出真相 >> "%release_dir%\USER_GUIDE.md"
echo - ⚖️ 指证凶手，揭示结局 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo ## 技术支持 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo 如遇问题，请检查： >> "%release_dir%\USER_GUIDE.md"
echo 1. 浏览器控制台是否有错误 >> "%release_dir%\USER_GUIDE.md"
echo 2. AI服务是否正常运行 >> "%release_dir%\USER_GUIDE.md"
echo 3. 网络连接是否正常 >> "%release_dir%\USER_GUIDE.md"
echo. >> "%release_dir%\USER_GUIDE.md"
echo 祝您游戏愉快！ >> "%release_dir%\USER_GUIDE.md"

:: 清理测试文件
call :print_info "清理测试文件..."
for %%f in ("%release_dir%\test_*.html" "%release_dir%\test_*.js" "%release_dir%\debug_*.html") do (
    if exist "%%f" del "%%f" >nul 2>&1
)
if exist "%release_dir%\to_fix" rmdir /s /q "%release_dir%\to_fix" >nul 2>&1
if exist "%release_dir%\md" rmdir /s /q "%release_dir%\md" >nul 2>&1
if exist "%release_dir%\package-lock.json" del "%release_dir%\package-lock.json" >nul 2>&1
if exist "%release_dir%\eslint.config.js" del "%release_dir%\eslint.config.js" >nul 2>&1
if exist "%release_dir%\.eslintrc.json" del "%release_dir%\.eslintrc.json" >nul 2>&1

:: 创建压缩包
call :print_info "创建压缩包..."
powershell -Command "Compress-Archive -Path '%release_dir%' -DestinationPath '%release_dir%.zip' -Force" >nul

:: 显示结果
for %%A in ("%release_dir%.zip") do set "size=%%~zA"
set /a "size_mb=!size! / 1024 / 1024"
call :print_success "发布包创建完成：%release_dir%.zip (!size_mb! MB)"

:: 清理临时目录
rmdir /s /q "%release_dir%" >nul 2>&1
goto :eof

:start_local_server
set "port=%~1"
if "%port%"=="" set "port=8080"

call :print_info "启动本地服务器 (端口: %port%)..."

:: 检查Python
python --version >nul 2>&1
if not errorlevel 1 (
    call :print_success "服务器已启动: http://localhost:%port%"
    call :print_info "按 Ctrl+C 停止服务器"
    python -m http.server %port%
    goto :eof
)

:: 检查Python3
python3 --version >nul 2>&1
if not errorlevel 1 (
    call :print_success "服务器已启动: http://localhost:%port%"
    call :print_info "按 Ctrl+C 停止服务器"
    python3 -m http.server %port%
    goto :eof
)

:: 使用PowerShell作为备选
call :print_warning "Python 未安装，尝试使用 PowerShell..."
call :print_success "服务器已启动: http://localhost:%port%"
call :print_info "按 Ctrl+C 停止服务器"
powershell -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:%port%/'); $listener.Start(); Write-Host 'Server running on http://localhost:%port%'; while ($listener.IsListening) { $context = $listener.GetContext(); $response = $context.Response; $response.StatusCode = 200; $response.Close() }"
goto :eof

:show_help
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   -h, --help              显示此帮助信息
echo   -p, --package [版本]    创建发布包 (默认版本: 1.0)
echo   -s, --server [端口]     启动本地服务器 (默认端口: 8080)
echo   -c, --clean             清理敏感信息
echo   -r, --restore           恢复原始配置
echo.
echo 示例:
echo   %~nx0 -p 1.1               创建 v1.1 发布包
echo   %~nx0 -s 3000              在端口 3000 启动服务器
echo   %~nx0 -c                   清理 API 密钥
goto :eof

:main
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
if "%~1"=="-p" goto :package
if "%~1"=="--package" goto :package
if "%~1"=="-s" goto :server
if "%~1"=="--server" goto :server
if "%~1"=="-c" goto :clean
if "%~1"=="--clean" goto :clean
if "%~1"=="-r" goto :restore
if "%~1"=="--restore" goto :restore
if "%~1"=="" goto :interactive

call :print_error "未知选项: %~1"
call :show_help
exit /b 1

:package
call :check_dependencies
call :clean_sensitive_data
call :create_release_package "%~2"
call :restore_sensitive_data
goto :end

:server
call :start_local_server "%~2"
goto :end

:clean
call :clean_sensitive_data
goto :end

:restore
call :restore_sensitive_data
goto :end

:interactive
echo 请选择操作:
echo 1. 创建发布包
echo 2. 启动本地服务器
echo 3. 显示帮助
set /p "choice=请输入选项 (1-3): "

if "%choice%"=="1" (
    set /p "version=请输入版本号 (默认: 1.0): "
    if "!version!"=="" set "version=1.0"
    call :check_dependencies
    call :clean_sensitive_data
    call :create_release_package "!version!"
    call :restore_sensitive_data
) else if "%choice%"=="2" (
    set /p "port=请输入端口号 (默认: 8080): "
    if "!port!"=="" set "port=8080"
    call :start_local_server "!port!"
) else if "%choice%"=="3" (
    call :show_help
) else (
    call :print_error "无效选项"
    exit /b 1
)

:end
echo.
call :print_info "操作完成！"
pause