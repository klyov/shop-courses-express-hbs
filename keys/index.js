if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod.prod");
} else {
  module.exports = require("./keys.dev");
}
