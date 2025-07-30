// 指认系统配置文件
export const AccusationConfig = {
    // 最少需要收集的线索数量才能开始指认
    minCluesRequired: 1, // 临时降低用于测试
    
    // 每个阶段的评分权重
    phaseWeights: {
        motive: 0.25,
        method: 0.25,
        opportunity: 0.25,
        conspiracy: 0.25
    },
    
    // 证据评分规则
    evidenceScoring: {
        // 每个正确的关键证据得3分
        criticalEvidence: 3,
        // 每个正确的重要证据得2分
        importantEvidence: 2,
        // 每个正确的次要证据得1分
        minorEvidence: 1,
        // 错误证据扣1分
        wrongEvidence: -1
    },
    
    // 各NPC的指认反应配置
    npcAccusationResponses: {
        'chen_yaqin': {
            personality: '表面镇定但内心慌乱，随着证据增多逐渐崩溃',
            initialReaction: '震惊和强烈否认，但有细微的慌乱',
            breakingPoint: '在铁证面前完全崩溃，哭泣着承认一切',
            guiltyBehaviors: [
                '说话时会不自觉地看向管家',
                '提到花园或夹竹桃时明显紧张',
                '过度解释自己的行踪',
                '情绪波动大，从悲伤突然转为愤怒'
            ],
            phaseEmotions: {
                'initial': ['震惊', '愤怒', '悲伤', '紧张'],
                'motive': ['紧张', '愤怒', '慌乱', '防备'],
                'method': ['恐慌', '否认', '狡辩', '崩溃'],
                'opportunity': ['崩溃', '哭泣', '歇斯底里', '绝望'],
                'conspiracy': ['绝望', '愤怒', '认罪', '崩溃'],
                'final': ['崩溃', '悔恨', '解脱', '哭泣']
            }
        },
        'laochen': {
            personality: '职业化的冷静，但对夫人有保护欲',
            initialReaction: '保持管家的恭敬，但措辞谨慎',
            breakingPoint: '在关系被揭露后，可能为保护夫人而承认部分罪行',
            guiltyBehaviors: [
                '回避与夫人相关的问题',
                '强调自己的忠诚来掩饰愧疚',
                '当夫人被指控时表现出异常的紧张',
                '最终可能选择承担罪责'
            ],
            phaseEmotions: {
                'initial': ['冷静', '恭敬', '困惑', '谨慎'],
                'motive': ['克制', '谨慎', '否认', '回避'],
                'method': ['紧张', '回避', '解释', '沉默'],
                'opportunity': ['内疚', '犹豫', '辩解', '紧张'],
                'conspiracy': ['沉默', '愧疚', '供认', '保护'],
                'final': ['认罪', '忏悔', '请求', '牺牲']
            }
        },
        'lin_chen': {
            personality: '暴躁易怒，对指控反应激烈',
            initialReaction: '愤怒的否认，可能会反过来指责侦探',
            breakingPoint: '始终坚持自己的清白，要求道歉',
            innocentBehaviors: [
                '情绪一致性高，愤怒贯穿始终',
                '主动提供不在场证明',
                '指出证据的逻辑漏洞',
                '最后要求赔偿名誉损失'
            ],
            phaseEmotions: {
                'initial': ['愤怒', '不耐烦', '震惊', '激动'],
                'motive': ['焦躁', '否认', '激动', '反击'],
                'method': ['困惑', '愤怒', '讽刺', '不屑'],
                'opportunity': ['坚持', '愤怒', '无奈', '证明'],
                'conspiracy': ['愤怒', '不屑', '嘲讽', '要求道歉'],
                'final': ['愤怒', '委屈', '要求道歉', '威胁']
            }
        },
        'doctor_li': {
            personality: '理性专业，用逻辑对抗指控',
            initialReaction: '冷静分析，指出指控的不合理之处',
            breakingPoint: '坚持专业立场，威胁法律行动',
            innocentBehaviors: [
                '用医学知识反驳指控',
                '保持始终如一的专业态度',
                '提供详细的时间线和证人',
                '表现出对职业声誉的重视'
            ],
            phaseEmotions: {
                'initial': ['震惊', '专业', '冷静', '分析'],
                'motive': ['困惑', '理性', '解释', '澄清'],
                'method': ['专业', '分析', '反驳', '教育'],
                'opportunity': ['冷静', '提供证据', '澄清', '证明'],
                'conspiracy': ['愤怒', '失望', '要求公正', '威胁'],
                'final': ['冷静', '要求道歉', '威胁起诉', '专业']
            }
        },
        'xiaomei': {
            personality: '极度恐惧，完全没有心理准备',
            initialReaction: '立即哭泣，不断否认',
            breakingPoint: '可能因恐惧而昏厥',
            innocentBehaviors: [
                '反应过度但真实',
                '主动说出所有知道的信息',
                '寻求其他人的保护',
                '表现出对权威的极度恐惧'
            ],
            phaseEmotions: {
                'initial': ['恐惧', '哭泣', '否认', '求饶'],
                'motive': ['害怕', '哭泣', '求饶', '无助'],
                'method': ['困惑', '无助', '哭泣', '不懂'],
                'opportunity': ['崩溃', '哭泣', '求助', '颤抖'],
                'conspiracy': ['绝望', '哭泣', '昏厥', '求救'],
                'final': ['崩溃', '求饶', '无助', '昏倒']
            }
        }
    },
    
    // 证据链完整度判定
    evidenceChainCompleteness: {
        perfect: {
            requiredPhases: 4,
            minScorePerPhase: 0.8,
            description: '证据链完整且有力，足以定罪'
        },
        good: {
            requiredPhases: 3,
            minScorePerPhase: 0.6,
            description: '主要证据齐全，但有小漏洞'
        },
        partial: {
            requiredPhases: 2,
            minScorePerPhase: 0.5,
            description: '证据不完整，但指向正确'
        },
        insufficient: {
            requiredPhases: 1,
            minScorePerPhase: 0.3,
            description: '证据严重不足'
        }
    },
    
    // 特殊对话触发条件
    specialDialogueTriggers: {
        'chen_yaqin': {
            mentionLaochen: '提到老陈时会下意识地使用亲昵称呼',
            mentionGarden: '提到花园会立即转移话题',
            mentionInheritance: '提到遗产会激动地反驳'
        },
        'laochen': {
            protectMistress: '当夫人被重点指控时会主动承担责任',
            revealRelationship: '在压力下可能说漏嘴暴露真实关系',
            finalConfession: '最后可能完整供出作案经过'
        }
    },
    
    // 指认阶段配置
    accusationPhases: {
        'initial': {
            name: 'initial',
            title: '初步指认',
            description: '刚开始指认，NPC会强烈否认',
            dialogueThreshold: 2, // 至少对话2轮后才可能要求证据
            pressureRequired: 'low'
        },
        'motive': {
            name: 'motive',
            title: '动机链',
            description: '证明嫌疑人有作案动机',
            requiredEvidence: {
                'chen_yaqin': ['clue_will_draft', 'clue_deduce_inheritance_crisis', 'clue_love_letter'],
                'lin_chen': ['clue_debt_notice', 'clue_lin_debt', 'clue_lin_inheritance'],
                'laochen': ['clue_love_letter', 'clue_will_draft', 'clue_chen_butler_relationship'],
                'doctor_li': [],
                'xiaomei': []
            }
        },
        'method': {
            name: 'method',
            title: '手段链',
            description: '证明嫌疑人如何实施犯罪',
            requiredEvidence: {
                'chen_yaqin': ['clue_poison_bottle', 'clue_deduce_poison_source', 'clue_doctor_drug_interaction'],
                'lin_chen': [],
                'laochen': ['clue_poison_bottle', 'clue_butler_key_management'],
                'doctor_li': ['clue_medical_record', 'clue_doctor_drug_interaction'],
                'xiaomei': []
            }
        },
        'opportunity': {
            name: 'opportunity',
            title: '机会链',
            description: '证明嫌疑人有作案机会',
            requiredEvidence: {
                'chen_yaqin': ['clue_chen_cellar', 'clue_maid_witness', 'clue_cellar_key'],
                'lin_chen': ['clue_lin_safe'],
                'laochen': ['clue_butler_dismiss_maid', 'clue_butler_confirm_cellar'],
                'doctor_li': [],
                'xiaomei': []
            }
        },
        'conspiracy': {
            name: 'conspiracy',
            title: '共谋链',
            description: '揭露共谋关系（如有）',
            requiredEvidence: {
                'chen_yaqin': ['clue_butler_dismiss_maid', 'clue_chen_butler_relationship', 'clue_deduce_conspiracy'],
                'lin_chen': [],
                'laochen': ['clue_love_letter', 'clue_deduce_conspiracy', 'clue_chen_butler_relationship'],
                'doctor_li': [],
                'xiaomei': []
            }
        },
        'final': {
            name: 'final',
            title: '最终对决',
            description: '面对铁证，嫌疑人的反应'
        }
    },

    endings: {
        perfect: {
            title: '完美结局：真相大白',
            description: '你以无可辩驳的证据链，完美地指证了真凶，揭示了所有秘密，让正义得以伸张。',
            music: 'assets/BGM/be/be.mp3'
        },
        good: {
            title: '良好结局：接近真相',
            description: '你成功指认了主犯，但一些次要的谜团未能完全解开。尽管如此，案件的核心已经告破。',
            music: 'assets/BGM/confession/confession.mp3'
        },
        partial: {
            title: '部分结局：留有遗憾',
            description: '你指认了正确的嫌疑人，但由于证据不足，未能完全揭示其作案手法或动机，留下了一些遗憾。',
            music: 'assets/BGM/accusation/accusation.mp3'
        },
        failure: {
            title: '失败结局：真相被掩盖',
            description: '你未能找出真凶，或者错误地指控了无辜的人。真凶逍遥法外，真相被永远地掩盖了。',
            music: 'assets/BGM/all_scenes/scene1.mp3'
        }
    }
};

