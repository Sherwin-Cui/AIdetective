// 时间系统
import { GameState } from './GameState.js';
import { UIManager } from '../ui/UIManager.js';

export const TimeSystem = {
    // 时间配置
    startTime: { hours: 20, minutes: 45 }, // 8:45 PM
    endTime: { hours: 6, minutes: 30 },    // 6:30 AM
    totalGameMinutes: 50,                  // 现实世界50分钟
    
    // 计算游戏内总分钟数 (8:45 PM 到 6:30 AM)
    totalInGameMinutes: (24 - 20) * 60 - 45 + 6 * 60 + 30, // 585分钟
    
    // 时间状态
    gameStartTime: null,
    currentGameTime: null,
    isRunning: false,
    timeInterval: null,
    
    init() {
        console.log('初始化时间系统');
        this.setupTimeDisplay();
    },
    
    // 开始计时
    startTimer() {
        if (this.isRunning) return;
        
        this.gameStartTime = Date.now();
        this.currentGameTime = { ...this.startTime };
        this.isRunning = true;
        
        // 每秒更新一次时间
        this.timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
        
        console.log('时间系统已启动');
        this.updateTimeDisplay();
    },
    
    // 停止计时
    stopTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        
        console.log('时间系统已停止');
    },
    
    // 更新时间
    updateTime() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const elapsedRealTime = now - this.gameStartTime; // 毫秒
        const elapsedRealMinutes = elapsedRealTime / (1000 * 60); // 转换为分钟
        
        // 计算游戏内经过的分钟数
        const gameMinutesElapsed = (elapsedRealMinutes / this.totalGameMinutes) * this.totalInGameMinutes;
        
        // 计算当前游戏时间
        const totalStartMinutes = this.startTime.hours * 60 + this.startTime.minutes;
        const currentTotalMinutes = totalStartMinutes + gameMinutesElapsed;
        
        // 处理跨天情况
        let hours = Math.floor(currentTotalMinutes / 60) % 24;
        let minutes = Math.floor(currentTotalMinutes % 60);
        
        this.currentGameTime = { hours, minutes };
        
        // 更新GameState中的时间
        GameState.gameTime = this.formatTime(hours, minutes);
        
        // 更新显示
        this.updateTimeDisplay();
        
        // 检查是否到达结束时间
        if (this.isTimeUp()) {
            this.triggerTimeUpEnding();
        }
        
        // 检查是否需要保存游戏状态
        if (Math.floor(elapsedRealMinutes) % 5 === 0) { // 每5分钟保存一次
            GameState.save();
        }
    },
    
    // 格式化时间显示
    formatTime(hours, minutes) {
        const period = hours < 12 ? '上午' : (hours < 18 ? '下午' : '晚上');
        const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        const formattedMinutes = minutes.toString().padStart(2, '0');
        
        // 特殊处理凌晨时间
        if (hours >= 0 && hours < 6) {
            return `凌晨 ${displayHours}:${formattedMinutes}`;
        }
        
        return `${period} ${displayHours}:${formattedMinutes}`;
    },
    
    // 检查时间是否到达
    isTimeUp() {
        const current = this.currentGameTime;
        const end = this.endTime;
        
        // 如果当前时间是凌晨6:30或之后
        if (current.hours >= 0 && current.hours < 12) {
            return current.hours > end.hours || 
                   (current.hours === end.hours && current.minutes >= end.minutes);
        }
        
        return false;
    },
    
    // 触发时间到达的失败结局
    triggerTimeUpEnding() {
        this.stopTimer();
        
        console.log('时间到！触发失败结局');
        
        // 设置失败结局
        GameState.gameEnding = 'time_up_failure';
        GameState.save();
        
        // 显示失败结局
        this.showTimeUpModal();
        
        // 触发游戏结束事件
        document.dispatchEvent(new CustomEvent('gameEnding', {
            detail: { ending: 'time_up_failure', reason: 'time_up' }
        }));
    },
    
    // 显示时间到达的模态框
    showTimeUpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.zIndex = '10000';
        
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center; max-width: 500px;">
                <h2 style="color: var(--danger-color); margin-bottom: 20px;">⏰ 时间到！</h2>
                <div style="margin-bottom: 30px; line-height: 1.6;">
                    <p>天亮了，警察即将到达现场...</p>
                    <p>你没能在限定时间内找出真相，案件将成为悬案。</p>
                    <p><strong>游戏结束</strong></p>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="restart-after-timeout" class="main-action-btn">重新开始</button>
                    <button id="menu-after-timeout" class="main-action-btn">返回主菜单</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定按钮事件
        document.getElementById('restart-after-timeout').addEventListener('click', () => {
            modal.remove();
            this.restartGame();
        });
        
        document.getElementById('menu-after-timeout').addEventListener('click', () => {
            modal.remove();
            this.returnToMenu();
        });
    },
    
    // 重新开始游戏
    restartGame() {
        // 重置时间系统
        this.reset();
        
        // 触发游戏重置
        if (window.MenuSystem && window.MenuSystem.resetGame) {
            window.MenuSystem.resetGame();
        }
    },
    
    // 返回主菜单
    returnToMenu() {
        // 重置时间系统
        this.reset();
        
        // 隐藏游戏界面
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('bottom-action-bar').style.display = 'none';
        
        // 显示主菜单
        document.getElementById('main-menu').style.display = 'flex';
    },
    
    // 重置时间系统
    reset() {
        this.stopTimer();
        this.gameStartTime = null;
        this.currentGameTime = null;
        GameState.gameTime = this.formatTime(this.startTime.hours, this.startTime.minutes);
        this.updateTimeDisplay();
    },
    
    // 设置时间显示
    setupTimeDisplay() {
        // 确保时间显示元素存在
        const gameTimeEl = document.getElementById('game-time');
        if (!gameTimeEl) {
            console.warn('时间显示元素未找到');
            return;
        }
        
        // 初始化显示
        this.updateTimeDisplay();
    },
    
    // 更新时间显示
    updateTimeDisplay() {
        const gameTimeEl = document.getElementById('game-time');
        if (gameTimeEl) {
            gameTimeEl.textContent = GameState.gameTime;
            
            // 添加时间紧迫感的视觉效果
            const elapsedRealTime = this.gameStartTime ? (Date.now() - this.gameStartTime) / (1000 * 60) : 0;
            const timeProgress = elapsedRealTime / this.totalGameMinutes;
            
            if (timeProgress > 0.8) {
                // 最后20%时间，红色警告
                gameTimeEl.style.color = 'var(--danger-color)';
                gameTimeEl.style.animation = 'pulse 1s infinite';
            } else if (timeProgress > 0.6) {
                // 60%-80%时间，橙色提醒
                gameTimeEl.style.color = 'var(--warning-color)';
                gameTimeEl.style.animation = 'none';
            } else {
                // 正常时间，默认颜色
                gameTimeEl.style.color = 'var(--text-color)';
                gameTimeEl.style.animation = 'none';
            }
        }
    },
    
    // 获取剩余时间（分钟）
    getRemainingRealTime() {
        if (!this.gameStartTime) return this.totalGameMinutes;
        
        const elapsedRealTime = (Date.now() - this.gameStartTime) / (1000 * 60);
        return Math.max(0, this.totalGameMinutes - elapsedRealTime);
    },
    
    // 获取当前游戏时间字符串
    getCurrentGameTimeString() {
        return GameState.gameTime;
    },
    
    // 为线索添加时间戳
    addTimeStampToClue(clue) {
        return {
            ...clue,
            acquiredTime: this.getCurrentGameTimeString(),
            realTime: new Date().toLocaleString()
        };
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);