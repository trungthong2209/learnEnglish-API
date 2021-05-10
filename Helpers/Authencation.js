import jwt from "jsonwebtoken";
import HttpStatus from "../Helpers/HttpStatus.js";
import RedisConnection from "../Helpers/RedisConnection.js"
export default class Authentication {
    static checkAccess(dataAccessCodes, req) {
        let promise = new Promise((resolve, reject) => {
            let token = req.headers['x-wfg-token'];
            if (token) {
                jwt.verify(token, process.env.AUTH0_APP_SECRET, (err, decoded) => {
                    if (err) {
                        let rejectStatus = new HttpStatus(HttpStatus.NOT_ACCEPTABLE, null);
                        rejectStatus.message = err.message;
                        reject(rejectStatus);
                    }
                    else {
                        if (decoded._id) {
                            RedisConnection.checkHashExist(decoded._id)
                            .then((isExist)=>{
                                if(isExist==1){
                                    let rejectStatus = new HttpStatus(HttpStatus.OK, decoded);
                                    rejectStatus.message = "AUTHORIZATED";
                                    resolve(rejectStatus);
                                }
                                else {
                                    let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                                    rejectStatus.message = 'NOT AUTHORIZATE';
                                    reject(rejectStatus);
                                }
                            })
                            .catch((err) => {
                                reject(HttpStatus.getHttpStatus(err));
                            });
                        }
                        else {
                            let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                            rejectStatus.message = 'NOT AUTHORIZATE';
                            reject(rejectStatus);
                        }
                    }
                })
            }
            else {
                let rejectStatus = new HttpStatus(HttpStatus.UNAUTHORISED, null);
                rejectStatus.message = 'TOKEN NOT EXISTED';
                reject(rejectStatus);
            }
        });
        return promise;
    }
    static checkToken(token){
        let id = null ;
        jwt.verify(token, process.env.AUTH0_APP_SECRET, (err, decoded) => {
            if(err){
                return null
            }
            else id = decoded._id
        })
        return id
    }
}