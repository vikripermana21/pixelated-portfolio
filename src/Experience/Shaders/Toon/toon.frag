#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform sampler2D uAlphaGrass;

varying vec4 vShadowCoord;
varying vec2 vUv;

void main() {
  // Alpha Grass
  float alpha = texture2D(uAlphaGrass,vUv).r;

  if (alpha < 0.5) discard;

  // Directional light
  DirectionalLight directionalLight = directionalLights[0];

  // shadow map
  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowIntensity * .95,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vShadowCoord
  );
vec3 diffuse = uColor * directionalLight.color ;
  vec3 ambient = uColor * ambientLightColor  ;
  vec3 color = ambient + diffuse * shadow ;

  gl_FragColor = vec4(color * 0.3,alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}
