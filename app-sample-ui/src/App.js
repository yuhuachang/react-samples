import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DataTable from './components/DataTable.js';

export const {Provider, Consumer} = React.createContext();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "Marry",
      age: 20
    };
  }

  render() {
    return (
      <div className="App">
        <Provider value={{
          state: this.state
        }}>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <DataTable />
        </Provider>
      </div>
    );
  }
}

export default App;
