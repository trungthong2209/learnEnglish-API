import mongoose from 'mongoose';

let Group = new mongoose.Schema({
    userJoin: [{ type: mongoose.Schema.ObjectId}],
    managerId: { type: mongoose.Schema.ObjectId },
    topicId: { type: mongoose.Schema.ObjectId },
    groupCode: { type: Number},
    timeTeaching: { type: Date },
    videoLink: [{ type: String }],
    action: { type: Boolean, default: true },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
});
Group.index({ 'managerId': 1, 'groupCode': 1, 'timeCreate': 1 })

export default mongoose.model('Group', Group)