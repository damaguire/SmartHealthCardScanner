import React from 'react';
import Scanner from './Scanner.jsx';
import ScannerFile from './ScannerFile.jsx';
import Navbar from './Navbar.js';
import Footer from './Footer.js';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <div>
          <Navbar />
          <Route exact path="/">
            <Scanner />
          </Route>
          <Route path="/file">
            <ScannerFile />
          </Route>
          <Footer />
        </div>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
