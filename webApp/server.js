//To run this application refer to the readme.txt file, or follow the steps below
//run "node server.js"
//In a modern web browser navigate to "locahost:9000"
const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
var path = require('path');


//Libraries
app.use(express.static(__dirname + '/libraries/')); 
//Help Pages
app.use(express.static(__dirname+ '/helpPages/'));
//Images
app.use(express.static(__dirname + '/Images/'));


app.use(express.static(__dirname + '/icons/'));

app.use(express.static(path.join(__dirname, '/webApp/Images')));

//app.use(express.static(__dirname + '/helpPages')); //Probably not needed
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');


//const ObjectID = require('mongodb').ObjectID;
var client;
//const uri = "mongodb://localhost:27017/FinalProject" //Local connection string
const uri = "mongodb+srv://test:test@cluster0-bcfvz.mongodb.net/test?retryWrites=true&w=majority"; //Cloud connection string
const MongoClient = require('mongodb').MongoClient;
client = new MongoClient(uri, { useNewUrlParser: true });
var path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var dbo;

//Database connected to
client.connect(err => {
  dbo = client.db("FinalProject"); //Set database
  app.listen(9000, '0.0.0.0', () => {
    console.log('listening on 9000')
  })
});

app.get('/helpAsync', async function (req, res) {
  var cookies = req.cookies; //Get cookies
  if (cookies && cookies.sessionToken) { //If cookies and session token exist
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/help.html'));
      return
    }
  }
});

app.get('/index', async function (req, res) {
  var cookies = req.cookies; //Get cookies
  if (cookies && cookies.sessionToken) { //If cookies and session token exist
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/index.html'));
      return;
    }
  }
  else{
    res.contentType("html");
    res.sendFile(path.join(__dirname + '/login.html'));
  }
});

//Get Endpoint for login page
app.get('/login', (req, res) => {
  res.cookie('sessionToken', "", { sameSite: true });   //delete session
  res.contentType("html");
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.get("/register", (req, res) => {
  res.contentType("html");
  res.sendFile(path.join(__dirname + '/register.html'));
});

//Async function to get the targets for the production lines
app.get("/getTargetsAsync", async function (req, res) {
  let array = await dbo.collection("targets").find({}, { projection: { line: 1, target: 1 } }).toArray();
  res.json(array);
});

//Async function to return the users in the database (does not return passwords)
app.get("/usersasync", async function (req, res) {
  let array = await dbo.collection("users").find({}, { projection: { user: 1, status: 1 } }).toArray();
  res.json(array);
});

//Gets all parts in the database
app.get("/partsasync", async function (req, res) {
  let array = await dbo.collection("parts").find({}, { projection: { name: 1, description: 1 } }).toArray();
  res.json(array);
});

//Gets confirmation data either depending on name or returning all data in database
app.post("/getConfData", async function (req, res){ //Gets confirmations with the specified name
  var array;
  if(req.body.name==null){
    array = await dbo.collection("partsProduced").find({}, { projection: { amount: 1, name: 1, date: 1 } }).toArray();
  }
  else{
    array = await dbo.collection("partsProduced").find({name: req.body.name}, { projection: { amount: 1, name: 1, date: 1 } }).toArray();
  }
  res.json(array);
});

app.post('/deleteAsync', async function (req, res) {
  let deleteStatus = await dbo.collection("users").deleteOne({ _id: new mongo.ObjectId(req.body.id) });
  res.status(200);
  res.send();
});

app.post('/targetsAsync', async function (req, res) {
  let updateStatus = dbo.collection("targets").updateOne({ "line": req.body.line }, {
    $set: { "target": req.body.target }
  });
  res.status(200);
  res.send();
});

app.post('/confirmPart', async function (req, res) {
  var myobj = { amount: req.body.amount, name: req.body.name, date: req.body.date };
  let updateStatus = dbo.collection("partsProduced").insertOne(myobj);
  res.status(200);
  res.send();
})

app.post('/approveAsync', async function (req, res) {
  var newvalues = { $set: { status: "approved" } };
  let updateStatus = dbo.collection("users").updateOne({ _id: new mongo.ObjectId(req.body.id) }, newvalues);
  res.status(200);
  res.send();
});

//Async function to return the about page
app.get('/aboutAsync', async function (req, res) {
  if (req.cookies && req.cookies.sessionToken) {
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/about.html'));
      return;
    }
  }
});

//Async function to return the about page
app.get('/allConfirmations', async function (req, res) {
  if (req.cookies && req.cookies.sessionToken) {
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/allConf.html'));
      return;
    }
  }
});

