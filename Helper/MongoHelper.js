import mongoose from 'mongoose';
export default class MongoHelper{
        static Initialise(){
              try {
                     //1
                     mongoose.connect(process.env.DATABASE_URL, {
                            useNewUrlParser: true,
                            useUnifiedTopology: true,
                            useCreateIndex: true,
                            useFindAndModify: false
                     }).then((serverDB) => {
                          console.log("Initialising Database " + serverDB.connections[0].host + ":"+serverDB.connections[0].port+ "/" + serverDB.connections[0].name)
                     }).catch((err) => {
                            console.log("Database connected fail:" + err)
                     });
              } catch (error) {
                     throw console.log(error);
              }
       }
     
};

