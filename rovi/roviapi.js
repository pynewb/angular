md5_2 = require('./md5_2.js');

exports.genSig = function (apikey, secret) {
    var curdate = new Date();
    var gmtstring = curdate.toGMTString();
    var utc = Date.parse(gmtstring) / 1000;
    return md5_2.hex_md5(apikey + secret + utc);
};