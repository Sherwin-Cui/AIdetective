// 游戏状态管理器
export const GameState = {
    currentScene: 'mansion_exterior',
    acquiredClues: [],
    npcDialogueCount: {},
    dialogueHistory: [],
    gamePhase: 1,
    investigatedLocations: {},
    gameTime: '晚上 8:45',
    gameEnding: null,  // 添加gameEnding属性

    save() {
        try {
            const stateToSave = JSON.stringify({
                currentScene: this.currentScene,
                acquiredClues: this.acquiredClues,
                npcDialogueCount: this.npcDialogueCount,
                dialogueHistory: this.dialogueHistory,
                gamePhase: this.gamePhase,
                investigatedLocations: this.investigatedLocations,
                gameTime: this.gameTime,
                gameEnding: this.gameEnding  // 添加gameEnding属性的保存
            });
            localStorage.setItem('rainyNightMystery', stateToSave);
            console.log('游戏已保存');
        } catch (error) {
            console.error('保存游戏失败:', error);
        }
    },

    load() {
        try {
            const savedState = localStorage.getItem('rainyNightMystery');
            if (savedState) {
                const loadedState = JSON.parse(savedState);
                Object.assign(this, loadedState);
                
                // 确保必要的对象已初始化
                if (!this.investigatedLocations) this.investigatedLocations = {};
                if (!this.npcDialogueCount) this.npcDialogueCount = {};
                if (!this.acquiredClues) this.acquiredClues = [];
                if (loadedState.gameEnding !== undefined) this.gameEnding = loadedState.gameEnding;
                
                // 去重已获得的线索
                this.deduplicateClues();
                
                console.log('游戏已加载');
            }
        } catch (error) {
            console.error('加载游戏失败:', error);
        }
    },
    
    deduplicateClues() {
        if (this.acquiredClues && Array.isArray(this.acquiredClues)) {
            const uniqueClues = [];
            const seenClueIds = new Set();
            
            this.acquiredClues.forEach(clue => {
                if (clue && clue.id && !seenClueIds.has(clue.id)) {
                    seenClueIds.add(clue.id);
                    uniqueClues.push(clue);
                }
            });
            
            this.acquiredClues = uniqueClues;
        }
    },
    
    reset() {
        // 清除本地存储
        try {
            localStorage.removeItem('rainyNightMystery');
            console.log('游戏存档已清除');
        } catch (error) {
            console.error('清除存档失败:', error);
        }
        
        // 重置所有游戏状态到初始值
        this.currentScene = 'mansion_exterior';
        this.acquiredClues = [];
        this.npcDialogueCount = {};
        this.dialogueHistory = [];
        this.gamePhase = 1;
        this.investigatedLocations = {};
        this.gameTime = '晚上 8:45';
        this.gameEnding = null;
        
        // 使用更可靠的页面刷新方式
        setTimeout(() => {
            try {
                window.location.reload(true);
            } catch (e1) {
                try {
                    location.reload();
                } catch (e2) {
                    try {
                        window.location.href = window.location.href;
                    } catch (e3) {
                        console.error('自动刷新失败，请手动刷新页面');
                        alert('请手动刷新页面 (Ctrl+F5 或 Cmd+R)');
                    }
                }
            }
        }, 100);
    }
};
window.GameState = GameState;