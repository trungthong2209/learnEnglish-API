import mongoose from 'mongoose';

let Course = new mongoose.Schema({
    nameCouse: {type: String},
    description: {type: String},
    userCreate: { type: mongoose.Schema.ObjectId },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
Course.index({'timeCreate': 1 })

export default mongoose.model('Course', Course)