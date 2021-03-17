import mongoose from 'mongoose';
export default async function MongoHelper(){
     try {
          await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
          }).then((serverDB) => {
              console.log("Server has been connected to " + serverDB.connections[0]._connectionString)
          }).catch((err) => {
                 console.log("Database connected fail:" + err)
          });
        } catch (error) {
               throw console.log(error);
        }
};

