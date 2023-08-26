// Подключение модуля express
const express = require('express');
const { performance } = require('node:perf_hooks');
const pdfjs = require('pdfjs-dist');
const { createCanvas, loadImage, CanvasRenderingContext2D } = require('canvas');
const { polyfillPath2D } = require("path2d-polyfill");
const WebSocket = require('ws');

const {TaskQueue} = require("./offiicial");

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

const fs = require('fs');
//const { resolve } = require('path');

const app = express();
const port = 3000;

const red = (str = "") => {
  const color = '\x1b[0;31m';
  return `${color}${str}${clear}`.toString();
};
const green = (str = "") => {
  const color = '\x1b[0;32m'
  return `${color}${str}${clear}`.toString();
};
const yellow = (str = "") => {
  const color = '\x1b[33m';
  return `${color}${str}${clear}`.toString();
};
const clear = '\x1b[0m';

app.use(express.static("src"));

const bodyParser = require('body-parser');
const { resolve } = require('node:path');
const { rejects } = require('node:assert');
//const e = require('express');
//const multer = require('multer') // v1.0.5
//const upload = multer() // for parsing multipart/form-data

app.use(bodyParser.json()) // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Роут для корневого URL

// POST method route
app.post('/api/data', (req, res) => {
  console.log("POST", req.body)
  const {currentPage, getPageCount, checkRend, size, futurePages} = req.body;
  if (currentPage) {
    pdfState.pageNum = req.body.currentPage;
    console.log("pageNum", pdfState.pageNum);
    // pdfState.size.width = req.query.width;
    // pdfState.size.height = req.query.height;
    const renderTask = {
      func: renderPage,
      wait: true,
      then: (result) => {
        res.send({
          currentPage: pdfState.pageNum,
          page: result,
          renderTime: pdfState.renderTime
        });
      }
    }
    renderQueue.add(renderTask)
    renderQueue.execute();
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

    /// this add all renderpages to render queue
    const renderTask = {
      func: renderPage,
      wait: true,
      then: (result) => {
        res.send({
          currentPage: pdfState.pageNum,
          page: result,
          renderTime: pdfState.renderTime
        });
      }
    }
    renderQueue.add(renderTask)
    renderQueue.execute();
  }
  if (futurePages) {
    console.log("futurePages");
    const pages = {
    }

    /// this
    pdfState.uniquePages.forEach((value) => {
      if (pageList.has(value)) {
        pages[value] = pageList.get(value);
      }
    });

    res.send({
      futurePages: true,
      pages: pages,
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
        if (pdfState.currentFileName != fileName) {
          pageList.clear();
          console.log("Page list cleared.");
        }
        readDocument(fileName).then((result) => {
          res.send(result);
        });
      }
    });
  }
  return;
  });

// Запуск сервера
const server = app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});



const wss = new WebSocket.Server({ server });
let socket;
// Обработка WebSocket-соединения
wss.on('connection', (ws) => {
  // Обработчик нового подключения клиента
  console.log('Новое соединение установлено.');
  socket = ws;
  // Обработка сообщений от клиента
  ws.on('message', (message) => {
    console.log('WS Message', JSON.parse(message));

    const {
      preparePages,
      pages,
      size = {
        width: 0,
        height: 0
      } } = JSON.parse(message);

    if (preparePages) {
      // render pages event.pages //arr
      console.log("drawFuturePages");
      pdfState.uniquePages = pages;
      const uniquePages = getUniquePages(pages, getNumbersPages(pageList));
      console.log("uniquePages", uniquePages);
      drawFuturePages(uniquePages, size, () => {
        const message = {
          futurePages: true,
          message: `The ${uniquePages.toString().replaceAll(",", ", ")} rendered.`
        }
        sendWSMessage(message)
      });
    }

  });

  // Обработчик закрытия соединения клиентом
  ws.on('close', () => {
    console.log('Соединение закрыто.');
  });
});

const sendWSMessage = (message) => {
  if (typeof message != "object") { message = {message}; }
  socket.send(JSON.stringify(message));
}

const getUniquePages = (arr1, arr2) => {
  const uniqueArr1 = [...new Set([...arr1].filter(item => item !== null))]
  const uniqueArr2 = new Set(arr2);
  const uniquePages = uniqueArr1.filter((element) => {
    if (!uniqueArr2.has(element)) {
      return true;
    }
  });
  return uniquePages;
};

function getNumbersPages(map) {
  const numbers = [];

  for (const key of map.keys()) {
    if (typeof key === 'number') {
      numbers.push(key);
    }
  }

  return numbers;
}
//read document and create canvas
const pageList = new Map();
const pdfState = {
  renderTime: 0,
  currentFileName: null,
  page: null,
  pageCount: null,
  size: {
    width: 1000,
    height: 800
  },
  _currentPage: null,
  get pageNum() {
    return this._currentPage;
  },
  set pageNum(value) {
    value = parseInt(value);
    if (value <= 1) {
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


const renderQueue = new TaskQueue();
const drawFuturePages = async (pages = [], size, callback) => {
  if (pages.length == 0 ) {
    return new Promise((resolve, reject) => {
      if (callback != undefined) {callback();}
      resolve("Render complete!");
    });
  }
  pages.forEach((page, index) => {
    if (pageList.has(page)) {
      const { width, height } = pageList.get(page);
      if (width >= size.width && height >= size.height) {
        console.log(red(`#260 The Page ${page} was rendered early!`));
        return;
      }
    }
    renderQueue.add({func: renderPage, wait: true}, page);
    if (index == pages.length - 1) {
      if (callback != undefined) {
        renderQueue.add({ func: callback });
        console.log(green("Callback added!"));
      }
    }
  });
  renderQueue.execute();
}

const readDocument = async (fileName = "sea.pdf") => {
  const timeStart = performance.now();
  return new Promise((resolve, reject) => {
    console.log(pdfState.currentFileName, fileName)
    if (pdfState.currentFileName == fileName) {
      console.log(`${green}${fileName}${clear} already read.`);
      resolve({
        pageCount: pdfState.numPages,
         page: pageList.get(pageList.size), // return last page
         pastRead: true
        });
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
      console.log(`The "${fileName}" loaded in ${yellow(pdfState.renderTime)} ms`);
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

//let isRenderBusy = false; 
const renderPage = async (currentPage = pdfState.pageNum, pdf = pdfState.pdf, canvas = pdfState.canvas) => {
  // if (isRenderBusy) {
  // return new Promise((resolve, reject) => {
  //   resolve("Render is busy!");
  // });
  // }

  const timeStart = performance.now();
 // isRenderBusy = true;
  return new Promise((resolve, reject) => {
    if (pdfState.canvas == undefined || pdfState.pdf == undefined) {
     // isRenderBusy = false;
      resolve("Document not loaded!");
      return;
    }
    if (pageList.has(currentPage)) {
      const { width, height } = pageList.get(currentPage);
      if (width >= canvas.width && height >= canvas.height) {
        //isRenderBusy = false;
        resolve(pageList.get(currentPage));
        console.log(red(`#346 The Page ${currentPage} was rendered early!`));
        return;
      }
    }

    pdf.getPage(currentPage).then(page => {
      console.log("#296 currentPage rend", currentPage);
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
        console.log(`#383 Page rendered ${yellow(pdfState.renderTime)} ms`);

        pageList.set(currentPage, {
          image: canvas.toBuffer("image/jpeg", { quality: 1, progressive: false }).toString('base64'),
          width: canvas.width,
          height: canvas.height
        });
        //isRenderBusy = false;
        resolve(pageList.get(currentPage));
      });
    });
  });
}