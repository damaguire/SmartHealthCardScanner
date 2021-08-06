import React, { Component, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Scanner from './Scanner.jsx';
import ScannerFile from './ScannerFile.jsx';
import Navbar from './Navbar.js';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Keys from './Jwks.js';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

// <div className={classes.root}>
//   <AppBar position="static">
//     <Toolbar>
//       <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
//         <MenuIcon />
//       </IconButton>
//       <Typography variant="h6" className={classes.title}>
//         Smart Health Card Scanner
//       </Typography>
//       <Button color="inherit" href="https://spec.smarthealth.cards/">Scan From File</Button>
//       <Button color="inherit" href="https://spec.smarthealth.cards/">Learn More</Button>
//     </Toolbar>
//   </AppBar>
//   <Scanner />
// </div>


function App() {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/.well-known/jwks.json">
          <Keys />
        </Route>
        <div>
          <Navbar />
          <Route exact path="/">
            <Scanner />
          </Route>
          <Route path="/file">
            <ScannerFile />
          </Route>
        </div>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
