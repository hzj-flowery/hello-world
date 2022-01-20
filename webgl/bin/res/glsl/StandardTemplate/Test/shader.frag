precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;

float rand( vec2 seed ){

            // get pseudo-random number
                return fract( sin( dot( seed.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
    
            }
        // based on https://www.shadertoy.com/view/MslGR8
vec3 dithering( vec3 color) {
	//Calculate grid position
	float grid_position = rand( gl_FragCoord.xy );

	//Shift the individual colors differently, thus making it even harder to see the dithering pattern
	vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

	//modify shift acording to grid position.
	dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

	//shift the color by dither_shift
	return color + dither_shift_RGB;
}

void main() {
	vec3 fragColor = vec3(texture2D(u_texture, v_uv).rgb);
	fragColor.rgb = dithering(fragColor.rgb);
    gl_FragColor = vec4(fragColor.rgb,1.0);
}