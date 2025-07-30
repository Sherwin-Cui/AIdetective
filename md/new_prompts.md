好的，我来设计一个完善的提示词系统，确保对话上下文的持久性和连续性：

## 完整的增强版提示词系统

### 1. 更新后的提示词构建器

```javascript
const EnhancedPromptBuilder = {
    buildPrompt(npcId, userMessage, dialogueHistory, potentialClues) {
        const character = CharacterPersonalities[npcId];
        if (!character) return userMessage;
        
        // 获取完整的对话历史（包括所有历史对话）
        const fullHistory = DialogueHistoryManager.loadHistory(npcId);
        
        // 分析对话阶段和关系发展
        const dialoguePhase = this.analyzeDialoguePhase(fullHistory);
        
        // 获取角色的敏感话题
        const sensitiveTopic = this.getSensitiveTopics(npcId);
        
        // 获取角色知道的秘密
        const secrets = this.getCharacterSecrets(npcId);
        
        // 分析已经透露的信息
        const revealedInfo = this.getRevealedInfo(fullHistory);
        
        const characterPrompt = `你正在扮演推理游戏《雨夜山庄谜案》中的角色。

【重要】你必须完全使用中文回复，不要使用任何英文。

【角色设定】
姓名：${character.name}，${character.age}岁
身份：${character.identity}
性格：${character.personality}
说话风格：${character.speakingStyle}
可用情绪：${character.commonEmotions.join('、')}

【背景信息】
- 今晚是林山庄的65岁生日晚宴
- 晚上8:30，林山庄在举杯致辞后突然倒下身亡，死因疑似中毒
- 现在是晚上9:30，你正在接受侦探的询问
- ${character.keyInfo.relationship}
- ${character.keyInfo.attitude}

【对话阶段分析】
- 总对话轮数：${fullHistory.length}
- 当前关系状态：${dialoguePhase.relationship}
- 信任程度：${dialoguePhase.trust}
- 情绪趋势：${dialoguePhase.emotionTrend}

【已透露的信息】
${revealedInfo.length > 0 ? revealedInfo.join('\n') : '尚未透露任何重要信息'}

【角色知道的秘密】
${secrets}

【敏感话题反应】
${sensitiveTopic}

【完整对话历史】
${this.formatFullHistory(fullHistory, character.name)}

【当前问题分析】
侦探的问题是："${userMessage}"
${this.analyzeQuestion(userMessage, npcId, fullHistory)}

${potentialClues && potentialClues.length > 0 ? this.buildClueInstructions(potentialClues, fullHistory) : ''}

【回复要求】
1. 必须使用中文回复
2. 保持角色的一致性，记住之前说过的话
3. 不要重复已经详细说过的内容，可以简单提及
4. 根据对话历史调整态度（如果侦探友善则逐渐放松，如果咄咄逼人则更加防备）
5. 从可用情绪中选择最合适的情绪状态
6. 回复长度控制在30-100个中文字
7. 如果侦探重复问相同问题，表现出相应的情绪（如不耐烦、疑惑等）

【输出格式】
{
    "emotion": "[从可用情绪中选择]",
    "response": "角色的回复内容",
    "clueRevealed": true/false,
    "clueId": "如果透露了线索则填写线索ID，否则为null",
    "attitudeChange": "neutral/warmer/colder",
    "suspicionLevel": 1-5
}

