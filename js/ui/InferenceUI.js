// 推理系统UI
import { GameState } from '../core/GameState.js';
import { ClueData } from '../config/gameData.js';
import { AIClueManager } from '../ai/ClueManager.js';
import { InferenceRules, InferenceSystemConfig } from '../config/gameData.js';
import { UIManager } from './UIManager.js';

export const InferenceUI = {
    selectedClues: new Set(),
    
    init() {
        console.log('[InferenceUI] 初始化推理系统UI');
        console.log('[InferenceUI] InferenceRules:', InferenceRules);
        console.log('[InferenceUI] InferenceSystemConfig:', InferenceSystemConfig);
        
        this.createInferenceModal();
        this.bindEvents();
        this.injectStyles();
    },
    
    createInferenceModal() {
        // 创建推理模态框
        const modalHTML = `
            <div id="inference-modal" class="modal-overlay">
                <div class="modal-content inference-modal-content">
                    <div class="modal-header">
                        <h2>线索推理</h2>
                        <button class="modal-close-btn">×</button>
                    </div>
                    
                    <!-- 固定的顶部区域 -->
                    <div class="inference-top-section">
                        <div class="selected-slots-container">
                            <h3>已选择的线索 <span id="selected-count">(0/3)</span></h3>
                            <div class="selected-slots">
                                <div class="slot-item" data-slot="0">
                                    <div class="slot-placeholder">+</div>
                                </div>
                                <div class="slot-item" data-slot="1">
                                    <div class="slot-placeholder">+</div>
                                </div>
                                <div class="slot-item" data-slot="2">
                                    <div class="slot-placeholder">+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 可滚动的中间区域 -->
                    <div class="inference-middle-section">
                        <div class="available-clues-header">
                            <h3>可用线索</h3>
                            <div class="clue-categories">
                                <button class="category-btn active" data-category="all">全部</button>
                                <button class="category-btn" data-category="evidence">物证</button>
                                <button class="category-btn" data-category="testimony">证词</button>
                            </div>
                        </div>
                        <div id="available-clues-grid" class="clues-grid">
                            <!-- 动态生成的线索列表 -->
                        </div>
                    </div>
                    
                    <!-- 固定的底部区域 -->
                    <div class="inference-bottom-section">
                        <button id="clear-selection-btn" class="inference-action-btn secondary">
                            <i class="fas fa-redo"></i> 重新选择
                        </button>
                        <button id="perform-inference-btn" class="inference-action-btn primary" disabled>
                            <i class="fas fa-brain"></i> 开始推理
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 将模态框添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 推理模态框整体布局 */
            .inference-modal-content {
                display: flex;
                flex-direction: column;
                height: 80vh;
                max-height: 600px;
                width: 90%;
                max-width: 800px;
            }
            
            /* 固定顶部区域 */
            .inference-top-section {
                flex-shrink: 0;
                padding: 20px;
                background: var(--secondary-bg-color);
                border-bottom: 1px solid var(--border-color);
            }
            
            .selected-slots-container h3 {
                margin-bottom: 15px;
                color: var(--text-color);
            }
            
            #selected-count {
                color: var(--accent-color);
                font-size: 0.9em;
            }
            
            .selected-slots {
                display: flex;
                gap: 20px;
                justify-content: center;
            }
            
            .slot-item {
                width: 100px;
                height: 100px;
                border: 2px dashed var(--border-color);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                background: var(--primary-bg-color);
                position: relative;
                overflow: hidden;
            }
            
            .slot-item:hover {
                border-color: var(--accent-color);
                transform: scale(1.05);
            }
            
            .slot-placeholder {
                font-size: 36px;
                color: var(--text-dark);
                opacity: 0.3;
            }
            
            .slot-item.filled .slot-placeholder {
                display: none;
            }
            
            /* 可滚动的中间区域 */
            .inference-middle-section {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: var(--primary-bg-color);
            }
            
            .available-clues-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
            }
            
            .clue-categories {
                display: flex;
                gap: 10px;
            }
            
            .category-tab {
                padding: 12px 20px;
                border: 2px solid var(--border-color);
                background: var(--secondary-bg-color);
                color: var(--text-color);
                border-radius: 0;  /* 改为0，去除圆角 */
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                font-weight: bold;
                min-width: 80px;  /* 设置最小宽度 */
                text-align: center;
            }
            
            .category-tab:hover {
                background: var(--primary-bg-color);
                border-color: var(--accent-color);
                color: var(--accent-color);
                transform: translateY(-2px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .category-tab.active {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* 添加分类按钮容器样式，使按钮紧密排列 */
            .clue-categories {
                display: flex;
                gap: 0;  /* 改为0，让按钮紧贴 */
            }
            
            .category-tab:not(:last-child) {
                border-right: none;  /* 相邻按钮共享边框 */
            }
            
            .category-tab:first-child {
                border-radius: 5px 0 0 5px;  /* 第一个按钮左侧圆角 */
            }
            
            .category-tab:last-child {
                border-radius: 0 5px 5px 0;  /* 最后一个按钮右侧圆角 */
            }
            
            #available-clues-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 15px;
                padding-bottom: 20px;
            }
            
            /* 线索卡片样式 */
            .inference-clue-card {
                width: 100px;
                height: 130px;
                background: var(--secondary-bg-color);
                border: 2px solid var(--border-color);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                position: relative;
            }
            
            .inference-clue-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                border-color: var(--accent-color);
            }
            
            .inference-clue-card.in-slot {
                display: none;
            }
            
            .clue-icon-square {
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                background: var(--primary-bg-color);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .clue-icon-square img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .clue-type-icon {
                font-size: 24px;
                color: var(--accent-color);
            }
            
            .clue-card-name {
                font-size: 12px;
                text-align: center;
                color: var(--text-color);
                word-break: break-word;
                line-height: 1.2;
                max-height: 2.4em;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            /* 固定底部区域 */
            .inference-bottom-section {
                flex-shrink: 0;
                padding: 20px;
                background: var(--secondary-bg-color);
                border-top: 1px solid var(--border-color);
                display: flex;
                gap: 20px;
                justify-content: center;
            }
            
            .inference-action-btn {
                padding: 12px 24px;
                border: 2px solid #ccc;
                background: var(--secondary-bg-color);
                color: var(--text-color);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                font-weight: bold;
                margin: 0 10px;
                min-width: 100px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .inference-action-btn i {
                font-size: 18px;
            }
            
            .inference-action-btn.primary {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
            }
            
            .inference-action-btn.primary:hover:not(:disabled) {
                background: var(--accent-hover);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .inference-action-btn.secondary {
                background: var(--secondary-bg-color);
                color: var(--text-color);
                border: 2px solid var(--border-color);
            }
            
            .inference-action-btn.secondary:hover {
                background: var(--primary-bg-color);
                border-color: var(--accent-color);
                color: var(--accent-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .inference-action-btn:disabled {
                background: var(--disabled-bg-color);
                color: var(--disabled-text-color);
                border-color: #ddd;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .inference-action-btn:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* 槽位中的线索样式 */
            .slot-clue {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 5px;
            }
            
            .slot-clue-icon {
                width: 60px;
                height: 60px;
                margin-bottom: 5px;
            }
            
            .slot-clue-icon img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
            }
            
            .slot-clue-name {
                font-size: 11px;
                text-align: center;
                color: var(--text-color);
                line-height: 1.2;
            }
            
            /* 删除按钮 */
            .slot-remove-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                width: 20px;
                height: 20px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .slot-item.filled:hover .slot-remove-btn {
                display: flex;
            }
            
            /* 通用按钮样式类 */
            .game-btn {
                padding: 12px 24px;
                border: 2px solid #ccc;
                background: var(--secondary-bg-color);
                color: var(--text-color);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                font-weight: bold;
                min-width: 100px;
                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                text-decoration: none;
                outline: none;
            }
            
            .game-btn:hover:not(:disabled) {
                background: var(--primary-bg-color);
                border-color: var(--accent-color);
                color: var(--accent-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .game-btn:disabled {
                background: var(--disabled-bg-color);
                color: var(--disabled-text-color);
                border-color: #ddd;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .game-btn:active:not(:disabled) {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* 按钮按下效果 */
            .btn-pressed {
                transform: translateY(2px) !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            }
            
            /* 按钮组样式 */
            .button-group {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            /* 推理过程文本样式 */
            .inference-process-text {
                padding: 20px;
                margin: 20px 0;
                line-height: 1.6;
                color: var(--text-color);
                background: var(--primary-bg-color);
                border-radius: 8px;
                border: 1px solid var(--border-color);
                min-height: 100px;
                font-size: 16px;
                white-space: pre-wrap;
            }
            
            /* 响应式布局 */
            @media (max-width: 768px) {
                .inference-modal-content {
                    width: 95%;
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .inference-header h2 {
                    font-size: 20px;
                }
                
                .category-tab {
                    padding: 10px 15px;
                    font-size: 13px;
                    min-width: 60px;
                }
                
                .inference-action-btn {
                    padding: 12px 20px;
                    font-size: 14px;
                    min-width: 120px;
                }
                
                .slot-item {
                    width: 80px;
                    height: 80px;
                }
                
                .clue-icon-square {
                    width: 50px;
                    height: 50px;
                }
                
                .inference-clue-card {
                    width: calc(50% - 10px);
                }
            }
            
            @media (max-width: 480px) {
                .inference-modal-content {
                    width: 98%;
                    margin: 5px;
                }
                
                .inference-header h2 {
                    font-size: 18px;
                }
                
                .category-tab {
                    padding: 8px 12px;
                    font-size: 12px;
                    min-width: 50px;
                }
                
                .inference-bottom-section {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .inference-action-btn {
                    padding: 10px 15px;
                    font-size: 13px;
                    min-width: 100px;
                    width: 100%;
                }
                
                .slot-item {
                    width: 70px;
                    height: 70px;
                }
                
                .clue-icon-square {
                    width: 40px;
                    height: 40px;
                }
                
                .inference-clue-card {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    bindEvents() {
        // 关闭按钮事件
        const closeBtn = document.querySelector('#inference-modal .modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // 清空选择按钮事件
        const clearBtn = document.getElementById('clear-selection-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSelection();
            });
        }
        
        // 进行推理按钮事件
        const inferBtn = document.getElementById('perform-inference-btn');
        if (inferBtn) {
            inferBtn.addEventListener('click', () => {
                this.performInference();
            });
        }
        
        // 分类标签事件
        document.querySelectorAll('.category-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderAvailableClues(e.target.dataset.category);
            });
        });
        
        // 点击遮罩关闭
        const modal = document.getElementById('inference-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
            
            // 添加按钮按下效果
            const buttons = modal.querySelectorAll('button');
            buttons.forEach(button => {
                // 只为非禁用按钮添加按下效果
                if (!button.disabled) {
                    button.addEventListener('mousedown', () => {
                        button.classList.add('btn-pressed');
                    });
                    
                    button.addEventListener('mouseup', () => {
                        button.classList.remove('btn-pressed');
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        button.classList.remove('btn-pressed');
                    });
                }
            });
        }
    },
    
    openModal() {
        this.selectedClues.clear();
        this.renderSlots();
        this.renderAvailableClues('all');
        this.updateButtonState();
        
        const modal = document.getElementById('inference-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    
    closeModal() {
        const modal = document.getElementById('inference-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    toggleModal() {
        const modal = document.getElementById('inference-modal');
        if (modal && modal.style.display === 'flex') {
            this.closeModal();
        } else {
            this.openModal();
        }
    },
    
    renderSlots() {
        const slots = document.querySelectorAll('.slot-item');
        const selectedArray = Array.from(this.selectedClues);
        
        // 更新计数
        document.getElementById('selected-count').textContent = `(${selectedArray.length}/3)`;
        
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            slot.classList.remove('filled');
            
            if (selectedArray[index]) {
                const clueId = selectedArray[index];
                const clue = ClueData[clueId];
                if (!clue) return;
                
                slot.classList.add('filled');
                
                const slotContent = document.createElement('div');
                slotContent.className = 'slot-clue';
                
                // 图标
                const iconDiv = document.createElement('div');
                iconDiv.className = 'slot-clue-icon';
                
                if (clue.type === 'evidence' && clue.img) {
                    iconDiv.innerHTML = `<img src="${clue.img}" alt="${clue.name}">`;
                } else if (clue.type === 'testimony') {
                    // 使用统一的证词图标
                    iconDiv.innerHTML = `<img src="${InferenceSystemConfig.testimonyIcon}" alt="${clue.name}">`;
                } else if (clue.type === 'inference') {
                    // 使用统一的推理图标
                    iconDiv.innerHTML = `<img src="${InferenceSystemConfig.inferenceIcon}" alt="${clue.name}">`;
                } else {
                    iconDiv.innerHTML = `<div class="clue-type-icon">📋</div>`;
                }
                
                // 名称
                const nameDiv = document.createElement('div');
                nameDiv.className = 'slot-clue-name';
                nameDiv.textContent = clue.name;
                
                // 删除按钮
                const removeBtn = document.createElement('button');
                removeBtn.className = 'slot-remove-btn';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeFromSlot(index);
                };
                
                slotContent.appendChild(iconDiv);
                slotContent.appendChild(nameDiv);
                slot.appendChild(slotContent);
                slot.appendChild(removeBtn);
            } else {
                slot.innerHTML = '<div class="slot-placeholder">+</div>';
            }
        });
    },
    
    renderAvailableClues(category = 'all') {
        const grid = document.getElementById('available-clues-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // 获取所有已获得的线索，根据分类筛选
        const availableClues = GameState.acquiredClues
            .filter(clue => {
                if (!clue || !clue.id) return false;
                if (this.selectedClues.has(clue.id)) return false; // 已选择的不显示
                
                // 根据分类筛选
                if (category === 'all') {
                    return clue.type !== 'inference'; // 推理界面不显示推理类线索
                } else {
                    return clue.type === category;
                }
            })
            .map(clue => clue.id); // 最后提取ID用于渲染
        
        if (availableClues.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dark); padding: 20px;">暂无可选线索</div>';
            return;
        }
        
        availableClues.forEach(clueId => {
            const clue = ClueData[clueId];
            if (!clue) return;
            
            const card = this.createClueCard(clueId, clue);
            grid.appendChild(card);
        });
    },
    
    createClueCard(clueId, clue) {
        const card = document.createElement('div');
        card.className = 'inference-clue-card';
        card.dataset.clueId = clueId;
        
        // 图标容器
        const iconDiv = document.createElement('div');
        iconDiv.className = 'clue-icon-square';
        
        // 根据线索类型使用对应图标
        if (clue.type === 'evidence' && clue.img) {
            iconDiv.innerHTML = `<img src="${clue.img}" alt="${clue.name}">`;
        } else if (clue.type === 'testimony') {
            // 使用统一的证词图标
            iconDiv.innerHTML = `<img src="${InferenceSystemConfig.testimonyIcon}" alt="${clue.name}">`;
        } else if (clue.type === 'inference') {
            // 使用统一的推理图标
            iconDiv.innerHTML = `<img src="${InferenceSystemConfig.inferenceIcon}" alt="${clue.name}">`;
        } else {
            // 其他类型的默认图标
            iconDiv.innerHTML = `<div class="clue-type-icon">📋</div>`;
        }
        
        // 名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'clue-card-name';
        nameDiv.textContent = clue.name;
        
        card.appendChild(iconDiv);
        card.appendChild(nameDiv);
        
        // 点击事件
        card.addEventListener('click', () => {
            this.selectClue(clueId);
        });
        
        return card;
    },
    
    selectClue(clueId) {
        if (this.selectedClues.size >= 3) {
            UIManager.showToast('最多只能选择3个线索', 2000, 'warning');
            return;
        }
        
        this.selectedClues.add(clueId);
        this.renderSlots();
        this.renderAvailableClues(document.querySelector('.category-tab.active').dataset.category);
        this.updateButtonState();
    },
    
    removeFromSlot(index) {
        const selectedArray = Array.from(this.selectedClues);
        if (selectedArray[index]) {
            selectedArray.splice(index, 1);
            this.selectedClues = new Set(selectedArray);
            this.renderSlots();
            this.renderAvailableClues(document.querySelector('.category-tab.active').dataset.category);
            this.updateButtonState();
        }
    },
    
    clearSelection() {
        this.selectedClues.clear();
        this.renderSlots();
        this.renderAvailableClues(document.querySelector('.category-tab.active').dataset.category);
        this.updateButtonState();
    },
    
    updateButtonState() {
        const inferBtn = document.getElementById('perform-inference-btn');
        if (inferBtn) {
            const selectedSize = this.selectedClues.size;
            inferBtn.disabled = selectedSize < 2 || selectedSize > 3;
        }
    },
    
    performInference() {
        console.log('[InferenceUI] 开始推理...');
        
        const selectedSize = this.selectedClues.size;
        console.log('[InferenceUI] 选择的线索数量:', selectedSize);
        console.log('[InferenceUI] 选择的线索:', Array.from(this.selectedClues));
        
        if (selectedSize < 2 || selectedSize > 3) {
            UIManager.showToast('请选择 2 或 3 个线索进行推理', 2000, 'warning');
            return;
        }

        const selectedArray = Array.from(this.selectedClues);
        console.log('[InferenceUI] 已获得的线索:', GameState.acquiredClues.map(c => c.id));

        // 查找匹配的推理规则
        let matchedRule = null;
        let matchedClueId = null;

        for (const [clueId, rule] of Object.entries(InferenceRules)) {
            console.log(`[InferenceUI] 检查规则: ${clueId}`);
            
            // 检查是否已经获得该推理线索
            if (GameState.acquiredClues.some(c => c.id === clueId)) {
                console.log(`[InferenceUI] 线索 ${clueId} 已经获得，跳过`);
                continue;
            }

            // 改进的匹配逻辑：支持多种组合
            const selectedSet = new Set(selectedArray);

            // 检查是否有任何一个有效组合
            if (rule.combinations) {
                console.log(`[InferenceUI] 规则 ${clueId} 的组合:`, rule.combinations);
                
                // 新的多组合模式
                for (const combo of rule.combinations) {
                    console.log(`[InferenceUI] 检查组合:`, combo);
                    console.log(`[InferenceUI] 组合长度: ${combo.length}, 选择长度: ${selectedSet.size}`);
                    console.log(`[InferenceUI] 组合匹配检查:`, combo.every(c => {
                        const has = selectedSet.has(c);
                        console.log(`  - ${c}: ${has}`);
                        return has;
                    }));
                    
                    const comboSet = new Set(combo);
                    // 检查选择的线索是否包含这个组合的所有线索
                    if (combo.length === selectedSet.size && combo.every(c => selectedSet.has(c))) {
                        console.log(`[InferenceUI] 找到匹配的组合!`);
                        matchedRule = rule;
                        matchedClueId = clueId;
                        break;
                    }
                }
            } else if (rule.prerequisites) {
                console.log(`[InferenceUI] 规则 ${clueId} 使用旧的 prerequisites:`, rule.prerequisites);
                
                // 兼容旧的单一组合模式
                const prerequisites = new Set(rule.prerequisites);
                if (prerequisites.size === selectedSet.size && [...prerequisites].every(p => selectedSet.has(p))) {
                    matchedRule = rule;
                    matchedClueId = clueId;
                    break;
                }
            }

            if (matchedRule) break;
        }

        console.log('[InferenceUI] 匹配结果:', { matchedClueId, matchedRule });

        if (matchedRule && matchedClueId) {
            this.showInferenceProcess(matchedRule, matchedClueId);
        } else {
            UIManager.showToast('这些线索之间似乎没有关联...', 3000, 'error');
        }
    },
    
    /**
     * 获取所选线索的描述
     * @returns {string} 格式化的线索描述
     */
    getSelectedCluesDescription() {
        const descriptions = [];
        const selectedArray = Array.from(this.selectedClues);
        
        selectedArray.forEach(clueId => {
            const clue = ClueData[clueId];
            if (clue) {
                if (clue.name.includes('毒药瓶')) {
                    descriptions.push('发现的毒药瓶含有夹竹桃提取物');
                } else if (clue.name.includes('花园')) {
                    descriptions.push('陈雅琴在花园修剪花草，而夹竹桃正是常见的园艺植物');
                } else if (clue.name.includes('异味')) {
                    descriptions.push('厨房出现了奇怪的花草味，可能是处理植物毒素的痕迹');
                } else if (clue.name.includes('酒窖钥匙')) {
                    descriptions.push('发现了使用过的备用钥匙');
                } else if (clue.name.includes('去过酒窖')) {
                    descriptions.push('陈雅琴承认去过酒窖');
                } else if (clue.name.includes('遗嘱')) {
                    descriptions.push('发现了林山庄的遗嘱草稿');
                } else if (clue.name.includes('继承')) {
                    descriptions.push('林晨担心继承权问题');
                } else if (clue.name.includes('情书')) {
                    descriptions.push('发现了陈雅琴和管家之间的情书');
                } else if (clue.name.includes('支开')) {
                    descriptions.push('管家在关键时刻支开了女仆');
                } else if (clue.name.includes('关系')) {
                    descriptions.push('证实了陈雅琴和管家之间的不寻常关系');
                } else if (clue.name.includes('债务')) {
                    descriptions.push('发现了林晨的巨额债务通知');
                } else if (clue.name.includes('压力')) {
                    descriptions.push('医生提到死者最近压力很大');
                } else if (clue.name.includes('用药')) {
                    descriptions.push('医生证实死者长期服用地高辛类心脏药物');
                } else if (clue.name.includes('相克')) {
                    descriptions.push('夹竹桃毒素与地高辛相克会导致急性心脏衰竭');
                } else if (clue.name.includes('证词') || clue.name.includes('目击')) {
                    descriptions.push('多个证人的证词相互印证了关键时间点');
                } else {
                    // 默认描述
                    descriptions.push(`${clue.name}: ${clue.description}`);
                }
            }
        });
        
        return descriptions.join('。\n');
    },
    
    showInferenceProcess(rule, clueId) {
        // 动态生成推理过程文本
        let processText = rule.inferenceProcess;
        
        // 替换占位符
        const selectedCluesDesc = this.getSelectedCluesDescription();
        processText = processText.replace('{{SELECTED_CLUES_DESCRIPTION}}', selectedCluesDesc);
        
        const processModal = document.createElement('div');
        processModal.className = 'modal-overlay';
        processModal.style.display = 'flex'; // 确保弹窗可见
        processModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>推理过程</h2>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="inference-process-text" id="inference-text-content"></div>
            </div>
        `;
        
        document.body.appendChild(processModal);
        
        // 打字机效果显示文本
        const textContainer = processModal.querySelector('#inference-text-content');
        this.typewriterEffect(textContainer, processText, 50);
        
        // 关闭按钮事件
        processModal.querySelector('.modal-close-btn').addEventListener('click', () => {
            // 立即关闭窗口
            processModal.remove();
            this.closeModal();
            
            // 触发新线索并显示提示
            AIClueManager.revealClue(clueId);
            UIManager.showToast('推理成功！获得新线索', 3000, 'success');
        });
        
        // 点击背景关闭
        processModal.addEventListener('click', (e) => {
            if (e.target === processModal) {
                processModal.remove();
                this.closeModal();
                AIClueManager.revealClue(clueId);
                UIManager.showToast('推理成功！获得新线索', 3000, 'success');
            }
        });
    },
    
    // 打字机效果方法
    typewriterEffect(element, text, speed = 50) {
        element.innerHTML = '';
        let index = 0;
        
        function typeChar() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeChar, speed);
            }
        }
        
        typeChar();
    }
};

// 初始化推理UI
document.addEventListener('DOMContentLoaded', () => {
    InferenceUI.init();
});

// 暴露到全局以便调试
window.InferenceUI = InferenceUI;