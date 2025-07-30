# UI标准文档

本文档记录游戏中各种UI元素的标准实现，确保所有同类元素遵循统一的样式和行为。

## 1. 按钮标准

### 1.1 主要操作按钮 (main-action-btn)

**位置**: `index.html` 底部操作栏
**类名**: `.main-action-btn`
**样式特点**:
- 像素风格边框效果
- 3D按压效果
- 悬停时的变换和阴影
- 统一的字体和颜色

**CSS实现**:
```css
.main-action-btn {
    background-color: var(--secondary-bg-color);
    color: var(--text-color);
    border: 2px solid var(--border-color);
    padding: 10px 15px;
    cursor: pointer;
    font-family: var(--font-family);
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
```

### 1.2 分类筛选按钮 (category-tab)

**位置**: `InferenceUI.js` 推理界面
**类名**: `.category-tab`
**样式特点**:
- 紧密排列，共享边框
- 第一个和最后一个按钮有圆角
- 激活状态有特殊样式
- 悬停效果

**CSS实现**:
```css
.category-tab {
    padding: 12px 20px;
    border: 2px solid var(--border-color);
    background: var(--secondary-bg-color);
    color: var(--text-color);
    border-radius: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: bold;
    min-width: 80px;
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

.clue-categories {
    display: flex;
    gap: 0;
}

.category-tab:not(:last-child) {
    border-right: none;
}

.category-tab:first-child {
    border-radius: 5px 0 0 5px;
}

.category-tab:last-child {
    border-radius: 0 5px 5px 0;
}
```

### 1.3 模态框关闭按钮 (modal-close-btn)

**位置**: 所有模态框右上角
**类名**: `.modal-close-btn`
**样式特点**:
- 固定尺寸 32x32px
- 红色背景
- 绝对定位在右上角
- 像素风格边框和3D效果

**CSS实现**:
```css
.modal-close-btn {
    width: 32px;
    height: 32px;
    background-color: var(--danger-color);
    color: var(--text-highlight);
    font-family: var(--font-family);
    font-size: 24px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    border: none;
    box-shadow: 
        0 0 0 2px var(--border-accent), 
        0 3px 0 var(--accent-dark), 
        0 5px 0 rgba(0, 0, 0, 0.5), 
        inset 0 2px 0 var(--accent-glow), 
        inset 0 -2px 0 var(--accent-dark);
}

.modal-close-btn:hover {
    background-color: #a00000;
    transform: translate(-1px, -1px);
    box-shadow: 
        0 0 0 2px var(--border-accent), 
        0 4px 0 var(--accent-dark), 
        0 6px 0 rgba(0, 0, 0, 0.5), 
        inset 0 2px 0 var(--accent-glow), 
        inset 0 -2px 0 var(--accent-dark);
}

.modal-close-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 
        0 0 0 2px var(--border-accent), 
        0 1px 0 var(--accent-dark), 
        0 2px 0 rgba(0, 0, 0, 0.5), 
        inset 0 -2px 0 var(--accent-dark), 
        inset 0 2px 0 var(--accent-glow);
}
```

## 2. 头像标准

### 2.1 NPC头像 (npc-avatar)

**位置**: 底部操作栏NPC区域
**类名**: `.npc-avatar`
**样式特点**:
- 固定尺寸 60x60px
- 圆形边框
- 阴影效果
- 悬停缩放效果

**CSS实现**:
```css
.npc-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid var(--accent-color);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    object-fit: cover;
}

.npc-avatar:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    border-color: var(--accent-hover);
}
```

### 2.2 对话头像 (dialogue-avatar)

**位置**: 对话模态框中
**类名**: `.dialogue-avatar`
**样式特点**:
- 较大尺寸用于对话显示
- 圆形设计
- 边框和阴影

### 2.3 指认系统头像 (speaker-avatar)

**位置**: `AccusationSystem.js` 指认界面
**类名**: `.speaker-avatar`
**样式特点**:
- 固定尺寸 60x60px
- 圆形边框
- 适用于指认对话场景

**CSS实现**:
```css
.speaker-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid var(--accent-color);
    object-fit: cover;
    flex-shrink: 0;
}
```

## 3. 物品图标标准

### 3.1 线索图标 (clue-icon)

**位置**: 线索系统、推理系统
**样式特点**:
- 根据线索类型显示不同图标
- 统一的尺寸和边框
- 支持图片和占位符

