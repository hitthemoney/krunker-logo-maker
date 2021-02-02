let isPowerOf2 = (value) => {
    return (value & (value - 1)) == 0;
}

let animCanvas = document.getElementById("animationCanvas"),
    animVideo = document.getElementById("animationResult");

class CanvasRecorder {
    /**
     * Canvas Renderer/Recorder
     * @param {HTMLCanvasElement} canvas 
     * @param {HTMLVideoElement} video
     * Some of this is from https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
     */
    constructor(canvas, video) {
        this.canvas = canvas;
        this.video = video;

        this.canvas.style.display = "";
        this.video.style.display = "none";

        this.downloadName = "Krunker_Logo_Animation";
        this.mediaRecorder;
        this.recordedBlobs;
        this.sourceBuffer;
        this.mediaSource = new MediaSource();
        this.mediaSource.addEventListener("sourceopen", () => {
            this.sourceBuffer = this.mediaSource.addSourceBuffer("video/webm; codecs=\"vp8\"");
        }, false);
        this.stream = this.canvas.captureStream();
    }

    startRecording() {
        this.canvas.style.display = "inline";
        this.video.style.display = "none";

        this.video.controls = false;
        let options = {
            mimeType: "video/webm"
        };
        this.recordedBlobs = [];
        this.mediaRecorder = new MediaRecorder(this.stream, options);
        try {
            this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (err0) {
            console.log("Unable to create MediaRecorder with options Object: ", err0);
            try {
                options = {
                    mimeType: "video/webm,codecs=vp9"
                };
                this.mediaRecorder = new MediaRecorder(this.stream, options);
            } catch (err1) {
                console.log("Unable to create MediaRecorder with options Object: ", err1);
                try {
                    options = "video/vp8"; // Chrome 47
                    this.mediaRecorder = new MediaRecorder(this.stream, options);
                } catch (err2) {
                    alert(`\
MediaRecorder is not supported by this browser.

Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.\
`);
                    console.error("Exception while creating MediaRecorder:", err2);
                    return;
                }
            }
        }

        this.mediaRecorder.onstop = (event) => {
            const superBuffer = new Blob(this.recordedBlobs, {
                type: "video/webm"
            });
            this.video.src = window.URL.createObjectURL(superBuffer);
        };

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedBlobs.push(event.data);
            }
        };

        this.mediaRecorder.start(100); // collect 100ms of data