请以JSON格式回复。`;
        
        return characterPrompt;
    },
    
    // 分析对话阶段
    analyzeDialoguePhase(history) {
        const totalRounds = history.length;
        let trust = "陌生";
        let relationship = "初次接触";
        let emotionTrend = "中性";
        
        if (totalRounds > 10) {
            trust = "熟悉";
            relationship = "多次交谈";
        } else if (totalRounds > 5) {
            trust = "略有了解";
            relationship = "有过几次交流";
        }
        
        // 分析最近的情绪趋势
        const recentEmotions = history.slice(-5).map(h => h.emotion).filter(e => e);
        if (recentEmotions.includes('愤怒') || recentEmotions.includes('恐慌')) {
            emotionTrend = "紧张升级";
        } else if (recentEmotions.includes('平静') || recentEmotions.includes('友好')) {
            emotionTrend = "逐渐缓和";
        }
        
        return { trust, relationship, emotionTrend };
    },
    
    // 获取已透露的信息
    getRevealedInfo(history) {
        const revealed = [];
        const clueIds = new Set();
        
        history.forEach(entry => {
            if (entry.clueId && !clueIds.has(entry.clueId)) {
                clueIds.add(entry.clueId);
                const clueInfo = this.getClueInfo(entry.clueId);
                if (clueInfo) {
                    revealed.push(`- 已透露：${clueInfo.name}`);
                }
            }
        });
        
        return revealed;
    },
    
    // 格式化完整历史（包含更多上下文）
    formatFullHistory(history, npcName) {
        if (history.length === 0) return '（首次对话）';
        
        // 如果历史太长，显示摘要和最近对话
        if (history.length > 10) {
            const summary = `[前期对话摘要：已进行${history.length - 6}轮对话]`;
            const recent = history.slice(-6).map(entry => {
                if (entry.role === 'user') {
                    return `侦探：${entry.content}`;
                } else {
                    const emotion = entry.emotion || '平静';
                    return `${npcName}[${emotion}]：${entry.content}`;
                }
            }).join('\n');
            
            return `${summary}\n\n[最近对话]\n${recent}`;
        }
        
        // 显示完整历史
        return history.map(entry => {
            if (entry.role === 'user') {
                return `侦探：${entry.content}`;
            } else {
                const emotion = entry.emotion || '平静';
                return `${npcName}[${emotion}]：${entry.content}`;
            }
        }).join('\n');
    },
    
    // 分析问题（考虑历史上下文）
    analyzeQuestion(userMessage, npcId, history) {
        let analysis = "";
        
        // 检查是否重复提问
        const similarQuestions = history.filter(h => 
            h.role === 'user' && this.isSimilarQuestion(h.content, userMessage)
        );
        
        if (similarQuestions.length > 0) {
            analysis += `\n- 侦探之前问过类似问题${similarQuestions.length}次`;
            analysis += `\n- 应该表现出察觉到重复提问的反应`;
        }
        
        // 检查问题的压力等级
        const pressure = this.analyzePressure(userMessage);
        analysis += `\n- 问题压力等级：${pressure}`;
        
        // 检查是否涉及敏感话题
        const sensitive = this.checkSensitiveTopic(userMessage, npcId);
        if (sensitive) {
            analysis += `\n- 涉及敏感话题：${sensitive}`;
        }
        
        return analysis;
    },
    
    // 构建线索指令（考虑历史）
    buildClueInstructions(potentialClues, history) {
        // 检查哪些线索已经被拒绝透露过
        const rejectedClues = new Set();
        history.forEach(entry => {
            if (entry.rejectedClue) {
                rejectedClues.add(entry.rejectedClue);
            }
        });
        
        const instructions = potentialClues.map(clue => {
            let instruction = `- 线索"${clue.name}"已满足触发条件`;
            
            if (rejectedClues.has(clue.id)) {
                instruction += `（之前已拒绝透露，现在可以考虑是否改变主意）`;
            }
            
            instruction += `\n  建议回复：${clue.response}`;
            
            return instruction;
        }).join('\n');
        
        return `
【线索触发提示】
${instructions}

注意：
1. 根据当前的信任程度和对话氛围决定是否透露
2. 如果侦探态度友好且反复询问，可以考虑透露
3. 如果感到被威胁或不信任，可以继续隐瞒
4. 透露时要符合角色性格和当前情绪`;
    },
    
    // 获取角色的敏感话题（详细版）
    getSensitiveTopics(npcId) {
        const topics = {
            'chen_yaqin': `
