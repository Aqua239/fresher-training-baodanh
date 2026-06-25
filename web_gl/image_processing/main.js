async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}

function createShader(gl, type, source) {
    let shader= gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

async function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    if(!gl) return alert ("No supporting WebGL");

    const vertSource = await loadShaderFile("./shaders/vertex.vert");
    const fragSource = await loadShaderFile("./shaders/fragment_kernel.frag");

    const program = createProgram(gl,
        createShader(gl, gl.VERTEX_SHADER, vertSource),
        createShader(gl, gl.FRAGMENT_SHADER, fragSource)
    )

    let image = new Image();
    image.src = "./img/mr-survivor.jpg";

    image.onload = function() {
        render(gl, program, image);
    }
}

const KERNELS = {
    normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ],
    gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ],
    unsharpen: [
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
    ],
    emboss: [
        -2, -1,  0,
        -1,  1,  1,
        0,  1,  2
    ],

    edgeDetectKernel: [
     -1, -1, -1,
     -1,  8, -1,
     -1, -1, -1
    ]
};

function applyKernel(gl, program, kernelName) {
    let kernel = KERNELS[kernelName];
    if (!kernel) kernel = KERNELS["normal"];

    let kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
    let kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

    gl.uniform1fv(kernelLocation, kernel);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernel));
}

function computeKernelWeight(kernel) {
    let weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });

    return weight <= 0 ? 1 : weight;
}

function render(gl, program, image) {
    gl.useProgram(program);

    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    let positionLoc = gl.getAttribLocation(program, "a_position");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let x1 = 0, y1 = 0;
    let x2 = x1 + image.width, y2 = y1 + image.height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1, x2, y1, x1, y2,
        x1, y2, x2, y1, x2, y2
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    let textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    let texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    let texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    let originalImageTexture = createAndSetupTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    let textures = [];
    let framebuffers = [];
    for (let ii = 0; ii < 2; ++ii) {
        let texture = createAndSetupTexture(gl);
        textures.push(texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        let fbo = gl.createFramebuffer();
        framebuffers.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    let flipYLocation = gl.getUniformLocation(program, "u_flipY");
    gl.uniform1f(flipYLocation, 1);

    let effectsToApply = ["gaussianBlur", "emboss", "unsharpen"];

    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    for (let ii = 0; ii < effectsToApply.length; ++ii) {
        setFramebuffer(gl, resolutionUniformLocation, framebuffers[ii % 2], image.width, image.height);
        drawWithKernel(gl, program, effectsToApply[ii]);
        gl.bindTexture(gl.TEXTURE_2D, textures[ii % 2]);
    }
    
    gl.uniform1f(flipYLocation, -1);
    gl.canvas.width = image.width;
    gl.canvas.height = image.height;
    setFramebuffer(gl, resolutionUniformLocation, null, gl.canvas.width, gl.canvas.height);

    drawWithKernel(gl, program, "normal");
}

function createAndSetupTexture(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

function setFramebuffer(gl, resolutionUniformLocation, fbo, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.uniform2f(resolutionUniformLocation, width, height);
    gl.viewport(0, 0, width, height);
}

function drawWithKernel(gl, program, name) {
    applyKernel(gl, program, name);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
main();