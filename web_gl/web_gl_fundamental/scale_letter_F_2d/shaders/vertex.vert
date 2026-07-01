attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;
void main() {
    // Scale the position
    vec2 scalePosition = u_scale * a_position;
    
    // Rotation the position
    vec2 rotatedPosition = vec2(
        scalePosition.x * u_rotation.y + scalePosition.y * u_rotation.x,
        scalePosition.y * u_rotation.y - scalePosition.x * u_rotation.x
    );
    
    // Translation the position
    vec2 position = rotatedPosition + u_translation;
    
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1,-1), 0, 1);
}