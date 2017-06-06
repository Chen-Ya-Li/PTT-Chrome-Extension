$(function() {
	init();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var FavArticle = {};
	var articlesLen = Object.keys(request).length;

    for(var i = 0; i < articlesLen; i++) {
    	var link = request[i].url.replace(/https:\/\/www.ptt.cc(.*?)$/, '$1');
    	FavArticle[link] = '';
    }

    $('.title').each(function() {
		if(FavArticle.hasOwnProperty($(this).find('a').attr('href'))) {
			$(this)[0].insertAdjacentHTML('beforeend','<span class="favArticle">&#9733;</span>');
		}
	});
});

function init() {
	var btnCls = $(".btn-group-cls"),
	   	btnDir = $(".btn-group-dir"),
	   	btnShareFB = $('.share span');

	if(btnCls.length > 0) {
		btnCls[0].insertAdjacentHTML('beforeend', '<a id="myfavBtn" class="btn custom-btn">My Favorite</a>');
		btnCls[0].insertAdjacentHTML('beforeend', '<a id="editBtn" class="btn custom-btn">Edit</a>');
	}else if(btnDir.length > 0) {
		btnDir[0].insertAdjacentHTML('afterbegin', '<a id="hotBtn" class="btn" href="/bbs/hotboards.html">熱門看板</a>');
		btnDir[0].insertAdjacentHTML('beforeend', '<a id="myfavBtn" class="btn custom-btn">My Favorite</a>');
	}else if(btnShareFB.length > 0) {
		btnShareFB[0].insertAdjacentHTML('afterend', '<button type="button" id="fbBtn" class="btn custom-btn">Share to FB</button>');
		$("#fbBtn").bind('click', shareFB);
	}

	$('#myfavBtn').one('click', showFavoriteBoards);
	$('#editBtn').one('click', editFavoriteBoards);

	createFavIcon();

	$(".checkFavBoard").css('display', 'none');
}

function shareFB() {
	var url = 'https://www.facebook.com/share.php?u='+encodeURI(document.URL);
	window.open(url, "_blank", 'toolbar=no, location=no, resizable=no');
}

function showFavIcon() {
	getFavoriteBoards(function(boardList) {
		$('.checkFavBoard').each(function() {
			var boardName = $(this).parent('a').find('.board-name').text(),
				isFavBoard = boardList.hasOwnProperty(boardName);
			$(this).css('display', isFavBoard ? '' : 'none');
			$(this).data( {'oriVal': isFavBoard, 'changedVal': isFavBoard} );
		});
	});
}

function createFavIcon() {
	$('.checkFavBoard').length > 0 && $('.checkFavBoard').remove();

	$('.board').each(function() {
		$(this)[0].insertAdjacentHTML('beforeend','<span class="checkFavBoard">&#9829;</span>');
	});
}

function setCSS(action) {
	$('.btn-group .btn').removeClass('selected');
	$(this).addClass('selected').text(action);
	$('#main-container, .bbs-screen').css('opacity', action === 'Done' ? 0.75 : 1);
	$('.checkFavBoard').css('display', action === 'Done' ? 'initinal' : 'none');
	$('.btn-group .btn:not([id=editBtn])').css('pointer-events', action === 'Done' ? 'none' : 'auto');
}

function showFavoriteBoards(boards) {
	setCSS.call(this, 'My Favorite');
	$('#editBtn').one('click', createFavIcon);

	getFavoriteBoards(function(boardList) {
		var htmlStr = [];

		for(board in boardList) {
			if(boardList[board][1] === '') {
				htmlStr.push('<div class="b-ent"><a class="board" href="/bbs/'+board+'/index.html">');
			}else {
				htmlStr.push('<div class="b-ent"><a class="board" href="/cls/'+boardList[board][1]+'">');
			}
			htmlStr.push('<div class="board-name">'+board+'</div>');
			htmlStr.push('<div class="board-class">'+boardList[board][0]+'</div>');
			htmlStr.push('</a></div>')
		}

		$('.action-bar-margin').html(htmlStr.join(''));
		$('.bbs-footer-message').remove();
	});
}

function editFavoriteBoards() {
	setCSS.call(this, 'Done');
    showFavIcon();

    $('.board').bind('click', function() {
		var checkThis = $(this).find('.checkFavBoard'),
			isFavBoard = checkThis.data("changedVal");
		checkThis.data("changedVal", !isFavBoard).css("display", isFavBoard ? 'none' : '');
		return false;
	});

    $(this).one("click", doneFavoriteBoards);
}

function doneFavoriteBoards() {
	setCSS.call(this, 'Edit');
    $('.board').unbind('click');

    saveConfig();

    $(this).one("click", editFavoriteBoards);
}

function setFavoriteBoards(addBoardList, rmBoardList) {
	chrome.storage.sync.set(addBoardList, function() {
	});

	chrome.storage.sync.remove(rmBoardList, function() {
	});

	location.reload();
}

function getFavoriteBoards(callback) {
	chrome.storage.sync.get(null, function(boardList) {
		callback(boardList);
	});
}

function saveConfig() {
	var addBoardList = {},
	    rmBoardList = [],
	    clsPattern = /\/cls\//,
	    isChanged = false;

	$('.checkFavBoard').each(function() {
		var clsLink = '',
		    oriVal = $(this).data('oriVal'),
		    nowVal = $(this).data('changedVal'),
			parentA = $(this).parent('a'),
			href = parentA.attr('href'),
			boardClass = parentA.find('.board-class').text(),
			boardName = parentA.find('.board-name').text();

		clsLink = clsPattern.test(href) ? href.replace(/\/cls\/(\d+)$/, '$1') : '';

		if(oriVal !== nowVal) {
			isChanged = true;

			if(oriVal === false && nowVal === true) {
				addBoardList[boardName] = [boardClass, clsLink];
			}else if(oriVal === true && nowVal === false) {
				rmBoardList.push(boardName);
			}
		}
	});

	if(isChanged) {
		setFavoriteBoards(addBoardList, rmBoardList);
	}
}