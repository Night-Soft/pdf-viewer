const pageLeft = document.querySelectorAll(".left")[0];
const pageRight = document.querySelectorAll(".right")[0];
const pageLeftHidden= document.querySelectorAll(".left")[1];
const pageRightHidden = document.querySelectorAll(".right")[1];

const page1 = document.getElementsByClassName("page--1")[0];
const page2 = document.getElementsByClassName("page--2")[0];
const page3 = document.getElementsByClassName("page--3")[0];
const page4 = document.getElementsByClassName("page--4")[0];

const page1Hidden = document.getElementsByClassName("page--1")[1];
const page2Hidden = document.getElementsByClassName("page--2")[1];
const page3Hidden = document.getElementsByClassName("page--3")[1];
const page4Hidden = document.getElementsByClassName("page--4")[1];

const hiddenPages = document.getElementById("HiddenPages");

const rootCss = document.querySelector(':root');

pageLeft.onclick = () => {
  const isExists = pageLeft.classList.toggle("turn-page");
  if (isExists) {
   // pageLeft.style.transformOrigin = "unset"
   hiddenPages.style.display = "none";
    pageLeft.style.zIndex = "+1";
    pageRight.style.transform = "translate(-150px)";
    rootCss.style.setProperty("--transform-origin", "75% 0%");
  } else {
    hiddenPages.style.display = "";

    pageLeft.style.transformOrigin = ""
    pageLeft.style.zIndex = "";
    pageRight.style.transform = "";
    //rootCss.style.setProperty("--transform-origin", "");
  }
  const transitionEnd = () => {
    if (isExists) {
      pageLeft.style.zIndex = "1";

    } else {
      pageLeft.style.zIndex = "";
    }
  }
  previous()
  pageLeft.addEventListener('transitionend', transitionEnd);
}

let above = false;
pageRight.onclick = () => {
  
  const isExists = pageRight.classList.toggle("turn-page");
  const transitionEnd = () => {
    if (isExists) {
      pageRight.style.zIndex = "1";

      // test
      pageContent.style.zIndex = "-1";
      pageRight.onclick();
      above = true;

    } else {
      pageRight.style.zIndex = "";
    }
    pageContent.style.zIndex = "";
  }
  next()
  pageRight.addEventListener('transitionend', transitionEnd);
}



let pages = [];
for (let i = 1; i <= 100; i++) {
pages.push("Pages"+ i);
}
let currentP = 50;
const drawUiPages = () => {
  
  page1.innerHTML = pages[currentP - 1]
  page2.innerHTML = pages[currentP]
  page3.innerHTML = pages[currentP + 1]
  page4.innerHTML = pages[currentP + 2]

  page2Hidden.innerHTML = pages[currentP + 2]
  page3Hidden.innerHTML = pages[currentP + 3];
}

function next() {
  currentP++;
  drawUiPages();

}
function previous() {
  currentP--;
  drawUiPages();

}




const drawPages = async () => {
    // 1,2 =left | 3,4 = right
    const pageSize = await getImageSize(pageList.get(pdfState.pageNumber).image);
    pageLeft.style.minWidth = pageSize.width + "px";
    pageLeft.style.minHeight = pageSize.height + "px";

    pageRight.style.minWidth = pageSize.width + "px";
    pageRight.style.minHeight = pageSize.height + "px";

    page1.style.minWidth = pageSize.width + "px";
    page2.style.minWidth = pageSize.width + "px";
    page3.style.minWidth = pageSize.width + "px";
    page4.style.minWidth = pageSize.width + "px";

    page1.style.minHeight = pageSize.height + "px";
    page2.style.minHeight = pageSize.height + "px";
    page3.style.minHeight = pageSize.height + "px";
    page4.style.minHeight = pageSize.height + "px";


    if (pdfState.pageNumber % 2 == 0) {
        page1.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber - 1).image})`;
        page2.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber).image})`;
        page3.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber + 1).image})`;
        page4.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber + 2).image})`;
    } else {
        page1.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber - 1).image})`;
        page2.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber).image})`;
        page3.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber + 1).image})`;
        page4.style.backgroundImage = `url(${pageList.get(pdfState.pageNumber + 2).image})`;
    }
}