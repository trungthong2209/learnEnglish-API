import mongoose from 'mongoose';

let CourseOfUser = new mongoose.Schema({
    courseVocabularyId: {type: mongoose.Schema.ObjectId},
    userId: {type: String},
    quizz : [{type: mongoose.Schema.ObjectId}],
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    highScore: {type: Number},
});
CourseOfUser.index({'userId': 1 })

export default mongoose.model('CourseOfUser', CourseOfUser)