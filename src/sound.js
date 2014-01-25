

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

sound.SoundNode = function(soundFile, x, y, z, callback){
  x = x ? x : 0;
  y = y ? y : 0;
  z = z ? z : 0;

  // Source -> induvidual volume -> panner -> group volume -> destination.
  this.source = ctx.createBufferSource();
  this.volume = ctx.createGain();
  this.source.connect(this.volume);
  this.panner = ctx.createPanner();
  this.volume.connect(this.panner);
  this.panner.connect(volume);

  var buffer = ctx.createBuffer(soundFile.response, false);

  soundFile.buffer = buffer;

  this.source.buffer = soundFile.buffer;
  this.source.start(ctx.currentTime);
};


module.exports = sound;
