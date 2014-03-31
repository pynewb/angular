angular
=======

Learning angularjs beyond fiddling, typically with node.js and express

todo - starting with the angular todo sample, add updates and deletes,
       then persistence in mongodb through a node.js/express back end.
       (Note: index.html, todo.js, todo-app.js are newer than
       index2.html, todo2.js, todo-app2.js)

rovi - experiment with the Rovi metadata and search APIs.  Use a node.js/
       express back end to more-or-less pass through requests.
       Originally a necessity since Rovi does not support CORS or JSONP,
       it also moves URL building details out of the client and allows
       the API key and secret to be "hidden" in server environment
       variables.  The original code is messy, but it will be improved
       to use more features of angular, with more code moved into services.