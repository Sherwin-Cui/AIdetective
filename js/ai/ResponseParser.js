// js/ai/ResponseParser.js

/**
 * AI响应解析器
 * 负责解析AI返回的响应并提取情绪、内容等信息
 */
export class ResponseParser {
    constructor() {
        // 情绪映射表 - 根据实际素材文件调整
        this.emotionMap = {
            // 老陈 (laochen) 的情绪
            '恭敬': 'respectful',
            '平静': 'neutral',    // laochen 使用 neutral.png
            '内疚': 'guilty',
            '克制': 'restrained',
            '警惕': 'wary',
            
            // 陈雅琴 (chen_yaqin) 的情绪
            '紧张': 'nervous',
            '恐慌': 'panicked',
            '悲伤': 'sad',
            '愤怒': 'angry',
            '冷静': 'calm',      // chen_yaqin 使用 calm.png
            
            // 林晨 (lin_chen) 的情绪
            '焦躁': 'anxious',
            '不耐烦': 'impatient',
            '复杂': 'conflicted',
            
            // 李医生 (doctor_li) 的情绪
            '专业': 'professional',
            '谨慎': 'cautious',
            '担忧': 'worried',
            '震惊': 'shocked',
            
            // 小美 (xiaomei) 的情绪
            '害怕': 'scared',
            '犹豫': 'hesitant',
            
            // 备用映射（当某些角色没有特定表情时的后备选项）
            '防备': 'defensive',
            '回避': 'evasive',
            '慌乱': 'flustered',
            '职业': 'professional',
            '纠结': 'conflicted'
        };
    }

    /**
     * 解析AI响应，并处理游戏事件
     * @param {string} response - AI原始响应
     * @param {string} npcId - NPC ID
     * @returns {Object} 解析后的响应对象
     */
    parseWithGameEvents(response, npcId) {
        let cleanResponse = response;

        // 提取并移除 <game_phase>
        const gamePhaseMatch = cleanResponse.match(/<game_phase>(.*?)<\/game_phase>/);
        const gamePhase = gamePhaseMatch ? gamePhaseMatch[1].trim() : null;
        if (gamePhaseMatch) {
            cleanResponse = cleanResponse.replace(/<game_phase>.*?<\/game_phase>/, '').trim();
        }

        // 提取并移除 <game_ending>
        const gameEndingMatch = cleanResponse.match(/<game_ending>(.*?)<\/game_ending>/);
        const gameEnding = gameEndingMatch ? gameEndingMatch[1].trim() : null;
        if (gameEndingMatch) {
            cleanResponse = cleanResponse.replace(/<game_ending>.*?<\/game_ending>/, '').trim();
        }

        // 提取并移除 <clue_check>
        const clueCheckMatch = cleanResponse.match(/<clue_check>([\s\S]*?)<\/clue_check>/);
        let clueCheckData = null;
        if (clueCheckMatch) {
            cleanResponse = cleanResponse.replace(/<clue_check>[\s\S]*?<\/clue_check>/, '').trim();
            try {
                clueCheckData = JSON.parse(clueCheckMatch[1]);
            } catch (e) {
                console.error('解析线索检查数据失败:', e);
            }
        }

        // 使用现有解析器处理剩余部分
        const parsed = this.parseResponse(cleanResponse, npcId);

        return {
            ...parsed,
            gamePhase,
            gameEnding,
            clueCheck: clueCheckData
        };
    }

