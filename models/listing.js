const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Listingschema = new schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1208521481/photo/mountain-landscape-with-trees-and-two-tents-in-the-turkish-national-park-aladag-in-summer-day.webp?a=1&b=1&s=612x612&w=0&k=20&c=924Gj2eSZU8gERBGyMihNrWWdkdrWVJan-Gx_4Idrbs=",
    },
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", Listingschema);
module.exports = Listing;
