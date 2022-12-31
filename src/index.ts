import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'


const params = {

    plane01: {

        constant: 1,
        negated: false,
        displayHelper: true

    },

};

const clock = new THREE.Clock();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(4, 5, 4);

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x263238);
window.addEventListener('resize', onWindowResize);
document.body.appendChild(renderer.domElement);

renderer.localClippingEnabled = true;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 20;
controls.update();

// CLIPPING & STENCIL OBJECTS
const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1);
const clipppingPlaneHelper = new THREE.PlaneHelper(clippingPlane, 2, 0xffffff);
scene.add(clipppingPlaneHelper);
const objectGroup = new THREE.Group();
scene.add(objectGroup);
let planeObject: THREE.Mesh;

// GUI
const gui = new GUI();
const myPlane = gui.addFolder('my_plane');
myPlane.add(params.plane01, 'displayHelper').onChange(v => clipppingPlaneHelper.visible = v);
myPlane.add(params.plane01, 'constant').min(- 1).max(1).onChange(d => clippingPlane.constant = d);
myPlane.add(params.plane01, 'negated').onChange(() => {
    clippingPlane.negate();
    params.plane01.constant = myPlane.constant;
});
myPlane.open();

init();
animate();

function init() {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF7F3F,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: [clippingPlane],
        clipShadows: true,
        shadowSide: THREE.DoubleSide,
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.renderOrder = 6;
    objectGroup.add(sphere);

    const stencilGroup = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [clippingPlane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(sphereGeometry, mat0);
    mesh0.renderOrder = 1;
    stencilGroup.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [clippingPlane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(sphereGeometry, mat1);
    mesh1.renderOrder = 1;

    stencilGroup.add(mesh1);
    objectGroup.add(stencilGroup);

    const planeMat =
        new THREE.MeshStandardMaterial({

            color: 0xE91E63,
            metalness: 0.1,
            roughness: 0.75,
            // clippingPlanes: planes.filter( p => p !== plane ),

            stencilWrite: true,
            stencilRef: 0,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilFail: THREE.ReplaceStencilOp,
            stencilZFail: THREE.ReplaceStencilOp,
            stencilZPass: THREE.ReplaceStencilOp,

        });
    const planeGeom = new THREE.PlaneGeometry(4, 4);
    planeObject = new THREE.Mesh(planeGeom, planeMat);
    planeObject.onAfterRender = function (renderer) {

        renderer.clearStencil();

    };

    planeObject.renderOrder = 1.1;

    scene.add(planeObject);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    const delta = clock.getDelta();

    requestAnimationFrame(animate);

    if (planeObject) {
        clippingPlane.coplanarPoint(planeObject.position);
        planeObject.lookAt(
            planeObject.position.x - clippingPlane.normal.x,
            planeObject.position.y - clippingPlane.normal.y,
            planeObject.position.z - clippingPlane.normal.z,
        );
    }

    renderer.render(scene, camera);

}