class AccusationUI {
  constructor() {
    console.log('[AccusationUI] 初始化AccusationUI');
    this.dialogueContainer = document.getElementById('dialogue-box');
    this.avatarImage = document.getElementById('avatar-image');
    this.dialogueText = document.getElementById('dialogue-text');
    this.evidenceGrid = document.querySelector('.evidence-grid');
    this.unusedGrayBar = document.getElementById('unused-gray-bar'); // 假设灰色条的id为unused-gray-bar
    this.pressureValue = document.getElementById('pressure-value');
    this.accusationDialogueContainer = document.getElementById('accusation-dialogue-container');
    this.evidenceSelection = document.getElementById('evidence-selection');
    this.pressureDisplay = document.getElementById('pressure-display');
    
    // 调试：检查关键元素是否存在
    console.log('[AccusationUI] DOM元素检查:');
    console.log('- accusationDialogueContainer:', !!this.accusationDialogueContainer);
    console.log('- evidenceSelection:', !!this.evidenceSelection);
    console.log('- pressureDisplay:', !!this.pressureDisplay);
    console.log('- avatarImage:', !!this.avatarImage);
    console.log('- dialogueText:', !!this.dialogueText);

    this.currentSpeaker = 'npc'; // npc 或 detective
    this.dialogues = [];
    this.dialogueIndex = 0;
    this.selectedEvidence = new Set();
    this.pressure = 0;
    this.isTyping = false;

    this.initEvidenceItems();
  }

  initEvidenceItems() {
    // 获取游戏中的证据列表
    const evidenceList = window.gameData?.evidenceList || [];
    if (this.evidenceGrid) {
      this.evidenceGrid.innerHTML = '';
      evidenceList.forEach(evidence => {
        const item = document.createElement('div');
        item.classList.add('evidence-item');
        item.textContent = evidence.name;
        item.dataset.id = evidence.id;
        item.addEventListener('click', () => this.toggleEvidenceSelection(evidence.id, item));
        this.evidenceGrid.appendChild(item);
      });
    }
  }

  toggleEvidenceSelection(evidenceId, element) {
    if (this.selectedEvidence.has(evidenceId)) {
      this.selectedEvidence.delete(evidenceId);
      element.classList.remove('selected');
    } else {
      this.selectedEvidence.add(evidenceId);
      element.classList.add('selected');
    }
    // 更新压力值
    this.updatePressure(this.pressure + (this.selectedEvidence.has(evidenceId) ? 10 : -10));
  }

  showAccusationUI() {
    console.log('[AccusationUI] 显示指证UI');
    if (this.accusationDialogueContainer) {
      this.accusationDialogueContainer.style.display = 'block';
      console.log('[AccusationUI] 对话容器已显示');
    } else {
      console.error('[AccusationUI] 对话容器未找到');
    }
    if (this.evidenceSelection) {
      this.evidenceSelection.style.display = 'block';
      console.log('[AccusationUI] 证据选择区域已显示');
    } else {
      console.error('[AccusationUI] 证据选择区域未找到');
    }
    if (this.pressureDisplay) {
      // 根据阶段显示文字，替代压力等级
      const phaseTextMap = {
        initial: '开始指认',
        motive: '证明杀人动机',
        method: '证明作案手法',
        opportunity: '证明作案机会',
        conspiracy: '揭露共谋关系',
        final: '最终对决'
      };
      const currentPhase = window.AccusationSystem?.currentPhase || 'initial';
      this.pressureDisplay.textContent = phaseTextMap[currentPhase] || '';
      this.pressureDisplay.style.display = 'block';
      console.log('[AccusationUI] 阶段文字区域已显示');
    } else {
      console.error('[AccusationUI] 阶段文字区域未找到');
    }
    // 隐藏无用灰色条
    if (this.unusedGrayBar) {
      this.unusedGrayBar.style.display = 'none';
      console.log('[AccusationUI] 隐藏无用灰色条');
    }
  }

  hideAccusationUI() {
    if (this.accusationDialogueContainer) {
      this.accusationDialogueContainer.style.display = 'none';
    }
    if (this.evidenceSelection) {
      this.evidenceSelection.style.display = 'none';
    }
    if (this.pressureDisplay) {
      this.pressureDisplay.style.display = 'none';
    }
  }

  showNextDialogue() {
    if (this.dialogueIndex >= this.dialogues.length || this.isTyping) return;
    
    const dialogue = this.dialogues[this.dialogueIndex];
    this.dialogueIndex++;

    // 切换头像和对话框样式
    if (this.avatarImage) {
      if (dialogue.speaker === 'detective') {
        this.avatarImage.src = 'assets/characters/me/detective.png';
      } else {
        this.avatarImage.src = dialogue.avatar || 'assets/characters/chen_yaqin/calm.png';
      }
    }

    this.typeText(dialogue.text);
    this.currentSpeaker = dialogue.speaker;
  }

  typeText(text) {
    if (!this.dialogueText) return;
    
    this.isTyping = true;
    this.dialogueText.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        this.dialogueText.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
        this.isTyping = false;
      }
    }, 30);
  }

  updatePressure(value) {
    this.pressure = Math.max(0, Math.min(100, value)); // 限制在0-100之间
    if (this.pressureValue) {
      this.pressureValue.textContent = this.pressure;
    }
  }

  // 修改线索框背景色
  updateEvidenceGridBackground() {
    if (this.evidenceGrid) {
      this.evidenceGrid.style.backgroundColor = '#4b2e2e'; // 深棕色背景
    }
  }

  setDialogues(dialogues) {
    this.dialogues = dialogues;
    this.dialogueIndex = 0;
  }

  addDialogue(speaker, text, avatar = null) {
    this.dialogues.push({
      speaker: speaker,
      text: text,
      avatar: avatar
    });
  }

  clearDialogues() {
    this.dialogues = [];
    this.dialogueIndex = 0;
    if (this.dialogueText) {
      this.dialogueText.textContent = '';
    }
  }

  getSelectedEvidence() {
    return Array.from(this.selectedEvidence);
  }

  clearSelectedEvidence() {
    this.selectedEvidence.clear();
    if (this.evidenceGrid) {
      this.evidenceGrid.querySelectorAll('.evidence-item').forEach(item => {
        item.classList.remove('selected');
      });
    }
  }

  // 与现有AccusationSystem集成的方法
  startAccusationMode() {
    this.showAccusationUI();
    this.clearDialogues();
    this.clearSelectedEvidence();
    this.updatePressure(0);
    this.updateEvidenceGridBackground();
  }

  endAccusationMode() {
    this.hideAccusationUI();
    this.clearDialogues();
    this.clearSelectedEvidence();
  }
}

// 不再创建全局实例，由AccusationSystem管理

export default AccusationUI;