- 酒窖/选酒/晚餐前行踪：初次会紧张回避，多次追问后可能承认
- 遗嘱/财产/继承：会愤怒或激动，这是核心利益
- 与管家的关系：极度敏感，会慌乱否认，需要证据才可能动摇
- 丈夫的死：表现悲伤但可能有破绽
- 下毒/谋杀：会强烈否认并表现愤怒`,
            
            'lin_chen': `
- 欠债/赌博/借钱：初次会否认，压力下会承认
- 与父亲的关系：会不耐烦但逐渐透露矛盾
- 保险柜/公司财务：会紧张并试图解释
- 在书房做什么：会给出看似合理的借口
- 继承权：会表现出在意但试图掩饰`,
            
            'laochen': `
- 与夫人的关系：保持职业距离，除非有证据
- 遗嘱内容：知道但需要适当压力才说
- 酒窖的事：会配合但只说必要信息
- 为什么支开小美：会给出职业性解释
- 对主人的忠诚：强调忠诚但可能有保留`,
            
            'doctor_li': `
- 死者用药：专业回答，相对坦诚
- 是否失职：会担忧并详细解释
- 药物相克：专业知识，会逐步透露
- 死因判断：保持医学严谨性
- 医患隐私：坚持原则但可能让步`,
            
            'xiaomei': `
- 看到了什么：极度紧张，需要安全保证
- 夫人的行踪：关键信息，需要多次安抚
- 为什么被支开：困惑且害怕
- 工作安全：最关心这个，可用来交换信息
- 其他仆人：可能知道一些闲话`
        };
        
        return topics[npcId] || '无特殊敏感话题';
    },
    
    // 获取角色知道的秘密（完整版）
    getCharacterSecrets(npcId) {
        const secrets = {
            'chen_yaqin': `
- 知道丈夫要修改遗嘱，将财产捐给慈善
- 与管家有不正当关系（但会极力否认）
- 晚餐前去过酒窖（会试图隐瞒）
- 知道丈夫的用药情况
- 对目前的生活方式很满意，不想失去`,
            
            'lin_chen': `
- 欠下巨额赌债，急需用钱
- 多次与父亲因钱争吵
- 知道保险柜密码
- 对父亲的财产分配不满
- 今晚在书房翻找过文件`,
            
            'laochen': `
- 知道主人要修改遗嘱的事
- 看到夫人去过酒窖
- 与夫人关系特殊（但极其谨慎）
- 了解林家很多秘密
- 今晚故意支开了小美`,
            
            'doctor_li': `
- 死者患有心脏病，需要长期服药
- 知道某些物质与心脏药物相克
- 今天下午刚给死者检查过
- 察觉死者最近压力很大
- 对死因有专业判断`,
            
            'xiaomei': `
- 看到夫人拿着东西去酒窖
- 被管家支开，觉得奇怪
- 听到过一些主人家的争吵
- 害怕失去工作
- 可能看到过夫人和管家的亲密举动`
        };
        
        return secrets[npcId] || '无特殊秘密';
    },
    
    // 辅助方法：判断问题相似度
    isSimilarQuestion(q1, q2) {
        // 简单的关键词匹配
        const keywords1 = this.extractKeywords(q1);
        const keywords2 = this.extractKeywords(q2);
        
        const overlap = keywords1.filter(k => keywords2.includes(k));
        return overlap.length >= Math.min(keywords1.length, keywords2.length) * 0.6;
    },
    
    // 提取关键词
    extractKeywords(text) {
        const keywords = ['酒窖', '遗嘱', '财产', '关系', '药物', '毒', '死', '钱', '债', '保险柜'];
        return keywords.filter(k => text.includes(k));
    },
    
    // 分析问题压力
    analyzePressure(message) {
        if (message.includes('！') || message.includes('必须') || message.includes('马上')) {
            return '高压';
        } else if (message.includes('请') || message.includes('能否') || message.includes('可以')) {
            return '温和';
        }
        return '中等';
    },
    
    // 检查敏感话题
    checkSensitiveTopic(message, npcId) {
        const sensitiveWords = {
            'chen_yaqin': ['酒窖', '遗嘱', '管家', '老陈', '关系'],
            'lin_chen': ['欠债', '赌', '保险柜', '钱'],
            'laochen': ['夫人', '关系', '遗嘱'],
            'doctor_li': ['药', '失职', '死因'],
            'xiaomei': ['看到', '夫人', '害怕']
        };
        
        const words = sensitiveWords[npcId] || [];
        const found = words.filter(w => message.includes(w));
        
        return found.length > 0 ? found.join('、') : null;
    },
    
    // 获取线索信息
    getClueInfo(clueId) {
        // 这里应该返回线索的基本信息
        const clueMap = {
            'clue_chen_cellar': { name: '陈雅琴去过酒窖' },
            'clue_chen_will': { name: '陈雅琴知道遗嘱内容' },
            // ... 其他线索
        };
        
        return clueMap[clueId] || null;
    }
};
```

