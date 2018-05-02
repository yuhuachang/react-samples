import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import WSClient from './WSClient.js';

class App extends Component {

  // WSClient
  client = undefined;

  constructor(props) {
    super(props);

    this.state = {
      subscribedTopics: [],
      message: {
        topic: undefined,
        payload: undefined
      }
    };

    this.client = new WSClient();
    this.client.connect(
      '<region>',                // Your Region
      '<IoT endpoint>',          // Require 'lowercamelcase'!!
      '<IoT user access key>',   // your Access Key ID
      '<IoT user secret key>',   // Secret Access Key
      '<clientID>'               // clientID
    );
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
          <FormGroup row>
            <Label for="topic" sm={2}>Topic</Label>
            <Col sm={10}>
              <Input type="text" name="topic" id="topic" placeholder="message topic" onChange={(event) => {
                this.setState({
                  message: {
                    topic: event.target.value,
                    payload: this.state.message.payload
                  }
                });
              }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="message" sm={2}>Message</Label>
            <Col sm={10}>
              <Input type="textarea" name="message" id="message" placeholder="message in json format" onChange={(event) => {
                this.setState({
                  message: {
                    topic: this.state.message.topic,
                    payload: event.target.value
                  }
                });
              }} />
            </Col>
          </FormGroup>
        </Form>
        <Button onClick={() => {
          console.log(this.state);
          this.client.send(this.state.message);
        }}>Submit</Button>
      </div>
    );
  }
}

export default App;
