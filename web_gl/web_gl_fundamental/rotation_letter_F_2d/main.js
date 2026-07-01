"use strict";
let translation = [0, 0];
let color = [Math.random(), Math.random(), Math.random(), 1];
let rotation = [0, 1];

async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
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
    
    let positionLocation = gl.getAttribLocation(program, "a_position");
    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    let translationLocation = gl.getUniformLocation(program, "u_translation");
    let rotationLocation = gl.getUniformLocation(program, "u_rotation");
    let colorLocation = gl.getUniformLocation(program, "u_color");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);
    drawScene(gl, program, positionLocation, resolutionLocation, colorLocation, translationLocation, rotationLocation, positionBuffer);

    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
    $("#rotation").gmanUnitCircle({
    width: 200,
    height: 200,
    value: 0,
    slide: function(e,u) {
      rotation[0] = u.x;
      rotation[1] = u.y;
      drawScene(gl, program, positionLocation, resolutionLocation, colorLocation, translationLocation, rotationLocation, positionBuffer);
    }
  });

    function updatePosition(index) {
        return function(event, ui) {
            translation[index] = ui.value;
            drawScene(gl, program, positionLocation, resolutionLocation, colorLocation, translationLocation, rotationLocation, positionBuffer);
        }
    }
}

function drawScene(gl, program, positionLocation, resolutionLocation, colorLocation, translationLocation, rotationLocation, positionBuffer) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.uniform2fv(translationLocation, translation);
    gl.uniform2fv(rotationLocation, rotation);

    let size = 2;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(colorLocation, color);

    let primitiveType = gl.TRIANGLES;
    offset = 0;
    let count = 18;
    gl.drawArrays(primitiveType, offset, count);
}

function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,
 
          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,
 
          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
}

main();