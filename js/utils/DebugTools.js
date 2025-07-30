// js/utils/DebugTools.js

/**
 * 调试工具集
 * 提供各种调试和测试功能
 */
export class DebugTools {
    constructor() {
        this.enabled = true;
        this.logLevel = 'debug'; // debug, info, warn, error
        this.performanceMarkers = {};
    }

    /**
     * 初始化调试工具
     */
    init() {
        // 在开发环境下自动启用
        this.enabled = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
        
        if (this.enabled) {
            this.setupConsoleCommands();
            this.setupKeyboardShortcuts();
            console.log('🔧 调试工具已启用');
            console.log('输入 help() 查看可用命令');
        }
    }

    /**
     * 设置控制台命令
     */
    setupConsoleCommands() {
        // 基础调试命令
        window.help = () => this.showHelp();
        window.debug = this;
        
        // 游戏状态相关
        window.showGameState = () => this.showGameState();
        window.resetGame = () => this.resetGame();
        window.saveGame = () => this.saveGame();
        window.loadGame = () => this.loadGame();
        
        // 场景相关
        window.changeScene = (sceneId) => this.changeScene(sceneId);
        window.showScenes = () => this.showScenes();
        
        // NPC对话相关
        window.testDialogue = (npcId, message) => this.testDialogue(npcId, message);
        window.showNPCs = () => this.showNPCs();
        window.resetDialogue = (npcId) => this.resetDialogue(npcId);
        
        // 线索相关
        window.addClue = (clueId) => this.addClue(clueId);
        window.showClues = () => this.showClues();
        window.showClueStatus = () => this.showClueStatus();
        
        // AI相关
        window.testAI = () => this.testAIConnection();
        window.showAIHistory = (npcId) => this.showAIHistory(npcId);
        window.clearAIHistory = () => this.clearAIHistory();
        
        // 性能相关
        window.showPerformance = () => this.showPerformance();
        window.startPerf = (label) => this.startPerformance(label);
        window.endPerf = (label) => this.endPerformance(label);
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D: 切换调试面板
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggleDebugPanel();
            }
            
