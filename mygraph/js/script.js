var myCanvas = document.getElementById("myCanvas");
var dateDiv = document.getElementById("date");
myCanvas.width = 1200;
myCanvas.height = 500;
var startDate = new Date('2019-01-01').toLocaleDateString();
var endDate = new Date('2019-12-31').toLocaleDateString();

var ctx = myCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color, val) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillText(val, upperLeftCornerX, upperLeftCornerY);
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
}


var Barchart = function (options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
    this.draw = function () {
        var maxValue = 0;
        for (var categ in this.options.data) {
            maxValue = Math.max(maxValue, this.options.data[categ]);
        }
        var canvasActualHeight = this.canvas.height - this.options.padding * 2;
        var canvasActualWidth = this.canvas.width - this.options.padding * 2;

        //drawing the grid lines
        var gridValue = 0;
        while (gridValue <= maxValue) {
            var gridY = canvasActualHeight * (1 - gridValue / maxValue) + this.options.padding;
            drawLine(
                this.ctx,
                0,
                gridY,
                this.canvas.width,
                gridY,
                this.options.gridColor
            );

            //writing grid markers
            this.ctx.save();
            this.ctx.fillStyle = this.options.gridColor;
            this.ctx.textBaseline = "bottom";
            this.ctx.font = "bold 10px Arial";
            this.ctx.fillText(gridValue, 10, gridY - 2);
            this.ctx.restore();

            gridValue += this.options.gridScale;
        }

        //drawing the bars
        var barIndex = 0;
        var numberOfBars = Object.keys(this.options.data).length;
        var barSize = (canvasActualWidth) / numberOfBars;

        for (categ in this.options.data) {
            var val = this.options.data[categ];
            var barHeight = Math.round(canvasActualHeight * val / maxValue);
            drawBar(
                this.ctx,
                this.options.padding + barIndex * barSize,
                this.canvas.height - barHeight - this.options.padding,
                barSize,
                barHeight,
                this.colors[barIndex % this.colors.length],
                val
            );

            barIndex++;
        }

        //drawing series name
        this.ctx.save();
        this.ctx.textBaseline = "bottom";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 14px Arial";
        this.ctx.fillText(this.options.seriesName, this.canvas.width / 2, this.canvas.height);
        this.ctx.restore();

        //draw legend
        barIndex = 0;
        var legend = document.querySelector("legend[for='myCanvas']");
        legend.innerHTML = null;
        var ul = document.createElement("ul");
        ul.classList.add("legend-list");
        legend.append(ul);
        for (categ in this.options.data) {
            var li = document.createElement("li");
            li.style.listStyle = "none";
            li.style.borderLeft = "20px solid " + this.colors[barIndex % this.colors.length];
            li.style.padding = "5px";
            li.textContent = categ;
            ul.append(li);
            barIndex++;
        }
    }
}

function dateChanger(s_date, e_date) {
    var containt = `
    <input type="date" value="${s_date}" onchange="datePicker(this.value, 's')">
    <input type="date" value="${e_date}" onchange="datePicker(this.value, 'e')">
    <input type="button" value="Submit" onclick="callGetData();return false;">
    `;
    dateDiv.innerHTML = containt;
}
function callGetData() {
    getData(startDate, endDate)
}
function datePicker(value, type) {
    if (type === 's') {
        startDate = value;
    } else {
        endDate = value;

    }
}

function createData(data) {
    obj = {};
    for (let ele in data) {
        obj[ele] = data[ele].INR;
    }
    console.log('data', obj);
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    var myBarchart = new Barchart(
        {
            canvas: myCanvas,
            seriesName: "graph of INR exchange rate against EUR",
            padding: 20,
            gridScale: 20,
            gridColor: "black",
            data: obj,
            colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743","#fde23e","#f16e23", "#57d9ff","#937e88"]
        }
    );

    myBarchart.draw();
    // return obj
}
function changeDateFormat(date) {
    var splitedDate = date.split('/');
    if (splitedDate.length < 2) {
        return date;
    }
    return splitedDate[2] + '-' + splitedDate[1] + '-' + splitedDate[0];
}

async function getData(s_date, e_date) {
    var Start_date = changeDateFormat(s_date);
    var End_date = changeDateFormat(e_date);
    dateChanger(Start_date, End_date);
    let url = `https://api.exchangeratesapi.io/history?start_at=${Start_date}&end_at=${End_date}&base=EUR&symbols=INR`;
    const resp = await fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            return createData(data.rates);
        })
}

getData(startDate, endDate);
