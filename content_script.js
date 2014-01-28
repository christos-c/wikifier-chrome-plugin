var wikifierURL = 'http://greystock.cs.illinois.edu:8080/curator/curate2.php';

var htmlText = strip(document.body.innerHTML);
var htmlFull = document.body.innerHTML;

wikify(htmlText, htmlFull);

function strip(html) {
	//First get rid of everything inside <script> tags
	html = html.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	var text = tmp.textContent || tmp.innerText || "";
	text = text.replace(/\s+/g,' ');
	return text;
}

function wikify(text, htmlOriginal) {
	var data = new FormData();
	data.append('text', text);
	data.append('html', htmlOriginal);
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
	console.log('Adding data' + text);
	var xhr = this.createCORSRequest('POST', wikifierURL);

	function handleSuccess(response) {
		// alert('Sucess!');
		document.body.innerHTML = response;
	}

	var invokedErrorCallback = false;
	function handleError() {
		if (!invokedErrorCallback)
		alert ('Could not contact wikifier!');
		document.body.removeChild(tmp);
		invokedErrorCallback = true;
	}

	xhr.onload = function() {
		if (xhr.responseText) {
			var response = xhr.responseText;
			if (response) {
				handleSuccess(response);
				return;
			}
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