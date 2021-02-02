var input = d.getElementById("input"),
    settingsH = d.getElementById("settingsHeader"),
    settings = d.getElementById("settings"),
    bgAnimCheck = d.getElementById("bgAnimCheck"),
    svgSettings = d.getElementById("svgSettings"),
    canvasSettings = d.getElementById("canvasSettings"),
    svgLogo = d.getElementById("svg"),
    canvasLogo = d.getElementById("canvasLogo"),
    downloadBtn = d.getElementById("downloadBtn"),
    downloadBtnOnclick = `updatePreview(false); showDownloadPopup();`,
    bottomResizer = d.getElementById("bottomSettResizer"),
    settResizers = d.querySelector("#settResizers"),
    settContainer = d.getElementById("settContainer");

window.settingsClosed = false;
window.popups = ["changelog", "download", "animation"];
window.bgAnim = (localStorage.getItem("bgAnim") === "false") ? false : true;
window.logoType = "svg";

;

(async function () {
    var version = document.getElementById("version"),
        changelog = await fetch("./changelog.txt"),
        changelogText = await changelog.text(),
        changelog2 = document.getElementById("changelog")
    version.innerHTML = changelogText.slice(0, 6)
    changelog2.innerHTML = changelogText
})();

svgToImg(document.getElementById("svg"), "YOURNAME");
window.canvasLm = new LogoMaker(canvasLogo);
canvasLogo.style.transform = "scale(0.5) translate(0%, -50%)";
canvasLm.updateLogo();

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
                settings.style = (logoType === "svg") ? "" : `height: ${settContainer.getBoundingClientRect().height}px`;
                settingsH.innerHTML = "Settings";
            }
            break;
    }
}

function showChangelog() {
    let changelogHolder = document.getElementById("changelogHolder");
    changelogHolder.style.display = "block";
    document.getElementById("popupHolder").style.display = "block";
}

function hidePopup() {
    clearInterval(window.interval);
    for (let num = 0; num < popups.length; num++) document.getElementById(popups[num] + "Holder").style.display = "none"
    document.getElementById("popupHolder").style.display = "none"
    if (window.stopRenderAnimation) window.stopRenderAnimation();
    document.getElementById("bottom").style.zIndex = "";
}

function showDownloadPopup() {
    let downloadHolder = document.getElementById("downloadHolder");
    downloadHolder.style.display = "block";
    document.getElementById("popupHolder").style.display = "block";
    document.getElementById("bottom").style.zIndex = -9999;
}

function blobToDataURL(blob, callback) {
    var fr = new FileReader();
    fr.onload = function (e) {
        callback(e.target.result);
    }
    fr.readAsDataURL(blob);
}

toggleBgAnim = (check) => {
    window.bgAnim = check;
    localStorage.setItem("bgAnim", check);
    if (check) {
        document.body.style = "animation-play-state: running;"
    } else {
        document.body.style = "animation-play-state: paused;"
    }
}

/*changeSlope = () => {
    slope = d.getElementById('slopeInput').value;
    updatePreview();
}*/

if (!window.bgAnim) {
    bgAnimCheck.style = "transition: none;";
    bgAnimCheck.click();
    bgAnimCheck.style = "";
}

toggleBgAnim(window.bgAnim);

changeLogoType = (val) => {
    window.logoType = val;
    if (val === "svg") {
        svgSettings.style.display = "block";
        canvasSettings.style.display = "none";
        settings.style.height = "";
        downloadBtn.innerHTML = "Download Logo";
        changeHue(canvasLm.hue, true);
        updatePreview();
        canvasLogo.style.opacity = "0";
        svgLogo.style.opacity = "1";
        setTimeout(() => {
            canvasLogo.style.display = "none";
            svgLogo.style.display = "";
        }, 500)
        downloadBtn.onclick = () => {
            eval(downloadBtnOnclick);
        };
        d.getElementById("downloadSvgBtn").style.display = ""
        input.onkeydown = updatePreview;
    } else if (val === "canvas") {
        canvasSettings.style.display = "block";
        svgSettings.style.display = "none";
        settings.style.height = settContainer.getBoundingClientRect().height + "px";
        downloadBtn.innerHTML = "Download Logo";
        d.getElementById("downloadSvgBtn").style.display = "none"
        downloadBtn.onclick = () => {
            // window.canvasLm.download();
            window.showDownloadPopup();
            canvasLm.updateDownloads();
        }
        input.onkeydown = () => {};

        let a = b => d.getElementById(b);

        a("canvasHueInput").value = window.hue;
        a("canvasHueSlider").value = window.hue;
        canvasLm.changeValue(input.value);
        canvasLm.changeHue(window.hue);
        canvasLm.updateLogo();
        canvasLogo.style.opacity = "1";
        svgLogo.style.opacity = "0";
        setTimeout(() => {
            canvasLogo.style.display = "";
            svgLogo.style.display = "none";
        }, 500);
    }
}

makeSettingsResizable = () => {
    bottomResizer.addEventListener("mousedown", function (e) {
        e.preventDefault();
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResize);
    })

    function resize(e) {
        settResizers.style.pointerEvents = "all";
        document.body.style.cursor = "ns-resize";
        settings.style.transition = "none";
        settings.style.height = `${e.pageY}px`;
    }

    function stopResize() {
        settResizers.style.pointerEvents = "";
        document.body.style.cursor = "";
        settings.style.transition = "";
        window.removeEventListener("mousemove", resize)
    }
}

makeSettingsResizable(".resizable")