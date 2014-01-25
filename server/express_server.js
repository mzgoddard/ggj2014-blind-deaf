var express = require('express');
var app = express();
app.use(express.static('dist'));
app.get('*', function (req, res) {
  res.sendfile('./dist/index.html');
});

var expressServer = app.listen(3000);


module.exports = expressServer;
