// 菜单系统
import { GameState } from './GameState.js';
import { UIManager } from '../ui/UIManager.js';
import { MusicSystem } from './MusicSystem.js';
import { TimeSystem } from './TimeSystem.js';

export const MenuSystem = {
    mainMenuBtn: null,
    mainMenuPanel: null,
    hintPanel: null,
    hintText: null,
    
    // 初始化菜单系统
    init() {
        console.log('初始化菜单系统');
        
        // 获取DOM元素
        this.mainMenuBtn = document.getElementById('main-menu-btn');
        this.mainMenuPanel = document.getElementById('main-menu-panel');
        this.hintPanel = document.getElementById('hint-panel');
        this.hintText = document.getElementById('hint-text');
        
        // 绑定事件监听器
        this.bindEvents();
    },
    
    // 绑定事件监听器
    bindEvents() {
        // 主菜单按钮点击事件
        if (this.mainMenuBtn) {
            this.mainMenuBtn.addEventListener('click', () => {
                this.toggleMainMenu();
            });
        }
        
        // 返回游戏按钮点击事件
        const resumeBtn = document.getElementById('resume-game');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.closeMainMenu();
            });
        }
        
        // 重新游玩按钮点击事件
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                // 使用自定义确认对话框
                UIManager.showConfirmDialog(
                    '确定要重新开始吗？当前进度将丢失！\n\n点击确定将清除所有游戏数据并重新开始。',
                    () => {
                        console.log('用户确认重新开始游戏');
                        try {
                            MusicSystem.stop(); // 停止音乐
                            this.resetGameState();
                        } catch (error) {
                            console.error('状态重置失败，尝试强制刷新:', error);
                            this.forceRestart();
                        }
                    },
                    () => {
                        console.log('用户取消重新开始');
                    }
                );
            });
        }
        
        // 查看提示按钮点击事件
        const hintsBtn = document.getElementById('view-hints');
        if (hintsBtn) {
            hintsBtn.addEventListener('click', () => {
                this.showHints();
            });
        }
        
        // 开发者工具按钮点击事件
        const promptTestBtn = document.getElementById('prompt-test');
        if (promptTestBtn) {
            promptTestBtn.addEventListener('click', () => {
                window.open('test_prompt_enhancement.html', '_blank');
            });
        }
        
        const consistencyTestBtn = document.getElementById('consistency-test');
        if (consistencyTestBtn) {
            consistencyTestBtn.addEventListener('click', () => {
                window.open('test_character_consistency.html', '_blank');
            });
        }
        
        const integrationReportBtn = document.getElementById('integration-report');
        if (integrationReportBtn) {
            integrationReportBtn.addEventListener('click', () => {
                window.open('final_integration_test.html', '_blank');
            });
        }
        
        const aiConfigBtn = document.getElementById('ai-config');
        if (aiConfigBtn) {
            aiConfigBtn.addEventListener('click', () => {
                window.open('AI_SERVICE_CONFIG.md', '_blank');
            });
        }
        
        // 提示面板返回按钮点击事件
        const hintBackBtn = document.getElementById('hint-back-btn');
        if (hintBackBtn) {
            hintBackBtn.addEventListener('click', () => {
                this.closeHintPanel();
                this.openMainMenu();
            });
        }
        
        // 点击遮罩关闭菜单
        if (this.mainMenuPanel) {
            this.mainMenuPanel.addEventListener('click', (e) => {
                if (e.target === this.mainMenuPanel) {
                    this.closeMainMenu();
                }
            });
        }
        
        if (this.hintPanel) {
            this.hintPanel.addEventListener('click', (e) => {
                if (e.target === this.hintPanel) {
                    this.closeHintPanel();
                    this.openMainMenu();
                }
            });
        }
        
        // ESC键控制菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.hintPanel && this.hintPanel.style.display === 'flex') {
                    this.closeHintPanel();
                    this.openMainMenu();
                } else if (this.mainMenuPanel && this.mainMenuPanel.style.display === 'flex') {
                    this.closeMainMenu();
                } else {
                    this.openMainMenu();
                }
            }
        });
    },
    
    // 切换主菜单显示状态
    toggleMainMenu() {
        if (this.mainMenuPanel && this.mainMenuPanel.style.display === 'flex') {
            this.closeMainMenu();
        } else {
            this.openMainMenu();
        }
    },
    
    // 打开主菜单
    openMainMenu() {
        // 关闭所有其他模态框
        UIManager.hideAllModals();
        // 显示主菜单
        if (this.mainMenuPanel) {
            this.mainMenuPanel.style.display = 'flex';
        }
    },
    
    // 关闭主菜单
    closeMainMenu() {
        if (this.mainMenuPanel) {
            this.mainMenuPanel.style.display = 'none';
        }
    },
    
    // 重置游戏状态
    resetGameState() {
        console.log('重置游戏状态...');
        
        // 停止并重置时间系统
        TimeSystem.reset();
        
        // 清除所有游戏数据
        this.clearAllGameData();
        
        // 重置游戏状态
        GameState.reset();
        
        // 重新启动时间系统
        TimeSystem.startTimer();
    },
    
    // 清除所有游戏数据
    clearAllGameData() {
        console.log('清除所有游戏数据...');
        
        try {
            // 1. 清除游戏状态
            localStorage.removeItem('rainyNightMystery');
            console.log('✓ 游戏存档已清除');
            
            // 2. 清除AI对话历史
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('dialogue_history_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`✓ 清除对话历史: ${key}`);
            });
            
            // 3. 清除对话计数（如果存在）
            if (window.DialogueCounter) {
                window.DialogueCounter.counts = {};
                console.log('✓ 对话计数已重置');
            }
            
            // 4. 清除线索管理器状态（如果存在）
            if (window.AIClueManager) {
                window.AIClueManager.triggeredClues = new Set();
                console.log('✓ 线索触发状态已重置');
            }
            
            // 5. 清除对话分析器状态（如果存在）
            if (window.DialogueAnalyzer) {
                window.DialogueAnalyzer.keywordCounts = {};
                window.DialogueAnalyzer.dialogueRounds = {};
                console.log('✓ 对话分析器已重置');
            }
            
            // 6. 清除对话历史管理器
            if (window.DialogueHistoryManager && window.DialogueHistoryManager.clearAllHistory) {
                window.DialogueHistoryManager.clearAllHistory();
                console.log('✓ AI对话历史已清除');
            }
            
            console.log('所有游戏数据清除完成');
            
        } catch (error) {
            console.error('清除游戏数据时出错:', error);
            throw error;
        }
    },
    
    // 强制重启
    forceRestart() {
        try {
            window.location.reload(true);
        } catch (e1) {
            try {
                location.reload();
            } catch (e2) {
                try {
                    window.location.href = window.location.href;
                } catch (e3) {
                    try {
                        document.location.reload();
                    } catch (e4) {
                        alert('请手动刷新页面 (Ctrl+F5 或 Cmd+R)');
                    }
                }
            }
        }
    },
    
    // 显示提示
    showHints() {
        // 关闭主菜单
        this.closeMainMenu();
        
        // 根据已收集线索数量显示不同提示
        const clueCount = GameState.acquiredClues.length;
        let hint = '';
        
        if (clueCount < 3) {
            hint = `
                <p>游戏初期提示：</p>
                <ul>
                    <li>仔细调查每个场景，寻找隐藏的线索</li>
                    <li>与所有NPC对话，获取更多信息</li>
                    <li>注意观察细节，它们可能很重要</li>
                </ul>
            `;
        } else if (clueCount < 6) {
            hint = `
                <p>调查进展提示：</p>
                <ul>
                    <li>你已经收集了一些线索，试着将它们联系起来</li>
                    <li>某些线索可能需要通过对话进一步验证</li>
                    <li>不要忽略任何看似无关紧要的细节</li>
                </ul>
            `;
        } else if (clueCount < 12) {
            hint = `
                <p>深入调查提示：</p>
                <ul>
                    <li>你已经掌握了相当多的线索，开始推理吧</li>
                    <li>尝试找出线索之间的关联性</li>
                    <li>凶手可能就在你身边的人之中</li>
                    <li>注意每个人的动机和机会</li>
                </ul>
            `;
        } else {
            hint = `
                <p>最终推理提示：</p>
                <ul>
                    <li>你已经收集了大部分线索</li>
                    <li>考虑谁有动机、手段和机会</li>
                    <li>注意遗嘱的内容和受益人</li>
                    <li>想想谁知道死者的用药情况</li>
                    <li>酒窖是关键地点</li>
                </ul>
            `;
        }
        
        // 显示提示内容
        if (this.hintText) {
            this.hintText.innerHTML = hint;
        }
        
        // 显示提示面板
        if (this.hintPanel) {
            this.hintPanel.style.display = 'flex';
        }
    },
    
    // 关闭提示面板
    closeHintPanel() {
        if (this.hintPanel) {
            this.hintPanel.style.display = 'none';
        }
    }
};