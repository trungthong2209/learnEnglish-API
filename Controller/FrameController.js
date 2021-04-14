import Frame from "../Model/Frame.js";
import HttpStatus from "../Helper/HttpStatus.js";
import IsoDateHelper from "../Helper/IsoDateHelper.js"
import RedisConnection from '../Helper/RedisConnection.js'
export default class FrameController {
    static getAllFrame() {
        let promise = new Promise((resolve, reject) => {
            Frame.find({}).then((allFrame) => {
                if (allFrame != undefined) {
                    let httpStatus = new HttpStatus(HttpStatus.OK, allFrame);
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
        });
        return promise;
    }
    static insertFrame(data) {
        let promise = new Promise((resolve, reject) => {
            let newFrame = new Frame(data);
            newFrame.save()
                .then((document) => {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                    resolve(httpStatusStaff);
                })
                .catch((err) => {
                    console.log(err)
                    let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                    rejectStatus.message = 'SAVE FRAME FAIL';
                    reject(rejectStatus);
                });
        });
        return promise;
    }
    static updateFrame(data) {
        let promise = new Promise((resolve, reject) => {
            data.timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh')
            Frame.updateOne({ _id: data._id }, data).then((frame) => {
                if (frame.nModified == 1) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, frame);
                    resolve(httpStatusStaff);
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
        });
        return promise;
    }
    static getByIdFrame(id) {
        let promise = new Promise((resolve, reject) => {
            Frame.find({ _id: id }).then((frame) => {
                if (frame[0] != undefined) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, frame);
                    resolve(httpStatusStaff);
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
        });
        return promise;
    }
    static deleteFrame(id) {
        let promise = new Promise((resolve, reject) => {
            Frame.deleteOne({ _id: id }).then((frame) => {
                if (frame.deletedCount == 1) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, frame);
                    httpStatusStaff.message = "DELETED"
                    resolve(httpStatusStaff);
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
        });
        return promise;
    }
}