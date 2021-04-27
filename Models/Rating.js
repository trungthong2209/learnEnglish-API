import mongoose from 'mongoose';

let Rating = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId},
    assess: [{
        star: {type: Number},
        description: {type: String}
    }],
});
Rating.index({'userId': 1})
export default mongoose.model('Rating', Rating)