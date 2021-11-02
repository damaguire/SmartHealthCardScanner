import React from 'react';
import Scanner from './Scanner.jsx';
import ScannerUpdated from './ScannerUpdated.jsx';
import ScannerFile from './ScannerFile.jsx';
import ScannerFileUpdated from './ScannerFileUpdated.jsx';
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
            <ScannerUpdated />
          </Route>
          <Route path="/file">
            <ScannerFileUpdated />
          </Route>
          <Footer />
        </div>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
