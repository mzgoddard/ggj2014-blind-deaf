

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
var volume = ctx.createGain();
volume.connect(ctx.destination);

sound.ctx = ctx;
sound.listener = ctx.listener;
sound.volume = volume;

sound.SoundNode = function(a, x, y, z, callback){
  x !== undefined ? x : 0;
  y !== undefined ? y : 0;
  z !== undefined ? z : 0;

  // Source -> induvidual volume -> panner -> group volume -> destination.

  var audio = a.cloneNode();

  this.source = sound.ctx.createMediaElementSource(audio);
  this.volume = ctx.createGain();
  this.source.connect(this.volume);
  this.panner = ctx.createPanner();
  this.volume.connect(this.panner);
  this.panner.connect(volume);
  this.audio = audio;

  this.source.onended = function(e){
    if (callback !== undefined){
      callback(e);
    }
  };

};


module.exports = sound;
