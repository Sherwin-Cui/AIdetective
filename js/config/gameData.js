// 游戏数据配置文件

// NPC数据
export const NpcData = {
    'laochen': { 
        name: '管家', 
        identity: '山庄管家', 
        avatar: 'assets/characters/laochen/respectful.png', 
        dialogueMax: 10 
    },
    'lin_chen': { 
        name: '林晨', 
        identity: '死者长子', 
        avatar: 'assets/characters/lin_chen/impatient.png', 
        dialogueMax: 10 
    },
    'chen_yaqin': { 
        name: '陈雅琴', 
        identity: '死者妻子', 
        avatar: 'assets/characters/chen_yaqin/calm.png', 
        dialogueMax: 10 
    },
    'xiaomei': { 
        name: '小美', 
        identity: '女仆', 
        avatar: 'assets/characters/xiaomei/nervous.png', 
        dialogueMax: 8 
    },
    'doctor_li': { 
        name: '李医生', 
        identity: '家庭医生', 
        avatar: 'assets/characters/doctor_li/professional.png', 
        dialogueMax: 8 
    }
};

// 线索数据
export const ClueData = {
    // 物证类线索
    'clue_poison_bottle': { 
        name: '毒药瓶', 
        img: 'assets/clues/poison_bottle.png', 
        description: '小玻璃瓶，标签显示是园艺用杀虫剂（夹竹桃提取物），瓶身有部分擦拭的指纹。', 
        type: 'evidence', 
        importance: 'critical' // 新增重要性标记 
    },
    'clue_wine_glass': { 
        name: '死者的酒杯', 
        img: 'assets/clues/wine_glass.png', 
        description: '死者使用过的酒杯，杯底有白色粉末残留，肉眼看不出是什么物质。或许可以找医生确认。', 
        type: 'evidence', 
        importance: 'important' 
    },
    'clue_will_draft': { 
        name: '遗嘱草稿', 
        img: 'assets/clues/testament.png', 
        description: '在灰烬中发现了一份被烧了一半的遗嘱草稿！看不清内容，但是似乎有人要销毁它。', 
        type: 'evidence' 
    },
    'clue_love_letter': { 
        name: '情书', 
        img: 'assets/clues/love_letter.png', 
        description: '似乎是在管家房间抽屉中发现的，写给陈雅琴的，但并非出自死者之手。', 
        type: 'evidence' 
    },
    'clue_debt_notice': { 
        name: '催债通知', 
        img: 'assets/clues/debt_notice.png', 
        description: '一张来自城里赌场的催债通知单，收件人是林晨。', 
        type: 'evidence' 
    },
    'clue_medical_record': { 
        name: '用药记录', 
        img: 'assets/clues/medical_chart.png', 
        description: '在客房医疗包中发现的死者用药记录。', 
        type: 'evidence' 
    },
    'clue_magnifying_glass': { 
        name: '放大镜', 
        img: 'assets/clues/magnifying_glass.png', 
        description: '在书房的地球仪旁发现了一个放大镜！似乎被用来研究什么东西？', 
        type: 'evidence' 
    },
    'clue_cellar_key': { 
        name: '酒窖钥匙', 
        img: 'assets/clues/key.png', 
        description: '发现了一把小巧的钥匙，看起来是酒窖的备用钥匙！', 
        type: 'evidence' 
    },
    
    // 证词类线索
    'clue_chen_cellar': { 
        name: '陈雅琴去过酒窖', 
        img: 'assets/clues/words.png',
        description: '陈雅琴承认在晚餐前去过酒窖。', 
        type: 'testimony' 
    },
    'clue_chen_will': { 
        name: '陈雅琴知道遗嘱内容', 
        img: 'assets/clues/words.png',
        description: '陈雅琴知道遗嘱将大部分财产捐赠给慈善机构。', 
        type: 'testimony' 
    },
    'clue_chen_butler_relationship': { 
        name: '陈雅琴与管家关系异常', 
        img: 'assets/clues/words.png',
        description: '小美目击到陈雅琴与管家之间有不寻常的亲密关系。', 
        type: 'testimony' 
    },
    'clue_lin_debt': { 
        name: '林晨欠下巨额赌债', 
        img: 'assets/clues/words.png',
        description: '林晨承认自己欠下巨额赌债，急需资金。', 
        type: 'testimony' 
    },
    'clue_lin_safe': { 
        name: '林晨翻看过保险柜', 
        img: 'assets/clues/words.png',
        description: '林晨承认自己翻看过父亲的保险柜。', 
        type: 'testimony' 
    },
    'clue_lin_argument': { 
        name: '父子为钱争吵', 
        img: 'assets/clues/words.png',
        description: '林晨与父亲因为金钱问题多次发生争吵。', 
        type: 'testimony' 
    },
    'clue_butler_confirm_cellar': { 
        name: '管家证实夫人去过酒窖', 
        img: 'assets/clues/words.png',
        description: '管家证实陈雅琴在晚餐前去过酒窖。', 
        type: 'testimony' 
    },
    'clue_butler_will': { 
        name: '遗嘱将改为慈善捐赠', 
        img: 'assets/clues/words.png',
        description: '管家知道林先生打算将遗嘱改为慈善捐赠。', 
        type: 'testimony' 
    },
    'clue_butler_dismiss_maid': { 
        name: '管家支开了仆人', 
        img: 'assets/clues/words.png',
        description: '管家在案发前支开了女仆小美。', 
        type: 'testimony' 
    },
    'clue_doctor_medicine': { 
        name: '死者服用强心药物', 
        img: 'assets/clues/words.png',
        description: '李医生证实死者长期服用强心药物。', 
        type: 'testimony' 
    },
    'clue_doctor_drug_interaction': { 
        name: '药物相克可能致命', 
        img: 'assets/clues/words.png',
        description: '李医生解释了死者服用的药物与毒药相克可能导致死亡。', 
        type: 'testimony' 
    },
    'clue_doctor_pressure': { 
        name: '死者最近压力异常', 
        img: 'assets/clues/words.png',
        description: '李医生表示死者最近压力很大，需要调整药物。', 
        type: 'testimony' 
    },
    'clue_maid_witness': { 
        name: '目击者证词-夫人去酒窖', 
        img: 'assets/clues/words.png',
        description: '小美目击到陈雅琴在晚餐前去了酒窖。', 
        type: 'testimony' 
    },
    'clue_chen_garden': { 
        name: '陈雅琴的花园活动', 
        img: 'assets/clues/words.png',
        description: '陈雅琴承认白天在花园修剪花草。', 
        type: 'testimony' 
    }, 
    'clue_lin_inheritance': { 
        name: '林晨的继承担忧', 
        img: 'assets/clues/words.png',
        description: '林晨担心父亲有私生子，影响继承。', 
        type: 'testimony' 
    }, 
    'clue_butler_key_management': { 
        name: '管家的钥匙管理', 
        img: 'assets/clues/words.png',
        description: '管家承认酒窖有两把钥匙，一把在他那，一把是备用。', 
        type: 'testimony' 
    }, 
    'clue_doctor_vision': { 
        name: '死者的视力问题', 
        img: 'assets/clues/words.png',
        description: '最近视力下降，需要用放大镜。', 
        type: 'testimony' 
    }, 
    'clue_maid_strange_smell': { 
        name: '厨房的异味', 
        img: 'assets/clues/words.png',
        description: '下午闻到一股奇怪的花草味。', 
        type: 'testimony' 
    }, 
    
    // 推理类线索
    'clue_deduce_timing': { 
        name: '作案时机推理', 
        img: 'assets/clues/inference.png',
        description: '通过三人证词确认陈雅琴在晚餐前去酒窖的作案时机。', 
        type: 'inference' 
    },
    'clue_deduce_insider': { 
        name: '知情人范围推理', 
        img: 'assets/clues/inference.png',
        description: '只有亲近的人才知道死者的用药情况，缩小嫌疑人范围。', 
        type: 'inference' 
    },
    'clue_deduce_motive': { 
        name: '利益关系推理', 
        img: 'assets/clues/inference.png',
        description: '陈雅琴是遗嘱修改的最大受害者，具有明确的杀人动机。', 
        type: 'inference' 
    },
    'clue_deduce_poison_source': { 
        name: '毒药来源推理', 
        img: 'assets/clues/inference.png',
        description: '毒药来自花园的夹竹桃。', 
        type: 'inference' 
    }, 
    'clue_deduce_murder_preparation': { 
        name: '谋杀准备推理', 
        img: 'assets/clues/inference.png',
        description: '下午在厨房制备毒药，用备用钥匙去酒窖。', 
        type: 'inference' 
    }, 
    'clue_deduce_time_urgency': { 
        name: '时间紧迫推理', 
        img: 'assets/clues/inference.png',
        description: '多方压力下，今天是最后机会。', 
        type: 'inference' 
    }, 
    'clue_deduce_conspiracy': { 
        name: '共谋关系推理', 
        img: 'assets/clues/inference.png',
        description: '老陈和陈雅琴是共谋。', 
        type: 'inference' 
    }, 
    'clue_deduce_inheritance_crisis': { 
        name: '继承危机推理', 
        img: 'assets/clues/inference.png',
        description: '私生子的出现是最后一根稻草。', 
        type: 'inference' 
    }
};

