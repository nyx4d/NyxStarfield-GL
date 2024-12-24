const canvas = document.getElementById("starfield");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 300;

// Starfield setup
const starCount = 1000;
const naTVColors = ['#00C3FF', '#CF19B9', '#FFD700', '#39FF14'];
const starGeo = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

    const color = new THREE.Color(naTVColors[Math.floor(Math.random() * naTVColors.length)]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const starMaterial = new THREE.ShaderMaterial({
    uniforms: { pointSize: { value: 2.0 }, time: { value: 1.0 } },
    vertexShader: `
        uniform float pointSize;
        varying vec3 vColor;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = pointSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vColor = color;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
    vertexColors: true,
    transparent: true,
    depthTest: false,
});

const stars = new THREE.Points(starGeo, starMaterial);
scene.add(stars);

function animate() {
    requestAnimationFrame(animate);

    const positions = starGeo.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        positions[i * 3 + 2] += 0.2;
        if (positions[i * 3 + 2] > 300) positions[i * 3 + 2] = -300;
    }
    starGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
