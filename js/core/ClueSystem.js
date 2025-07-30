// 线索系统
import { GameState } from './GameState.js';
import { ClueData, SceneData, InferenceSystemConfig } from '../config/gameData.js';
import { UIManager } from '../ui/UIManager.js';
import { TimeSystem } from './TimeSystem.js';

export const ClueSystem = {
    currentCategory: 'all',
    
    init() {
        console.log('初始化线索系统');
        this.initModalEventListeners();
    },
    
    initModalEventListeners() {
        // 为模态框内的分类按钮绑定事件
        document.querySelectorAll('#clues-modal .category-tab').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#clues-modal .category-tab').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderCluesGrid();
            });
        });
        
        // 线索面板关闭按钮事件（兼容旧版）
        const closeBtn = document.getElementById('close-clues-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }
    },
    
    // 通过ID添加线索
    addClueById(clueId) {
        // 检查是否是有效的线索ID
        if (!ClueData[clueId]) {
            console.error(`线索ID ${clueId} 不存在`);
            return false;
        }
        
        // 检查是否已经获得
        const existingClue = GameState.acquiredClues.find(c => c.id === clueId);
        if (existingClue) {
            console.log(`线索 ${clueId} 已存在`);
            return false;
        }
        
        // 构建完整的线索对象
        const clueData = ClueData[clueId];
        const clue = {
            id: clueId,
            name: clueData.name,
            description: clueData.description,
            img: clueData.img,
            type: clueData.type,
            acquiredTime: TimeSystem.getCurrentGameTimeString(),
            realTime: new Date().toLocaleString(),
            location: SceneData[GameState.currentScene]?.name || '对话中'
        };
        
        // 添加到已获得线索
        GameState.acquiredClues.push(clue);
        this.updateCluesStats();
        GameState.save();
        
        // 显示获得通知
        this.showClueNotificationEnhanced(clue);
        
        return true;
    },
    
    // 添加线索（物证类）
    addClue(clue) {
        if (!clue || !clue.id) {
            console.error('线索缺少ID');
            return false;
        }
        
        // 检查是否已经获得过该线索
        const existingClue = GameState.acquiredClues.find(c => c.id === clue.id);
        if (!existingClue) {
            // 只有未获得的线索才添加
            GameState.acquiredClues.push(clue);
            this.updateCluesStats();
            GameState.save();
            return true;
        }
        return false;
    },
    
    // 切换线索模态框
    toggleModal() {
        const modal = document.getElementById('clues-modal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            UIManager.hideAllModals();
            modal.style.display = 'flex';
            this.updateCluesStats();
            this.renderCluesGrid();
        }
    },
    
    // 兼容旧版的togglePanel
    togglePanel() {
        const panel = document.getElementById('clues-panel');
        if (panel && panel.classList.contains('open')) {
            panel.classList.remove('open');
        } else {
            // 使用新的模态框
            this.toggleModal();
        }
    },
    
    updateCluesStats() {
        // 更新模态框内的统计信息
        const statsElement = document.getElementById('clues-stats-modal');
        const countElement = document.getElementById('clues-count');
        
        const acquiredCount = GameState.acquiredClues.length;
        const totalCount = Object.keys(ClueData).length;
        
        if (statsElement) {
            statsElement.textContent = `${acquiredCount}/${totalCount}`;
        }
        if (countElement) {
            countElement.textContent = `(${acquiredCount})`;
        }
        
        // 控制红点提示
        const notificationDot = document.getElementById('clue-notification-dot');
        if (notificationDot) {
            if (acquiredCount > 0) {
                notificationDot.classList.remove('hidden');
            } else {
                notificationDot.classList.add('hidden');
            }
        }
    },

    renderCluesGrid() {
        const grid = document.getElementById('clues-grid-modal');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // 根据当前分类过滤线索
        let filteredClues = [];
        if (this.currentCategory === 'all') {
            filteredClues = GameState.acquiredClues;
        } else {
            filteredClues = GameState.acquiredClues.filter(clue => 
                clue.type === this.currentCategory
            );
        }
        
        // 去重过滤后的线索
        const uniqueClues = [];
        const seenClueIds = new Set();
        
        filteredClues.forEach(clue => {
            if (clue && clue.id && !seenClueIds.has(clue.id)) {
                seenClueIds.add(clue.id);
                uniqueClues.push(clue);
            }
        });
        
        // 创建线索卡片
        uniqueClues.forEach(clue => {
            const card = this.createClueCard(clue);
            grid.appendChild(card);
        });
        
        // 如果没有线索，显示提示信息
        if (uniqueClues.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'clue-card unavailable';
            emptyMessage.style.gridColumn = '1 / -1';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            emptyMessage.textContent = '暂无线索';
            grid.appendChild(emptyMessage);
        }
    },
    
    createClueCard(clue) {
        const card = document.createElement('div');
        card.className = 'clue-card';
        card.dataset.clueId = clue.id;
        
        // 图标容器
        const iconDiv = document.createElement('div');
        iconDiv.className = 'clue-icon';
        
        // 根据线索类型使用对应图标
        if (clue.type === 'evidence' && clue.img) {
            iconDiv.innerHTML = `<img src="${clue.img}" alt="${clue.name}" onerror="this.style.display='none'">`;
        } else if (clue.type === 'testimony') {
            // 使用统一的证词图标
            iconDiv.innerHTML = `<img src="${InferenceSystemConfig.testimonyIcon}" alt="${clue.name}">`;
        } else if (clue.type === 'inference') {
            // 使用统一的推理图标
            iconDiv.innerHTML = `<img src="${InferenceSystemConfig.inferenceIcon}" alt="${clue.name}">`;
        } else {
            // 其他类型的默认图标
            iconDiv.innerHTML = `<div class="clue-type-icon">📋</div>`;
        }
        
        // 名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'clue-name';
        nameDiv.textContent = clue.name;
        
        card.appendChild(iconDiv);
        card.appendChild(nameDiv);
        
        // 添加点击事件以显示详细信息
        card.addEventListener('click', () => {
            this.showClueDetail(clue);
        });
        
        return card;
    },
    
    showClueDetail(clue) {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="margin-top: 0; margin-bottom: 20px;">${clue.name}</h3>
                <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                    ${clue.type === 'evidence' ? 
                        `<img src="${clue.img}" alt="${clue.name}" 
                            style="max-width: 150px; max-height: 150px; 
                            border: 1px solid var(--border-color); border-radius: 5px;">` : 
                        `<div style="width: 150px; height: 150px; 
                            display: flex; align-items: center; justify-content: center; 
                            background: var(--secondary-bg-color); 
                            border: 1px solid var(--border-color); border-radius: 5px;">
                            <span style="font-size: 18px; color: var(--text-color);">
                                ${clue.type === 'testimony' ? '[证词]' : '[推理]'}
                            </span>
                        </div>`
                    }
                </div>
                <div style="margin-bottom: 20px; line-height: 1.6; text-align: left;">
                    ${clue.description}
                </div>
                <div style="font-size: 14px; color: var(--text-dark); text-align: left; margin-bottom: 5px;">
                    获得时间：${clue.acquiredTime}
                </div>
                <div style="font-size: 14px; color: var(--text-dark); text-align: left; margin-bottom: 20px;">
                    获得地点：${clue.location}
                </div>
            </div>
        `;
        
        UIManager.showResultModal(clue.name, content);
    },

    // 显示线索通知（物证类）
    showClueNotification(clue) {
        const notification = document.createElement('div');
        notification.className = 'clue-notification';
        
        notification.innerHTML = `
            <img src="${clue.img}" alt="${clue.name}" class="clue-notification-icon" 
                onerror="this.style.display='none'">
            <div class="clue-notification-title">新线索获得</div>
            <div class="clue-notification-text">${clue.name}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    },
    
    // 增强版线索通知（支持所有类型）
    showClueNotificationEnhanced(clue) {
        const notification = document.createElement('div');
        notification.className = 'clue-notification';
        notification.style.animation = 'fadeInScale 0.5s ease-out';
        
        // 根据线索类型显示不同的图标和样式
        let iconContent = '';
        if (clue.type === 'testimony') {
            iconContent = `<img src="${InferenceSystemConfig.testimonyIcon}" 
                alt="${clue.name}" class="clue-notification-icon">`;
        } else if (clue.type === 'inference') {
            iconContent = `<img src="${InferenceSystemConfig.inferenceIcon}" 
                alt="${clue.name}" class="clue-notification-icon">`;
        } else {
            iconContent = `<img src="${clue.img}" alt="${clue.name}" 
                class="clue-notification-icon" onerror="this.style.display='none'">`;
        }
        
        notification.innerHTML = `
            ${iconContent}
            <div class="clue-notification-title">发现新线索！</div>
            <div class="clue-notification-text">${clue.name}</div>
            <div style="font-size: 0.9em; color: var(--text-dark); margin-top: 10px;">
                ${clue.description}
            </div>
        `;
        
        // 添加动画样式
        this.ensureAnimationStyles();
        
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            notification.style.animation = 'fadeOutScale 0.5s ease-in';
            notification.style.animationFillMode = 'forwards';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 4000);
    },
    
    // 确保动画样式存在
    ensureAnimationStyles() {
        if (!document.querySelector('style[data-clue-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-clue-animation', 'true');
            style.textContent = `
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes fadeOutScale {
                    from {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};
window.ClueSystem = ClueSystem;