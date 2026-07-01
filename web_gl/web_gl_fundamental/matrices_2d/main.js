"use strict";
let translation = [100, 100];
let color = [Math.random(), Math.random(), Math.random(), 1];
let rotation = [0, 1];
let angleInRadians = 0;
let scale = [0.8,0.8];
let m3 = {
    projection: function(width, height) {
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    },
    
    identity: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    },
    
    translation: function(tx, ty) {
        return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
        ];
    },

    rotation: function(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        return [
        c,-s, 0,
        s, c, 0,
        0, 0, 1,
        ];
    },

    scaling: function(sx, sy) {
        return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
        ];
    },
    multiply: function(a, b) {
        let a00 = a[0 * 3 + 0];
        let a01 = a[0 * 3 + 1];
        let a02 = a[0 * 3 + 2];
        let a10 = a[1 * 3 + 0];
        let a11 = a[1 * 3 + 1];
        let a12 = a[1 * 3 + 2];
        let a20 = a[2 * 3 + 0];
        let a21 = a[2 * 3 + 1];
        let a22 = a[2 * 3 + 2];
        let b00 = b[0 * 3 + 0];
        let b01 = b[0 * 3 + 1];
        let b02 = b[0 * 3 + 2];
        let b10 = b[1 * 3 + 0];
        let b11 = b[1 * 3 + 1];
        let b12 = b[1 * 3 + 2];
        let b20 = b[2 * 3 + 0];
        let b21 = b[2 * 3 + 1];
        let b22 = b[2 * 3 + 2];
    
        return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
        ];
    }
}

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
    let matrixLocation = gl.getUniformLocation(program, "u_matrix");
    let colorLocation = gl.getUniformLocation(program, "u_color");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);
    drawScene();

    webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
    webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
    webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.1, precision: 2});
    webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.1, precision: 2});

    function updatePosition(index) {
        return function(event, ui) {
            translation[index] = ui.value;
            drawScene();
        }
    }

    function updateAngle(event, ui) {
        let angleInDegrees = 360 - ui.value;
        angleInRadians = angleInDegrees * Math.PI / 180;
        drawScene();
    }

    function updateScale(index) {
        return function(event, ui) {
            scale[index] = ui.value;
            drawScene();
        }
    }

    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let size = 2;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
    
        gl.uniform4fv(colorLocation, color);

        let projectionMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        let translationMatrix = m3.translation(translation[0], translation[1]);
        let rotationMatrix = m3.rotation(angleInRadians);
        let scaleMatrix = m3.scaling(scale[0], scale[1]);

        let moveOriginMatrix = m3.translation(-50, -75);

        let matrix = m3.identity();
        matrix = m3.multiply(projectionMatrix, translationMatrix);
        matrix = m3.multiply(matrix, rotationMatrix);
        matrix = m3.multiply(matrix, scaleMatrix);
        matrix = m3.multiply(matrix, moveOriginMatrix);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
    
        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 18;
        gl.drawArrays(primitiveType, offset, count);
    }

    function draw5F() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let size = 2;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        
        gl.uniform4fv(colorLocation, color);

        let translationMatrix = m3.translation(translation[0], translation[1]);
        let rotationMatrix = m3.rotation(angleInRadians);
        let scaleMatrix = m3.scaling(scale[0], scale[1]);

        let matrix = m3.identity();

        for (let ii = 0; ii < 5; ii++) {
            matrix = m3.multiply(matrix, translationMatrix);
            matrix = m3.multiply(matrix, rotationMatrix);
            matrix = m3.multiply(matrix, scaleMatrix);
    
            gl.uniformMatrix3fv(matrixLocation, false, matrix);
        
            let primitiveType = gl.TRIANGLES;
            offset = 0;
            let count = 18;
            gl.drawArrays(primitiveType, offset, count);
        }
    }
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