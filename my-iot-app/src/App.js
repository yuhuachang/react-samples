import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'reactstrap';

//import AWS from 'aws-sdk';
// import AWSIoTData from 'aws-iot-device-sdk';
// import thingShadow from 'aws-iot-device-sdk';

//import awsIot from 'aws-iot-device-sdk';

import CryptoJS from 'crypto-js';
import moment from 'moment';
import Paho from 'paho.mqtt.js';

var data = {
  messages: []
};

// document.getElementById('send').addEventListener('click', function (e) {
//   var say = document.getElementById('say')
//   send(say.value);
//   say.value = '';
// });

function SigV4Utils(){}

SigV4Utils.sign = function(key, msg) {
  var hash = CryptoJS.HmacSHA256(msg, key);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.sha256 = function(msg) {
  var hash = CryptoJS.SHA256(msg);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
  var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
  var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
};

function createEndpoint(regionName, awsIotEndpoint, accessKey, secretKey) {
  var time = moment.utc();
  var dateStamp = time.format('YYYYMMDD');
  var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
  var service = 'iotdevicegateway';
  var region = regionName;
  var secretKey = secretKey;
  var accessKey = accessKey;
  var algorithm = 'AWS4-HMAC-SHA256';
  var method = 'GET';
  var canonicalUri = '/mqtt';
  var host = awsIotEndpoint;

  var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
  var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
  canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
  canonicalQuerystring += '&X-Amz-Date=' + amzdate;
  canonicalQuerystring += '&X-Amz-SignedHeaders=host';

  var canonicalHeaders = 'host:' + host + '\n';
  var payloadHash = SigV4Utils.sha256('');
  var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;

  var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  SigV4Utils.sha256(canonicalRequest);
  var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
  var signature = SigV4Utils.sign(signingKey, stringToSign);

  canonicalQuerystring += '&X-Amz-Signature=' + signature;
  return 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
}

var endpoint = createEndpoint(
    'us-west-2',                                           // Your Region
    'a22j5sm6o3yzc5.iot.us-west-2.amazonaws.com', // Require 'lowercamelcase'!!
    'HKAEFLJBLKJHFAKJ',                                    // your Access Key ID
    '1234556664smblvmnbxvmbEXAMPLEQI5cTtu/aCbCi');         // Secret Access Key
var clientId = Math.random().toString(36).substring(7);

console.log(Paho);
console.log(Paho.MQTT);
console.log(Paho.MQTT.Client);

var client = new Paho.MQTT.Client(endpoint, clientId);
var connectOptions = {
  useSSL: true,
  timeout: 3,
  mqttVersion: 4,
  onSuccess: subscribe
};
client.connect(connectOptions);
client.onMessageArrived = onMessage;
client.onConnectionLost = function(e) { console.log(e) };

function subscribe() {
  client.subscribe("Test/chat");
  console.log("subscribed");
}

function send(content) {
  var message = new Paho.MQTT.Message(content);
  message.destinationName = "Test/chat";
  client.send(message);
  console.log("sent");
}

function onMessage(message) {
  data.messages.push(message.payloadString);
  console.log("message received: " + message.payloadString);
}

class App extends Component {

  constructor(props) {
    super(props);

    // let device = awsIot.device({
    //   keyPath: "0906767136-private.pem.key",
    //   certPath: "0906767136-certificate.pem.crt",
    //   caPath: "VeriSign-Class 3-Public-Primary-Certification-Authority-G5.pem",
    //   clientId: "a-number-representing-this-client",
    //   host: "a22j5sm6o3yzc5.iot.us-west-2.amazonaws.com"
    // });

    this.state = {
      myValue: "Hello",
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Form>
          <FormGroup>
            <Label for="myValue">Test Value</Label>
            <Input type="text" name="myValue" id="myValue" placeholder="write something..."
              value={this.state.myValue} onChange={(event) => {
                this.setState({
                  myValue: event.target.value
                });
              }} />
          </FormGroup>
        </Form>
        <Button onClick={() => {
          console.log(this.state);
        }}>Test</Button>
      </div>
    );
  }
}

export default App;
