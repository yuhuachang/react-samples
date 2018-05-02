import moment from 'moment';
import CryptoJS from 'crypto-js';
import MQTT from 'paho.mqtt.js';

/**
 * I used WebSocket several times.  I tried Tomcat, SpringBoot with STOMP,
 * and nodejs and express.  All of these needs a server.  I want a serverless
 * solution on AWS.  When I do the IoT project, I tried AWS IoT and it
 * supports MQTT over WebSocket.  So using AWS IoT as a WebSocket server
 * may be a solution.
 * 
 * Previously, I only tried to connect AWS IoT from my
 * hardware with nodejs code using AWS IoT SDK https://github.com/aws/aws-iot-device-sdk-js.
 * We can use TCP or WebSocket to connect AWS IoT.
 * The example in AWS IoT SDK shows us the way to connect with TCP.
 * We need to install certificate to have secured connection.
 * This seems overkilld from a browser.  The document and examples shows
 * nothing about connecting via WebSocket without these cerficicate files.
 * 
 * Then I searched and found many people have the same idea like these:
 * https://forums.aws.amazon.com/thread.jspa?messageID=767105
 * https://dzone.com/articles/websockets-with-aws-lambda
 * https://medium.com/@jparreira/receiving-aws-iot-messages-in-your-browser-using-websockets-9b87f28c2357
 * https://medium.com/@Prestomation/hacking-the-aws-js-sdk-signing-aws-iot-websockets-in-the-browser-using-the-aws-js-sdk-153b23203db
 * But none of them show very clearly how to do it until I found this:
 * https://github.com/dwyl/learn-aws-iot
 * and its idea is from this:
 * https://dev.classmethod.jp/cloud/aws/aws-iot-mqtt-over-websocket/
 * 
 * The implementation is now clear and working.  To connect to AWS IoT,
 * we do not need AWS IoT SDK for JavaScript.  We need a MQTT client that
 * can transmit by WebSocket.  We need an AWS IAM account with accessKey
 * to connect to AWS IoT.  Since this accessKey will be distributed to
 * the browser, the account's permission should be limited to only IoT
 * operations.  After that, we can connect to our IoT endpoint just like
 * we browse a website.
 * 
 * The later actions are not mentioned here.  Usually we will trigger a
 * Lambda function, do authentication, and do other jobs.
 * 
 * Other ref:
 * https://eclipse.org/paho/clients/js/
 */
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