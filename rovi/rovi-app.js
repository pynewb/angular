var express = require('express');
var http = require('http');
var url = require('url');
var cors = require('cors');
var request = require('request');
var roviapi = require('./roviapi.js');

// Metadata and Search
var apikey = process.env['ROVI_APIKEY'];
var secret = process.env['ROVI_SECRET'];
if (!apikey || !secret) {
    console.log("ROVI_APIKEY and ROVI_SECRET must be in the environment");
    process.exit(1);
}

var app = express();
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(cors());
app.set('port', 3000);

app.get('/simpsons', function(req, res) {
    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/data/v1.1/video/info",
                          query: {cosmoid:7903, include:"images", imagesize:"640-1024x480-1024", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"}});
    console.log(surl);
    request.get(surl).pipe(res);
    //http.get("", function (http_res) {
    //    http_res.on('data', function (chunk) {
    //        res.send(chunk);
    //    }).on('end', function () {
    //        res.end();
    //    });
    //}).on('error', function (e) {
    //    console.log('Got error: ' + e);
    //});
});

app.get('/find', function(req, res) {
    var squery = {include:["images","cast","synopsis","filmography"], imagesize:"480-720x360-540", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"};    
    var type = req.param("type");
    if (type != 'video' && type != 'name') {
        console.log('Unknown type: ' + type);
        res.error();
        return;
    }
    if (req.param("cosmoId") && req.param("cosmoId") != 'null') {
        squery['cosmoId'] = req.param("cosmoId");
    } else if (req.param("amgMovieId") && req.param("amgMovieId") != 'null') {
        squery['amgMovieId'] = req.param("amgMovieId");
    } else {
        console.log('amgMovieId: ' + req.param("amgMovieId") + ' cosmoId: ' + req.param("cosmoId"));
        res.error();
        return;
    }
    var amgMovieId = req.param("amgMovieId");
    var cosmoId = req.param("cosmoId");
    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/data/v1.1/" + type + "/info",
                          query: squery});
    console.log(surl);
    var sheaders = {};
    if (req.get('Accept')) {
        sheaders['Accept'] = req.get('Accept');
    }
    if (req.get('Accept-Encoding')) {
        sheaders['Accept-Encoding'] = req.get('Accept-Encoding');
    }
    if (req.get('Accept-Language')) {
        sheaders['Accept-Language'] = req.get('Accept-Language');
    }
    console.log(sheaders);
    request.get({url: surl, headers: sheaders}).pipe(res);
    //http.get("", function (http_res) {
    //    http_res.on('data', function (chunk) {
    //        res.send(chunk);
    //    }).on('end', function () {
    //        res.end();
    //    });
    //}).on('error', function (e) {
    //    console.log('Got error: ' + e);
    //});
});

app.get('/search/simpsons', function(req, res) {
//    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/search/v2.1/amgvideo/search",
//                          query: {query:"The Simpsons", entitytype:["movie","tvseries","credit"], include:"images", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"}});
    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/search/v2.1/video/search",
                          query: {query:"Simpsons", entitytype:["movie","tvseries","credit"], include:"images", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"}});
    console.log(surl);
    //req.pipe(request(surl)).pipe(res);
    var sheaders = {};
    if (req.get('Accept')) {
        sheaders['Accept'] = req.get('Accept');
    }
    if (req.get('Accept-Encoding')) {
        sheaders['Accept-Encoding'] = req.get('Accept-Encoding');
    }
    if (req.get('Accept-Language')) {
        sheaders['Accept-Language'] = req.get('Accept-Language');
    }
    console.log(sheaders);
    request.get({url: surl, headers: sheaders}).pipe(res);
    
    //http.get("", function (http_res) {
    //    http_res.on('data', function (chunk) {
    //        res.send(chunk);
    //    }).on('end', function () {
    //        res.end();
    //    });
    //}).on('error', function (e) {
    //    console.log('Got error: ' + e);
    //});
});

app.get('/search', function(req, res) {
//    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/search/v2.1/amgvideo/search",
//                          query: {query:"The Simpsons", entitytype:["movie","tvseries","credit"], include:"images", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"}});
    var surl = url.format({protocol: "http:", host: "api.rovicorp.com", pathname: "/search/v2.1/video/search",
                          query: {query:req.param("q"), entitytype:["movie","tvseries","credit"], include:"images", apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json", size:10}});
    console.log(surl);
    //req.pipe(request(surl)).pipe(res);
    var sheaders = {};
    if (req.get('Accept')) {
        sheaders['Accept'] = req.get('Accept');
    }
    if (req.get('Accept-Encoding')) {
        sheaders['Accept-Encoding'] = req.get('Accept-Encoding');
    }
    if (req.get('Accept-Language')) {
        sheaders['Accept-Language'] = req.get('Accept-Language');
    }
    console.log(sheaders);
    request.get({url: surl, headers: sheaders}).pipe(res);
    
    //http.get("", function (http_res) {
    //    http_res.on('data', function (chunk) {
    //        res.send(chunk);
    //    }).on('end', function () {
    //        res.end();
    //    });
    //}).on('error', function (e) {
    //    console.log('Got error: ' + e);
    //});
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express service listening on port ' + app.get('port'));
});
