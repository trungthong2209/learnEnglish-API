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
  //set hash on redis 
  static setData(hash, key, value) {
    let promise = new Promise((resolve, reject) => {
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
  //set SADD on redis 
  static setList(key, value) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.SADD(JSON.stringify(key), JSON.stringify(value), (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static deleteOneOfList(key, value) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.SREM(JSON.stringify(key), JSON.stringify(value), (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static getList(key,) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.SMEMBERS(JSON.stringify(key), (err, data) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(data)
      })
    })
    return promise
  }
  static getData(hash, key) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.HGET(JSON.stringify(hash), JSON.stringify(key), (err, data) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        let parseData = JSON.parse(data)
        resolve(parseData)
      })
    })
    return promise
  }
  static getAllValue(hash) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.hgetall(JSON.stringify(hash), (err, data) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(data)
      })
    })
    return promise
  }
  static getKeyOnHash(hash) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.HKEYS(JSON.stringify(hash), (err, data) => {
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
    let promise = new Promise((resolve, reject) => {
      connectRedis.HDEL(JSON.stringify(hash), JSON.stringify(key), (err, reply) => {
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
    let promise = new Promise((resolve, reject) => {
      connectRedis.DEL(JSON.stringify(hash), (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static expireHash(hash, seconds) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.EXPIRE(JSON.stringify(hash), seconds, (err, reply) => {
        if (err) {
          console.log(err)
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static checkExpireHash(hash) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.TTL(JSON.stringify(hash), (err, reply) => {
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
    let promise = new Promise((resolve, reject) => {
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
    let promise = new Promise((resolve, reject) => {
      connectRedis.EXISTS(JSON.stringify(hash), (err, reply) => {
        if (err) {
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static subscribeChannel(channel) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.subscribe(JSON.stringify(channel), (err, reply) => {
        if (err) {
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static publishChannel(channel, value) {
    let promise = new Promise((resolve, reject) => {
      connectRedis.publish(JSON.stringify(channel), JSON.stringify(value), (err, reply) => {
        if (err) {
          reject(err.message)
        }
        resolve(reply)
      })
    })
    return promise
  }
  static sendNotify(socketServer) {
    connectRedis.on('message', (channel, message) => {
      if(channel!= 'all'){
        socketServer.in(channel).emit(message)
      }
      else {
        socketServer.emit(message)
      }
    })
  }
}
