const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const homeRoutes = require("./routes/home");
const coursesRoutes = require("./routes/courses");
const addRoutes = require("./routes/add");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");

const app = express();

const PORT = process.env.PORT || 3000;
const password = "1eZnn84yJ116tRjr";
const MONGODB_URI = `mongodb+srv://klyov:${password}@cluster0-o39g5.mongodb.net/shop`;

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
});

const store = new MongoStore({
  collection: "sessions",
  uri: MONGODB_URI,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "some secret value",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/courses", coursesRoutes);
app.use("/add", addRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`listen port: ${PORT}`);
    });
  } catch (err) {
    console.log(err, "err connect to db");
  }
}

start();
