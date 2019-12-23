const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ChatHistorySchema = new Schema({
    _id: String,
    sessions: Number,
    messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
    created: { type: Date, default: Date.now },
});

const ChatHistory = new mongoose.model('ChatHistory', ChatHistorySchema);


module.exports = ChatHistory;