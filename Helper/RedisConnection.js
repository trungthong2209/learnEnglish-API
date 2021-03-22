import redis from 'redis';
let connectRedis = redis.createClient({});
export default class RedisConnection {
  static Initialise() {
    connectRedis.on('connect', () => {
      console.log("Initialising new Redis memory: " + connectRedis.address)
    })
    connectRedis.on("error", function (error) {
      console.error(error);
    });
  }
  static setData(hash, key, value) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.HSET(JSON.stringify(hash), JSON.stringify(key), JSON.stringify(value), (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static getData(hash, key) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.HGET(JSON.stringify(hash), JSON.stringify(key), (err, data) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(data)
      })
    })
    return promise
  }
  static getAllValue(hash) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.hgetall(JSON.stringify(hash),  (err, data) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(data)
      })
    })
      return promise
  }
  static deleteKey(hash, key) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.HDEL(JSON.stringify(hash), JSON.stringify(key),  (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static deleteHash(hash) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.DEL(JSON.stringify(hash),  (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static checkKeyExist(hash, key) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.HEXISTS(JSON.stringify(hash), JSON.stringify(key), (err, reply) => {
        if (err) {
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static checkHashExist(hash) {
    let promise = new Promise((resolve, reject) =>{
      connectRedis.EXISTS(JSON.stringify(hash), (err, reply) => {
        if (err) {
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  
}
