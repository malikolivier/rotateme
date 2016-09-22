varying vec4 v_position;
void main() {
  v_position  = vec4(position, 1);
  gl_Position = vec4(position, 1);
}
