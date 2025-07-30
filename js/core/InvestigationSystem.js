// 调查系统
import { GameState } from './GameState.js';
import { SceneData, ClueData } from '../config/gameData.js';
import { ClueSystem } from './ClueSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { TimeSystem } from './TimeSystem.js';

export const InvestigationSystem = {
    init() {
        console.log('初始化调查系统');
    },

    renderInvestigationList() {
        const list = document.getElementById('investigation-list');
        const currentScene = SceneData[GameState.currentScene];
        
        if (!list) return;
        
        list.innerHTML = '';

        if (!currentScene.investigation_points || currentScene.investigation_points.length === 0) {
            list.innerHTML = '<li>当前场景没有可调查的地点。</li>';
            return;
        }

        currentScene.investigation_points.forEach(point => {
            const item = document.createElement('li');
            item.className = 'selection-item';
            
            const isInvestigated = GameState.investigatedLocations[point.id];
            
            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${point.name} ${isInvestigated ? '(已调查)' : ''}</div>
                    <div class="item-subtext">${point.description}</div>
                </div>
            `;

            // 所有项目都添加点击事件
            item.addEventListener('click', () => this.investigate(point));
            list.appendChild(item);
        });
    },

    investigate(point) {
        console.log(`调查: ${point.name}`);
        
        // 关闭调查模态框
        document.getElementById('investigation-modal').style.display = 'none';
        
        // 检查是否已经调查过
        const isFirstTime = !GameState.investigatedLocations[point.id];
        
        if (isFirstTime) {
            // 首次调查：显示调查过程
            this.firstTimeInvestigation(point);
        } else {
            // 重复调查：直接显示结果
            this.repeatInvestigation(point);
        }
    },

    // 首次调查
    firstTimeInvestigation(point) {
        // 显示调查过程
        UIManager.showResultModal('调查中...', `你开始调查【${point.name}】...`);
        
        // 延迟显示调查结果
        setTimeout(() => {
            // 标记为已调查
            GameState.investigatedLocations[point.id] = true;
            
            // 检查该调查点是否有线索
            if (point.clueId && ClueData[point.clueId]) {
                const clue = ClueData[point.clueId];
                
                // 添加线索到背包
                const clueToAdd = {
                    ...clue, 
                    id: point.clueId,
                    acquiredTime: TimeSystem.getCurrentGameTimeString(),
                    realTime: new Date().toLocaleString(),
                    location: SceneData[GameState.currentScene]?.name || '未知地点'
                };
                
                const added = ClueSystem.addClue(clueToAdd);
                
                if (added) {
                    // 显示调查结果
                    UIManager.showResultModal('调查结果',
                        `${point.description}\n\n你发现了一个重要线索：${clue.name}\n\n${clue.description}`);
                    
                    // 安排线索通知
                    this.scheduleClueNotification(clue);
                } else {
                    // 已经获得过这个线索
                    UIManager.showResultModal('调查结果',
                        `${point.description}\n\n这里的线索你已经发现过了。`);
                }
            } else {
                // 没有线索的情况
                UIManager.showResultModal('调查结果',
                    `${point.description}\n\n你暂时没有发现特别的东西。`);
            }
            
            // 更新调查列表显示
            this.renderInvestigationList();
            GameState.save();
        }, 1000);
    },

    // 重复调查
    repeatInvestigation(point) {
        // 直接显示调查结果
        if (point.clueId && ClueData[point.clueId]) {
            const clue = ClueData[point.clueId];
            UIManager.showResultModal('调查结果',
                `${point.description}\n\n这里之前发现过：${clue.name}\n\n${clue.description}`);
        } else {
            UIManager.showResultModal('调查结果',
                `${point.description}\n\n你仔细查看了一遍，没有发现新的东西。`);
        }
    },

    // 安排线索通知显示
    scheduleClueNotification(clue) {
        const resultModal = document.getElementById('result-modal');
        
        const checkModalClosed = setInterval(() => {
            if (resultModal.style.display === 'none') {
                clearInterval(checkModalClosed);
                ClueSystem.showClueNotification(clue);
            }
        }, 100);
        
        // 5秒后自动清除检查（防止内存泄漏）
        setTimeout(() => clearInterval(checkModalClosed), 5000);
    },

    // 获取当前场景的调查点
    getCurrentInvestigationPoints() {
        const currentScene = SceneData[GameState.currentScene];
        if (!currentScene || !currentScene.investigation_points) {
            return [];
        }
        
        return currentScene.investigation_points.map(point => ({
            ...point,
            investigated: !!GameState.investigatedLocations[point.id],
            hasClue: !!point.clueId
        }));
    }
};