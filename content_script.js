// This point to the webserved that contains the files in SERVER
var wikifierURL = 'http://greystock.cs.illinois.edu:8080/curator/curate.php';

var htmlFull = document.body.innerHTML;

wikify(htmlFull);

function wikify(html) {
	//Create the notification element
	var tmp = document.createElement("div");
	tmp.style.position="absolute";
	tmp.style.fontSize="small";
	tmp.style.paddingTop="5px";
	tmp.style.paddingLeft="10px";
	tmp.style.paddingRight="10px";
	tmp.style.left="50%";
	tmp.style.top="0%";
	tmp.style.height="30px";
	tmp.style.marginLeft="-75px";
	tmp.style.background="#FFE200";
	tmp.style.textAlign="center";
	tmp.innerHTML="Wikifying...";
	document.body.appendChild(tmp);
	console.log('Stating wikification...');
	
	var data = new FormData();
	data.append('html', html);

	console.log('Adding data');
	var xhr = this.createCORSRequest('POST', wikifierURL);

	function handleSuccess(response) {
		// alert('Sucess!');
		document.body.innerHTML = response;
		chrome.runtime.connect().postMessage({"result": "success"});
	}

	var invokedErrorCallback = false;
	function handleError() {
		if (!invokedErrorCallback)
		alert ('Could not contact wikifier!');
		document.body.removeChild(tmp);
		invokedErrorCallback = true;
		chrome.runtime.connect().postMessage({"result": "failure"});
	}

	xhr.onload = function() {
		if (xhr.responseText) {
			var response = xhr.responseText;
			handleSuccess(response);
			return;
		}
		handleError();
	};

	xhr.onerror = function(error) {
		handleError();
	};

	xhr.send(data);
}

function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		xhr.open(method, url, true);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}
