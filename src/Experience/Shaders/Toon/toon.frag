#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;

varying vec4 vShadowCoord;

void main() {
  // shadow map
  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowIntensity,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vShadowCoord
  );

  vec3 color = uColor * 0.32 ;

  gl_FragColor = vec4(color * (ambientLightColor + shadow),1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}
