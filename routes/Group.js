import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import Group from "../Controller/GroupController.js";
import Authentication from "../Helper/Authencation.js";
const router = express.Router();
// router.get("/get-all-group", async (req, res) => {
//     Authentication.checkAccess(null, req).then((user) => {
//             Frame.getAllFrame()
//                 .then((httpStatus) => {
//                     RouteHelper.processResponse(res, httpStatus);
//                 })
//                 .catch((err) => {
//                     RouteHelper.processErrorResponse(res, err);
//                 });
//         })
//         .catch((err) => {
//             RouteHelper.noAccessToRoute(res);
//         });
// });
router.post("/insert-group", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let data = req.body;
            data.userCreate = user.entity._id;
            Group.insertGroup(data).then((httpStatus) => {
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

export default router;
