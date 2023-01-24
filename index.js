const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const { reset } = require("nodemon");
// const { monitorEventLoopDelay } = require("perf_hooks");
const Models = require("./models/models");
const { check, validationResult } = require("express-validator");

const Movie = Models.Movie;
const User = Models.User;

const cors = require("cors");
let allowedOrigins = ["http://localhost:1234", "http://testsite.com"];


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesnt allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);


const passport = require("passport");
require("./passport");

// mongoose.connect("mongodb://localhost:27017/myFlixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });



(fs = require("fs")), (path = require("path"));
bodyParser = require("body-parser");
uuid = require("uuid");
morgan = require("morgan");

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require("./auth")(app);


//Create
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    let hashedPassword = User.hashPassword(req.body.Password);

    User.findOne({ Username: req.body.Username }).then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        User.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch(e=>console.log(e))
  }
);

app.put(
  "/users/:name/:movies/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { Username: req.params.name,
      Movies: req.params.movies,
      id: req.params._id},
      {
        $push: { favoriteMovies: req.params.id },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Read

app.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.send("Welcome to my Kung Fu film app!");
});

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return Movie.find()
      .then((result) => {
        res.json(result);
      })
      .catch(e=>console.log(e));
  }
);

app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { Title } = req.params;
    return Movie.find({ Title: Title })
      .then((movies) => res.status(200).json(movies))
      .catch((e) => console.error(e));
  }
);

app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { genreName } = req.params;
    Movie.find({ "Genre.Name": genreName })
      .then((results) => res.status(200).json(results))
      .catch((e) => console.error(e));
  }
);

app.get(
  "/movies/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { directorName } = req.params;
    Movie.find({ "Director.Name": directorName })
      .then((results) => res.status(200).json(results))
      .catch((e) => console.error(e));
  }
);

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.find()
      .then((User) => {
        res.status(201).json(User);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/users/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ Username: req.params.name })
      .then((results) => res.status(200).json(results))
      .catch((e) => console.error(e));
  }
);

//Update
app.put(
  "/users/:name",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let hashedPassword = User.hashPassword(req.body.Password);
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    User.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

app.post(
  "/users/:name/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { Username: req.params.name },
      {
        $push: { favoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Delete

app.delete(
  "/users/:name/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { Username: req.params.name,
      movies: req.params.movies,
    MovieID: req.params.MovieID },
      {
        $pull: { favoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

app.delete(
  "/users/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOneAndRemove({ Username: req.params.name })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.name + " was not found");
        } else {
          res.status(200).send(req.params.name + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use("/MyDocumentation", express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;

app.listen(port,() => {
 console.log('Listening on Port ' + port);
});
