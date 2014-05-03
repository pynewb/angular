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

/*
 *  imagetypeid
 *      31  vertical showcard (3:4)
 *      27  poster
 *      7   box art
 *      4   gallery: key
 *      5   gallery: supporting
 *      3   group
 *
 *  formatid (still have to filter results by aspect ratio)
 *      82  600x800 (600x789, 533x800, 488x600)
 *      90  240x320 (240x315, 213x320, 195x240)
 *      94  480x800 (480x640, 480x631, 480x720, 390x480)
 *      16  500x500 (375x500, 380x500, 333x500, 406x500)
 *      133 640x480 (360x480, 364x480, 320x480, 480x589)
 *      96  800x480 (360x480, 364x480, 320x480, 480x589)
 */
app.get('/find', function(req, res) {
    var squery = {include:["images","cast","crew","synopsis","filmography"], apikey:apikey, sig:roviapi.genSig(apikey, secret), format:"json"};    
    var type = req.param("type");
    if (type == 'video') {
        squery['imagetypeid'] = [31, 27, 7, 4, 5, 3];
        squery['formatid'] = [82, 90, 94, 16, 133, 96];
    } else if (type == 'name') {
        // imagetypeid 17 (celebrity) is getty
        squery['imagetypeid'] = [4, 5, 3, 31, 27, 7];
        squery['formatid'] = [82, 90, 94, 16, 133, 96];
    } else {
        console.log('Unknown type: ' + type);
        res.statusCode = 500;
        res.end();
        return;
    }
    if (req.param("cosmoId") && req.param("cosmoId") != 'null') {
        squery['cosmoId'] = req.param("cosmoId");
    } else if (req.param("amgMovieId") && req.param("amgMovieId") != 'null') {
        if (type == 'video') {
          type = 'movie';
          squery['movieId'] = req.param("amgMovieId");
        } else {
          squery['amgMovieId'] = req.param("amgMovieId");
        }
    } else {
        console.log('amgMovieId: ' + req.param("amgMovieId") + ' cosmoId: ' + req.param("cosmoId"));
        res.statusCode = 500;
        res.end();
        return;
    }
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
    try {
        request.get({url: surl, headers: sheaders}).pipe(res);
    } catch (e) {
        console.log("Exception in find: " + e);
        if (!res.headersSent) {
            res.statusCode = 500;
        }
        res.end();
    }
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
    try {
        request.get({url: surl, headers: sheaders}).pipe(res);
    } catch (e) {
        console.log("Exception in find: " + e);
        if (!res.headersSent) {
            res.statusCode = 500;
        }
        res.end();
    }
    
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
