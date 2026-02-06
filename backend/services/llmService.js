const { AzureChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage, ToolMessage, AIMessage } = require("@langchain/core/messages");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Helper to convert raw message objects to LangChain message instances
const convertMessages = (messages) => {
    return messages.map(msg => {
        if (msg.role === 'system') return new SystemMessage(msg.content);
        if (msg.role === 'user') return new HumanMessage(msg.content);
        if (msg.role === 'assistant') {
            if (msg.tool_calls) {
                // IF the message has tool_calls, we must convert them to LangChain's expected format
                // Our internal history stores them in OpenAI raw format: { id, type, function: { name, arguments } }
                // LangChain expects: { name, args, id }
                const aimsg = new AIMessage(msg.content || "");

                // Standard LangChain tool_calls
                aimsg.tool_calls = msg.tool_calls.map(tc => ({
                    name: tc.function.name,
                    args: JSON.parse(tc.function.arguments),
                    id: tc.id
                }));

                // Fix for Azure/OpenAI serialization issues:
                // Sometimes LangChain/Azure needs the raw tool_calls in additional_kwargs to form the request correctly
                aimsg.additional_kwargs = {
                    tool_calls: msg.tool_calls
                };

                return aimsg;
            }
            return new AIMessage(msg.content);
        }
        if (msg.role === 'tool') {
            return new ToolMessage({
                content: msg.content,
                tool_call_id: msg.tool_call_id
            });
        }
        return new HumanMessage(msg.content);
    });
};

const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureOpenAIApiDeploymentName: process.env.AZURE_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0.7,
});

const jsonModel = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureOpenAIApiDeploymentName: process.env.AZURE_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0.7,
    modelKwargs: { response_format: { type: "json_object" } }
});

const costService = require('./costService');

const llmService = {
    // Generic chat completion with optional JSON mode
    getCompletion: async (messages, modelName = 'gpt-4o', jsonMode = false, sessionId = null) => {
        try {
            const langchainMessages = convertMessages(messages);

            const targetModel = jsonMode ? jsonModel : model;

            const response = await targetModel.invoke(langchainMessages);

            // Calculate and Log Cost
            if (response.response_metadata && response.response_metadata.tokenUsage) {
                const { promptTokens, completionTokens } = response.response_metadata.tokenUsage;
                let costData = costService.calculateCost(modelName, promptTokens, completionTokens);

                // Accumulate if sessionId exists
                costData = costService.accumulateCost(sessionId, costData);

                costService.logCost({ ...costData, inputTokens: promptTokens, outputTokens: completionTokens });
            }

            return response.content;
        } catch (error) {
            console.error("LLM Error:", error);
            return "I'm having trouble connecting to my brain right now.";
        }
    },

    // Structured tool calling
    callTools: async (messages, tools, sessionId = null) => {
        try {
            const langchainMessages = convertMessages(messages);

            // Bind tools to the model
            const modelWithTools = model.bindTools(tools);

            const response = await modelWithTools.invoke(langchainMessages);

            // Calculate and Log Cost
            if (response.response_metadata && response.response_metadata.tokenUsage) {
                // Assuming 'gpt-4o' as default for the tool calling model instance defined above
                const modelName = 'gpt-4o';
                const { promptTokens, completionTokens } = response.response_metadata.tokenUsage;
                let costData = costService.calculateCost(modelName, promptTokens, completionTokens);

                // Accumulate if sessionId exists
                costData = costService.accumulateCost(sessionId, costData);

                costService.logCost({ ...costData, inputTokens: promptTokens, outputTokens: completionTokens });
            }

            // Convert LangChain AIMessage back to standard format expected by agents
            const result = {
                role: 'assistant',
                content: response.content
            };

            if (response.tool_calls && response.tool_calls.length > 0) {
                result.tool_calls = response.tool_calls.map(tc => ({
                    id: tc.id,
                    type: 'function',
                    function: {
                        name: tc.name,
                        arguments: JSON.stringify(tc.args) // LangChain parses args, OpenAI expects string
                    }
                }));
            }

            return result;

        } catch (error) {
            console.error("LLM Tool Error:", error);
            throw error;
        }
    },

    // RAG Helper
    getPolicyContext: async (query) => {
        try {
            // Lazy load ragService to avoid circular dep issues or init issues if called early
            const ragService = require('./ragService');
            const context = await ragService.retrieveDocuments(query || "general policy");
            return context;
        } catch (error) {
            console.error("Error reading policies:", error);
            return "";
        }
    }
};

module.exports = llmService;

