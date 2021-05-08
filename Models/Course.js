import mongoose from 'mongoose';

let Course = new mongoose.Schema({
    nameCouse: {type: String},
    description: {type: String},
    quizz : [{
        question: { type: String },
        D: { type: String},
        A: { type: String },
        B: { type: String},
        C: { type: String },
        correct: { type: String },
        Picture: { type: String },
        fileListen : {type: String},
    }],
    userCreate: { type: mongoose.Schema.ObjectId },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    highScore: {type: mongoose.Schema.ObjectId},
});
Course.index({'timeCreate': 1 })

export default mongoose.model('Course', Course)