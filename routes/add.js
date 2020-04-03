const { Router } = require("express");
const router = Router();
const Course = require("../models/course");

router.get("/", (req, res) => {
  res.render("add", {
    title: "Новый курс",
    isAdd: true
  });
  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

router.post("/", async (req, res) => {
  // console.log(req.body);

  const course = new Course(req.body.title, req.body.price, req.body.img);

  await course.save();

  res.redirect("/courses");
  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

module.exports = router;
