chrome.browserAction.onClicked.addListener(function(activeTab) {
    var newURL = "https://www.ptt.cc/bbs/index.html";
    chrome.tabs.create({ url: newURL });
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
   if (changeInfo.status == 'complete') {
	   	chrome.bookmarks.search('ptt', function(bookmarks) {
		      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		         chrome.tabs.sendMessage(tabs[0].id, bookmarks, function(response) {});
		      });
		});
	}
});