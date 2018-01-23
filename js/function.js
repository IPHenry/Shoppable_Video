// this is a lookup object to mimic an ajax lookup
videojs.plugin('shoppable',function(){
	var product_data = { 
		'01': {
			code: '01',
			name: 'Waterfall',
			price: '$149',
			image: 'shoppable/waterfall_01.jpg',
			description: 'Your own white water experience'
		},
		'02': {
			code: '02',
			name: 'Waterfall',
			price: '$299',
			image: 'shoppable/waterfall_02.jpg',
			description: 'An even more extreme experience'
		},
		'03': {
			code: '03',
			name: 'Still Water',
			price: '$99',
			image: 'shoppable/water_01.jpg',
			description: 'Relax with calmer waters'
		},
		'04': {
			code: '04',
			name: 'White Water',
			price: '$199',
			image: 'shoppable/whitewater_01.jpg',
			description: 'Tour the rapids'
		},
		'05': {
			code: '05',
			name: 'White Water',
			price: '$299',
			image: 'shoppable/whitewater_02.jpg',
			description: 'Tour the rapids, the extreme version'
		},
		'06': {
			code: '06',
			name: 'White Water',
			price: '$499',
			image: 'shoppable/whitewater_03.jpg',
			description: 'Group packages also available'
		},
		'07': {
			code: '07',
			name: 'Rainforest',
			price: '$89',
			image: 'shoppable/rainforest_01.jpg',
			description: 'Relax in the rainforest'
		},
		'08': {
			code: '08',
			name: 'Rainforest',
			price: '$89',
			image: 'shoppable/rainforest_02.jpg',
			description: 'Relax in the rainforest'
		},
		'09': {
			code: '09',
			name: 'The Hat',
			price: '$19',
			image: 'shoppable/hat_white.jpg',
			description: 'Stay at home and just buy the hat'
		},
		'10': {
			code: '10',
			name: 'The Hat',
			price: '$19',
			image: 'shoppable/hat_brown.jpg',
			description: 'Stay at home and just buy the hat'
		},
		'11': {
			code: '11',
			name: 'Bike Tours',
			price: '$399',
			image: 'shoppable/bike_01.jpg',
			description: 'An experience on two wheels'
		},
		'12': {
			code: '12',
			name: 'Bike Tours',
			price: '$399',
			image: 'shoppable/bike_02.jpg',
			description: 'An experience on two wheels'
		},
		'13': {
			code: '13',
			name: 'Bike Tours',
			price: '$299',
			image: 'shoppable/bike_03.jpg',
			description: 'An experience on two wheels'
		}
	};
	var timer
	var arrow_active = 0;
	var product_ids = [], // holds the IDs when they're brought down as cue points
	products = []; // holds the products as we fetch their data and construct the sidebar
	cue_times = []; // a workaround to deal with mixed cue-point behaviours
	_player = videojs('player');
	// this logic is separated out because we fetch one product at a time; when we reach four products, we load them into the sidebar so the user sees something relatively quickly
	// if all your product data was in-page already, a lot of this would be unnecessary; it's lined up to deal with being async
	var _fetchNextProduct = function() {
		if(product_ids.length && products.length<4) {
			var _prod = product_ids[0];
			var _time = _prod['time'];
			// this would typically be an AJAX call, so i'm faking the response
			// $.getJSON('/p/' + _prod.name + '/json',function(d){
			var d = {};
			d.success = true;
			d.product = product_data[_prod.name];
			if(d.success) {
				d.product['time'] = _time;
				products.push(d.product);
			}
			product_ids.shift();
			_fetchNextProduct();
			// });

		} else {
			$.each(products,function(){
				var _prod = this;
				$('.product-sheet .product-thumbs').append('<div data-time="' + _prod['time'] + '" data-product-code="' + _prod.code + '"><img src="' + _prod.image + '" /><span class="price">' + _prod.price + '</span><a href="#" class="quick-add-text hide-for-small">Quick<br>View</a></div>');
				// use the image thumbnails as chapter markers to play the video from their appearance
				$('.product-sheet .product-thumbs img').on('click',function(){
					_player.currentTime($(this).closest('div').data('time'));
					_player.play();
				})
				$('.product-sheet .product-thumbs div[data-product-code="' + _prod.code + '"]').data('product',_prod);
				$('.product-thumbs.visible-xs').append('<a href="#"><img src="' + _prod.image + '" /><span class="price">' + _prod.price + '</span></a>');
			});
			$('.product-sheet .product-thumbs a').on('click',function(ev){
				ev.preventDefault();
				// this is a simplified mechanism; you might actually just load another page inside the lightbox
				var _code = $(ev.target).closest('div[data-product-code]').data('product-code');
				var _prod = product_data['' + _code];
				var _modal = $('.modal');
				_modal.find('#product-modal-image').attr('src',_prod.image);
				_modal.find('#product-modal-price').html(_prod.price);
				_modal.find('#product-modal-name').html(_prod.name);
				_modal.find('#product-modal-desc').html(_prod.description);
				_player.pause();
				// wouldn't necessarily want to exit fullscreen to show a modal — could instead copy it into the player so it's popped up there instead of page level
				_player.exitFullscreen();
				_modal.modal('show');
			});
			try {
				_player.textTracks()[0].oncuechange();
			} catch(e) {
				//pass
			}
			_drawArrows();
			if(product_ids.length) {
				products = [];
				_fetchNextProduct();
			}
		}
	}
	var _drawArrows = function() {
		$('.product-arrow').removeClass('more-products');
		var _thumbs = $('.product-sheet .product-thumbs');
		if(_thumbs.scrollTop()){
			$('.product-arrow-up').addClass('more-products');
		}
		var _last = _thumbs.find('div[data-product-code]:last');
		if( (_last.offset().top + _last.height()) > (_thumbs.offset().top + _thumbs.height() + 37) ) {
			$('.product-arrow-down').addClass('more-products');
		}
	}
	var _initPlayer = function(){
		// unload anything that might've come before
		products = [];
		cue_times = [];
		$(_player.el()).find('.now-playing').remove();
		$('.product-thumbs').empty();
		$('.product-sheet,.product-arrow').remove();
		// basic metadata
		// var _elNow = $(_player.el()).append('<div class="now-playing">').find('.now-playing');
		// _elNow.html('<p>Now playing</p><em>' + _player.mediainfo.name + '</em>');
		// if(_player.mediainfo.long_description) {
		// 	_elNow.append(_player.mediainfo.long_description);
		// 	_elNow.find('a').append('<span>&rsaquo;</span>');
		// }
		// this is instead of using the standard autoplay mechanism
		_player.play();
		// cue points
		if(_player.mediainfo.cue_points.length) {
			$(_player.el()).append('<div class="product-sheet"><div class="product-thumbs"/><img class="product-arrow product-arrow-up" src="shoppable/arrow-up.png" /><img class="product-arrow product-arrow-down" src="shoppable/arrow-down.png" /></div>');
			var _thumbs = $(_player.el()).find('.product-thumbs');
			$(_player.el()).find('.product-arrow-up').on('click',function(){
				// _player.pause();
				arrow_active = 1;

				autoplay_shutdown()
				_thumbs.animate({scrollTop:(_thumbs.scrollTop()-_thumbs.height())}, 300, function(){_drawArrows();});
			});
			$(_player.el()).find('.product-arrow-down').on('click',function(){
				// _player.pause();
				arrow_active = 1;
				autoplay_shutdown()
				_thumbs.animate({scrollTop:(_thumbs.scrollTop()+_thumbs.height())}, 300, function(){_drawArrows();});
			});
		}
		$(_player.mediainfo.cue_points).each(function(){
		// pattern matching in case there are cue-points we know we can't handle; here I'm expecting digits only, or a list of digits
			if(this.name.match(/^[\d,]+$/)) {
				var _time = this['time'];
				var _name = this['name'];
				cue_times.push(_time);
				$(_name.split(',')).each(function(){
					if(this.length){
						product_ids.push({'time':_time,'name':this});
					}
				});
			}
		});
		_fetchNextProduct();
		if(_player.textTracks().length>=1) {
			var _tt = _player.textTracks()[0];
			_tt.oncuechange = function() {
				$('.product-thumbs div').removeClass('active');
				var active_cue = 0;
				if(_tt.activeCues[0] !== undefined) {
					active_cue = _tt.activeCues[0].startTime;
				} else {
				// this is a hack because native HLS doesn't populate activeCues, so i calculate the nearest timecode instead
					$(cue_times).each(function(){
						if(this < _player.currentTime()) {
							active_cue = this.toPrecision();
						}
					});
				}
				var _productList = $('.product-sheet .product-thumbs');
				var _productThumb = _productList.find('div[data-time="' + active_cue + '"]');
				if(_productThumb.length && arrow_active==0){
					console.log('inside');
					_productThumb.addClass('active');
					_productList.animate({scrollTop: _productList.scrollTop() + _productThumb.first().position().top - 30}, 300);
					_drawArrows();
				}
			}
		}
	}

	var autoplay_shutdown = function() {
		autoplay_replay()
		timer = setTimeout("arrow_active = 0", 5000);
	}
	var autoplay_replay = function() {
		clearTimeout(timer);
	}
	// we call this "one" time because sometimes different player tech fires the same event; this is the earliest point at which we have the metadata from videocloud in _player.mediainfo
	// we could interact directly with the _player.catalog API all the time, but this is simpler, especially for the first load
	_player.one('loadedmetadata',_initPlayer);
	// resume play when the modal is closed; you might want to track interactions and decide whether or not to play
	$('.modal').on('hidden.bs.modal',function(){
		_player.play();
	});
});
/* 
// this function isn't used here, but this is how you'd swap out a video and call for reinitialisation when the new metadata comes down
$('#other-videos div').on('click',function(){
	if($(this).closest('div').data('video-id')!=_player.mediainfo.id) {
		$(this).closest('div').addClass('loading');
		_player.catalog.getVideo($(this).closest('div').data('video-id'),function(e,v){
			if(e){ 
				console.log(e);
				$(this).closest('div').removeClass('loading');
			} else {
				_player.one('loadedmetadata',_initPlayer);
				_player.catalog.load(v);
			}
		});
	}
}); */
