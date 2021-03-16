import mongoose from 'mongoose';

let Quizz = new mongoose.Schema({
    question: { type: String },
    answerCorrectly: { type: String},
    answerWrong1: { type: String },
    answerWrong2: { type: String},
    answerWrong3: { type: String },
    userCreate: { type: mongoose.Schema.ObjectId },
    Picture: { type: String },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    groupId: { type: mongoose.Schema.ObjectId},
});
User.index({ 'groupId': 1, 'timeCreate': 1 })

export default mongoose.model('Quizz', Quizz)