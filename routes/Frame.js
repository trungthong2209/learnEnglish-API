import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import Frame from "../Controller/FrameController.js";
import Authentication from "../Helper/Authencation.js";
const router = express.Router();
router.get("/get-all-frame", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            Frame.getAllFrame()
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res);
        });
});
router.post("/insert-frame", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let data = req.body;
            data.userCreate = user.entity._id;
            Frame.insertFrame(data)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res);
        });
});
router.put("/update-frame", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let data = req.body;
            Frame.updateFrame(data)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res);
        });
});
router.delete("/delete-frame-id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let id = req.body._id;
            Frame.deleteFrame(id)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res);
        });
});
router.get("/get-frame-id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let id = req.body._id;
            Frame.getByIdFrame(id)
                .then((httpStatus) => {
                    RouteHelper.processResponse(res, httpStatus);
                })
                .catch((err) => {
                    RouteHelper.processErrorResponse(res, err);
                });
        })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res);
        });
});
export default router;
