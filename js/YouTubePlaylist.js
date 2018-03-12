function YouTubePlayList(id, entries) {
	this.id = id;
	this.entries = entries;
	this.currently_playing = 0;
	this.randomizer = false;
}

YouTubePlayList.prototype = {
	getId: function() {
		return this.id;
	},
	next: function() {
		var retVal = false;
		if(this.randomizer) {
			retVal = true;
			this.currently_playing = Math.floor((Math.random() * this.entries.length));
		}
		else if(this.currently_playing <= this.entries.length) {
			retVal = true;
			this.currently_playing++;
		} 
		return retVal;
	},
	previous: function() {
		var retVal = false;
		if(this.currently_playing > 0) {
			retVal = true;
			this.currently_playing--;
		} 
		return retVal;
	},
	getCurrentlyPlaying: function() {
		return this.entries[this.currently_playing].video_id;
	},
	setCurrentlyPlaying: function(video_id) {
		for(var index = 0; index < this.entries.length; index++) {
			if (this.entries[index].video_id === video_id) {
				this.currently_playing = index;
				break;
			}
		}	
	},
	randomize: function() {
		this.randomizer = !(this.randomizer);
		return this.randomizer;
	},
	isRandomized: function() {
		return this.randomizer;
	},
	getEntries: function() {
		return this.entries;
	},
	getEntry: function (entryIndex) {
		entryIndex = entryIndex || 0;
		return this.entries[0];
	}
};
