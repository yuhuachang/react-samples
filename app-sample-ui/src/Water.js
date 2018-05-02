import React, { Component } from 'react';
import { initStore } from 'react-waterfall'
import Counter from './components/Counter.js';

const store = {
  initialState: {
    count: 0,
    age: 0
  },
  actions: {
    increment: ({ count }) => ({ count: count + 1 }),

    add_num: ({ age }) => {
      return {
        age: age + 1
      };
    }
  }
};

const { Provider, connect } = initStore(store)

let Count = ({ count, age, actions }) => (
  <div>
    {count} | 
    {age}
    <button onClick={actions.increment}>+</button>
    <button onClick={() => {
      actions.add_num();
    }}>ADD</button>
  </div>
);

Count = connect(
  state => ({
    count: state.count,
    age: state.age
  })
)(Count);

let Counter_x = connect(
  (state) => {
    return {
      count: state.count
    };
  }
)(Counter);

const Water = () => (
  <Provider>
    <Count />
    <Counter_x />
  </Provider>
);

export default Water;