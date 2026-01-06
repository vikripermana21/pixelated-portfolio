#include <common>
#include <shadowmap_pars_vertex>

varying vec4 vShadowCoord;
varying vec2 vUv;

void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition ;
    vec4 worldOrigin = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    vShadowCoord = directionalShadowMatrix[0] * worldOrigin;
    vUv = uv;

    gl_Position = clipPosition;

}
