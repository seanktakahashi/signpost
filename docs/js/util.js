/**
 * 
 */
function executeIfFileExist(src, callback) {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (this.readyState === this.DONE) {
      callback()
    }
  }
  xhr.open('HEAD', src)
}

/*
 * load json file into js object
 */
function loadJSON(jsonFile, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', jsonFile, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      let res;
      try {
        res = JSON.parse(xobj.responseText);
      } catch (e) {
        console.error(`ERROR: while parsing json of ${jsonFile} got error`, e);
      }
      callback(res);
    }
  };
  xobj.send();
}

function loadTextFile(file, callback) {
  var xobj = new XMLHttpRequest();
  xobj.open('GET', file, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState === this.DONE) {
      callback(xobj.responseText);
    }
  };
  xobj.send();
}

/*
 * backup copyText function that relies on document.execCommand()
 * which needs some text area on the page to copy from
 */
function fallbackCopyTextToClipboard(text) {
  let textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom or right
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
}

/*
 * primary copyText function which relies on navigator.clipboard
 */
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    console.log('Async: Copying to clipboard was successful!');
  }, (err) => {
    console.error('Async: Could not copy text: ', err);
  });
}