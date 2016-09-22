precision mediump float;

uniform samplerCube skybox;
uniform mat4 viewDirectionProjectionInverse;

varying vec4 v_position;
void main() {
  vec4 t = viewDirectionProjectionInverse * v_position;
  gl_FragColor = textureCube(skybox, normalize(t.xyz / t.w));
}
