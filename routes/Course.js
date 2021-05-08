import express from "express";
import RouteHelper from "../Helpers/RouteHelper.js";
import Courses from "../Controllers/CoursesController.js";
import Authentication from "../Helpers/Authencation.js";
const router = express.Router();
router.get("/", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            Courses.getAllCourse()
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
router.post("/", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userEntity = user.entity;
        Courses.insertCourse(req, res, userEntity)
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
router.delete("/delete-course-id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let id = req.body.courseId;
            Courses.deleteCourse(id)
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
router.get("/get-course-id/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let id = req.params.id;
             Courses.getCourseById(id)
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