            // Ctrl+Shift+S: 快速保存
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                this.quickSave();
            }
            
            // Ctrl+Shift+L: 快速加载
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                this.quickLoad();
            }
        });
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        const help = `
=== 雨夜山庄谜案 调试命令 ===

【游戏状态】
  showGameState()     - 显示当前游戏状态
  resetGame()         - 重置游戏
  saveGame()          - 保存游戏
  loadGame()          - 加载游戏

【场景控制】
  changeScene(id)     - 切换到指定场景
  showScenes()        - 显示所有场景

【NPC对话】
  testDialogue(npc, msg) - 测试对话
  showNPCs()          - 显示所有NPC
  resetDialogue(npc)  - 重置指定NPC对话

【线索管理】
  addClue(id)         - 添加线索
  showClues()         - 显示所有线索
  showClueStatus()    - 显示线索触发状态

【AI调试】
  testAI()            - 测试AI连接
  showAIHistory(npc)  - 显示AI对话历史
  clearAIHistory()    - 清除所有AI历史

【性能监控】
  showPerformance()   - 显示性能统计
  startPerf(label)    - 开始性能计时
  endPerf(label)      - 结束性能计时

【快捷键】
  Ctrl+Shift+D        - 切换调试面板
  Ctrl+Shift+S        - 快速保存
  Ctrl+Shift+L        - 快速加载
        `;
        console.log(help);
    }

    /**
     * 显示游戏状态
     */
    showGameState() {
        if (window.GameState) {
            console.group('🎮 游戏状态');
            console.log('当前场景:', window.GameState.currentScene);
            console.log('游戏阶段:', window.GameState.gamePhase);
            console.log('获得线索:', window.GameState.acquiredClues.length, '个');
            console.log('对话次数:', window.GameState.npcDialogueCount);
            console.log('调查地点:', Object.keys(window.GameState.investigatedLocations || {}).length, '处');
            console.groupEnd();
        } else {
            console.error('GameState 未初始化');
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
            localStorage.removeItem('rainyNightMystery');
            this.clearAIHistory();
            console.log('✅ 游戏已重置');
            window.location.reload();
        }
    }

    /**
     * 显示所有场景
     */
    showScenes() {
        if (window.SceneData) {
            console.group('🏠 所有场景');
            Object.entries(window.SceneData).forEach(([id, scene]) => {
                console.log(`${id}: ${scene.name} - ${scene.description}`);
            });
            console.groupEnd();
        }
    }

    /**
     * 切换场景
     */
    changeScene(sceneId) {
        if (window.SceneSystem && window.SceneData[sceneId]) {
            window.SceneSystem.changeScene(sceneId);
            console.log(`✅ 已切换到场景: ${sceneId}`);
        } else {
            console.error(`❌ 无效的场景ID: ${sceneId}`);
        }
    }

    /**
     * 显示所有NPC
     */
    showNPCs() {
        if (window.NpcData) {
            console.group('👥 所有NPC');
            Object.entries(window.NpcData).forEach(([id, npc]) => {
                const count = window.GameState?.npcDialogueCount?.[id] || 0;
                console.log(`${id}: ${npc.name} (${npc.identity}) - 已对话${count}次`);
            });
            console.groupEnd();
        }
    }

    /**
     * 测试对话
     */
    async testDialogue(npcId, message = '你好') {
        console.group(`💬 测试对话: ${npcId}`);
        console.log('玩家:', message);
        
        if (window.debugAI && window.debugAI.testDialogue) {
            const response = await window.debugAI.testDialogue(npcId, message);
            console.log('NPC回复:', response);
        } else {
            console.error('AI系统未初始化');
        }
        
        console.groupEnd();
    }

    /**
     * 显示线索状态
     */
    showClueStatus() {
        if (window.debugClues) {
            window.debugClues.showTriggerStatus();
        } else {
            console.group('📋 线索状态');
            const acquired = window.GameState?.acquiredClues || [];
            console.log('已获得线索:', acquired.length);
            acquired.forEach(clue => {
                console.log(`- ${clue.id}: ${clue.name}`);
            });
            console.groupEnd();
        }
    }

    /**
     * 添加线索
     */
    addClue(clueId) {
        if (window.ClueSystem && window.ClueSystem.addClueById) {
            const result = window.ClueSystem.addClueById(clueId);
            if (result) {
                console.log(`✅ 已添加线索: ${clueId}`);
            } else {
                console.log(`❌ 添加线索失败: ${clueId}`);
            }
        }
    }

    /**
     * 测试AI连接
     */
    async testAIConnection() {
        console.log('🤖 测试AI连接...');
        if (window.debugAI && window.debugAI.testConnection) {
            await window.debugAI.testConnection();
        } else {
            console.error('AI调试工具未初始化');
        }
    }

    /**
     * 清除AI历史
     */
    clearAIHistory() {
        if (window.DialogueHistoryManager) {
            window.DialogueHistoryManager.clearAllHistory();
            console.log('✅ AI对话历史已清除');
        }
    }

    /**
     * 性能监控
     */
    startPerformance(label) {
        this.performanceMarkers[label] = performance.now();
        console.log(`⏱️ 开始计时: ${label}`);
    }

    endPerformance(label) {
        if (this.performanceMarkers[label]) {
            const duration = performance.now() - this.performanceMarkers[label];
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            delete this.performanceMarkers[label];
        }
    }

    showPerformance() {
        console.group('📊 性能统计');
        
        // 内存使用
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
            console.log(`内存: ${used}MB / ${total}MB`);
        }
        
        // 加载时间
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`页面加载: ${loadTime}ms`);
        
        // 游戏数据大小
        const gameStateSize = new Blob([JSON.stringify(window.GameState || {})]).size;
        console.log(`游戏状态大小: ${(gameStateSize / 1024).toFixed(2)}KB`);
        
        console.groupEnd();
    }

    /**
     * 创建调试面板
     */
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 15px;
            border: 2px solid #daa520;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
        `;
        
        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #daa520;">调试信息</h3>
            <div id="debug-content"></div>
            <button onclick="debug.toggleDebugPanel()" style="margin-top: 10px;">关闭</button>
        `;
        
        document.body.appendChild(panel);
    }

    /**
     * 切换调试面板
     */
    toggleDebugPanel() {
        let panel = document.getElementById('debug-panel');
        if (!panel) {
            this.createDebugPanel();
            panel = document.getElementById('debug-panel');
        }
        
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.updateDebugPanel();
        } else {
            panel.style.display = 'none';
        }
    }

    /**
     * 更新调试面板内容
     */
    updateDebugPanel() {
        const content = document.getElementById('debug-content');
        if (!content) return;
        
        const state = window.GameState || {};
        const scene = window.SceneData?.[state.currentScene];
        
        content.innerHTML = `
            <p><strong>场景:</strong> ${scene?.name || '未知'}</p>
            <p><strong>阶段:</strong> ${state.gamePhase || 1}</p>
            <p><strong>线索:</strong> ${state.acquiredClues?.length || 0}个</p>
            <p><strong>FPS:</strong> <span id="debug-fps">计算中...</span></p>
        `;
        
        // FPS计算
        this.updateFPS();
    }

    /**
     * 更新FPS显示
     */
    updateFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const updateLoop = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                const fpsElement = document.getElementById('debug-fps');
                if (fpsElement) {
                    fpsElement.textContent = fps;
                }
                frames = 0;
                lastTime = currentTime;
            }
            
            if (document.getElementById('debug-panel')?.style.display !== 'none') {
                requestAnimationFrame(updateLoop);
            }
        };
        
        requestAnimationFrame(updateLoop);
    }

    /**
     * 日志输出
     */
    log(message, level = 'debug') {
        if (!this.enabled) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            switch (level) {
                case 'debug':
                    console.log(`${prefix} ${message}`);
                    break;
                case 'info':
                    console.info(`${prefix} ${message}`);
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`);
                    break;
                case 'error':
                    console.error(`${prefix} ${message}`);
                    break;
            }
        }
    }
}

// 创建单例实例
export const debugTools = new DebugTools();

// 自动初始化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        debugTools.init();
    });
    
    // 暴露到全局
    window.DebugTools = DebugTools;
    window.debugTools = debugTools;
}