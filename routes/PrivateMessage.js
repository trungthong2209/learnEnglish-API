import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import PrivateMessageController from "../Controller/PrivateMessageController.js";
import Authentication from "../Helper/Authencation.js";
const router = express.Router();
router.get("/", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let authorId = user.entity._id;
        let recipientId = req.body.recipientId
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
