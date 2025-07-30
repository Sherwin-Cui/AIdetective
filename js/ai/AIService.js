// AI服务主文件
import { AIConfig } from '../config/aiConfig.js';
import { DialogueAI } from './DialogueAI.js';
import { DialogueHistoryManager } from './DialogueHistory.js';
import { DialogueAnalyzer } from './DialogueAnalyzer.js';
import { AIClueManager } from './ClueManager.js';
import { UIManager } from '../ui/UIManager.js';

// 基础AI服务
export const SimpleAIService = {
    async checkConnection() {
        // DeepSeek API 不提供健康检查端点，我们假设连接正常
        // 实际的连接检查会在第一次API调用时进行
        return true;
    },

    async sendToDeepSeek(prompt) {
        const url = `${AIConfig.deepseek.baseUrl}/chat/completions`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AIConfig.deepseek.apiKey}`
                },
                body: JSON.stringify({
                    model: AIConfig.deepseek.model,
                    messages: [
                        { 
                            role: "system", 
                            content: "你是一个推理游戏中的角色，请严格按照角色设定回复。" 
                        },
                        { 
                            role: "user", 
                            content: prompt 
                        }
                    ],
                    stream: false,
                    temperature: 0.5, // 降低温度以提高响应一致性
                    max_tokens: 500 // 增加最大令牌数以允许更长的响应
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`DeepSeek API错误: ${response.status} - ${errorBody}`);
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            }
            return '';
        } catch (error) {
            console.error('[AI] DeepSeek调用失败:', error);
            return null;
        }
    },

    // 保持接口名称不变，内部调用DeepSeek
    async sendToOllama(prompt) {
        return this.sendToDeepSeek(prompt);
    }
};

// 初始化增强版AI
export async function initializeEnhancedAI() {
    console.log('[AI] 初始化增强版AI中间层...');
    
    const isConnected = await SimpleAIService.checkConnection();
    if (!isConnected) {
        console.warn('[AI] DeepSeek服务连接待确认');
        if (UIManager && UIManager.showResultModal) {
            UIManager.showResultModal(
                'AI服务提醒', 
                'AI服务正在初始化，请确保网络连接正常。'
            );
        }
    } else {
        console.log('[AI] 连接成功 ✅');
    }
    
    // 初始化线索系统
    AIClueManager.init();
    
    // 初始化对话系统
    DialogueAI.init();
    
    return isConnected;
}

// 全局暴露的AI中间件对象
window.AIMiddleware = {
    NpcData: {
        'laochen': { 
            name: '管家', 
            identity: '山庄管家', 
            avatar: 'assets/characters/laochen/respectful.png' 
        },
        'lin_chen': { 
            name: '林晨', 
            identity: '死者长子', 
            avatar: 'assets/characters/lin_chen/impatient.png' 
        },
        'chen_yaqin': { 
            name: '陈雅琴', 
            identity: '死者妻子', 
            avatar: 'assets/characters/chen_yaqin/calm.png' 
        },
        'xiaomei': { 
            name: '小美', 
            identity: '女仆', 
            avatar: 'assets/characters/xiaomei/nervous.png' 
        },
        'doctor_li': { 
            name: '李医生', 
            identity: '家庭医生', 
            avatar: 'assets/characters/doctor_li/professional.png' 
        }
    },
    
    DialogueSystem: {
        startDialogueNew: (npcId) => DialogueAI.startDialogue(npcId),
        sendMessageNew: () => DialogueAI.sendMessage()
    },
    
    initialize: initializeEnhancedAI
};

// 调试工具
window.debugAI = {
    async testConnection() {
        const connected = await SimpleAIService.checkConnection();
        console.log('AI连接状态:', connected ? '✅ 已连接' : '❌ 未连接');
        return connected;
    },
    
    async testDialogue(npcId = 'laochen', message = '你好') {
        console.log(`--- 测试与 ${npcId} 的对话 ---`);
        const result = await DialogueAI.testDialogue(npcId, message);
        return result;
    },
    
    showConfig: () => {
        import('../config/aiConfig.js').then(module => {
            console.log('当前角色设定:', module.CharacterPersonalities);
        });
    },
    
    clearHistory: () => {
        DialogueHistoryManager.clearAllHistory();
        console.log("所有对话历史已清除。");
    }
};

// 调试线索工具
window.debugClues = {
    showTriggerStatus() {
        console.log('=== 线索触发状态 ===');
        console.log('已触发线索:', Array.from(AIClueManager.triggeredClues));
        console.log('关键词计数:', DialogueAnalyzer.keywordCounts);
        console.log('对话轮次:', DialogueAnalyzer.dialogueRounds);
    },
    
    checkNPCClues(npcId) {
        import('../config/aiConfig.js').then(module => {
            console.log(`--- ${npcId} 线索状态 ---`);
            const npcRules = module.ClueTriggerRules[npcId] || [];
            npcRules.forEach(rule => {
                const triggered = AIClueManager.hasClue(rule.id) ? '✅' : '❌';
                console.log(`${triggered} ${rule.id}: ${rule.name}`);
            });
            console.log('关键词计数:', DialogueAnalyzer.keywordCounts[npcId] || {});
        });
    },

    simulateKeywords(npcId, message, rounds = 1) {
        console.log(`--- 模拟对 ${npcId} 说: "${message}" (${rounds}次) ---`);
        for (let i = 0; i < rounds; i++) {
            const potential = DialogueAnalyzer.analyzeUserInput(npcId, message, []);
            if (potential.length > 0) {
                console.log(`第 ${i+1} 次模拟: 发现潜在线索:`, potential.map(p => p.id));
            } else {
                console.log(`第 ${i+1} 次模拟: 未发现潜在线索`);
            }
        }
        this.showTriggerStatus();
    }
};

console.log('增强版AI中间层已加载完成');
console.log('调试命令: debugAI.testConnection(), debugAI.testDialogue("laochen", "你好"), debugAI.clearHistory()');
console.log('线索调试: debugClues.showTriggerStatus(), debugClues.checkNPCClues("chen_yaqin")');