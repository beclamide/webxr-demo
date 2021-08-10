// import Pedestrian from './pedestrian.js';
// import Car from './car';

import { mobileAndTabletCheck } from './utils';

class Engine {

  constructor() {
    this.trackingMethod = 'artoolkit';

    this.keysdown = [];
    this.touches = [];

    this.onRenderFunctions = [];

    this.times = [];
    this.fps;
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
    this.scene.add(this.camera);

    let ambientLight = new THREE.AmbientLight( 0x333333, 0.5 );
	  this.scene.add( ambientLight );

    this.sunlight = new THREE.PointLight(0xffffff, 1, 100);
    this.sunlight.position.set(5, 5, 5);
    this.scene.add(this.sunlight);

    this.renderer = new THREE.WebGLRenderer({
      antialias : true,
      alpha: true
    });
    this.renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    this.renderer.setSize( 640, 480 );
    document.getElementById('container').appendChild(this.renderer.domElement);

    this.addEvents();

    this.createARProfile();

    this.createARSource();

    this.createARContext();

    this.createARScene();

    this.render();
  }

  addEvents() {
    document.addEventListener('keydown', e => this.keysdown.push(e.code));

    document.addEventListener('keyup', e => {
      let index;
      do {
        index = this.keysdown.indexOf(e.code);
        if (index > -1) {
          this.keysdown.splice(index, 1);
        }
      } while (index > -1)
    });

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('orientationchange', () => this.onResize());
  }

  onResize() {
    this.arToolkitSource.onResizeElement()
		this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
		if ( this.arToolkitContext.arController !== null ){
			this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas)
		}
  }

  createARProfile() {
    this.arProfile = new THREEx.ArToolkitProfile();
    this.arProfile.sourceWebcam();
  }

  createARSource() {
    this.arToolkitSource = new THREEx.ArToolkitSource(this.arProfile.sourceParameters);
    this.arToolkitSource.init(() => this.onResize());
  }

  createARContext() {
    this.arToolkitContext = new THREEx.ArToolkitContext({
      ...this.arProfile.contextParameters,
      cameraParametersUrl: '/data/camera_para.dat',
      detectionMode: 'mono',
      patternRatio: .75
    });

    this.arToolkitContext.init(() => this.camera.projectionMatrix.copy( this.arToolkitContext.getProjectionMatrix() ));
  }

  createARScene() {
    const sceneRoot = new THREE.Group();
    this.scene.add(sceneRoot);

    new THREEx.ArMarkerControls(this.arToolkitContext, this.camera, {
      ...this.arProfile.defaultMarkerParameters,
      patternUrl: '/data/pattern-ar-marker.patt',
      changeMatrixMode: 'cameraTransformMatrix',
    });

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('/data/head.glb', gltf => {
        gltf.scene.scale.set(.4, .4, .4);
        sceneRoot.add(gltf.scene);
    });
  }

  copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
  }

  ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < this.touches.length; i++) {
      var id = this.touches[i].identifier;
  
      if (id == idToFind) {
        return i;
      }
    }
    return -1;
  }

  update() {
    // update artoolkit on every frame
	  if (this.arToolkitSource.ready !== false ) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
      this.onResize();

      this.sunlight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    }
  }

  render() {
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;
    if (document.getElementById('frameRate')) document.getElementById('frameRate').innerText = `${this.fps} FPS`;

    this.update();

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(() => this.render());
  }
}

export default Engine;