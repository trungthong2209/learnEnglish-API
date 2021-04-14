import PublicMessage from "../Model/PublicMessage.js";
import HttpStatus from "../Helper/HttpStatus.js";
import IsoDateHelper from "../Helper/IsoDateHelper.js"
import mongoose from 'mongoose';
export default class PublicMessageController{
    static insertPublicMessage(authorId, groupId, message){
        let promise = new Promise((resolve, reject) => {
            let timeSend = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
            let data = { authorId, groupId, message, timeSend}
            let newPublicMessage = new PublicMessage(data);
            newPublicMessage.save()
            .then((document) => {
                let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatusStaff);
            })
            .catch((err) => {
                console.log(err)
                let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                rejectStatus.message = 'SAVE PUBLIC MESSAGE FAIL';
                reject(rejectStatus);
            });
        });
        return promise;
    }
    static getPublicMessage(authorId, groupId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        groupId: mongoose.Types.ObjectId(groupId)
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
                    $project: {
                        _id: 1,
                        author: {
                            $ifNull: [{
                                authorName: '$author.userName',
                                authorId: '$author._id',
                                authorAvatar: '$author.avatar',
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
            PublicMessage.aggregate(pipeList).then((document) => {
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