import Quizz from "../Models/Quizz.js";
import HttpStatus from "../Helpers/HttpStatus.js";
import IsoDateHelper from "../Helpers/IsoDateHelper.js"
import RedisConnection from '../Helpers/RedisConnection.js'
export default class QuizzController {
    static insertQuizz(data) {
        let promise = new Promise((resolve, reject) => {
            let newQuizz = new Quizz(data);
            newQuizz.save()
                .then((document) => {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                    resolve(httpStatusStaff);
                })
                .catch((err) => {
                    console.log(err)
                    let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                    rejectStatus.message = 'SAVE QUIZZ FAIL';
                    reject(rejectStatus);
                });
        });
        return promise;
    }
    static updateQuizz(data) {
        let promise = new Promise((resolve, reject) => {
            data.timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh')
            Quizz.updateOne({ _id: data._id }, data).then((quizz) => {
                if (quizz.nModified == 1) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, quizz);
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