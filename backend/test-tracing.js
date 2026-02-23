require('dotenv').config();
const { sdk } = require("./instrumentation");
// user requested @langfuse/tracing but checking if that exists might be tricky if not in package.json. 
// attempting to require it. If it fails, it fails.
let startActiveObservation;
try {
    const tracing = require("@langfuse/tracing");
    startActiveObservation = tracing.startActiveObservation;
} catch (e) {
    console.warn("Could not load @langfuse/tracing, trying 'langfuse'...");
    try {
        const langfuse = require("langfuse");
        startActiveObservation = langfuse.startActiveObservation;
    } catch (e2) {
        console.error("Failed to load startActiveObservation from @langfuse/tracing or langfuse");
        process.exit(1);
    }
}

async function main() {
    if (!startActiveObservation) {
        console.error("startActiveObservation is not defined");
        return;
    }

    await startActiveObservation("my-first-trace", async (span) => {
        span.update({
            input: "Hello, Langfuse!",
            output: "This is my first trace!",
        });
    });
}

// Shutdown flushes events and is required for short-lived applications
main().finally(() => sdk.shutdown());
