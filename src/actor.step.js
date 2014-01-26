var Actor = require('./actor');

function StepActor(level, data) {
  Actor.call(this, level, data);

  // Determine material being stepped on. Play a sound for it.
  // Determine the mask and sprite that.
};

StepActor.prototype = Object.create( Actor.prototype );
StepActor.prototype.constructor = StepActor;

Actor.register('step', function(level, data) {
  return new StepActor(level, data);
});
