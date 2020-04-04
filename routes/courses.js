const { Router } = require("express");
const auth = require("../middleware/auth");
const Course = require("../models/course");
const router = Router();

function transformCourses(courses) {
  const copyCourses = [];
  for (let i = 0; i < courses.length; i++) {
    copyCourses.push(courses[i].transform());
  }
  return copyCourses;
}

router.get("/", async (req, res) => {
  const courses = await Course.find().populate("userId", "email name");
  // .select("price title")
  // .lean();
  // console.log(courses);

  res.render("courses", {
    title: "Курсы",
    isCourses: true,
    courses: transformCourses(courses)
  });

  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  const course = await Course.findById(req.params.id).lean();

  res.render("course-edit", {
    title: `Редактировать ${course.title}`,
    course
  });
});

router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  res.render("course", {
    layout: "empty",
    title: `Курс: ${course.title}`,
    course
  });
});

router.post("/edit", auth, async (req, res) => {
  const { id } = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body);

  res.redirect("/courses");
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id
    });
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
