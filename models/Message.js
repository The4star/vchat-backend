const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    speaker: String,
    msg: String,
    cards: [],
    quickReplies: [],
    created: { type: Date, default: Date.now },
});

const Message = new mongoose.model('Message', MessageSchema);

module.exports = Message;