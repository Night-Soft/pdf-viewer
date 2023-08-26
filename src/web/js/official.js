const sendRequest = async ({ requestIfo, requestInit } = {}, responseAs = "text") => {
  if (typeof requestIfo == "undefined") return;
  responseAs = ["text", "json", "formData", "blob", "arrayBuffer"].filter(value => value == responseAs);
  responseAs = responseAs.length == 0 ? "text" : responseAs[0];

  return new Promise((resolve, reject) => {
    fetch(requestIfo, requestInit)
      .then((response) => response[responseAs]())
      .then((result) => {
        if (responseAs == "text") { resolve(JSON.parse(result)); }
        resolve(result);
      })
      .catch((error) => {
        console.error('Ошибка при получении данных:', error);
        reject(error);
      });
  });
}

const DelayLastEvent = class {
  #timeoutId;
  constructor({ func, delay = 1000 } = {}, execNow = false) {
    this.func = func;
    this.delay = delay;
    if (typeof func == 'function') {
      if (execNow) this.exec();
      this.run();
    }
  }
  run(func = this.func, delay = this.delay) {
    clearTimeout(this.#timeoutId);
    this.#timeoutId = setTimeout(() => {
      console.log('delayed exec');
      func();
    }, delay);
  }
  exec() {
    clearTimeout(this.#timeoutId);
    this.func();
    console.log('Exec now');
  }
  stop() {
    console.log('execution stopped');
    clearTimeout(this.#timeoutId);
  }
};

function getPageNumbers(currentPage = 1, countPages = 7, lastNumDoc = 1) {
  const pages = [];
  const middle = Math.floor(countPages / 2);
  for (let i = 1; i <= middle; i++) {
    //console.log(i);
    if (currentPage + i <= lastNumDoc) {
      pages.push(currentPage + i);
    }
    if (currentPage - i > 0 && currentPage - i <= lastNumDoc) {
      pages.push(currentPage - i);
    }

  }
  return pages.sort((a, b) => {
    return a - b;
  });
}

function uniquePages(arr1, arr2) {
  const uniqueArr1 = [...new Set([...arr1].filter(item => item !== null))]
  const uniqueArr2 = new Set(arr2);
  const uniquePages = uniqueArr1.filter((element) => {
    if (!uniqueArr2.has(element)) {
      return true;
    }
  });
  return uniquePages;
};


const calcSize = function (width, height) { // width = 800px, height = 600px
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


const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  console.log('WebSocket соединение установлено');
};

socket.onmessage = (event) => {
  const {futurePages, message} = JSON.parse(event.data);
  if (message) {
    console.log(`Socket message: ${message}`);
  }
  if (futurePages) {
    getPage({ futurePages: true }).then((result) => {
      console.log("Incoming pages:", Object.keys(result.pages));
      let keys = Object.keys(result.pages);
      keys.forEach((element) => {
        const {image,width,height} = result.pages[element];
        pageList.set(element, 'data:image/jpeg;base64,' + image, width, height);
      });

    });
  }

};

socket.onclose = () => {
  console.log('WebSocket соединение закрыто.');
};
const sendWSMessage = (message) => {
  if (typeof message != "object") {
    message = { message };
  }
  socket.send(JSON.stringify(message));
}

const ZoomElement = class {
  #x = 0;
  #y = 0;
  #prevX = 0;
  #prevY = 0;
  constructor(element) {
    this.element = element;
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.maxScale = 5;
    this.minScale = 1;
    this.object = this;
    this.delay = new DelayLastEvent({delay: 50});
    this.element.addEventListener("mousedown", this.mousedown.bind(this.object));
    this.element.addEventListener("mouseup", this.mouseup.bind(this.object));
    this.element.addEventListener("mouseleave", this.mouseleave.bind(this.object));
    this.element.addEventListener("wheel", this.wheel.bind(this.object));

    this.isMouseDown = 0;
    window.addEventListener("mousedown", () => {
      ++this.isMouseDown;
      if (this.isMouseDown) {
        console.log('mouse button down')
      }
    });
    window.addEventListener("mouseup", () => {
      --this.isMouseDown;
      console.log('mouse button up');

    });
  }
  get x() {
    return parseInt((this.#x - this.#prevX) / this.scale);
  }
  set x(x) {
//    console.log("eventX", x, "this.#x",this.#x)
    this.#x = x;// / this.scale);

  }

  get y() {
    return parseInt((this.#y - this.#prevY) / this.scale); //current event
  }
  set y(y) {
    this.#y = y// - this.#y;// / this.scale);

  }
  removeEv = () => {
    console.log("removed")
    this.element.removeEventListener("mousemove", this.object.mousemove);
  }
  mousedown = (event) => {
    console.log("mousedown");
    this.x = event.x// - this.x;
    this.y = event.y// - this.y;
    this.#prevX = event.x - this.#prevX;
    this.#prevY = event.y - this.#prevY;
    this.element.addEventListener("mousemove", this.mousemove);

  }
  mousemove = (event) => {
    this.x = event.x;
    this.y = event.y;

    console.log("mousemove", this.x, this.y);

    this.element.style.transform = `scale(${this.scale}) translate(${this.x}px, ${this.y}px)`

  }
  mouseup = (event) => {
    console.log("mouseup");
    this.removeEv();
    this.x = event.x;// - this.x;
    this.y = event.y;// - this.y;
    this.#prevX = event.x - this.#prevX;
    this.#prevY = event.y - this.#prevY;
  }
  mouseleave = (event) => {
    console.log("mouseleave");
    this.removeEv();
    // this.x = event.x;// - this.x;
    // this.y = event.y;// - this.y;
  }
  wheel = (event) => {
  console.log("event.deltaY",event);
  this.element.style.transition = "250ms";
  this.delay.exec(()=>{
    this.element.style.transition = "";
  }, 250);
  if (event.deltaY < 0) {
    this.scale += 0.1;
    if (this.scale > this.maxScale) {
    this.scale = this.maxScale;
    }
    this.element.style.transform = `scale(${this.scale}) translate(${this.x}px, ${this.y}px)`;
  } else {
    this.scale -= 0.1;
    if (this.scale <= this.minScale) {
    this.scale = this.minScale;
    this.clear();
    return;
    }
    this.element.style.transform = `scale(${this.scale}) translate(${this.x}px, ${this.y}px)`;
  }
  }
  clear(){
    this.#x = 0;
    this.#y = 0;
    this.#prevX = 0;
    this.#prevY = 0;
    this.scale = 1;
    this.element.style.transform = "";
    this.removeEv();
  }
}


/// user


//const userId = `userId=${Date.now.toString()}`