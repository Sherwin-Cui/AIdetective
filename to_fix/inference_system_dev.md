# 推理系统完整开发方案

## 1. 系统概述

推理系统允许玩家通过组合已获得的物证和证词，推导出新的推理线索。玩家需要选择正确的线索组合，系统会展示推理过程并生成新的推理线索。

## 2. 文件修改详细方案

### 2.1 修改 gameData.js

```javascript
// 在现有的 InferenceRules 基础上，增加推理过程文本
export const InferenceRules = {
    'clue_deduce_poison_source': {
        prerequisites: ['clue_poison_bottle', 'clue_chen_garden', 'clue_maid_strange_smell'],
        description: '综合毒药瓶、陈雅琴在花园活动以及厨房的异味，可以推断出毒药来源于花园的夹竹桃，并且是在厨房被制作的。',
        inferenceProcess: `让我们来整理一下这些线索之间的联系：

首先，我们在厨房垃圾桶发现了标注为园艺杀虫剂的毒药瓶，主要成分是夹竹桃提取物。

其次，陈雅琴承认白天在花园修剪花草，而夹竹桃正是常见的园艺植物。

最后，小美提到下午在厨房闻到奇怪的花草味，这很可能是有人在厨房处理植物毒素。

将这三个线索联系起来，我们可以推断：凶手从花园采集了夹竹桃，在厨房提取毒素，制成了致命的毒药。`
    },
    'clue_deduce_murder_preparation': {
        prerequisites: ['clue_cellar_key', 'clue_butler_key_management', 'clue_chen_cellar'],
        description: '综合酒窖备用钥匙、管家的钥匙管理证词以及陈雅琴去过酒窖的事实，可以推断出凶手提前进行了周密的准备。',
        inferenceProcess: `让我们分析这些线索的关联：

酒窖的备用钥匙上有新鲜的使用痕迹，还沾有花园的泥土。

管家证实酒窖有两把钥匙，一把在他那里，另一把是备用钥匙。

陈雅琴承认晚餐前去过酒窖，声称是为了选酒。

综合这些信息，可以推断：凶手利用备用钥匙进入酒窖，这解释了为什么管家没有察觉。钥匙上的泥土暗示凶手可能刚从花园回来，这与毒药制备的时间线吻合。`
    },
    'clue_deduce_conspiracy': {
        prerequisites: ['clue_love_letter', 'clue_butler_dismiss_maid', 'clue_chen_butler_relationship'],
        description: '综合情书、管家支开女仆以及二人不寻常的关系，可以推断出管家和陈雅琴之间存在共谋关系。',
        inferenceProcess: `这些线索揭示了一个隐藏的关系网：

情书显示陈雅琴与管家有亲密关系，信中还出现了"表哥"的称呼。

管家在关键时刻支开了女仆小美，为某人创造了作案机会。

多位证人都注意到陈雅琴与管家之间存在不寻常的默契。

将这些信息联系起来，真相呼之欲出：管家和陈雅琴不仅是秘密情人，还可能是远房亲戚。管家故意支开目击者，协助陈雅琴实施犯罪计划。`
    },
    'clue_deduce_inheritance_crisis': {
        prerequisites: ['clue_will_draft', 'clue_lin_inheritance', 'clue_chen_will'],
        description: '综合遗嘱草稿、林晨对继承的担忧以及陈雅琴对遗嘱内容的了解，可以推断出林家的继承存在严重危机，这构成了强烈的动机。',
        inferenceProcess: `让我们分析继承权危机如何成为谋杀动机：

遗嘱草稿显示林山庄计划将大部分财产捐给慈善机构，更重要的是，要承认一个私生子。

林晨担心父亲有私生子会影响继承权，这种担忧并非空穴来风。

陈雅琴对遗嘱内容的激烈反应，暴露了她早已知情。

综合分析：私生子的出现将彻底改变财产分配格局。作为第二任妻子的陈雅琴，原本就处于弱势地位，如果遗嘱生效，她将一无所有。这构成了极其强烈的谋杀动机。`
    },
    'clue_deduce_timing': {
        prerequisites: ['clue_chen_cellar', 'clue_butler_confirm_cellar', 'clue_maid_witness'],
        description: '通过陈雅琴、管家和女仆三人的证词，可以相互印证，锁定陈雅琴在晚餐前进入酒窖是关键的作案时机。',
        inferenceProcess: `三份独立的证词相互印证了关键时间点：

