const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("database connected successfully...");

    // mongoose.connect(mongo_url);
    // console.log("database connected successfully...");
    // const result = Listing.deleteMany({ price: null });
    // console.log(`${result.deletedCount} listings deleted`);
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// app.get("/testlisting", async (req, res) => {
//   let sampleListings = new Listing({
//     title: "my new villa",
//     description: "by the beach",
//     price: 1200,
//     location: "goa",
//     country: "India",
//   });

//   await sampleListings.save();
//   console.log("sample list saved...");
//   res.send("successful testing");
// });

//middleware for schema validation
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new expressError(404, error);
  } else {
    next();
  }
};
//index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});

    // console.log(allListings);
    res.render("listings/index.ejs", { allListings });
  }),
);

//new Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    id = id.trim();
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }),
);

//Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new expressError(404, "send valid data for listing");
    }

    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    res.redirect("/listings");
  }),
);
//create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let newlisting = new Listing(req.body.listing);

    await newlisting.save();
    res.redirect("listings");
  }),
);
//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    id = id.trim();
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

//Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
  }),
);

// Root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 handler
app.all("/*splat", (req, res, next) => {
  next(new expressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

//delete null values from database
// app.get("/delete-null-prices", async (req, res) => {
//   const result = await Listing.deleteMany({ price: null });

//   console.log(result);
//   res.send(`${result.deletedCount} listings deleted`);
// });

app.listen(8080, () => {
  console.log("listening on port 8080....");
});