// 场景数据
export const SceneData = {
    mansion_exterior: {
        name: '别墅外景',
        description: '暴雨冲刷着宏伟但略显阴森的别墅。',
        thumbnail: 'assets/backgrounds/mansion_exterior.png',
        floor: 'outside',
        bg: 'assets/backgrounds/mansion_exterior.png',
        npcs: ['laochen'],
        investigation_points: [
            { id: 'gate', name: '庄园大门', description: '厚重的铁艺大门，紧紧关闭着。' },
            { id: 'fountain', name: '喷泉', description: '中央的喷泉已经停止工作，池底积满了雨水。' }
        ]
    },
    kitchen: {
        name: '厨房',
        description: '整洁的厨房，但空气中似乎有股奇怪的味道。',
        thumbnail: 'assets/backgrounds/kitchen.png',
        floor: 'first_floor',
        bg: 'assets/backgrounds/kitchen.png',
        npcs: ['xiaomei'],
        investigation_points: [
            { id: 'trash_can', name: '垃圾桶', description: '厨房的垃圾桶，似乎有什么东西在里面。', clueId: 'clue_poison_bottle' },
            { id: 'cupboard', name: '橱柜', description: '存放着各种餐具和调料。' }
        ]
    },
    dining_room: {
        name: '餐厅',
        description: '长长的餐桌上，晚餐的残羹还未收拾。',
        thumbnail: 'assets/backgrounds/dining_room.png',
        floor: 'first_floor',
        bg: 'assets/backgrounds/dining_room.png',
        npcs: ['chen_yaqin', 'lin_chen'],
        investigation_points: [
            { id: 'dining_table', name: '餐桌', description: '餐桌上杯盘狼藉。', clueId: 'clue_wine_glass' },
            { id: 'side_cabinet', name: '餐边柜', description: '柜子上放着一些装饰品。' }
        ]
    },
    hallway: {
        name: '走廊',
        description: '连接着各个房间的走廊，光线昏暗。',
        thumbnail: 'assets/backgrounds/hallway.png',
        floor: 'second_floor',
        bg: 'assets/backgrounds/hallway.png',
        npcs: ['doctor_li'],
        investigation_points: [
            { id: 'vase', name: '古董花瓶', description: '走廊尽头的花瓶，看起来很贵重。' },
            { id: 'carpet', name: '地毯', description: '华丽的地毯，似乎有些不平整。', clueId: 'clue_key' }
        ]
    },
    study_room: { 
        name: '书房', 
        description: '死者的书房，空气中弥漫着旧书和雪茄的味道。', 
        thumbnail: 'assets/backgrounds/study_room.png', 
        floor: 'second_floor', 
        bg: 'assets/backgrounds/study_room.png', 
        npcs: ['lin_chen'], 
        investigation_points: [ 
            { id: 'desk', name: '书桌', description: '林先生的书桌，上面摆放着一些文件。', clueId: 'clue_debt_notice' }, 
            { id: 'bookshelf', name: '书架', description: '一整面墙的书架，藏书丰富。' }, 
            { id: 'fireplace', name: '壁炉', description: '壁炉里有一些灰烬。', clueId: 'clue_will_draft' }, // 更新描述 
            { id: 'globe', name: '地球仪', description: '一个精致的地球仪，旁边似乎有什么东西。', clueId: 'clue_magnifying_glass' } 
        ] 
    },
    cellar: {
        name: '酒窖',
        description: '阴暗的酒窖，存放着许多名贵的红酒。',
        thumbnail: 'assets/backgrounds/wine_cellar.png',
        floor: 'basement',
        bg: 'assets/backgrounds/wine_cellar.png',
        npcs: ['chen_yaqin', 'laochen'],
        investigation_points: [
            { id: 'wine_rack', name: '酒架', description: '一排排的酒架，上面布满了灰尘。' },
            { id: 'wooden_box', name: '旧木箱', description: '一个被遗忘在角落的木箱。' },
            { id: 'under_wine_rack', name: '酒架下方', description: '酒架下方的角落，有些灰尘。', clueId: 'clue_cellar_key' }
        ]
    },
    butler_room: {
        name: '管家房间',
        description: '朴素但整洁的房间，床铺收拾得一丝不苟。',
        thumbnail: 'assets/backgrounds/butler_room.png',
        floor: 'second_floor',
        bg: 'assets/backgrounds/butler_room.png',
        npcs: ['laochen'],
        investigation_points: [
            { id: 'wardrobe', name: '衣柜', description: '整齐地挂着几套管家制服。' },
            { id: 'bedside_table', name: '床头柜', description: '上面放着一个老式闹钟和一副老花镜。' },
            { id: 'desk_drawer', name: '书桌抽屉', description: '管家的私人物品都放在这里。', clueId: 'clue_love_letter' }
        ]
    },
    guest_room: {
        name: '客房',
        description: '为客人准备的房间，有一股淡淡的消毒水味。',
        thumbnail: 'assets/backgrounds/guest_room.png',
        floor: 'second_floor',
        bg: 'assets/backgrounds/guest_room.png',
        npcs: ['doctor_li', 'xiaomei'],
        investigation_points: [
            { id: 'bed', name: '床铺', description: '整洁的床铺，看起来还没有人睡过。' },
            { id: 'windowsill', name: '窗台', description: '从这里可以看到庄园的花园。' },
            { id: 'medical_kit', name: '医疗包', description: '李医生的黑色医疗包就放在桌上。', clueId: 'clue_medical_record' }
        ]
    }
};