陈雅琴承认在晚餐前去过酒窖，时间约在19:30-19:45。

管家证实看到夫人去酒窖选酒，时间吻合。

小美目击陈雅琴拿着小包去酒窖，这个细节至关重要。

时间线分析：19:30-19:45是晚宴准备的关键时段，此时大家都在忙碌，正是下毒的最佳时机。陈雅琴带着的"小包"很可能装着毒药，她在酒窖完成了投毒。`
    },
    'clue_deduce_insider': {
        prerequisites: ['clue_doctor_medicine', 'clue_doctor_drug_interaction'],
        description: '根据医生关于死者用药和药物相克的证词，可以推断出凶手必须是了解死者健康状况的内部人员。',
        inferenceProcess: `医学证据缩小了嫌疑人范围：

李医生证实死者长期服用地高辛类心脏药物，剂量需要严格控制。

夹竹桃毒素与地高辛相克会导致急性心脏衰竭，这需要专业知识。

这种精确的谋杀手法说明凶手对死者的健康状况了如指掌。

推理结论：凶手必定是林家的内部人员，不仅知道死者的用药情况，还了解药物相克的致命效果。这种专业知识要么来自医学背景，要么是通过长期接触获得。外人几乎不可能掌握如此详细的信息。`
    },
    'clue_deduce_time_urgency': {
        prerequisites: ['clue_will_draft', 'clue_lin_debt', 'clue_doctor_pressure'],
        description: '多方压力下，今天是最后机会。',
        inferenceProcess: `多重压力形成了"完美风暴"：

遗嘱草稿上的日期是今天，说明林山庄可能今晚就要宣布遗嘱变更。

林晨的50万赌债下周必须偿还，时间紧迫。

医生提到死者最近压力很大，可能与这些家庭变故有关。

时机分析：如果林山庄今晚宣布遗嘱变更，一切都将无法挽回。对于有作案动机的人来说，这是最后的机会。多重压力的叠加，让今晚成为了命运的转折点。`
    }
};

// 推理系统配置
export const InferenceSystemConfig = {
    maxSelections: 3,  // 最多选择3个线索
    inferenceIcon: 'assets/clues/inference.png',  // 推理线索统一图标
    messages: {
        selectMore: '请选择3个线索进行推理',
        invalidCombination: '这些线索之间似乎没有关联...',
        alreadyInferred: '你已经推导出这个结论了',
        inferenceSuccess: '推理成功！'
    }
};
```

### 2.2 创建 InferenceSystem.js