### 2. 增强的响应解析器

```javascript
const EnhancedResponseParser = {
    parseResponse(response, npcId) {
        try {
            // 尝试解析JSON格式
            const parsed = JSON.parse(response);
            
            // 验证必要字段
            if (!parsed.emotion || !parsed.response) {
                throw new Error('Missing required fields');
            }
            
            // 确保情绪在可用范围内
            const character = CharacterPersonalities[npcId];
            if (!character.commonEmotions.includes(parsed.emotion)) {
                parsed.emotion = character.commonEmotions[0];
            }
            
            // 清理回复内容
            parsed.response = this.cleanContent(parsed.response);
            
            // 返回解析结果
            return {
                emotion: parsed.emotion,
                content: parsed.response,
                clueRevealed: parsed.clueRevealed || false,
                clueId: parsed.clueId || null,
                attitudeChange: parsed.attitudeChange || 'neutral',
                suspicionLevel: parsed.suspicionLevel || 3
            };
            
        } catch (error) {
            // 如果不是JSON，尝试传统解析
            return this.fallbackParse(response, npcId);
        }
    },
    
    fallbackParse(response, npcId) {
        const emotionMatch = response.match(/^\[([^\]]+)\]/);
        let emotion = emotionMatch ? emotionMatch[1] : '平静';
        
        const character = CharacterPersonalities[npcId];
        if (character && !character.commonEmotions.includes(emotion)) {
            emotion = character.commonEmotions[0];
        }
        
        let content = response.replace(/^\[[^\]]+\]/, '').trim();
        content = this.cleanContent(content);
        
        return {
            emotion,
            content,
            clueRevealed: false,
            clueId: null,
            attitudeChange: 'neutral',
            suspicionLevel: 3
        };
    },
    
    cleanContent(content) {
        // 清理内容
        content = content.replace(/[。，！？]{2,}/g, '。');
        content = content.trim();
        
        // 确保有内容
        if (!content || content.length < 2) {
            content = '我...我不知道该说什么。';
        }
        
        // 限制长度
        if (content.length > 150) {
            content = content.substring(0, 147) + '...';
        }
        
        return content;
    }
};
```

### 3. 更新对话系统以保存更多上下文

