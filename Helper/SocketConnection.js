import { Server } from "socket.io";
import RedisConnection from "./RedisConnection.js";
import Authentication from "./Authencation.js";
import PrivateMessageController from "../Controller/PrivateMessageController.js";
import PublicMessageController from "../Controller/PublicMessageController.js";
import User from "../Model/User.js";
import Group from '../Model/Group.js'
export default class SocketConnection {
  static Initialise(httpServer) {
    console.log("Initialising new WebSocket server...");
    let socketServer = new Server(httpServer, {
      cors: {
        origin: "https://socketserve.io",
        credentials: true,
        methods: ["GET, POST"],
        allowedHeaders: ['Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers']
      },
      allowEIO3: true,
      pingInterval: 5000,
      pingTimeout: 10000,
    });
    socketServer.on("connection", (ws) => {
      let userId = SocketConnection.checkAccessSocket(ws);
      if (userId != null) {
        RedisConnection.setData(userId, process.env.KEY_SOCKET, ws.id);
      }
      console.log("socket has connected: " + ws.id);
      this.sendMessagePrivate(ws);
      this.joinningGroup(ws, userId);
      this.leavingGroup(ws, userId);
      this.sendMessagePublic(ws)
      this.disconnectSocket(ws, userId);
    });
  }
  //check hear beat socket
  static hearBeat() {
    let hearBeat = {
      pingInterval: 2000,
      pingTimeout: 5000,
    };
    return hearBeat;
  }
  static cors() {
    let cors = {
      origin: process.env.HTTP_SERVER,
      credentials: true,
      methods: ["GET, POST"],
      allowedHeaders: ['Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers']
    }
    return cors;
  }
  static sendMessagePrivate(ws) {
    ws.on(process.env.SEND_MESSAGE_PRIVATE, (data) => {
      let authorId = SocketConnection.checkAccessSocket(ws);
      if (authorId != null) {
        RedisConnection.checkKeyExist(authorId, process.env.KEY_SOCKET)
          .then((number) => {
            if (number == 0) {
              RedisConnection.setData(userId, process.env.KEY_SOCKET, ws.id);
            }
          })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
        PrivateMessageController.insertPrivateMessage(authorId, data.sendToId, data.message).then((HttpStatus) => {
          RedisConnection.getData(data.sendToId, process.env.KEY_SOCKET).then((socketId) => {
            if (socketId != null) {
              RedisConnection.getData(authorId, process.env.INFO_USER).then((infoUser) => {
                let user = JSON.parse(infoUser);
                let data = this.formatMessage(HttpStatus, user);
                ws.to(JSON.parse(socketId)).emit(process.env.SEND_MESSAGE_PRIVATE, data)
              }).catch((reason) => {
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                console.log(reason);
              });
            }
          })
            .catch((reason) => {
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            });
        })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
      } else ws.disconnect();
    });
  }
  static sendMessagePublic(ws) {
    ws.on(process.env.SEND_MESSAGE_PUBLIC, (dataFromClient) => {
      console.log(dataFromClient)
      let groupId = dataFromClient.groupId;
      let messageString = dataFromClient.message
      let authorId = SocketConnection.checkAccessSocket(ws);
      if (authorId != null) {
        RedisConnection.getData(authorId, process.env.INFO_USER).then((infoUser) => {
          let parseInfoUser = JSON.parse(infoUser);
          if (parseInfoUser.group.indexOf(groupId) == -1) {
            Group.findOne({ _id: groupId }).then((group) => {
              if (group.userJoin.indexOf(authorId) != -1) {
                parseInfoUser.group.push(groupId)
                RedisConnection.setData(authorId, process.env.INFO_USER, parseInfoUser)
                PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
                  let user = JSON.parse(infoUser);
                  let data = this.formatMessage(HttpStatus, user);
                  ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
                })
                  .catch((reason) => {
                    ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                    console.log(reason);
                  });
              } else {
                ws.emit(process.env.SEND_MESSAGE_ERROR, 1);
              }
            }).catch((reason) => {
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
              console.log(reason);
            });
          }
          else {
            PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
              let user = JSON.parse(infoUser);
              let data = this.formatMessage(HttpStatus, user);
              ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
            }).catch((reason) => {
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
              console.log(reason);
            });
          }
        })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
      } else ws.disconnect();
    });
  }
  static joinningGroup(ws, userId) {
    ws.on('joinningGroup', (groupId) => {
      console.log('joinningGroup: '+ groupId)
    RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
      if (data != null) {
          let parseInfoUser = JSON.parse(data);
          if(parseInfoUser.group.indexOf(groupId)==-1){
            parseInfoUser.group.push(groupId)
          }
          RedisConnection.setData(userId, process.env.INFO_USER, parseInfoUser).then(()=>{
            User.updateOne({_id : userId}, parseInfoUser).then(() => {
              ws.join(groupId);
              let message = {
                userName: parseInfoUser.userName,
                avatar: parseInfoUser.avatar
              }
              ws.broadcast.to(groupId).emit("joinningGroup", message);
            })
            .catch((reason) => {
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            });
          })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
        };
      })
      .catch((reason) => {
        ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
      });
    })
  }
  static leavingGroup(ws, userId) {
       ws.on('leavingGroup', (groupId) => {
         console.log('leavingGroup: '+ groupId)
          RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
           if (data != null) {
          let parseInfoUser = JSON.parse(data);
          let i = parseInfoUser.group.indexOf(groupId)
          if (i != -1) {
            parseInfoUser.group.splice(i, 1)
          }
          RedisConnection.setData(userId, process.env.INFO_USER, parseInfoUser).then(() => {
            delete parseInfoUser._id;
            User.updateOne({_id : userId}, parseInfoUser).then(() => {
              ws.leave(groupId);
              let message = {
                userName: parseInfoUser.userName,
                avatar: parseInfoUser.avatar
              }
              ws.broadcast.to(groupId).emit("leavingGroup", message);
            })
            .catch((reason) => {
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            });
          })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
        };
      })
      .catch((reason) => {
        ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
      });
    })
  }
  static formatMessage(HttpStatus, user) {
    let data = {
      timeSend: HttpStatus.entity.timeSend,
      message: HttpStatus.entity.message,
      avatar: user.avatar,
      userName: user.userName,
      authorId: HttpStatus.entity.authorId,
      email: user.email,
    };
    return data;
  }
  static disconnectSocket(ws, userId) {
    ws.on("disconnect", (reason) => {
      console.log(ws.id + "..disconnected: .." + reason);
      RedisConnection.deleteKey(userId, process.env.KEY_SOCKET);
    });
  }
  //check authencation request socket
  static checkAccessSocket(ws) {
    let token = ws.handshake.auth.token;
    let userId = Authentication.checkToken(token);
    console.log("User is connecting:  " + userId);
    if (userId != null) {
      if (RedisConnection.checkKeyExist(userId, ws.id) == 0) {
        RedisConnection.setData(userId, ws.id);
      }
      return userId;
    } else {
      return null;
    }
  }
}
