import express from "express";
import Login from '../Controller/LoginController.js'
import RouteHelper from "../Helper/RouteHelper.js"
import UserController from '../Controller/UserController.js'
const router = express.Router();
router.get('/', async (req, res) => {
    res.send('Welcome to Learn English Project')
})
router.post('/register', async (req, res) => {
    let data = req.body;
    UserController.register(data).then((httpStatus) => {
        RouteHelper.processResponse(res, httpStatus);
       })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.post('/login', async (req, res) => {
    let data = req.body;
    Login.checkLogin(data).then((httpStatus) => {
             RouteHelper.processResponse(res, httpStatus);
    })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
router.post('/logout', async (req, res) => {
    Login.logOut(req).then((httpStatus) => {
             RouteHelper.processResponse(res, httpStatus);
    })
        .catch((err) => {
            RouteHelper.processErrorResponse(res, err);
        });
})
export default router;