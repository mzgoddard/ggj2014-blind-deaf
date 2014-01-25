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

PlayerFilter.prototype.setLocalFilter = function(filter) {
  this.localFilter = filter;

  // TODO: Update gain and alpha/visible for sound and graphics when switching.
};

PlayerFilter.prototype.filterGraphics = function(filter, displayObject) {
  if (filter === undefined) {
    filter = FilterType.VisualImage;
  }
  displayObject.visible = (filter & this.localFilter) !== 0;
};

PlayerFilter.prototype.filterSound = function(filter, soundObject) {
  if (filter === undefined) {
    filter = FilterType.AudioSound;
  }
  // TODO: Set gain to 0 if filter doesn't match local filter.
};

module.exports = new PlayerFilter();
