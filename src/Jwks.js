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
import List from '@material-ui/core/List';
import keys from './jwks.json';

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

const jwkeys = {"keys": [
  {
    "kty": "EC",
    "kid": "2EVUsUMkQMEDbuoMs4FWzyLkxUvfRQfO2q9uHn9TEJI",
    "use": "sig",
    "alg": "ES256",
    "crv": "P-256",
    "x": "ByXzKs-3yD1dEyhF2PX0SxPzBRbW7w70D4y4MqfZU68",
    "y": "zDGufZbWTp2b0IGIgWIUWh86vUQczWYprF3Z49vwIPg"
  }
]}

function Keys() {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  return (
    <div className={classes.root}>
      <p>{JSON.stringify(jwkeys)}</p>
    </div>
  );
}

export default Keys;