**实现逻辑**:
```javascript
// 物证类线索：显示实际图片
if (clue.type === 'evidence' && clue.img) {
    iconDiv.innerHTML = `<img src="${clue.img}" alt="${clue.name}">`;
}
// 证词类线索：使用统一图标
else if (clue.type === 'testimony') {
    iconDiv.innerHTML = `<img src="${InferenceSystemConfig.testimonyIcon}" alt="${clue.name}">`;
}
// 推理类线索：使用统一图标
else if (clue.type === 'inference') {
    iconDiv.innerHTML = `<img src="${InferenceSystemConfig.inferenceIcon}" alt="${clue.name}">`;
}
// 其他类型：使用默认占位符
else {
    iconDiv.innerHTML = `<div class="clue-type-icon">📋</div>`;
}
```

### 3.2 推理界面线索图标 (clue-icon-square)

**位置**: `InferenceUI.js`
**类名**: `.clue-icon-square`
**样式特点**:
- 正方形容器 70x70px
- 居中对齐
- 适用于推理界面的线索展示

**CSS实现**:
```css
.clue-icon-square {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
}

.clue-icon-square img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
}
```

### 3.3 槽位中的线索图标 (slot-clue-icon)

**位置**: 推理界面的选择槽位
**类名**: `.slot-clue-icon`
**样式特点**:
- 较小尺寸 60x60px
- 适用于槽位显示

**CSS实现**:
```css
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
```

## 4. 统一性检查清单

### 4.1 按钮检查项
- [ ] 所有主要操作按钮使用 `.main-action-btn` 样式
- [ ] 所有分类筛选按钮使用 `.category-tab` 样式
- [ ] 所有模态框关闭按钮使用 `.modal-close-btn` 样式
- [ ] 按钮悬停和点击效果一致

### 4.2 头像检查项
- [ ] 所有NPC头像使用统一尺寸 60x60px
- [ ] 所有头像使用圆形边框
- [ ] 头像悬停效果一致
- [ ] 对话系统中的头像样式统一

### 4.3 图标检查项
- [ ] 线索图标根据类型使用统一的图标或占位符
- [ ] 物证类线索显示实际图片
- [ ] 证词类线索使用统一的证词图标
- [ ] 推理类线索使用统一的推理图标
- [ ] 图标尺寸在不同界面中保持一致

### 4.4 颜色和字体检查项
- [ ] 所有UI元素使用CSS变量定义的颜色
- [ ] 字体使用 `var(--font-family)` 统一字体
- [ ] 边框颜色使用 `var(--border-color)` 等变量
- [ ] 强调色使用 `var(--accent-color)` 变量

## 5. 已修复的不一致问题

通过代码分析和修复，以下问题已经得到解决：

1. **✅ 分类按钮样式已统一**：
   - 已将 `index.html` 中的 `.category-btn` 样式统一为 `.category-tab`
   - 已更新 `ClueSystem.js` 中的事件监听器引用
   - 现在所有分类按钮都使用统一的 `.category-tab` 样式

2. **✅ 线索图标显示逻辑已统一**：
   - 已更新 `ClueSystem.js` 中的 `createClueCard` 方法
   - 现在与 `InferenceUI.js` 使用相同的图标配置逻辑
   - 统一使用 `InferenceSystemConfig` 中定义的图标

3. **✅ 头像尺寸已统一**：
   - 已将所有头像尺寸统一为 60x60px 标准
   - 修复的文件包括：`main.css`、`index.html.backup`、`accusation_ui_updated`
   - 所有系统中的头像现在都使用统一尺寸
   - `AccusationSystem.js`: suspect-avatar 从 80x80px 改为 60x60px

4. **✅ 关闭按钮样式已统一**：
   - 所有模态框都使用统一的 `.modal-close-btn` 样式
   - 32x32px 尺寸，红色背景，统一的3D效果和交互反馈

5. **✅ 指认界面按钮样式已统一**：
   - 已将 `AccusationSystem.js` 中的 `action-btn` 样式改为统一的3D像素风格
   - 移除了渐变背景，使用CSS变量和统一的阴影效果
   - 保留了特殊按钮的颜色变体（附加证据、结束对决）

## 6. 最终UI标准总结

**按钮标准**：
- 主要操作按钮：使用统一的3D效果、悬停动画和点击反馈
- 分类筛选按钮：统一使用 `category-tab` 类，圆角设计，激活状态突出显示
- 模态框关闭按钮：32x32px，红色背景，统一的阴影和交互效果

**头像标准**：
- 统一尺寸：60x60px
- NPC头像：圆形边框，3px边框宽度
- 对话头像：圆形设计，适用于对话和指认系统
- 统一的悬停效果和过渡动画

**物品图标标准**：
- 线索图标：根据类型显示不同图标（证据、证词、推理）
- 统一的图标配置系统
- 支持图片和占位符的混合显示
- 在不同界面中保持一致的尺寸和样式