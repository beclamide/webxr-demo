export default class Demo2 {
  constructor(engine) {
    this.engine = engine;

    this.touchStart;
    this.touchEnd;

    this.paper = [];
    
    this.loadAssets();

    this.addEvents();
  }

  loadAssets() {
    // Load the hole
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('/data/hole.glb', gltf => {
      const holeMesh = gltf.scene.children[2];
      holeMesh.scale.set(.4, .4, .4);
      this.engine.sceneRoot.add(holeMesh);
    });

    // Load the paper
    gltfLoader.load('/data/paper.glb', gltf => {
      this.paperMesh = gltf.scene.children[2];
      this.paperMesh.scale.set(.2, .2, .2);
    });
  }

  addEvents() {
    this.engine.renderer.domElement.addEventListener('touchstart', e => this.handleStart(e), false);
    this.engine.renderer.domElement.addEventListener('touchend', e => this.handleEnd(e), false);
    this.engine.renderer.domElement.addEventListener('touchmove', e => this.handleMove(e), false);
  }

  handleStart(e) {
    e.preventDefault();

    this.touchStart = {
      touch: e.changedTouches[0],
      time: this.engine.clock.getElapsedTime(),
    }

    console.log(this.touchStart);
  }

  handleEnd(e) {
    e.preventDefault();

    this.touchEnd = {
      touch: e.changedTouches[0],
      time: this.engine.clock.getElapsedTime(),
    }

    console.log(this.touchEnd);

    this.paper.push(new Paper(this));
  }

  handleMove(e) {
    e.preventDefault();
  }

  update() {
    // update the scene

    this.paper.forEach(paper => paper.update(this.engine));
  }
}



class Paper {
  constructor(parent) {
    this.mesh = parent.paperMesh.clone();
    this.mesh.position.set(parent.engine.camera.position.x, parent.engine.camera.position.y, parent.engine.camera.position.z);
    this.direction = parent.engine.camera.getWorldDirection();
    parent.engine.sceneRoot.add(this.mesh);
  }

  destroy(engine) {
    this.dead = true;
    engine.sceneRoot.remove(this.mesh);
  }

  update(engine) {
    if (this.dead) return;

    this.mesh.position.add(this.direction);

    if (this.mesh.position.distanceTo(engine.camera.position) > 30) {
      console.log('dying');
      this.destroy(engine);
    }
  }
}