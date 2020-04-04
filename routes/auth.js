const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const keys = require("../keys");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const router = Router();

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: {
      api_key: keys.SENDGRID_API_KEY,
    },
  })
);

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
      await transporter.sendMail(regEmail(email));
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Забыли пароль",
    error: req.flash("error"),
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Что то пошло не так, повторите попытку позже");
        return res.redirect("/auth/reset");
      }

      const token = buffer.toString("hex");
      const { email } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; // 1 hour exp
        await candidate.save();
        await transporter.sendMail(resetEmail(email, token));
        res.redirect("/auth/login");
      } else {
        req.flash("error", "Такого email нет");
        return res.redirect("/auth/reset");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/password/:token", async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("logineError", "Время жизни токена истекло");
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Новый пароль",
        error: req.flash("error"),
        userId: user._id.toString(),
        token,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/password", async (req, res) => {
  try {
    const { userId, token, password } = req.body;

    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("logineError", "Время жизни токена истекло");
      return res.redirect("/auth/login");
    } else {
      user.password = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      user.save();
      res.redirect("/auth/login");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
