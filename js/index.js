var usernamePathBG = d.getElementById("usernamePathBG"),
    usernamePath = d.getElementById("usernamePath"),
    input = d.getElementById("input"),
    pathBG = d.getElementById("pathBG"),
    card = d.getElementById("card"),
    textHolder = d.getElementById("textHolder"),
    slope = 0.15625,
    textPath = d.getElementById("textPath"),
    topWings = d.getElementById("topWings"),
    topWings2 = d.getElementById("topWings2"),
    settingsH = d.getElementById("settingsHeader"),
    settings = d.getElementById("settings");
this.hue = 0;
this.settingsClosed = false;
this.popups = ["changelog"];

(async function () {
    var version = document.getElementById("version"),
        changelog = await fetch("https://hitthemoney.com/krunker-logo-maker/changelog.txt"),
        changelogText = await changelog.text(),
        changelog2 = document.getElementById("changelog")
    version.innerHTML = changelogText.slice(0, 6)
    changelog2.innerHTML = changelogText
})()

svgToImg(document.getElementById("svg"), "YOURNAME");
updatePreview = () => {
    setTimeout(() => {
        usernamePath.textContent = input.value.toUpperCase();
        usernamePathBG.textContent = input.value.toUpperCase();
        if (input.value.split(" ").join("") == "") {
            usernamePath.textContent = "YOURNAME";
            usernamePathBG.textContent = "YOURNAME";
        }
        svgToImg(document.getElementById("svg"), input.value);
        let usernameBBox = usernamePath.getBBox();
        let width = usernameBBox.width
        let boxWidth = width + 5
        let topCurve = boxWidth / 2
        let startingPoint = 640 - topCurve
        if (width >= 1280) document.getElementById("svg").setAttribute("width", `${width + 25}`)
        else document.getElementById("svg").setAttribute("width", `1280`)
        if (boxWidth >= 1280) {
            textPath.setAttribute("d", `M 0 360 q ${width / 2} ${(width / 2) * 0.15625} ${width} 0`)
            textHolder.setAttribute("transform", "translate(96 54) scale(0.85)")
            topWings.setAttribute("stroke-width", "20")
            d.getElementById('sizeSlider').value = 0.85;
            d.getElementById('sizeInput').value = 0.85
        } else if (720 <= boxWidth && boxWidth <= 1280) {
            textHolder.setAttribute("transform", "translate(0 7) scale(1)")
            topWings.setAttribute("stroke-width", "20")
            d.getElementById('sizeSlider').value = 1;
            d.getElementById('sizeInput').value = 1;
        } else if (480 <= boxWidth && boxWidth <= 720) {
            textHolder.setAttribute("transform", "translate(-96 -45) scale(1.15)")
            topWings.setAttribute("stroke-width", "20")
            d.getElementById('sizeSlider').value = 1.15;
            d.getElementById('sizeInput').value = 1.15;
        } else if (boxWidth <= 480) {
            textHolder.setAttribute("transform", "translate(-192 -95) scale(1.3)")
            topWings.setAttribute("stroke-width", "30")
            d.getElementById('sizeSlider').value = 1.3;
            d.getElementById('sizeInput').value = 1.3;
        } else {
            textHolder.setAttribute("transform", "translate(0 7) scale(1)")
            topWings.setAttribute("stroke-width", "40")
            d.getElementById('sizeSlider').value = 1;
            d.getElementById('sizeInput').value = 1;
        }
        if (startingPoint >= 130) {
            let num = 0
            if (usernamePath.textContent.slice(0, 1).toLowerCase() == "j") num = 38
            boxWidth = width - 100 - num
            topCurve = boxWidth / 2
            startingPoint = 640 - topCurve
            pathBG.setAttribute("d",
                `M ${startingPoint} ${245 + (topCurve * slope) / 2} q ${topCurve} -${topCurve * slope} ${1280 - startingPoint * 2} 0`
            )
            textPath.setAttribute("d",
                `M 0 380 q 640 -100 1280 0`
            )
            topWings.style.display = "none"
        } else {
            topWings.style.display = ""
            topWings.setAttribute("d",
                `M 130 350 q 445 -69.53125 1022 0`
            )
            boxWidth = width - 100
            topCurve = boxWidth / 2
            startingPoint = 640 - topCurve
            pathBG.setAttribute("d",
                `M ${startingPoint} ${225 + (topCurve * slope) / 2} q ${topCurve} -${topCurve * slope} ${1280 - startingPoint * 2} 0`
            )
            textPath.setAttribute("d",
                `M 0 360 q 640 -100 1280 0`
            )
        }
        boxWidth = width + 5
        if (boxWidth >= 1280) {
            topWings2.style.display = ""
            textPath.setAttribute("d",
                `M -${(width - 1280) / 2} 360 q ${width / 2} -${(width / 2) * 0.15625} ${width} 0`
            )
        } else {
            topWings2.style.display = "none"
        }
    }, 1);
}

