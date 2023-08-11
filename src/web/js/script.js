const modal = document.getElementsByClassName('modal')[0];
const currentPage = document.getElementById('CurrentPage');
const pdfContainer = document.getElementById('pdfContainer');
const backgroundImage = document.getElementsByClassName('backround-image ')[0];
const fullScreenBtn = document.getElementById('FullScreenBtn');
const spinUp = document.getElementsByClassName('spin-up')[0];
const spinDown = document.getElementsByClassName('spin-down')[0];
const okBtn = document.getElementsByClassName('ok-btn')[0];
const controlContainer = document.getElementsByClassName('control-container')[0];
const slider = document.getElementsByClassName('slider')[0];
const testBtn = document.querySelectorAll(".test-btn-text")[0];

const pdfState = {
  get pageCount() {
    return parseInt(currentPage.getAttribute('max'));
  },
  set pageCount(value) {
    value = parseInt(value);
    if (value < this.pageNumber) {
      this.pageNumber = value;
    }
    currentPage.setAttribute('max', value);
    slider.setAttribute('max', value);
  },
  _pageNumber: 1,
  get pageNumber() {
    return this._pageNumber;
  },
  set pageNumber(value) {
    value = parseInt(value);
    if (value < 1) {
      this._pageNumber = 1;
      currentPage.value = this._pageNumber;
      slider.value = this._pageNumber;
    } else {
      if (value > this.pageCount) {
        this._pageNumber = this.pageCount;
        currentPage.value = this._pageNumber;
        slider.value = this._pageNumber;
      }
      this._pageNumber = value;
      currentPage.value = this._pageNumber;
      slider.value = this._pageNumber;
    }
  },
};

// eslint-disable-next-line no-unused-vars
const previousPage = () => {
  if (currentPage.value == 1) return;
  getPage({currentPage: parseInt(currentPage.value) - 1});
};

// eslint-disable-next-line no-unused-vars
const nextPge = () => {
  if (currentPage.value == pdfState.pageCount) return;
  getPage({currentPage: parseInt(currentPage.value) + 1});
};

let pageList = {
  /**
 * Represents a book.
 * @param {key} number - The number of the page.
 * @param {string} image - The Base64 URL.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 */
  set(key, image, width, height) {
    const type = ["string", "number", "number"];
    // Object.entries({ image, width, height }).filter((element, index) => {
    //   if (element[1] == undefined) {
    //     throw new ReferenceError(`The '${element[0]}' is undefined, should be ${type[index]}!`);
    //   }
    //   if (typeof element[1] != type[index]) {
    //     throw new ReferenceError(`The '${element[0]}' is '${typeof element[1]}', must be a ${type[index]}!`);
    //   }
    // });
    if (Number.isNaN(Number(key))) {
      throw new ReferenceError(`The '${key}' is not 'number'`);      
    }
    this[key] = { image, width, height };
  },
  get(key) {
    return this[key];
  },
  show(howMany = true) {
    if (howMany === true) {
      let keys = Object.keys(this);
      let obj = {}
      for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < this.numbers.length; j++) {
          if (keys[i] == this.numbers[j]) {
          obj[keys[i]] = this.get(keys[i]);
          }
        }
      }
      return obj;
    }
  },
  clear() {
    for (let i = 0; i < this.numbers.length; i++) {
      delete this[this.numbers[i]];
    }
    this.numbers.length = 0;
  },
  numbers: []

}

pageList = new Proxy(pageList, {
  set(target, key, {image, width, height}, receiver) {
    const obj = {
      number: Number(key),
      image: image,
      width: width,
      height: height
    }
    target.numbers.push(Number(key));
    return Reflect.set(target, key, obj, receiver);
  },
});

//pageList.set("b", "url", 100, 200);
pageList.set("300", "url", 100, 200);

console.log(pageList.get("b"));

const spinDelay = new DelayLastEvent({delay: 4500});

testBtn.addEventListener("click", ()=>{
console.log("testBtn click");
getPdfDocument();
});

spinUp.onclick = () => {
  if (currentPage.value == pdfState.pageCount) return;
  currentPage.value++;
  spinDelay.exec(()=>{
    currentPage.value = pdfState.pageNumber;
  }, 5000);
};
spinDown.onclick = () => {
  if (currentPage.value == 1) return;
  currentPage.value--;
  spinDelay.exec(()=>{
    currentPage.value = pdfState.pageNumber;
  }, 5000);
};
okBtn.onclick = () => {
  spinDelay.stop();
  getPage({currentPage: currentPage.value});
};

