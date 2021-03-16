import mongoose from 'mongoose';

let PriveMessage = new mongoose.Schema({
    authorId: { type: mongoose.Schema.ObjectId },
    sendToId: { type: mongoose.Schema.ObjectId },
    message: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
User.index({ 'authorId': 1, 'sendToId': 1, 'timeCreate': 1 })

export default mongoose.model('PriveMessage', PriveMessage)