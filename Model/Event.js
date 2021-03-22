import mongoose from 'mongoose';

let Event = new mongoose.Schema({
    userCreate: { type: mongoose.Schema.ObjectId },
    timeEvent: { type: Date},
    description: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
Event.index({ 'userCreate': 1, 'timeCreate': 1 })

export default mongoose.model('Event', Event)