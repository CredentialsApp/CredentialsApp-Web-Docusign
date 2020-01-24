const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const secp256k1 = require("secp256k1");
const privateSecret =
  "4107E215B2E4907348E67E4B77FA7CC0DF1897DB342316520DBA5ED9CB0E1C1B";
const randomHash = "ffffffff";

const generatePublicKey = object => {
  var doctorNameHash = CryptoJS.SHA256(object.doctorName).toString(
    CryptoJS.enc.Hex
  );

  var clinicNameHash = CryptoJS.SHA256(object.clinicName).toString(
    CryptoJS.enc.Hex
  );

  var passwordHash = CryptoJS.SHA256(object.password).toString(
    CryptoJS.enc.Hex
  );

  var privateKeyHash =
    doctorNameHash + "ffffffff" + clinicNameHash + "ffffffff" + passwordHash;

  var privateKey = crypto
    .createHmac("sha256", privateSecret)
    .update(privateKeyHash)
    .digest("base32");

  const publicKey = secp256k1.publicKeyCreate(privateKey).toString("base64");

  return publicKey;
};

module.exports = {
  generatePublicKey
};
