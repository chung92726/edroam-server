import express from "express";
import cors from "cors";
import fs from "fs";
import mongoose from "mongoose";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import passport from "./passport";
import session from "express-session";

const morgan = require("morgan");
require("dotenv").config();

const csrfProtection = csrf({ cookie: true });
// var parseForm = bodyParser.urlencoded({ extended: false })

// create express app
const app = express();

// Configure the express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a strong secret in a .env file or environment variable
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // Set cookie expiry to 24 hours
    },
  })
);

// connect do db
// mongoose
//   .connect(process.env.DATABASE, {
//     authSource: 'admin',
//     user: process.env.DB_USER,
//     pass: process.env.DB_PASSWORD,
//   })
//   //   {
//   //   authSource: 'admin',
//   //   user: 'Frankie',
//   //   pass: process.env.DB_PASSWORD,
//   // })
//   .then((e) => console.log('DB connected'))
//   .catch((err) => console.log('DB CONNECTION ERROR: '))

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // authSource: 'admin',
    // user: process.env.DB_USER,
    // pass: process.env.DB_PASSWORD,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// apply middlewares : functions that perform tasks on incoming requests before they reach the routes and send back responses

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
// app.use((req, res, next) => {
//   console.log('this is my middleware')
//   next()
// })

//route
fs.readdirSync("./routes").map((r) => {
  app.use("/api", require(`./routes/${r}`));
});

// csrf
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// app.get('/', (req, res) => {
//   res.send('you hit server endpoint')
// })

// port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
