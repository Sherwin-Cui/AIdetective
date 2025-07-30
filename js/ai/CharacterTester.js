// js/ai/CharacterTester.js

/**
 * 角色一致性测试器
 * 用于测试和验证AI角色的一致性及线索一致性
 */

import { CharacterPersonalities } from '../config/aiConfig.js';
import { ClueTriggerRules } from '../config/aiConfig.js';
import { ClueData } from '../config/gameData.js';
import { SimpleAIService } from './AIService.js';

export class CharacterTester {
    /**
     * 测试角色背景信息一致性
     * @param {string} npcId - NPC ID
     * @returns {Promise<Object>} 测试结果
     */
    static async testCharacterConsistency(npcId) {
        const character = CharacterPersonalities[npcId];
        if (!character) {
            return { success: false, error: `角色 ${npcId} 不存在` };
        }
        
        // 构建测试提示词
        const prompt = this.buildConsistencyTestPrompt(character);
        
        try {
            // 发送测试请求
            const response = await SimpleAIService.sendToOllama(prompt);
            
            // 分析响应
            const analysis = this.analyzeConsistencyResponse(response, character);
            
            return {
                success: true,
                npcId,
                characterName: character.name,
                analysis,
                rawResponse: response
            };
        } catch (error) {
            return {
                success: false,
                npcId,
                characterName: character.name,
                error: error.message
            };
        }
    }
    
    /**
     * 构建一致性测试提示词
     * @param {Object} character - 角色数据
     * @returns {string} 提示词
     */
    static buildConsistencyTestPrompt(character) {
        return `你是一个专业的角色扮演剧本审核员。请分析以下角色设定，并指出其中可能存在的逻辑不一致或矛盾之处。

【角色设定】
姓名：${character.name}
年龄：${character.age}
身份：${character.identity}
性格：${character.personality}
说话风格：${character.speakingStyle}
常见情绪：${character.commonEmotions.join('、')}

【详细背景】
时间线：
${Object.entries(character.detailedBackground.timeline).map(([time, event]) => `${time}: ${event}`).join('\n')}

人际关系：
${Object.entries(character.detailedBackground.relationships).map(([person, relation]) => `${person}: ${relation}`).join('\n')}

已知信息：
${Object.entries(character.detailedBackground.knowledge).map(([topic, info]) => `${topic}: ${info}`).join('\n')}

情绪触发器：
${Object.entries(character.detailedBackground.emotionalTriggers).map(([trigger, emotion]) => `${trigger}: ${emotion}`).join('\n')}

请从以下几个方面进行分析：
1. 时间线是否自洽，是否存在时间冲突
2. 人际关系是否合理，是否存在矛盾
3. 已知信息是否与角色身份相符
4. 情绪触发器是否与角色性格匹配
5. 整体设定是否存在逻辑漏洞

请给出详细的分析报告，指出具体问题并提出改进建议。`;
    }
    
    /**
     * 分析一致性响应
     * @param {string} response - AI响应
     * @param {Object} character - 角色数据
     * @returns {Object} 分析结果
     */
    static analyzeConsistencyResponse(response, character) {
        // 这里可以实现更复杂的分析逻辑
        // 目前只是简单返回响应
        return {
            summary: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
            hasIssues: response.toLowerCase().includes('问题') || response.toLowerCase().includes('矛盾') || response.toLowerCase().includes('不一致')
        };
    }
    
    /**
     * 测试线索一致性
     * @param {string} npcId - NPC ID
     * @returns {Promise<Object>} 测试结果
     */
    static async testClueConsistency(npcId) {
        const rules = ClueTriggerRules[npcId];
        if (!rules || rules.length === 0) {
            return { success: false, error: `角色 ${npcId} 没有线索触发规则` };
        }
        
        // 检查线索ID是否在ClueData中存在
        const issues = [];
        
        for (const rule of rules) {
            // 检查规则ID是否在ClueData中存在
            if (!ClueData[rule.id]) {
                issues.push(`线索触发规则 ${rule.id} 在ClueData中不存在`);
            }
            
            // 检查相关线索是否在ClueData中存在
            if (rule.relatedClues) {
                for (const relatedClueId of rule.relatedClues) {
                    if (!ClueData[relatedClueId]) {
                        issues.push(`相关线索 ${relatedClueId} 在ClueData中不存在`);
                    }
                }
            }
            
            // 检查前提线索是否在ClueData中存在
            if (rule.prerequisite) {
                for (const prereqClueId of rule.prerequisite) {
                    if (!ClueData[prereqClueId]) {
                        issues.push(`前提线索 ${prereqClueId} 在ClueData中不存在`);
                    }
                }
            }
        }
        
        return {
            success: true,
            npcId,
            characterName: CharacterPersonalities[npcId]?.name || npcId,
            issues: issues.length > 0 ? issues : null,
            totalRules: rules.length,
            validRules: rules.length - issues.length
        };
    }
    
    /**
     * 运行完整测试
     * @param {string} npcId - NPC ID
     * @returns {Promise<Object>} 完整测试结果
     */
    static async runFullTest(npcId) {
        console.log(`[CharacterTester] 开始对 ${npcId} 进行完整测试`);
        
        const consistencyTest = await this.testCharacterConsistency(npcId);
        const clueTest = await this.testClueConsistency(npcId);
        
        return {
            npcId,
            characterName: CharacterPersonalities[npcId]?.name || npcId,
            consistencyTest,
            clueTest,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * 运行所有角色的完整测试
     * @returns {Promise<Array>} 所有测试结果
     */
    static async runAllTests() {
        const npcIds = Object.keys(CharacterPersonalities);
        const results = [];
        
        for (const npcId of npcIds) {
            const result = await this.runFullTest(npcId);
            results.push(result);
            
            // 添加延迟避免API过载
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return results;
    }
}

// 为了兼容性，也暴露到全局
if (typeof window !== 'undefined') {
    window.CharacterTester = CharacterTester;
}