const express = require("express");
const session = require("express-session");
const User = require("../database/models/user");
const router = express.Router();
const Password = require('../services/Password');
const Cookie = require('../services/Cookies');
const Auth = require('../services/Auth');

router.post("/create",async (req, res) => {
  const user = new User({
    username: req.body.username,
    pwHash: req.body.pwHash,
    email: req.body.email
  })

  try{
    const newUser = await user.save();
    //status 201 for successful create
    res.status(201).json(newUser);
  }
  catch(err){
    res.status(500).json({message: err.message});
  }
});
router.post("/Login", async(req,res) => {

  try{
    const user = await User.findOne({username: req.body.username});
    if(user == null) throw new Error();

    if(Password.hashPassword(req.body.password) == user.pwHash)
    {
      let cookie = req.session.cookie;
      cookie.expires = false;
      cookie = Auth.LogIn(req.body.username);
      session.Cookie = cookie;
      res.status(200).json("Successfull login");
    }
    else{
      throw new Error("Wrong password");
    }
  }
  catch(err){
    console.log(err);
  }
});
router.post("/LogOut", async(req, res) =>{
  session.Cookie = null;
  res.status(200).json("Successful LogOut");
})
router.post("/Register", async(req,res) => {
  try{
    let user = await User.findOne({username: req.body.username});
    if(user != null) {
      throw new Error("User in database");
    }
    user = await User.findOne({email: req.body.username});
    if(user != null) {
      throw new Error("User in database");
    }

    user = new User({
      username: req.body.username,
      email: req.body.username,
      pwHash: Password.hashPassword(req.body.password)
    });
    await user.save();
    let cookie = Auth.LogIn(req.body.username);
    session.Cookie = cookie;
    res.status(200).json("Registered successfully");
  }
  catch(err){
    res.status(500).json(err.message);
  }
});

router.delete("/delete/:id", async (req, res) => {
  if(Auth.isLogged() == false) res.status(400).json('Access denied');
  else{
    try{
      const user = await User.findById(req.params.id);
      if(user == null) return res.status(404).json({"message": "Cannot find user"});
      await user.remove();
      res.status(200).json({"message": "User deleted"});
    }
    catch(err){
      res.status(500).json({message: err.message});
    }
  }
  
});

router.put("/update/:id",async (req, res) => {
  if(Auth.isLogged() == false) res.status(400).json('Access denied');
  else{
    try{
      const user = await User.findById(req.params.id);
      user.email = req.body.email;
      user.username = req.body.username;
      const editedUser = await user.save();
      res.json(editedUser);
    }
    catch(err){
      res.status(500).json({message: err.message});
    }
  }
  
})

router.get("/:id",async (req, res) => {
  if(Auth.isLogged() == false) res.status(400).json('Access denied');
  else{
    try{
      const user = await User.findById(req.params.id);
      res.status(200).json(user);
    }
    catch(err){
      res.status(500).json({message: err.message});
    }
  }
  
});


router.get("/",async(req, res) => {
  if(Auth.isLogged() == false) res.status(400).json('Access denied');
  else{
    try{
      const users = await User.find();
      res.json(users);
    }
    catch(err){
      res.status(500).json({message: err.message});
    }
  }
  
});


module.exports = router;
