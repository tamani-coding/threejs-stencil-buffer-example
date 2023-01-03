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
renderer.localClippingEnabled = true;
window.addEventListener('resize', onWindowResize);
document.body.appendChild(renderer.domElement);


// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 20;
controls.update();

// GUI
const gui = new GUI();

init3();
animate();

function init4() {

    const addSide = (objectGeom: THREE.BufferGeometry, objectColor: string, 
        stencilRef: number, planePos: THREE.Vector3, planeRot: THREE.Vector3 ) => {

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
        
            const objectMat = new THREE.MeshPhongMaterial({ color: objectColor});
            objectMat.stencilWrite = true;
            objectMat.stencilRef = stencilRef;
            objectMat.stencilFunc = THREE.EqualStencilFunc;
            const object = new THREE.Mesh(objectGeom, objectMat);
            scene.add(object);
    }

    addSide(new THREE.ConeGeometry(0.25, 0.5, 4), 'red', 1, new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,0));
    addSide(new THREE.CylinderGeometry(0.15, 0.15, 0.5), 'yellow', 2, new THREE.Vector3(0,0.5,0), new THREE.Vector3(- Math.PI / 2,0,0));
    addSide(new THREE.OctahedronGeometry(0.25), 'green', 3, new THREE.Vector3(0,-0.5,0), new THREE.Vector3( Math.PI / 2,0,0));
    addSide(new THREE.TorusGeometry(0.25, 0.1), 'blue', 4, new THREE.Vector3(0,0,-0.5), new THREE.Vector3( Math.PI,0,0));
    addSide(new THREE.ConeGeometry(0.25, 0.5), 'orange', 5, new THREE.Vector3(-0.5,0,0), new THREE.Vector3( 0, -Math.PI / 2,0));
    addSide(new THREE.BoxGeometry(0.5, 0.5, 0.5), 'brown', 6, new THREE.Vector3(0.5,0,0), new THREE.Vector3( 0, Math.PI / 2,0));

    const boxBorderMat = new THREE.MeshPhongMaterial({ color: 0x1A120B });
    boxBorderMat.stencilWrite = true;
    boxBorderMat.stencilRef = 0;
    boxBorderMat.stencilFunc = THREE.EqualStencilFunc;
    const boxBorderGeom = new THREE.BoxGeometry();
    scene.add(new THREE.Mesh(boxBorderGeom, boxBorderMat));
}

function init3 () {
    const planeGeom = new THREE.PlaneGeometry();

    const stencilMat = new THREE.MeshPhongMaterial({ color: 'blue' });
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

    const greenMat = new THREE.MeshPhongMaterial({ color: 'green' });
    greenMat.stencilWrite = true;
    greenMat.stencilRef = 1;
    greenMat.stencilFunc = THREE.NotEqualStencilFunc;
    const greenMesh = new THREE.Mesh(planeGeom, greenMat);
    greenMesh.position.x = -0.5;
    greenMesh.position.y = 0.5;
    scene.add(greenMesh);

    const yellowMat = new THREE.MeshPhongMaterial({ color: 'yellow' });
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

function init() {
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);

    const stencilMat = new THREE.MeshPhongMaterial({ color: 'yellow' });
    stencilMat.colorWrite = false;
    stencilMat.depthWrite = false;
    stencilMat.depthTest = false;
    stencilMat.stencilWrite = true;
    stencilMat.stencilRef = 1;
    stencilMat.stencilFunc = THREE.AlwaysStencilFunc;
    stencilMat.stencilZPass = THREE.ReplaceStencilOp;
    const stencilMesh = new THREE.Mesh(sphereGeometry, stencilMat);
    stencilMesh.renderOrder = 0;
    scene.add(stencilMesh);

    const stencilParams = gui.addFolder('stencilParams');
    stencilParams.add(params.stencilMesh, 'z').min(- 1).max(1).onChange(d => {
        if (stencilMesh) {
            stencilMesh.position.z = d
        }
    });
    stencilParams.open();

    const blueMat = new THREE.MeshPhongMaterial({ color: 'blue'});
    blueMat.stencilWrite = true;
    blueMat.stencilFunc = THREE.NotEqualStencilFunc;
    blueMat.stencilRef = 1;
    const blueMesh = new THREE.Mesh(sphereGeometry, blueMat);
    blueMesh.position.x = -1;
    blueMesh.renderOrder = 1;
    scene.add(blueMesh);

    const greenMat = new THREE.MeshPhongMaterial({ color: 'green'});
    greenMat.stencilWrite = true;
    greenMat.stencilFunc = THREE.NotEqualStencilFunc;
    greenMat.stencilRef = 1;
    const greenMesh = new THREE.Mesh(sphereGeometry, greenMat);
    greenMesh.position.x = 1;
    greenMesh.renderOrder = 1;
    scene.add(greenMesh);
}

function init2() {
    // CLIPPING & STENCIL OBJECTS
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1);
    const clipppingPlaneHelper = new THREE.PlaneHelper(clippingPlane, 2, 0xffffff);
    scene.add(clipppingPlaneHelper);
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);
    let planeObject: THREE.Mesh;

    const update = () => {
        clippingPlane.coplanarPoint(planeObject.position);
        planeObject.lookAt(
            planeObject.position.x - clippingPlane.normal.x,
            planeObject.position.y - clippingPlane.normal.y,
            planeObject.position.z - clippingPlane.normal.z,
        );
    };

    const myPlane = gui.addFolder('my_plane');
    myPlane.add(params.plane01, 'displayHelper').onChange(v => {
        clipppingPlaneHelper.visible = v;
        update();
    });
    myPlane.add(params.plane01, 'constant').min(- 1).max(1).onChange(d => { 
        clippingPlane.constant = d;
        update();
    });
    myPlane.add(params.plane01, 'negated').onChange(() => {
        clippingPlane.negate();
        params.plane01.constant = myPlane.constant;
        update();
    });
    myPlane.open();

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

    renderer.render(scene, camera);

}