import React, { Component } from 'react';

// the default value that will pass to consumer if no provider defined.
const defaultValue = {
  state: {
    name: "no provider",
    age: 0
  },
  setName: (name) => {
    console.log('no provider');
  },
  addAge: () => {
    console.log('no provider');
  }
};

// create provider and consumer from single store.
export const {Provider, Consumer} = React.createContext(defaultValue);

// here we consume the data from provider
class Person extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: undefined,
      age: -1,
      status: "none"
    };
  }

  render() {
    return (
      <Consumer>
        {
          // here we take data from provider. "context" is the variable passed from provider.
          (context) => {

            // sync state from store.
            // if (!this.state.name) {
            //   this.setState({
            //     name: context.state.name
            //   });
            // }

            return (
              <div>
                <div>
                  Name:
                  <input type="text" value={this.state.name} onChange={(event) => {
                    this.setState({
                      name: event.target.value
                    });
                  }} />
                  <button onClick={() => {
                    //context.setName(this.state.name);
                  }}>Commit</button>
                </div>
                <div>Age: {context.state.age}</div>
                <button onClick={(event) => {
                  context.addAge();
                }}>Grow Up</button>
              </div>
            );
          }
        }
      </Consumer>
    );
  }
}

class Family extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "family name"
    };
  }

  render() {
    // components can still have its own state and properties.
    return (
      <Consumer>
        {
          // here we take data from provider. "context" is the variable passed from provider.
          // context value will pass down to all sub-components automatically.
          (context) => {
            return (
              <div>
                <div>Group: {this.props.group}</div>
                <div>
                  Family Name:
                  <input type="text" value={this.state.name} onChange={(event) => {
                    this.setState({
                      name: event.target.value
                    });
                  }} />
                  <button onClick={() => {
                    console.log(this.state.name);
                  }}>Show Family Name</button>
                </div>
                <Person />
                <Person />
                <hr />
              </div>
            );
          }
        }
      </Consumer>
    );
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "Marry",
      age: 20
    };
  }

  sleep(ms) {
    return new Promise((resolve) => {
      return setTimeout(resolve, ms);
    });
  }

  async ajaxCall(request, callback) {
    // simulate slow ajax call.
    await this.sleep(2000);
    callback("response");
  };

  render() {
    // in provider, pass the value to all consumer. here we pass the state and actions.
    return (
      <div>
        <Provider value={{

          // state object. this state is the global state of this provider.
          state: this.state,

          // action function
          setName: (name) => {
            // doing ajax call...
            console.log('begin call');
            let request = "request";
            this.ajaxCall(request, (response) => {
              console.log('end call');
              this.setState({
                name: name
              });
            });
          },

          // action function
          addAge: () => {
            this.setState({
              age: this.state.age + 1
            });
          }
        }}>

          {/* individual component in provider */}
          <Person />
          <hr />
          <Person />
          <hr />

          {/* nested component in provider */}
          <Family group="A" />
          <Family group="B" />
        </Provider>

        {/* a component outside the provider */}
        <Person />
      </div>
    );
  }
}

export default App;
