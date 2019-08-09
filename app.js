const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes')
const app = express();
const pidCrypt = require("pidcrypt");
const urlencodedParser = bodyParser.urlencoded({extended: false});
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
app.set('view engine', 'ejs');

const mongo = {
    db:null,
    collection:null
};

MongoClient.connect('mongodb://localhost:27017',(err, client) =>{
    mongo.db = client.db('test');
    mongo.collection = mongo.db.collection('text');
});

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

app.get('/', routes);
app.get('/api/:id', (request, response) => {
    const id = request.params.id;
    const details = { '_id': id};
    mongo.collection.findOne(details, (err, item) => {
        if (err) {
            response.send({'error':'An error has occurred'});
        } else {
            response.render("all", {
                decodtext:item.text,
                endecodetext:"",
            });
        }
    });
});

app.post("/", urlencodedParser, (request, response) => {
    if(!request.body) {
        return response.sendStatus(400);
    }
    const crypted = aes.encryptText(request.body.message, request.body.password, {nBits: 256});
    const id=randomString(6);
    mongo.collection.insertOne({_id:id,text:crypted});
    response.render("link", {
        link:"http://localhost:3001/api/"+id,
    });
});

app.post("/api/:id", urlencodedParser, (request, response) => {
    if (!request.body) {
        return response.sendStatus(400);
    }
    const decrypted = aes.decryptText(request.body.demessage, request.body.password);
    response.render("all", {
        decodtext: request.body.demessage,
        endecodetext: decrypted,
    });
});

app.listen(3001, () => {
    console.log(`App running at http://localhost:3001/`)
});

