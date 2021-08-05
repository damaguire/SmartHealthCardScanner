import React, { Component, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Scanner from './Scanner.jsx';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import Toolbar from '@material-ui/core/Toolbar';

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

function Navbar() {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton href="/" edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Smart Health Card Scanner
          </Typography>
          <Button color="inherit" href="/file">Scan From File</Button>
          <Button color="inherit" href="https://spec.smarthealth.cards/">Learn More</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;
