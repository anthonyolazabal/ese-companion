const crypto = require('crypto');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  // Below function does not generate same hash than with Java (Bouncy Castle)
  encryptPassword: function (password, password_salt, password_iterations, algorithm) {
    switch (algorithm) {
      case 'PKCS5S2':
        return crypto.pbkdf2Sync(password, password_salt, password_iterations, 64, 'id-rsassa-pkcs1-v1_5-with-sha3-256').toString('base64');
      case 'SHA512':
        return crypto.pbkdf2Sync(password, password_salt, password_iterations, 64, `sha512`).toString(`base64`);
      case 'MD5':
        return crypto.pbkdf2Sync(password, password_salt, password_iterations, 64, `md5`).toString(`base64`);
      default:
        return null;
    }
  },
  generateSaltBase64: function (length) {
    if (length) {
      return crypto.randomBytes(length).toString('base64');
    } else {
      return crypto.randomBytes(16).toString('base64');
    }
  },
  generateHash: async function (password, password_salt, password_iterations, algorithm) {
    try {
      const { stdout, stderr } = await exec("java -jar ./src/helpers/hivemq-ese-helper.jar hash create -a " + algorithm + " -i " + password_iterations + " -p " + password + " -s " + password_salt);
      if (stdout) return stdout
      else return stderr
    } catch (e) {
      return e;
    }
  }
}