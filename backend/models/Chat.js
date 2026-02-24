const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['system', 'user', 'assistant', 'tool'] },
    content: { type: String }, // can be optional if tool_calls present
    tool_calls: { type: mongoose.Schema.Types.Mixed },
    tool_call_id: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    messages: [messageSchema],
    totalCost: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
