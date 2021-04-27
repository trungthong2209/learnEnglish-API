import express from "express";
import RouteHelper from "../Helpers/RouteHelper.js";
import PublicMessageController from "../Controllers/PublicMessageController.js";
import Authentication from "../Helpers/Authencation.js";
const router = express.Router();
router.get("/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let authorId = user.entity._id;
        let groupId = req.params.id;
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
