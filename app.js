const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
const express = require('express');
const layout = require('express-layout');
const bodyParser = require('body-parser');
const routes = require('./routes')
const app = express();
const pidCrypt = require("pidcrypt");
const urlencodedParser = bodyParser.urlencoded({extended: false});
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();

const url = 'mongodb://localhost:27017/test';
var connect = MongoClient.connect (url);
//var db=null;
// MongoClient.connect(url,(err,database) =>{
//     if (err){
//         console.log(err)
//     }
//     db=database;
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}



// mongoClient.connect((err, client) => {
//     //console.log("asdasdasdasdasd")
//     const db = client.db("test");
//     const collection = db.collection("text");
// });

app.get('/', routes);
app.get('/:id', (request, response) => {
    const id = request.params.id;
    const details = { '_id': id};
    connect.then (db => db.collection('text').findOne(details, (err, item) => {
        if (err) {
            response.send({'error':'An error has occurred'});
        } else {
            response.render("all", {
                decodtext:item.text,
                endecodetext:"",
            });
        }
    }));
});
app.post("/", urlencodedParser, (request, response) => {
    if(!request.body) {
        return response.sendStatus(400);
    }
    const crypted = aes.encryptText(request.body.message, request.body.password, {nBits: 256});
    const id=randomString(6);
    connect.then (db => db.collection("text").insertOne({_id:id,text:crypted}));
    response.render("urlss", {
        urls:"http://localhost:3001/"+id,
    });
});

app.post("/:id", urlencodedParser, (request, response) => {
    if (!request.body) {
        return response.sendStatus(400);
    }
    const decrypted = aes.decryptText(request.body.message, request.body.password);
    response.render("all", {
        decodtext: request.body.demessage,
        endecodetext: decrypted,
    });
});

app.use((err, request, response) => {
    response.status(500).send('Something broke!')
});

app.listen(3001, () => {
    console.log(`App running at http://localhost:3001`)
});
