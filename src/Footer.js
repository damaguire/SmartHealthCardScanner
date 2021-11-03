import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';

const useStyles = makeStyles((theme) => ({
  appBar: {
    top: 'auto',
    bottom: 0,
    flexGrow: 1,
    background: 'linear-gradient(45deg, #68B3AF 30%, #C3DBB4 90%)',
    border: 0,
    borderRadius: 3,
    color: 'white',
    height: 40,
    padding: '0 30px',
  },
  fabButton: {
    position: 'absolute',
    flexGrow: 1
  },
  fabButton2: {
    position: 'absolute',
    flexGrow: 1,
    marginLeft: '150px',
  },
}));

function Footer() {
  const classes = useStyles();
  return (
    <div>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Button color="inherit" href="https://github.com/damaguire/SmartHealthCardScanner" className={classes.fabButton}>Github Repo</Button>
        <Button color="inherit" href="https://github.com/damaguire/SmartHealthCardScanner/commits/main" className={classes.fabButton2}>v1.3.1</Button>
      </AppBar>
    </div>
  );
}

export default Footer;
