import mongoose from 'mongoose';

let PublicMessage = new mongoose.Schema({
    authorId: { type: mongoose.Schema.ObjectId },
    groupId: { type: mongoose.Schema.ObjectId },
    message: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
User.index({ 'groupId': 1, 'authorId': 1, 'timeCreate': 1 })

export default mongoose.model('PublicMessages', PublicMessage)