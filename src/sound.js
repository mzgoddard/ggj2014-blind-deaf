var sound = {};

// Check for AudioContext support.
window.AudioContext = (
  window.AudioContext ||
  window.webkitAudioContext ||
  null
);

if (!AudioContext) {
  throw new Error("AudioContext not supported!");
}

var ctx = new AudioContext();
var mainVolume = ctx.createGain();

sound.SoundNode = function(soundFile, x, y, z){
  x = x ? x : 0;
  y = y ? y : 0;
  z = z ? z : 0;


  // Source -> induvidual volume -> panner -> group volume -> destination.
  this.source = ctx.createBufferSource();
  this.volume = ctx.createGain();
  this.source.connect(this.volume);
  this.panner = ctx.createPanner();
  this.volume.connect(this.panner);
  this.panner.connect(ctx.destination);

  this.source.loop = true;

  var snd = this;

  var request = new XMLHttpRequest();
  request.open("GET", soundFile, true);
  request.responseType = "arraybuffer";
  request.onload = function(e) {
    var buffer = ctx.createBuffer(this.response, false);
    this.buffer = buffer;

    snd.source.buffer = this.buffer;
    snd.source.start(ctx.currentTime);
  };
  request.send();
};


module.exports = sound;
