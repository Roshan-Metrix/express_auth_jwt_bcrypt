const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const path = require("path");
const userModel = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { username, password, email, age } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let registeredUser = await userModel.create({
        username,
        password: hash,
        email,
        age,
      });
      let token = jwt.sign({ email }, "roshannnn");
      res.cookie("token", token);
      // res.send(registeredUser);
      if (registeredUser) {
        res.redirect("home");
      }
    });
  });
});

app.get("/home",isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({ email:req.user.email })
  console.log(user);
  res.render("home",{ user });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found");
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: user.email }, "roshannnn");
      res.cookie("token", token);
      res.redirect("home");
    } else {
      res.status(400).send("Invalid password");
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.get("/delete",isLoggedIn, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Unauthorized");

    const decoded = jwt.verify(token, "roshannnn");
    const deletedUser = await userModel.findOneAndDelete({
      email: decoded.email,
    });

    if (deletedUser) {
      res.clearCookie("token");
      res.redirect("/");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    res.status(500).send("Error deleting account.");
  }
});

function isLoggedIn(req, res, next){
  if(!req.cookies.token){
    return res.redirect('login');
  } else {
    try {
      let data = jwt.verify(req.cookies.token,"roshannnn");
      req.user = data;
      next();
    }catch(err){
      return res.send("Invalid token, please log in again");
    }
  }
}


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
