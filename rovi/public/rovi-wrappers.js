/*
 *  TODO: improve the following
 *
 *  1. search David Duchovny
 *  2. response has a David Duchovny with both cosmoId and amgMovieId, but only getty images
 *  3. click on David Duchovny gets metadata by cosmoid
 *  4. response has a David Duchovny with both cosmoId and amgMovieId, AMG genres, usable images, but only AMG ids in filmography which is in no particular order
 *  5. click on The X-Files: I Want To Believe gets metadata by amgMovieId
 *  6. response has both cosmoId and [amg]movieId, AMG genres, only a couple usable images, but only AMG ids in a pretty thorough cast
 *  7. click on David Duchovny gets metadata by amgMoveId
 *  8. response has a David Duchovny with both cosmoId and amgMovieId, AMG genres, usable images, but only AMG ids in filmography which is in no particular order
 *
 *  1. search X-Files
 *  2. response has series with cosmoId, The X-Files: I Want to Believe with cosmoId, and The X-Files with only cosmoId; all with images
 *  3. click on The X-Files: I Want To Believe gets metadata by cosmoid
 *  4. response has only cosmoId, cosmo subcategory, usable images, less thorough cast with nameUri containing cosmoId and cast images largely getty
 *  5. click on Gillian Anderson gets metadata by cosmoid
 *  6. response has both cosmoId and amgMovieId, AMG genres, usable images, but only AMG ids in filmography which is in no particular order
 *  7. click on The X-Files: I Want To Believe gets metadata by amgMovieId
 *  8. response has both cosmoId and [amg]movieId, AMG genres, only a couple usable images, but only AMG ids in a pretty thorough cast
 *  9. click on Gillian Anderson gets metadata by amgMovieId
 *  10. response has both cosmoId and amgMovieId, AMG genres, usable images, but only AMG ids in filmography which is in no particular order
 *
 *  As long as person has both amg and cosmo ids, searching on name gives consistent results
 *  regardless of which id is used.
 *  
 *  Other than search results, there are no direct paths to cosmoIds for video works.  Maybe a better
 *  approach is to continue to get the video work from the AMG Movie service, but if that returns
 *  a cosmoId, also grab the video work from the video service, and perhaps even coalesce the results.
 */
function RoviResult () {
}
RoviResult.getBestImageUrl = function (images) {
    var imageUrl = "";
    if (images) {
      // TODO: consider imageTypeId, zoomLevel, the calculated aspect ratio and availability (non-Getty)
      var imageHeight = 0;
      var imageFound = false;
      images.forEach(function (image) {
        //console.log('image.height ' + image.height + ' imageHeight ' + imageHeight + ' image.url ' + image.url + ' imageUrl ' + imageUrl);
        if ((!imageFound) && image.height > imageHeight && image.height <= 640 && (image.url.lastIndexOf("http", 0) == 0)) {
          imageUrl = image.url;
          imageHeight = image.height;
          aspectRatio = image.width / image.height;
          if (aspectRatio > 0.74 && aspectRatio < 0.76) {
            imageFound = true;
          }
        }
      });
    }
    //console.log('return imageUrl ' + imageUrl);
    return imageUrl;
}
RoviResult.getImageUrls = function (images) {
    var imageUrls = [];
    if (images) {
      images.forEach(function (image) {
        //console.log('image.height ' + image.height + ' imageHeight ' + imageHeight + ' image.url ' + image.url + ' imageUrl ' + imageUrl);
        if (image.url.lastIndexOf("http", 0) == 0) {
          imageUrls.push(image.url);
        }
      });
    }
    //console.log('return imageUrls ' + imageUrls);
    return imageUrls;
}

function RoviMovieResult(result) {
  this.result = result;
  this.credits = [];
  if (this.result.movie.cast) {
    var self = this;
    this.result.movie.cast.forEach(function (credit) {
      self.credits.push(new NameId('name', credit.name, credit.id, null));
    });
  }
  this.imageUrls = RoviResult.getImageUrls(this.result.movie.images);
}
RoviMovieResult.prototype.getImageUrl = function() {
  return RoviResult.getBestImageUrl(this.result.movie.images);
};
RoviMovieResult.prototype.getName = function() {
  return [this.result.movie.title];
};
RoviMovieResult.prototype.getDetailInfo = function() {
  return new DetailInfo('movie', this.result.movie.title, this.result.movie.ids.movieId, this.result.movie.ids.cosmoId, this.imageUrls, '', '', this.result.movie.releaseYear, '', this.credits);
};
RoviMovieResult.prototype.getListInfo = function() {
  return new ListInfo('movie', this.result.movie.title, this.result.movie.ids.movieId, this.result.movie.ids.cosmoId, '', '', '', '');
};

