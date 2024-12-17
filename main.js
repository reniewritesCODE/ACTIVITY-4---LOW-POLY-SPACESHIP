import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/DRACOLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); 
scene.fog = new THREE.Fog(0x87ceeb, 50, 200); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-35, 30, 70);
scene.add(camera);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Sunlight
const sunLight = new THREE.PointLight(0xffffff, 1.5, 200);
sunLight.position.set(50, 50, 50);
scene.add(sunLight);

// Ground (Ocean) Geometry
const oceanGeometry = new THREE.PlaneGeometry(200, 200, 512, 512);
oceanGeometry.rotateX(-Math.PI / 2);

// Ocean Shader Material
const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 10.0 }, // For wave animation
        uColorTop: { value: new THREE.Color(0x4da8da) }, // Light blue water
        uColorBottom: { value: new THREE.Color(0x1a4d6b) } // Deep water blue
    },
    vertexShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Wave effects using sine functions
            float wave1 = sin(pos.x * 0.3 + uTime) * 0.3;
            float wave2 = cos(pos.z * 0.2 + uTime * 0.5) * 0.2;
            pos.y += wave1 + wave2;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColorTop;
        uniform vec3 uColorBottom;
        varying vec2 vUv;

        void main() {
            // Simple gradient for water color
            vec3 color = mix(uColorBottom, uColorTop, vUv.y);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    side: THREE.DoubleSide,
});


const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
scene.add(ocean);

scene.fog = new THREE.FogExp2(0x87ceeb, 0.005); 


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"); 
loader.setDRACOLoader(dracoLoader);

let spaceship;

loader.load(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf",
    (gltf) => {
        spaceship = gltf.scene;
        spaceship.position.set(0, 20, 0);
        spaceship.scale.set(15, 15, 15);
        scene.add(spaceship);
    },
    undefined,
    (error) => {
        console.error("Error loading the spaceship model:", error);
    }
);

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();


    oceanMaterial.uniforms.uTime.value = elapsedTime;


    sunLight.position.set(
        50 * Math.sin(elapsedTime * 0.2),
        50,
        50 * Math.cos(elapsedTime * 0.2)
    );


    if (spaceship) {
        spaceship.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;
    }


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();


window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