```javascript
// js/core/InferenceSystem.js
import { InferenceRules, InferenceSystemConfig } from '../config/gameData.js';
import { AIClueManager } from '../ai/ClueManager.js';
import { UIManager } from '../ui/UIManager.js';
import { ClueSystem } from './ClueSystem.js';

export const InferenceSystem = {
    selectedClues: [],
    isInferenceMode: false,
    
    init() {
        console.log('[InferenceSystem] 初始化推理系统');
        this.addInferenceButton();
        this.initModal();
    },
    
    // 添加推理按钮到底部状态栏
    addInferenceButton() {
        const actionsBar = document.querySelector('.bottom-actions');
        if (!actionsBar) return;
        
        const inferenceBtn = document.createElement('button');
        inferenceBtn.id = 'inference-btn';
        inferenceBtn.className = 'action-btn primary-btn';
        inferenceBtn.innerHTML = '<i class="fas fa-brain"></i> 推理';
        
        inferenceBtn.addEventListener('click', () => {
            this.openInferenceModal();
        });
        
        // 插入到线索按钮之后
        const cluesBtn = document.getElementById('clues-btn');
        if (cluesBtn && cluesBtn.nextSibling) {
            actionsBar.insertBefore(inferenceBtn, cluesBtn.nextSibling);
        } else {
            actionsBar.appendChild(inferenceBtn);
        }
    },
    
    // 初始化推理模态框
    initModal() {
        // 创建推理模态框HTML
        const modalHTML = `
            <div id="inference-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content inference-modal-content">
                    <div class="modal-header">
                        <h2>推理模式</h2>
                        <button class="modal-close-btn">&times;</button>
                    </div>
                    
                    <div class="inference-container">
                        <!-- 待选择证据栏 -->
                        <div class="selected-clues-section">
                            <h3>选中的线索</h3>
                            <div class="selected-clues-slots">
                                <div class="clue-slot" data-slot="0">
                                    <div class="slot-placeholder">空位 1</div>
                                </div>
                                <div class="clue-slot" data-slot="1">
                                    <div class="slot-placeholder">空位 2</div>
                                </div>
                                <div class="clue-slot" data-slot="2">
                                    <div class="slot-placeholder">空位 3</div>
                                </div>
                            </div>
                            <button id="start-inference-btn" class="action-btn primary-btn" disabled>
                                开始推理
                            </button>
                        </div>
                        
                        <!-- 可选择证据列表 -->
                        <div class="available-clues-section">
                            <h3>可用线索</h3>
                            <div class="inference-categories">
                                <button class="category-btn active" data-category="all">全部</button>
                                <button class="category-btn" data-category="evidence">物证</button>
                                <button class="category-btn" data-category="testimony">证词</button>
                            </div>
                            <div id="inference-clues-grid" class="clues-grid">
                                <!-- 动态生成线索列表 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定事件
        this.bindModalEvents();
    },
    
    bindModalEvents() {
        // 关闭按钮
        const closeBtn = document.querySelector('#inference-modal .modal-close-btn');
        closeBtn.addEventListener('click', () => this.closeInferenceModal());
        
        // 分类按钮
        document.querySelectorAll('#inference-modal .category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#inference-modal .category-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                this.renderAvailableClues(e.target.dataset.category);
            });
        });
        
        // 开始推理按钮
        document.getElementById('start-inference-btn').addEventListener('click', () => {
            this.performInference();
        });
        
        // 点击空槽位可以移除线索
        document.querySelectorAll('.clue-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                if (!e.target.classList.contains('slot-placeholder')) {
                    this.removeFromSlot(parseInt(slot.dataset.slot));
                }
            });
        });
    },
    
    openInferenceModal() {
        UIManager.hideAllModals();
        document.getElementById('inference-modal').style.display = 'flex';
        this.selectedClues = [];
        this.updateSlots();
        this.renderAvailableClues('all');
    },
    
    closeInferenceModal() {
        document.getElementById('inference-modal').style.display = 'none';
        this.selectedClues = [];
    },
    
    renderAvailableClues(category = 'all') {
        const grid = document.getElementById('inference-clues-grid');
        grid.innerHTML = '';
        
        // 获取所有非推理类线索
        const availableClues = AIClueManager.getTriggeredClues()
            .map(clueId => ({
                id: clueId,
                ...AIClueManager.getClueById(clueId)
            }))
            .filter(clue => {
                if (clue.type === 'inference') return false;
                if (category === 'all') return true;
                return clue.type === category;
            });
        
        availableClues.forEach(clue => {
            const card = this.createSelectableClueCard(clue);
            grid.appendChild(card);
        });
    },
    
    createSelectableClueCard(clue) {
        const card = document.createElement('div');
        card.className = 'clue-card selectable-clue';
        card.dataset.clueId = clue.id;
        
        // 如果已经被选中，添加选中样式
        if (this.selectedClues.includes(clue.id)) {
            card.classList.add('selected');
        }
        
        // 根据线索类型显示不同内容
        if (clue.type === 'evidence') {
            card.innerHTML = `
                <img src="${clue.img}" alt="${clue.name}" onerror="this.style.display='none'">
                <div class="clue-name">${clue.name}</div>
            `;
        } else {
            card.innerHTML = `
                <div class="clue-placeholder">[${clue.type === 'testimony' ? '证词' : '其他'}]</div>
                <div class="clue-name">${clue.name}</div>
            `;
        }
        
        card.addEventListener('click', () => {
            this.toggleClueSelection(clue.id);
        });
        
        return card;
    },
    
    toggleClueSelection(clueId) {
        const index = this.selectedClues.indexOf(clueId);
        
        if (index > -1) {
            // 如果已选中，则取消选择
            this.selectedClues.splice(index, 1);
        } else if (this.selectedClues.length < InferenceSystemConfig.maxSelections) {
            // 如果未选中且还有空位，则添加
            this.selectedClues.push(clueId);
        } else {
            // 已达到最大选择数
            UIManager.showToast(InferenceSystemConfig.messages.selectMore, 2000, 'warning');
            return;
        }
        
        this.updateSlots();
        this.updateClueCards();
    },
    
    removeFromSlot(slotIndex) {
        if (this.selectedClues[slotIndex]) {
            this.selectedClues.splice(slotIndex, 1);
            this.updateSlots();
            this.updateClueCards();
        }
    },
    
    updateSlots() {
        const slots = document.querySelectorAll('.clue-slot');
        
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            
            if (this.selectedClues[index]) {
                const clue = AIClueManager.getClueById(this.selectedClues[index]);
                if (clue) {
                    const miniCard = document.createElement('div');
                    miniCard.className = 'mini-clue-card';
                    
                    if (clue.type === 'evidence' && clue.img) {
                        miniCard.innerHTML = `
                            <img src="${clue.img}" alt="${clue.name}">
                            <div class="mini-clue-name">${clue.name}</div>
                        `;
                    } else {
                        miniCard.innerHTML = `
                            <div class="mini-clue-placeholder">[${clue.type === 'testimony' ? '证词' : '其他'}]</div>
                            <div class="mini-clue-name">${clue.name}</div>
                        `;
                    }
                    
                    slot.appendChild(miniCard);
                }
            } else {
                slot.innerHTML = `<div class="slot-placeholder">空位 ${index + 1}</div>`;
            }
        });
        
        // 更新推理按钮状态
        const inferBtn = document.getElementById('start-inference-btn');
        inferBtn.disabled = this.selectedClues.length !== InferenceSystemConfig.maxSelections;
    },
    
    updateClueCards() {
        document.querySelectorAll('.selectable-clue').forEach(card => {
            const clueId = card.dataset.clueId;
            if (this.selectedClues.includes(clueId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    },
    
    performInference() {
        // 对选中的线索排序，以便匹配规则
        const sortedSelection = [...this.selectedClues].sort();
        
        // 查找匹配的推理规则
        let matchedRule = null;
        let matchedClueId = null;
        
        for (const [clueId, rule] of Object.entries(InferenceRules)) {
            const sortedPrerequisites = [...rule.prerequisites].sort();
            if (JSON.stringify(sortedSelection) === JSON.stringify(sortedPrerequisites)) {
                matchedRule = rule;
                matchedClueId = clueId;
                break;
            }
        }
        
        if (matchedRule) {
            // 检查是否已经推理出这个结论
            if (AIClueManager.hasClue(matchedClueId)) {
                UIManager.showToast(InferenceSystemConfig.messages.alreadyInferred, 2000, 'info');
                return;
            }
            
            // 显示推理过程
            this.showInferenceProcess(matchedRule, matchedClueId);
        } else {
            // 无效组合
            UIManager.showToast(InferenceSystemConfig.messages.invalidCombination, 2000, 'error');
        }
    },
    
    showInferenceProcess(rule, clueId) {
        const processModal = `
            <div id="inference-process-modal" class="modal-overlay" style="display: flex; z-index: 10001;">
                <div class="modal-content inference-process-content">
                    <div class="modal-header">
                        <h2>推理过程</h2>
                    </div>
                    <div class="inference-process-body">
                        <div class="inference-animation">
                            <div class="thinking-icon">
                                <i class="fas fa-brain"></i>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                        <div class="inference-text" style="display: none;">
                            ${rule.inferenceProcess.replace(/\n/g, '<br>')}
                        </div>
                        <button id="complete-inference-btn" class="action-btn primary-btn" style="display: none;">
                            完成推理
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', processModal);
        
        // 动画效果
        setTimeout(() => {
            document.querySelector('.progress-fill').style.width = '100%';
        }, 100);
        
        // 显示推理文本
        setTimeout(() => {
            document.querySelector('.inference-animation').style.display = 'none';
            document.querySelector('.inference-text').style.display = 'block';
            document.getElementById('complete-inference-btn').style.display = 'block';
        }, 2000);
        
        // 完成按钮事件
        document.getElementById('complete-inference-btn').addEventListener('click', () => {
            document.getElementById('inference-process-modal').remove();
            this.closeInferenceModal();
            
            // 触发新线索
            AIClueManager.revealClue(clueId);
            
            // 显示成功消息
            UIManager.showToast(InferenceSystemConfig.messages.inferenceSuccess, 3000, 'success');
        });
    }
};

// 添加样式
const style = document.createElement('style');
style.textContent = `
    /* 推理按钮样式 */
    #inference-btn {
        background: var(--accent-color);
        color: white;
    }
    
    #inference-btn:hover {
        background: var(--accent-hover);
    }
    
    /* 推理模态框样式 */
    .inference-modal-content {
        width: 90%;
        max-width: 900px;
        height: 80vh;
        display: flex;
        flex-direction: column;
    }
    
    .inference-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        overflow: hidden;
    }
    
    /* 选中线索区域 */
    .selected-clues-section {
        background: var(--secondary-bg-color);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
    
    .selected-clues-slots {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin: 20px 0;
    }
    
    .clue-slot {
        width: 120px;
        height: 150px;
        border: 2px dashed var(--border-color);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--primary-bg-color);
    }
    
    .clue-slot:hover {
        border-color: var(--accent-color);
        transform: scale(1.05);
    }
    
    .slot-placeholder {
        color: var(--text-dark);
        font-size: 14px;
    }
    
    .mini-clue-card {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
    }
    
    .mini-clue-card img {
        max-width: 80px;
        max-height: 80px;
        object-fit: contain;
    }
    
    .mini-clue-placeholder {
        width: 80px;
        height: 80px;
        background: var(--secondary-bg-color);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        font-size: 12px;
        color: var(--text-dark);
    }
    
    .mini-clue-name {
        font-size: 12px;
        margin-top: 5px;
        text-align: center;
        word-break: break-word;
    }
    
    /* 可用线索区域 */
    .available-clues-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .inference-categories {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    #inference-clues-grid {
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        padding: 10px;
    }
    
    .selectable-clue {
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .selectable-clue:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .selectable-clue.selected {
        border: 3px solid var(--accent-color);
        transform: scale(0.95);
        opacity: 0.7;
    }
    
    .selectable-clue.selected::after {
        content: '✓';
        position: absolute;
        top: 5px;
        right: 5px;
        background: var(--accent-color);
        color: white;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
    
    /* 推理过程样式 */
    .inference-process-content {
        width: 600px;
        max-width: 90%;
    }
    
    .inference-process-body {
        padding: 30px;
        text-align: center;
    }
    
    .inference-animation {
        margin: 30px 0;
    }
    
    .thinking-icon {
        font-size: 60px;
        color: var(--accent-color);
        animation: pulse 1.5s infinite;
        margin-bottom: 30px;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .progress-bar {
        width: 100%;
        height: 20px;
        background: var(--secondary-bg-color);
        border-radius: 10px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: var(--accent-color);
        width: 0;
        transition: width 2s ease;
    }
    
    .inference-text {
        text-align: left;
        line-height: 1.8;
        color: var(--text-color);
        margin: 20px 0;
        padding: 20px;
        background: var(--secondary-bg-color);
        border-radius: 10px;
        max-height: 300px;
        overflow-y: auto;
    }
    
    #complete-inference-btn {
        margin-top: 20px;
    }
    
    #start-inference-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

document.head.appendChild(style);
```

### 2.3 修改 ClueSystem.js

在 `ClueSystem.js` 的 `showClueNotificationEnhanced` 方法中，为推理线索添加特殊处理：

```javascript
// 在 showClueNotificationEnhanced 方法中修改
showClueNotificationEnhanced(clue) {
    const notification = document.createElement('div');
    notification.className = 'clue-notification';
    notification.style.animation = 'fadeInScale 0.5s ease-out';
    
    // 根据线索类型显示不同的图标和样式
    let iconContent = '';
    if (clue.type === 'testimony') {
        iconContent = `<div class="clue-placeholder" 
            style="width: 80px; height: 80px; 
            background: var(--secondary-bg-color); 
            border: 2px solid var(--accent-color); 
            display: flex; align-items: center; justify-content: center; 
            font-size: 2em; color: var(--accent-color);">[证词]</div>`;
    } else if (clue.type === 'inference') {
        // 推理线索使用统一图标
        iconContent = `<img src="${InferenceSystemConfig.inferenceIcon}" 
            alt="${clue.name}" class="clue-notification-icon" 
            onerror="this.src='assets/clues/inference.png'">`;
    } else {
        iconContent = `<img src="${clue.img}" alt="${clue.name}" 
            class="clue-notification-icon" onerror="this.style.display='none'">`;
    }
    
    notification.innerHTML = `
        ${iconContent}
        <div class="clue-notification-title">
            ${clue.type === 'inference' ? '推理成功！' : '发现新线索！'}
        </div>
        <div class="clue-notification-text">${clue.name}</div>
        <div style="font-size: 0.9em; color: var(--text-dark); margin-top: 10px;">
            ${clue.description}
        </div>
    `;
    
    // 添加动画样式
    this.ensureAnimationStyles();
    
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.style.animation = 'fadeOutScale 0.5s ease-in';
        notification.style.animationFillMode = 'forwards';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 4000);
}
```

### 2.4 修改 ClueManager.js

确保 `ClueManager.js` 中的 `revealClue` 方法正确处理推理线索：

```javascript
// 在 AIClueManager 中添加方法
getCluesByType(type) {
    const clues = [];
    this.triggeredClues.forEach(clueId => {
        const clueInfo = this.getClueById(clueId);
        if (clueInfo && clueInfo.type === type) {
            clues.push({
                id: clueId,
                ...clueInfo
            });
        }
    });
    return clues;
}

// 确保推理线索使用统一图标
revealClue(clueId) {
    // 检查线索是否存在
    const clueInfo = this.getClueById(clueId);
    if (!clueInfo) {
        console.error(`[AIClueManager] 线索 ${clueId} 不存在`);
        return false;
    }
    
    // 如果是推理线索，确保使用统一图标
    if (clueInfo.type === 'inference') {
        clueInfo.img = InferenceSystemConfig.inferenceIcon;
    }
    
    // ... 其余代码保持不变
}
```

### 2.5 修改 UIManager.js

在 `UIManager.js` 的 `init` 方法中初始化推理系统：

```javascript
import { InferenceSystem } from '../core/InferenceSystem.js';

export const UIManager = {
    init() {
        console.log('初始化UI管理器');
        // 初始化所有事件监听器
        this.initEventListeners();
        // 初始化NPC头像
        this.renderNpcAvatars();
        // 初始化推理系统
        InferenceSystem.init();
    },
    
    // ... 其他方法保持不变
}
```

## 3. 使用流程

1. **进入推理模式**：玩家点击底部状态栏的"推理"按钮
2. **选择线索**：从下方的线索列表中选择3个相关的线索
3. **开始推理**：点击"开始推理"按钮
4. **查看推理过程**：系统展示推理过程的详细文本
5. **获得推理线索**：推理成功后获得新的推理类线索

## 4. 推理组合列表

### 可用的推理组合：

1. **毒药来源推理**
   - 毒药瓶 + 陈雅琴的花园活动 + 厨房的异味

2. **谋杀准备推理**
   - 酒窖钥匙 + 管家的钥匙管理 + 陈雅琴去过酒窖

3. **共谋关系推理**
   - 情书 + 管家支开了仆人 + 陈雅琴与管家关系异常

4. **继承危机推理**
   - 遗嘱草稿 + 林晨的继承担忧 + 陈雅琴知道遗嘱内容

5. **作案时机推理**
   - 陈雅琴去过酒窖 + 管家证实夫人去过酒窖 + 目击者证词-夫人去酒窖

6. **知情人范围推理**
   - 死者服用强心药物 + 药物相克可能致命

7. **时间紧迫推理**
   - 遗嘱草稿 + 林晨欠下巨额赌债 + 死者最近压力异常

## 5. 测试要点

1. **功能测试**
   - 推理按钮正确显示
   - 线索选择功能正常
   - 推理匹配逻辑准确
   - 推理过程动画流畅

2. **边界测试**
   - 选择少于3个线索时按钮禁用
   - 重复推理同一结论的提示
   - 无效组合的错误提示

3. **兼容性测试**
   - 与现有线索系统的集成
   - 推理线索的正确显示
   - 存档系统的兼容性

## 6. 注意事项

1. 确保 `assets/clues/inference.png` 文件存在
2. 推理线索获得后会自动触发后续的推理检查
3. 推理系统与AI对话系统独立，但共享线索数据
4. 所有推理线索都使用统一的图标展示