changeHue = () => {
    setTimeout(() => {
        this.hue = d.getElementById("hueInput").value
        d.getElementById("svg").style =
            `transform: scale(0.5) translate(0%, -50%); filter: hue-rotate(${hue}deg)`
        svgToImg(d.getElementById("svg"), input.value);
    }, 1);
}

changeSize = () => {
    setTimeout(() => {
        this.size = d.getElementById("sizeInput").value
        var x,
            y;
        if (size > 1) {
            x = (-(((size - 1) * 1280) / 2))
            y = (-(((size - 1) * 720) / 2)) + 13
        } else if (size < 1) {
            x = (((1 - size) * 1280) / 2)
            y = (((1 - size) * 720) / 2) + 7
        } else if (size == 1) {
            x = 0
            y = 7
        }
        textHolder.setAttribute("transform", `translate(${x} ${y}) scale(${size})`)
        svgToImg(d.getElementById("svg"), input.value);
        let usernameBBox = usernamePath.getBBox();
        let width = usernameBBox.width * size
        if (width >= 1280) document.getElementById("svg").setAttribute("width", `${width + 25}`)
        else document.getElementById("svg").setAttribute("width", `1280`)
    }, 1);
}

function svgToImg(svg, name) {
    svg.style = `transform: scale(1); filter: hue-rotate(${hue}deg)`;
    var svgData = new XMLSerializer().serializeToString(svg);
    svg.style = `transform: scale(0.5) translate(0%, -50%); filter: hue-rotate(${hue}deg`;

    window.canvas = d.createElement("canvas");
    canvas.width = svg.getAttribute('width');
    canvas.height = svg.getAttribute('height');
    var ctx = canvas.getContext("2d");

    window.img = d.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
    img.id = "previewImg"

    img.onload = function () {
        let hue2 = hue
        if (hue2 == 360) hue2 = 720
        ctx.filter = 'hue-rotate(' + hue2 / 2 + 'deg)';
        ctx.drawImage(img, 0, 0);
        pngLink = canvas.toDataURL("image/png");
        let imgSrcElem = d.getElementsByClassName("imgSrc")
        for (num = 0; num < imgSrcElem.length; num++) imgSrcElem[num]["content"] = pngLink
        d.getElementById("download").download = `${name}'s_Krunker_Logo.PNG`;
        d.getElementById("download").href = pngLink;
    };
};

function checkSettings(event) {
    switch (event) {
        case "out":
            if (settingsClosed == false) {
                settingsH.innerHTML = "Settings";
            }
            break;
        case "hover":
            if (settingsClosed == false) {
                settingsH.innerHTML = "Close Settings";
            }
            break;
        case "click":
            if (settingsClosed == false) {
                settingsClosed = true;
                settings.style = "height: 78px; overflow: hidden;";
                settingsH.innerHTML = "Show Settings";
            } else if (settingsClosed == true) {
                settingsClosed = false;
                settings.style = "";
                settingsH.innerHTML = "Settings";
            }
            break;
    }
}

function textBox(checked) {
    if (checked == true) {
        pathBG.style.display = "";
    } else if (checked == false) {
        pathBG.style.display = "none";
    };
}

function showChangelog() {
    let changelogHolder = document.getElementById("changelogHolder");
    changelogHolder.style.display = "block";
    document.getElementById("popupHolder").style.display = "block";
}

function hidePopup() {
    clearInterval(this.interval);
    for (num = 0; num < popups.length; num++) document.getElementById(popups[num] + "Holder").style.display = "none"
    document.getElementById("popupHolder").style.display = "none"
}