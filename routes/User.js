import express from "express";
import Login from '../Controllers/LoginController.js'
import RouteHelper from "../Helpers/RouteHelper.js"
import UserController from '../Controllers/UserController.js'
import Authentication from "../Helpers/Authencation.js";
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
router.get('/profile/:id', async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = req.params.id;;
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