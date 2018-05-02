import React, { Component } from 'react';

class Counter extends Component {

  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div>
        count: {this.props.count}
        <button onClick={() => {
          this.props.actions.increment();
        }}>+</button>
      </div>
    );
  }
}

// const Counter = ({ count, actions }) => (
//   <div>
//     {count}
//     <button onClick={actions.increment}>+</button>
//   </div>
// )

export default Counter;