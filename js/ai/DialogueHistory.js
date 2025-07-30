// 对话历史管理器
export const DialogueHistoryManager = {
    saveHistory(npcId, history) {
        try { 
            // 确保保存的是数组
            if (!Array.isArray(history)) {
                console.error('尝试保存非数组类型的历史记录:', history);
                history = [];
            }
            localStorage.setItem(`dialogue_history_${npcId}`, JSON.stringify(history)); 
        } catch (e) { 
            console.error('保存对话历史失败:', e); 
        }
    },
    
    loadHistory(npcId) {
        try {
            const saved = localStorage.getItem(`dialogue_history_${npcId}`);
            if (!saved) {
                return [];
            }
            
            const parsed = JSON.parse(saved);
            
            // 确保返回的是数组
            if (!Array.isArray(parsed)) {
                console.warn(`NPC ${npcId} 的对话历史不是数组格式:`, parsed);
                // 如果是对象，尝试提取数组
                if (parsed && typeof parsed === 'object') {
                    // 检查是否有 dialogueHistory 属性
                    if (Array.isArray(parsed.dialogueHistory)) {
                        return parsed.dialogueHistory;
                    }
                    // 检查是否有 history 属性
                    if (Array.isArray(parsed.history)) {
                        return parsed.history;
                    }
                }
                // 否则返回空数组
                return [];
            }
            
            return parsed;
        } catch (e) {
            console.error(`加载 ${npcId} 的对话历史失败:`, e);
            return [];
        }
    },
    
    clearNpcHistory(npcId) {
        try {
            localStorage.removeItem(`dialogue_history_${npcId}`);
            console.log(`已清除 ${npcId} 的对话历史`);
        } catch (e) {
            console.error(`清除 ${npcId} 的对话历史失败:`, e);
        }
    },
    
    clearAllHistory() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('dialogue_history_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`已清除所有对话历史 (${keysToRemove.length} 条)`);
        } catch (e) {
            console.error('清除所有对话历史失败:', e);
        }
    },
    
    // 修复损坏的历史记录
    fixCorruptedHistory(npcId) {
        const key = `dialogue_history_${npcId}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!Array.isArray(parsed)) {
                    console.log(`修复 ${npcId} 的损坏历史记录`);
                    localStorage.removeItem(key);
                    return true;
                }
            } catch (e) {
                console.log(`修复 ${npcId} 的损坏历史记录（JSON解析失败）`);
                localStorage.removeItem(key);
                return true;
            }
        }
        return false;
    },
    
    // 获取所有NPC的对话历史状态
    getAllHistoryStatus() {
        const status = {};
        const npcs = ['chen_yaqin', 'lin_chen', 'laochen', 'doctor_li', 'xiaomei'];
        
        npcs.forEach(npcId => {
            const history = this.loadHistory(npcId);
            status[npcId] = {
                exists: history.length > 0,
                count: history.length,
                isValid: Array.isArray(history)
            };
        });
        
        return status;
    },
    
    // 导出所有对话历史（用于调试）
    exportAllHistory() {
        const allHistory = {};
        const npcs = ['chen_yaqin', 'lin_chen', 'laochen', 'doctor_li', 'xiaomei'];
        
        npcs.forEach(npcId => {
            const history = this.loadHistory(npcId);
            if (history.length > 0) {
                allHistory[npcId] = history;
            }
        });
        
        return allHistory;
    },
    
    // 导入对话历史（用于测试）
    importHistory(npcId, history) {
        if (!Array.isArray(history)) {
            console.error('导入的历史必须是数组格式');
            return false;
        }
        
        try {
            this.saveHistory(npcId, history);
            console.log(`成功导入 ${npcId} 的对话历史 (${history.length} 条)`);
            return true;
        } catch (e) {
            console.error(`导入 ${npcId} 的对话历史失败:`, e);
            return false;
        }
    }
};

// 暴露给全局以供其他模块使用
window.DialogueHistoryManager = DialogueHistoryManager;

// 提供修复工具
window.fixDialogueHistory = {
    // 检查所有NPC的对话历史
    checkAll() {
        const status = DialogueHistoryManager.getAllHistoryStatus();
        console.log('=== 对话历史状态 ===');
        Object.entries(status).forEach(([npcId, info]) => {
            const statusIcon = info.isValid ? '✅' : '❌';
            console.log(`${statusIcon} ${npcId}: ${info.count} 条历史`);
        });
    },
    
    // 修复特定NPC的历史
    fix(npcId) {
        if (DialogueHistoryManager.fixCorruptedHistory(npcId)) {
            console.log(`✅ 已修复 ${npcId} 的对话历史`);
        } else {
            console.log(`ℹ️ ${npcId} 的对话历史无需修复`);
        }
    },
    
    // 修复所有损坏的历史
    fixAll() {
        const npcs = ['chen_yaqin', 'lin_chen', 'laochen', 'doctor_li', 'xiaomei'];
        npcs.forEach(npcId => this.fix(npcId));
    },
    
    // 清除特定NPC的历史
    clear(npcId) {
        DialogueHistoryManager.clearNpcHistory(npcId);
    },
    
    // 导出所有历史（调试用）
    export() {
        const history = DialogueHistoryManager.exportAllHistory();
        console.log('导出的对话历史:', history);
        return history;
    }
};

console.log('对话历史修复工具已加载');
console.log('使用方法:');
console.log('- fixDialogueHistory.checkAll() - 检查所有NPC的对话历史');
console.log('- fixDialogueHistory.fix("chen_yaqin") - 修复特定NPC');
console.log('- fixDialogueHistory.fixAll() - 修复所有损坏的历史');
console.log('- fixDialogueHistory.clear("chen_yaqin") - 清除特定NPC的历史');
console.log('- fixDialogueHistory.export() - 导出所有对话历史');