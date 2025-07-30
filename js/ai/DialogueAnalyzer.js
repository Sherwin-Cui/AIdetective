// 对话分析器
import { ClueTriggerRules } from '../config/aiConfig.js';
import { AIClueManager } from './ClueManager.js';

export const DialogueAnalyzer = {
    keywordCounts: {},
    dialogueRounds: {},
    
    analyzeUserInput(npcId, userMessage, dialogueHistory) {
        // 初始化NPC的计数器
        if (!this.keywordCounts[npcId]) {
            this.keywordCounts[npcId] = {};
        }
        
        if (!this.dialogueRounds[npcId]) {
            this.dialogueRounds[npcId] = 0;
        }
        
        // 增加对话轮次
        this.dialogueRounds[npcId]++;
        
        // 获取该NPC的线索触发规则
        const rules = ClueTriggerRules[npcId] || [];
        const potentialClues = [];
        
        // 检查每个规则
        rules.forEach(rule => {
            // 检查前置条件
            if (rule.prerequisite) {
                const hasAllPrerequisites = rule.prerequisite.every(clueId => 
                    AIClueManager.hasClue(clueId)
                );
                if (!hasAllPrerequisites) {
                    return; // 前置条件不满足，跳过
                }
            }
            
            // 检查关键词触发条件
            let allTriggersMatched = true;
            
            rule.triggers.forEach(trigger => {
                let triggerMatched = false;
                
                // 检查该触发器的关键词
                trigger.keywords.forEach(keyword => {
                    if (userMessage.includes(keyword)) {
                        // 增加关键词计数
                        const key = `${rule.id}_${keyword}`;
                        if (!this.keywordCounts[npcId][key]) {
                            this.keywordCounts[npcId][key] = 0;
                        }
                        this.keywordCounts[npcId][key]++;
                        
                        // 检查是否达到触发次数
                        if (this.keywordCounts[npcId][key] >= trigger.count) {
                            triggerMatched = true;
                        }
                    }
                });
                
                if (!triggerMatched) {
                    allTriggersMatched = false;
                }
            });
            
            // 如果所有触发条件都满足，且线索未被触发
            if (allTriggersMatched && !AIClueManager.hasClue(rule.id)) {
                potentialClues.push(rule);
            }
        });
        
        return potentialClues;
    },
    
    analyzeAIResponse(npcId, aiResponse) {
        const rules = ClueTriggerRules[npcId] || [];
        
        // 检查AI回复是否包含了线索揭示的模式
        for (const rule of rules) {
            if (rule.revealPattern && rule.revealPattern.test(aiResponse)) {
                return rule;
            }
        }
        
        return null;
    },
    
    resetCounts(npcId) {
        this.keywordCounts[npcId] = {};
        this.dialogueRounds[npcId] = 0;
        console.log(`[分析器] 重置 ${npcId} 的对话计数`);
    },
    
    getRounds(npcId) {
        return this.dialogueRounds[npcId] || 0;
    },
    
    getKeywordCount(npcId, ruleId, keyword) {
        const key = `${ruleId}_${keyword}`;
        return this.keywordCounts[npcId]?.[key] || 0;
    },
    
    // 获取NPC的线索触发进度
    getClueProgress(npcId) {
        const rules = ClueTriggerRules[npcId] || [];
        const progress = [];
        
        rules.forEach(rule => {
            const ruleProgress = {
                id: rule.id,
                name: rule.name,
                triggered: AIClueManager.hasClue(rule.id),
                triggers: []
            };
            
            // 检查每个触发条件的进度
            rule.triggers.forEach((trigger, index) => {
                let maxProgress = 0;
                let targetKeyword = '';
                
                trigger.keywords.forEach(keyword => {
                    const count = this.getKeywordCount(npcId, rule.id, keyword);
                    const progressPercent = (count / trigger.count) * 100;
                    if (progressPercent > maxProgress) {
                        maxProgress = progressPercent;
                        targetKeyword = keyword;
                    }
                });
                
                ruleProgress.triggers.push({
                    keywords: trigger.keywords,
                    required: trigger.count,
                    current: Math.floor(maxProgress / 100 * trigger.count),
                    progress: Math.min(100, maxProgress),
                    leadKeyword: targetKeyword
                });
            });
            
            progress.push(ruleProgress);
        });
        
        return progress;
    },
    
    // 调试方法：显示NPC的线索触发状态
    debugNpcStatus(npcId) {
        console.log(`=== ${npcId} 线索触发状态 ===`);
        console.log(`对话轮次: ${this.getRounds(npcId)}`);
        console.log('关键词计数:', this.keywordCounts[npcId] || {});
        
        const progress = this.getClueProgress(npcId);
        progress.forEach(rule => {
            const status = rule.triggered ? '✅ 已触发' : '❌ 未触发';
            console.log(`\n${status} ${rule.name} (${rule.id})`);
            
            rule.triggers.forEach((trigger, index) => {
                console.log(`  触发条件 ${index + 1}: ${trigger.current}/${trigger.required} (${trigger.progress.toFixed(0)}%)`);
                console.log(`    关键词: ${trigger.keywords.join(', ')}`);
                if (trigger.leadKeyword) {
                    console.log(`    主要进度: "${trigger.leadKeyword}"`);
                }
            });
        });
    },
    
    // 获取建议的问题（帮助玩家触发线索）
    getSuggestedQuestions(npcId) {
        const progress = this.getClueProgress(npcId);
        const suggestions = [];
        
        progress.forEach(rule => {
            if (!rule.triggered) {
                rule.triggers.forEach(trigger => {
                    if (trigger.progress < 100) {
                        // 基于关键词生成建议问题
                        const keyword = trigger.keywords[0];
                        let suggestion = '';
                        
                        switch (keyword) {
                            case '酒窖':
                                suggestion = '你晚餐前去过酒窖吗？';
                                break;
                            case '遗嘱':
                                suggestion = '你知道林先生的遗嘱内容吗？';
                                break;
                            case '欠债':
                                suggestion = '你最近有经济困难吗？';
                                break;
                            case '药物':
                                suggestion = '林先生平时吃什么药？';
                                break;
                            case '看到':
                                suggestion = '晚餐前你看到了什么异常吗？';
                                break;
                            default:
                                suggestion = `能谈谈关于${keyword}的事情吗？`;
                        }
                        
                        suggestions.push({
                            clueId: rule.id,
                            clueName: rule.name,
                            question: suggestion,
                            progress: trigger.progress
                        });
                    }
                });
            }
        });
        
        // 按进度排序，优先推荐接近完成的
        return suggestions.sort((a, b) => b.progress - a.progress);
    }
};

// 暴露给全局用于调试
window.DialogueAnalyzer = DialogueAnalyzer;