    /**
     * 解析AI响应
     * @param {string} response - AI原始响应
     * @param {string} npcId - NPC ID
     * @returns {Object} 解析后的响应对象
     */
    parseResponse(response, npcId) {
        // 提取情绪（支持中文方括号）
        const emotionMatch = response.match(/^[\[【](.*?)[\]】]/);
        const emotion = emotionMatch ? emotionMatch[1] : '平静';
        
        // 验证情绪是否有效
        const character = this.getCharacterData(npcId);
        if (character && character.commonEmotions && !character.commonEmotions.includes(emotion)) {
            console.warn(`[ResponseParser] 无效情绪 "${emotion}"，使用默认情绪`);
            // 不再强制使用默认情绪，而是保持AI返回的情绪
        }
        
        // 提取内容（移除情绪标签）
        let content = response.replace(/^[\[【].*?[\]】]\s*/, '').trim();
        
        // 清理内容
        content = this.cleanContent(content);
        
        // 验证内容长度
        if (content.length > 100) {
            content = content.substring(0, 100) + '...';
        }
        
        return {
            emotion: emotion,
            emotionCode: this.emotionMap[emotion] || 'calm',
            content: content,
            original: response,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 清理文本内容
     * @param {string} content - 原始内容
     * @returns {string} 清理后的内容
     */
    cleanContent(content) {
        // 移除多余的空格
        content = content.replace(/\s+/g, ' ').trim();
        
        // 移除重复的标点符号
        content = content.replace(/[。，！？]{2,}/g, (match) => match[0]);
        
        // 移除开头的标点
        content = content.replace(/^[，。！？]+/, '');
        
        // 确保句子结尾有标点
        if (content && !/[。！？]$/.test(content)) {
            content += '。';
        }
        
        // 处理引号不匹配
        const leftQuotes = (content.match(/"/g) || []).length;
        const rightQuotes = (content.match(/"/g) || []).length;
        if (leftQuotes > rightQuotes) {
            content += '"';
        }
        
        // 确保有内容
        if (!content || content.length < 2) {
            content = this.getDefaultResponse();
        }
        
        return content;
    }

    /**
     * 获取默认响应
     * @returns {string} 默认响应文本
     */
    getDefaultResponse() {
        const defaults = [
            '我...我不知道该说什么。',
            '这个...让我想想...',
            '我需要想一想。',
            '......'
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    /**
     * 获取角色数据
     * @param {string} npcId - NPC ID
     * @returns {Object|null} 角色数据
     */
    getCharacterData(npcId) {
        // 这里应该从配置中获取角色数据
        // 为了避免循环依赖，可以通过依赖注入或全局配置获取
        if (window.CharacterPersonalities) {
            return window.CharacterPersonalities[npcId];
        }
        return null;
    }

    /**
     * 验证响应格式
     * @param {string} response - AI响应
     * @returns {boolean} 是否为有效格式
     */
    validateResponseFormat(response) {
        // 检查是否包含情绪标记
        const hasEmotion = /^\[.+\]/.test(response);
        
        // 检查是否有内容
        const content = response.replace(/^\[[^\]]+\]/, '').trim();
        const hasContent = content.length > 0;
        
        return hasEmotion && hasContent;
    }

    /**
     * 提取可能的线索信息
     * @param {string} response - AI响应
     * @param {string} npcId - NPC ID
     * @returns {Array} 可能触发的线索列表
     */
    extractPotentialClues(response, npcId) {
        const potentialClues = [];
        
        // 获取该NPC的线索触发规则
        if (window.ClueTriggerRules && window.ClueTriggerRules[npcId]) {
            const rules = window.ClueTriggerRules[npcId];
            
            rules.forEach(rule => {
                if (rule.revealPattern && rule.revealPattern.test(response)) {
                    potentialClues.push({
                        id: rule.id,
                        name: rule.name,
                        pattern: rule.revealPattern,
                        importance: rule.importance
                    });
                }
            });
        }
        
        return potentialClues;
    }

    /**
     * 分析情绪变化
     * @param {Array} dialogueHistory - 对话历史
     * @returns {Object} 情绪分析结果
     */
    analyzeEmotionTrend(dialogueHistory, character) {
        if (!dialogueHistory || dialogueHistory.length === 0) {
            return {
                dominantEmotion: '平静',
                stability: 0.5,
                intensity: 0.3,
                changes: []
            };
        }
        
        // 获取最近10条对话进行分析
        const recentEntries = dialogueHistory.slice(-10);
        const emotionCounts = {};
        const emotionIntensities = {};
        
        // 定义情绪强度映射
        const emotionIntensityMap = {
            '愤怒': 0.9,
            '震惊': 0.85,
            '恐惧': 0.8,
            '悲伤': 0.7,
            '焦虑': 0.75,
            '紧张': 0.65,
            '怀疑': 0.6,
            '困惑': 0.5,
            '警惕': 0.55,
            '平静': 0.3,
            '友好': 0.4,
            '高兴': 0.45
        };
        
        recentEntries.forEach(entry => {
            if (entry.emotion) {
                emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
                emotionIntensities[entry.emotion] = emotionIntensityMap[entry.emotion] || 0.3;
            }
        });
        
        // 找出主导情绪
        let dominantEmotion = '平静';
        let maxCount = 0;
        let totalIntensity = 0;
        let totalCount = 0;
        
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > maxCount) {
                dominantEmotion = emotion;
                maxCount = count;
            }
            
            totalIntensity += (emotionIntensities[emotion] || 0.3) * count;
            totalCount += count;
        }
        
        // 计算稳定性（0-1之间，1表示完全稳定）
        const stability = totalCount > 0 ? maxCount / totalCount : 0.5;
        
        // 计算平均强度
        const intensity = totalCount > 0 ? totalIntensity / totalCount : 0.3;
        
        // 分析情绪变化趋势
        const changes = recentEntries.map((entry, index) => ({
            index,
            message: entry.message.substring(0, 30) + (entry.message.length > 30 ? '...' : ''),
            emotion: entry.emotion || '未知',
            intensity: emotionIntensityMap[entry.emotion] || 0.3
        }));
        
        // 检测情绪波动
        let波动 = false;
        if (changes.length > 1) {
            for (let i = 1; i < changes.length; i++) {
                const intensityDiff = Math.abs(changes[i].intensity - changes[i-1].intensity);
                if (intensityDiff > 0.3) {
                   波动 = true;
                    break;
                }
            }
        }
        
        return {
            dominantEmotion,
            stability,
            intensity,
           波动,
            changes
        };
    }

    /**
     * 生成情绪报告
     * @param {string} npcId - NPC ID
     * @param {Array} dialogueHistory - 对话历史
     * @returns {string} 情绪分析报告
     */
    generateEmotionReport(npcId, dialogueHistory) {
        const analysis = this.analyzeEmotionTrend(dialogueHistory);
        const { dominantEmotion, stability, intensity, 波动, changes } = analysis;
        
        // 计算情绪分布
        const emotionCounts = {};
        changes.forEach(change => {
            if (change.emotion && change.emotion !== '未知') {
                emotionCounts[change.emotion] = (emotionCounts[change.emotion] || 0) + 1;
            }
        });
        
        const emotionDistribution = Object.entries(emotionCounts)
            .map(([emotion, count]) => `${emotion}(${count})`)
            .join(', ');
        
        const character = this.getCharacterData(npcId);
        const characterName = character ? character.name : npcId;
        
        return `=== ${characterName} 情绪分析报告 ===
主导情绪：${dominantEmotion}
情绪稳定性：${(stability * 100).toFixed(1)}%
情绪强度：${(intensity * 100).toFixed(1)}%
情绪波动：${波动 ? '存在波动' : '相对稳定'}
情绪分布：${emotionDistribution || '无'}
最近对话数：${changes.length}`;
    }
}

// 创建单例实例
export const responseParser = new ResponseParser();

// 为了兼容性，也暴露到全局
if (typeof window !== 'undefined') {
    window.ResponseParser = ResponseParser;
    window.responseParser = responseParser;
}