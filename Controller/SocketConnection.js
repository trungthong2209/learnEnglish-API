import { Server } from "socket.io";
import RedisConnection from "../Helper/RedisConnection.js";
import Authentication from "../Helper/Authencation.js";
import PrivateMessageController from "./PrivateMessageController.js";
import PublicMessageController from "./PublicMessageController.js";
import Group from '../Model/Group.js'
export default class SocketConnection {
  static Initialise(httpServer) {
    let socketServer = new Server(httpServer, {
      cors: {
        origin: [process.env.HTTP_SERVER, "http://localhost:3001", "http://localhost:3000"],
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
        RedisConnection.checkHashExist(userId).then((isHashExist) => {
          if (isHashExist == 1) {
            RedisConnection.checkExpireHash(userId).then((timeCheck) => {
              if (timeCheck > 0) {
                // 1 day
                RedisConnection.expireHash(userId, 86400)
              }
            })
          }
        })
        RedisConnection.checkKeyExist(userId, process.env.INFO_USER).then((isKeyExist) => {
          if (isKeyExist != 0) {
            RedisConnection.getData(userId, process.env.KEY_SOCKET).then((socketIds) => {
              if (socketIds == null) {
                let arrSocketIds = [];
                arrSocketIds.push(ws.id)
                RedisConnection.setData(userId, process.env.KEY_SOCKET, arrSocketIds)
              }
              else {
                socketIds.push(ws.id)
                RedisConnection.setData(userId, process.env.KEY_SOCKET, socketIds)
              }
            })
          }
          else {
            let reason ='Your info is empty, pls login again';
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            ws.disconnect();
          }
        })
      }
      console.log("user has connected: " + ws.id);
      this.sendMessagePrivate(ws);
      this.joinGroup(ws, socketServer);
      this.leaveGroup(ws, socketServer);
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
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        if (userId != null) {
          PrivateMessageController.insertPrivateMessage(userId, data.sendToId, data.message).then((HttpStatus) => {
            console.log(data.sendToId)
            RedisConnection.getData(data.sendToId, process.env.KEY_SOCKET).then((socketIds) => {
              if (socketIds != null) {
                if (socketIds.length > 0) {
                  RedisConnection.getData(userId, process.env.INFO_USER).then((infoUser) => {
                    let data = this.formatMessage(HttpStatus, infoUser);
                    console.log(data)
                    for (let socketId of socketIds) {
                      ws.to(socketId).emit(process.env.SEND_MESSAGE_PRIVATE, data)
                    }
                  }).catch((reason) => {
                    ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                  });
                }
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
        .catch((reason) => {
          ws.disconnect();
        });
    });
  }
  static sendMessagePublic(ws) {
    ws.on(process.env.SEND_MESSAGE_PUBLIC, (dataFromClient) => {
      let groupId = dataFromClient.groupId;
      let messageString = dataFromClient.message
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        if (userId != null) {
          RedisConnection.getData(userId, process.env.INFO_USER).then((infoUser) => {
            //let parseInfoUser = JSON.parse(infoUser);
            if (infoUser.group.indexOf(groupId) == -1) {
              Group.findOne({ _id: groupId }).then((group) => {
                if (group.userJoin.indexOf(userId) != -1) {
                  infoUser.group.push(groupId)
                  RedisConnection.setData(userId, process.env.INFO_USER, infoUser)
                  PublicMessageController.insertPublicMessage(userId, groupId, messageString).then((HttpStatus) => {
                    // let user = JSON.parse(infoUser);
                    let data = this.formatMessage(HttpStatus, infoUser);
                    ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
                    ws.emit(process.env.SEND_MESSAGE_PUBLIC, data)
                    console.log(data)
                  })
                    .catch((reason) => {
                      ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                      console.log(reason);
                    });
                } else {
                  ws.emit(process.env.SEND_MESSAGE_ERROR, "YOU CAN'T SEND MESSAGE IN GROUP");
                }
              }).catch((reason) => {
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                console.log(reason);
              });
            }
            else {
              PublicMessageController.insertPublicMessage(userId, groupId, messageString).then((HttpStatus) => {
                //let user = JSON.parse(infoUser);
                let data = this.formatMessage(HttpStatus, infoUser);
                ws.to(groupId).emit(process.env.SEND_MESSAGE_PUBLIC, data);
                console.log(data)
                ws.emit(process.env.SEND_MESSAGE_PUBLIC, data)
              }).catch((reason) => {
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                console.log(reason);
              });
            }
          })
            .catch((reason) => {
              console.log(reason)
              ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
            });
        } else ws.disconnect();
      })
        .catch((reason) => {
          console.log(reason)
          ws.disconnect();
        });
    });
  }
  static joinGroup(ws, socketServer) {
    ws.on('joinGroup', (groupId) => {
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
          if (data != null) {
            // let parseInfoUser = JSON.parse(data);
            if (data.group.indexOf(groupId) == -1) {
              Group.findOne({ _id: groupId }).then((group) => {
                if (group.userJoin.length > 7) {
                  let notify = "THE GROUP WAS FULL";
                  ws.emit('joinGroup', notify)
                }
                else {
                  data.group.push(groupId)
                  RedisConnection.setData(userId, process.env.INFO_USER, data).then(() => {
                    group.updateOne({ $addToSet: { userJoin: userId } }).then(() => {
                      ws.join(groupId);
                      let message = this.formatMessage(null, data)
                      //Save list users online on the group
                      RedisConnection.setList(groupId, data._id).then(() => {
                        RedisConnection.getList(groupId).then((listUserOnline) => {
                          console.log("listUserOnline: ")
                          console.log(listUserOnline)
                          socketServer.to(groupId).emit('listUserOnline', listUserOnline)
                          ws.broadcast.to(groupId).emit("joinGroup", message);
                        })
                      })
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
            } else {
              ws.join(groupId);
              let message = this.formatMessage(null, data)
              RedisConnection.setList(groupId, data._id).then(() => {
                RedisConnection.getList(groupId).then((listUserOnline) => {
                  console.log("list Users Online in roomId: "+groupId)
                  console.log(listUserOnline)
                  socketServer.to(groupId).emit('listUserOnline', listUserOnline)
                  ws.broadcast.to(groupId).emit("joinGroup", message);
                })
              })
            }
          } else {
            ws.disconnect();
          }
        })
          .catch((reason) => {
            console.log(reason)
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
      })
        .catch((reason) => {
          console.log(reason)
          ws.disconnect();
        });
    })
  }
  static leaveGroup(ws, socketServer) {
    ws.on('leaveGroup', (groupId) => {
      SocketConnection.checkAccessSocket(ws).then((userId) => {
        RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
          if (data != null) {
            let index = data.group.indexOf(groupId)
            if (index != -1) {
              data.group.splice(index, 1)
            }
            RedisConnection.setData(userId, process.env.INFO_USER, data).then(() => {
              Group.updateOne({ _id: groupId }, { $pull: { userJoin: userId } }).then(() => {
                ws.leave(groupId);
                let message = this.formatMessage(null, data)
                RedisConnection.deleteOneOfList(groupId, userId)
                RedisConnection.getList(groupId).then((listUserOnline) => {
                  if (listUserOnline.length > 0) {
                    socketServer.to(groupId).emit('listUserOnline', listUserOnline)
                    ws.broadcast.to(groupId).emit("leaveGroup", message);
                  }
                  else {
                    RedisConnection.deleteHash(groupId)
                  }
                })
              })
                .catch((reason) => {
                  console.log(reason)
                  ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
                });
            })
              .catch((reason) => {
                console.log(reason)
                ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
              });
          };
        })
          .catch((reason) => {
            console.log(reason)
            ws.emit(process.env.SEND_MESSAGE_ERROR, JSON.stringify(reason));
          });
      })
        .catch((reason) => {
          ws.disconnect();
        });
    })
  }
  //Matching volunteers
  static matchVolunteer(ws) {
    ws.on('matchVolunteers', (topicId) => {
      console.log('1')
      console.log("topicId" + topicId)
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
                  RedisConnection.getData(parseId, process.env.KEY_SOCKET).then((volunteerSocketIds) => {
                    if (volunteerSocketIds.length > 0) {
                      let dataVolunteer = SocketConnection.formatMessage(null, volunteer)
                      for (let volunteerSocketId of volunteerSocketIds) {
                        ws.to(volunteerSocketId).emit('pairing', dataVolunteer)
                      }
                      RedisConnection.deleteOneOfList(topicId, parseId)
                      ws.emit('pairing', dataVolunteer)
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
        .catch((reason) => {
          ws.disconnect();
        });
    })
  }
  //Volunteer set mode free time
  static freeTimeMode(ws) {
    ws.on('freeTimeMode', (data) => {
      SocketConnection.checkAccessSocket(ws).then((authorId) => {
        console.log(authorId)
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
        .catch((reason) => {
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
      console.log(ws.id + " disconnected by reason: " + reason);
      RedisConnection.getData(userId, process.env.INFO_USER).then((data) => {
        RedisConnection.getData(userId, process.env.KEY_SOCKET).then((wsIds) => {
          if (wsIds != null && wsIds.length > 1) {
            if (wsIds.indexOf(ws.id) > -1) {
              wsIds.splice(wsIds.indexOf(ws.id), 1)
              RedisConnection.setData(userId, process.env.KEY_SOCKET, wsIds)
            }
          }
          else {
            RedisConnection.deleteKey(userId, process.env.KEY_SOCKET)
            RedisConnection.expireHash(userId, 20)
            if (data != null) {
              if (data.group !== null && data.group !== undefined) {
                data.group.map((gr) => {
                  RedisConnection.deleteOneOfList(gr, userId)
                  RedisConnection.getList(gr).then((listUsers) => {
                    ws.to(gr).emit('listUserOnline', listUsers)
                  })
                })
              }
            }
          }
        })
      })
    });
  }
  //check authencation request socket
  static checkAccessSocket(ws) {
    let promise = new Promise((resolve, reject) => {
      let token = ws.handshake.auth.token;
      let userId = Authentication.checkToken(token);
      if (userId != null) {
        resolve(userId)
      }
      else {
        resolve(null)
      }
    })
    return promise
  }
}
