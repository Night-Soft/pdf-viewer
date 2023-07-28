const previousPage = () => {
    getData({ func: "previous-page" })
}

const nextPge = () => {
    getData({ func: "next-page" })
}
const currentPage = document.getElementById("CurrentPage");
let pageCount =  parseInt(currentPage.getAttribute("max"));
currentPage.oninput = () => {
    if (currentPage.value > pageCount) {
        currentPage.value = pageCount;
    }
    if (currentPage.value < 1) {
        currentPage.value = "";
    }
}

currentPage.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      console.log("Enter", currentPage.value);
      if (currentPage.value > 0) {
        getData({currentPage: currentPage.value});
      }
    }
  });

async function getData(options) {
    return new Promise((resolve, reject) => {
        fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(options)

        })
            .then(response => response.text())
            .then((result) => {
                result = JSON.parse(result);
                if (result.page) {
                    drawPage(result.page);
                }
                if (result.currentPage) {
                    currentPage.value = result.currentPage;
                }
                //drawPage(result);

            })
            .catch((error) => {
                console.error('Ошибка при получении данных:', error);
            });

    });
}

async function getFirstPage() {
    return new Promise((resolve, reject) => {
        fetch('/api/data')
            .then(response => response.text())
            .then((result) => {
                result = JSON.parse(result);
                console.log("Page count", result.pageCount);
                currentPage.setAttribute("max", result.pageCount);
                pageCount = result.pageCount;
                drawPage(result.page);

            })
            .catch((error) => {
                console.error('Ошибка при получении данных:', error);
            });

    });
}

const container = document.getElementById('pdfContainer');
const canvas = document.getElementById('pdfViewer');
const ctx = canvas.getContext("2d");
const drawPage = (data) => {
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

    };
    img.src = data;
}