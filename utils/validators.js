const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.registerValidators = [
  check("email")
    .isEmail()
    .withMessage("Введите корректный email")
    .custom(async (val, { req }) => {
      try {
        const user = await User.findOne({ email: val });
        if (user) {
          return Promise.reject("Такой email уже занят");
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  check("password", "Пароль должен быть минимум 6 символов")
    .isLength({ min: 6, max: 120 })
    .isAlphanumeric()
    .trim(),
  check("confirm", "Пароль должен быть минимум 6 символов")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Пароли должны совпадать");
      }
      return true;
    })
    .trim(),
  check("name", "Имя должно быть минимум 3 символа")
    .isLength({ min: 3, max: 120 })
    .isAlphanumeric()
    .trim(),
];

exports.loginValidators = [
  check("email")
    .isEmail()
    .withMessage("Введите корректный email")
    .custom(async (val, { req }) => {
      try {
        const { user } = req.body;
        if (!user || user.email !== req.body.email) {
          return Promise.reject("Такого пользователя не существует");
        }
        return true;
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  check("password", "Пароль должен быть минимум 6 символов")
    .isLength({ min: 6, max: 120 })
    .isAlphanumeric()
    .custom(async (val, { req }) => {
      try {
        const { user, password } = req.body;
        if (user) {
          const truePass = await bcrypt.compare(password, user.password);
          if (!truePass) {
            return Promise.reject("Неверный пароль");
          }
          return true;
        }
      } catch (error) {
        console.log(error);
      }
    })
    .trim(),
];

exports.courseValidators = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("Минимальная длина названия 3 символа")
    .trim(),
  check("price").isNumeric().withMessage("Введите корректную цену"),
  check("img", "Введите коректный url картинки").isURL().trim(),
];
