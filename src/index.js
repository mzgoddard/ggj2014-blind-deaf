// Load actor types so that they register.
require('./actor.player');

// Load the level constructor.
var Level = require('./level');

// Create the first level.
new Level('level0');

// Dynamically resize canvas
function resize() {
  var canvas = document.querySelector('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();


require('./networking.js');

