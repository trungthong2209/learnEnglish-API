import PublicMessage from "../Model/PublicMessage.js";
import HttpStatus from "../Helper/HttpStatus.js";
import IsoDateHelper from "../Helper/IsoDateHelper.js"

export default class PublicMessageController{
    static insertPublicMessage(authorId, groupId, message){
        let promise = new Promise((resolve, reject) => {
            let timeSend = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh');
            let data = { authorId, groupId, message, timeSend}
            let newPublicMessage = new PublicMessage(data);
            newPublicMessage.save()
            .then((document) => {
                let httpStatusStaff = new HttpStatus(HttpStatus.OK, document);
                resolve(httpStatusStaff);
            })
            .catch((err) => {
                console.log(err)
                let rejectStatus = new HttpStatus(HttpStatus.NOT_FOUND, null);
                rejectStatus.message = 'SAVE PUBLIC MESSAGE FAIL';
                reject(rejectStatus);
            });
        });
        return promise;
    }
}