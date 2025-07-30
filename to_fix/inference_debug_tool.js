// 推理系统调试工具
window.inferenceDebug = {
    // 显示所有推理规则
    showRules() {
        console.log('=== 所有推理规则 ===');
        Object.entries(InferenceRules).forEach(([clueId, rule]) => {
            console.log(`\n${clueId}:`);
            console.log('组合:', rule.combinations || rule.prerequisites);
            console.log('描述:', rule.description);
        });
    },
    
    // 显示已获得的线索
    showAcquiredClues() {
        console.log('=== 已获得的线索 ===');
        console.log('线索ID列表:', GameState.acquiredClues.map(c => c.id));
        console.log('线索详情:');
        GameState.acquiredClues.forEach(clue => {
            console.log(`- ${clue.id}: ${clue.name} [${clue.type}]`);
        });
    },
    
    // 测试特定的组合
    testCombination(clueIds) {
        console.log('=== 测试组合 ===');
        console.log('测试线索:', clueIds);
        
        // 模拟选择
        InferenceUI.selectedClues = new Set(clueIds);
        InferenceUI.performInference();
    },
    
    // 检查特定推理线索的状态
    checkInferenceClue(clueId) {
        console.log(`=== 检查推理线索: ${clueId} ===`);
        
        const rule = InferenceRules[clueId];
        if (!rule) {
            console.log('规则不存在');
            return;
        }
        
        console.log('规则配置:', rule);
        console.log('是否已获得:', GameState.acquiredClues.some(c => c.id === clueId));
        
        if (rule.combinations) {
            rule.combinations.forEach((combo, index) => {
                console.log(`\n组合 ${index + 1}:`, combo);
                combo.forEach(reqClueId => {
                    const hasClue = GameState.acquiredClues.some(c => c.id === reqClueId);
                    console.log(`  - ${reqClueId}: ${hasClue ? '✓ 已获得' : '✗ 未获得'}`);
                });
            });
        }
    },
    
    // 强制添加测试线索
    addTestClues() {
        const testClues = [
            'clue_poison_bottle',
            'clue_chen_garden',
            'clue_maid_strange_smell',
            'clue_cellar_key',
            'clue_chen_cellar'
        ];
        
        testClues.forEach(clueId => {
            if (!GameState.acquiredClues.some(c => c.id === clueId)) {
                const clueData = ClueData[clueId];
                if (clueData) {
                    GameState.acquiredClues.push({
                        id: clueId,
                        ...clueData
                    });
                }
            }
        });
        
        console.log('已添加测试线索');
        this.showAcquiredClues();
    }
};

console.log('推理调试工具已加载！');
console.log('使用方法:');
console.log('- inferenceDebug.showRules() - 显示所有推理规则');
console.log('- inferenceDebug.showAcquiredClues() - 显示已获得的线索');
console.log('- inferenceDebug.testCombination(["clue_id1", "clue_id2"]) - 测试特定组合');
console.log('- inferenceDebug.checkInferenceClue("clue_id") - 检查特定推理线索');
console.log('- inferenceDebug.addTestClues() - 添加测试线索');