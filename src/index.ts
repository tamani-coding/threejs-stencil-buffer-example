import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'


const params = {

    plane01: {

        constant: 1,
        negated: false,
        displayHelper: true

    },

    stencilMesh: {
        z: 0
    },

};

const clock = new THREE.Clock();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(4, 5, 4);

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

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
renderer.setClearColor(0x453C67);
window.addEventListener('resize', onWindowResize);
document.body.appendChild(renderer.domElement);


// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 20;
controls.update();

// GUI
const gui = new GUI();

// initPlanes();
initCube();
animate();

function initCube() {

    const addCubeFace = (objectGeom: THREE.BufferGeometry, objectColor: string, 
        stencilRef: number, planePos: THREE.Vector3, planeRot: THREE.Vector3 ) => {

            // CUBE FACE
            const planeGeom = new THREE.PlaneGeometry();
            const stencilMat = new THREE.MeshPhongMaterial({ color: 'white' });
            stencilMat.depthWrite = false;
            stencilMat.stencilWrite = true;
            stencilMat.stencilRef = stencilRef;
            stencilMat.stencilFunc = THREE.AlwaysStencilFunc;
            stencilMat.stencilZPass = THREE.ReplaceStencilOp;
            const stencilMesh = new THREE.Mesh(planeGeom, stencilMat);
            stencilMesh.position.copy(planePos);
            stencilMesh.rotation.x = planeRot.x;
            stencilMesh.rotation.y = planeRot.y;
            stencilMesh.rotation.z = planeRot.z;
            stencilMesh.scale.multiplyScalar(0.9);
            scene.add(stencilMesh);
        
            // OBJECT INSIDE CUBE
            const objectMat = new THREE.MeshPhongMaterial({ color: objectColor});
            objectMat.stencilWrite = true;
            objectMat.stencilRef = stencilRef;
            objectMat.stencilFunc = THREE.EqualStencilFunc;
            const object = new THREE.Mesh(objectGeom, objectMat);
            scene.add(object);
    }

    addCubeFace(new THREE.ConeGeometry(0.25, 0.5, 4), 'red', 1, new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,0));
    addCubeFace(new THREE.CylinderGeometry(0.15, 0.15, 0.5), 'yellow', 2, new THREE.Vector3(0,0.5,0), new THREE.Vector3(- Math.PI / 2,0,0));
    addCubeFace(new THREE.OctahedronGeometry(0.25), 'green', 3, new THREE.Vector3(0,-0.5,0), new THREE.Vector3( Math.PI / 2,0,0));
    addCubeFace(new THREE.TorusGeometry(0.25, 0.1), 'blue', 4, new THREE.Vector3(0,0,-0.5), new THREE.Vector3( Math.PI,0,0));
    addCubeFace(new THREE.ConeGeometry(0.25, 0.5), 'orange', 5, new THREE.Vector3(-0.5,0,0), new THREE.Vector3( 0, -Math.PI / 2,0));
    addCubeFace(new THREE.BoxGeometry(0.5, 0.5, 0.5), 'brown', 6, new THREE.Vector3(0.5,0,0), new THREE.Vector3( 0, Math.PI / 2,0));

    const boxBorderMat = new THREE.MeshPhongMaterial({ color: 0x1A120B });
    boxBorderMat.stencilWrite = true;
    boxBorderMat.stencilRef = 0;
    boxBorderMat.stencilFunc = THREE.EqualStencilFunc;
    const boxBorderGeom = new THREE.BoxGeometry();
    scene.add(new THREE.Mesh(boxBorderGeom, boxBorderMat));
}

function initPlanes () {
    const planeGeom = new THREE.PlaneGeometry();

    const stencilMat = new THREE.MeshPhongMaterial({ color: 'green' });
    stencilMat.colorWrite = false;
    stencilMat.depthWrite = false;
    stencilMat.stencilWrite = true;
    stencilMat.stencilRef = 1;
    stencilMat.stencilFunc = THREE.AlwaysStencilFunc;
    // stencilMat.stencilZFail = THREE.ReplaceStencilOp;
    // stencilMat.stencilFail = THREE.ReplaceStencilOp;
    stencilMat.stencilZPass = THREE.ReplaceStencilOp;
    const stencilMesh = new THREE.Mesh(planeGeom, stencilMat);
    const stencilHelper = new THREE.BoxHelper(stencilMesh, 'white');
    scene.add(stencilHelper);
    scene.add(stencilMesh);

    const greenMat = new THREE.MeshPhongMaterial({ color: 'blue' });
    greenMat.stencilWrite = true;
    greenMat.stencilRef = 1;
    greenMat.stencilFunc = THREE.NotEqualStencilFunc;
    const greenMesh = new THREE.Mesh(planeGeom, greenMat);
    greenMesh.position.x = -0.5;
    greenMesh.position.y = 0.5;
    scene.add(greenMesh);

    const yellowMat = new THREE.MeshPhongMaterial({ color: 'red' });
    yellowMat.stencilWrite = true;
    yellowMat.stencilRef = 1;
    yellowMat.stencilFunc = THREE.EqualStencilFunc;
    const yellowMesh = new THREE.Mesh(planeGeom, yellowMat);
    yellowMesh.position.x = 0.5;
    yellowMesh.position.y = -0.5;
    scene.add(yellowMesh);

    const stencilParams = gui.addFolder('stencilParams');
    stencilParams.add(params.stencilMesh, 'z').min(- 1).max(1).onChange(d => {
            stencilMesh.position.z = d
            stencilHelper.update();
    });
    stencilParams.open();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    const delta = clock.getDelta();

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}