// 证据重要性映射
export const EvidenceImportance = {
    // 关键证据
    critical: [
        'clue_poison_bottle',
        'clue_will_draft',
        'clue_love_letter',
        'clue_chen_cellar',
        'clue_deduce_conspiracy'
    ],
    // 重要证据
    important: [
        'clue_wine_glass',
        'clue_cellar_key',
        'clue_maid_witness',
        'clue_doctor_drug_interaction',
        'clue_chen_will',
        'clue_butler_dismiss_maid'
    ],
    // 次要证据
    minor: [
        'clue_debt_notice',
        'clue_medical_record',
        'clue_magnifying_glass',
        'clue_lin_debt',
        'clue_doctor_pressure'
    ]
};

// 计算证据得分
export function calculateEvidenceScore(selectedEvidence, requiredEvidence) {
    let score = 0;
    let correctEvidenceCount = 0;
    
    selectedEvidence.forEach(evidenceId => {
        if (requiredEvidence.includes(evidenceId)) {
            correctEvidenceCount++;
            // 根据证据重要性给分
            if (EvidenceImportance.critical.includes(evidenceId)) {
                score += AccusationConfig.evidenceScoring.criticalEvidence;
            } else if (EvidenceImportance.important.includes(evidenceId)) {
                score += AccusationConfig.evidenceScoring.importantEvidence;
            } else {
                score += AccusationConfig.evidenceScoring.minorEvidence;
            }
        } else {
            score += AccusationConfig.evidenceScoring.wrongEvidence;
        }
    });
    
    // 新的判定逻辑：如果没有要求证据，直接返回1
    if (requiredEvidence.length === 0) {
        return 1;
    }
    
    // 放宽判定条件：三个证据中提供两个就判定为通过
    // 计算需要的最少证据数量（至少2个，但不超过总数）
    const minRequiredCount = Math.min(2, requiredEvidence.length);
    
    // 如果正确证据数量达到最少要求，且没有错误证据导致负分，则判定为通过
    if (correctEvidenceCount >= minRequiredCount && score > 0) {
        return 1; // 直接返回1表示通过
    }
    
    // 否则按原来的得分率计算
    const maxScore = requiredEvidence.reduce((sum, evidenceId) => {
        if (EvidenceImportance.critical.includes(evidenceId)) {
            return sum + AccusationConfig.evidenceScoring.criticalEvidence;
        } else if (EvidenceImportance.important.includes(evidenceId)) {
            return sum + AccusationConfig.evidenceScoring.importantEvidence;
        } else {
            return sum + AccusationConfig.evidenceScoring.minorEvidence;
        }
    }, 0);
    
    // 返回得分率（0-1之间）
    return Math.max(0, score / maxScore);
}