async function loadShaderFile(url) {
    const response = await fetch(url);
    const shaderText = await response.text();
    return shaderText;
}

function createShader (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

async function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");

    if(!gl) {
        alert("WebGL is not supported in this browser.");
        return;
    }

    console.log("Loading shaders...")
    const vertexShaderSource = await loadShaderFile('./shaders/vertex.vert');
    const fragmentShaderSource = await loadShaderFile('./shaders/fragment.frag');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    var positions = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ];

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.enableVertexAttribArray(positionAttributeLocation);
    
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    drawShape(gl, positions);
    
}

function drawShape(gl, positionsArray) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsArray), gl.STATIC_DRAW);

    const size = 2
    const count = positionsArray.length / size;

    gl.drawArrays(gl.TRIANGLES, 0, count);
}

main();