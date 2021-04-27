import User from "../Models/User.js";
import bcrypt from "bcrypt";
import HttpStatus from "../Helpers/HttpStatus.js";
import mongoose from 'mongoose';
import RedisConnection from "../Helpers/RedisConnection.js";
import UploadFileHelper from '../Helpers/UploadFilesHelper.js'
import IsoDateHelper from "../Helpers/IsoDateHelper.js"
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
    static updateUser(_id, data) {
        let promise = new Promise((resolve, reject) => {
            User.findOne({ _id: _id}).then( async (user) => {
                if (user != undefined) {
                    let updateUser = data;
                    let imageURI = await UploadFileHelper.convertImageToSave(data);
                    if(imageURI != null){
                        updateUser.avatar = imageURI.Location;
                    }
                    let timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
                    updateUser.timeUpdate = timeUpdate;
                    bcrypt.hash(data.password, 10).then((hashedPassword) => {
                        updateUser.password = hashedPassword;
                        user.updateOne(updateUser).then((modified) => {
                                if(modified.nModified==1){
                                    User.findOne({_id: _id}).then((newInfo)=>{
                                        RedisConnection.getData(_id, process.env.INFO_USER).then((oldInfo)=>{
                                            newInfo.token = oldInfo.token;
                                            newInfo.group = oldInfo.group;
                                            RedisConnection.setData(_id, process.env.INFO_USER, newInfo)
                                                let httpStatusStaff = new HttpStatus(HttpStatus.OK, newInfo);
                                                resolve(httpStatusStaff);
                                        })
                                        .catch((err) => {
                                            reject(HttpStatus.getHttpStatus(err));
                                        });
                                    })
                                    .catch((err) => {
                                        reject(HttpStatus.getHttpStatus(err));
                                    });
                                }
                                else {
                                    RedisConnection.getData(_id, process.env.INFO_USER).then((info)=>{
                                        let httpStatusStaff = new HttpStatus(HttpStatus.OK, info);
                                        resolve(httpStatusStaff);
                                    })
                                }
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
                    rejectStatus.message = 'USER IS NOT EXIST';
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
    static updateRole(data) {
        let promise = new Promise((resolve, reject) => {
            User.findOne({ _id: data._id }).then((user) => {
                if (user != undefined) {
                    let timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
                    data.timeUpdate = timeUpdate;
                    user.updateOne(data)
                            .then(() => {
                                RedisConnection.getData(data._id,process.env.INFO_USER).then((info)=>{
                                    info.role = data.role;
                                    RedisConnection.setData(data._id,process.env.INFO_USER,info)
                                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, info);
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
                    rejectStatus.message = 'USER IS NOT EXIST';
                    reject(rejectStatus);
                }
            }).catch((err) => {
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
                        userName: 1,
                        email: 1,
                        avatar: 1,
                        sex: 1,
                        _id: 1,
                        group: {
                                $ifNull: [{
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
                                }, ""]
                            
                        },
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        userName: { $first: "$userName" },
                        email: { $first: "$email" },
                        avatar: { $first: "$avatar" },
                        sex: { $first: "$sex" },
                        groups: {
                            $push: {
                                group: "$group",
                            }
                        }
                    },
                }
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