const { Router } = require("express");
const { validationResult } = require("express-validator");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");

const router = Router();

router.get("/", auth, (req, res) => {
  res.render("add", {
    title: "Новый курс",
    isAdd: true,
  });
  // res.sendFile(path.join(__dirname, "views", "about.html"));
});

router.post("/", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // req.flash("registerError", errors.array()[0].msg);
    return res.status(422).render("add", {
      title: "Новый курс",
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
      },
    });
  }

  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user._id,
  });

  try {
    await course.save();
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
