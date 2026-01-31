const ragService = require('../services/ragService');

async function runInspection() {
    await ragService.inspectCollection();
}

runInspection();
