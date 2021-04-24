import S3 from 'aws-sdk/clients/s3.js';
import formidable from 'formidable';
import fs from 'fs';
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
           //console.log(req.files)         
            let form = formidable.IncomingForm();
            //form.uploadDir = './uploads';
            form.keepExtensions = true;
            form.multiples = true;
            form.maxFieldsSize = 10 * 1024 * 1024; //10MB
            form.parse(req);
            let bucketName = process.env.S3_NAME
            let region = process.env.S3_REGION
            let accessKeyId = process.env.S3_ACCESS_KEY
            let secretAccessKey = process.env.S3_SECRET_KEY
            let s3 = new S3({
                region,
                accessKeyId,
                secretAccessKey
            })
            form.on('error', (err)=>{
                console.log(err)
            })
            if(form.bytesExpected <= 0){
                resolve(null)
            }
            form.on('file', (field, file)=>{
                let fileContent = fs.readFileSync(file.path);
                let uploadParams = {
                    Bucket: bucketName,
                    Body: fileContent,
                    Key: Date.now() + '.' + file.name.split('.').pop(),
                    ContentType:  file.type            
                }
                s3.upload(uploadParams, (err, data)=>{
                    if(err) {
                        reject(err);
                    }
                    resolve(data)
                })      
                fs.unlink(file.path,  (err) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });      
            })
        })
        return promise
    }
}
