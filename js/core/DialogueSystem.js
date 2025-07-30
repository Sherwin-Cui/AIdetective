// 对话系统
import { GameState } from './GameState.js';
import { NpcData } from '../config/gameData.js';
import { SceneData } from '../config/gameData.js';

export const DialogueSystem = {
    currentNpcId: null,

    init() {
        console.log('初始化对话系统');
        
        // 为旧对话系统保留事件监听器（兼容性）
        const sendBtn = document.getElementById('send-btn');
        const playerInput = document.getElementById('player-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (playerInput) {
            playerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
        
        // 为新对话系统添加事件监听器
        const dialogueSendNew = document.getElementById('dialogue-send-new');
        const dialogueInputNew = document.getElementById('dialogue-input-new');
        
        if (dialogueSendNew) {
            dialogueSendNew.addEventListener('click', () => this.sendMessageNew());
        }
        
        if (dialogueInputNew) {
            dialogueInputNew.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessageNew();
            });
        }
        
        // 添加关闭新对话窗口的事件监听器
        const closeBtn = document.querySelector('#dialogue-modal-new .modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('dialogue-modal-new').style.display = 'none';
            });
        }
        
        // 旧对话框关闭按钮
        const dialogueCloseBtn = document.getElementById('dialogue-close-btn');
        if (dialogueCloseBtn) {
            dialogueCloseBtn.addEventListener('click', () => {
                document.getElementById('dialogue-container').style.display = 'none';
                document.getElementById('player-input').value = '';
                document.getElementById('dialogue-history').innerHTML = '';
            });
        }
    },

    startDialogue(npcId) {
        // 检查是否还有剩余对话次数
        if (!GameState.npcDialogueCount[npcId]) {
            GameState.npcDialogueCount[npcId] = 0;
        }
        
        const npc = NpcData[npcId];
        const remainingDialogues = (npc.dialogueMax || 10) - GameState.npcDialogueCount[npcId];
        
        if (remainingDialogues > 0) {
            this.currentNpcId = npcId;
            console.log(`开始与 ${npc.name} 对话`);
            
            // 使用新的对话窗口
            this.startDialogueNew(npcId);
        } else {
            alert(`${npc.name} 似乎不想再多聊了。`);
        }
    },

    // 新的开始对话方法
    startDialogueNew(npcId) {
        // 使用AI中间件的对话系统
        if (window.AIMiddleware && window.AIMiddleware.DialogueSystem) {
            window.AIMiddleware.DialogueSystem.startDialogueNew(npcId);
        } else {
            // 降级到本地实现
            this.currentNpcId = npcId;
            const npc = NpcData[npcId];
            
            document.getElementById('current-npc-name').textContent = npc.name;
            document.getElementById('dialogue-npc-avatar').src = npc.avatar;
            document.getElementById('dialogue-history-new').innerHTML = '';
            
            // 显示对话次数
            if (!GameState.npcDialogueCount[npcId]) {
                GameState.npcDialogueCount[npcId] = 0;
            }
            const remainingDialogues = (npc.dialogueMax || 10) - GameState.npcDialogueCount[npcId];
            document.getElementById('dialogue-count-new').textContent = `(剩余${remainingDialogues}次)`;
            
            // 隐藏所有模态框并显示对话窗口
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.style.display = 'none';
            });
            document.getElementById('dialogue-modal-new').style.display = 'flex';
        }
    },

    // 旧的发送消息方法（保持兼容性）
    sendMessage() {
        const input = document.getElementById('player-input');
        const message = input.value.trim();
        if (message) {
            this.addDialogue('me', '侦探', message);
            input.value = '';
            this.mockNpcResponse(message);
        }
    },

    // 新的发送消息方法
    sendMessageNew() {
        // 使用AI中间件的对话系统
        if (window.AIMiddleware && window.AIMiddleware.DialogueSystem) {
            window.AIMiddleware.DialogueSystem.sendMessageNew();
        } else {
            // 降级到本地实现
            const input = document.getElementById('dialogue-input-new');
            const message = input.value.trim();
            if (!message) return;
            
            input.value = '';
            
            // 侦探发言
            this.addBubble('detective', message);
            
            // 模拟NPC回复
            setTimeout(() => {
                this.addBubble('npc', `关于"${message}"，我想想...`);
                
                // 增加对话计数
                if (this.currentNpcId) {
                    GameState.npcDialogueCount[this.currentNpcId]++;
                    this.updateDialogueCount();
                    GameState.save();
                }
            }, 1000);
        }
    },

    // 添加对话气泡
    addBubble(speaker, text) {
        const history = document.getElementById('dialogue-history-new');
        const bubble = document.createElement('div');
        bubble.className = `dialogue-bubble ${speaker}`;
        bubble.textContent = text;
        
        history.appendChild(bubble);
        history.scrollTop = history.scrollHeight;
    },

    // 更新对话次数显示
    updateDialogueCount() {
        if (!this.currentNpcId) return;
        
        const npc = NpcData[this.currentNpcId];
        const count = GameState.npcDialogueCount[this.currentNpcId] || 0;
        const remaining = (npc.dialogueMax || 10) - count;
        
        const countElement = document.getElementById('dialogue-count-new');
        if (countElement) {
            countElement.textContent = `(剩余${remaining}次)`;
        }
    },

    // 旧的添加对话方法（兼容性）
    addDialogue(characterId, name, text, emotion = 'normal') {
        const history = document.getElementById('dialogue-history');
        const entry = document.createElement('div');
        entry.className = 'dialogue-entry';

        // 获取头像路径
        let avatarPath = 'assets/characters/me/detective.png';
        if (characterId === 'me') {
            avatarPath = 'assets/characters/me/detective.png';
        } else if (NpcData[characterId]) {
            avatarPath = NpcData[characterId].avatar;
        } else if (characterId === 'system') {
            avatarPath = 'assets/characters/system/system.png';
        }

        entry.innerHTML = `
            <img src="${avatarPath}" alt="${name}" class="npc-avatar">
            <div class="dialogue-content">
                <div class="npc-name">${name}</div>
                <div>${text}</div>
            </div>
        `;
        
        history.appendChild(entry);
        history.scrollTop = history.scrollHeight;
        
        // 保存对话历史
        GameState.dialogueHistory.push({characterId, name, text, emotion});
        GameState.save();
    },
    
    // 模拟NPC回复（旧系统）
    mockNpcResponse(playerMessage) {
        const npcId = this.currentNpcId;
        
        if (!npcId || !NpcData[npcId]) {
            setTimeout(() => {
                this.addDialogue('system', '系统', `这里现在没有人，或者你还未选择对话对象。`, 'normal');
            }, 500);
            return;
        }
        
        // 检查对话次数
        if (!GameState.npcDialogueCount[npcId]) {
            GameState.npcDialogueCount[npcId] = 0;
        }
        
        const remaining = (NpcData[npcId].dialogueMax || 10) - GameState.npcDialogueCount[npcId];
        
        if (remaining > 0) {
            GameState.npcDialogueCount[npcId]++;
            setTimeout(() => {
                this.addDialogue(npcId, NpcData[npcId].name, `关于"${playerMessage}"，我需要想想...`, 'thinking');
            }, 1000);
        } else {
            this.addDialogue('system', '系统', `${NpcData[npcId].name} 似乎不想再多说了。`);
        }
    },

    // 获取当前场景的NPC列表
    getCurrentSceneNpcs() {
        const currentScene = SceneData[GameState.currentScene];
        if (!currentScene || !currentScene.npcs) {
            return [];
        }
        
        return currentScene.npcs.map(npcId => ({
            id: npcId,
            ...NpcData[npcId],
            dialogueCount: GameState.npcDialogueCount[npcId] || 0
        }));
    }
};