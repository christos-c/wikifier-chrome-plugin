<?php
$GLOBALS['THRIFT_ROOT'] = 'thrift';
require_once $GLOBALS['THRIFT_ROOT'].'/Thrift.php';
require_once $GLOBALS['THRIFT_ROOT'].'/protocol/TBinaryProtocol.php';
require_once $GLOBALS['THRIFT_ROOT'].'/transport/TSocket.php';
require_once $GLOBALS['THRIFT_ROOT'].'/transport/THttpClient.php';
require_once $GLOBALS['THRIFT_ROOT'].'/transport/TBufferedTransport.php';
require_once $GLOBALS['THRIFT_ROOT'].'/transport/TFramedTransport.php';
require_once $GLOBALS['THRIFT_ROOT'].'/packages/curator/Curator.php';

require_once 'CURATORCONFIG.php';

$htmlOrg = $_POST["html"];
$text = cleanupHTML($htmlOrg);
// echo $text;

try {
    $hostname = $curator_hostname;
    $port = $curator_port;
	$timeout = 300;
    $socket = new TSocket($hostname, $port);
    $socket->setRecvTimeout($timeout*1000);
    $transport = new TBufferedTransport($socket, 1024, 1024);
    $transport = new TFramedTransport($transport);
    $protocol = new TBinaryProtocol($transport);
    $client = new curator_CuratorClient($protocol);
    $transport->open();
    $record = $client->getRecord($text);
    $record = $client->provide("wikifier-new", $text, true);
	$transport->close();
	$content = "";
	$labeling = $record->labelViews['wikifier-new'];
	$view_name='wikifier-new';
    $results = getLabelingHTML($record->rawText, $labeling, $view_name);
	foreach ($results as $result) {
		$link = " <a href=\"".$result['label']."\">".$result['text']."</a> ";
		$htmlOrg = preg_replace('/\s'.$result['text'].'\s/', $link, $htmlOrg);
	}
	echo $htmlOrg;
} catch (base_AnnotationFailedException $af) {
	if ($transport->isOpen()) {
		$transport->close();
	}
	$response = "<p><code>Annotation failed: $af->reason</p>";
	$response .= "<code><pre>";
	$response .= $af;
	$response .= "</pre></code>";
	echo $response;
} catch (TException $tx) {
	if ($transport->isOpen()) {
		$transport->close();
	}
	$response = "<p><code><pre>".$tx->getMessage()."</pre></code></p>";
	$response .= "<code><pre>";
	$response .= $tx;
	$response .= "</pre></code>";
	echo $response;
}


function cleanupHTML($html) {
	// Remove any non printable characters (non-ascii)
	$text = preg_replace('/[[:^print:]]/', '', $html);
	$dom = new DOMDocument;
	// To suppress warning messages from malformed HTML
	libxml_use_internal_errors(true);
	$dom->loadHTML($text); 
	$xPath = new DOMXPath($dom); 
	$nodes = $xPath->query('//a');
	if($nodes->item(0)) {
		$node = $nodes->item(0);
		$node->parentNode->replaceChild(new DOMText($node->textContent), $node); 
	}
	// This will remove most html tags
	$text = strip_tags($dom->saveHTML());
	// To get rid of in-body scripts
	// Remove function calls of the form class.function(...);
	$text = preg_replace('/(\w{1,}\.\w{1,})+\(.*?\);\s/', '', $text);
	// Remove funtions of the form fucntion();
	$text = preg_replace('/\w{1,}\(.*?\);?/', '', $text);
	// Remove {...}
	$text = preg_replace('/{[\w\W]+}/', '', $text);
	// Remove stray javascript expressions 
	$text = preg_replace('/(var|=|\+|\/|function\s\(\)|;|\{|\}|\(|\)|<|>|\*|\&|\"|\[|\]|)/', '', $text);
	return stripslashes($text);
}

function getLabelingHTML($text, $labeling, $name) {
    if (is_null($labeling)) { return; }
    $labels = $labeling->labels;
    foreach ($labels as $i => $span) {
		if (!isContained($span, $labels, $i)) {
			$label = htmlspecialchars($span->label);
			$string = htmlspecialchars(my_substr($text, $span->start, $span->ending - $span->start));
			$result[$i]['text'] = $string;
			$result[$i]['label'] = $label;
		}
    }
    return $result;
}

// Is span contained in any other span of the record?
function isContained($span, $labels, $pos) {
	foreach ($labels as $i => $otherSpan) {
		if ($i == $pos) continue;
		if ($span->start >= $otherSpan->start && $span->ending <= $otherSpan->ending)
			return true;
	}
}

function my_substr($s, $start, $length="x") {
    if ($length == "x") {
        $length = my_strlen($s) - $start;
    }
    if (function_exists('mb_substr')) {
        return mb_substr($s, $start, $length);
    } else {
        return substr($s, $start, $length);
    }
}
?>
