const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const homeRoutes = require("./routes/home");
const coursesRoutes = require("./routes/courses");
const addRoutes = require("./routes/add");
const cartRoutes = require("./routes/cart");
const User = require("./models/user");

const app = express();

const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs"
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("5e871fbcf947fc5b036730b6");
    req.user = user;
    next();
  } catch (error) {
    console.log(err);
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/", homeRoutes);
app.use("/courses", coursesRoutes);
app.use("/add", addRoutes);
app.use("/cart", cartRoutes);

async function start() {
  try {
    const password = "1eZnn84yJ116tRjr";
    const url = `mongodb+srv://klyov:${password}@cluster0-o39g5.mongodb.net/shop`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    const candidate = await User.findOne();

    if (!candidate) {
      const user = new User({
        email: "klyov.work@gmail.com",
        name: "klyov",
        cart: { items: [] }
      });
      await user.save();
    } else {
    }

    app.listen(PORT, () => {
      console.log(`listen port: ${PORT}`);
    });
  } catch (err) {
    console.log(err, "err connect to db");
  }
}

start();
