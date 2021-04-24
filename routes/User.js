import express from "express";
import Login from '../Controller/LoginController.js'
import RouteHelper from "../Helper/RouteHelper.js"
import UserController from '../Controller/UserController.js'
import Authentication from "../Helper/Authencation.js";
const router = express.Router();

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
router.get('/profile', async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = user.entity._id;
        UserController.getUserById(userId).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
            .catch((err) => {
                RouteHelper.processErrorResponse(res, err);
            });
    })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
})
router.put('/updateProfile', async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let data = req.body;
        let _id = user.entity._id;
        UserController.updateUser(_id, data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
            .catch((err) => {
                RouteHelper.processErrorResponse(res, err);
            });
    })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
})
router.put('/updateRole', async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let data = req.body;
        UserController.updateRole(data).then((httpStatus) => {
            RouteHelper.processResponse(res, httpStatus);
        })
            .catch((err) => {
                RouteHelper.processErrorResponse(res, err);
            });
    })
        .catch((err) => {
            RouteHelper.noAccessToRoute(res, err);
        });
})
export default router;