function validSession(req) { //Also can move cookie check into this function to minimise endpoint size
  let dbStatus = dbo.collection("userSession").findOne({ "sessionID": req.cookies.userSessionToken });
  if (dbStatus != null) {
    return true;
  }
  else {
    res.status(403);
    res.redirect("/login");
    res.send();
    return;
  }
}

//Endpoint for posting new registrations to the server
app.post('/register2', async function (req, res) {
  //Check if unique
  var userExists = await dbo.collection('users').findOne({ user: req.body.user });
  if (userExists == null && req && req.body && req.body.password) { //User does not exist and request valid
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) console.log("Error: " + err);
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        let user = {
          user: req.body.user, //Get username
          password: hash, //Get bcrypt generated hash
          status: req.body.status //Get status
        }
        var saveStatus = dbo.collection('users').save(user); //Register successful
        if (saveStatus) {
          console.log('saved to database');
          res.status(200);
          res.type("application/json");
          res.send({ success: true, });
          return;
        }
      });
    });
  } else { //User already exists
    res.status(200); //Unauthorised (This should be the correct HTTP code not 200)
    res.type("application/json");
    res.send({ unique: false, });
    return;
  }
});

//Endpoint for the targets page
app.get('/targetsAsync', async function (req, res) {
  if (req.cookies && req.cookies.sessionToken) { //If cookies and session token exist
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/targets.html'));
      return;
    }
  }
});

//Endpoint for the approve page
app.get('/approveAsync', async function (req, res) {
  var cookies = req.cookies; //Get cookies
  if (cookies && cookies.sessionToken) { //If cookies and session token exist
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/approve.html'));
      return;
    }
  }
});

app.get('/confirmProduced', async function (req, res) {
  var cookies = req.cookies; //Get cookies
  if (cookies && cookies.sessionToken) { //If cookies and session token exist
    if (validSession(req)) {
      res.sendFile(path.join(__dirname + '/confirmProduced.html'));
      return
    }
  }
});

//Generates a random salt - Potentially replace with bcrypt for security
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

//Server side login endpoint
app.post('/login2', async function (req, res) {
  if (!req || !req.body || !req.body.password || !req.body.user) {
    res.type("application/json");
    res.status(400)
    res.send();
    return true;
  } try {    //Try to find user in database
    var result = await dbo.collection("users").findOne({ "user": req.body.user });
    if (result == null) { //User not found in database
      res.status(200); //Need to change to correct http code Unauthorised
      res.type("application/json");
      res.send({ success: false, });
      return;
    }
    //Compare password to database record, hashing and salting in the process
    bcrypt.compare(req.body.password, result.password, function (err, passwordMatched) {
      if (passwordMatched == true) { //Valid username and password
        if(result.status != "approved"){
          var response = { success: false }
          res.send(response);
          return;
        }
        var session = { //Generate session token
          sessionID: generateToken(),
          userID: result._id.toString()
        }
        //Save new user session to database
        var saveStatus =  dbo.collection("userSession").save(session);
        if(saveStatus){ //If saved successfully
          res.type("application/json");
          res.status(200);
          res.cookie('sessionToken', session.sessionID, { sameSite: true }); //Save user session to clients cookies:
          var response = { success: true }
          res.send(response);
          return;
        }
      } else { //Password incorrect
        res.status(200); //Need to change to http Unauthorised code
        res.type("application/json");
        res.send({success: false,});
        return;
      }
    });
    } catch{
}
});

app.use(function (req, res, next) { // Route not found (404)
  return res.status(404).sendFile(__dirname + '/login.html');
});