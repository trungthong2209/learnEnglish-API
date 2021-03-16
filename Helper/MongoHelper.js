import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()
export default async function MongoHelper(){
     try {
          await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
          }).then((serverDB) => {
                console.log("Server has been connected to database successfully ")
          }).catch((err) => {
                 console.log("Database connected fail :" + err)
          });
        } catch (error) {
          console.log(error);
        }
};

