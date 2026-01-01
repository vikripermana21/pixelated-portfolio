#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;

varying vec4 vShadowCoord;

void main() {
  // Directional light
  DirectionalLight directionalLight = directionalLights[0];

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
vec3 diffuse = uColor * directionalLight.color;
  vec3 ambient = uColor * ambientLightColor ;
  vec3 color = ambient + diffuse * shadow ;

  gl_FragColor = vec4(color * 0.32,1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}
