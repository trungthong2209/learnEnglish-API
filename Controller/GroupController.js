import Group from "../Model/Group.js";
import HttpStatus from "../Helper/HttpStatus.js";
import UploadFilesHelper from '../Helper/UploadFilesHelper.js'
import RedisConnection from "../Helper/RedisConnection.js";
import mongoose from 'mongoose';
export default class GroupController {
    static uploadFiles(req){
        let promise = new Promise((resolve, reject) => {
          let groupId = req.body.groupId;
          UploadFilesHelper.uploadFiles(req).then((data)=>{
            Group.findOne({_id: groupId}).then((group)=>{
                if(group != null){
                    group.updateOne({$push: {files: data.Location}}).then((httpStatusGroup)=>{
                        let httpStatus = new HttpStatus(HttpStatus.OK, httpStatusGroup);
                        resolve(httpStatus);
                    })
                    .catch((err) => {
                        reject(HttpStatus.getHttpStatus(err));
                    });
                }
                else {
                    let httpStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                        resolve(httpStatus);
                }
            })
            .catch((err) => {
                reject(HttpStatus.getHttpStatus(err));
            });
          })
          .catch((err) => {
            reject(HttpStatus.getHttpStatus(err));
        });
        });
        return promise;
    }
    static getGroupsByUserId(userId){
        let promise = new Promise((resolve, reject) => {
            Group.find({userJoin: userId}).then((document) => {
                let doc = []
                document.map((value)=>{
                    doc.push(value._id)
                })
                let httpStatus = new HttpStatus(HttpStatus.OK, doc);
                resolve(httpStatus);
            })
            .catch((err) => {
                reject(HttpStatus.getHttpStatus(err));
            });
        });
        return promise;
    }
    static insertGroup(data) {
        let promise = new Promise((resolve, reject) => {
            RedisConnection.getData(data.userCreate, process.env.INFO_USER).then(async (user) => {
                if (user.role == 'student') {
                    let reason = 'You don’t have permission to create group'
                    let httpStatus = new HttpStatus(HttpStatus.FORBIDDEN, reason);
                    resolve(httpStatus);
                }
                else {
                    let groupCode = this.randomCode();
                    let newGroup = new Group(data);
                    let imageURI = await UploadFilesHelper.convertImageToSave(data);
                    newGroup.groupCode = groupCode;
                    if(imageURI != null){
                        newGroup.image = imageURI.Location;
                    }
                    newGroup.save().then((document) => {
                        let httpStatus = new HttpStatus(HttpStatus.OK, document);
                        resolve(httpStatus);
                    })
                        .catch((err) => {
                            reject(HttpStatus.getHttpStatus(err));
                        });
                }
            })

        });
        return promise;
    }
    static getAllGroup() {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "managerId",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $unwind: {
                        path: '$manager',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "frames",
                        localField: "topicId",
                        foreignField: "_id",
                        as: "frames"
                    }
                },
                {
                    $unwind: {
                        path: '$frames',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        groupCode: 1,
                        image: 1,
                        userJoin: { $ifNull: ["$userJoin", ""] },
                        topicId: '$frames._id',
                        topicName: '$frames.topic',
                        timeCreate: 1,
                        videoLink: { $ifNull: ["$videoLink", ""] },
                        timeTeaching: { $ifNull: ["$timeTeaching", ""] },
                        manager: {
                            $ifNull: [{
                                managerName: '$manager.userName',
                                managerId: '$manager._id',
                                managerAvatar: '$manager.avatar',
                                managerEmail: '$manager.email'
                            }, ""]
                        },

                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userJoin",
                        foreignField: "_id",
                        as: "userJoinGroup"
                    }
                },
                {
                    $unwind: {
                        path: '$userJoinGroup',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        groupCode: { $first: "$groupCode" },
                        manager: { $first: "$manager" },
                        image: { $first: "$image" },
                        topicId: { $first: "$topicId" },
                        topicName: { $first: "$topicName" },
                        videoLink: { $first: "$videoLink" },
                        timeTeaching: { $first: "$timeTeaching" },
                        userJoinGroup: {
                            $push: {
                                userName: "$userJoinGroup.userName",
                                userId: "$userJoinGroup._id",
                                email: "$userJoinGroup.email",
                                avatar: "$userJoinGroup.avatar"
                            }
                        }
                    },
                }
            )
            Group.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
            .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }
    static getGroupById(groupId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(groupId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "managerId",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $unwind: {
                        path: '$manager',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "frames",
                        localField: "topicId",
                        foreignField: "_id",
                        as: "frames"
                    }
                },
                {
                    $unwind: {
                        path: '$frames',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        groupCode: 1,
                        image: 1,
                        userJoin: { $ifNull: ["$userJoin", ""] },
                        topicId: '$frames._id',
                        topicName: '$frames.topic',
                        timeCreate: 1,
                        videoLink: { $ifNull: ["$videoLink", ""] },
                        timeTeaching: { $ifNull: ["$timeTeaching", ""] },
                        manager: {
                            $ifNull: [{
                                managerName: '$manager.userName',
                                managerId: '$manager._id',
                                managerAvatar: '$manager.avatar',
                                managerEmail: '$manager.email'
                            }, ""]
                        },

                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userJoin",
                        foreignField: "_id",
                        as: "userJoinGroup"
                    }
                },
                {
                    $unwind: {
                        path: '$userJoinGroup',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        groupCode: { $first: "$groupCode" },
                        manager: { $first: "$manager" },
                        image: { $first: "$image" },
                        topicId: { $first: "$topicId" },
                        topicName: { $first: "$topicName" },
                        videoLink: { $first: "$videoLink" },
                        timeTeaching: { $first: "$timeTeaching" },
                        userJoinGroup: {
                            $push: {
                                userName: "$userJoinGroup.userName",
                                userId: "$userJoinGroup._id",
                                email: "$userJoinGroup.email",
                                avatar: "$userJoinGroup.avatar"
                            }
                        }
                    },
                }
            )
            Group.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }
    
    static randomCode() {
        let code = Date.now().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        if (code.length < 6) {
            code = Date.now().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        }
        return code
    }
}