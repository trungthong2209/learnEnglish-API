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
router.post("/createCourse", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userEntity = user.entity._id;
        let data = req.body;
        Courses.createCourse(data, userEntity)
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
router.post("/insertCourseQuestion/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userEntity = user.entity;
        Courses.insertCourseQuestion(req, res, userEntity)
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
router.post("/insertCourseVocabulary/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userEntity = user.entity;
        Courses.insertCourseVocabulary(req, res, userEntity)
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
router.get("/getCourseVocabulary/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let courseId = req.params.id;
            Courses.getCourseVocabulary(courseId)
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
router.get("/getCourseQuestion/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            let courseId = req.params.id;
            Courses.getCourseQuestion(courseId)
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
router.post("/tickVocabularyOfUser", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = user.entity._id;
        let data = req.body;
        Courses.tickVocabularyOfUser(userId, data)
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
router.get("/tickVocabularyOfUser/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = user.entity._id;
        let courseId = req.params.id;
        Courses.getTickVocabularyOfUser(courseId, userId)
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
router.get("/getCourseByUserId/:id", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
        let userId = req.params.id;
        Courses.getCourseByUserId(userId)
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
router.get("/highscores", async (req, res) => {
    Authentication.checkAccess(null, req).then((user) => {
            Courses.getScore()
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
