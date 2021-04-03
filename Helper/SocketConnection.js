import { Server } from "socket.io";
import RedisConnection from "./RedisConnection.js";
import Authentication from "./Authencation.js";
import PrivateMessageController from "../Controller/PrivateMessageController.js";
import PublicMessageController from "../Controller/PublicMessageController.js";
import Group from '../Model/Group.js'
export default class SocketConnection {
  static Initialise(httpServer) {
    let socketServer = new Server(httpServer, {
      cors: {
        origin: [process.env.HTTP_SERVER, "http://localhost:3000"],
        credentials: true,
        methods: ["GET, POST"],
        allowedHeaders: ['Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers']
      },
      allowEIO3: true,
      pingInterval: 5000,
      pingTimeout: 10000,
    });
    console.log("Initialising new WebSocket server...");
    socketServer.on("connection", async (ws) => {
      let userId = await SocketConnection.checkAccessSocket(ws)
        if (userId != null) {
        RedisConnection.setData(userId, process.env.KEY_SOCKET, ws.id).then(()=>{
            ws.emit('status', 'online')
        })
       }
        console.log("user has connected: " + ws.id);
        this.sendMessagePrivate(ws);
        this.joinGroup(ws);
        this.leaveGroup(ws);
        this.sendMessagePublic(ws)
        this.disconnectSocket(ws, userId);
        this.freeTimeMode(ws)
        this.matchVolunteer(ws)
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
  static sendMessagePrivate(ws) {
    ws.on(process.env.SEND_MESSAGE_PRIVATE, (data) => {
      SocketConnection.checkAccessSocket(ws).then((authorId) => {
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
                  //let user = JSON.parse(infoUser);
                  let data = this.formatMessage(HttpStatus, infoUser);
                  ws.to(socketId).emit(process.env.SEND_MESSAGE_PRIVATE, data)
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
      })
      .catch((reason)=>{
          ws.disconnect();
      });
    });
  }
  static sendMessagePublic(ws) {
    ws.on(process.env.SEND_MESSAGE_PUBLIC, (dataFromClient) => {
      let groupId = dataFromClient.groupId;
      let messageString = dataFromClient.message
      SocketConnection.checkAccessSocket(ws).then((authorId) => {
        if (authorId != null) {
          RedisConnection.getData(authorId, process.env.INFO_USER).then((infoUser) => {
            //let parseInfoUser = JSON.parse(infoUser);
            if (infoUser.group.indexOf(groupId) == -1) {
              Group.findOne({ _id: groupId }).then((group) => {
                if (group.userJoin.indexOf(authorId) != -1) {
                  infoUser.group.push(groupId)
                  RedisConnection.setData(authorId, process.env.INFO_USER, infoUser)
                  PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
                    // let user = JSON.parse(infoUser);
                    let data = this.formatMessage(HttpStatus, infoUser);
                    ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
                  })
                    .catch((reason) => {
                      ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                      console.log(reason);
                    });
                } else {

                  ws.emit(process.env.SEND_MESSAGE_ERROR, "YOU NOT JOIN GROUP");
                }
              }).catch((reason) => {
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                console.log(reason);
              });
            }
            else {
              PublicMessageController.insertPublicMessage(authorId, groupId, messageString).then((HttpStatus) => {
                //let user = JSON.parse(infoUser);
                let data = this.formatMessage(HttpStatus, infoUser);
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
      })
      .catch((reason)=>{
        ws.disconnect();
    });
    });
  }
  static joinGroup(ws) {
    ws.on('joinGroup', (groupId) => {
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
          if (data != null) {
            // let parseInfoUser = JSON.parse(data);
            if (data.group.indexOf(groupId) == -1) {
              Group.findOne({ _id: groupId }).then((group) => {
                if (group.userJoin.length > 7) {
                  ws.emit('joinGroup', "THE GROUP WAS FULL")
                }
                else {
                  data.group.push(groupId)
                  RedisConnection.setData(userId, process.env.INFO_USER, data).then(() => {
                    group.updateOne({ $addToSet: { userJoin: userId } }).then(() => {
                      ws.join(groupId);
                      let message = this.formatMessage(null, data)
                      ws.broadcast.to(groupId).emit("joinGroup", message);
                    })
                      .catch((reason) => {
                        ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                      });
                  })
                    .catch((reason) => {
                      ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                    });
                }
              })
            }
          } else {
            ws.disconnect();
          }
        })
          .catch((reason) => {
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
      })
      .catch((reason)=>{
        ws.disconnect();
    });
    })
  }
  static leaveGroup(ws) {
    ws.on('leaveGroup', (groupId) => {
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
          if (data != null) {
            let i = parseInfoUser.group.indexOf(groupId)
            if (i != -1) {
              data.group.splice(i, 1)
            }
            RedisConnection.setData(userId, process.env.INFO_USER, data).then(() => {
              Group.updateOne({ _id: groupId }, { $pull: { userJoin: userId } }).then(() => {
                ws.leave(groupId);
                let message = this.formatMessage(null, data)
                ws.broadcast.to(groupId).emit("leaveGroup", message);
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
      .catch((reason)=>{
        ws.disconnect();
    });
    })
  }

  static matchVolunteer(ws) {
    ws.on('matchVolunteers', (topicId) => {
      SocketConnection.checkAccessSocket(ws).then((authorId) => {
        if (authorId != null) {
          let hearBeat = 7000; //7s
          let match = setInterval(() => {
            if (ws.connected == false) {
              return clearInterval(match)
            }
            console.log("matching..." + topicId)
            RedisConnection.getList(topicId).then((arrVolunteer) => {
              if (arrVolunteer.length > 0) {
                let parseId = JSON.parse(arrVolunteer[0])
                RedisConnection.getData(parseId, process.env.INFO_USER).then((volunteer) => {
                  RedisConnection.getData(parseId, process.env.KEY_SOCKET).then((volunteerSocketId) => {
                    if (volunteerSocketId != null) {
                      let dataVolunteer = SocketConnection.formatMessage(null, volunteer)
                      ws.to(volunteerSocketId).emit('pairing', dataVolunteer)
                      ws.emit('pairing', dataVolunteer)
                      RedisConnection.deleteOneOfList(topicId, parseId)
                      clearInterval(match)
                    }
                  })
                })
              }
            })
          }, hearBeat);
          ws.on('stopMatching', (data) => {
            console.log("clear")
            return clearInterval(match);
          })
        }
        else {
          ws.disconnect();
        }
      })    
      .catch((reason)=>{
        ws.disconnect();
    });
    })
  }
  static freeTimeMode(ws) {
    ws.on('freeTimeMode', (data) => {
      SocketConnection.checkAccessSocket(ws).then((authorId) => {
        if (authorId != null) {
          RedisConnection.getData(authorId, process.env.INFO_USER).then((user) => {
            if (user != null) {
              let role = user.role
              let topics = user.topics;
              if (role == 'teacher' && topics != null) {
                topics.map((topic) => {
                  RedisConnection.setList(topic, authorId).then((reply) => {
                    console.log("free Time Mode" + reply)
                  })
                })
                ws.emit("turnOnMode", topics)
              }
              else {
                let reason = "403 Insufficient Permission";
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
              }
            }
            else {
              let reason = "REDIS SERVER GET YOUR INFORMATION IS FAIL";
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            }
          })
        }
        else {
          ws.disconnect();
        }
      })
      .catch((reason)=>{
        ws.disconnect();
    });
    })
  }
  static formatMessage(HttpStatus, user) {
    let data = {
      avatar: user.avatar,
      userName: user.userName,
      email: user.email,
    };
    if (HttpStatus != null) {
      data.timeSend = HttpStatus.entity.timeSend,
        data.message = HttpStatus.entity.message,
        data.authorId = HttpStatus.entity.authorId
    }
    return data;
  }
  static disconnectSocket(ws, userId) {
    ws.on("disconnect", (reason) => {
      console.log(ws.id + "..disconnected: .." + reason);
      RedisConnection.deleteKey(userId, process.env.KEY_SOCKET).then(()=>{
           ws.emit('status', 'offline')
      })
    });
  }
  //check authencation request socket
  static checkAccessSocket(ws) {
    let promise = new Promise((resolve, reject) => {
      let token = ws.handshake.auth.token;
      let userId = Authentication.checkToken(token);
      if (userId != null) {
      RedisConnection.checkKeyExist(userId, process.env.KEY_SOCKET).then((value)=>{
        if(value==0){
          RedisConnection.setData(userId, process.env.KEY_SOCKET, ws.id);
          resolve(userId)
        }
        })
      } 
      else {
        reject(null)
      }
    })
    return promise
  }
}
