import mongoose from 'mongoose';

let PublicMessage = new mongoose.Schema({
    authorId: { type: mongoose.Schema.ObjectId },
    groupId: { type: mongoose.Schema.ObjectId },
    message: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeSend: { type: Date },
});
PublicMessage.index({ 'groupId': 1, 'timeSend': 1, 'timeCreate': 1 })

export default mongoose.model('PublicMessages', PublicMessage)