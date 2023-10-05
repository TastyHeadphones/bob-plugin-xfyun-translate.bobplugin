function createAuthUrl(APIKey, APISecret, Spark_url) {
  const CryptoJS = require("crypto-js");

  // Manually parse the URL
  const urlParts = Spark_url.split("/");
  $log.info("urlParts: " + urlParts);
  const host = urlParts[2];
  const path = "/" + urlParts.slice(3).join("/");

  // Generate RFC1123 formatted timestamp
  const now = new Date();
  const date = now.toUTCString();

  // Concatenate string
  let signature_origin = `host: ${host}\n`;
  signature_origin += `date: ${date}\n`;
  signature_origin += `GET ${path} HTTP/1.1`;
  $log.info("signature_origin: " + signature_origin);

  // Encrypt using hmac-sha256
  const signature_sha = CryptoJS.HmacSHA256(signature_origin, APISecret);
  $log.info("signature_sha: " + signature_sha);
  const signature_sha_base64 = CryptoJS.enc.Base64.stringify(signature_sha);
  $log.info("signature_sha_base64: " + signature_sha_base64);

  const authorization_origin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha_base64}"`;
  $log.info("authorization_origin: " + authorization_origin);
  // utf-8 encoding
  const authorization = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(authorization_origin)
  );
  $log.info("authorization: " + authorization);

  // Combine request authentication parameters into an object
  const params = [
    `authorization=${encodeURIComponent(authorization)}`,
    `date=${encodeURIComponent(date)}`,
    `host=${encodeURIComponent(host)}`,
  ];

  // Concatenate authentication parameters to generate URL
  const finalUrl = `${Spark_url}?${params.join("&")}`;
  $log.info("finalUrl: " + finalUrl);

  return finalUrl;
}

function createSocket() {
  const APISecret = $option.APISecret;
  const APIKey = $option.APIKey;
  const baseUrl = "wss://spark-api.xf-yun.com/v2.1/chat";
  const url = createAuthUrl(APIKey, APISecret, baseUrl);
  const socket = $websocket.new({
    url: url,
    allowSelfSignedSSLCertificates: true,
    timeoutInterval: 100,
  });
  socket.open();
  $log.info("socket state: " + socket.readyState);
  return socket;
}

exports.createSocket = createSocket;