// 推理规则 - 支持多种组合
export const InferenceRules = {
    'clue_deduce_poison_source': {
        // 支持多种组合方式
        combinations: [
            // 完整的三个线索组合
            ['clue_poison_bottle', 'clue_chen_garden', 'clue_maid_strange_smell'],
            // 两个线索的组合
            ['clue_poison_bottle', 'clue_chen_garden'],  // 毒药瓶 + 花园活动
            ['clue_poison_bottle', 'clue_maid_strange_smell'],  // 毒药瓶 + 厨房异味
        ],
        description: '综合相关线索，可以推断出毒药来源于花园的夹竹桃。',
        inferenceProcess: `根据你提供的线索，我们可以推断出：

毒药瓶中的夹竹桃提取物很可能来自花园。{{SELECTED_CLUES_DESCRIPTION}}

这些线索共同指向一个结论：凶手从花园采集了夹竹桃，并将其制成了毒药。`
    },
    
    'clue_deduce_murder_preparation': {
        combinations: [
            // 三个线索组合
            ['clue_cellar_key', 'clue_butler_key_management', 'clue_chen_cellar'],
            // 两个线索组合
            ['clue_cellar_key', 'clue_chen_cellar'],  // 备用钥匙 + 陈雅琴去酒窖
            ['clue_butler_key_management', 'clue_chen_cellar'],  // 钥匙管理 + 陈雅琴去酒窖
        ],
        description: '根据相关证据，可以推断出凶手进行了周密的准备。',
        inferenceProcess: `让我们分析这些线索：

{{SELECTED_CLUES_DESCRIPTION}}

这表明凶手利用了酒窖的进入机会，进行了精心的准备。`
    },
    
    'clue_deduce_conspiracy': {
        combinations: [
            ['clue_love_letter', 'clue_butler_dismiss_maid', 'clue_chen_butler_relationship'],
            ['clue_love_letter', 'clue_chen_butler_relationship'],  // 情书 + 异常关系
            ['clue_butler_dismiss_maid', 'clue_chen_butler_relationship'],  // 支开女仆 + 异常关系
        ],
        description: '多个证据表明存在共谋关系。',
        inferenceProcess: `这些线索揭示了隐藏的关系：

{{SELECTED_CLUES_DESCRIPTION}}

种种迹象表明，这里存在着一个精心策划的共谋。`
    },
    
    'clue_deduce_inheritance_crisis': {
        combinations: [
            ['clue_will_draft', 'clue_lin_inheritance', 'clue_chen_will'],
            ['clue_will_draft', 'clue_chen_will'],  // 遗嘱草稿 + 陈雅琴知情
            ['clue_will_draft', 'clue_lin_inheritance'],  // 遗嘱草稿 + 继承担忧
        ],
        description: '财产继承问题构成了强烈的作案动机。',
        inferenceProcess: `继承权危机浮出水面：

{{SELECTED_CLUES_DESCRIPTION}}

这些因素共同构成了一个强烈的谋杀动机。`
    },
    
    'clue_deduce_timing': {
        combinations: [
            ['clue_chen_cellar', 'clue_butler_confirm_cellar', 'clue_maid_witness'],
            ['clue_chen_cellar', 'clue_maid_witness'],  // 两个目击证词
            ['clue_chen_cellar', 'clue_butler_confirm_cellar'],  // 当事人承认 + 管家证实
        ],
        description: '多个证词印证了关键的作案时机。',
        inferenceProcess: `时间线逐渐清晰：

{{SELECTED_CLUES_DESCRIPTION}}

这些证词相互印证，锁定了关键的作案时机。`
    },
    
    'clue_deduce_insider': {
        combinations: [
            ['clue_doctor_medicine', 'clue_doctor_drug_interaction'],  // 保持原有的两个线索组合
        ],
        description: '医学证据表明凶手是熟悉内情的人。',
        inferenceProcess: `医学证据提供了重要线索：

死者服用的药物需要专业知识才能利用其致命的相互作用。

这说明凶手必定是了解死者健康状况的内部人员。`
    },
    
    'clue_deduce_time_urgency': {
        combinations: [
            ['clue_will_draft', 'clue_lin_debt', 'clue_doctor_pressure'],
            ['clue_will_draft', 'clue_lin_debt'],  // 遗嘱 + 债务
            ['clue_will_draft', 'clue_doctor_pressure'],  // 遗嘱 + 压力
            ['clue_lin_debt', 'clue_doctor_pressure'],  // 债务 + 压力
        ],
        description: '多重压力形成了作案的紧迫性。',
        inferenceProcess: `各种压力在此时汇聚：

{{SELECTED_CLUES_DESCRIPTION}}

这些压力共同促成了悲剧的发生。`
    }
};

