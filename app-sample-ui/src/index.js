import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Water from './Water';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(<Water />, document.getElementById('root'));
registerServiceWorker();
