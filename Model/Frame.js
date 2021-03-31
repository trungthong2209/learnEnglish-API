import mongoose from 'mongoose';

let Frame = new mongoose.Schema({
    topic: { type: String, required: true },
    userCreate: { type: mongoose.Schema.ObjectId },
    description: { type: String},
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    action: { type: Boolean, default: true },
});
Frame.index({ '_id': 1, 'timeCreate': 1 })

export default mongoose.model('Frames', Frame)