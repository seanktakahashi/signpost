#!node
'use strict';

const CryptoJS = require('crypto-js');
const Fs = require('fs');
const Path = require('path');
const Yargs = require('yargs');

const signpostFile = "signpost.json";
const publicSignpostFile = Path.join("docs", signpostFile);
const privateSignpostFile = Path.join("docs/private", signpostFile);
const encryptedPrivateSignpostFile = Path.join("docs/private", signpostFile + '.enc');

class Website {
  constructor(rawWebsite) {
    this.name = rawWebsite.name;
    this.description = rawWebsite.description;
    this.type = rawWebsite.type;
    this.url = rawWebsite.url;
    this.username = rawWebsite.username;
    this.password = rawWebsite.password;
    this.private = rawWebsite.private == null ? false : rawWebsite.private === 'true';
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      url: this.url,
      username: this.username,
      password: this.password,
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

function createSignpostForFields(inputFile, outputFile, isPrivate, password = undefined) {
  const rawSignpost = loadJson(inputFile);
  const fullSignpost = rawSignpost.map((rawWebsite) => new Website(rawWebsite));
  const signpost = fullSignpost.filter(post => post.private == isPrivate);
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
  .usage('Usage: node compile.js <password>')
  .help()
  .argv;
