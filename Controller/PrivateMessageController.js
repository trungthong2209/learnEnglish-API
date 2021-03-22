import PrivateMessage from "../Model/PrivateMessage.js";
import HttpStatus from "../Helper/HttpStatus.js";
import IsoDateHelper from "../Helper/IsoDateHelper.js"

export default class PrivateMessageController{
    static insertPrivateMessage(authorId, sendToId, message){
        let promise = new Promise((resolve, reject) => {
           let timeSend = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
           let data = { authorId, sendToId, message, timeSend }
            let newPrivateMessage = new PrivateMessage(data);
            newPrivateMessage.save()
            .then((document) => {
                let httpStatus = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatus);
            })
            .catch((err) => {
                console.log(err)
                let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                rejectStatus.message = 'SAVE PRIVATE MESSAGE FAIL';
                reject(rejectStatus);
            });
        });
        return promise;
    }
}