var info = document.querySelector('#info');
var stateSpan = document.querySelector('.state');
var counterState = document.querySelector('.counter-state');
var dismiss = document.querySelector('#dismiss');
var canvas = document.querySelector('canvas.hidden');
var waiting = document.querySelector('.waiting');
var ready = document.querySelector('.ready');



dismiss.addEventListener('click', function(e) {
  e.preventDefault();
  info.className = 'hidden';
  canvas.className = '';
});


exports.setState = function(state) {
  stateSpan.textContent = state;
  counterState.textContent = ((state == 'deaf') ? 'blind' : 'deaf');
};

exports.ready = _.once(function() {
  waiting.className = 'hidden';
  ready.className = '';
});
