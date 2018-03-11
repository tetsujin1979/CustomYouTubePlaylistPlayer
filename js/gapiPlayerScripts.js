var player;
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
				note = note.replace(value, "<span class='timeLink' onclick='cueThisVideo(\"" + player_id + "\", \"" + video_id + "\", " + seconds + ");'>" + value + "</span>");
			});
			entry.note = note;
			entries.push(entry);
		});
		window[player_id] = new YouTubePlayList(player_id, entries);
		var playListPlayer = $.templates("#playListPlayerTemplate");
		$('#' + element_id).html($('#playListPlayerTemplate').render(window[player_id]));
		
		firstVideo = window[player_id].getEntry(0).video_id;
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
		}
	});
}

function cueThisVideo(player_id, video_id, time)	{
	time = time || 0;
	var currently_playing_video_id = window[player_id].getCurrentlyPlaying();
	window[player_id].setCurrentlyPlaying(video_id);
	loadVideoForPlayer(currently_playing_video_id, player_id, time);
}

function loadNextVideo(player_id) {	
	var currently_playing_video_id = window[player_id].getCurrentlyPlaying();
	if(window[player_id].next()) {
		loadVideoForPlayer(currently_playing_video_id, player_id);
	}
}

function loadVideoForPlayer(currently_playing_video_id, player_id, time) {
	time = time || 0;
	var video_id = window[player_id].getCurrentlyPlaying();
	$('#' + currently_playing_video_id).removeClass('nowPlaying')
	$('#' + video_id).addClass('nowPlaying');
	$('#' + player_id + 'playListEntries').scrollTop($('#' + video_id).index() * 80);
	player.loadVideoById(video_id, time, "large");
	arrangePlayerControls(player_id);
}

function arrangePlayerControls(player_id) {
	var playListPlayer = $('#' + player_id + 'playListPlayer');
	//If the player is on random, the "previous" button is always disabled, the "next" button is always enabled
	if(window[player_id].isRandomized()) {
		$('#' + player_id + 'Backward').addClass('disabled');
		$('#' + player_id + 'Forward').removeClass('disabled');
		$('#' + player_id + 'Random').addClass('randomizeActive');
	}
	//Otherwise, if the first element is selected, disable the "previous" button
	//if the last element is selected, disable the "next" button
	else {
		$('#' + player_id + 'Random').removeClass('randomizeActive');
		var playListEntries = $('#' + player_id + 'playListEntries');
		if(playListEntries.children(":first").hasClass('nowPlaying')) {
			$('#' + player_id + 'Backward').addClass('disabled');
		}
		else {
			$('#' + player_id + 'Backward').removeClass('disabled');
		}
		if(playListEntries.children(":last").hasClass('nowPlaying')) {
			$('#' + player_id + 'Forward').addClass('disabled');
		}
		else {
			$('#' + player_id + 'Forward').removeClass('disabled');
		}
	}
}
