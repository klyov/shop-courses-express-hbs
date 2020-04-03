const { Router } = require("express");
// const User = require("../models/user");
const Course = require("../models/course");

const router = Router();

function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.courseId.transform(),
    count: c.count
  }));
}

function computePrice(courses) {
  return courses.reduce((acc, val) => acc + val.count * val.price, 0);
}

router.post("/add", async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect("/cart");
});

router.get("/", async (req, res) => {
  //   const cart = await Cart.fetch();

  const user = await req.user.populate("cart.items.courseId").execPopulate();

  const courses = mapCartItems(user.cart);

  res.render("cart", {
    title: "Корзина",
    isCart: true,
    courses: courses,
    price: computePrice(courses)
  });
});

router.delete("/remove/:id", async (req, res) => {
  // const cart = await Cart.remove(req.params.id);

  await req.user.removeFromCart(req.params.id);

  const user = await req.user.populate("cart.items.courseId").execPopulate();

  const courses = mapCartItems(user.cart);

  const cart = {
    courses,
    price: computePrice(courses)
  };

  res.status(200).json(cart);
});

module.exports = router;
