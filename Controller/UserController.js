import User from "../Model/User.js";
import bcrypt from "bcrypt";
import HttpStatus from "../Helper/HttpStatus.js";
import mongoose from 'mongoose';
import RedisConnection from "../Helper/RedisConnection.js";
export default class UserController {
    static register(data) {
        let promise = new Promise((resolve, reject) => {
            User.findOne({ email: data.email }).then((doc) => {
                if (doc == undefined) {
                    let newUser = new User(data);
                    bcrypt.hash(newUser.password, 10).then((hashedPassword) => {
                        newUser.password = hashedPassword;
                        newUser.save()
                            .then((userAfterSave) => {
                                let httpStatusStaff = new HttpStatus(HttpStatus.OK, userAfterSave);
                                resolve(httpStatusStaff);
                            })
                            .catch((err) => {
                                reject(HttpStatus.getHttpStatus(err));
                            });
                    })
                        .catch((err) => {
                            reject(HttpStatus.getHttpStatus(err));
                        });
                } else {
                    let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                    rejectStatus.message = 'EMAIL IS EXIST';
                    reject(rejectStatus);
                }
            })
                .catch((err) => {
                    let rejectStatus = new HttpStatus(HttpStatus.SERVER_ERROR, null);
                    rejectStatus.message = err.message;
                    reject(rejectStatus);
                });
        });
        return promise;
    }
    static getUserById(userId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "groups",
                        localField: "_id",
                        foreignField: "userJoin",
                        as: "groupOfUser"
                    }
                },
                {
                    $unwind: {
                        path: '$groupOfUser',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "frames",
                        localField: "groupOfUser.topicId",
                        foreignField: "_id",
                        as: "topicOfGroup"
                    }
                },
                {
                    $unwind: {
                        path: '$topicOfGroup',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "groupOfUser.managerId",
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
                    $project: {
                        _id: 1,
                        groupCode: '$groupOfUser.groupCode',
                        userJoin: { $ifNull: ["$groupOfUser.userJoin", ""] },
                        topic: '$topicOfGroup.topic',
                        timeCreate: "$groupOfUser.timeCreate",
                        timeTeaching: { $ifNull: ["$groupOfUser.timeTeaching", ""] },
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
            )
            RedisConnection.getData(userId, process.env.GROUP_OF_USER).then((groupsOfUser) => {
                if (groupsOfUser != null) {
                    let httpStatus = new HttpStatus(HttpStatus.OK, groupsOfUser);
                    resolve(httpStatus);
                }
                else {
                    User.aggregate(pipeList).then((document) => {
                        RedisConnection.setData(userId, process.env.GROUP_OF_USER, document)
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
}