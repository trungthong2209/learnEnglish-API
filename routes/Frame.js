import express from "express";
import RouteHelper from "../Helper/RouteHelper.js";
import Frame from "../Controller/FrameController.js";
import Authentication from "../Helper/Authencation.js";
const router = express.Router();
router.get("/", async (req, res) => {
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
            RouteHelper.noAccessToRoute(res, err);
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
            RouteHelper.noAccessToRoute(res, err);
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
            RouteHelper.noAccessToRoute(res, err);
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
            RouteHelper.noAccessToRoute(res, err);
        });
});
router.get("/get-frame-id/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let id = req.params.id;
            Frame.getByIdFrame(id)
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
