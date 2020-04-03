const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  courses: [
    {
      course: {
        type: Object,
        requied: true
      },
      count: {
        type: Number,
        requied: true
      }
    }
  ],
  user: {
    name: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = model("Order", orderSchema);
