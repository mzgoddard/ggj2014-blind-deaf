// Filter sound and graphics by local filter.
function PlayerFilter() {
  this.localFilter = FilterType.VisualAll;
  this.level = null;
}

var FilterType = PlayerFilter.prototype.FilterType = {
  VisualImage: 1,
  VisualSound: 2,
  VisualAll: 3,

  AudioImage: 4,
  AudioSound: 8,
  AudioAll: 12
};

PlayerFilter.prototype.setLevel = function(level) {
  this.level = level;
};

var recurseChildren = function(container, fn, ctx) {
  if (!container.children) { return; }
  container.children.forEach(function(child) {
    recurseChildren(child, fn, ctx);
    fn.call(ctx || this, child);
  });
};

PlayerFilter.prototype.setLocalFilter = function(filter) {
  this.localFilter = filter;

  // TODO: Update gain and alpha/visible for sound and graphics when switching.
  recurseChildren(this.level.stage, function(child) {
    if (child.gameplayFilter) {
      this.filterGraphics(child.gameplayFilter, child);
    }
  }, this);
};

PlayerFilter.prototype.filterGraphics = function(filter, displayObject) {
  if (filter === undefined) {
    filter = FilterType.VisualImage;
  }
  displayObject.gameplayFilter = filter;
  displayObject.visible = (filter & this.localFilter) !== 0;
};

PlayerFilter.prototype.filterSound = function(filter, soundObject) {
  if (filter === undefined) {
    filter = FilterType.AudioSound;
  }
  // TODO: Set gain to 0 if filter doesn't match local filter.
};

module.exports = new PlayerFilter();
