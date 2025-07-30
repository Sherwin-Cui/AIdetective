// AI线索管理器
import { GameState } from '../core/GameState.js';
import { ClueSystem } from '../core/ClueSystem.js';
import { ClueData, InferenceRules } from '../config/gameData.js';

export const AIClueManager = {
    triggeredClues: new Set(),
    
    init() {
        console.log('[AIClueManager] 初始化线索管理器');
        
        // 从GameState加载已获得的线索
        if (GameState && GameState.acquiredClues) {
            GameState.acquiredClues.forEach(clue => {
                if (clue.id) {
                    this.triggeredClues.add(clue.id);
                }
            });
            console.log(`[AIClueManager] 已加载 ${this.triggeredClues.size} 个已触发线索`);
        }
    },
    
    hasClue(clueId) {
        return this.triggeredClues.has(clueId);
    },
    
    canTriggerClue(clueId) {
        return !this.hasClue(clueId);
    },
    
    getClueById(clueId) {
        // 优先从全局ClueData中查找
        if (ClueData && ClueData[clueId]) {
            return ClueData[clueId];
        }
        
        // 从GameState.acquiredClues中查找
        if (GameState && GameState.acquiredClues) {
            return GameState.acquiredClues.find(clue => clue.id === clueId);
        }
        
        return null;
    },
    
    // 新增推理线索触发方法 
    triggerInferenceClue(clueId, prerequisites) { 
        // 检查前置条件 
        const allPrerequisitesMet = prerequisites.every(preClueId => 
            this.hasClue(preClueId) 
        ); 
        
        if (!allPrerequisitesMet) { 
            console.log(`[AIClueManager] 推理线索 ${clueId} 的前置条件未满足`); 
            return false; 
        } 
        
        // 触发推理线索 
        return this.revealClue(clueId); 
    }, 
    
    // 检查并自动触发推理线索 
    checkInferenceClues() { 
        // 自动检查并触发满足条件的推理线索 
        Object.entries(InferenceRules).forEach(([clueId, rule]) => { 
            if (!this.hasClue(clueId)) { 
                this.triggerInferenceClue(clueId, rule.prerequisites); 
            } 
        }); 
    }, 
    
    revealClue(clueId) {
        // 检查线索是否存在
        const clueInfo = this.getClueById(clueId);
        if (!clueInfo) {
            console.error(`[AIClueManager] 线索 ${clueId} 不存在`);
            return false;
        }
        
        // 检查是否已经触发
        if (this.hasClue(clueId)) {
            console.log(`[AIClueManager] 线索 ${clueId} 已经被触发过`);
            return false;
        }
        
        // 添加到已触发集合
        this.triggeredClues.add(clueId);
        
        // 调用游戏的线索系统
        if (ClueSystem && ClueSystem.addClueById) {
            const success = ClueSystem.addClueById(clueId);
            if (success) {
                console.log(`[AIClueManager] 成功触发线索: ${clueId} - ${clueInfo.name}`);
            }
            
            // 触发线索后检查推理线索 
            if (success) { 
                setTimeout(() => { 
                    this.checkInferenceClues(); 
                }, 500); 
            } 
            
            return success;
        }
        
        console.warn('[AIClueManager] ClueSystem未初始化');
        return false;
    },
    
    // 获取所有已触发的线索
    getTriggeredClues() {
        return Array.from(this.triggeredClues);
    },
    
    // 获取所有可触发但未触发的线索
    getAvailableClues() {
        const available = [];
        
        if (ClueData) {
            Object.keys(ClueData).forEach(clueId => {
                if (!this.hasClue(clueId)) {
                    available.push({
                        id: clueId,
                        ...ClueData[clueId]
                    });
                }
            });
        }
        
        return available;
    },
    
    // 获取特定类型的已触发线索
    getTriggeredCluesByType(type) {
        const clues = [];
        
        this.triggeredClues.forEach(clueId => {
            const clueInfo = this.getClueById(clueId);
            if (clueInfo && clueInfo.type === type) {
                clues.push({
                    id: clueId,
                    ...clueInfo
                });
            }
        });
        
        return clues;
    },
    
    // 统计信息
    getStatistics() {
        const stats = {
            total: Object.keys(ClueData || {}).length,
            triggered: this.triggeredClues.size,
            evidence: 0,
            testimony: 0,
            inference: 0
        };
        
        // 统计各类型线索
        this.triggeredClues.forEach(clueId => {
            const clueInfo = this.getClueById(clueId);
            if (clueInfo && clueInfo.type) {
                stats[clueInfo.type] = (stats[clueInfo.type] || 0) + 1;
            }
        });
        
        stats.percentage = stats.total > 0 
            ? Math.round((stats.triggered / stats.total) * 100) 
            : 0;
        
        return stats;
    },
    
    // 调试方法：强制触发线索（仅用于测试）
    forceRevealClue(clueId) {
        console.warn(`[AIClueManager] 强制触发线索: ${clueId}`);
        return this.revealClue(clueId);
    },
    
    // 调试方法：重置所有线索
    resetAllClues() {
        console.warn('[AIClueManager] 重置所有线索触发状态');
        this.triggeredClues.clear();
    },
    
    // 调试方法：显示线索状态
    debugStatus() {
        const stats = this.getStatistics();
        console.log('=== AI线索管理器状态 ===');
        console.log(`总线索数: ${stats.total}`);
        console.log(`已触发: ${stats.triggered} (${stats.percentage}%)`);
        console.log(`- 物证: ${stats.evidence}`);
        console.log(`- 证词: ${stats.testimony}`);
        console.log(`- 推理: ${stats.inference}`);
        console.log('\n已触发线索列表:');
        
        this.triggeredClues.forEach(clueId => {
            const clueInfo = this.getClueById(clueId);
            if (clueInfo) {
                console.log(`- ${clueId}: ${clueInfo.name} [${clueInfo.type}]`);
            }
        });
    }
};

// 暴露给全局用于调试
window.AIClueManager = AIClueManager;

// 调试工具
window.clueDebug = {
    // 显示状态
    status: () => AIClueManager.debugStatus(),
    
    // 强制触发线索
    trigger: (clueId) => AIClueManager.forceRevealClue(clueId),
    
    // 重置所有线索
    reset: () => AIClueManager.resetAllClues(),
    
    // 获取可用线索
    available: () => {
        const clues = AIClueManager.getAvailableClues();
        console.log(`=== 可触发线索 (${clues.length}) ===`);
        clues.forEach(clue => {
            console.log(`- ${clue.id}: ${clue.name} [${clue.type}]`);
        });
        return clues;
    },
    
    // 获取统计信息
    stats: () => AIClueManager.getStatistics()
};

console.log('AI线索管理器已加载');
console.log('调试命令:');
console.log('- clueDebug.status() - 显示线索状态');
console.log('- clueDebug.trigger("clue_id") - 强制触发线索');
console.log('- clueDebug.available() - 显示可触发线索');
console.log('- clueDebug.stats() - 获取统计信息');