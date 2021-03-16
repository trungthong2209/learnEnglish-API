import User from "../Model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import HttpStatus from "../Helper/HttpStatus.js"
export default class Login {
    static checkLogin(data) {
        let promise = new Promise((resolve, reject) => {
            if (data.email && data.password) {
                User.findOne({ email: data.email }).then((user, err) => {
                    if (user != undefined) {
                        bcrypt.compare(data.password, user.password).then((isMath) => {
                            if (isMath) {
                                const payload = {
                                    _id: user.id,
                                    userName: user.userName,
                                    role: user.role,
                                    group: user.group
                                };
                                jwt.sign(
                                    payload,
                                    process.env.AUTH0_APP_SECRET,
                                    (err, token) => {
                                        if (!err) {
                                            console.log(token)
                                            let httpStatus = new HttpStatus(HttpStatus.OK, user);
                                            resolve(httpStatus);
                                        } else {
                                            let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                                            rejectStatus.message = 'LOGIN AGAIN!';
                                            reject(rejectStatus);
                                        }
                                    }
                                );
                            } else {
                                let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                                rejectStatus.message = 'PASSWORD INCORECT!';
                                reject(rejectStatus);
                            }
                        }).catch((err) => {
                            let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                            rejectStatus.message = 'LOGIN AGAIN!';
                            reject(rejectStatus);
                        })
                    } else {
                        // console.log(err)
                        let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                        rejectStatus.message = 'EMAIL NOT EXIST';
                        reject(rejectStatus);
                    }
                }).catch((err) => {
                    console.log(err)
                    let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                    rejectStatus.message = 'ERROR SERVER MONGO';
                    reject(rejectStatus);
                })
            } else {
                let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                rejectStatus.message = 'DATA NOT EMPTY';
                reject(rejectStatus);
            }
        });
        return promise;
    }
}