const myFunction = function() {
  console.log(isFullScreen, pdfContainer.offsetHeight);
  const scale = pdfContainer.offsetHeight / canvasState.height;
  const size = {
    width: parseFloat((canvasState.width * scale).toFixed(4)),
    height: pdfContainer.offsetHeight,
  };
  // drawPage(imageSrc, size);
};
let isFullScreen = false;
fullScreenBtn.onclick = () => {
  if (isFullScreen == false) {
    let fullScreen;
    if (pdfContainer.requestFullscreen) {
      fullScreen = pdfContainer.requestFullscreen();
    } else if (pdfContainer.webkitRequestFullscreen) {/* Safari */
      fullScreen = pdfContainer.webkitRequestFullscreen();
    } else if (pdfContainer.msRequestFullscreen) {/* IE11 */
      fullScreen = pdfContainer.msRequestFullscreen();
    }
    isFullScreen = true;
    // pdfContainer.onresize = function() {
    //     console.log(isFullScreen, pdfContainer.offsetHeight);
    //     let scale = pdfContainer.offsetHeight / canvasState.height;
    //     const size = {
    //         width: parseFloat((canvasState.width * scale).toFixed(4)),
    //         height: pdfContainer.offsetHeight
    //     }
    //     //drawPage(imageSrc, size);
    // }
    fullScreen.then((result) => {
      console.log("fullScreen")
      const onresize = () => {
        console.log("isFullScreen height =", pdfContainer.offsetHeight);
        const scale = pdfContainer.offsetHeight / canvasState.height;
        const size = {
          width: pdfContainer.offsetWidth, //parseFloat((canvasState.width * scale).toFixed(4)),
          height: pdfContainer.offsetHeight,
        };
        console.log(size);
        // drawPage(imageSrc, size);
        getPage({size: size});
        //getPage({currentPage: pdfState.pageNumber});
        window.removeEventListener('resize', onresize);
      };
      window.addEventListener('resize', onresize);
    });
  } else {
    let fullScreen = "";
    if (document.exitFullscreen) {
      fullScreen = document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      fullScreen = document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {/* IE11 */
      fullScreen = document.msExitFullscreen();
    }
    isFullScreen = false;
    fullScreen.then((result) => {
      console.log("fullScreen exit")
      const onresize = () => {
        console.log("isFullScreen height =", pdfContainer.offsetHeight);
        const scale = pdfContainer.offsetHeight / canvasState.height;
        const size = {
          width: pdfContainer.offsetWidth, //parseFloat((canvasState.width * scale).toFixed(4)),
          height: pdfContainer.offsetHeight,
        };
        console.log(size);
        // drawPage(imageSrc, size);
        getPage({size: size});
        //getPage({currentPage: pdfState.pageNumber});
        window.removeEventListener('resize', onresize);
      };
      window.addEventListener('resize', onresize);
    });
  }
};

modal.isShow = false;
modal.toggle = function(show = false) {
  if (this.isShow == show) {
    return;
  }
  if (show) {
    const animationEnd = () => {
      console.log('modal showed');

      modal.classList.remove('document-loading');
      modal.removeEventListener('animationend', animationEnd);
    };
    modal.addEventListener('animationend', animationEnd);
    modal.classList.add('document-loading');
    this.style.display = 'flex';
    modal.isShow = show;
  } else {
    const animationEnd = () => {
      console.log('modal removed');

      this.style.display = 'none';
      modal.classList.remove('document-loaded');
      modal.removeEventListener('animationend', animationEnd);
    };
    modal.addEventListener('animationend', animationEnd);
    this.classList.add('document-loaded');
    modal.isShow = show;
  }
};

okBtn.isShow = false;
okBtn.toggle = function(show = false) {
  console.log('re');
  if (this.isShow == show) {
    return;
  }
  if (show) {
    const transitionEnd = () => {
      console.log('okBtn showed');
      this.firstElementChild.style.display = 'none';
      this.lastElementChild.style.display = 'block';
      this.firstElementChild.removeEventListener('transitionend', transitionEnd);
    };
    // modal.addEventListener('animationend', animationEnd);
    this.firstElementChild.addEventListener('transitionend', transitionEnd);
    this.firstElementChild.style.color = 'rgb(255 255 255 / 0%)';
    this.isShow = show;
  } else {
    const transitionEnd = () => {
      console.log('okBtn removed');
      // this.lastElementChild.style.display = "block";
      this.firstElementChild.removeEventListener('transitionend', transitionEnd);
    };
    this.firstElementChild.removeEventListener('transitionend', transitionEnd);
    this.firstElementChild.addEventListener('transitionend', transitionEnd);
    this.firstElementChild.style.display = 'block';
    this.firstElementChild.style.color = 'rgb(255 255 255 / 0%)';
    this.firstElementChild.style.color = 'rgb(255 255 255 / 90%)';

    this.lastElementChild.style.display = 'none';
    modal.isShow = show;
  }
};

slider.oninput = () => {
  currentPage.value = slider.value;
  // lastEvent(slider.value);
  // console.log(slider.value);
};
slider.onclick = () => {
  console.log('slider click', slider.value);
  getPage({currentPage: slider.value});
};

currentPage.oninput = () => {
  if (currentPage.value > pdfState.pageCount) {
    currentPage.value = pdfState.pageCount;
  }
  if (currentPage.value < 1) {
    currentPage.value = '';
  }
};

currentPage.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    console.log('Enter', currentPage.value);
    if (currentPage.value > 0) {
      getPage({currentPage: currentPage.value});
    }
  }
});


