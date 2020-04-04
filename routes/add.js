const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");

const router = Router();

router.get("/", auth, (req, res) => {
  res.render("add", {
    title: "Новый курс",
    isAdd: true
  });
  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

router.post("/", async (req, res) => {
  // console.log(req.body);

  //  const course = new Course(req.body.title, req.body.price, req.body.img);
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user._id
  });

  try {
    await course.save();
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }

  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

module.exports = router;
