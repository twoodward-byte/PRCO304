//To run this application refer to the readme.txt file, or follow the steps below
//run "node server.js"
//In a modern web browser navigate to "locahost:9000"

const express = require('express');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
//const WebSocket = require('ws');
//const wss = new WebSocket.Server({ port: 8080 });
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));
const ObjectID = require('mongodb').ObjectID;
var dbResult;
var db;
var client;
const uri = "mongodb://localhost:27017/FinalProject" //Local connection string
//const uri = "mongodb+srv://test:test@cluster0-bcfvz.mongodb.net/test?retryWrites=true&w=majority";
const MongoClient = require('mongodb').MongoClient;
client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(err => {
  db = client.db("FinalProject");
  app.listen(9000, '0.0.0.0', () => {
    console.log('listening on 9000')
})
});

//Return content for the index page
app.get('/', (req, res) => {
    db.collection('target').find().toArray(function (err, results) {
        if (err) return console.log(err);
    })
})

//Endpoint for the line target data
app.get("/getMyData", function(require, response){
  db.collection("targets").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    dbResult = result;
    //ws.send(JSON.stringify(dbResult));
    //db.close();
  });
  response.json(dbResult);
});

//Endpoint for the pie chart data
app.get("/getPieData", function(require, response){
  var resultPie;
  db.collection("partsProduced").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    resultPie = result;
    //ws.send(JSON.stringify(dbResult));
    //db.close();
    response.json(resultPie);

  });
});




//Endpoint for posting new requisitions to the server
app.post('/register', (req, res) => {
    //console.log(req.body)
    db.collection('users').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  });

//Endpoint for deleting
app.post('/delete', (req, res) =>{
    console.log("delete POST request recieved");
    console.log(req.body.id);
    var id = req.body.id;
    db.collection("test").deleteOne({ _id: new mongo.ObjectId(id) }, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
       // db.close();
      });
      //Go back to homepage
      res.redirect('/')
})


app.post('/targets2', (req, res)=>{
  console.log(req.body.target);
  db.collection("targets").updateOne({"line": "2"}, {$set: {"target": req.body.target}, function(err, obj){
    if(err) throw err;
    console.log("Line updated")
  }});
  res.redirect('/targets.html');
})

app.post('/targets1', (req, res)=>{
  console.log(req.body.target);
  db.collection("targets").updateOne({"line": "1"}, {$set: {"target": req.body.target}, function(err, obj){
    if(err) throw err;
    console.log("Line updated")
  }});
  res.redirect('/targets.html');
})

//Approval post request made to server
app.post('/approve', (req, res) =>{
    console.log("approve POST request recieved");
    console.log(req.body.id);
    var id = req.body.id;
    var newvalues = { $set: {status: "approved" } };
    db.collection("test").updateOne({ _id: new mongo.ObjectId(id) }, newvalues, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
       // db.close();
      });
      //Go back to homepage
      res.redirect('/')
});
  