// UI管理器
import { GameState } from '../core/GameState.js';
import { NpcData, SceneData, NpcInfo } from '../config/gameData.js';
import { SceneSystem } from '../core/SceneSystem.js';
import { DialogueSystem } from '../core/DialogueSystem.js';
import { InvestigationSystem } from '../core/InvestigationSystem.js';
import { ClueSystem } from '../core/ClueSystem.js';

export const UIManager = {
    init() {
        console.log('初始化UI管理器');
        // 初始化所有事件监听器
        this.initEventListeners();
        // 初始化NPC头像
        this.renderNpcAvatars();
    },

    // 显示通知提示
    showToast(message, duration = 3000, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `game-toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    },

    // 打字机效果
    typewriterEffect(element, text, callback) {
        let i = 0;
        const speed = 50; // 打字速度 (ms)
        element.innerHTML = '';

        function type() {
            if (i < text.length) {
                // 替换换行符为 <br>
                if (text.charAt(i) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(type, speed);
            } else {
                if (callback) {
                    callback();
                }
            }
        }
        type();
    },

    hideAllModals() {
        // 隐藏所有模态框
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
        // 关闭线索面板
        const cluesPanel = document.getElementById('clues-panel');
        if (cluesPanel) {
            cluesPanel.classList.remove('open');
        }
        // 隐藏所有NPC操作菜单
        document.querySelectorAll('.npc-action-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    },

    initEventListeners() {
        // 调查按钮事件
        const investigateBtn = document.getElementById('investigate-btn');
        if (investigateBtn) {
            investigateBtn.addEventListener('click', () => {
                this.hideAllModals();
                InvestigationSystem.renderInvestigationList();
                document.getElementById('investigation-modal').style.display = 'flex';
            });
        }

        // 移动按钮事件
        const moveBtn = document.getElementById('move-btn');
        if (moveBtn) {
            moveBtn.addEventListener('click', () => {
                this.hideAllModals();
                this.renderSceneList();
                document.getElementById('scene-selection-modal').style.display = 'flex';
            });
        }

        // 线索按钮事件
        const cluesBtn = document.getElementById('clues-btn');
        if (cluesBtn) {
            cluesBtn.addEventListener('click', () => {
                this.hideAllModals();
                ClueSystem.toggleModal();
            });
        }

        // 场景切换时重新渲染NPC头像
        document.addEventListener('sceneChanged', () => {
            this.renderNpcAvatars();
        });

        // 模态窗口关闭按钮事件
        document.querySelectorAll('.modal-close-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    },

    showResultModal(title, content, avatar = null) {
        // 关闭所有其他模态框
        this.hideAllModals();
        
        const titleEl = document.getElementById('result-modal-title');
        const contentEl = document.getElementById('result-modal-content');
        const avatarEl = document.getElementById('result-modal-avatar');
        
        if (titleEl) titleEl.textContent = title;
        if (contentEl) contentEl.innerHTML = content;
        
        if (avatar && avatarEl) {
            avatarEl.src = avatar;
            avatarEl.style.display = 'block';
        } else if (avatarEl) {
            avatarEl.style.display = 'none';
        }
        
        const modal = document.getElementById('result-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    renderNpcAvatars() {
        const npcArea = document.getElementById('npc-area');
        if (!npcArea) return;
        
        npcArea.innerHTML = '';
        
        const currentScene = SceneData[GameState.currentScene];
        if (!currentScene || !currentScene.npcs || currentScene.npcs.length === 0) {
            return;
        }
        
        currentScene.npcs.forEach(npcId => {
            const npc = NpcData[npcId];
            if (!npc) return;
            
            // 获取对话次数
            if (!GameState.npcDialogueCount[npcId]) {
                GameState.npcDialogueCount[npcId] = 0;
            }
            const remainingDialogues = (npc.dialogueMax || 10) - GameState.npcDialogueCount[npcId];
            
            // 创建NPC头像容器
            const npcWrapper = document.createElement('div');
            npcWrapper.className = 'npc-avatar-wrapper';
            npcWrapper.dataset.npc = npcId;
            
            // 创建NPC头像
            const npcAvatar = document.createElement('img');
            npcAvatar.className = 'npc-avatar';
            npcAvatar.src = npc.avatar;
            npcAvatar.alt = npc.name;
            
            // 创建操作菜单
            const actionMenu = document.createElement('div');
            actionMenu.className = 'npc-action-menu';
            
            // 创建对话按钮
            const dialogueBtn = document.createElement('button');
            dialogueBtn.className = 'action-btn dialogue-btn';
            dialogueBtn.innerHTML = '对话';
            dialogueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                actionMenu.classList.remove('active');
                DialogueSystem.startDialogue(npcId);
            });
            
            // 创建信息按钮
            const infoBtn = document.createElement('button');
            infoBtn.className = 'action-btn info-btn';
            infoBtn.innerHTML = '信息';
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                actionMenu.classList.remove('active');
                this.showNpcInfo(npcId);
            });
            
            // 组装菜单
            actionMenu.appendChild(dialogueBtn);
            actionMenu.appendChild(infoBtn);
            
            // 点击头像显示/隐藏菜单
            npcWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                // 隐藏其他菜单
                document.querySelectorAll('.npc-action-menu').forEach(menu => {
                    if (menu !== actionMenu) {
                        menu.classList.remove('active');
                    }
                });
                // 切换当前菜单
                actionMenu.classList.toggle('active');
            });
            
            // 组装NPC头像
            npcWrapper.appendChild(npcAvatar);
            npcWrapper.appendChild(actionMenu);
            
            // 添加到页面
            npcArea.appendChild(npcWrapper);
        });
    },

    showNpcInfo(npcId) {
        const npc = NpcData[npcId];
        if (!npc) return;
        
        // 获取NPC详细信息
        const npcInfo = NpcInfo[npcId] || `<strong>姓名：</strong>${npc.name}<br><strong>身份：</strong>${npc.identity}`;
        
        this.showResultModal(`${npc.name} - 信息`, npcInfo, npc.avatar);
    },

    showConfirmDialog(message, onConfirm, onCancel) {
        // 关闭所有其他模态框
        this.hideAllModals();
        
        // 设置对话框内容
        const messageEl = document.getElementById('confirm-dialog-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        // 获取按钮元素
        const confirmBtn = document.getElementById('confirm-dialog-ok');
        const cancelBtn = document.getElementById('confirm-dialog-cancel');
        
        // 清除之前可能存在的事件监听器
        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            newConfirmBtn.addEventListener('click', () => {
                this.hideConfirmDialog();
                if (onConfirm && typeof onConfirm === 'function') {
                    onConfirm();
                }
            });
        }
        
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.addEventListener('click', () => {
                this.hideConfirmDialog();
                if (onCancel && typeof onCancel === 'function') {
                    onCancel();
                }
            });
        }
        
        // 显示确认对话框
        const dialog = document.getElementById('confirm-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
        }
    },

    hideConfirmDialog() {
        const dialog = document.getElementById('confirm-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    },

    renderSceneList() {
        const container = document.getElementById('scene-list-container');
        if (!container) return;
        
        container.innerHTML = '';

        // 按楼层分组场景
        const floors = {};
        Object.keys(SceneData).forEach(sceneId => {
            const scene = SceneData[sceneId];
            if (!floors[scene.floor]) {
                floors[scene.floor] = [];
            }
            floors[scene.floor].push({ id: sceneId, ...scene });
        });

        // 定义楼层显示名称
        const floorNames = {
            'outside': '室外',
            'first_floor': '一楼',
            'second_floor': '二楼',
            'basement': '地下室'
        };

        // 为每个楼层创建场景列表
        Object.keys(floors).forEach(floor => {
            const floorGroup = document.createElement('div');
            floorGroup.className = 'floor-group';

            const floorTitle = document.createElement('div');
            floorTitle.className = 'floor-title';
            floorTitle.textContent = floorNames[floor] || floor;
            floorGroup.appendChild(floorTitle);

            floors[floor].forEach(scene => {
                // 跳过当前场景
                if (scene.id === GameState.currentScene) return;

                const sceneItem = document.createElement('div');
                sceneItem.className = 'scene-selection-item';
                sceneItem.innerHTML = `
                    <img src="${scene.thumbnail}" alt="${scene.name}" class="scene-thumbnail">
                    <div class="scene-info">
                        <div class="scene-name-display">${scene.name}</div>
                        <div class="scene-description">${scene.description}</div>
                    </div>
                `;

                sceneItem.addEventListener('click', () => {
                    SceneSystem.changeScene(scene.id);
                    this.hideAllModals();
                });

                floorGroup.appendChild(sceneItem);
            });

            container.appendChild(floorGroup);
        });
    }
};