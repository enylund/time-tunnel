// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var tumblr = require('tumblr');
var url = require('url');
var ejs = require('ejs');
var async = require('async');

var view = fs.readFileSync(__dirname + '/view.ejs', 'utf8');


var oauth = {
  consumer_key: 'SUNpLgKqnJjL8biuJCEA0Iktk7oudjtinZIW4n7d7ueJi9N8ZG',
  consumer_secret: 'ExLHAr9JtVhaBqXhrtWcMURLMz0o6L00S6gk6OYrPvfDvwF7E6',
  token: 'SUNpLgKqnJjL8biuJCEA0Iktk7oudjtinZIW4n7d7ueJi9N8ZG',
  token_secret: 'ExLHAr9JtVhaBqXhrtWcMURLMz0o6L00S6gk6OYrPvfDvwF7E6'
};

// dataStore holds the information from previous searches
var dataStore = [];

function shuffle(o){ //v1.0
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
          return o;
};

// Configure our HTTP server.
var server = http.createServer(function (request, response) {


  console.log(__dirname);
  // Next two lines get the word that the user requests and stores as queryData
    var queryData = url.parse(request.url, true).query;
    console.log(request.url);
    if(request.url == '/') {
      queryData = 1950;
    } else {
      var requestedDate = request.url;
      requestedDate = requestedDate.split("/");
      console.log(requestedDate[1]);
    queryData = requestedDate[1];
    }

   // Set up an empty array that will later be filled with response from Tumblr
   var finalData = [];

   // Tumblr authentication requirments for using their api
    var user = new tumblr.User(oauth);
    var tagged = new tumblr.Tagged(oauth);

  // API call to tumblr
    function searchTumblr(item, callback) {

          console.log(item);

          var testForNumber = parseInt(item);

          if(isNaN(testForNumber) == true) {
            item = 1950;
          }


            tagged.search(item, function(error, res) {
                    if (error) {
                          throw new Error(error);
                    }

                    if(res){
                    for (var i = 0; i<res.length; i++) {
                      if (typeof res[i] !== 'undefined' && typeof res[i].photos !== 'undefined' && res[i].photos!=null) {
                      finalData.push(res[i].photos[0].original_size.url);
                      }
                    }
                    }
                    console.log("NEW");
                    shuffle(finalData);
                    // Push API response into array
                    callback();
                    finalData.length = 0;

            });

    }

    response.writeHead(200, {'Content-Type': 'text/html'});

    if (typeof queryData !== 'undefined' && queryData!=null) {

          dataStore.push(queryData);

          var testForNumber = parseInt(queryData);

          if(isNaN(testForNumber) == true) {
            console.log("hi");
            queryData = 1910;
          }

          async.each(dataStore, searchTumblr, function(err){
                          if(typeof finalData !== 'undefined' && finalData!=null && finalData.length>0) {
                                console.log(finalData.length);



			                          response.write(ejs.render(view, {locals: {
			                                data: finalData,
			                                dataStore: dataStore.length,
                                      queryData: queryData,
                                      directory: __dirname
			                           }}));
                                console.log(finalData.length);
			                          response.end();

			                   } else {

			                          response.write(ejs.render(view));
			                          response.end();
			                    }
          });


    }


}).listen(Number(process.env.PORT || 5000));

console.log("Server running at http://127.0.0.1:5000/");
