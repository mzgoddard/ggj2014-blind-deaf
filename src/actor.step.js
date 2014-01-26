var Actor = require('./actor');
var _ = require('lodash');

function StepActor(level, data) {
  Actor.call(this, level, data);

  // Determine material being stepped on. Play a sound for it.
  // Determine the mask and sprite that.
};

StepActor.prototype = Object.create( Actor.prototype );
StepActor.prototype.constructor = StepActor;

Actor.register('step', function(level, data) {
  _.extend(data,{
  "spawnSound": {
    "file": "footstep_tile4.wav",
    "properties": {
      "volume": 1,
      "loop": false
    },
    "filter": "AudioVisual"
  }
  });
  return new StepActor(level, data);
});
