import CourseQuestion from "../Models/CourseQuestion.js";
import Course from "../Models/Course.js";
import HttpStatus from "../Helpers/HttpStatus.js";
import IsoDateHelper from "../Helpers/IsoDateHelper.js";
import UploadFilesHelper from '../Helpers/UploadFilesHelper.js';
import RedisConnection from '../Helpers/RedisConnection.js';
import CourseVocabulary from "../Models/CourseVocabulary.js";
import CourseOfUser from "../Models/CourseOfUser.js";
import mongoose from 'mongoose';

export default class QuizzController {
    static createCourse(data, userId) {
        let promise = new Promise((resolve, reject) => {
            let newCourse = new Course();
            newCourse.nameCouse = data.nameCouse;
            newCourse.description = data.description;
            newCourse.userCreate = userId;
            RedisConnection.getData(userId, process.env.INFO_USER).then((isUser) => {
                if (isUser.role == "student" || isUser.role == "teacher") {
                    let httpStatusStaff = new HttpStatus(HttpStatus.FORBIDDEN, null);
                    resolve(httpStatusStaff);
                }
                else {
                    newCourse.save()
                        .then((course) => {
                            let httpStatusStaff = new HttpStatus(HttpStatus.OK, course);
                            resolve(httpStatusStaff);
                        })
                        .catch((err) => {
                            let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, null);
                            rejectStatus.message = err;
                            reject(rejectStatus);
                        });
                }
            })
        });
        return promise;
    }
    static insertCourseQuestion(req, res, user) {
        let promise = new Promise((resolve, reject) => {
            let courseId = req.params.id
            Course.findById(courseId).then((course)=>{
                if(course == null){
                    let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                    reject(rejectStatus);
                }
                let newCourse = new CourseQuestion();
                newCourse.userCreate = user._id;
                newCourse.courseId = course._id;
                RedisConnection.getData(user._id, process.env.INFO_USER).then((isUser) => {
                    if (isUser.role == "student") {
                        let httpStatusStaff = new HttpStatus(HttpStatus.FORBIDDEN, null);
                        resolve(httpStatusStaff);
                    }
                    else {
                        UploadFilesHelper.readFilesExcel(req, res).then((data) => {
                            if (data != null) {
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
            })
            .catch((err) => {
                let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, err);
                reject(rejectStatus);
            });
        });
        return promise;
    }
    static insertCourseVocabulary(req, res, user) {
        let promise = new Promise((resolve, reject) => {
            let courseId = req.params.id;
            Course.findById(courseId).then((course)=>{
                if(course == null){
                    let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                    reject(rejectStatus);
                }
                let newCourse = new CourseVocabulary();
                newCourse.userCreate = user._id;
                newCourse.courseId = course._id;
                RedisConnection.getData(user._id, process.env.INFO_USER).then((isUser) => {
                    if (isUser.role == "student") {
                        let httpStatusStaff = new HttpStatus(HttpStatus.FORBIDDEN, null);
                        resolve(httpStatusStaff);
                    }
                    else {
                        UploadFilesHelper.readFilesExcelVocabulary(req, res).then((data) => {
                            if (data != null) {
                                newCourse.vocabularys = data;
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
            })
            .catch((err) => {
                let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, err);
                reject(rejectStatus);
            });
            //end
        });
        return promise;
    }
    static tickVocabularyOfUser(userId, data) {
        let promise = new Promise((resolve, reject) => {
            let courseOfUser = new CourseOfUser(data);
            courseOfUser.userId = userId;
            courseOfUser.timeUpdate = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
            courseOfUser.save()
                .then((document) => {
                    let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                    resolve(httpStatusStaff);
                })
                .catch((err) => {
                    let rejectStatus = new HttpStatus(HttpStatus.BAD_REQUEST, null);
                    rejectStatus.message = err;
                    reject(rejectStatus);
                });
        });
        return promise;
    }
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
    static getCourseVocabulary(courseId) {
        let promise = new Promise((resolve, reject) => {
            CourseVocabulary.find({courseId: courseId}).then((courseVocabulary) => {
                if (courseVocabulary != undefined) {
                    let httpStatus = new HttpStatus(HttpStatus.OK, courseVocabulary);
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
    static getCourseQuestion(courseId) {
        let promise = new Promise((resolve, reject) => {
            CourseQuestion.find({courseId: courseId}).then((courseVocabulary) => {
                if (courseVocabulary != undefined) {
                    let httpStatus = new HttpStatus(HttpStatus.OK, courseVocabulary);
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
    static getTickVocabularyOfUser(CourseId, id) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        userId: id,
                        courseVocabularyId: mongoose.Types.ObjectId(CourseId)
                    }
                },
                {
                    $group: {
                        _id: {
                            courseVocabularyId: "$courseVocabularyId",
                        },
                        quizz: {
                            $push: {
                                $setIntersection: ["$quizz"],
                            }
                        },
                        highScore: { $first: "$highScore" },
                        timeUpdate: { $first: "$timeUpdate" },
                        timeCreate: { $first: "$timeCreate" },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        courseVocabularyId: 1,
                        quizz: 1,
                        userId: 1,
                        highScore: 1,
                        timeUpdate: 1,
                        timeCreate: 1,
                    }
                },
            )
            CourseOfUser.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
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
    static getCourseByUserId(userId) {
        let promise = new Promise((resolve, reject) => {
            let pipeList = [];
            pipeList.push(
                {
                    $match: {
                        userId: userId
                    }
                },
                {
                    $lookup: {
                        from: "coursevocabularies",
                        localField: "courseVocabularyId",
                        foreignField: "_id",
                        as: "coursevocabularies"
                    }
                },
                {
                    $unwind: {
                        path: '$coursevocabularies',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        timeCreate: 1,
                        courseVocabularyId: 1,
                        courseVocabulary: {
                            $ifNull: [{
                                nameCouse: '$coursevocabularies.nameCouse',
                                description: '$coursevocabularies.description',
                            }, ""]
                        },
                    }
                },
                {
                    $group: {
                        _id: {
                            courseVocabularyId: "$courseVocabularyId",
                        },
                        courseVocabulary: { $first: "$courseVocabulary" }
                    },
                }
            )
            CourseOfUser.aggregate(pipeList).then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
                .catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
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
}