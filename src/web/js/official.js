const sendRequest = async ({requestIfo, requestInit} = {}) => {
    if (typeof requestIfo == "undefined") return;
    return new Promise((resolve, reject) => {
        fetch(requestIfo, requestInit)
        .then((response) => response.text())
        .then((result) => {
            resolve(JSON.parse(result))
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
            reject(error);
          });
    });
}

const DelayLastEvent = class {
    #timeoutId;
    constructor({func, delay = 1000} = {}) {
      this.func = func;
      this.delay = delay;
      if (typeof func == 'function') {
        this.exec();
      }
    }
    exec(func = this.func, delay = this.delay) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = setTimeout(()=> {
        console.log('delayedExec');
        func();
      }, delay);
    }
    stop() {
      console.log('execution stopped');
      clearTimeout(this.#timeoutId);
    }
  };
  
  const getPageNumbers = (currentPage, countPages = 5, lastNumDoc = 1) => {
    const pages = [];
    if (currentPage > lastNumDoc) {
      currentPage = lastNumDoc;
    } else if (currentPage < 1) {
      currentPage = 1;
    }

    for (let i = 0; i < countPages; i++) {
      if (i == 0) {
        if(currentPage > 1) {
          currentPage--;
          pages.push(currentPage);
          currentPage++;
          continue;
        }
      }
      if (i == 1) {
        if(currentPage > 2) {
          currentPage -= 2;
          pages.push(currentPage);
          currentPage += 2;
          continue;
        }
      }
      ++currentPage;
      if (currentPage > lastNumDoc) break;
      pages.push(currentPage);
    }
    return pages;
  };

  const calcSize = function(width, height) { // width = 800px, height = 600px
    let scaleWidth = 1; let scaleHeight = 1;
    const size = {
      width: 600,
      height: 400,
    };
    if (width < size.width) {
      scaleWidth = width / size.width;
    }
    if (height < size.height) {
      scaleHeight = height / size.height;
    }
    if (scaleWidth > scaleHeight) {
      return scaleWidth.toFixed(4);
    } else {
      return scaleHeight.toFixed(4);
    }
  };