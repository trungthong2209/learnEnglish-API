import User from "../Model/User.js";
import bcrypt from "bcrypt";
import HttpStatus from "../Helper/HttpStatus.js";
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
    static getAllUser() {
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
}