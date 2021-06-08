import User from "../Models/User.js";
import bcrypt from "bcrypt";
import HttpStatus from "../Helpers/HttpStatus.js";
import mongoose from 'mongoose';
import RedisConnection from "../Helpers/RedisConnection.js";
import UploadFileHelper from '../Helpers/UploadFilesHelper.js'
import IsoDateHelper from "../Helpers/IsoDateHelper.js"
import SendEmail from "../Helpers/SendEmail.js"
import jwt from "jsonwebtoken";
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
                                 const payload = {
                                       _id: userAfterSave._id
                                 }
                                 jwt.sign(
                                    payload,
                                    process.env.AUTH1_APP_SECRET,
                                    (err, token) => {
                                        SendEmail.sendEmailService(data.email, "Xác thực tài khoản",  
                                        `
                                        <h2> Hello ${userAfterSave.userName} </h2>
                                        <h2> Click on link to verify your account </h2>
                                        <p> http://3.131.71.201:3001/verify/v1/${token} </p>
                                       `);
                                    }
                                 )
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
static verifyUser(token){
    let promise = new Promise((resolve, reject) => {
        jwt.verify(token, process.env.AUTH1_APP_SECRET, (err, decoded) => {
            if (err) {
                let rejectStatus = new HttpStatus(HttpStatus.NOT_ACCEPTABLE, null);
                rejectStatus.message = err.message;
                reject(rejectStatus);
            }
            else {
                if (decoded._id) {
                    User.findOne({ _id: decoded._id }).then((user) => {
                        user.updateOne({action: true}).then(() => {
                            let httpStatusStaff = new HttpStatus(HttpStatus.OK, "Verify succesfully");
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
                    let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                    rejectStatus.message = 'NOT AUTHORIZATE';
                    reject(rejectStatus);
                }
            }
        })
    })
    return promise
}
    static updateUser(_id, data) {
        let promise = new Promise((resolve, reject) => {
            User.findOne({ _id: _id }).then(async (user) => {
                if (user != undefined) {
                    let updateUser = data;
                    let imageURI = await UploadFileHelper.convertImageToSave(data);
                    if (imageURI != null) {
                        updateUser.avatar = imageURI.Location;
                    }
                    if (data.certificates != null) {
                        let uriCertificates = await UploadFileHelper.uploadCertificates(data);
                        if (updateUser.certificates != null) {
                            updateUser.certificates.push(uriCertificates.Location);
                        }
                        else {
                            updateUser.certificates = uriCertificates.Location;
                        }

                    }
                    let timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
                    updateUser.timeUpdate = timeUpdate;
                    bcrypt.hash(data.password, 10).then((hashedPassword) => {
                        updateUser.password = hashedPassword;
                        user.updateOne(updateUser).then((modified) => {
                            if (modified.nModified == 1) {
                                User.findOne({ _id: _id }).then((newInfo) => {
                                    RedisConnection.getData(_id, process.env.INFO_USER).then((oldInfo) => {
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
                                RedisConnection.getData(_id, process.env.INFO_USER).then((info) => {
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
                    let arrTopics = [];
                    if (user.topics != null) {
                        arrTopics = user.topics;
                        if (user.topics.indexOf(data.topics) == -1) {
                            arrTopics.push(data.topics);
                        }
                    }
                    else {
                        arrTopics = data.topics;
                    }
                    data.topics = arrTopics;
                    user.updateOne(data)
                        .then(() => {
                            console.log(user)
                            RedisConnection.getData(data._id, process.env.INFO_USER).then((info) => {
                                info.role = data.role;
                                info.topics = arrTopics;
                                RedisConnection.setData(data._id, process.env.INFO_USER, info)
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
    static blockedUser(data, admin) {
        let promise = new Promise(async (resolve, reject) => {
            let checkAdmin = await RedisConnection.getData(admin, process.env.INFO_USER);
            if (checkAdmin.role == "admin") {
                User.findOne({ _id: data._id }).then((user) => {
                    if (user != undefined) {
                        let timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
                        data.timeUpdate = timeUpdate;
                        user.updateOne({ action: data.status })
                            .then((results) => {
                                if (data.status == false) {
                                    RedisConnection.deleteHash(data._id)
                                }
                                let httpStatusStaff = new HttpStatus(HttpStatus.OK, results);
                                resolve(httpStatusStaff);


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
            }
            else {
                let httpStatus = new HttpStatus(HttpStatus.FORBIDDEN, null);
                resolve(httpStatus);
            }
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
                        facebookLink: 1,
                        instagramLink: 1,
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
                        facebookLink: { $first: "$facebookLink" },
                        instagramLink: { $first: "$instagramLink" },
                        groups: {
                            $push: {
                                group: "$group",
                            }
                        }
                    },
                }
            )
            User.aggregate(pipeList).then((document) => {
                RedisConnection.setData(userId, process.env.GROUP_OF_USER, document)
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }
    static getListUser(_id) {
        let promise = new Promise(async (resolve, reject) => {
            let checkAdmin = await RedisConnection.getData(_id, process.env.INFO_USER);
            if (checkAdmin.role == "admin") {
                User.find({}).then((users) => {
                    if (users != undefined) {
                        let httpStatus = new HttpStatus(HttpStatus.OK, users);
                        resolve(httpStatus);
                    }
                    else {
                        let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                        rejectStatus.message = 'NOT_FOUND';
                        reject(rejectStatus);
                    }
                })
                    .catch((err) => {
                        let rejectStatus = new HttpStatus(HttpStatus.SERVER_ERROR, null);
                        rejectStatus.message = err.message;
                        reject(rejectStatus);
                    });
            }
            else {
                let httpStatus = new HttpStatus(HttpStatus.FORBIDDEN, null);
                resolve(httpStatus);
            }

        });
        return promise;
    }
}