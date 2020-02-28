//To run this application refer to the readme.txt file, or follow the steps below
//run "node server.js"
//In a modern web browser navigate to "locahost:9000"

const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/libraries/'));
app.use('/libraries', express.static('libraries'));

app.use(express.static(__dirname + '/icons/'));
app.use('/icons', express.static('icons'));

app.use(express.static(__dirname + '/Images'));
app.use('/Images', express.static('Images'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const ObjectID = require('mongodb').ObjectID;
var dbResult;
var db;
var client;
const uri = "mongodb://localhost:27017/FinalProject" //Local connection string
const MongoClient = require('mongodb').MongoClient;
client = new MongoClient(uri, { useNewUrlParser: true });
var returnData;
var path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Database connected to
client.connect(err => {
  //db = client.db("FinalProject");
  app.listen(9000, '0.0.0.0', () => {
    console.log('listening on 9000')
  })
});



app.get('/index', async function (req, res) {
  let db = await MongoClient.connect(uri);
  let dbo = db.db("FinalProject");
  var cookies = req.cookies; //Get cookies
  if (cookies && cookies.sessionToken) { //If cookies and session token exist
    let userSessionToken = cookies.sessionToken;
    //Attempt to find session token in database
    var array = await dbo.collection("userSession").findOne({ "sessionID": userSessionToken });
    if (array != null) {
      res.sendFile(path.join(__dirname + '/index.html'));
      await db.close();
      return;
    }

  }
  else {
    await db.close();
    res.status(403);
    res.redirect("/login");
    res.send();
    return;
  }
});

//Get Endpoint for login page
app.get('/login', (req, res) => {
  //delete session
  res.cookie('sessionToken', "", { sameSite: true });
  res.contentType("html");
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.get("/register", (req, res) => {
  res.contentType("html");
  res.sendFile(path.join(__dirname + '/register.html'));
});

//Async function to get the targets for the production lines
app.get("/getTargetsAsync", async function (req, res) {
  let dbo = await (await MongoClient.connect(uri)).db("FinalProject");
  //let dbo = db.db("FinalProject");
  let array = await dbo.collection("targets").find({}, { projection: { line: 1, target: 1 } }).toArray();
  res.json(array);
  await db.close();
});

//Async function to return the users in the database (does not return passwords)
app.get("/usersasync", async function (req, res) {
  let db = await MongoClient.connect(uri);
  let dbo = db.db("FinalProject");
  let array = await dbo.collection("users").find({}, { projection: { user: 1, status: 1 } }).toArray();
  console.log(array);
  res.json(array);
  await db.close();
});

app.get("/getPieDataAsync", async function (req, res) {
  let db = await MongoClient.connect(uri);
  let dbo = db.db("FinalProject");
  let array = await dbo.collection("partsProduced").find({}, { projection: { amount: 1, name: 1 } }).toArray();
  res.json(array);
  await db.close();
});

//Endpoint for deleting users
app.post('/delete', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");
    console.log("delete POST request recieved");
    console.log(req.body.id);
    var id = req.body.id;
    dbo.collection("users").deleteOne({ _id: new mongo.ObjectId(id) }, function (err, obj) {
      if (err) throw err;
      console.log("1 user deleted");
      // db.close();
    });
    //Go back to homepage
    res.redirect('/')
  })
})

app.post('/deleteAsync', async function (req, res) {
  let db = await MongoClient.connect(uri);
  let dbo = db.db("FinalProject");
  var id = req.body.id;
  let deleteStatus = await dbo.collection("users").deleteOne({ _id: new mongo.ObjectId(id) });
  res.status(200);
  res.send();
  await db.close();
});

//Endpoint for updating target 2
app.post('/targets2', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    console.log(req.body.target);
    db.collection("targets").updateOne({ "line": "2" }, {
      $set: { "target": req.body.target }, function(err, obj) {
        if (err) throw err;
        console.log("Line updated")
      }
    });
    res.redirect('/targets.html');
  })
})

//Endpoint for updating target 1
app.post('/targets1', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    console.log(req.body.target);
    db.collection("targets").updateOne({ "line": "1" }, {
      $set: { "target": req.body.target }, function(err, obj) {
        if (err) throw err;
        console.log("Line updated")
      }
    });
    res.redirect('/targets.html');
  })
})

//Approval post request made to server
app.post('/approve', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");
    console.log("approve POST request recieved");
    console.log("body of request" + req.body.id);
    var id = req.body.id;
    var newvalues = { $set: { status: "approved" } };
    dbo.collection("users").updateOne({ _id: new mongo.ObjectId(id) }, newvalues, function (err, obj) {
      if (err) throw err;
      // db.close();
    });
    //Go back to homepage
    res.redirect('/approve.html')
  })
});

