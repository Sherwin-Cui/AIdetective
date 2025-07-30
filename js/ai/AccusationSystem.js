// 指认凶手系统
import { GameState } from '../core/GameState.js';
import { NpcData } from '../config/gameData.js';
import { SimpleAIService } from './AIService.js';
import { CharacterPersonalities } from '../config/aiConfig.js';
import { AIClueManager } from './ClueManager.js';
import { UIManager } from '../ui/UIManager.js';
import { AccusationConfig, calculateEvidenceScore } from '../config/accusationConfig.js';
import { MusicSystem } from '../core/MusicSystem.js';  // 新增：导入音乐播放器
import AccusationUI from '../ui/AccusationUI.js';  // 新增：导入指证UI

export const AccusationSystem = {
    currentAccused: null,
    currentPhase: 'initial',
    dialogueHistory: [], // 修改为新格式
    submittedEvidence: {
        all: [], // 所有提交的证据
        byType: {
            motive: [],
            method: [],
            opportunity: [],
            conspiracy: []
        }
    },
    currentProofPrompt: '', // 当前需要证明的内容
    evidenceAnalysis: {
        proven: [],
        pending: []
    },
    // 新增证据附加功能
    attachedEvidence: [], // 当前对话附加的证据
    phaseDialogueCount: 0, // 当前阶段的对话轮数
    evidenceChain: {
        initial: [],
        motive: [],
        method: [],
        opportunity: [],
        conspiracy: []
    },
    phasesPassed: {
        motive: false,
        method: false,
        opportunity: false,
        conspiracy: false
    },
    pressureLevel: 'low', // low, medium, high
    isWaitingForResponse: false,
    debugMode: true, // 开启调试模式
    accusationUI: null, // 新增：指证UI实例
    
    init() {
        console.log('[AccusationSystem] 初始化指认系统');
        
        // 初始化指证UI
        this.accusationUI = new AccusationUI();
        
        // 创建指认按钮
        const actionButtons = document.getElementById('action-buttons');
        
        if (actionButtons) {
            const accuseBtn = document.createElement('button');
            accuseBtn.id = 'accuse-btn';
            accuseBtn.className = 'main-action-btn';
            accuseBtn.innerHTML = '<span>🫵 指认凶手</span>';
            accuseBtn.onclick = () => this.startAccusation();
            
            const inferenceBtn = document.getElementById('inference-btn');
            if (inferenceBtn && inferenceBtn.parentNode === actionButtons) {
                inferenceBtn.parentNode.insertBefore(accuseBtn, inferenceBtn.nextSibling);
            } else {
                actionButtons.appendChild(accuseBtn);
            }
            
            console.log('指认按钮已创建');
        }
        
        this.createAccusationUI();
    },
    
    createAccusationUI() {
        // 创建选择嫌疑人界面
        const suspectModal = document.createElement('div');
        suspectModal.id = 'suspect-selection-modal';
        suspectModal.className = 'modal-overlay';
        suspectModal.style.display = 'none';
        suspectModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close-btn" onclick="AccusationSystem.hideModal('suspect-selection-modal')">×</button>
                <h2>选择嫌疑人</h2>
                <p class="modal-description">你认为谁是真凶？</p>
                <div id="suspect-list" class="suspect-grid"></div>
            </div>
        `;
        
        // 创建对决界面（采用新的对话样式布局）
        const confrontModal = document.createElement('div');
        confrontModal.id = 'confrontation-modal';
        confrontModal.className = 'modal-overlay';
        confrontModal.style.display = 'none';
        confrontModal.innerHTML = `
            <div class="confrontation-container">
                <!-- 顶部标题栏 -->
                <div class="confrontation-header">
                    <h1 class="confrontation-title">指认对决</h1>
                    <div id="phase-indicator" class="phase-indicator">证明杀人动机</div>
                    <div id="current-proof-prompt" class="proof-prompt"></div>
                </div>

                <!-- 对话显示区域 -->
                <div class="dialogue-display-area" id="dialogueDisplayArea">
                    <!-- 对话气泡将在这里动态添加 -->
                </div>

                <!-- 输入框 -->
                <div class="input-section">
                    <input type="text" class="dialogue-input" id="accusation-input" placeholder="输入你的质问...">
                </div>

                <!-- 底部控制按钮 -->
                <div class="bottom-controls">
                    <button class="main-action-btn end-confrontation" id="end-confrontation" onclick="AccusationSystem.endConfrontation()">结束对决</button>
                    <button class="main-action-btn attach-evidence" id="attach-evidence-btn" onclick="AccusationSystem.showEvidenceAttachment()">附加证据</button>
                    <button class="main-action-btn" id="accusation-send">发送</button>
                </div>
            </div>
        `;
        
        // 创建证据选择界面
        const evidenceModal = document.createElement('div');
        evidenceModal.id = 'evidence-selection-modal';
        evidenceModal.className = 'modal-overlay';
        evidenceModal.style.display = 'none';
        evidenceModal.innerHTML = `
            <div class="modal-content">
                <h2 id="evidence-phase-title">选择证据</h2>
                <p id="evidence-phase-desc" class="modal-description"></p>
                <div id="evidence-grid" class="evidence-selection-grid"></div>
                <div class="evidence-selection-controls">
                    <div id="selected-evidence-count">已选择: 0/3</div>
                    <button id="submit-evidence" class="primary-btn" disabled>提交证据</button>
                </div>
            </div>
        `;
        
        // 创建结局界面
        const endingModal = document.createElement('div');
        endingModal.id = 'ending-modal';
        endingModal.className = 'modal-overlay';
        endingModal.style.display = 'none';
        endingModal.innerHTML = `
            <div class="modal-content ending-content">
                <h1 id="ending-title" class="ending-title"></h1>
                <div id="ending-description" class="ending-description"></div>
                <div id="ending-achievements" class="ending-achievements"></div>
                <div id="ending-controls" class="ending-controls">
                    <button id="ending-confirm-btn" class="secondary-btn" style="display: none;">返回</button>
                    <button id="ending-replay-btn" class="primary-btn" style="display: none;">重新游玩</button>
                </div>
                <div class="ending-credits">
                    📒制作：Sherwin<br>
                    🏆鸣谢：马老师提供的Claude资源！
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(suspectModal);
        document.body.appendChild(confrontModal);
        document.body.appendChild(evidenceModal);
        document.body.appendChild(endingModal);
        
        // 添加样式
        this.addStyles();
        
        // 绑定结局按钮事件
        const endingConfirmBtn = document.getElementById('ending-confirm-btn');
        if (endingConfirmBtn) {
            endingConfirmBtn.onclick = () => this.hideModal('ending-modal');
        }
        const endingReplayBtn = document.getElementById('ending-replay-btn');
        if (endingReplayBtn) {
            endingReplayBtn.onclick = () => location.reload();
        }

        // 绑定输入事件
        setTimeout(() => {
            const input = document.getElementById('accusation-input');
            const sendBtn = document.getElementById('accusation-send');
            
            if (input && sendBtn) {
                sendBtn.onclick = () => this.sendAccusation();
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') this.sendAccusation();
                };
            }
        }, 100);
    },
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 嫌疑人选择界面样式 */
            .suspect-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-top: 20px;
            }
            
            .suspect-card {
                background: #2a2a2a;
                border: 2px solid #444;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .suspect-card:hover {
                border-color: #ff6b6b;
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
            }
            
            .suspect-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin-bottom: 10px;
            }
            
            .suspect-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .suspect-identity {
                color: #999;
                font-size: 14px;
            }
            
            /* 对决界面容器样式 */
            .confrontation-container {
                width: 100%;
                max-width: 1200px;
                height: 90vh;
                background: linear-gradient(135deg, #2c1810 0%, #4a3728 100%);
                border-radius: 20px;
                padding: 30px;
                display: flex;
                flex-direction: column;
                font-family: 'Microsoft YaHei', sans-serif;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
            
            /* 顶部标题栏 */
            .confrontation-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 3px solid #8b6914;
                margin-bottom: 30px;
            }
            
            .confrontation-title {
                font-size: 36px;
                color: #ffd700;
                margin: 0 0 15px 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                font-weight: bold;
            }
            
            .pressure-bar {
                background: #2a1f1a;
                border: 2px solid #8b6914;
                border-radius: 25px;
                height: 30px;
                position: relative;
                overflow: hidden;
                margin: 15px auto;
                width: 300px;
            }
            
            .pressure-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50 0%, #FFC107 50%, #F44336 100%);
                width: 30%;
                transition: width 0.5s ease;
                border-radius: 23px;
            }
            
            .pressure-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #fff;
                font-weight: bold;
                font-size: 14px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            
            /* 对话显示区域 */
            .dialogue-display-area {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                margin-bottom: 20px;
                background: rgba(42, 42, 42, 0.3);
                border-radius: 10px;
                border: 2px solid #6b4e3d;
            }
            
            /* 对话气泡样式 */
            .dialogue-bubble {
                display: flex;
                margin-bottom: 20px;
                align-items: flex-start;
                gap: 15px;
                animation: fadeIn 0.5s ease;
            }
            
            .dialogue-bubble.detective {
                justify-content: flex-start;
            }
            
            .dialogue-bubble.npc {
                justify-content: flex-end;
                flex-direction: row-reverse;
            }
            
            .bubble-content {
                max-width: 70%;
                background: rgba(42, 42, 42, 0.9);
                border: 2px solid #6b4e3d;
                border-radius: 15px;
                padding: 15px;
                position: relative;
            }
            
            .dialogue-bubble.detective .bubble-content {
                border-color: #4a9eff;
                background: rgba(74, 158, 255, 0.1);
            }
            
            .dialogue-bubble.npc .bubble-content {
                border-color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
            }
            
            .bubble-text {
                color: #e0e0e0;
                font-family: var(--font-family);
                line-height: 1.6;
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .bubble-evidence {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 10px;
            }
            
            /* 头像样式 */
            .speaker-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 3px solid var(--accent-color);
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                object-fit: cover;
                flex-shrink: 0;
            }
            
            .speaker-avatar:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
                border-color: var(--accent-hover);
            }
            
            .speaker-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            /* 发言人名称 */
            .speaker-name {
                font-size: 18px;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 15px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                font-family: var(--font-family);
            }
            
            .dialogue-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .dialogue-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .dialogue-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }
            
            /* 证据标签 */
            .evidence-tag {
                display: inline-block;
                background: #8b6914;
                color: #fff;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin: 2px;
                border: 1px solid #ffd700;
            }
            
            /* 证据栏样式 */
            .evidence-section {
                background: rgba(42, 42, 42, 0.6);
                border: 2px solid #6b4e3d;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .evidence-header {
                margin-bottom: 10px;
            }
            
            .evidence-label {
                color: #ffd700;
                font-weight: bold;
                font-size: 16px;
            }
            
            .evidence-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            /* 输入区域样式 */
            .input-section {
                background: rgba(42, 42, 42, 0.8);
                border: 2px solid #6b4e3d;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .dialogue-input {
                width: 100%;
                padding: 12px 15px;
                background: #2a2a2a;
                border: 2px solid #6b4e3d;
                border-radius: 8px;
                color: #e0e0e0;
                font-size: 16px;
                font-family: var(--font-family);
                box-sizing: border-box;
            }
            
            .dialogue-input:focus {
                outline: none;
                border-color: #ffd700;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
            }
            
            /* 底部控制按钮 */
            .bottom-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                padding: 15px;
                background: rgba(42, 42, 42, 0.6);
                border-radius: 10px;
                border: 2px solid #6b4e3d;
            }
            
            /* 主要操作按钮样式 - 符合UI标准 */
            .main-action-btn {
                background-color: var(--secondary-bg-color);
                color: var(--text-color);
                border: 2px solid var(--border-color);
                padding: 10px 15px;
                cursor: pointer;
                font-family: var(--font-family);
                font-weight: bold;
                font-size: 14px;
                transition: all 0.3s ease;
                border-radius: 5px;
                /* 像素风格边框 */
                box-shadow: 
                    0 0 0 1px var(--border-accent), 
                    0 2px 0 var(--accent-dark), 
                    0 3px 0 rgba(0, 0, 0, 0.5);
            }
            
            .main-action-btn:hover {
                background-color: var(--accent-color);
                transform: translate(-1px, -1px);
                box-shadow: 
                    0 0 0 1px var(--border-accent), 
                    0 3px 0 var(--accent-dark), 
                    0 4px 0 rgba(0, 0, 0, 0.5);
            }
            
            .main-action-btn:active {
                transform: translate(1px, 1px);
                box-shadow: 
                    0 0 0 1px var(--border-accent), 
                    0 1px 0 var(--accent-dark), 
                    0 2px 0 rgba(0, 0, 0, 0.5);
            }
            
            .main-action-btn.attach-evidence {
                background-color: #4a6a8a;
                color: #fff;
            }
            
            .main-action-btn.attach-evidence:hover {
                background-color: #6a8aaa;
            }
            
            .main-action-btn.end-confrontation {
                background-color: var(--danger-color);
                color: #fff;
            }
            
            .main-action-btn.end-confrontation:hover {
                background-color: #ff6b6b;
            }
            
            /* 其他按钮样式 */
            .primary-btn {
                padding: 10px 20px;
                background: #28a745;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin-right: 10px;
            }
            
            .primary-btn:hover {
                background: #218838;
            }
            
            .secondary-btn {
                padding: 8px 16px;
                background: #6c757d;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .secondary-btn:hover {
                background: #5a6268;
            }
            
            /* 证据选择网格 */
            .evidence-selection-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin: 20px 0;
                max-height: 400px;
                overflow-y: auto;
            }
            
            /* 证据附加选择网格 */
            .evidence-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin: 20px 0;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .evidence-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                border: 2px solid #6b4e3d;
                border-radius: 8px;
                background: rgba(42, 42, 42, 0.8);
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .evidence-item:hover {
                border-color: var(--accent-color);
                background: rgba(74, 158, 255, 0.1);
            }
            
            .evidence-item.selected {
                border-color: #4CAF50;
                background: rgba(76, 175, 80, 0.2);
            }
            
            .evidence-item img {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 5px;
                margin-bottom: 8px;
            }
            
            .evidence-item div {
                color: #e0e0e0;
                font-size: 12px;
                font-weight: bold;
                word-wrap: break-word;
                max-width: 100%;
            }
            
            .evidence-selection-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
            }
            
            /* 结局界面样式 */
            .ending-content {
                text-align: center;
                max-width: 600px;
            }
            
            .ending-title {
                font-size: 48px;
                margin-bottom: 30px;
            }
            
            .ending-title.success {
                color: #4CAF50;
            }
            
            .ending-title.failure {
                color: #ff6b6b;
            }
            
            .ending-description {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
                white-space: pre-wrap;
            }
            
            .ending-achievements {
                background: #2a2a2a;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            
            .achievement-item {
                margin: 10px 0;
                font-size: 14px;
            }
            
            .achievement-item::before {
                content: "🏆 ";
            }
            
            .ending-credits {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #444;
                font-size: 12px;
                color: #888;
                line-height: 1.5;
            }
            
            /* 动画效果 */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .confrontation-dialogue {
                animation: fadeIn 0.5s ease;
            }
            
            /* 调试信息 */
            .debug-info {
                background: #1a1a1a;
                border: 1px solid #333;
                padding: 10px;
                margin-top: 10px;
                font-family: monospace;
                font-size: 12px;
                max-height: 200px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
    },

    addDialogue(speaker, text, emotion = '', avatar = '') {
        const dialogueEntry = {
            speaker,
            text,
            emotion,
            avatar,
            timestamp: new Date()
        };
        this.dialogueHistory.push(dialogueEntry);

        // 新的对话气泡布局
        const dialogueArea = document.querySelector('.dialogue-display-area');
        if (!dialogueArea) return;
        
        const isDetective = speaker === 'detective' || speaker === '侦探';
        
        // 创建对话气泡
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = `dialogue-bubble ${isDetective ? 'detective' : 'npc'}`;
        
        // 创建头像
        const avatarImg = document.createElement('img');
        avatarImg.className = 'speaker-avatar';
        if (isDetective) {
            avatarImg.src = 'assets/characters/me/detective.png';
        } else {
            if (avatar) {
                avatarImg.src = avatar;
            } else if (this.currentAccused) {
                const npcData = NpcData[this.currentAccused];
                if (npcData && npcData.avatar) {
                    avatarImg.src = npcData.avatar;
                }
            }
        }
        
        // 创建气泡内容容器
        const bubbleContent = document.createElement('div');
        bubbleContent.className = 'bubble-content';
        
        // 创建发言人名称
        const speakerName = document.createElement('div');
        speakerName.className = 'speaker-name';
        if (isDetective) {
            speakerName.textContent = '侦探';
        } else if (this.currentAccused) {
            const npcData = NpcData[this.currentAccused];
            speakerName.textContent = npcData ? npcData.name : speaker;
        } else {
            speakerName.textContent = speaker;
        }
        
        // 创建对话文本
        const textDiv = document.createElement('div');
        textDiv.className = 'bubble-text';
        
        bubbleContent.appendChild(speakerName);
        bubbleContent.appendChild(textDiv);
        
        bubbleContainer.appendChild(avatarImg);
        bubbleContainer.appendChild(bubbleContent);
        
        // 添加到对话区域
        dialogueArea.appendChild(bubbleContainer);
        
        // 使用打字机效果显示文本
        this.typewriterEffect(textDiv, text, 50);
        
        // 滚动到底部
        dialogueArea.scrollTop = dialogueArea.scrollHeight;
    },
    
    startAccusation() {
        // 检查是否收集了足够的线索
        const collectedClues = GameState.acquiredClues;
        console.log('[AccusationSystem] 当前线索数量:', collectedClues.length, '/', AccusationConfig.minCluesRequired);
        console.log('[AccusationSystem] 已收集线索:', collectedClues.map(c => c.id));
        
        if (collectedClues.length < AccusationConfig.minCluesRequired) {
            UIManager.showToast(`你还需要收集更多线索才能进行指认！(${collectedClues.length}/${AccusationConfig.minCluesRequired})`, 3000, 'warning');
            return;
        }

        // Dispatch accusationStarted event for the music system
        document.dispatchEvent(new CustomEvent('accusationStarted'));
        
        // 重置状态
        this.resetState();
        
        // 显示嫌疑人选择界面
        this.showSuspectSelection();
    },
    
    resetState() {
        this.currentAccused = null;
        this.currentPhase = 'initial';
        this.dialogueHistory = [];
        this.phaseDialogueCount = 0;
        this.evidenceChain = {
            initial: [],
            motive: [],
            method: [],
            opportunity: [],
            conspiracy: []
        };
        this.phasesPassed = {
            motive: false,
            method: false,
            opportunity: false,
            conspiracy: false
        };
        this.pressureLevel = 'low';
        this.isWaitingForResponse = false;
    },
    
    showSuspectSelection() {
        const modal = document.getElementById('suspect-selection-modal');
        const suspectList = document.getElementById('suspect-list');
        
        suspectList.innerHTML = '';
        
        // 创建嫌疑人卡片
        Object.entries(NpcData).forEach(([npcId, npc]) => {
            const card = document.createElement('div');
            card.className = 'suspect-card';
            card.innerHTML = `
                <img src="${npc.avatar}" alt="${npc.name}" class="suspect-avatar">
                <div class="suspect-name">${npc.name}</div>
                <div class="suspect-identity">${npc.identity}</div>
            `;
            card.onclick = () => this.selectSuspect(npcId);
            suspectList.appendChild(card);
        });
        
        modal.style.display = 'flex';
    },
    
    selectSuspect(npcId) {
        this.currentAccused = npcId;
        this.hideModal('suspect-selection-modal');
        
        // 开始对决
        this.startConfrontation();
    },
    
    async startConfrontation() {
        console.log('[AccusationSystem] 开始对决，当前被指控者:', this.currentAccused);
        
        // 启动新的指证UI模式
        if (this.accusationUI) {
            console.log('[AccusationSystem] 启动指证UI模式');
            this.accusationUI.startAccusationMode();
        } else {
            console.error('[AccusationSystem] accusationUI 未初始化！');
        }
        
        // 显示指证模态框
    const modal = document.getElementById('confrontation-modal');
    if (modal) {
        modal.style.display = 'block';
        console.log('[AccusationSystem] confrontation-modal 已显示');
    }
        
        // 更新阶段指示
        const phase = AccusationConfig.accusationPhases[this.currentPhase];
        this.updatePhaseIndicator();
        
        // 构造第一条指认消息
        const firstMessage = `我有充分的证据证明${NpcData[this.currentAccused].name}就是杀害林山庄的真凶。你必须给我一个合理的解释！`;
        
        // 添加侦探的第一条对话到指认对决界面
        this.addDialogue('detective', firstMessage, '', 'assets/characters/me/detective.png');
        
        // 同时添加到新UI（如果存在）
        if (this.accusationUI) {
            this.accusationUI.addDialogue('detective', firstMessage, 'assets/characters/me/detective.png');
            this.accusationUI.showNextDialogue();
        }
        
        // 禁用输入（如果有的话）
        this.isWaitingForResponse = true;
        
        // 生成NPC的第一次响应
        const response = await this.generateNPCResponse(firstMessage);
        await this.processNPCResponse(response);
        
        // 恢复输入
        this.isWaitingForResponse = false;
        
        // 显示输入控件
        this.showInputControls();
    },
    
    async sendAccusation() {
        const input = document.getElementById('accusation-input');
        const message = input.value.trim();
        
        if (!message || this.isWaitingForResponse) return;
        
        // 获取附加的证据
        const attachedEvidence = this.attachedEvidence.slice();
        
        this.isWaitingForResponse = true;
        input.value = '';
        input.disabled = true;
        
        // 显示带证据的对话
        let displayMessage = message;
        if (attachedEvidence.length > 0) {
            const evidenceNames = this.getEvidenceNames(attachedEvidence);
            displayMessage += ` [附带证据：${evidenceNames.join('、')}]`;
        }
        
        await this.addDialogue('detective', displayMessage);
        
        // 生成完整的用户消息（用于AI）
        let fullMessage = message;
        if (attachedEvidence.length > 0) {
            fullMessage = `${message}\n（用户提交了证据：${attachedEvidence.join('、')}）`;
        }
    
        // 将附加证据合并到当前阶段的evidenceChain
        const phaseName = AccusationConfig.accusationPhases[this.currentPhase].name;
        if (!this.evidenceChain[phaseName]) {
            this.evidenceChain[phaseName] = [];
        }
        attachedEvidence.forEach(evidenceId => {
            if (!this.evidenceChain[phaseName].includes(evidenceId)) {
                this.evidenceChain[phaseName].push(evidenceId);
            }
        });
        
        // 更新对话计数和压力等级
        this.phaseDialogueCount++;
        this.updatePressureLevel();
        
        // 生成NPC响应
        try {
            const response = await this.generateNPCResponse(fullMessage);
            
            // 记录到历史
            this.addToHistory(message, response, attachedEvidence);
            
            // 处理响应
            await this.processNPCResponse(response);
            
        } catch (error) {
            console.error('生成响应失败:', error);
            await this.addDialogue('system', '（NPC似乎被问住了...）');
        }
        
        // 清空附加证据
        this.attachedEvidence = [];
        this.updateAttachedEvidenceUI();
        
        this.isWaitingForResponse = false;
        input.disabled = false;
        document.getElementById('accusation-send').disabled = false;
        input.focus();
    },
    
    async generateNPCResponse(userMessage) {
        const character = CharacterPersonalities[this.currentAccused];
        const accusationProfile = AccusationConfig.npcAccusationResponses[this.currentAccused];
        
        // 构建提示词
        const prompt = this.buildAccusationPrompt(userMessage, character, accusationProfile);
        
        // 如果开启调试模式，打印提示词
        if (this.debugMode) {
            console.group('\uD83D\uDD0D \u6307\u8BA4\u7CFB\u7EDF\u8C03\u8BD5\u4FE1\u606F');
            console.log('\uD83D\uDCDD \u5B8C\u6574\u63D0\u793A\u8BCD:');
            console.log('\u2500'.repeat(80));
            console.log(prompt);
            console.log('\u2500'.repeat(80));
        }
        
        // 只传入一个字符串参数prompt，去掉context参数
        try {
            const response = await SimpleAIService.sendToOllama(prompt);
            
            if (this.debugMode) {
                console.log('\uD83E\uDD16 AI\u539F\u59CB\u54CD\u5E94:');
                console.log('\u2500'.repeat(50));
                console.log(response);
                console.log('\u2500'.repeat(50));
                console.groupEnd();
            }
            
            return this.parseResponse(response);
            
        } catch (error) {
            console.error('AI\u54CD\u5E94\u9519\u8BEF:', error);
            throw error;
        }
    },
    
    buildAccusationPrompt(userMessage, character, accusationProfile) {
        // 获取当前阶段配置
        const phaseConfig = AccusationConfig.accusationPhases[this.currentPhase];
        const phaseEmotions = accusationProfile.phaseEmotions[this.currentPhase] || ['平静', '紧张'];
        
        // 构建阶段指南
        let phaseGuidelines = '';
        switch(this.currentPhase) {
            case 'initial':
                phaseGuidelines = `
- 这是初始指认阶段，表现出${accusationProfile.initialReaction}
- 对话轮数：${this.phaseDialogueCount}
- 如果对话超过2-3轮且侦探只是重复指控，可以要求提供证据
- 保持角色的性格特征：${accusationProfile.personality}
- 本阶段需要的关键证据是：无特定证据要求`;
                break;
            case 'motive':
                phaseGuidelines = `
- 这是动机证明阶段，侦探正在试图证明你的作案动机
- 根据提出的证据调整反应强度
- 如果证据确凿，表现出慌乱；如果证据不足，可以反驳
- 本阶段需要的关键证据是：${this.getEvidenceNames(AccusationConfig.accusationPhases['motive'].requiredEvidence[this.currentAccused] || [])}`;
                break;
            case 'method':
                phaseGuidelines = `
- 这是手段证明阶段，侦探正在描述作案方法
- 重点关注技术细节的辩解
- 可以质疑证据的科学性或可能性
- 本阶段需要的关键证据是：${this.getEvidenceNames(AccusationConfig.accusationPhases['method'].requiredEvidence[this.currentAccused] || [])}`;
                break;
            case 'opportunity':
                phaseGuidelines = `
- 这是机会证明阶段，侦探正在证明你有作案时间
- 如果有不在场证明，强调这一点
- 压力增大，反应要更激烈
- 本阶段需要的关键证据是：${this.getEvidenceNames(AccusationConfig.accusationPhases['opportunity'].requiredEvidence[this.currentAccused] || [])}`;
                break;
            case 'conspiracy':
                phaseGuidelines = `
- 这是共谋揭露阶段，关系即将被暴露
- 这是最后的防线，可能会崩溃
- 考虑是否供出同伙或继续否认
- 本阶段需要的关键证据是：${this.getEvidenceNames(AccusationConfig.accusationPhases['conspiracy'].requiredEvidence[this.currentAccused] || [])}`;
                break;
            case 'final':
                phaseGuidelines = `
- 这是最终对决，所有证据已经摆出
- 根据证据完整度决定是否认罪
- ${accusationProfile.breakingPoint}
- 本阶段需要的关键证据是：无特定证据要求`;
                break;
        }
        
        // 构建已提交证据评估
        let evidenceAssessment = '尚未提交证据';
        const phaseName = AccusationConfig.accusationPhases[this.currentPhase].name;
        console.log('当前阶段:', this.currentPhase, '阶段名称:', phaseName, '证据链:', this.evidenceChain);
        const currentPhaseEvidence = this.evidenceChain[phaseName];
        if (currentPhaseEvidence && currentPhaseEvidence.length > 0) {
            const evidenceNames = this.getEvidenceNames(currentPhaseEvidence);
            evidenceAssessment = `已提交证据：${evidenceNames.join('、')}`;
        }
        
        // 格式化对话历史
        const recentHistory = this.dialogueHistory.slice(-6).filter(h => h.speaker !== 'system');
        const historyText = recentHistory.map(entry => {
            if (entry.speaker === 'detective') {
                return `侦探：${entry.text}`;
            } else {
                // 修改格式，避免浏览器解析为资源链接
                return `${character.name}(${entry.emotion || '平静'})：${entry.text}`;
            }
        }).join('\n');
        
        return `你是一个中文角色扮演游戏中的NPC。这是一个侦探推理游戏的指认阶段。

游戏背景：
深秋雨夜，偏远山区的林氏山庄，山庄主人林山庄在65岁生日晚宴上突然死亡。
林山庄举杯致辞后突然倒下，经李医生确认已经死亡，看起来像是急性心脏衰竭。
由于暴雨导致山路中断，警察无法及时赶到，侦探必须在天亮前查明真相。

当前状态：指认阶段
当前阶段：${phaseConfig.title}
对话轮数：${this.phaseDialogueCount}
压力等级：${this.pressureLevel}

## 🔄 响应工作流程

请按以下步骤思考并生成回复：

### 步骤1：分析当前情况
- 我现在处于哪个阶段？(${this.currentPhase})
- 这是第几轮对话？(${this.phaseDialogueCount})
- 侦探的话有多大压力？是在施压还是在闲聊？
- 有没有提到我的核心秘密相关内容？

### 步骤2：评估是否需要证据
- 侦探是否在空口指控？
- 我是否已经否认过2-3次了？
- 现在要求证据是否符合我的性格和当前情绪？
- 如果要求证据，应该用什么方式表达？

### 步骤3：确定情绪状态
- 根据当前阶段可选情绪：${phaseEmotions.join('、')}
- 根据对话内容和压力等级选择最合适的情绪
- 考虑情绪的连贯性（不要突然从恐慌变平静）

### 步骤4：构建回复内容
- 保持角色性格一致性
- 如果是真凶，可能会有的破绽
- 如果是无辜，会有的合理反应
- 不超过150字

### 步骤5：设置控制参数
- 是否需要证据？设置request_evidence
- 当前压力等级如何？
- 是否准备进入下一阶段？

## 重要规则
1. 必须用中文回复，不要使用英文或emoji
2. 保持严肃的悬疑氛围，符合角色设定
3. 根据指认阶段和证据情况调整反应强度
4. 可以与侦探自由对话，但在适当时机要求提供证据
5. 回答简洁，每次不超过150字
6. 严格按照下面的格式回复

必须的回复格式：
(情绪状态)（从当前阶段可选情绪中选择）
正文内容
<dialogue_control>
{
    "request_evidence": true或false,
    "evidence_prompt": "要求证据的话术(如果request_evidence为true)",
    "min_evidence_needed": 1-3,
    "evidence_type_hint": "动机"或"手段"或"机会"或"关系"
}
</dialogue_control>
<phase_progress>
{
    "current_phase": "${this.currentPhase}",
    "dialogue_count": ${this.phaseDialogueCount},
    "pressure_level": "${this.pressureLevel}",
    "ready_for_verdict": true或false,
    "confession_triggered": true或false,
    "should_end_confrontation": true或false
}
</phase_progress>
<ending_judgment>
{
    "accused_character": "${this.currentAccused}",
    "phases_passed": {
        "motive": ${this.phasesPassed.motive},
        "method": ${this.phasesPassed.method},
        "opportunity": ${this.phasesPassed.opportunity},
        "conspiracy": ${this.phasesPassed.conspiracy}
    },
    "total_phases_passed": ${Object.values(this.phasesPassed).filter(v => v).length},
    "is_true_culprit": ${this.currentAccused === 'chen_yaqin'},
    "predicted_ending": "${this.getPredictedEnding()}"
}
</ending_judgment>

## 角色设定
你是${character.name}，${character.age}岁，${character.identity}。${character.personality}

## 人物设定
${character.characterDescription}

## 核心秘密（调查阶段已知）
${character.roleplayConfig.coreSecrets.map(secret => `- ${secret}`).join('\n')}

## 指认阶段设定
### 整体反应模式
${accusationProfile.personality}

### 各阶段反应指南
${phaseGuidelines}

### 证据请求时机参考
- 初始阶段：第2-3轮对话后
- 证据阶段：如果侦探坚持但不提供新信息
- 最终阶段：不再要求证据，进行最后申辩

### 当前阶段可选情绪
${phaseEmotions.join('、')}

### 特殊行为模式
${accusationProfile.guiltyBehaviors ? accusationProfile.guiltyBehaviors.map(b => `- ${b}`).join('\n') : accusationProfile.innocentBehaviors.map(b => `- ${b}`).join('\n')}

## 对话历史
${historyText || '（刚开始对话）'}

## 已提交证据评估
${evidenceAssessment}

## 决策参考表
| 对话轮次 | 压力等级 | 建议行动 |
|---------|---------|---------|
| 1-2轮 | 低 | 情绪化否认，不要求证据 |
| 3-4轮 | 中 | 可以要求证据 |
| 5+轮 | 高 | 根据证据调整反应 |

请根据上述设定和工作流程扮演${character.name}。

用户输入：${userMessage}`;
    },
    
    parseResponse(response) {
        // 处理null或undefined的响应
        if (!response || typeof response !== 'string') {
            console.warn('AI响应为空或无效，使用默认响应');
            return {
                emotion: '困惑',
                text: '抱歉，我现在有些困惑，请稍后再试。',
                dialogueControl: null,
                phaseProgress: null
            };
        }
        
        const result = {
            emotion: '平静',
            text: response,
            dialogueControl: null,
            phaseProgress: null
        };
        
        // 优先解析新格式 (emotion)
        const emotionMatch = response.match(/\(([^\)]+)\)/);
        if (emotionMatch) {
            result.emotion = emotionMatch[1];
            result.text = response.replace(emotionMatch[0], '').trim();
        } else {
            // 兼容解析旧格式 [emotion]
            const oldEmotionMatch = response.match(/\[([^\]]+)\]/);
            if (oldEmotionMatch) {
                result.emotion = oldEmotionMatch[1];
                result.text = response.replace(oldEmotionMatch[0], '').trim();
            }
        }
        
        // 解析对话控制
        const dialogueControlMatch = response.match(/<dialogue_control>([\s\S]*?)<\/dialogue_control>/);
        if (dialogueControlMatch) {
            try {
                result.dialogueControl = JSON.parse(dialogueControlMatch[1]);
                result.text = result.text.replace(/<dialogue_control>[\s\S]*?<\/dialogue_control>/, '').trim();
            } catch (e) {
                console.error('解析dialogue_control失败:', e);
            }
        }
        
        // 解析阶段进度
        const phaseProgressMatch = response.match(/<phase_progress>([\s\S]*?)<\/phase_progress>/);
        if (phaseProgressMatch) {
            try {
                result.phaseProgress = JSON.parse(phaseProgressMatch[1]);
                result.text = result.text.replace(/<phase_progress>[\s\S]*?<\/phase_progress>/, '').trim();
            } catch (e) {
                console.error('解析phase_progress失败:', e);
            }
        }
        
        return result;
    },
    
    async processNPCResponse(response) {
        const npc = NpcData[this.currentAccused];
        
        // 使用统一的对话系统
        const npcName = npc ? npc.name : 'NPC';
        const npcAvatar = npc ? npc.avatar : 'assets/characters/default.png';
        
        // 添加NPC对话
        this.addDialogue(npcName, response.text, response.emotion, npcAvatar);
        
        // 处理系统控制信息
        if (response.systemControl) {
            const control = response.systemControl;
            
            // 更新下一步证明提示
            if (control.next_proof_prompt) {
                this.currentProofPrompt = control.next_proof_prompt;
                this.updateProofPromptUI(control.next_proof_prompt);
            }
            
            // 更新阶段指示器
            if (control.pressure_level) {
                this.pressureLevel = control.pressure_level;
                this.updatePhaseIndicator();
            }
            
            // 检查结局
            if (control.ending_check) {
                if (control.ending_check.perfect_ending) {
                    setTimeout(() => this.showEnding('perfect'), 2000);
                } else if (control.ending_check.good_ending) {
                    setTimeout(() => this.showEnding('good'), 2000);
                }
            }
        }
        
        // 处理对话控制信息
        if (response.dialogueControl) {
            const control = response.dialogueControl;
            
            // 请求证据
            if (control.request_evidence) {
                this.showEvidenceRequest(control);
            }
            
            // 更新阶段指示器
            if (control.pressure_level) {
                this.pressureLevel = control.pressure_level;
                this.updatePhaseIndicator();
            }
        }
        
        // 处理阶段进度信息
        if (response.phaseProgress) {
            const progress = response.phaseProgress;
            
            // 更新阶段
            if (progress.current_phase && progress.current_phase !== this.currentPhase) {
                this.currentPhase = progress.current_phase;
                document.getElementById('confrontation-phase').textContent = 
                    `${AccusationConfig.accusationPhases[this.currentPhase].title} - ${AccusationConfig.accusationPhases[this.currentPhase].description}`;
            }
            
            // 检查是否需要进入最终判决
            if (progress.ready_for_verdict) {
                setTimeout(() => {
                    this.endConfrontation();
                }, 2000);
            }
        }
    },
    
    async showEvidenceRequest(dialogueControl) {
        const container = document.getElementById('confrontation-dialogue');
        const requestDiv = document.createElement('div');
        requestDiv.className = 'evidence-request-prompt';
        requestDiv.innerHTML = `
            <p>${dialogueControl.evidence_prompt || '拿出证据来证明你的指控！'}</p>
            <p>需要提供关于<strong>${dialogueControl.evidence_type_hint}</strong>的证据</p><input type="hidden" id="evidence-type" value="${dialogueControl.evidence_type_hint}">
            <button class="primary-btn" onclick="AccusationSystem.openEvidenceSelection('${dialogueControl.evidence_type_hint}')">提供证据</button>
            <button class="secondary-btn" onclick="AccusationSystem.skipEvidence()">我还没有证据</button>
        `;
        container.appendChild(requestDiv);
        container.scrollTop = container.scrollHeight;
    },
    
    openEvidenceSelection(evidenceType) {
        // 移除证据请求提示
        const requestPrompt = document.querySelector('.evidence-request-prompt');
        if (requestPrompt) requestPrompt.remove();
        
        // 根据证据类型确定当前阶段
        const typeToPhase = {
            '动机': 'motive',
            '手段': 'method',
            '机会': 'opportunity',
            '关系': 'conspiracy'
        };
        
        const targetPhase = typeToPhase[evidenceType] || this.currentPhase;
        
        // 如果进入新阶段，更新状态
        if (targetPhase !== this.currentPhase && targetPhase !== 'initial') {
            this.currentPhase = targetPhase;
            this.phaseDialogueCount = 0;
            
            // 更新阶段显示
            const phase = AccusationConfig.accusationPhases[this.currentPhase];
            const phaseElement = document.getElementById('confrontation-phase');
            if (phaseElement) {
                phaseElement.textContent = `${phase.title} - ${phase.description}`;
            }
        }
        
        this.showEvidenceSelection();
    },
    
    skipEvidence() {
        // 移除证据请求提示
        const requestPrompt = document.querySelector('.evidence-request-prompt');
        if (requestPrompt) requestPrompt.remove();
        
        // 添加系统提示
        this.addDialogue('system', '你选择继续质问而不提供证据...');
    },
    
    showEvidenceSelection() {
        const modal = document.getElementById('evidence-selection-modal');
        const grid = document.getElementById('evidence-grid');
        const phase = AccusationConfig.accusationPhases[this.currentPhase];
        
        // 更新标题和描述
        document.getElementById('evidence-phase-title').textContent = `${phase.title} - 选择证据`;
        document.getElementById('evidence-phase-desc').textContent = phase.description;
        
        // 清空网格
        grid.innerHTML = '';
        this.selectedEvidence = [];
        
        // 获取玩家已收集的线索
        const collectedClues = AIClueManager.getTriggeredClues();
        
        // 显示所有已收集的线索
        collectedClues.forEach(clueId => {
            const clueData = AIClueManager.getClueById(clueId);
            if (!clueData) return;
            
            const item = document.createElement('div');
            item.className = 'evidence-item';
            item.dataset.clueId = clueId;
            item.innerHTML = `
                <img src="${clueData.img}" alt="${clueData.name}">
                <div class="evidence-name">${clueData.name}</div>
            `;
            
            item.onclick = () => this.toggleEvidence(clueId);
            grid.appendChild(item);
        });
        
        // 更新提交按钮
        const submitBtn = document.getElementById('submit-evidence');
        submitBtn.onclick = () => this.submitEvidence();
        submitBtn.disabled = true;
        
        // 显示模态框
        modal.style.display = 'flex';
    },
    
    toggleEvidence(clueId) {
        const index = this.selectedEvidence.indexOf(clueId);
        if (index > -1) {
            this.selectedEvidence.splice(index, 1);
        } else {
            this.selectedEvidence.push(clueId);
        }
        
        // 更新UI - 查找证据模态框中的证据项
        const modal = document.getElementById('evidence-selection-modal');
        if (modal) {
            const item = modal.querySelector(`[data-clue-id="${clueId}"]`);
            if (item) {
                if (this.selectedEvidence.includes(clueId)) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        }
    },
    
    async submitEvidence() {
        this.hideModal('evidence-selection-modal');
        
        const phase = AccusationConfig.accusationPhases[this.currentPhase];
        const phaseName = phase.name;
        const requiredEvidence = phase.requiredEvidence[this.currentAccused] || [];
        
        // 保存提交的证据
        this.evidenceChain[phaseName] = this.selectedEvidence;
        console.log('保存证据到阶段:', phaseName, '证据:', this.selectedEvidence);
        
        // 检查证据是否正确（使用评分系统）
        const score = calculateEvidenceScore(this.selectedEvidence, requiredEvidence);
        const isCorrect = score >= 0.6; // 60%以上算通过
        
        // 记录阶段结果
        this.phasesPassed[phaseName] = isCorrect;
        
        // 生成提交证据的对话
        const evidenceNames = this.getEvidenceNames(this.selectedEvidence);
        await this.addDialogue('detective', `我有证据！看看这些：${evidenceNames.join('、')}`);
        
        // NPC需要取证做出反应
        const evidenceResponse = await this.generateEvidenceResponse(this.selectedEvidence, isCorrect);
        await this.processNPCResponse(evidenceResponse);
        
        // 更新压力等级
        if (isCorrect) {
            this.increasePressure();
        }
    },
    
    async generateEvidenceResponse(evidence, isCorrect) {
        const character = CharacterPersonalities[this.currentAccused];
        const evidenceNames = this.getEvidenceNames(evidence);
        
        const evidencePrompt = `
侦探刚刚提交了以下证据：${evidenceNames.join('、')}
这些证据${isCorrect ? '确实有力地支持了指控' : '并不能完全证明指控'}。

请根据证据的准确性生成相应的反应：
- 如果证据确凿且你有罪：表现出更大的慌乱，可能会露出更多破绽
- 如果证据确凿但你无罪：冷静地解释这些证据的其他可能性
- 如果证据不足：指出证据的逻辑漏洞，要求更有力的证据

注意保持角色性格的连贯性。
`;
        
        // 在原有用户消息基础上添加证据信息
        const fullMessage = `[系统：侦探提交了证据]` + evidencePrompt;
        
        return await this.generateNPCResponse(fullMessage);
    },
    
    updatePressureLevel() {
        // 根据对话轮数和提交的证据更新压力等级
        const correctPhases = Object.values(this.phasesPassed).filter(v => v).length;
        
        if (this.phaseDialogueCount >= 5 || correctPhases >= 2) {
            this.pressureLevel = 'high';
        } else if (this.phaseDialogueCount >= 3 || correctPhases >= 1) {
            this.pressureLevel = 'medium';
        } else {
            this.pressureLevel = 'low';
        }
        
        // 更新阶段指示器
        this.updatePhaseIndicator();
        
        // 更新新UI系统的压力值
        if (this.accusationUI) {
            const pressureValue = this.pressureLevel === 'low' ? 30 : 
                                 this.pressureLevel === 'medium' ? 60 : 90;
            this.accusationUI.updatePressure(pressureValue);
        }
    },
    
    increasePressure() {
        if (this.pressureLevel === 'low') {
            this.pressureLevel = 'medium';
        } else if (this.pressureLevel === 'medium') {
            this.pressureLevel = 'high';
        }
        
        this.updatePressureLevel();
        
        this.updatePhaseIndicator();
    },
    
    getPressureLevelText(level) {
        const levelText = {
            'low': '低',
            'medium': '中',
            'high': '高'
        };
        return levelText[level] || '未知';
    },
    
    updatePhaseIndicator() {
        const phaseElement = document.getElementById('phase-indicator');
        if (phaseElement) {
            const phaseTexts = {
                'initial': '开始指认',
                'motive': '证明杀人动机',
                'method': '证明杀人手段',
                'opportunity': '证明作案机会',
                'conspiracy': '揭露共谋关系'
            };
            phaseElement.textContent = phaseTexts[this.currentPhase] || '指认阶段';
        }
    },

    // 打字机效果方法
    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    },
    
    // 3. 修改对话历史记录方法
    addToHistory(detectiveMsg, npcResponse, attachedEvidence = []) {
        this.dialogueHistory.push({
            detective: detectiveMsg,
            npc: npcResponse.text,
            emotion: npcResponse.emotion,
            evidenceSubmitted: attachedEvidence
        });
        
        // 更新已提交证据
        if (attachedEvidence.length > 0) {
            this.submittedEvidence.all.push(...attachedEvidence);
            this.analyzeEvidence();
        }
    },
    
    // 4. 新增证据分析方法
    analyzeEvidence() {
        const evidenceConfig = {
            motive: ['clue_will_draft', 'clue_deduce_inheritance_crisis', 'clue_love_letter'],
            method: ['clue_poison_bottle', 'clue_deduce_poison_source', 'clue_doctor_drug_interaction'],
            opportunity: ['clue_chen_cellar', 'clue_maid_witness', 'clue_cellar_key'],
            conspiracy: ['clue_butler_dismiss_maid', 'clue_chen_butler_relationship', 'clue_deduce_conspiracy']
        };
        
        this.evidenceAnalysis.proven = [];
        this.evidenceAnalysis.pending = [];
        
        for (const [type, required] of Object.entries(evidenceConfig)) {
            const submitted = this.submittedEvidence.all.filter(e => required.includes(e));
            if (submitted.length > 0) {
                this.evidenceAnalysis.proven.push({
                    type,
                    evidence: submitted
                });
            } else {
                this.evidenceAnalysis.pending.push({
                    type,
                    required
                });
            }
        }
    },
    
    // 8. 新增UI更新方法
    updateProofPromptUI(prompt) {
        let promptElement = document.getElementById('current-proof-prompt');
        if (!promptElement) {
            // 创建提示元素
            const header = document.querySelector('.confrontation-header');
            promptElement = document.createElement('div');
            promptElement.id = 'current-proof-prompt';
            promptElement.className = 'proof-prompt';
            header.appendChild(promptElement);
        }
        promptElement.innerHTML = `<strong>当前需要：</strong>${prompt}`;
    },
    
    // 9. 新增证据附加UI
    showEvidenceAttachment() {
        const modal = document.createElement('div');
        modal.id = 'evidence-attachment-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>选择要附加的证据</h3>
                <div id="attachment-evidence-grid" class="evidence-grid"></div>
                <div class="attachment-controls">
                    <button onclick="AccusationSystem.confirmAttachment()">确认</button>
                    <button onclick="AccusationSystem.cancelAttachment()">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 显示可用证据
        const grid = document.getElementById('attachment-evidence-grid');
        const collectedClues = AIClueManager.getTriggeredClues();
        
        collectedClues.forEach(clueId => {
            const clueData = AIClueManager.getClueById(clueId);
            if (!clueData) return;
            
            const item = document.createElement('div');
            item.className = 'evidence-item';
            item.setAttribute('data-clue-id', clueId);
            if (this.attachedEvidence.includes(clueId)) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <img src="${clueData.img}" alt="${clueData.name}">
                <div>${clueData.name}</div>
            `;
            
            item.onclick = () => this.toggleAttachedEvidence(clueId);
            grid.appendChild(item);
        });
        
        modal.style.display = 'flex';
    },
    
    toggleAttachedEvidence(clueId) {
        const index = this.attachedEvidence.indexOf(clueId);
        if (index > -1) {
            this.attachedEvidence.splice(index, 1);
        } else {
            this.attachedEvidence.push(clueId);
        }
        
        // 更新UI - 查找附加证据模态框中的证据项
        const modal = document.getElementById('evidence-attachment-modal');
        if (modal) {
            const item = modal.querySelector(`[data-clue-id="${clueId}"]`);
            if (item) {
                if (this.attachedEvidence.includes(clueId)) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        }
    },
    
    confirmAttachment() {
        // 关闭模态框
        const modal = document.getElementById('evidence-attachment-modal');
        if (modal) {
            modal.remove();
        }
        
        // 更新附加证据显示
        this.updateAttachedEvidenceUI();
    },
    
    cancelAttachment() {
        // 关闭模态框
        const modal = document.getElementById('evidence-attachment-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    updateAttachedEvidenceUI() {
        const container = document.getElementById('attached-evidence-display');
        if (!container) return;
        
        // 清空现有内容
        container.innerHTML = '';
        
        // 如果没有附加证据，隐藏容器
        if (this.attachedEvidence.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        // 显示附加证据
        container.style.display = 'flex';
        
        this.attachedEvidence.forEach(clueId => {
            const clueData = AIClueManager.getClueById(clueId);
            if (!clueData) return;
            
            const item = document.createElement('div');
            item.className = 'attached-evidence-item';
            item.innerHTML = `
                <img src="${clueData.img}" alt="${clueData.name}">
                <span>${clueData.name}</span>
                <button onclick="AccusationSystem.removeAttachedEvidence('${clueId}')">×</button>
            `;
            container.appendChild(item);
        });
    },
    
    removeAttachedEvidence(clueId) {
        const index = this.attachedEvidence.indexOf(clueId);
        if (index > -1) {
            this.attachedEvidence.splice(index, 1);
            this.updateAttachedEvidenceUI();
        }
    },
    
    getEvidenceNames(evidenceIds) {
        return evidenceIds.map(id => {
            const clue = AIClueManager.getClueById(id);
            return clue ? clue.name : id;
        });
    },
    
    endConfrontation() {
        // 关闭新的指证UI
        if (this.accusationUI) {
            this.accusationUI.endAccusationMode();
        }
        
        // 如果没有进行足够的对话，给出提示
        if (this.dialogueHistory.length < 10) {
            if (confirm('对话还不够充分，确定要结束对决吗？')) {
                this.processFinalVerdict();
            }
        } else {
            this.processFinalVerdict();
        }
    },
    
    getPredictedEnding() {
        // 预测结局类型（与processFinalVerdict逻辑相同）
        const passedPhases = Object.values(this.phasesPassed).filter(v => v).length;
        const isTrueCulprit = this.currentAccused === 'chen_yaqin';
        
        let ending = 'failure';
        if (isTrueCulprit && passedPhases >= 3) {
            ending = 'perfect';
        } else if (isTrueCulprit && passedPhases >= 2) {
            ending = 'good';
        } else if (this.currentAccused === 'laochen' && passedPhases >= 2) {
            ending = 'partial'; // 抓到共犯
        }
        
        return ending;
    },

    processFinalVerdict() {
        // 计算最终结果
        const ending = this.getPredictedEnding();
        this.showEnding(ending, { achievements: [] });
    },
    
    showEnding(endingType, result) {
        const modal = document.getElementById('ending-modal');
        const titleEl = document.getElementById('ending-title');
        const descriptionEl = document.getElementById('ending-description');
        const achievementsEl = document.getElementById('ending-achievements');
        const confirmBtn = document.getElementById('ending-confirm-btn');
        const replayBtn = document.getElementById('ending-replay-btn');

        const endingData = AccusationConfig.endings[endingType];
        if (!endingData) {
            console.error('未找到结局类型:', endingType);
            return;
        }

        // Dispatch gameEnded event for the music system
        // document.dispatchEvent(new CustomEvent('gameEnded', { detail: { isSuccess: endingData.success } }));

        // 设置标题和样式
        titleEl.textContent = endingData.title;
        titleEl.className = `ending-title ${endingData.success ? 'success' : 'failure'}`;

        // 清空成就和描述
        achievementsEl.innerHTML = '';
        descriptionEl.innerHTML = '';

        // 隐藏按钮
        confirmBtn.style.display = 'none';
        replayBtn.style.display = 'none';

        // 显示模态框
        modal.style.display = 'flex';

        // 使用打字机效果显示结局描述
        UIManager.typewriterEffect(descriptionEl, endingData.description, () => {
            // 打字机效果完成后显示成就和按钮
            if (result.achievements && result.achievements.length > 0) {
                achievementsEl.innerHTML = '<h3>达成的成就</h3>';
                result.achievements.forEach(ach => {
                    const achEl = document.createElement('div');
                    achEl.className = 'achievement-item';
                    achEl.textContent = ach;
                    achievementsEl.appendChild(achEl);
                });
            }
            confirmBtn.style.display = 'inline-block';
            replayBtn.style.display = 'inline-block';
        });
    },

    // 隐藏模态框
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // 调试方法：强制测试指证UI
    forceTestAccusationUI() {
        console.log('[AccusationSystem] 强制测试指证UI');
        
        // 设置测试数据
        this.currentAccused = 'chen_yaqin';
        
        // 强制启动指证UI
        if (this.accusationUI) {
            console.log('[AccusationSystem] 启动指证UI模式（测试）');
            this.accusationUI.startAccusationMode();
            
            // 添加测试对话
            this.accusationUI.addDialogue('detective', '这是测试消息', 'assets/characters/me/detective.png');
            this.accusationUI.showNextDialogue();
            
            setTimeout(() => {
                this.accusationUI.addDialogue('npc', '这是NPC的测试回复', 'assets/characters/chen_yaqin/calm.png');
                this.accusationUI.showNextDialogue();
            }, 2000);
        } else {
            console.error('[AccusationSystem] accusationUI 未初始化！');
        }
    },
    
    // 测试结局功能
    testEnding(endingType = 'perfect') {
        console.log('测试结局:', endingType);
        this.showEnding(endingType, { achievements: [] });
    },
    
    // 调试命令：显示所有物证和证词
    showAllEvidence() {
        console.log('=== 所有物证信息 ===');
        if (window.GameState && window.GameState.discoveredClues) {
            console.log('已发现的线索:', window.GameState.discoveredClues);
            window.GameState.discoveredClues.forEach(clueId => {
                const clue = window.ClueSystem?.getClue(clueId);
                if (clue) {
                    console.log(`${clue.name}: ${clue.description}`);
                }
            });
        }
        
        console.log('\n=== 已提交的证据 ===');
        console.log('所有证据:', this.submittedEvidence.all);
        console.log('按类型分类:', this.submittedEvidence.byType);
        
        console.log('\n=== 对话历史 ===');
        this.dialogueHistory.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.speaker}: ${entry.text}`);
        });
        
        return {
            discoveredClues: window.GameState?.discoveredClues || [],
            submittedEvidence: this.submittedEvidence,
            dialogueHistory: this.dialogueHistory
        };
    },
    
    // 只显示物证类证据（不包含推理线索）
    showPhysicalEvidence() {
        console.log('=== 物证类证据 ===');
        
        // 从GameState获取已收集的线索
        const acquiredClues = window.GameState?.acquiredClues || [];
        const physicalEvidence = acquiredClues.filter(clue => clue.type === 'evidence');
        
        if (physicalEvidence.length === 0) {
            console.log('暂无物证类证据');
            return [];
        }
        
        physicalEvidence.forEach((clue, index) => {
            console.log(`${index + 1}. ${clue.name}`);
            console.log(`   描述: ${clue.description}`);
            console.log(`   ID: ${clue.id}`);
            console.log('---');
        });
        
        console.log(`\n共找到 ${physicalEvidence.length} 个物证`);
        return physicalEvidence;
    },
    
    // 隐藏输入框和底部控制按钮
    hideInputControls() {
        const inputSection = document.querySelector('.input-section');
        const bottomControls = document.querySelector('.bottom-controls');
        
        if (inputSection) {
            inputSection.style.display = 'none';
            console.log('输入框已隐藏');
        }
        
        if (bottomControls) {
            bottomControls.style.display = 'none';
            console.log('底部控制按钮已隐藏');
        }
    },
    
    // 显示输入框和底部控制按钮
    showInputControls() {
        const inputSection = document.querySelector('.input-section');
        const bottomControls = document.querySelector('.bottom-controls');
        
        if (inputSection) {
            inputSection.style.display = 'block';
            console.log('输入框已显示');
        }
        
        if (bottomControls) {
            bottomControls.style.display = 'flex';
            console.log('底部控制按钮已显示');
        }
    },
    
    // 清理对话区域的多余div
    cleanDialogueArea() {
        const dialogueArea = document.querySelector('.dialogue-display-area');
        if (dialogueArea) {
            // 移除所有旧的对话内容
            dialogueArea.innerHTML = '';
            console.log('对话区域已清理');
        }
    },
    
    // 直接获得所有非推理线索（物证和证词）
    getAllNonInferenceClues() {
        // 从gameData.js获取所有线索数据
        const ClueData = window.ClueData || {};
        const addedClues = [];
        
        // 遍历所有线索，添加物证类和证词类
        Object.keys(ClueData).forEach(clueId => {
            const clueData = ClueData[clueId];
            if (clueData && (clueData.type === 'evidence' || clueData.type === 'testimony')) {
                // 检查是否已经获得
                const alreadyHas = window.GameState?.acquiredClues?.some(c => c.id === clueId);
                if (!alreadyHas) {
                    // 添加到游戏状态
                    const clueToAdd = {
                        id: clueId,
                        name: clueData.name,
                        description: clueData.description,
                        type: clueData.type,
                        img: clueData.img
                    };
                    
                    if (!window.GameState.acquiredClues) {
                        window.GameState.acquiredClues = [];
                    }
                    
                    window.GameState.acquiredClues.push(clueToAdd);
                    addedClues.push(clueToAdd);
                }
            }
        });
        
        // 保存游戏状态
        if (window.GameState && window.GameState.save) {
            window.GameState.save();
        }
        
        console.log(`已添加 ${addedClues.length} 个线索到游戏状态:`);
        addedClues.forEach(clue => {
            console.log(`- ${clue.name} (${clue.type})`);
        });
        
        return addedClues;
    }
};

window.AccusationSystem = AccusationSystem;

