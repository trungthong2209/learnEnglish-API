import S3 from 'aws-sdk/clients/s3.js';
import formidable from 'formidable';
import fs from 'fs';
import xlsx from 'xlsx';
import IsoDateHelper from "../Helpers/IsoDateHelper.js";
import { PassThrough } from 'stream';
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
    static convertVideoToSave(data) {
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
                let image = new Buffer.from(data, 'base64')
                let imageName = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh') + '.mp4';
                let uploadParams = {
                    Bucket: bucketName,
                    Body: image,
                    Key: imageName,
                    ContentEncoding: 'base64',
                    ContentType: 'video/mp4'
                }
                resolve(s3.upload(uploadParams).promise())
        })
        return promise
    }
    static uploadCertificates(data) {
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
            if (data.certificates != null && data.certificates.trim() != '' && data.certificates.indexOf('base64') > 0) {
                let image = Buffer.from(data.certificates.replace(/^data:image\/\w+;base64,/, ""), 'base64')
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
    static uploadFiles(req, res) {
        let promise = new Promise((resolve, reject) => {
            let form = new formidable.IncomingForm();
            //form.uploadDir = './uploads';
            form.keepExtensions = true;
            form.multiples = true;
            form.maxFieldsSize = 10 * 1024 * 1024; //10MB
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err)
                }
                if(Object.values(files).length < 1){
                    reject(null)
                }
            });
            let bucketName = process.env.S3_NAME
            let region = process.env.S3_REGION
            let accessKeyId = process.env.S3_ACCESS_KEY
            let secretAccessKey = process.env.S3_SECRET_KEY
            let s3 = new S3({
                region,
                accessKeyId,
                secretAccessKey
            })
            form.on('error', (err) => {
                reject(err)
            })
            form.on('aborted', (err) => {
                reject(err)
            })
            form.on('file', (field, file) => {
                let fileContent = fs.readFileSync(file.path);
                console.log(file.name)
                let uploadParams = {
                    Bucket: bucketName,
                    Body: fileContent,
                    Key: file.name,
                    ContentType: file.type
                }
                s3.upload(uploadParams, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data)
                })
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                });
            })
        })
        return promise
    }
    static converBufftoSave(req, res) {
        let promise = new Promise((resolve, reject) => {
            let form = new formidable.IncomingForm();
            form.keepExtensions = true;
            const pass = new PassThrough();
            form.multiples = true;
            form.maxFieldsSize = 100 * 1024 * 1024; //10MB
            let bucketName = process.env.S3_NAME
            let region = process.env.S3_REGION
            let accessKeyId = process.env.S3_ACCESS_KEY
            let secretAccessKey = process.env.S3_SECRET_KEY
            let s3 = new S3({
                region,
                accessKeyId,
                secretAccessKey
            })
            let fileMeta  = {};
            let video;
            let name = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh') + '.mp4';
            let pathFolder = '../Helpers/'+ name;
            form.on('field', (name, value)=>{
                 video = new Buffer.from(new Uint8Array(value));
                let videoo = new Buffer.from(new Uint8Array(value));
                // if (!fs.existsSync(pathFolder)){
                //     fs.mkdirSync(pathFolder);
                //   }
                  const fileStream = fs.createWriteStream(pathFolder, { flags: 'a' });
                  fileStream.write(videoo);
                  fileStream.on("finish", () => { 
                      console.log(pathFolder);
                      resolve(pathFolder)
                    });
            })
            form.on('error', (err) => {
                reject(err)
                console.log(err);
            })
            form.on('aborted', (err) => {
                console.log(err);
                reject(err)
                
            })
            // form.parse(req, err=>{
            //     if(err){
            //         console.log(err);
            //         reject(err)
            //     }
            //     else {
            //         let uploadParams = {
            //             Bucket: bucketName,
            //             Body: video,
            //             Key: name,
            //             ContentType: 'video/mp4'
            //         }
            //         resolve(s3.upload(uploadParams).promise())
            //     }
            // })
        })
        return promise
    }
    static convertVideoToSave(data) {
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
                let image = new Buffer.from(data, 'base64')
                let imageName = IsoDateHelper.getISODateByTimezone('Asia/Ho_Chi_Minh') + '.mp4';
                let uploadParams = {
                    Bucket: bucketName,
                    Body: image,
                    Key: imageName,
                    ContentEncoding: 'base64',
                    ContentType: 'video/mp4'
                }
                resolve(s3.upload(uploadParams).promise())
        })
        return promise
    }
    static readFilesExcel(req, res) {
        let promise = new Promise((resolve, reject) => {
            let form = new formidable.IncomingForm();
            //form.uploadDir = './uploads';
            form.keepExtensions = true;
            form.multiples = true;
            form.maxFieldsSize = 10 * 1024 * 1024; //10MB
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err)
                }
                if(Object.values(files).length < 1){
                    reject(null)
                }
            });
            form.on('error', (err) => {
                reject(err)
            })
            form.on('aborted', (err) => {
                reject(err)
            })
         
            form.on('file', (field, file) => {
                let fileWork = xlsx.readFile(file.path);
                if(['xls', 'xlsx', 'xlsm'].indexOf(file.name.split('.').pop())==-1){
                    resolve(null)
                }
                let sheet1 = fileWork.SheetNames[0];
                let data = fileWork.Sheets[sheet1];
                let body = xlsx.utils.sheet_to_json(data)
                body.map((raw)=>{
                    if(raw.A == undefined || raw.B == undefined  || raw.C == undefined || raw.D == undefined || raw.question == undefined || raw.correct == undefined){
                        resolve(null)
                    }
                })
                resolve(body)
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                });
            })
        })
        return promise
    }
    static readFilesExcelVocabulary(req, res) {
        let promise = new Promise((resolve, reject) => {
            let form = new formidable.IncomingForm();
            //form.uploadDir = './uploads';
            form.keepExtensions = true;
            form.multiples = true;
            form.maxFieldsSize = 10 * 1024 * 1024; //10MB
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err)
                }
                if(Object.values(files).length < 1){
                    reject(null)
                }
            });
            form.on('error', (err) => {
                reject(err)
            })
            form.on('aborted', (err) => {
                reject(err)
            })
         
            form.on('file', (field, file) => {
                let fileWork = xlsx.readFile(file.path);
                if(['xls', 'xlsx', 'xlsm'].indexOf(file.name.split('.').pop())==-1){
                    resolve(null)
                }
                let sheet1 = fileWork.SheetNames[0];
                let data = fileWork.Sheets[sheet1];
                let body = xlsx.utils.sheet_to_json(data)
                body.map((raw)=>{
                    if(raw.vocabulary == undefined || raw.type == undefined  || raw.pronounce == undefined || raw.means == undefined ){
                        resolve(null)
                    }
                })
                resolve(body)
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                });
            })
        })
        return promise
    }
}