//Endpoint for posting new requisitions to the server
app.post('/register2', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    //Get username and password
    let myPlaintextPassword = req.body.password;
    let myUser = req.body.user;
    var unique = false;
    //Now check to see if username unique:

    var dbo = db.db("FinalProject");

    //Check if unique
    var test = dbo.collection('users').findOne({ user: myUser }, function (err, result) {
      if (err) throw err;
      if (result == null) {
        unique = true;
        //If no request or request incomplete:
        if (!req || !req.body || !req.body.password) {
          res.type("application/json");
          res.status(400);
          res.send();
          return;
        }
        bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) {
            console.log("Error: " + err);
          }
          bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
            let user = {
              user: req.body.user, //Get username
              password: hash, //Get bcrypt generated hash
              status: req.body.status //Get status
            }
            dbo.collection('users').save(user, (err, result) => { //Register successful
              if (err) return console.log(err)
              console.log('saved to database');
              var response = {
                success: true,
              }
              res.status(200);
              res.type("application/json");
              res.send(response);
              return;
              //res.redirect('/login.html');
            });
          });
        });
      }
      else { //User already exists
        console.log("User already exists");
        res.status(200); //Unauthorised
        res.type("application/json");
        var response = {
          unique: false,
        }
        res.send(response);
        return;
      }
    });
  });
});

//Endpoint for the about page
app.get('/about', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var cookies = req.cookies; //Get cookies
    if (cookies && cookies.sessionToken) { //If cookies and session token exist
      let userSessionToken = cookies.sessionToken;
      var dbo = db.db("FinalProject");
      //Attempt to find session token in database
      dbo.collection("userSession").findOne({ "sessionID": userSessionToken }, (function (err, result) {
        console.log("Valid user session");
        res.sendFile(path.join(__dirname + '/about.html'));
      }));
    }
    else {
      res.status(403);
      res.redirect("/login");
      res.send();
      return;
    }
  });
});

//Endpoint for the help page
app.get('/help', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var cookies = req.cookies; //Get cookies
    if (cookies && cookies.sessionToken) { //If cookies and session token exist
      let userSessionToken = cookies.sessionToken;
      var dbo = db.db("FinalProject");
      //Attempt to find session token in database
      dbo.collection("userSession").findOne({ "sessionID": userSessionToken }, (function (err, result) {
        console.log("Valid user session");
        res.sendFile(path.join(__dirname + '/help.html'));
      }));
    }
    else {
      res.status(403);
      res.redirect("/login");
      res.send();
      return;
    }
  });
});

//Endpoint for the targets page
app.get('/targets', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var cookies = req.cookies; //Get cookies
    if (cookies && cookies.sessionToken) { //If cookies and session token exist
      let userSessionToken = cookies.sessionToken;
      var dbo = db.db("FinalProject");
      //Attempt to find session token in database
      dbo.collection("userSession").findOne({ "sessionID": userSessionToken }, (function (err, result) {
        console.log("Valid user session");
        res.sendFile(path.join(__dirname + '/targets.html'));
      }));
    }
    else {
      res.status(403);
      res.redirect("/login");
      res.send();
      return;
    }
  });
});


//Endpoint for the approve page
app.get('/approve', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var cookies = req.cookies; //Get cookies
    if (cookies && cookies.sessionToken) { //If cookies and session token exist
      let userSessionToken = cookies.sessionToken;
      var dbo = db.db("FinalProject");
      //Attempt to find session token in database
      dbo.collection("userSession").findOne({ "sessionID": userSessionToken }, (function (err, result) {
        console.log("Valid user session");
        res.sendFile(path.join(__dirname + '/approve.html'));
      }));
    }
    else {
      res.status(403);
      res.redirect("/login");
      res.send();
      return;
    }
  });
});

//Generates a random salt
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


//Server side login endpoint
app.post('/login2', (req, res) => {
  let myPlaintextPassword = req.body.password;
  let myUserName = req.body.user;

  //Connect to database
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");

    if (!req || !req.body || !req.body.password || !req.body.user) {
      res.type("application/json");
      res.status(400)
      res.send();
      return true;
    }
    try {
      //Try to find user in database
      dbo.collection("users").findOne({ "user": myUserName }, (function (err, result) {
        if (err) { //Error occured
          console.log(err);
          return;
        }
        if (result == null) { //User not found in database
          console.log("Result does not exist");
          res.status(200); //Unauthorised
          res.type("application/json");

          var response = {
            authorised: false,
          }
          res.send(response);
          return;
        }
        //Compare password to database record, hashing and salting in the process
        bcrypt.compare(myPlaintextPassword, result.password, function (err, passwordMatched) {

          if (passwordMatched == true) { //Valid username and password

            //Generate session token
            var session = {
              sessionID: generateToken(),
              userID: result._id.toString()
            }

            //Save new user session to database
            dbo.collection("userSession").save(session, function (err, sessionResult) {
              if (err) {
                console.log("Error occured saving user session to db: " + err);
              }
              res.type("application/json");
              res.status(200);
              //Save user session to clients cookies:
              res.cookie('sessionToken', session.sessionID, { sameSite: true });
              var response = {
                success: true
              }
              res.send(response);
              return;
            })

          } else {
            //Wrong password entered:
            console.log("User entered wrong password")
            res.status(200); //Unauthorised
            res.type("application/json");

            var response = {
              authorised: false,
            }
            res.send(response);
            return;
          }
        });
      }));
    } catch{
      console.log("Cannot find record");
    }
  });
});

// Route not found (404)
app.use(function (req, res, next) {
  return res.status(404).sendFile(__dirname + '/login.html');
});