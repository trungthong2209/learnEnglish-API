import User from "../Model/User.js";
import bcrypt from "bcrypt";
import HttpStatus from "../Helper/HttpStatus.js";
export default class Register {
    static register(data) {
        let promise = new Promise((resolve, reject) => {
            User.findOne({ email: data.email }).then((err, doc) => {
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
                                        console.log(err)
                                        let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                                        rejectStatus.message = 'SAVE REGISTER FAIL';
                                        reject(rejectStatus);
                                    });
                            })
                            .catch((err) => {
                                console.log(err)
                                let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                                rejectStatus.message = 'ENCODE REGISTER FAIL';
                                reject(rejectStatus);
                            });
                    } else {
                        let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                        rejectStatus.message = 'EMAIL IS EXIST';
                        reject(rejectStatus);
                    }
                })
                .catch((err) => {
                    let rejectStatus = new HttpStatus(HttpStatus.SERVER_ERROR, null);
                    rejectStatus.message = err;
                    reject(rejectStatus);
                });
        });
        return promise;
    }
}