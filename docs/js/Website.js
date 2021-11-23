const clipboardImgPath = '/clipboard-outline.svg';

const publicFields = ['name', 'description', 'url'];
const privateFields = ['username', 'password'];

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
    if (websiteObj.password != null) {
      this.private = {};
      // this is a private signpost
      privateFields.forEach((field) => {
        this.private[field] = websiteObj[field];
      });
    }
    this.public = {};
    publicFields.forEach((field) => {
      this.public[field] = websiteObj[field];
    });
  }

  buildLinkWrapper() {
    let webCardWrapper = document.createElement('a');
    webCardWrapper.setAttribute('href', this.public.url);
    webCardWrapper.setAttribute('class', 'web-card-wrapper');
    return webCardWrapper;
  }

  buildStatusIndicator() {
    let statusIndicator = document.createElement('div');
    statusIndicator.setAttribute('class', 'indicator loading');
    statusIndicator.setAttribute('id', getIndicatorId(this.public.name));
    fetchStatus(this.public.url, this.public.name);
    return statusIndicator;
  }

  buildHeader() {
    const headerWrapper = this.buildLinkWrapper();
    let header = document.createElement('h2');
    header.setAttribute('class', 'header');
    header.appendChild(document.createTextNode(this.public.name));
    header.appendChild(this.buildStatusIndicator());
    headerWrapper.appendChild(header);
    return headerWrapper;
  }

  buildCode(text) {
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
    return container;
  }

  buildTooltip() {
    let tooltip = document.createElement('span');
    tooltip.appendChild(document.createTextNode(this.public.description));
    tooltip.setAttribute('class', 'tooltip');
    return tooltip;
  }

  buildCard() {
    let webCard = document.createElement('div');
    webCard.setAttribute('class', 'web-card');
    webCard.appendChild(this.buildHeader());
    if (this.private != null) {
      webCard.appendChild(this.buildCode(this.private.username));
      webCard.appendChild(this.buildCode(this.private.password));
    }
    const tooltip = this.buildTooltip();
    webCard.appendChild(tooltip);
    return webCard;
  }
}