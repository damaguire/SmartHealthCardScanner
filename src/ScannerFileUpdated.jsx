import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ReportIcon from '@material-ui/icons/Report';
import Loader from "react-loader-spinner";
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';
import { BrowserQRCodeReader } from '@zxing/browser';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const axios = require("axios").default;
const jose = require('node-jose');
const pako = require('pako');

const useStyles = makeStyles({
  root: {
    marginTop:'20px',
    marginBottom:'40px',
    wordWrap: 'break-word'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  button: {
    background: 'linear-gradient(45deg, #68B3AF 30%, #C3DBB4 90%)',
    border: 0,
    borderRadius: 3,
    color: 'white',
    height: 30,
    padding: '0 30px',
  }
});

const ScannerFile = () => {
  const [pdfBytes2, setPDFBytes2] = useState('');
  const [result, setResult] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [signatureJWS, setSignatureJWS] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('{}');
  const [decodedPayload, setDecodedPayload] = useState('{}');
  const [verified, setVerification] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cvxCode, setCVXCode] = useState('');
  const [vaccDate1, setVaccDate1] = useState('');
  const [vaccDate2, setVaccDate2] = useState('');
  const [inVCI, setInVCI] = useState(false);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('Awaiting File Upload');

  let vaccDateSwitch1;
  let vaccDateSwitch2;
  let flipped;

  const getIssuerCred = async (data) => {
    try {
      let jwks;
      const issuerHere = JSON.parse(pako.inflateRaw(Buffer.from(data.split(".")[1], "base64"), { to: 'string'})).iss;
      let issEndpoint = issuerHere + '/.well-known/jwks.json';
      const response = await axios.get(issEndpoint);
      jwks = response.data;
      const keystore = await jose.JWK.asKeyStore(jwks);
      const result = await jose.JWS.createVerify(keystore).verify(data);
      jwks.keys.forEach(e => {
        if(result.key.kid === e.kid) {
          console.log(e.kid);
          setVerification(true);
        } else {
          setError('Signature is not valid from the listed issuer.')
        }
      })
      let issDir = await axios.get("https://raw.githubusercontent.com/the-commons-project/vci-directory/main/vci-issuers.json");
      if(issDir.data.participating_issuers.some(e => e.iss === issuerHere )) {
        setInVCI(true);
      }
      setResult(true)
    } catch (err) {
      setError("Please hold the QR code up for a bit longer!")
    }
  }

  const handleScan = async (data, type) => {
    if (data) {
      setScanned(true);
      let splitData;
      if(type === "img") {
        splitData = data.split("/")[1].match(/(..?)/g).map((number) => String.fromCharCode(parseInt(number, 10) + 45)).join("");
      } else {
        splitData = data;
      }
      setSignatureJWS(splitData.split(".")[2]);
      setDecodedHeader(JSON.stringify(JSON.parse(Buffer.from(splitData.split(".")[0], "base64")), null, 2));
      setDecodedPayload(JSON.stringify(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'}))));
      setFirstName(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].given[0]);
      setLastName(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].family);
      setMiddleInitial(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].given[1]);
      setBirthDate(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.birthDate);
      vaccDateSwitch1 = new Date(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
      vaccDateSwitch2 = new Date(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
      flipped = vaccDateSwitch1 > vaccDateSwitch2;
      setFileName(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].given[0] +
        JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].family +"_SHC.pdf");
      switch(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.vaccineCode.coding[0].code) {
        case "207":
          setCVXCode("MODERNA");
          if (flipped) {
            setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
          } else {
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            try{
              setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
            } catch (error) {
              setVaccDate1('')
            }
          }
          break;
        case '208':
          setCVXCode("PFIZER");
          if (flipped) {
            setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
          } else {
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            try{
              setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
            } catch (error) {
              setVaccDate1('')
            }
          }
          break;
        case '210':
          setCVXCode("ASTRAZENECA");
          if (flipped) {
            setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
          } else {
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            try{
              setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
            } catch (error) {
              setVaccDate1('')
            }
          }
          break;
        case '212':
          setCVXCode("JOHNSON & JOHNSON");
          setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
          break;
        default:
          setCVXCode("Unknown");
          if (flipped) {
            setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
          } else {
            setVaccDate1(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime);
            try{
              setVaccDate2(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime);
            } catch (error) {
              setVaccDate1('')
            }
          }
          break;
      }
        createPDF(data, splitData);
      }
  }

  const createPDF = async (data, splitData) => {
    getIssuerCred(splitData);
    let buf = await generateQR(data);
    const existingPdfBytes = await fetch(
      "https://shcverifierpdfbucket.s3.us-west-1.amazonaws.com/BlankSHCforDL.pdf"
    ).then((res) => res.arrayBuffer());
    // var bytes = new Uint8Array(existingPdfBytes);
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    // Load in both fonts we wish to use
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    // Get the number of pages in the PDF doc (demo is only one page)
    const pages = pdfDoc.getPages();
    // Get the first page
    const firstPage = pages[0];
    // Get the PDF width and height and assign to variables
    const { width, height } = firstPage.getSize();
    // Convert the pngURI into image bytes
    const pngImage = await pdfDoc.embedPng(buf);
    const pngDims = pngImage.scale(0.45);
    let actor1;
    let actor2;
    if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.performer == null) {
      actor1 = "Performer was not provided"
    } else {
      actor1 = JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.performer[0].actor.display
    }
    if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.performer== null) {
      actor2 = "Performer was not provided"
    } else {
      actor2 = JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.performer[0].actor.display
    }

    firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].given[0] + " " +
      JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.name[0].family, {
      x: 52,
      y: height / 2 + 170,
      size: 12,
      font: helveticaBold,
      color: rgb(.10, .10, .30),
    });
    // Draw the patients birth date on the PDF
    firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[0].resource.birthDate, {
      x: 213,
      y: height / 2 + 170,
      size: 12,
      font: helveticaBold,
      color: rgb(.10, .10, .30),
    });

    firstPage.drawImage(pngImage, {
      x: 762 / 2 - pngDims.width / 2 + 75,
      y: height / 2 - pngDims.height + 245,
      width: pngDims.width,
      height: pngDims.height,
    })
    switch(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.vaccineCode.coding[0].code) {
      // ASTRAZENECA
      case "210":// Draw the vaccine manufacturer name and lot on the page
        if(flipped === true) {
          firstPage.drawText("AstraZeneca, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime + ", Dose 1, " +
              actor2, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime !== '') {
            firstPage.drawText("AstraZeneca, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime  + ", Dose 2, " +
              actor1, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        } else {
          firstPage.drawText("AstraZeneca, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime + ", Dose 1, " +
              actor1, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime !== '') {
            firstPage.drawText("AstraZeneca, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime  + ", Dose 2, " +
              actor2, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        }
        break;
      // JnJ
      case "212":
        // Draw the vaccine manufacturer name and lot on the page
        firstPage.drawText("Johnson and Johnson, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
          x: 82,
          y: height / 2 + 127,
          size: 12,
          font: helveticaBold,
          color: rgb(.10, .10, .30),
        });
        // Draw the first vaccination event information on the page
        firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime + ", Dose 1 " +
          JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.performer[0].actor.display, {
          x: 82,
          y: height / 2 + 97,
          size: 10,
          font: helveticaFont,
          color: rgb(.10, .10, .30),
        });
        break;
      // Moderna
      case "207":
        // Draw the vaccine manufacturer name and lot on the page
        if(flipped === true) {
          firstPage.drawText("Moderna, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime + ", Dose 1, " +
              actor2, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Moderna, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime  + ", Dose 2, " +
              actor1, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        } else {
          firstPage.drawText("Moderna, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime + ", Dose 1, " +
              actor1, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          console.log("here",vaccDate1 );
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Moderna, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime  + ", Dose 2, " +
              actor2, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        }
        break;
      // Pfizer
      case "208":
        // Draw the vaccine manufacturer name and lot on the page
        if(flipped === true) {
          firstPage.drawText("Pfizer, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime + ", Dose 1, " +
              actor2, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Pfizer, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime  + ", Dose 2, " +
              actor1, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        } else {
          firstPage.drawText("Pfizer, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime + ", Dose 1, " +
              actor1, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Pfizer, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime  + ", Dose 2, " +
              actor2, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        }
        break;
      default:
        if(flipped === true) {
          firstPage.drawText("Unknown, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime + ", Dose 1, " +
              actor2, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Unknown, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime  + ", Dose 2, " +
              actor1, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        } else {
          firstPage.drawText("Unknown, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.lotNumber, {
            x: 82,
            y: height / 2 + 127,
            size: 12,
            font: helveticaBold,
            color: rgb(.10, .10, .30),
          });
          // Draw the first vaccination event information on the page
          try{
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[1].resource.occurrenceDateTime + ", Dose 1, " +
              actor1, {
              x: 82,
              y: height / 2 + 97,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          } catch (error) {
            console.log(error);
          }
          if(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime !== '') {
            firstPage.drawText("Unknown, Lot#" + JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.lotNumber, {
              x: 82,
              y: height / 2 + 58,
              size: 12,
              font: helveticaBold,
              color: rgb(.10, .10, .30),
            });
            // Draw the second vaccination event information on the page
            firstPage.drawText(JSON.parse(pako.inflateRaw(Buffer.from(splitData.split(".")[1], "base64"), { to: 'string'})).vc.credentialSubject.fhirBundle.entry[2].resource.occurrenceDateTime  + ", Dose 2, " +
              actor2, {
              x: 82,
              y: height / 2 + 28,
              size: 10,
              font: helveticaFont,
              color: rgb(.10, .10, .30),
            });
          }
        }
        break;
    }
    const pdfBytes = await pdfDoc.save();
    var bytes = new Uint8Array(pdfBytes);
    var blob = new Blob([bytes], { type: "application/pdf" });
    const docUrl = URL.createObjectURL(blob);
    setPDFBytes2(docUrl);
  }

  const generateQR = async (uri) => {
    try {
      console.log(await QRCode.toDataURL(uri))
      return await QRCode.toDataURL(uri);
    } catch (err) {
      console.error(err)
    }
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const handleExpandClick2 = () => {
    setExpanded2(!expanded2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileName = e.target.files[0].name;
    if(fileName.slice(fileName.length - 4) === '.jpg' || fileName.slice(fileName.length - 4) === '.png') {
      let uplIMG = URL.createObjectURL(e.target.files[0]);
      const codeReader = new BrowserQRCodeReader();
      try{
        const resultImage = await codeReader.decodeFromImageUrl(uplIMG);
        console.log(resultImage);
        handleScan(resultImage.text, "img");
      } catch (error) {
        console.log(error);
        setMessage("Unable to read QR in file. Please try a different one!")
      }
    } else if (fileName.slice(fileName.length - 18) === '.smart-health-card') {
      const reader = new FileReader()
      let text;
      reader.readAsText(e.target.files[0]);
      reader.onload = async (e) => {
        text = (JSON.parse(e.target.result).verifiableCredential[0])
        // setSHCFile(e.target.result)
        handleScan(text, "shc");
      };
    } else {
      setMessage("File type not supported. Only .jpg, .png, and .smart-health-card files are supported!");
    }
  }



  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Box display="flex" justifyContent="center">
        <Paper elevation={3} />
        <Container maxWidth="sm" >
          <Card className={classes.root} >
            <CardHeader style={{ textAlign: "center"}}
              title="Smart Health Card File Reader"
              subheader="All data is handled client side! Nothing is ever sent to the server!"
            />
          <CardHeader style={{ textAlign: "center"}}
              subheader="This tool has not been officially reviewed by a security team so use it at your own risk!"
            />
          <CardHeader style={{ textAlign: "center"}}
              subheader="Upload your QR code in a .jpg or .png format or your .smart-health-card file!"
            />
          <CardContent style={{display: "flex", justifyContent: "center"}} >
            <div>
              <input id="f" type="file" onChange={(e) => handleSubmit(e)}/>
            </div>
            </CardContent>
            <CardContent>
              {!scanned ?
                <div style={{ textAlign: "center"}}>
                  <h3>{message}</h3>
                </div>
                : [
                  !verified  ?
                    <Loader
                      type="TailSpin"
                      color="#a794d1"
                      height={50}
                      width={50}
                    />
                  : [
                    result ?
                    [
                      inVCI ?
                        <div>
                          <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Payload Verified!</p>
                          <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Signature Verified!</p>
                          <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Issuer Verified in VCI Directory!</p>
                          <a href={pdfBytes2} download={fileName}>
                             <Button className={classes.button}>Download as PDF</Button>
                          </a>
                        </div>
                        :
                        <div>
                          <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Payload Verified!</p>
                          <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Signature Verified!</p>
                          <p style={{color: "red"}}><ReportIcon style={{fill: "red"}}/> Issuer Not Verified in VCI Directory!</p>
                        </div>
                    ]
                    :
                      <div>
                        <p style={{color: "green"}}><CheckCircleOutlineIcon style={{fill: "green"}}/> Payload Verified!</p>
                        <p style={{color: "red"}}><ReportIcon style={{fill: "red"}}/> Signature NOT Verified!</p>
                        <p style={{color: "red"}}><ReportIcon style={{fill: "red"}}/> Issuer Not Verified in VCI Directory!</p>
                      </div>
                  ]
                ]
              }
            </CardContent>
            <CardActions disableSpacing>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded2,
                })}
                onClick={handleExpandClick2}
                aria-expanded={expanded2}
                aria-label="show more"
              >
                <ExpandMoreIcon />
                <p>Parsed Information</p>
              </IconButton>
            </CardActions>
            <Collapse in={expanded2} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography paragraph variant="h6">Name:</Typography>
                <Typography paragraph>{firstName} {middleInitial} {lastName}</Typography>
                <Typography paragraph variant="h6">Birth Date</Typography>
                <Typography paragraph>{birthDate}</Typography>
                <Typography paragraph variant="h6">Vaccine Received:</Typography>
                <Typography paragraph>{cvxCode}</Typography>
                <Typography paragraph variant="h6">Vaccine Date One:</Typography>
                <Typography paragraph>{vaccDate1}</Typography>
                <Typography paragraph variant="h6">Vaccine Date Two:</Typography>
                <Typography paragraph>{vaccDate2}</Typography>
              </CardContent>
            </Collapse>
            <CardActions disableSpacing>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
                <p>Full JWS</p>
              </IconButton>
            </CardActions>
            <CardContent>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Typography paragraph variant="h6">Header:</Typography>
                <ReactJson style={{wordBreak: "break-all"}} collapsed="true" indentWidth="2" src={JSON.parse(decodedHeader)} />
                <Typography paragraph variant="h6" style={{marginTop: 20}}>Payload:</Typography>
                <ReactJson style={{wordBreak: "break-all"}} indentWidth="2" src={JSON.parse(decodedPayload)} />
                <Typography paragraph variant="h6" style={{marginTop: 20}}>Signature:</Typography>
                <Typography paragraph variant="body">{signatureJWS}</Typography>
              </Collapse>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </div>
  )
}

export default ScannerFile;
