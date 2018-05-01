import moment from 'moment';
import CryptoJS from 'crypto-js';
import MQTT from 'paho.mqtt.js';

class SigV4Utils {

  static sign(key, msg) {
    let hash = CryptoJS.HmacSHA256(msg, key);
    return hash.toString(CryptoJS.enc.Hex);
  }

  static sha256(msg) {
    let hash = CryptoJS.SHA256(msg);
    return hash.toString(CryptoJS.enc.Hex);
  }

  static getSignatureKey(key, dateStamp, regionName, serviceName) {
    let kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
    let kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    let kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    let kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
    return kSigning;
  }
}

class WSClient {

  connect(regionName, awsIotEndpoint, accessKey, secretKey, clientId) {

    // create endpoint
    let time = moment.utc();
    let dateStamp = time.format('YYYYMMDD');
    let amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';

    let service = 'iotdevicegateway';
    let region = regionName;
    let algorithm = 'AWS4-HMAC-SHA256';
    let method = 'GET';
    let canonicalUri = '/mqtt';
    let host = awsIotEndpoint;

    let credentialScope = [dateStamp, region, service, 'aws4_request'].join('/');
    let canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
    canonicalQuerystring += '&X-Amz-Date=' + amzdate;
    canonicalQuerystring += '&X-Amz-SignedHeaders=host';

    let canonicalHeaders = 'host:' + host + '\n';
    let payloadHash = SigV4Utils.sha256('');
    let canonicalRequest = [method, canonicalUri, canonicalQuerystring, canonicalHeaders, 'host', payloadHash].join('\n');

    var stringToSign = [algorithm, amzdate, credentialScope, SigV4Utils.sha256(canonicalRequest)].join('\n');
    var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
    var signature = SigV4Utils.sign(signingKey, stringToSign);

    canonicalQuerystring += '&X-Amz-Signature=' + signature;
    let endpoint = 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;

    // Create a client instance
    console.log('create mqtt client with clientId ' + clientId);
    this.client = new MQTT.Client(endpoint, clientId);

    // set callback handlers
    this.client.onConnectionLost = this.onConnectionLost;
    this.client.onMessageArrived = this.onMessageArrived;

    // connection options
    var connectOptions = {
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      onSuccess: this.onConnect
    };

    // connect the client
    this.client.connect(connectOptions);
  }

  // called when the client connects
  onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("connect success! ", moment().format());
  }

  // called when the client loses its connection
  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost: " + responseObject.errorMessage, moment().format());
    }
  }

  // called when a message arrives
  onMessageArrived(message) {
    console.log("onMessageArrived/topic:" + message.destinationName, moment().format());
    console.log("onMessageArrived/payload:" + message.payloadString, moment().format());
  }

  send(message) {
    console.log(message);
    let msg = new MQTT.Message(JSON.stringify(message.payload));
    msg.destinationName = message.topic;
    console.log(msg, moment().format());
    this.client.send(msg);
  }

  subscribe(topic) {
    console.log("subscribe topic: " + topic, moment().format());
    this.client.subscribe(topic);
  }
}

export default WSClient;