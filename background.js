chrome.browserAction.onClicked.addListener(function(tab) {
	console.log('Executing script');
	chrome.tabs.executeScript(null, {file: "content_script.js"});
});