function RoviNameResult(result) {
  this.result = result;
  this.credits = [];
  if (this.result.name.filmography) {
    var self = this;
    this.result.name.filmography.forEach(function (credit) {
      self.credits.push(new NameId('video', credit.title, credit.id, null));
    });
  }
  this.imageUrls = RoviResult.getImageUrls(this.result.name.images);
}
RoviNameResult.prototype.getImageUrl = function() {
  return RoviResult.getBestImageUrl(this.result.name.images);
};
RoviNameResult.prototype.getName = function() {
  return [this.result.name.name];
};
RoviNameResult.prototype.getDetailInfo = function() {
  return new DetailInfo('name', this.result.name.name, this.result.name.ids.amgMovieId, this.result.name.ids.cosmoId, this.imageUrls, this.result.name.primaryMedia, this.result.name.period, this.result.name.birth.date, '', this.credits);
};
RoviNameResult.prototype.getListInfo = function() {
  return new ListInfo('name', this.result.name.name, this.result.name.ids.amgMovieId, this.result.name.ids.cosmoId, this.result.name.primaryMedia, this.result.name.period, this.result.name.birth.date, '');
};

function RoviUnknownResult(result) {
  this.result = result;
  this.credits = [];
  this.imageUrls = [];
}
RoviUnknownResult.prototype.getImageUrl = function() {
  return '';
};
RoviUnknownResult.prototype.getName = function() {
  return ['Unknown type: ' + this.result.type];
};
RoviUnknownResult.prototype.getDetailInfo = function() {
  return new DetailInfo('unknown', 'Unknown type', null, null, this.imageUrls, this.result.type, '', '', '', '', this.credits);
};
RoviUnknownResult.prototype.getListInfo = function() {
  return new ListInfo('unknown', 'Unknown type', null, null, this.result.type, '', '', '');
};

function RoviVideoResult(result) {
  this.result = result;
  this.credits = [];
  if (this.result.video.cast) {
    var self = this;
    this.result.video.cast.forEach(function (credit) {
      var matchCosmoId = credit.nameUri.match(/&cosmoid=(\d+)&/i);
      var cosmoId = null;
      if (matchCosmoId) {
        cosmoId = matchCosmoId[1];
      }
      var matchAmgMovieId = credit.nameUri.match(/&amgmovieid=(.+)&/i);
      var amgMovieId = null;
      if (matchAmgMovieId) {
        amgMovieId = matchAmgMovieId[1];
      }
      self.credits.push(new NameId('name', credit.name, amgMovieId, cosmoId));
    });
  }
  this.imageUrls = RoviResult.getImageUrls(this.result.video.images)
}
RoviVideoResult.prototype.getImageUrl = function() {
  return RoviResult.getBestImageUrl(this.result.video.images);
};
RoviVideoResult.prototype.getName = function() {
  return [this.result.video.masterTitle,
    this.result.video.programType,
    this.result.video.subcategory,
    this.result.video.releaseYear];
};
RoviVideoResult.prototype.getDetailInfo = function() {
  return new DetailInfo('video', this.result.video.masterTitle, this.result.video.ids.amgMovieId, this.result.video.ids.cosmoId, this.imageUrls, this.result.video.programType, this.result.video.subcategory, this.result.video.releaseYear, this.result.video.programLanguage, this.credits);
};
RoviVideoResult.prototype.getListInfo = function() {
  return new ListInfo('video', this.result.video.masterTitle, this.result.video.ids.amgMovieId, this.result.video.ids.cosmoId, this.result.video.programType, this.result.video.subcategory, this.result.video.releaseYear, this.result.video.programLanguage);
};

function RoviSearchResponse(data) {
  this.data = data;
  this.results = [];
  if (data.searchResponse) {
    if (data.searchResponse.results) {
      var self = this;
      data.searchResponse.results.forEach(function (result) {
        if (result.movie) {
          self.results.push(new RoviMovieResult(result));
        } else if (result.name) {
          self.results.push(new RoviNameResult(result));
        } else if (result.video) {
          self.results.push(new RoviVideoResult(result));
        } else {
          self.results.push(new RovUnknownResult(result));
        }
      });
    }
  }
}
RoviSearchResponse.prototype.getResults = function () {
  return this.results;
};

function RoviFindResponse(data) {
  this.data = data;
  if (data.movie) {
    this.result = new RoviMovieResult(data);
  } else if (data.name) {
    this.result = new RoviNameResult(data);
  } else if (data.video) {
    this.result = new RoviVideoResult(data);
  } else {
    this.result = new RoviUnknownResult(data);
  }
}
RoviFindResponse.prototype.getResult = function () {
  return this.result;
};

function NameId(type, name, amgMovieId, cosmoId) {
    this.type = type;
    this.name = name;
    this.amgMovieId = amgMovieId;
    this.cosmoId = cosmoId;
}
function DetailInfo(type, name, amgMovieId, cosmoId, imageUrls, line2, line3, line4, line5, nameIdArray1) {
  this.type = type;
  this.name = name;
  this.amgMovieId = amgMovieId;
  this.cosmoId = cosmoId;
  this.imageUrls = imageUrls;
  this.line2 = line2;
  this.line3 = line3;
  this.line4 = line4;
  this.line5 = line5;
  this.nameIdArray1 = nameIdArray1;
}

function ListInfo(type, name, amgMovieId, cosmoId, line2, line3, line4, line5) {
  this.type = type;
  this.name = name;
  this.amgMovieId = amgMovieId;
  this.cosmoId = cosmoId;
  this.line2 = line2;
  this.line3 = line3;
  this.line4 = line4;
  this.line5 = line5;
}
