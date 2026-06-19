// Load shader file content from a URL
async function loadShaderFile(url) {
    const response = await fetch(url);
    const shaderText = await response.text();
    return shaderText;
}

// Compile source code into a Shader
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

// Link Vertex and Fragment shaders into a complete Program
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

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;

    let positions = [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
    ];
    // Push data into the current ARRAY_BUFFER
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}
async function main() {
    // Initialize WebGL environment
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");

    if(!gl) {
        alert("WebGL is not supported in this browser.");
        return;
    }

    //Load and Activate shader program
    console.log("Loading shaders...")
    const vertexShaderSource = await loadShaderFile('./shaders/vertex.vert');
    const fragmentShaderSource = await loadShaderFile('./shaders/fragment.frag');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
   
    // Tell WebGl to use our program for drawing
    gl.useProgram(program);
    
    // Find where the coordinate data goes (a_position)
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    
    // Find where the global settings go (Resolution and Color)
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    
    // Pass canvas size to Shader so it can convert Pixels to Clip Space (-1 to +1)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
    // Clear the screen with a transparent color
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Create a container (Buffer) for coordinates and plug it into ARRAY_BUFFER
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Turn on a_position and tell it how to read data from positionBuffer
    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2;                     // Read 2 numbers (x, y) for each vertex
    const type = gl.FLOAT;         // Data type is 32-bit float
    const normalize = false;       // Do not normalize the data
    const stride = 0;                  // Skip bytes (0 = read continuously)
    const offset = 0;                 // Start reading from the beginning
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    for (let i = 0; i < 50; ++i) {
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

main();