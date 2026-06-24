precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_textureSize;

varying vec2 v_texCoord;

void main() {
    //gl_FragColor = texture2D(u_image, v_texCoord).bgra;
    //gl_FragColor = texture2D(u_image, v_texCoord);
    vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

    gl_FragColor = (
        texture2D(u_image, v_texCoord) +
        texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) +
        texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0)) 
    )/ 3.0;
}