// 对话AI系统
import { SimpleAIService } from './AIService.js';
import { DialogueHistoryManager } from './DialogueHistory.js';
import { DialogueAnalyzer } from './DialogueAnalyzer.js';
import { AIClueManager } from './ClueManager.js';
import { responseParser } from './ResponseParser.js';
import { CharacterPersonalities, FallbackResponses, ClueTriggerRules } from '../config/aiConfig.js';
import { UIManager } from '../ui/UIManager.js';
import { GameState } from '../core/GameState.js';

export const DialogueAI = {
    currentNPC: null,
    dialogueHistory: [],
    isWaitingForResponse: false,

    init() {
        console.log('[DialogueAI] 初始化对话AI系统');
        
        // 绑定事件监听器
        const sendBtn = document.getElementById('dialogue-send-new');
        const inputField = document.getElementById('dialogue-input-new');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none'
        });
    },
    
    startDialogue(npcId) {
        // 重置对话分析器
        DialogueAnalyzer.resetCounts(npcId);
        
        this.currentNPC = npcId;
        this.dialogueHistory = DialogueHistoryManager.loadHistory(npcId);
        
        const npc = window.AIMiddleware.NpcData[npcId];
        if (!npc) { 
            console.error('NPC不存在:', npcId); 
            return; 
        }
        
        document.getElementById('current-npc-name').textContent = npc.name;
        // 侦探头像特殊处理
        if (npcId === 'me' || npcId === 'detective') {
            document.getElementById('dialogue-npc-avatar').src = 'assets/characters/me/detective.png';
        } else {
            document.getElementById('dialogue-npc-avatar').src = npc.avatar;
        }
        
        const historyElement = document.getElementById('dialogue-history-new');
        if (historyElement) {
            historyElement.innerHTML = '';
            
            this.dialogueHistory.forEach(entry => {
                this.addDialogueBubbleWithTyping(
                    entry.role === 'user' ? 'detective' : 'npc', 
                    entry.content, 
                    entry.emotion
                );
            });
        }
        
        this.updateDialogueCount(npcId);
        this.hideAllModals();
        document.getElementById('dialogue-modal-new').style.display = 'flex';
        document.getElementById('dialogue-input-new').focus();
        
        console.log(`[对话] 开始与 ${npc.name} 对话，已有 ${this.dialogueHistory.length} 条历史记录`);
    },

    updateNpcAvatar(emotion) {
        const avatarElement = document.getElementById('dialogue-npc-avatar');
        if (!avatarElement || !this.currentNPC) return;
        
        const npc = window.AIMiddleware.NpcData[this.currentNPC];
        if (!npc) return;
        
        // 根据实际素材文件定义每个角色的可用表情
        const npcEmotions = {
            'laochen': {
                '恭敬': 'respectful',
                '平静': 'neutral',
                '内疚': 'guilty',
                '克制': 'restrained',
                '警惕': 'wary',
                '谨慎': 'wary',
                '专业': 'neutral',
                '冷静': 'neutral'
            },
            'chen_yaqin': {
                '紧张': 'nervous',
                '恐慌': 'panicked',
                '悲伤': 'sad',
                '愤怒': 'angry',
                '平静': 'calm',
                '防备': 'nervous',
                '慌乱': 'panicked'
            },
            'lin_chen': {
                '愤怒': 'angry',
                '焦躁': 'anxious',
                '不耐烦': 'impatient',
                '复杂': 'conflicted',
                '恐慌': 'panicked',
                '回避': 'anxious'
            },
            'doctor_li': {
                '专业': 'professional',
                '谨慎': 'cautious',
                '担忧': 'worried',
                '愤怒': 'indignant',
                '震惊': 'shocked',
                '冷静': 'professional',
                '职业': 'professional'
            },
            'xiaomei': {
                '害怕': 'scared',
                '紧张': 'nervous',
                '犹豫': 'hesitant',
                '慌乱': 'scared',
                '纠结': 'hesitant'
            }
        };
        
        const emotionMapping = npcEmotions[this.currentNPC];
        if (!emotionMapping) {
            console.warn(`未找到 ${this.currentNPC} 的表情配置`);
            return;
        }
        
        const emotionFile = emotionMapping[emotion];
        if (!emotionFile) {
            console.warn(`${this.currentNPC} 没有 "${emotion}" 表情，保持当前头像`);
            return;
        }
        
        const basePath = npc.avatar.substring(0, npc.avatar.lastIndexOf('/'));
        const newAvatar = `${basePath}/${emotionFile}.png`;
        
        if (avatarElement.src.endsWith(newAvatar)) {
            return;
        }
        
        const tempImg = new Image();
        
        tempImg.onload = () => {
            console.log(`✅ 加载表情: ${this.currentNPC} - ${emotion} -> ${emotionFile}.png`);
            avatarElement.src = newAvatar;
            // 头像放大并发光
            avatarElement.classList.add('avatar-highlight');
            // 抖动动画
            avatarElement.classList.add('avatar-shake');
            setTimeout(() => {
                avatarElement.classList.remove('avatar-shake');
            }, 600);
        };
        
        tempImg.onerror = () => {
            console.error(`❌ 表情文件不存在: ${newAvatar}`);
            if (!window.missingAssets) window.missingAssets = [];
            window.missingAssets.push({
                npc: this.currentNPC,
                emotion: emotion,
                file: `${emotionFile}.png`
            });
        };
        
        tempImg.src = newAvatar;
    },

    addDialogueBubble(speaker, text, emotion = null) {
        const history = document.getElementById('dialogue-history-new');
        if (!history) return;
        
        const bubble = document.createElement('div');
        bubble.className = `dialogue-bubble ${speaker}`;
        bubble.textContent = text;
        history.appendChild(bubble);
        history.scrollTop = history.scrollHeight;
        
        if (speaker === 'npc' && emotion) {
            this.updateNpcAvatar(emotion);
        }
    },

    async addDialogueBubbleWithTyping(speaker, text, emotion = null) {
        const history = document.getElementById('dialogue-history-new');
        if (!history) return;
        
        const bubble = document.createElement('div');
        bubble.className = `dialogue-bubble ${speaker}`;
        bubble.innerHTML = '<span class="typing-text"></span>';
        history.appendChild(bubble);
        history.scrollTop = history.scrollHeight;
        
        if (speaker === 'npc' && emotion) {
            this.updateNpcAvatar(emotion);
        }
        
        const typingElement = bubble.querySelector('.typing-text');
        for (let i = 0; i < text.length; i++) {
            typingElement.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, 30));
        }
    },

    // 新增方法，显示NPC思考动画
    showThinkingAnimation() {
        const history = document.getElementById('dialogue-history-new');
        if (!history) return null;
        
        const bubble = document.createElement('div');
        bubble.className = 'dialogue-bubble npc thinking';
        bubble.innerHTML = '<span class="typing-text">...</span>';
        history.appendChild(bubble);
        history.scrollTop = history.scrollHeight;
        return bubble;
    },

    // 修改sendMessage方法，增加思考动画显示和隐藏
    async sendMessage() {
        const input = document.getElementById('dialogue-input-new');
        const message = input.value.trim();
        
        if (!message || this.isWaitingForResponse || !this.currentNPC) return;
        
        console.group(`🗣️ 对话调试 - ${this.currentNPC}`);
        console.log('👤 用户输入:', message);
        
        if (!this.canTalk(this.currentNPC)) {
            this.addDialogueBubble('system', '对方似乎不想再聊了...');
            console.groupEnd();
            return;
        }
        
        this.isWaitingForResponse = true;
        input.value = '';
        input.disabled = true;
        document.getElementById('dialogue-send-new').disabled = true;
        
        this.addDialogueBubbleWithTyping('detective', message);
        
        // 显示NPC思考动画
        const thinkingBubble = this.showThinkingAnimation();
        
        // 分析用户输入，检查潜在线索
        const potentialClues = DialogueAnalyzer.analyzeUserInput(
            this.currentNPC, 
            message, 
            this.dialogueHistory
        );
        
        console.log('🔍 潜在线索:', potentialClues.map(c => c.id));
        
        this.dialogueHistory.push({ role: 'user', content: message });
        
        try {
            const fullPrompt = this.buildEnhancedPrompt(message, potentialClues);
            
            console.log('📝 完整提示词:');
            console.log('─'.repeat(80));
            console.log(fullPrompt);
            console.log('─'.repeat(80));
            
            const context = {
                systemPrompt: "你是一个推理游戏中的角色，请严格按照角色设定回复。",
                history: this.dialogueHistory.slice(0, -1).map(entry => ({
                    role: entry.role === 'user' ? 'user' : 'assistant',
                    content: entry.content
                })),
                temperature: 0.7,
                maxTokens: 200
            };
            
            const aiResponse = await SimpleAIService.sendToOllama(fullPrompt, context);
            
            console.log('🤖 AI原始回复:');
            console.log('─'.repeat(50));
            console.log(aiResponse);
            console.log('─'.repeat(50));
            
            if (aiResponse) {
                // 移除思考动画
                if (thinkingBubble) thinkingBubble.remove();
                
                // 解析新格式的响应
                const parsed = responseParser.parseWithGameEvents(aiResponse, this.currentNPC);

                console.log('📦 解析后响应:', parsed);

                // 显示NPC的回复
                await this.addDialogueBubbleWithTyping('npc', parsed.content, parsed.emotion);

                // 处理游戏事件
                if (parsed.gamePhase) {
                    console.log(`🚀 游戏阶段变更: ${parsed.gamePhase}`);
                    document.dispatchEvent(new CustomEvent('gamePhaseChanged', {
                        detail: { phase: parsed.gamePhase }
                    }));
                }

                if (parsed.gameEnding) {
                    console.log(`🎬 游戏结局触发: ${parsed.gameEnding}`);
                    document.dispatchEvent(new CustomEvent('gameEnding', {
                        detail: { ending: parsed.gameEnding }
                    }));
                }

                // 处理线索触发
                if (parsed.clueCheck && parsed.clueCheck.triggered && parsed.clueCheck.clue_id) {
                    if (AIClueManager.canTriggerClue(parsed.clueCheck.clue_id)) {
                        console.log(`📌 线索触发: ${parsed.clueCheck.clue_id} - ${parsed.clueCheck.reason}`);
                        
                        setTimeout(() => {
                            AIClueManager.revealClue(parsed.clueCheck.clue_id);
                        }, 1000);
                    }
                }
                
                this.dialogueHistory.push({ 
                    role: 'assistant', 
                    content: parsed.content, 
                    emotion: parsed.emotion 
                });
                
                DialogueHistoryManager.saveHistory(this.currentNPC, this.dialogueHistory);
                this.incrementDialogueCount(this.currentNPC);
                
            } else {
                console.warn('⚠️ AI无响应，使用备用回复');
                const fallback = FallbackResponses.getRandom(this.currentNPC);
                const parsed = responseParser.parseResponse(fallback, this.currentNPC);
                this.addDialogueBubble('npc', parsed.content, parsed.emotion);
            }
        } catch (error) {
            console.error('❌ 对话处理失败:', error);
            this.addDialogueBubble('system', '对话出现错误，请重试。');
        }
        
        console.groupEnd();
        
        this.isWaitingForResponse = false;
        input.disabled = false;
        document.getElementById('dialogue-send-new').disabled = false;
        input.focus();
    },

    buildEnhancedPrompt(userMessage, potentialClues) {
        const character = CharacterPersonalities[this.currentNPC];
        if (!character) {
            console.warn(`⚠️ 找不到角色 ${this.currentNPC} 的配置`);
            return userMessage;
        }
        
        // 构建结构化的提示词
        const prompt = `你是一个中文角色扮演游戏中的NPC。这是一个侦探推理游戏。

游戏背景：
深秋雨夜，偏远山区的林氏山庄，山庄主人林山庄在65岁生日晚宴上突然死亡。
林山庄举杯致辞后突然倒下，经李医生确认已经死亡，看起来像是急性心脏衰竭。
由于暴雨导致山路中断，警察无法及时赶到，侦探必须在天亮前查明真相。


重要规则：
1. 必须用中文回复，不要使用英文或emoji
2. 保持严肃的悬疑氛围，符合角色设定
3. 只知道角色设定中的信息，不能透露其他角色的秘密
4. 当被问到敏感问题时，根据你的性格表现出相应的情绪反应
5. 只有在特定条件下才能透露关键信息
6. 保持角色的一致性，不要突然改变态度
7. 回答简洁，每次不超过100字
8. 严格按照下面的格式回复

必须的回复格式：
[情绪状态]（只能从以下情绪中选择：${character.commonEmotions.join('、')}）
正文内容
<clue_check>
{
    "triggered": true或false,
    "clue_id": "线索ID或null",
    "reason": "触发原因"
}
</clue_check>

游戏时间线：
- 19:00 客人陆续到达
- 20:00 晚宴开始
- 20:30 林山庄致辞后倒下身亡
- 20:45 当前时间（调查开始）

## 角色设定
你是${character.name}，${character.age}岁，${character.identity}。${character.personality}

## 人物设定
${character.characterDescription}

## 核心秘密
${character.roleplayConfig.coreSecrets.map(secret => `- ${secret}`).join('\n')}

## 情绪触发机制
${Object.entries(character.roleplayConfig.emotionTriggers).map(([trigger, config]) => 
    `- 被问到${trigger}时：[${config.emotion}] ${config.behavior}`
).join('\n')}

## 线索触发条件
${this.buildClueTriggersText(this.currentNPC)}

## 其他信息
${character.roleplayConfig.otherKnowledge.map(info => `- ${info}`).join('\n')}

## 注意事项
${character.roleplayConfig.behaviorGuidelines.map(guideline => `- ${guideline}`).join('\n')}

当前对话轮数：${this.dialogueHistory.length + 1}/${this.getMaxDialogueCount(this.currentNPC)}
已获得线索：${this.getRevealedCluesString()}

当前对话对象：${character.name}

对话历史：
${this.formatHistory(this.dialogueHistory, character.name)}

特殊上下文：
${this.buildSpecialContext(potentialClues)}

请根据上述角色设定扮演${character.name}。记住：
1. 保持角色性格的一致性
2. 根据用户的提问方式调整情绪状态
3. 在适当的时机触发线索reveal
4. 每次回复须包含[情绪状态]标签
5. 回复控制在100字以内
6. 回复后须添加线索判定结果

用户提问：${userMessage}`;

        return prompt;
    },

    formatHistory(history, npcName) {
        if (history.length === 0) return '（刚开始对话）';
        return history.slice(-6).map(entry => {
            if (entry.role === 'user') {
                return `侦探：${entry.content}`;
            } else {
                const emotion = entry.emotion || '平静';
                return `${npcName}[${emotion}]：${entry.content}`;
            }
        }).join('\n');
    },

    /**
     * 提取时间上下文
     * @param {string} userMessage - 用户消息
     * @returns {string|null} 时间上下文
     */
    extractTimeContext(userMessage) {
        const timeKeywords = ['几点', '什么时候', '何时', '时间', '上午', '下午', '晚上', '傍晚', '深夜', '凌晨'];
        
        for (const keyword of timeKeywords) {
            if (userMessage.includes(keyword)) {
                // 根据关键词返回相关时间上下文
                if (keyword.includes('几点') || keyword.includes('时间')) {
                    return '当前时间是晚上9:30，林山庄刚去世约半小时';
                }
                if (keyword.includes('上午') || keyword.includes('下午') || keyword.includes('晚上') || 
                    keyword.includes('傍晚') || keyword.includes('深夜') || keyword.includes('凌晨')) {
                    return '事件发生在今晚8:30，现在是晚上9:30';
                }
                return '事件发生在今晚8:30，现在是晚上9:30';
            }
        }
        
        return null;
    },

    /**
     * 分析情绪触发词
     * @param {string} userMessage - 用户消息
     * @param {Object} character - 角色数据
     * @returns {Array} 触发词数组
     */
    analyzeEmotionalTriggers(userMessage, character) {
        const triggers = [];
        
        // 检查角色的情绪触发器
        if (character.detailedBackground && character.detailedBackground.emotionalTriggers) {
            for (const [trigger, emotion] of Object.entries(character.detailedBackground.emotionalTriggers)) {
                if (userMessage.includes(trigger)) {
                    triggers.push(trigger);
                }
            }
        }
        
        return triggers;
    },

    /**
     * 获取建议情绪
     * @param {Array} triggers - 触发词数组
     * @param {Object} character - 角色数据
     * @returns {string|null} 建议情绪
     */
    getSuggestedEmotion(triggers, character) {
        if (triggers.length === 0) return null;
        
        // 返回第一个触发词对应的情绪
        const trigger = triggers[0];
        if (character.detailedBackground && character.detailedBackground.emotionalTriggers) {
            return character.detailedBackground.emotionalTriggers[trigger] || null;
        }
        
        return null;
    },

    // 新增辅助方法
    getRevealedCluesString() {
        const revealedClueIds = AIClueManager.getTriggeredClues();
        if (revealedClueIds.length === 0) return '无';
        
        // 获取线索详细信息
        const revealedClues = revealedClueIds.map(clueId => {
            const clueInfo = AIClueManager.getClueById(clueId);
            return clueInfo || { id: clueId, name: clueId };
        });
        
        return revealedClues.map(clue => clue.name).join('、');
    },

    buildSpecialContext(potentialClues) {
        const contexts = [];
        
        // 针对不同角色的特殊上下文 
        if (this.currentNPC === 'chen_yaqin') { 
            if (AIClueManager.hasClue('clue_poison_bottle')) { 
                contexts.push('注意：玩家可能已经发现了毒药瓶'); 
            } 
            if (AIClueManager.hasClue('clue_chen_garden')) { 
                contexts.push('注意：玩家知道你白天在花园活动'); 
            } 
            if (AIClueManager.hasClue('clue_love_letter')) { 
                contexts.push('注意：玩家可能已经发现了你与老陈的情书'); 
            } 
        } 
        
        if (this.currentNPC === 'laochen') { 
            if (AIClueManager.hasClue('clue_love_letter')) { 
                contexts.push('注意：玩家已经发现了情书，知道你们的关系'); 
            } 
            if (AIClueManager.hasClue('clue_cellar_key')) { 
                contexts.push('注意：玩家可能问到备用钥匙的事'); 
            } 
        } 
        
        // 根据对话次数添加提示 
        const dialogueCount = this.dialogueHistory.length; 
        if (dialogueCount > 15) { 
            contexts.push('注意：对话次数较多，可以逐渐露出更多破绽'); 
        } 
        
        // 根据潜在线索添加提示 
        if (potentialClues && potentialClues.length > 0) { 
            contexts.push(`注意：玩家的提问可能涉及以下线索：${potentialClues.map(c => c.name).join('、')}`); 
        } 
        
        return contexts.length > 0 ? contexts.join('\n') : '无特殊上下文';
    },

    buildClueTriggersText(npcId) { 
        const clueRules = ClueTriggerRules[npcId] || []; 
        const characterConfig = CharacterPersonalities[npcId]?.roleplayConfig?.clueTriggers || []; 
        
        return clueRules.map((clue, index) => { 
            // 从 roleplayConfig 中找到对应的配置 
            const configClue = characterConfig.find(c => c.id === clue.id); 
            
            // 格式化触发条件 
            const triggerCondition = clue.triggers.map(trigger => { 
                return `提到"${trigger.keywords.join('/')}"相关内容${trigger.count}次以上`; 
            }).join(' 或 '); 
            
            // 检查前置条件 
            const prerequisiteText = clue.prerequisite ? 
                `(需要先获得：${clue.prerequisite.join('、')})` : ''; 
            
            return ` 
${index + 1}. 【${clue.name}】${prerequisiteText} 
触发条件：${triggerCondition} 
触发回复：${clue.response} 
线索ID：${clue.id} 
判定规则：${configClue?.judgmentRule || '当回复符合触发模式时'}`; 
        }).join('\n'); 
    },

    handleClueReveal(clueId) {
        console.log(`[线索触发] AI揭示了线索: ${clueId}`);
        
        // 更新线索管理器
        AIClueManager.revealClue(clueId);
        
        // 显示通知
        const clueInfo = AIClueManager.getClueById(clueId);
        const message = `获得新线索: ${clueInfo?.name || clueId}`;
        
        if (UIManager && UIManager.showToast) {
            UIManager.showToast(message);
        } else {
            alert(message);
        }
    },

    // 新增工具方法
    getClueInfoById(clueId) {
        // 先从 ClueTriggerRules 查找
        for (const [npcId, rules] of Object.entries(ClueTriggerRules)) {
            const rule = rules.find(r => r.id === clueId);
            if (rule) return rule;
        }
        
        // 再从 ClueData 查找
        return window.ClueData?.[clueId] || { name: clueId };
    },

    getMaxDialogueCount(npcId) {
        const npc = window.AIMiddleware?.NpcData?.[npcId];
        return npc?.dialogueMax || 20;
    },

    // 对话计数相关方法
    updateDialogueCount(npcId) {
        const remaining = this.getRemainingCount(npcId);
        const element = document.getElementById('dialogue-count-new');
        if (element) {
            element.textContent = `(剩余${remaining}次)`;
        }
    },

    getRemainingCount(npcId) {
        const npc = window.AIMiddleware.NpcData[npcId];
        if (!npc) return 0;
        
        const count = GameState.npcDialogueCount[npcId] || 0;
        const max = npc.dialogueMax || 20;
        return Math.max(0, max - count);
    },

    canTalk(npcId) {
        return this.getRemainingCount(npcId) > 0;
    },

    incrementDialogueCount(npcId) {
        if (!GameState.npcDialogueCount[npcId]) {
            GameState.npcDialogueCount[npcId] = 0;
        }
        GameState.npcDialogueCount[npcId]++;
        this.updateDialogueCount(npcId);
        GameState.save();
    },

    // 测试方法
    async testDialogue(npcId, message) {
        console.log(`--- 测试与 ${CharacterPersonalities[npcId].name} 的对话 ---`);
        const history = DialogueHistoryManager.loadHistory(npcId);
        const character = CharacterPersonalities[npcId];
        const prompt = this.buildBasicPrompt(character, message);
        console.log("--- 构建的提示词 ---\n", prompt);
        const response = await SimpleAIService.sendToOllama(prompt);
        console.log("--- AI原始回复 ---\n", response);
        if(response) {
            const parsed = responseParser.parseResponse(response, npcId);
            console.log("--- 解析后的回复 ---\n", parsed);
            return parsed;
        }
        return "AI无回复";
    },

    getAvailableCluesForNPC(npcId) {
        const clueRules = ClueTriggerRules[npcId] || [];
        return clueRules.filter(clue => {
            // 检查前置条件
            const prerequisiteMet = !clue.prerequisite || 
                clue.prerequisite.every(preClueId => AIClueManager.hasClue(preClueId));
            
            // 检查是否已经触发
            const notRevealed = !AIClueManager.hasClue(clue.id);
            
            return prerequisiteMet && notRevealed;
        });
    }
};