// 推理系统配置
export const InferenceSystemConfig = {
    maxSelections: 3,  // 最多选择3个线索
    inferenceIcon: 'assets/clues/inference.png',  // 推理线索统一图标
    testimonyIcon: 'assets/clues/words.png',  // 证词线索统一图标
    messages: {
        selectMore: '请选择3个线索进行推理',
        invalidCombination: '这些线索之间似乎没有关联...',
        alreadyInferred: '你已经推导出这个结论了',
        inferenceSuccess: '推理成功！'
    }
};

// NPC详细信息
export const NpcInfo = {
    'laochen': `
        <strong>姓名：</strong>老陈（55岁）<br>
        <strong>身份：</strong>山庄管家<br>
        <strong>人物设定：</strong>老陈在林家服务二十年，沉默寡言但办事牢靠，深得主人信任。他管理着山庄的一切事务，永远穿着整洁的管家制服。晚宴当天，他亲自去酒窖选酒，还特意支开了女仆小美。当惨剧发生时，他是最冷静的人，有条不紊地安排善后。
    `,
    'lin_chen': `
        <strong>姓名：</strong>林晨（28岁）<br>
        <strong>身份：</strong>死者长子<br>
        <strong>人物设定：</strong>林晨是林山庄的独子，几次创业失败后染下了赌博恶习。他总是穿着皱巴巴的名牌衬衫，手上的名表是仅剩的值钱物品。今晚他迟到了，神色慌张，晚餐中途借口打电话离开，有人看到他在书房焦躁地盯着父亲的保险柜。
    `,
    'chen_yaqin': `
        <strong>姓名：</strong>陈雅琴（45岁）<br>
        <strong>身份：</strong>死者妻子<br>
        <strong>人物设定：</strong>陈雅琴是林山庄的第二任妻子，出身普通，十年前嫁入林家。她善于社交，喜欢插花，总是把家里布置得优雅温馨。案发当晚，她格外殷勤，亲自去酒窖为丈夫选酒，晚宴时不停地为他斟酒。当林山庄倒下时，她第一个冲到丈夫身边，泪流满面。
    `,
    'xiaomei': `
        <strong>姓名：</strong>小美（22岁）<br>
        <strong>身份：</strong>女仆<br>
        <strong>人物设定：</strong>小美是个胆小的农村姑娘，来林家才半年。她做事勤快但很少说话，习惯留意周围的动静。晚宴前，她在走廊撞见女主人拿着什么东西匆匆去了酒窖。晚餐时，管家突然让她去楼上准备客房，虽然客房早就准备好了。现在她躲在厨房角落，紧张地想着自己看到的事情。
    `,
    'doctor_li': `
        <strong>姓名：</strong>李医生（50岁）<br>
        <strong>身份：</strong>家庭医生<br>
        <strong>人物设定：</strong>李医生是林家的专属医生，医术精湛，在当地颇有名望。今天下午他刚为林山庄检查过身体，发现他压力很大，调整了心脏药物的剂量。晚宴时他滴酒未沾，一直在观察林山庄的气色。当悲剧发生后，他反复检查自己的处方，担心是否用药出了问题。
    `
};

window.ClueData = ClueData;
window.InferenceRules = InferenceRules;
window.InferenceSystemConfig = InferenceSystemConfig;