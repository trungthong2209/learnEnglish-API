import Group from "../Model/Group.js";
import HttpStatus from "../Helper/HttpStatus.js";
import UploadFIleHelper from '../Helper/UploadFIleHelper.js'
import RedisConnection from "../Helper/RedisConnection.js";
export default class GroupController {
    static insertGroup(data) {
        let promise = new Promise((resolve, reject) => {
            RedisConnection.getData(data.userCreate, process.env.INFO_USER).then((user) => {
                if (user.role == 'student') {
                    let reason = 'You don’t have permission to create group'
                    let httpStatus = new HttpStatus(HttpStatus.FORBIDDEN, reason);
                    resolve(httpStatus);
                }
                else {
                    let groupCode = this.randomCode();
                    let newGroup = new Group(data);
                    UploadFIleHelper.convertImageToSave(data).then((result) => {
                        console.log(result)
                    })
                        .catch((err) => { console.log(err) })
                    newGroup.groupCode = groupCode;
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
                        userJoin: { $ifNull: ["$userJoin", ""] },
                        topicId: '$frames.topic',
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
                        topic: { $first: "$topicId" },
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