// 场景系统
import { GameState } from './GameState.js';
import { SceneData } from '../config/gameData.js';
import { UIManager } from '../ui/UIManager.js';

export const SceneSystem = {
    init() {
        console.log('初始化场景系统');
        this.changeScene(GameState.currentScene);
    },
    
    changeScene(sceneId) {
        if (!SceneData[sceneId]) {
            console.error(`场景 ${sceneId} 不存在!`);
            return;
        }
        
        GameState.currentScene = sceneId;
        
        const gameContainer = document.getElementById('game-container');
        const sceneNameEl = document.getElementById('scene-name');
        const gameTimeEl = document.getElementById('game-time');
        
        // 更新场景背景
        gameContainer.style.backgroundImage = `url(${SceneData[sceneId].bg})`;
        
        // 更新场景名称和时间
        sceneNameEl.textContent = SceneData[sceneId].name;
        gameTimeEl.textContent = GameState.gameTime;
        
        console.log(`切换到场景: ${SceneData[sceneId].name}`);
        
        // 保存游戏状态
        GameState.save();
        
        // 更新NPC显示
        if (UIManager && UIManager.renderNpcAvatars) {
            UIManager.renderNpcAvatars();
        }
        
        // Dispatch scene change event
        document.dispatchEvent(new CustomEvent('sceneChanged', { 
            detail: { sceneId } 
        }));
    },
    
    getAvailableScenes() {
        // 获取除当前场景外的所有可用场景
        return Object.keys(SceneData).filter(sceneId => 
            sceneId !== GameState.currentScene
        );
    },
    
    getCurrentScene() {
        return SceneData[GameState.currentScene];
    },
    
    getSceneById(sceneId) {
        return SceneData[sceneId];
    }
};