var express = require('express');
var http = require('http');
var cors = require('cors');

var app = express();
app.use(express.logger('dev'));
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(cors());
app.set('port', 3000);

var db_todo;
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/todo", function(err, db) {
    if (err != null) {
        console.log('err ' + err);
        return;
    }
    db_todo = db;
});

function send_todos(res) {
    var cur = db_todo.collection('todos').find();
    var todos = [];
    cur.each(function (err, todo) {
        if (err) {
            console.log('reading results err ' + err);
            return;
        }
        if (todo) {
            todos.push(todo);
        } else {
            res.send(todos);
        }
    });
}

app.get('/todo', function(req, res) {
    send_todos(res);
});

app.post('/todo', function(req, res) {
    db_todo.collection('todos').insert(req.body, function(err, result) {
        if (err) {
            console.log('err ' + err);
            return;
        }
        // result is the newly added document
        //console.log(JSON.stringify(result));
        send_todos(res);
    });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express service listening on port ' + app.get('port'));
});
