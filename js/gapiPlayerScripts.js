var player;
var customPlayer;
var firstVideo;

function addPlaylistToElement(playlist_id, element_id) {	
	var player_id = playlist_id;
	var requestOptions = {
		playlistId: playlist_id,
		part: 'contentDetails,snippet'
	};
	var request = gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function(response) {
		var entries = [];
		$.each(response.items, function( key, val ) {
			var entry = {};
			var video_id = val.snippet.resourceId.videoId;
			entry.video_id = video_id;
			entry.image_src = val.snippet.thumbnails.medium.url;
			entry.title = val.snippet.title;
			var note = val.contentDetails.note;
			var times = note.match(/[0-9]*:[0-5][0-9]/g);
			times.forEach(function(value, index, array) {
				var time = value.split(":");
				var seconds = parseInt(time[0]) * 60;
				seconds += parseInt(time[1]);
				note = note.replace(value, "<span class='timeLink' onclick='cueThisVideo(\"" + video_id + "\", " + seconds + ");'>" + value + "</span>");
			});
			entry.note = note;
			entries.push(entry);
		});
		customPlayer = new YouTubePlayList(player_id, entries);
		var playListPlayer = $.templates("#playListPlayerTemplate");
		$('#' + element_id).html($('#playListPlayerTemplate').render(customPlayer));
		
		firstVideo = customPlayer.getEntry(0).video_id;
		var youtubePlayerApi = document.createElement('script');
		youtubePlayerApi.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(youtubePlayerApi, firstScriptTag);
	});
}

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		videoId: firstVideo,
		playerVars: {
			controls: 1
		},
		events: {
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		loadNextVideo();
	}
}

function cueThisVideo(video_id, time)	{
	time = time || 0;
	var currently_playing_video_id = customPlayer.getCurrentlyPlaying();
	customPlayer.setCurrentlyPlaying(video_id);
	loadVideoForPlayer(currently_playing_video_id, time);
}

function loadNextVideo() {	
	var currently_playing_video_id = customPlayer.getCurrentlyPlaying();
	if(customPlayer.next()) {
		loadVideoForPlayer(currently_playing_video_id);
	}
}

function loadPreviousVideo() {	
	var currently_playing_video_id = customPlayer.getCurrentlyPlaying();
	if(customPlayer.previous()) {
		loadVideoForPlayer(currently_playing_video_id);
	}
}

function loadVideoForPlayer(currently_playing_video_id, time) {
	time = time || 0;
	var video_id = customPlayer.getCurrentlyPlaying();
	$('#' + currently_playing_video_id).removeClass('nowPlaying')
	$('#' + video_id).addClass('nowPlaying');
	$('#' + customPlayer.getId() + 'playListEntries').scrollTop($('#' + video_id).index() * 80);
	player.loadVideoById(video_id, time, "large");
	arrangePlayerControls();
}

function arrangePlayerControls() {
	var playListPlayer = $('#' + customPlayer.getId() + 'playListPlayer');
	//If the player is on random, the "previous" button is always disabled, the "next" button is always enabled
	if(customPlayer.isRandomized()) {
		$('#' + customPlayer.getId() + 'Backward').addClass('disabled');
		$('#' + customPlayer.getId() + 'Forward').removeClass('disabled');
		$('#' + customPlayer.getId() + 'Random').addClass('randomizeActive');
	}
	//Otherwise, if the first element is selected, disable the "previous" button
	//if the last element is selected, disable the "next" button
	else {
		$('#' + customPlayer.getId() + 'Random').removeClass('randomizeActive');
		var playListEntries = $('#playListEntries');
		if(playListEntries.children(":first").hasClass('nowPlaying')) {
			$('#' + customPlayer.getId() + 'Backward').addClass('disabled');
		}
		else {
			$('#' + customPlayer.getId() + 'Backward').removeClass('disabled');
		}
		if(playListEntries.children(":last").hasClass('nowPlaying')) {
			$('#' + customPlayer.getId() + 'Forward').addClass('disabled');
		}
		else {
			$('#' + customPlayer.getId() + 'Forward').removeClass('disabled');
		}
	}
}
