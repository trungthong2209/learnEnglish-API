import mongoose from 'mongoose';

let PrivateMessage = new mongoose.Schema({
    authorId: { type: mongoose.Schema.ObjectId },
    sendToId: { type: mongoose.Schema.ObjectId },
    message: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeSend: { type: Date },
    uniqueId: {type: Number}, 
});
PrivateMessage.index({'authorId': 1, 'timeSend': 1, 'timeCreate': 1})

export default mongoose.model('PrivateMessage', PrivateMessage)