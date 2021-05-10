import PrivateMessage from "../Models/PrivateMessage.js";
import HttpStatus from "../Helpers/HttpStatus.js";
import IsoDateHelper from "../Helpers/IsoDateHelper.js"
import UploadFileHelper from '../Helpers/UploadFilesHelper.js';
import mongoose from 'mongoose';
export default class PrivateMessageController {
    static insertPrivateMessage(authorId, sendToId, message) {
        let promise = new Promise(async (resolve, reject) => {
            let timeSend = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
            let data = { authorId, sendToId, message, timeSend }
            data.image = message;
            let imageURL = await UploadFileHelper.convertImageToSave(data)
            if (imageURL != null && imageURL.Location != null) {
                data.message = imageURL.Location;
            }
            let newPrivateMessage = new PrivateMessage(data);
            newPrivateMessage.uniqueId = authorId + sendToId
            newPrivateMessage.save()
                .then((document) => {
                    let httpStatus = new HttpStatus(HttpStatus.OK, document);
                    resolve(httpStatus);
                })
                .catch((err) => {
                    console.log(err)
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }
    static getPrivateMessage(authorId, recipientId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        $and:[
                            {$or:[
                            {uniqueId: authorId + recipientId},
                            {uniqueId: recipientId + authorId},
                        ]}
                    ]   
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "authorId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: {
                        path: '$author',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sendToId",
                        foreignField: "_id",
                        as: "recipient"
                    }
                },
                {
                    $unwind: {
                        path: '$recipient',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        author: {
                            $ifNull: [{
                                authorName: '$author.userName',
                                authorId: '$author._id',
                                authorAvatar: '$author.avatar',
                            }, ""]
                        },
                        recipient: {
                            $ifNull: [{
                                recipientName: '$recipient.userName',
                                recipientId: '$recipient._id',
                                recipientAvatar: '$recipient.avatar',
                            }, ""]
                        },
                        message: 1,
                        timeSend: 1,
                    }
                },
                {
                    $sort: {
                        timeCreate: -1
                    }
                }
            )
            //end pipeList
            PrivateMessage.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }
    static getAllMessages(authorId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        authorId: mongoose.Types.ObjectId(authorId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "authorId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                {
                    $unwind: {
                        path: '$author',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sendToId",
                        foreignField: "_id",
                        as: "recipient"
                    }
                },
                {
                    $unwind: {
                        path: '$recipient',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        uniqueId: 1,
                        recipient: {
                            $ifNull: [{
                                recipientName: '$recipient.userName',
                                recipientId: '$recipient._id',
                                recipientAvatar: '$recipient.avatar',
                            }, ""]
                        },
                        message: 1,
                        timeSend: 1,
                        timeCreate: 1,
                    }
                },
                {
                    $group: {
                        _id:{
                            uniqueId: "$uniqueId",
                        },
                            recipients:  { $first: "$recipient"} ,
                            timeCreate:  { $first: "$timeCreate"}
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        uniqueId : { $first: "$_id.uniqueId"},
                        recipients:  { $first: "$recipients"} ,
                        timeCreate:  { $first: "$timeCreate"}
                    }
                },
                {
                    $sort: {
                        timeCreate: -1
                    }
                },
            )
            PrivateMessage.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                });
        });
        return promise;
    }

}