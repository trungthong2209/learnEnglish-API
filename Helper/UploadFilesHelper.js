import S3 from 'aws-sdk/clients/s3.js';
import formidable from 'formidable';
export default class UploadFilesHelper {
    static convertImageToSave(data) {
        let promise = new Promise((resolve, reject) => {
            let bucketName = process.env.S3_NAME
            let region = process.env.S3_REGION
            let accessKeyId = process.env.S3_ACCESS_KEY
            let secretAccessKey = process.env.S3_SECRET_KEY
            let s3 = new S3({
                region,
                accessKeyId,
                secretAccessKey
            })
            if (data.image != null && data.image.trim() != '' && data.image.indexOf('base64') > 0) {
                let image = Buffer.from(data.image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                let imageName = Date.now() + '.jpg';
                let uploadParams = {
                    Bucket: bucketName,
                    Body: image,
                    Key: imageName,
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg'
                }
                resolve(s3.upload(uploadParams).promise())
            }
            else resolve(null)
        })
        return promise
    }
    static uploadFiles(req) {
        let promise = new Promise((resolve, reject) => {
            let bucketName = process.env.S3_NAME
            let region = process.env.S3_REGION
            let accessKeyId = process.env.S3_ACCESS_KEY
            let secretAccessKey = process.env.S3_SECRET_KEY
            let s3 = new S3({
                region,
                accessKeyId,
                secretAccessKey
            })               
            let form = formidable.IncomingForm();
            form.parse(req, (err, fields, files)=>{
                if(err){
                    next(err);
                    reject(err)
                }
                let uploadParams = {
                    Bucket: bucketName,
                    Body: image,
                    Key: imageName,
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg'
                }
                resolve(s3.upload(uploadParams).promise())
            }) 
              // let image = Buffer.from(data.image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                // let imageName = Date.now() + '.jpg';
               
            
        })
        return promise
    }
}
