// 主入口文件
import { MusicSystem } from './core/MusicSystem.js';
import { GameState } from './core/GameState.js';
import { SceneSystem } from './core/SceneSystem.js';
import { DialogueSystem } from './core/DialogueSystem.js';
import { InvestigationSystem } from './core/InvestigationSystem.js';
import { ClueSystem } from './core/ClueSystem.js';
import { MenuSystem } from './core/MenuSystem.js';
import { TimeSystem } from './core/TimeSystem.js';
import { UIManager } from './ui/UIManager.js';
import { initializeEnhancedAI } from './ai/AIService.js';
import { InferenceUI } from './ui/InferenceUI.js';
import { AccusationSystem } from './ai/AccusationSystem.js';
import AccusationUI from './ui/AccusationUI.js';
import { ClueData } from './config/gameData.js';

// 故事文本
const introStory = `深秋的夜晚，暴雨如注。

你是一名私家侦探，受邀参加林氏山庄主人林山庄先生的65岁生日晚宴。

然而，就在晚宴进行到一半时，林山庄在举杯致辞后突然倒下...

经李医生确认，林先生已经死亡，死因疑似中毒。

暴雨冲毁了山路，警察要到天亮才能赶到。

作为在场唯一的侦探，你必须在天亮前查明真相...`;

// 游戏初始化
async function initializeGame() {
    console.log('开始初始化游戏...');
    
    // 加载游戏状态
    GameState.load();
    
    // 初始化各个系统
    SceneSystem.init();
    DialogueSystem.init();
    ClueSystem.init();
    TimeSystem.init();
    UIManager.init();
    MenuSystem.init();
    InferenceUI.init();
    AccusationSystem.init();
    
    // 初始化AI中间件
    await initializeEnhancedAI();
    
    // 切换到当前场景
    SceneSystem.changeScene(GameState.currentScene);
    
    console.log('游戏初始化完成');
}

// Helper function for typewriter effect
function typewriter(element, text, callback) {
    element.innerHTML = ''; // Clear existing text
    let i = 0;
    const speed = 50; // Typing speed in ms

    function type() {
        if (i < text.length) {
            const char = text.charAt(i);
            if (char === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += char;
            }
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }

    type();
}

// 显示故事介绍
function showStoryIntro() {
    const mainMenu = document.getElementById('main-menu');
    const storyIntro = document.getElementById('story-intro');
    const introTextElement = document.getElementById('intro-text');
    const startInvestigationBtn = document.getElementById('start-investigation-btn');
    
    mainMenu.style.display = 'none';
    storyIntro.style.display = 'flex';
    
    // 初始隐藏按钮
    startInvestigationBtn.style.display = 'none';
    
    // 使用打字机效果显示故事介绍
    typewriter(introTextElement, introStory, () => {
        startInvestigationBtn.style.display = 'block';
    });
}

// 开始游戏
function startGame() {
    const storyIntro = document.getElementById('story-intro');
    const gameContainer = document.getElementById('game-container');
    const bottomActionBar = document.getElementById('bottom-action-bar');
    
    storyIntro.style.display = 'none';
    gameContainer.style.display = 'block';
    bottomActionBar.style.display = 'flex';
    
    initializeGame();
    
    // 启动时间系统
    TimeSystem.startTimer();

    // Dispatch gamestart event for the music system
    document.dispatchEvent(new CustomEvent('gamestart'));
}

// DOM加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面已加载，准备初始化游戏');
    
    // 绑定主菜单事件
    MusicSystem.init(); // 初始化音乐系统
    const startGameBtn = document.getElementById('start-game-btn');
    const startInvestigationBtn = document.getElementById('start-investigation-btn');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', showStoryIntro);
    }
    
    if (startInvestigationBtn) {
        startInvestigationBtn.addEventListener('click', startGame);
    }
    
    // 绑定推理按钮事件
    const inferenceBtn = document.getElementById('inference-btn');
    if (inferenceBtn) {
        inferenceBtn.addEventListener('click', () => {
            InferenceUI.openModal();
        });
    }
    
    // 添加调试信息
    console.log('调试提示：如果重新游玩按钮无响应，请在控制台输入 debugRestart() 强制重启');
});

// 调试用：添加控制台快捷命令
window.debugRestart = function() {
    console.log('调试：强制重启游戏');
    localStorage.removeItem('rainyNightMystery');
    window.location.reload(true);
};