import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import PublicMessageController from "../Controller/PublicMessageController.js";
import Authentication from "../Helper/Authencation.js";
const router = express.Router();
router.get("/", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let authorId = user.entity._id;
        let groupId = req.body.groupId
        PublicMessageController.getPublicMessage(authorId, groupId)
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
