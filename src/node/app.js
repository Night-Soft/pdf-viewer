// Подключение модуля express
const express = require('express');
const { performance } = require('node:perf_hooks');
const pdfjs = require('pdfjs-dist');
const { createCanvas, loadImage, CanvasRenderingContext2D } = require('canvas')
const { polyfillPath2D } = require("path2d-polyfill")

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

const fs = require('fs');
//const { resolve } = require('path');

const app = express();
const port = 3000;

const red = '\x1b[0;31m';
const green = '\x1b[0;32m';
const yellow ='\x1b[33m';
const clear = '\x1b[0m';
app.use(express.static("src"));

const bodyParser = require('body-parser');
//const e = require('express');
//const multer = require('multer') // v1.0.5
//const upload = multer() // for parsing multipart/form-data

app.use(bodyParser.json()) // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Роут для корневого URL

// POST method route
app.post('/api/data', (req, res) => {
  console.log("POST", req.body)
  const {currentPage, getPageCount, checkRend, size} = req.body;
  if (currentPage) {
    pdfState.pageNum = req.body.currentPage;
    console.log("pageNum", pdfState.pageNum);
    // pdfState.size.width = req.query.width;
    // pdfState.size.height = req.query.height;
    renderPage().then((result) => {
      res.send({
        currentPage: pdfState.pageNum,
        page: result,
        renderTime: pdfState.renderTime
      });
    });
  }
  if (getPageCount) {
    res.send({pageCount: pdfState.pageCount, currentPage: pdfState.pageNum});
    console.log("res pageCount send");
  }
  if (checkRend) {
    res.send({
      pageCount: pdfState.pageCount,
      currentPage: pdfState.pageNum,
      page: pageList.get(pdfState.pageNum),
      renderTime: pdfState.renderTime
    });
    console.log("res checkrend send");
  }
  if (size) {
    pdfState.size.width = size.width;
    pdfState.size.height = size.height;
    renderPage().then((result) => {
      res.send({
        currentPage: pdfState.pageNum,
        page: result,
        renderTime: pdfState.renderTime
      });
    });
  }
});

app.get('/', (req, res) => {
    res.sendFile("index.html", {'root': `${__dirname}/../web`});
  //res.send('Привет, мир! Это Express.js!');
});

const readPdfFolder = () => {
  fs.readdir(`${__dirname}/../../pdf`, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }
    files.forEach((file) => {
      listPdf.push(file);
      console.log(file)
    });
  });
}
const listPdf = [];
readPdfFolder();

app.get('/api/data', (req, res) => {
  console.log("req GET",req.query)
  if (req.query.document) {
    pdfState.size.width = req.query.width;
    pdfState.size.height = req.query.height;
    //console.log(pdfState)
    listPdf.forEach((fileName, index) => {
      // this filter none file
      if(req.query.document == fileName) {
       // console.log("pdfState.pdf", pdfState.pdf);
        readDocument(fileName).then((result) => {
          res.send(result);
        });
      }
    });
  }
  return;
    readDocument().then((result)=>{
      res.send(result);
    });
  });

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

//read document and create canvas
const pageList = new Map();
const pdfState = {
  renderTime: 0,
  currentFileName: null,
  page: null,
  pageCount: 1,
  size: {
    width: 1000,
    height: 800
  },
  _currentPage: 1,
  get pageNum() {
    return this._currentPage;
  },
  set pageNum(value) {
    value = parseInt(value);
    if (value < 1) {
      this._currentPage = 1;
    } else {
      if (value > this.pageCount) {
        this._currentPage = this.pageCount;
        return;
      }
      this._currentPage = value;
    }
  },
  pdf: null,
  canvas: null
}

const drawFuturePages = () => {
  
}

const readDocument = async (fileName = "sea.pdf") => {
  const timeStart = performance.now();
  return new Promise((resolve, reject) => {
    console.log(pdfState.currentFileName, fileName)
    if (pdfState.currentFileName == fileName) {
      console.log("document already read");
      // this right sent for work
      resolve({pageCount: pdfState.numPages, page: pageList.get(pageList.size)});
      return;
    }
    const { createCanvas, loadImage } = require('canvas');

    const pdfPath = __dirname + '/../../pdf/' + fileName;
    pdfState.canvas = createCanvas(200, 200);
    pdfState.pageNum = 1;

    pdfjs.getDocument(pdfPath).promise.then(pdf => {
      console.log('Page count', pdf.numPages);
      pdfState.pdf = pdf;
      pdfState.pageCount = pdf.numPages;
      pdfState.renderTime = (performance.now() - timeStart).toFixed(3);
      console.log(`The "${fileName}" loaded in ${yellow}${pdfState.renderTime}${clear} ms`);

      renderPage(pdfState.pageNum, pdfState.pdf, pdfState.canvas).then((result) => {
        console.log("First page rendered.");
        pdfState.currentFileName = fileName;
        resolve({
          pageCount: pdf.numPages,
          page: result,
          renderTime: pdfState.renderTime
        });
      });
    });
  });
}

const renderPage = async (currentPage = pdfState.pageNum, pdf = pdfState.pdf, canvas = pdfState.canvas) => {
  const timeStart = performance.now();
  return new Promise((resolve, reject) => {
    if (pdfState.canvas == undefined || pdfState.pdf == undefined) {
      resolve("Document not loaded!");
      return;
    }
    pdf.getPage(currentPage).then(page => {
      console.log("currentPage rend", currentPage);
      const calcSize = function (width, height) { // width = 800px, height = 600px
        let scaleWidth = 1, scaleHeight = 1;
        if (width > pdfState.size.width) {
          scaleWidth = pdfState.size.width / width;
        }
        if (height > pdfState.size.height) {
          scaleHeight = pdfState.size.height / height;
        }
        if (scaleWidth < scaleHeight) {
          return scaleWidth.toFixed(4);
        } else {
          return scaleHeight.toFixed(4);
        }
      }

       const viewport = page.getViewport({ scale: 1 });
       const scale = calcSize(viewport.width, viewport.height);

       console.log("viewport.scale", scale);
       canvas.height = Math.round(viewport.height * scale);
       canvas.width = Math.round(viewport.width * scale);

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: page.getViewport({ scale: scale })
      };

      let renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
      pdfState.renderTime = (performance.now() - timeStart).toFixed(3);
        console.log(`Page rendered ${yellow}${pdfState.renderTime}${clear} ms`);

        pageList.set(currentPage, canvas.toBuffer("image/jpeg", { quality: 1, progressive: false }).toString('base64'));
        //pdfState.page = canvas.toBuffer("image/jpeg", { quality: 1, progressive: false }).toString('base64')
        resolve(pageList.get(currentPage));
      });
    });
  });
}