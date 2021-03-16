import mongoose from 'mongoose';

let User = new mongoose.Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, lowercase: true, },
    sex: { type: String, enum: ['Nam', 'Nữ'] },
    dob: { type: Date },
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student'},
    action: { type: Boolean, default: true },
    numberPhone: { type: String },
    token: { type: String },
    avatar: { type: String },
    ratings: { type: mongoose.Schema.ObjectId, },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    address: { type: String },
    group: [{ type: mongoose.Schema.ObjectId, }],
    Certificate: { type: String },
});
User.index({ '_id': 1, 'Group': 1, 'timeCreate': 1 })

export default mongoose.model('User', User)