const nunjucks = require('nunjucks');
const path = require('path');

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, '../prompts'), {
    autoescape: false, // Prompts are text, not HTML
    noCache: true
});

const promptService = {
    render: (templateName, context = {}) => {
        try {
            // Default context with today's date
            const defaultContext = {
                today: new Date().toISOString().split('T')[0],
                ...context
            };

            // Ensure extension
            const fileName = templateName.endsWith('.j2') ? templateName : `${templateName}.j2`;
            return nunjucks.render(fileName, defaultContext);
        } catch (error) {
            console.error(`Error rendering prompt ${templateName}:`, error);
            return "";
        }
    }
};

module.exports = promptService;
