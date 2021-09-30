#!node
'use strict';

const CryptoJS = require('crypto-js');
const Fs = require('fs');
const Path = require('path');
const Yargs = require('yargs');

const signpostFile = "signpost.json";
const publicSignpostFile = Path.join("signpost", signpostFile);
const privateSignpostFile = Path.join("signpost/private", signpostFile);
const encryptedPrivateSignpostFile = Path.join("signpost/private", signpostFile + '.enc');

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

class Encryptor {
  static encryptInternal(plaintext, password) {
    const wordSizeBytes = 4;
    const keySizeBytes = 32;
    const saltSizeBytes = 32;
    const aesBlockSizeBytes = 16;
    const iterations = 50000;

    const salt = CryptoJS.lib.WordArray.random(saltSizeBytes);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySizeBytes / wordSizeBytes, // in words
      hasher: CryptoJS.algo.SHA256,
      iterations
    });
    const iv = CryptoJS.lib.WordArray.random(aesBlockSizeBytes)
    var ciphertext = CryptoJS.AES.encrypt(plaintext, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    return { salt, iv, ciphertext };
  }

  static stringifyEncrytionComponents({ salt, iv, ciphertext }) {
    return salt.toString() + iv.toString() + ciphertext.toString();
  }

  static encrypt(plaintext, password) {
    const { salt, iv, ciphertext } = this.encryptInternal(plaintext, password);
    return this.stringifyEncrytionComponents({ salt, iv, ciphertext })
  }

  static encryptJson(obj, password) {
    const plaintext = JSON.stringify(obj, null, 2);
    return this.encrypt(plaintext, password);
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

function writeFile(path, contents) {
  try {
    Fs.writeFileSync(path, contents, { flag: 'w' });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function writeJsonToFile(path, obj) {
  const text = JSON.stringify(obj, null, 2);
  writeFile(path, text);
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

function createSignpostForFields(inputFile, outputFile, isPrivate, password = undefined) {
  const rawSignpost = loadJson(inputFile);
  const fullSignpost = hydrateWebsites(rawSignpost, isPrivate);
  const signpost = fullSignpost.filter(post => !post.hidden || isPrivate);
  if (password == null) {
    writeJsonToFile(outputFile, signpost);
  } else {
    writeFile(outputFile, Encryptor.encryptJson(signpost, password));
  }
  printSuccess(outputFile, signpost);
}

function main(password) {
  createSignpostForFields(
    signpostFile,
    publicSignpostFile,
    false)
  createSignpostForFields(
    signpostFile,
    password == null ? privateSignpostFile : encryptedPrivateSignpostFile,
    true,
    password)
}

Yargs
  .command(
    '$0 <password>',
    `Read in ${signpostFile} and write public and private signposts to ${publicSignpostFile} and ` +
    `${privateSignpostFile} respectively. If <password> is provided, encrypt private signpost with <password> ` +
    `and save the private signpost instead to ${encryptedPrivateSignpostFile}`,
    {},
    ({ password }) => main(password))
  .usage('Usage: node index.js')
  .help()
  .argv;