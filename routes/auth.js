const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const truePass = await bcrypt.compare(password, candidate.password);

      if (truePass) {
        const user = candidate;
        req.session.user = user;
        req.session.isAuth = true;

        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            res.redirect("/");
          }
        });
      } else {
        req.flash("loginError", "Неверный пароль");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginError", "Такого пользователя не существует");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(err);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, repeat, name } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash("registerError", "Пользователь с таким email уже существует");
      res.redirect("/auth/login#register");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: {
          items: [],
        },
      });
      await user.save();
      res.redirect("/auth/login#login");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
