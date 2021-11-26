const clipboardImgPath = '/clipboard-outline.svg';

const fields = ['name', 'description', 'type', 'url', 'username', 'password'];

function getIndicatorId(name) {
  return name.replace(' ', '_') + '_indicator'
}

function setStatus(url, success) {
  if (success) {
    let indicator = document.getElementById(getIndicatorId(url));
    console.log(getIndicatorId(url), indicator);
    indicator.setAttribute('class', 'indicator success');
  }
}

function fetchStatus(url, name) {
  let fetchStatusHack = document.createElement('img');
  fetchStatusHack.setAttribute('style', 'visibility:hidden');
  fetchStatusHack.setAttribute('src', url + '/favicon.svg');
  fetchStatusHack.onabort = () => setStatus(name, false);
  fetchStatusHack.onload = () => setStatus(name, true);
  fetchStatusHack.onerror = () => setStatus(name, false);
  document.body.appendChild(fetchStatusHack);
}

class Website {
  constructor(websiteObj) {
    fields.forEach((field) => {
      this[field] = websiteObj[field];
    });
  }

  buildLinkWrapper() {
    let webCardWrapper = document.createElement('a');
    webCardWrapper.setAttribute('href', this.url);
    webCardWrapper.setAttribute('class', 'web-card-wrapper');
    return webCardWrapper;
  }

  buildStatusIndicator() {
    let statusIndicator = document.createElement('div');
    statusIndicator.setAttribute('class', 'indicator loading');
    statusIndicator.setAttribute('id', getIndicatorId(this.name));
    fetchStatus(this.url, this.name);
    return statusIndicator;
  }

  insertHeader(webCard) {
    const headerWrapper = this.buildLinkWrapper();
    let header = document.createElement('h2');
    header.setAttribute('class', 'header');
    header.appendChild(document.createTextNode(this.name));
    header.appendChild(this.buildStatusIndicator());
    headerWrapper.appendChild(header);
    webCard.appendChild(headerWrapper);
  }

  insertCode(webCard, text) {
    if (text == null) {
      return;
    }
    let container = document.createElement('div');
    let code = document.createElement('code');
    code.appendChild(document.createTextNode(text));
    let button = document.createElement('button');
    button.setAttribute('onclick', `copyTextToClipboard(\"${text}\")`);
    button.setAttribute('class', 'clipboard-button');
    const clipboardImg = document.createElement('img');
    clipboardImg.setAttribute('src', clipboardImgPath);
    clipboardImg.setAttribute('width', '13');
    clipboardImg.setAttribute('height', '13');
    button.appendChild(clipboardImg);
    container.appendChild(button);
    container.appendChild(code);
    webCard.appendChild(container);
  }

  insertTooltip(webCard) {
    let tooltip = document.createElement('div');
    let descriptionContainer = document.createElement('span');
    descriptionContainer.appendChild(document.createTextNode(this.description));
    tooltip.appendChild(descriptionContainer);
    let typeContainer = document.createElement('span');
    typeContainer.appendChild(document.createTextNode(this.type));
    tooltip.appendChild(typeContainer);
    tooltip.setAttribute('class', 'tooltip');
    webCard.appendChild(tooltip)
  }

  buildCard() {
    let webCard = document.createElement('div');
    webCard.setAttribute('class', 'web-card');
    this.insertHeader(webCard);
    this.insertCode(webCard, this.username);
    this.insertCode(webCard, this.password);
    this.insertTooltip(webCard);
    return webCard;
  }
}