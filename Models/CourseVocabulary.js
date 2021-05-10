import mongoose from 'mongoose';

let CourseVocabulary = new mongoose.Schema({
    nameCouse: {type: String},
    description: {type: String},
    vocabularys : [{
        vocabulary: { type: String },
        type: { type: String},
        pronounce: { type: String },
        means: { type: String},
        Picture: { type: String },
        fileListen : {type: String},
    }],
    userCreate: { type: mongoose.Schema.ObjectId },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    highScore: {type: mongoose.Schema.ObjectId},
});
CourseVocabulary.index({'timeCreate': 1 })

export default mongoose.model('CourseVocabulary', CourseVocabulary)