const getPage = async options => {
  console.log(options)
  if (options.currentPage) {
      let { currentPage } = options;
      if (pageList.get(currentPage) != undefined) {
          console.log(`Page ${currentPage} draw from memory`);
          drawPage(pageList.get(currentPage));
          return;
      }
  }

  const start = window.performance.now();
  const requestIfo = '/api/data';
  const requestInit = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(options)
  }

  sendRequest({ requestIfo, requestInit })
      .then((result) => {
          console.log("result new", result);
          if (result.page) {
              canvas.style.visibility = 'visible';
              pageList.set(result.currentPage, 'data:image/jpeg;base64,' + result.page);
              drawPage(pageList.get(result.currentPage));
              // modal.toggle(false)
          }
          if (result.currentPage) {
              pdfState.pageNumber = result.currentPage;
              console.log('current page set', pdfState.pageNumber);
          }
          if (result.pageCount) {
              pdfState.pageCount = result.pageCount;
              console.log('page count set getPage', result.pageCount);
          }
          testBtn.innerHTML = `Load: ${(window.performance.now() - start).toFixed(3)} ms. Render: ${result.renderTime} ms.`
          return new Promise((resolve) => { resolve(result); });
      }, (reject) => {
          console.warn(reject)
      });
}

const getPdfDocument = async (fileName = "sea.pdf") => {
  const start = window.performance.now();
  if (typeof fileName == 'string') {
      fileName = { document: fileName };
  }
  fileName.width = pdfContainer.offsetWidth;
  fileName.height = pdfContainer.offsetHeight - controlContainer.offsetHeight;
  modal.toggle(true);
  
  sendRequest({requestIfo: `/api/data?${new URLSearchParams(fileName)}`})
      .then((result) => {
          pageList.clear();
          console.log("result new pdf", result);
          if (result.pageCount) {
              pdfState.pageCount = result.pageCount;
              console.log('page count set GetPdf', result.pageCount);
          }
          canvas.style.visibility = 'visible';
          pageList.set(1, 'data:image/jpeg;base64,' + result.page);
          drawPage(pageList.get(1));
          pdfState.pageNumber = 1;
          modal.toggle(false);
          console.log('modal toggled to false');
          testBtn.innerHTML = `Load: ${(window.performance.now() - start).toFixed(3)} ms. Render: ${result.renderTime} ms.`
          return new Promise((resolve) => { resolve(result); });
      });
}
getPage({checkRend: true});

const container = document.getElementById('pdfContainer');
const canvas = document.getElementById('pdfViewer');
const ctx = canvas.getContext('2d');
const canvasState = {
  pages: {
    '1': {
      width: 0,
      height: 0,
    },
    '2': {
      width: 0,
      height: 0,
    },
  },
  get width() {
    return canvas.width;
  },
  set width(value) {
    canvas.style.width = value + 'px';
    canvas.width = value;
  },
  get height() {
    return canvas.height;
  },
  set height(value) {
    // canvas.style.height = pdfContainer.offsetHeight - controlContainer.offsetHeight + "px";
    // canvas.height = value - controlContainer.offsetHeight;
  },
};
const drawPage = (data, size, clear) => {
  const img = new Image();
  img.onload = function() {
    console.log(img.width, img.height);
    // if(size) {
    //     canvasState.width = size.width;
    //     canvasState.height = size.height;
    // ctx.drawImage(img, 0, 0, size.width, size.height);

    // } else {
    // //canvasState.width = img.width;
    // //canvasState.height = img.height;

    // }

    canvas.width = img.width;
    canvas.height = pdfContainer.offsetHeight - controlContainer.offsetHeight;
    canvas.style.height = pdfContainer.offsetHeight - controlContainer.offsetHeight + 'px';
    canvas.style.width = img.width + 'px';
    ctx.drawImage(img, 0, 0, img.width, img.height);


    // ctx.drawImage(img, 0, 0, size.width, size.height);
  };
  img.src = data.image;
  backgroundImage.style.backgroundImage = `url(${data.image})`;
  pdfState.pageNumber = data.number;
};

// getPdfDocument("1.pdf")


