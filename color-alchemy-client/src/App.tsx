import React from 'react';
import './App.css';
import Game from './comp/game';
import { AppUtil } from './util/appUtil';


function App() {
  AppUtil.setEnvVaribales();

  return (
    <div className="App">
        <Game />
    </div>
  );
}

export default App;
