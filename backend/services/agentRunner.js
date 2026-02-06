const llmService = require('./llmService');

const run = async (messages, tools, toolImplementations, systemPrompt, sessionId = null) => {
    const agentMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    console.log("-> Agent processing...");

    // 1. Ask LLM (with tools enabled)
    const response = await llmService.callTools(agentMessages, tools, sessionId);

    // 2. Check if LLM wants to use tools
    if (response.tool_calls && response.tool_calls.length > 0) {
        // Add the assistant's request (with all tool calls) to history ONCE
        agentMessages.push(response);

        // Execute all tools in parallel (or sequential, but we need to gather all results)
        for (const toolCall of response.tool_calls) {
            const fnName = toolCall.function.name;
            const fnImpl = toolImplementations[fnName];

            if (fnImpl) {
                console.log(`-> Agent calling tool: ${fnName}`);

                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    const toolResult = await fnImpl(args);

                    // Add tool result to history
                    agentMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });

                } catch (error) {
                    console.error(`Error executing tool ${fnName}:`, error);
                    agentMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ error: "Error executing tool" })
                    });
                }
            } else {
                console.warn(`Tool ${fnName} not found in implementations.`);
                agentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ error: "Tool function not found" })
                });
            }
        }

        // 3. Get final response based on ALL tool outputs
        const finalResponse = await llmService.getCompletion(agentMessages, 'gpt-4o', false, sessionId);
        return finalResponse;
    }

    // No tool called, just return the text
    return response.content;
};

module.exports = { run };
