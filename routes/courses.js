const { Router } = require("express");
const { validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Course = require("../models/course");
const { courseValidators } = require("../utils/validators");
const router = Router();

function transformCourses(courses) {
  const copyCourses = [];
  for (let i = 0; i < courses.length; i++) {
    copyCourses.push(courses[i].transform());
  }
  return copyCourses;
}

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("userId", "email name");

    res.render("courses", {
      title: "Курсы",
      isCourses: true,
      courses: transformCourses(courses),
      userId: req.user ? req.user._id.toString() : null,
    });
  } catch (error) {
    console.log(error);
  }

  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  try {
    const course = await Course.findById(req.params.id).lean();

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    res.render("course-edit", {
      title: `Редактировать ${course.title}`,
      course,
      error: req.flash("error"),
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    res.render("course", {
      layout: "empty",
      title: `Курс: ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/edit", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).redirect(`courses/${id}/edit?allow=true`);
  }

  try {
    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }
    Object.assign(course, req.body);
    await course.save();

    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
