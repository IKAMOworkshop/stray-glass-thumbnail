import {
	Vector2
} from 'three';

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const CustomPass = {

	name: 'CustomPass',

	uniforms: {

		'tDiffuse': { value: null },
		'tSize': { value: new Vector2( 256, 256 ) },
		'center': { value: new Vector2( 0.5, 0.5 ) },
		'angle': { value: 1.57 },
		'scale': { value: 1.0 },
        'time': { value: 0.0 },
        'progress': { value: 0.0 },
        'scale': { value: 1.0 },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec2 center;
		uniform float angle;
		uniform float scale;
		uniform vec2 tSize;
        uniform float time;
        uniform float progress;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		float pattern() {

			float s = sin( angle ), c = cos( angle );

			vec2 tex = vUv * tSize - center;
			vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;

			return ( sin( point.x ) * sin( point.y ) ) * 4.0;

		}

		void main() {
            vec4 color = texture2D( tDiffuse, vUv);
            float rgbShift = 0.01;

            vec2 uv = vUv;

            vec2 r_uv = vec2(
                uv.x + sin(uv.x-0.5) * rgbShift*1.0,
                uv.y + sin(uv.y-0.5) * rgbShift*3.0
            );

            vec2 g_uv = vec2(
                uv.x + sin(uv.x-0.5) * rgbShift*2.0,
                uv.y + sin(uv.y-0.5) * rgbShift*2.0
            );

            vec2 b_uv = vec2(
                uv.x + sin(uv.x-0.5) * rgbShift*3.0,
                uv.y + sin(uv.y-0.5) * rgbShift*1.0
            );

            float r = texture2D( tDiffuse, r_uv).r;
            float g = texture2D( tDiffuse, g_uv).g;
            float b = texture2D( tDiffuse, b_uv).b;

            gl_FragColor = vec4(r, g, b, 1.0);
            // gl_FragColor = vec4(length(p), 0.0, 0.0 ,1.0);

		}`

};

export { CustomPass };