        console.log("Started MediaRecorder")
    }

    stopRecording() {
        this.mediaRecorder.stop();

        this.canvas.style.display = "none";
        this.video.style.display = "";
        this.video.controls = true;

        console.log("Stopped MediaRecorder")
    }

    download() {
        const blob = new Blob(this.recordedBlobs, {
            type: "video/webm"
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = this.downloadName + ".webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 50);
    }
}

class LogoAnimation {
    /**
     * Krunker Logo Animation
     * @param {HTMLCanvasElement} canvas 
     * @param {HTMLImageElement} image 
     */
    constructor(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.gl = canvas.getContext("webgl");
        this.frame = 0;
        this.isAnimating = false;
        this.onAnimationFinished = () => {};
    }

    init() {
        const {
            gl,
            image,
            canvas
        } = this;

        this.updateTexture();

        let vertices = [
            -1, 1, 0.0,
            -1, -1, 0.0,
            1, -1, 0.0,
            1, 1, 0.0
        ];

        let indices = [3, 2, 1, 3, 1, 0];

        let vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        const vertexShaderSource = `
        attribute vec3 coordinates;
        varying vec2 _coordinates; 
        void main() {
            _coordinates = vec2(coordinates.x, coordinates.y);
            gl_Position = vec4(coordinates, 1.0);
        }
        `;

        const fragShaderSource = `
        precision highp float;

        // Defines
        #define PI ${Math.PI}

        // Globals
        varying vec2 _coordinates; 

        // Uniforms
        uniform float uFrame; // frame count
        uniform vec2 uRes; // canvas resolution
        uniform sampler2D uSampler;
        
        mat2 rotate2d(float angle) {
            return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        }

        void main() {
            float movWidth = 1.25;
            vec2 uv = gl_FragCoord.xy / uRes.xy; // _coordinates;
            vec2 texUv = uv;
            texUv.y = 1.0 - uv.y;
            vec4 tex = texture2D(uSampler, texUv);
            float time = sin((uFrame / 60.) - movWidth) / (2. / movWidth);
            uv -= 0.5;
            uv = rotate2d((-10. / 360.) * PI) * uv; 
            
            vec3 col = tex.rgb;
            vec3 shine = clamp(vec3( (1.0) - sqrt(12.5 * (time == uv.x ? 0.0 : time > uv.x ? time - uv.x : uv.x - time) + 0.10) ), 0.0, 1.0);
            col = mix(col, vec3(1.0), shine);

            // Output to screen
            gl_FragColor = vec4(col, tex.a);
        }
        `

        /**
         * For creating WebGL Shaders
         * @param {string} sourceCode GLSL Shader Source
         * @param {35632|35633} type WebGL Shader Type
         * @tutorial https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
         * @returns {WebGLShader}
         */
        function createShader(sourceCode, type) {
            // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
            var shader = gl.createShader(type);
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var info = gl.getShaderInfoLog(shader);
                throw "Could not compile WebGL program. \n\n" + info;
            }
            return shader;
        }

        const shaderProgram = gl.createProgram();

        const fragmentShader = createShader(fragShaderSource, gl.FRAGMENT_SHADER);
        const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        gl.linkProgram(shaderProgram);

        let progLog = gl.getProgramInfoLog(shaderProgram);
        if (!!progLog) console.log(progLog)

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        let coord = gl.getAttribLocation(shaderProgram, "coordinates");

        this.animate = () => {
            let frameLocation = gl.getUniformLocation(shaderProgram, "uFrame"),
                samplerLocation = gl.getUniformLocation(shaderProgram, "uSampler"),
                resLocation = gl.getUniformLocation(shaderProgram, "uRes");

            gl.activeTexture(gl.TEXTURE0);
            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(coord);

            gl.useProgram(shaderProgram);

            gl.uniform1f(frameLocation, this.frame);
            gl.uniform2fv(resLocation, [canvas.width, canvas.height]);
            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(samplerLocation, 0);

            let height = canvas.height / (canvas.width > canvas.height ? (canvas.height / canvas.width) : 1);
            let width = canvas.width * (canvas.width < canvas.height ? (canvas.height / canvas.width) : 1);

            gl.viewport(0, 0, width, height) //, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(1.0, 1.0, 1.0, 0.0)
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

            if (this.frame > 60 * 6) {
                this.onAnimationFinished();
            }

            this.frame++;
        }
    }

    updateTexture() {
        const {
            gl,
            image
        } = this;

        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

        const imgLevel = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        this.texture = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, imgLevel, internalFormat, srcFormat, srcType, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }

    startAnimation() {
        this.isAnimating = true;

        let animationLoop = () => {
            if (this.isAnimating) {
                this.animate();
                requestAnimationFrame(animationLoop);
            } else {
                cancelAnimationFrame(animationLoop)
            }
        }

        animationLoop();
    }

    stopAnimation() {
        this.isAnimating = false;
    }
}

const recorder = new CanvasRecorder(animCanvas, animVideo);
const animator = new LogoAnimation(animCanvas, new Image());
animator.init();

let downloadAnimation = () => {
    recorder.download();
}

let updateAnimationScale = (width, height) => {
    let fn = (elem) => {
        elem.style.height = height / 2 + "px";
        elem.style.width = width / 2 + "px";
        elem.setAttribute("height", height);
        elem.setAttribute("width", width);
    }

    [animVideo, animCanvas].forEach(fn);
}

let stopRenderAnimation = () => {
    recorder.stopRecording();
    animator.stopAnimation();
}

window.stopRenderAnimation = stopRenderAnimation;
animator.onAnimationFinished = stopRenderAnimation;

let renderAnimation = () => {
    let pngDownload = document.getElementById("downloadPng");
    recorder.downloadName = pngDownload.download.replace(/(\.\w+)$/, "");
    let imgUrl = pngDownload.href;
    let img = new Image();
    img.src = imgUrl;
    img.onload = (event) => {
        updateAnimationScale(img.width, img.height);
        animator.image = img;
        animator.updateTexture();
        animator.frame = 0;
        animator.startAnimation();
        recorder.startRecording();
    }
}

let showAnimationHolder = () => {
    let animationHolder = document.getElementById("animationHolder");
    animationHolder.style.display = "block";
    document.getElementById("downloadHolder").style.display = "none";
    document.getElementById("popupHolder").style.display = "block";
}
