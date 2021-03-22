import { Server } from "socket.io";
import RedisConnection from "./RedisConnection.js";
import Authentication from "./Authencation.js";
import PrivateMessageController from "../Controller/PrivateMessageController.js";
import PublicMessageController from "../Controller/PublicMessageController.js";
import User from "../Model/User.js";
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
      console.log("user has connected: " + ws.id);
      this.sendMessagePrivate(ws);
      this.sendMessagePublic(ws);
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
      origin: "https://socketserve.io",
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
            ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
          });
        PrivateMessageController.insertPrivateMessage(authorId, data.sendToId, data.message).then((HttpStatus) => {
          console.log(HttpStatus)
          RedisConnection.getData(data.sendToId, process.env.KEY_SOCKET).then((socketId) => {
            if (socketId != null) {
              RedisConnection.getData(authorId, process.env.INFO_USER).then((infoUser) => {
                let user = JSON.parse(infoUser);
                let data = this.formatMessage(HttpStatus, user);
                ws.to(socketId).emit(process.env.SEND_MESSAGE_PRIVATE, data);
              })
                .catch((reason) => {
                  ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
                  console.log(reason);
                });
            }
          })
            .catch((reason) => {
              ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
            });
        })
          .catch((reason) => {
            ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
          });
      } else ws.disconnect();
    });
  }
  static sendMessagePublic(ws) {
    ws.on(process.env.SEND_MESSAGE_PUBLIC, (groupId, messageString) => {
      let authorId = SocketConnection.checkAccessSocket(ws);
      if (authorId != null) {
        RedisConnection.getData(authorId, process.env.INFO_USER).then((infoUser) => {
          let arrGroup = JSON.parse(infoUser).group;
          if (arrGroup.indexOf(groupId) == -1) {
            User.findOne({ _id: authorId }).then((user) => {
              console.log(user.group);
              if (user.group.indexOf(groupId) == 1) {
                RedisConnection.setData(authorId, process.env.INFO_USER, user)
                PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
                  let user = JSON.parse(infoUser);
                  let data = new this.formatMessage(HttpStatus, user);
                  ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
                })
                  .catch((reason) => {
                    ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
                    console.log(reason);
                  });
              } else {
                ws.emit("ERROR-SEND-MESSAGE", 1);
              }
            }).catch((reason) => {
                ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
                console.log(reason);
              });
          }
          else {
            PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
              let user = JSON.parse(infoUser);
              let data = new this.formatMessage(HttpStatus, user);
              ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
            }).catch((reason) => {
                ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
                console.log(reason);
              });
          }
        })
        .catch((reason) => {
            ws.emit("ERROR-SEND-MESSAGE", JSON.stringify(reason));
          });
      } else ws.disconnect();
    });
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
      console.log(ws.id + " disconnected:" + reason);
      RedisConnection.deleteKey(userId, process.env.KEY_SOCKET);
    });
  }
  //check authencation request socket
  static checkAccessSocket(ws) {
    let token = ws.handshake.auth.token;
    let userId = Authentication.checkToken(token);
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
