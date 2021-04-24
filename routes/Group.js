import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import Group from "../Controller/GroupController.js";
import Authentication from "../Helper/Authencation.js";
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
router.get("/getGroupsById", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let groupId = req.body._id;
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
router.post("/upload-files", async (req, res) => {
            Group.uploadFiles(req).then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    console.log(err)
                    RouteHelper.processErrorResponse(res, err);
                });
});
export default router;
