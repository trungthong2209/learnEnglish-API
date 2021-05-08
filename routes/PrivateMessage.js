import express from "express";
import RouteHelper from "../Helpers/RouteHelper.js";
import PrivateMessageController from "../Controllers/PrivateMessageController.js";
import Authentication from "../Helpers/Authencation.js";
const router = express.Router();
router.get("/all", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let authorId = user.entity._id;
        PrivateMessageController.getAllMessages(authorId)
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
router.get("/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let authorId = user.entity._id;
        let recipientId = req.params.id;
        PrivateMessageController.getPrivateMessage(authorId, recipientId)
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
export default router;
