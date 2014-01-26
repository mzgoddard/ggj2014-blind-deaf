var info = document.querySelector('#info');
var stateSpan = document.querySelector('.state');
var counterState = document.querySelector('.counter-state');

var waiting = document.querySelector('.waiting');
var ready = document.querySelector('.ready');



var dismissHandler = _.once(function(e) {
  e.preventDefault();
  info.className = 'hidden';
  var canvi = document.querySelectorAll('canvas');
  [].forEach.call(canvi, function(canvas) {
      canvas.className = '';
  });
});

document.body.addEventListener('click', dismissHandler);


exports.setState = function(state) {
  stateSpan.textContent = state;
  counterState.textContent = ((state == 'deaf') ? 'blind' : 'deaf');
};

exports.ready = _.once(function() {
  waiting.className = 'hidden';
  ready.className = '';
});
