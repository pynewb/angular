function getBestImageUrl(images) {
    var imageUrl = "";
    if (images) {
      var imageHeight = 0;
      images.forEach(function (image) {
        //console.log('image.height ' + image.height + ' imageHeight ' + imageHeight + ' image.url ' + image.url + ' imageUrl ' + imageUrl);
        if (image.height > imageHeight && image.height <= 480 && (image.url.lastIndexOf("http", 0) == 0)) {
          imageUrl = image.url;
          imageHeight = image.height;
        }
      });
    }
    //console.log('return imageUrl ' + imageUrl);
    return imageUrl;
}
function getImageUrls(images) {
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
  this.imageUrls = getImageUrls(this.result.movie.images);
}
RoviMovieResult.prototype.getImageUrl = function() {
  return getBestImageUrl(this.result.movie.images);
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
  this.imageUrls = getImageUrls(this.result.name.images);
}
RoviNameResult.prototype.getImageUrl = function() {
  return getBestImageUrl(this.result.name.images);
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
      self.credits.push(new NameId('video', credit.name, amgMovieId, cosmoId));
    });
  }
  this.imageUrls = getImageUrls(this.result.video.images)
}
RoviVideoResult.prototype.getImageUrl = function() {
  return getBestImageUrl(this.result.video.images);
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
