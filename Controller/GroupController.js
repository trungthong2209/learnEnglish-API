import Group from "../Model/Group.js";
import HttpStatus from "../Helper/HttpStatus.js";

export default class GroupController{
    static insertGroup(data){
        let promise = new Promise((resolve, reject) => {
            let groupCode = this.randomCode();
            let newGroup = new Group(data);
            newGroup.groupCode = groupCode;
            newGroup.save().then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
            .catch((err) => {
                reject(HttpStatus.getHttpStatus(err));
            });
        });
        return promise;
    }
    static randomCode(){
        let code = Date.now().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        if(code.length < 6){
            code = Date.now().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        }
        return code
    }
}