import Course from "../Models/Course.js";
import HttpStatus from "../Helpers/HttpStatus.js";
import IsoDateHelper from "../Helpers/IsoDateHelper.js";
import UploadFilesHelper from '../Helpers/UploadFilesHelper.js';
import RedisConnection from '../Helpers/RedisConnection.js';
export default class QuizzController {
    static insertCourse(req, res, user) {
        let promise = new Promise((resolve, reject) => {
            let newCourse = new Course();
            newCourse.nameCouse = req.body.nameCouse;
            newCourse.description = req.body.description;
            newCourse.userCreate = user._id;
            RedisConnection.getData(user._id, process.env.INFO_USER).then((isUser)=>{
                if(isUser.role == "student"){
                    let httpStatusStaff = new HttpStatus(HttpStatus.FORBIDDEN, null);
                    resolve(httpStatusStaff);
                }
                else {
                    UploadFilesHelper.uploadFilesExcel(req, res).then((data) => {
                        if(data != null)
                        {
                            newCourse.quizz = data;
                            newCourse.save()
                                .then((document) => {
                                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                                    resolve(httpStatusStaff);
                                })
                                .catch((err) => {
                                    let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, null);
                                    rejectStatus.message = err;
                                    reject(rejectStatus);
                                });
                        }
                        else {
                            let message = 'Invalid file, pls check file again';
                            let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, message);
                            reject(rejectStatus);
                        }
                    })
                }
            })
        });
        return promise;
    }
    // static updateCourse(data) {
    //     let promise = new Promise((resolve, reject) => {
    //         data.timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh')
    //         Quizz.updateOne({ _id: data._id }, data).then((quizz) => {
    //             if (quizz.nModified == 1) {
    //                 let httpStatusStaff = new HttpStatus(HttpStatus.OK, quizz);
    //                 resolve(httpStatusStaff);
    //             }
    //             else {
    //                 let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
    //                 rejectStatus.message = 'NOT_FOUND';
    //                 reject(rejectStatus);
    //             }
    //         })
    //             .catch((err) => {
    //                 let rejectStatus = new HttpStatus(HttpStatus.SERVER_ERROR, null);
    //                 rejectStatus.message = err.message;
    //                 reject(rejectStatus);
    //             });
    //     });
    //     return promise;
    // }
    static getAllCourse() {
        let promise = new Promise((resolve, reject) => {
            Course.find({}).then((courses) => {
                if (courses != undefined) {
                    let httpStatus = new HttpStatus(HttpStatus.OK, courses);
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
    static getCourseById(id) {
        let promise = new Promise((resolve, reject) => {
            Course.find({ _id: id }).then((course) => {
                if (course[0] != undefined) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, course);
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
    static deleteCourse(id) {
        let promise = new Promise((resolve, reject) => {
            Course.deleteOne({ _id: id }).then((courseDel) => {
                if (courseDel.deletedCount == 1) {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, courseDel);
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