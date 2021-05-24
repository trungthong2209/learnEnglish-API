import mongoose from 'mongoose';

let CourseVocabulary = new mongoose.Schema({
    courseId: {type: String},
    vocabularys : [{
        vocabulary: { type: String },
        type: { type: String},
        pronounce: { type: String },
        means: { type: String},
        picture: { type: String },
        fileListen : {type: String},
    }],
    userCreate: { type: mongoose.Schema.ObjectId },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
CourseVocabulary.index({'timeCreate': 1 })

export default mongoose.model('CourseVocabulary', CourseVocabulary)