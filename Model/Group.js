import mongoose from 'mongoose';

let Group = new mongoose.Schema({
    userJoin: [{ type: mongoose.Schema.ObjectId}],
    managerId: { type: mongoose.Schema.ObjectId },
    topicId: { type: mongoose.Schema.ObjectId },
    groupCode: { type: String},
    image: {type: String},
    timeTeaching: { type: String },
    videoLink: [{ type: String }],
    files : [{type: String}],
    action: { type: Boolean, default: true },
    timeCreate: { type: Number, default: Date.now },
    timeUpdate: { type: Date },
    userCreate: {type: mongoose.Schema.ObjectId}
});
Group.index({'managerId': 1, 'groupCode': 1, 'timeCreate': 1})

export default mongoose.model('Group', Group)