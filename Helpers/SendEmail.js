import nodemailer from 'nodemailer';

export default class SendEmail {
    static sendEmailService(sendToemail, subject, content) {
        let promise = new Promise(async (resolve, reject) => {
        const systemEmail = process.env.email;
        const systemPassword = process.env.password;
        const mailHost = 'smtp.gmail.com';
        const mailPort = 587;
      let transport =  nodemailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: false,
            auth: {
                user: systemEmail,
                pass: systemPassword
            }
        })
        const options = {
            from: systemEmail,
            to: sendToemail,
            subject: subject,
            html: content
        }
        let results = transport.sendMail(options);
        resolve(results);
    });
    return promise;
}
}