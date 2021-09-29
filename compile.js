#!node
'use strict';

const Fs = require('fs');
const Path = require('path');
const Yargs = require('yargs');

const signpostFile = "signpost.json";
const privateSignpostFile = Path.join("private-signpost", signpostFile);
const publicSignpostFile = Path.join("public-signpost", signpostFile);

class PublicWebsite {
  constructor(rawWebsite) {
    this.name = rawWebsite.name;
    this.description = rawWebsite.description;
    this.url = rawWebsite.url;
    this.hidden = rawWebsite.hidden == null ? false : rawWebsite.hidden === 'true';
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      url: this.url,
    }
  }
}

class PrivateWebsite extends PublicWebsite {
  constructor(rawWebsite) {
    super(rawWebsite);
    this.username = rawWebsite.username;
    this.password = rawWebsite.password;
    this.hidden = rawWebsite.hidden == null ? false : rawWebsite.hidden === 'true';
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      url: this.url,
      username: this.username,
      password: this.password
    }
  }
}

function loadJson(filename, encoding = 'utf8') {
  try {
    const file = Fs.readFileSync(filename, encoding);
    return JSON.parse(file);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function writeJson(path, contents) {
  try {
    const text = JSON.stringify(contents, null, 2)
    Fs.writeFileSync(path, text, { flag: 'w' });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function printSuccess(outputFile, signpost) {
  console.log(`wrote signposts to ${outputFile} for the following websites:`);
  signpost.forEach((website) => {
    console.log(`\t${website.url}`)
  });
}

function hydrateWebsites(rawSignpost, isPrivate) {
  return rawSignpost.map(
    (rawWebsite) => isPrivate ? new PrivateWebsite(rawWebsite) : new PublicWebsite(rawWebsite)
  );
}

function createSignpostForFields(inputFile, outputFile, isPrivate) {
  const rawSignpost = loadJson(inputFile);
  const fullSignpost = hydrateWebsites(rawSignpost, isPrivate);
  const signpost = fullSignpost.filter(post => !post.hidden || isPrivate);
  writeJson(outputFile, signpost);
  printSuccess(outputFile, signpost);
}

function main() {
  createSignpostForFields(signpostFile, privateSignpostFile, true)
  createSignpostForFields(signpostFile, publicSignpostFile, false)
}

Yargs
  .command(
    '$0',
    'derive and write public and private signpost files',
    {},
    () => {
      main();
    }
  )
  .usage('Usage: node index.js')
  .help()
  .argv;