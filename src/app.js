// Подключение модуля express
const express = require('express');
const pdfjs = require('pdfjs-dist');
const fs = require('fs');
const { resolve } = require('path');

const app = express();
const port = 3000;
app.use(express.static("src"));

const bodyParser = require('body-parser');
const e = require('express');
//const multer = require('multer') // v1.0.5
//const upload = multer() // for parsing multipart/form-data

app.use(bodyParser.json()) // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Роут для корневого URL

// POST method route
app.post('/api/data', (req, res) => {
  console.log(req.body)
  switch(req.body.func) {
    case "next-page": 
    renderPage(++pdfState.currentPage).then((result) => {
      res.send({currentPage: pdfState.currentPage, page: result});
    });
    break;
    case "previous-page":
    renderPage(--pdfState.currentPage).then((result) => {
      res.send({currentPage: pdfState.currentPage, page: result});
    });
      break;
  }

  if (req.body.currentPage) {
    pdfState.currentPage = req.body.currentPage;
    renderPage(parseInt(req.body.currentPage)).then((result) => {
      res.send({currentPage: pdfState.currentPage, page: result});
    });
  }
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
  //res.send('Привет, мир! Это Express.js!');
});
app.get('/api/data', (req, res) => {
    readDocument().then((result)=>{
      res.send(result);
    });
  });

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

//read document and create canvas
//let canvas;
const pdfState = {
  _currentPage: 1,
  get currentPage() {
    return this._currentPage;
  },
  set currentPage(value) {
    if (value < 1) {
      this._currentPage = 1;
    } else {
      this._currentPage = value;
    }
  },
  pdf: null,
  canvas: null
}

const readDocument = async (fileName = "Sea Trial 007 2017") => {
  return new Promise((resolve, reject) => {
    const { createCanvas, loadImage } = require('canvas');

    const pdfPath = __dirname + '/../pdf/' + fileName + '.pdf';
    pdfState.canvas = createCanvas(200, 200);
    pdfState.currentPage = 1;

    pdfjs.getDocument(pdfPath).promise.then(pdf => {
      console.log('Last Pages', pdf.numPages);
      pdfState.pdf = pdf;

      renderPage(pdfState.currentPage, pdfState.pdf, pdfState.canvas).then((result) => {
        console.log("First page rendered.");
        resolve({pageCount: pdf.numPages, page: result});
      });
    });
  });
}

const renderPage = async (currentPage = pdfState.currentPage, pdf = pdfState.pdf, canvas = pdfState.canvas) => {
  return new Promise((resolve, reject) => {
    if (pdfState.canvas == undefined || pdfState.pdf == undefined) {
      resolve("Document not loaded!");
      return;
    }
    pdf.getPage(currentPage).then(page => {
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };

      let renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        console.log('Page rendered');
        resolve(canvas.toDataURL());
      });
    });
  });
}

//let dataURL;
let renderPdf = async () => {
  return new Promise((resolve, reject) => {
    const { createCanvas, loadImage } = require('canvas');

    const pdfPath = __dirname + '/../pdf/1.pdf';
    console.log("pdfPath", pdfPath)
    const canvasSize = 200;

    // Номер страницы, которую вы хотите отобразить
    const pageNumber = 1;
  // Создаем холст размером 200x200 пикселей
   const canvas = createCanvas(canvasSize, canvasSize);
//const ctx = canvas.getContext('2d');
    // Прочитайте PDF-файл из файловой системы
    const data = new Uint8Array(fs.readFileSync(pdfPath));
  
    // Загрузка документа PDF
    pdfjs.getDocument(pdfPath).promise.then(pdf => {
      // Загрузка первой страницы PDF в канвас
      pdf.getPage(1).then(page => {
        
        const viewport = page.getViewport({ scale: 1 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        };

        // Отображение первой страницы PDF в канвасе
         // page.render(renderContext);
          let renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
              console.log('Page rendered');
              dataURL = canvas.toDataURL();
              resolve(dataURL);
          });
      });
    });
  });
   

    //resolve(dataURL);
    //console.log(canvas.toDataURL);
    // Функция для отображения определенной страницы PDF
    function renderPage(pdf, pageNum, canvas) {
        pdf.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };

            // Отображение страницы PDF в канвасе
            page.render(renderContext);
        });
    }
}
//renderPdf()