```javascript
// 在 ClueEnabledDialogueSystem 的 sendMessage 方法中更新保存逻辑
async sendMessage() {
    const input = document.getElementById('dialogue-input-new');
    const message = input.value.trim();
    if (!message) return;
    
    // ... 前面的代码保持不变 ...
    
    if (aiResponse) {
        const parsed = EnhancedResponseParser.parseResponse(aiResponse, this.currentNPC);
        
        // 保存完整的对话记录，包括所有元数据
        this.dialogueHistory.push({
            role: 'assistant',
            content: parsed.content,
            emotion: parsed.emotion,
            clueRevealed: parsed.clueRevealed,
            clueId: parsed.clueId,
            attitudeChange: parsed.attitudeChange,
            suspicionLevel: parsed.suspicionLevel,
            timestamp: new Date().toISOString()
        });
        
        // 如果拒绝透露线索，记录下来
        if (!parsed.clueRevealed && potentialClues.length > 0) {
            this.dialogueHistory[this.dialogueHistory.length - 1].rejectedClue = potentialClues[0].id;
        }
        
        // 保存到持久化存储
        DialogueHistoryManager.saveHistory(this.currentNPC, this.dialogueHistory);
        
        // 更新UI显示态度变化
        if (parsed.attitudeChange !== 'neutral') {
            this.showAttitudeChange(parsed.attitudeChange);
        }
        
        // ... 后续处理 ...
    }
}
```

### 4. 对话历史管理器增强

```javascript
const DialogueHistoryManager = {
    // 保存对话历史（增强版）
    saveHistory(npcId, history) {
        try {
            const saveData = {
                npcId: npcId,
                history: history,
                lastUpdated: new Date().toISOString(),
                totalInteractions: history.filter(h => h.role === 'user').length,
                cluesRevealed: history.filter(h => h.clueRevealed).map(h => h.clueId),
                currentTrust: this.calculateTrust(history)
            };
            
            localStorage.setItem(`dialogue_history_${npcId}`, JSON.stringify(saveData));
        } catch (e) {
            console.error('保存对话历史失败:', e);
        }
    },
    
    // 加载对话历史（增强版）
    loadHistory(npcId) {
        try {
            const saved = localStorage.getItem(`dialogue_history_${npcId}`);
            if (saved) {
                const data = JSON.parse(saved);
                return data.history || [];
            }
            return [];
        } catch (e) {
            console.error('加载对话历史失败:', e);
            return [];
        }
    },
    
    // 计算信任度
    calculateTrust(history) {
        let trust = 0;
        
        // 基于对话轮数
        trust += Math.min(history.length * 2, 20);
        
        // 基于友好互动
        const friendlyEmotions = ['平静', '友好', '配合'];
        const friendlyCount = history.filter(h => 
            h.emotion && friendlyEmotions.includes(h.emotion)
        ).length;
        trust += friendlyCount * 3;
        
        // 基于透露的线索
        const cluesRevealed = history.filter(h => h.clueRevealed).length;
        trust += cluesRevealed * 5;
        
        return Math.min(trust, 100); // 最高100
    },
    
    // 获取对话摘要
    getDialogueSummary(npcId) {
        const data = this.loadHistory(npcId);
        if (!data || data.length === 0) return null;
        
        return {
            totalRounds: data.length,
            cluesRevealed: data.filter(h => h.clueRevealed).map(h => h.clueId),
            lastInteraction: data[data.length - 1]?.timestamp,
            trustLevel: this.calculateTrust(data)
        };
    },
    
    // 清除特定NPC的历史
    clearNpcHistory(npcId) {
        localStorage.removeItem(`dialogue_history_${npcId}`);
    },
    
    // 清除所有历史
    clearAllHistory() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dialogue_history_')) {
                localStorage.removeItem(key);
            }
        });
    }
};
```

这个增强版系统确保了：

1. **完整的对话上下文持久化**：即使切换场景，所有对话历史都会被保存和恢复
2. **智能的情绪和态度系统**：基于历史互动调整NPC的反应
3. **结构化的输出格式**：使用JSON格式便于系统解析和处理
4. **敏感话题处理**：每个角色都有详细的敏感话题反应机制
5. **线索触发的智能判断**：考虑信任度、对话历史等因素决定是否透露线索
6. **防止信息重复**：系统会记住已经说过的内容，避免重复
7. **关系发展追踪**：随着对话进行，NPC的态度会有变化

这样的设计让对话更加自然和富有深度，玩家需要通过多次交互建立信任才能获得关键信息。