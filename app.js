const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("database connected successfully...");
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

app.listen(8080, () => {
  console.log("lisnening on port 8080....");
});

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

//index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});

  // console.log(allListings);
  res.render("listings/index.ejs", { allListings });
});

//new Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  id = id.trim();
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });

  res.redirect("/listings");
});
//create Route
app.post("/listings", async (req, res) => {
  let newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("listings");
});
//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  id = id.trim();
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  res.redirect("/listings");
});

//Root Route
app.get("/", (req, res) => {
  res.send("welcome to root page");
  res.redirect("/listings");
});
