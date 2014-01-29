chrome.browserAction.onClicked.addListener(function(tab) {
	console.log('Executing script');
	chrome.browserAction.setBadgeText({text: '. . .'});
	chrome.tabs.executeScript(null, {file: "content_script.js"});
});

chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;

  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    chrome.browserAction.setBadgeText({text: ''});
  });
});