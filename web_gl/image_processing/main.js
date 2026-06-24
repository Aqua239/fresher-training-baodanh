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
    const fragSource = await loadShaderFile("./shaders/fragment.frag");

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

function render(gl, program, image) {
    gl.useProgram(program);

    let resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);

    let positionLoc = gl.getAttribLocation(program, "a_position");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var x1 = 0, y1 = 0;
    var x2 = x1 + image.width, y2 = y1 + image.height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1, x2, y1, x1, y2,
        x1, y2, x2, y1, x2, y2
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    var texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

main();