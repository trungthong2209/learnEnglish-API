import mongoose from 'mongoose';

let Rating = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId},
    userVote:  { type: mongoose.Schema.ObjectId},
    star: {type: Number},
    description: {type: String},
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
Rating.index({'userId': 1})
export default mongoose.model('Rating', Rating)