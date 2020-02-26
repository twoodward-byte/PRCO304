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

//Return content for the index page
app.get('/index', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    //var allowed = false; //Set to false by default
    var cookies = req.cookies;
    if (cookies && cookies.sessionToken) {
      let userSessionToken = cookies.sessionToken;
      var dbo = db.db("FinalProject");
      let result = dbo.collection("userSession").findOne({ "sessionID": userSessionToken }, (function (err, result) {
        console.log("Valid user session");
        //allowed = true; 
        console.log("all checks out ok ");
        res.sendFile(path.join(__dirname + '/index.html'));
      }));
    }
    else {
      console.log("User not logged in, error");
      // allowed =  false;
      res.status(403);
      res.redirect("/login");
      res.send();
      return;
    }
  });
});

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

//Endpoint for the line target data
app.get("/getMyData", function (require, response) {
  MongoClient.connect(uri, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FinalProject");
    dbo.collection("targets").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log("Get my data successful" + result);
      returnData = result;
      response.json(returnData);
      db.close();
    });
  })
});


//Endpoint for sending the users data to the client
app.get("/users", function (require, response) {
  MongoClient.connect(uri, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FinalProject");
    dbo.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      dbResult = result;
      db.close();
    });
    response.json(dbResult);
  })
});


//Endpoint for the pie chart data
app.get("/getPieData", function (require, response) {
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");
    var resultPie;
    dbo.collection("partsProduced").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      resultPie = result;
      db.close();
      response.json(resultPie);
    });
  })
});

//Endpoint for posting new requisitions to the server
app.post('/register', (req, res) => {
  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");
    //console.log(req.body)
    dbo.collection('users').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  })
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
})

//Endpoint for posting new requisitions to the server
app.post('/register2', (req, res) => {
  let myPlaintextPassword = req.body.password;

  MongoClient.connect(uri, function (err, db) {
    var dbo = db.db("FinalProject");

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
        dbo.collection('users').save(user, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/login.html')
        })
      })
    })
  })
});

//Endpoint for the about page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname + '/about.html'));
});

//Endpoint for the help page
app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname + '/help.html'));
});

//Endpoint for the targets page
app.get('/targets', (req, res) => {
  res.sendFile(path.join(__dirname + '/targets.html'));
});

//Endpoint for the approve page
app.get('/approve', (req, res) => {
  res.sendFile(path.join(__dirname + '/approve.html'));
})

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

    //If no request or request has incomplete information
    if (!req || !req.body || !req.body.password || !req.body.user) {
      res.type("application/json");
      res.status(400)
      res.send();
      return;
    }

    //Try to find user in database
    dbo.collection("users").findOne({ "user": myUserName }, (function (err, result) {
      //Compare password to database record, hashing and salting in the process
      bcrypt.compare(myPlaintextPassword, result.password, function (err, passwordMatched) {
        
        if (passwordMatched == true) {

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
        }
      })
    }));
  })
})
