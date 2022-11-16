const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
loginCheck(passport);
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nocache = require('nocache');
const multer = require("multer");


// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Connected the database"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(logger('dev'));
app.use(cookieParser());
app.use(nocache());

//BodyParsing
app.use(express.urlencoded({ extended: false }));

// session configurations
app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  next();
});
app.use(
  session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
  })
);

// photo and other file upload using multer
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "public/img/product_img");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

app.use(multer({ storage: fileStorage }).array("imgUrl", 5));


// static folder
app.use("/public", express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/", require("./routes/login"));

const PORT = process.env.PORT || 7000;

app.listen(PORT, console.log("Server has started at port " + PORT));