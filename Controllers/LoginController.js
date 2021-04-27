import User from "../Models/User.js";
import GroupController from '../Controllers/GroupController.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import HttpStatus from "../Helpers/HttpStatus.js"
import RedisConnection from '../Helpers/RedisConnection.js'
import Authentication from "../Helpers/Authencation.js";
export default class LoginController {
    static checkLogin(data) {
        let promise = new Promise((resolve, reject) => {
            if (data.email && data.password) {
                User.findOne({ email: data.email }).then((user) => {
                    if (user != undefined) {
                        bcrypt.compare(data.password, user.password).then((isMath) => {
                            if (isMath) {
                                const payload = {
                                    _id: user._id
                                };
                                jwt.sign(
                                    payload,
                                    process.env.AUTH0_APP_SECRET,
                                    (err, token) => {
                                        if (!err) {
                                            user.token = token;
                                            GroupController.getGroupsByUserId(user._id).then((httpStatusGroup)=>{
                                                 user.group = httpStatusGroup.entity
                                                RedisConnection.setData(user._id, process.env.INFO_USER, user);
                                                let httpStatus = new HttpStatus(HttpStatus.OK, user);
                                                resolve(httpStatus);
                                            })
                                            .catch((err) => {
                                                reject(HttpStatus.getHttpStatus(err));
                                            });
                                           
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
                            reject(HttpStatus.getHttpStatus(err));
                        })
                    } else {
                        let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                        rejectStatus.message = 'EMAIL NOT EXIST';
                        reject(rejectStatus);
                    }
                }).catch((err) => {
                    reject(HttpStatus.getHttpStatus(err));
                })
            } else {
                let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                rejectStatus.message = 'DATA NOT EMPTY';
                reject(rejectStatus);
            }
        });
        return promise;
    }
    static logOut(req) {
        let promise = new Promise((resolve, reject) => {
            let token = req.headers['x-wfg-token'];
            if(token){
                let userId = Authentication.checkToken(token);
                RedisConnection.deleteHash(userId).then((value) => {
                    let httpStatus = new HttpStatus(HttpStatus.OK, value);
                    httpStatus.message = "Logged Out Successfully"
                    resolve(httpStatus);
                })
                    .catch((err) => {
                        reject(HttpStatus.getHttpStatus(err));
                })
            }
            else {
                let httpStatus = new HttpStatus(HttpStatus.OK, null);
                httpStatus.message = "Logged Out Successfully"
                resolve(httpStatus);
            }
    
        })
        return promise
    }
    // static getGroups(userId){
    //     let promise = new Promise((resolve, reject) => {
    //         Group.find({userJoin: userId}).then((document) => {
    //             let doc = []
    //             document.map((value)=>{
    //                 doc.push(value._id)
    //             })
    //             let httpStatus = new HttpStatus(HttpStatus.OK, doc);
    //             resolve(httpStatus);
    //         })
    //         .catch((err) => {
    //             reject(HttpStatus.getHttpStatus(err));
    //         });
    //     });
    //     return promise;
    // }
}