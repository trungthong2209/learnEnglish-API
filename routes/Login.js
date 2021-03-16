import express from "express";
import Login from '../Controller/Login.js'
import RouteHelper from "../Helper/RouteHelper.js"
import Register from '../Controller/Register.js'
const router = express.Router();
router.post('/register', async(req, res) => {
    let data = req.body;
    Register.register(data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.post('/login', async(req, res) => {
    let data = req.body;
    Login.checkLogin(data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
export default router;