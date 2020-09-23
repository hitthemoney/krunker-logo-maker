var input = d.getElementById("input");
var wingsImage = d.getElementById("wingsImage")

createCanvas = (width, height) => {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    return canvas;
}

CanvasRenderingContext2D.prototype.measureText = (function () {
    var _measureText = CanvasRenderingContext2D.prototype.measureText;

    return function () {
        var result = _measureText.apply(this, arguments);

        //console.log(this);

        let fontSize = this.font.match(/\d*px/)[0];
        let fontFamily = "FFF Forward";

        let el = document.createElement("span");
        el.innerHTML = arguments[0];
        el.style = `visibility: hidden; position: absolute; bottom: 0; left: 0; font-family: ${fontFamily}; font-size: ${fontSize}`;
        document.body.appendChild(el);
        result.emHeightAscent = el.offsetHeight / 5.5 * 4.5;
        result.emHeightDescent = el.offsetHeight / 5.5;
        el.remove();

        return result;
    };
}());

class LogoMaker {

    canvas = HTMLCanvasElement;
    hue = 0;
    value = "YOURNAME";
    yOff = 50;

    constructor(canvas = document.createElement("canvas")) {
        this.canvas = canvas;
        this.canvas.width = 1280;
        this.canvas.height = 720;
    }

    changeValue(value) {
        this.value = !value.split(" ").join("") ? "YOURNAME" : value.toUpperCase();
    }

    changeHue(hue) {
        this.hue = hue;
    }

    updateLogo() {
        var lgName = this.value;
        var canvas = this.canvas;
        var ctx = canvas.getContext("2d");
        var tb = this.constructor.tb;

        let strokeSize = 36;
        let fontSize = 0;
        var yOff = this.yOff;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `hue-rotate(${this.hue}deg)`;

        ctx.strokeStyle = "#101010";
        ctx.fillStyle = "#101010";
        ctx.textAlign = "center";
        ctx.lineWidth = strokeSize;
        ctx.font = fontSize + "px \"FFF Forward\"";

        while (true) {
            ctx.font = fontSize + "px \"FFF Forward\"";
            let textBBox2 = ctx.measureText(lgName);
            let tth = textBBox2.emHeightAscent;
            if (textBBox2.width + (strokeSize * 2) > 1279 || tth > 300) {
                if (tth > 225) yOff = 0;
                else if (tth > 140) yOff = 50;
                else if (tth > 90) yOff = 90;
                else yOff = 120;
                break;
            }
            fontSize++;
        }

        var textBBox = ctx.measureText(lgName);

        var firstChar = lgName[0],
            lastChar = lgName[lgName.length - 1],
            szOffset = 0,
            xOffset = 0;

        var key;

        for (key of tb.start) {
            if (firstChar === key.toUpperCase()) {
                szOffset += 35 * (fontSize / 130)
                xOffset += 35 * (fontSize / 130)
                break;
            }
        }

        for (key of tb.end) {
            if (lastChar === key.toUpperCase()) {
                szOffset += 35 * (fontSize / 130);
                break;
            }
        }

        ctx.beginPath();
        ctx.rect((1280 - textBBox.width) / 2 + xOffset, 275 - ((fontSize - 100) * 1.25), textBBox.width - (textBBox.emHeightDescent / 2) - szOffset, textBBox.emHeightAscent + (textBBox.emHeightDescent / 2));
        ctx.stroke();
        ctx.fill();

        var grd = ctx.createLinearGradient(0, 0, 0, 700 + (100 - fontSize));
        grd.addColorStop(0, "#fff");
        grd.addColorStop(0.49999999, "#fff");
        grd.addColorStop(0.5, "#ccc");
        grd.addColorStop(1, "#ccc");
        ctx.fillStyle = grd;

        ctx.strokeText(lgName, 640, 400);
        ctx.fillText(lgName, 640, 400);

        var canvasW = this.constructor.warpCanvas(canvas, (textBBox.emHeightDescent / 4), yOff)
        var ctxW = canvasW.getContext("2d")

        ctxW.drawImage(wingsImage, 0, 40 - yOff, 1280, 720);
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(canvasW, 0, 50, 1280, 720);
        canvasW.remove();
    }

    download(imageType = "png") {
        let anchor = document.createElement("a");
        anchor.style.display = "none";
        anchor.download = `${this.value}'s_Krunker_Logo.${imageType}`;
        anchor.href = this.canvas.toDataURL("image/" + imageType);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }

    static tb = {
        "start": ["y", "j", "t"],
        "end": ["y", "t", "l", "f"]
    };

    static warpCanvas = (canvas, xOff, yOff) => {
        // from https://github.com/bbog/image-curving-demo/ but modified/reworked

        var w = canvas.width,
            h = canvas.height,
            canvasW = createCanvas(w, h),
            ctxW = canvasW.getContext("2d");

        var warpPercentageVal = 0.1;

        function getQuadraticBezierXYatT(startPoint, controlPoint, endPoint, T) {

            var pow1minusTsquared = Math.pow(1 - T, 2),
                powTsquared = Math.pow(T, 2);

            var x = pow1minusTsquared * startPoint.x + 2 * (1 - T) * T * controlPoint.x + powTsquared * endPoint.x,
                y = pow1minusTsquared * startPoint.y + 2 * (1 - T) * T * controlPoint.y + powTsquared * endPoint.y;

            return {
                x: x,
                y: y
            };
        }

        function warpVertically() {

            var warpPercentage = parseFloat(warpPercentageVal, 10),
                warpYOffset = warpPercentage * h;

            canvasW.width = w;
            canvasW.height = h + Math.ceil(warpYOffset * 2);

            var startPoint = {
                x: 0,
                y: 0
            };
            var controlPoint = {
                x: w / 2,
                y: -warpYOffset
            };
            var endPoint = {
                x: w,
                y: 0
            };

            var offsetYPoints = [],
                t = 0;
            for (; t < w; t++) {
                var xyAtT = getQuadraticBezierXYatT(startPoint, controlPoint, endPoint, t / w),
                    y = parseInt(xyAtT.y);

                offsetYPoints.push(y);
            }

            ctxW.clearRect(0, 0, canvasW.width, canvasW.height);

            var x = 0;
            for (; x < w; x++) {
                ctxW.drawImage(canvas, x, 0, 1, h + warpYOffset, x, warpYOffset + offsetYPoints[x], 1, h + warpYOffset);
            }
        }

        warpVertically();

        var w2 = canvasW.width,
            h2 = canvasW.height,
            canvasW2 = createCanvas(w2, 720),
            ctxW2 = canvasW2.getContext("2d")

        ctxW2.drawImage(canvasW, 0 + xOff, 0 - yOff, w2, h2)

        canvasW.remove();

        return canvasW2;
    }
}