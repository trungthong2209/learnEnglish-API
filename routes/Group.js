import express from "express";
import RouteHelper from "../Helpers/RouteHelper.js";
import Group from "../Controllers/GroupController.js";
import Authentication from "../Helpers/Authencation.js";
const router = express.Router();
router.get("/", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            Group.getAllGroup()
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.get("/getGroupsById/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let groupId = req.params.id;
            Group.getGroupById(groupId)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.get("/getGroupsByTopicId/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let topicId = req.params.id;
            Group.getGroupByTopicId(topicId)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.post("/editgroup", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let data = req.body;
            Group.editGroup(data)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.get("/getGroupsByUserId/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = req.params.id;
            Group.getDetailGroupByUserId(userId)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.post("/insert-group", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let data = req.body;
            data.userCreate = user.entity._id;
            data.managerId = user.entity._id;
            Group.insertGroup(data).then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    console.log(err)
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.post("/upload-files/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {        
    Group.uploadFiles(req, res).then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    console.log(err)
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
});
export default router;
