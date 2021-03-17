import express from "express";
import RouteHelper from "../Helper/RouteHelper.js"
import Frame from '../Controller/Frame.js'
const router = express.Router();
router.get('/get-all-frame', async(req, res) => {
    Frame.getAllFrame().then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.post('/insert-frame', async(req, res) => {
    let data = req.body;
    Frame.insertFrame(data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.put('/update-frame', async(req, res) => {
    let data = req.body;
    Frame.updateFrame(data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.delete('/delete-frame-id', async(req, res) => {
    let id = req.body._id;
    Frame.deleteFrame(id).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.get('/get-frame-id', async(req, res) => {
    let id = req.body._id;
    Frame.getByIdFrame(id).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
export default router;