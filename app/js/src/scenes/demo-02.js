export default class Demo2 {
  constructor(engine) {
    this.engine = engine;

    this.touchStart;
    this.touchEnd;

    this.paper = [];

    this.points = 0;
    
    this.loadAssets();

    this.addEvents();
  }

  loadAssets() {
    const cylinderGeometry = new THREE.CylinderGeometry( .2, .2, .1, 16 );
    const cylinderMaterial = new THREE.MeshPhongMaterial( {color: 0x00000, side: THREE.BackSide} );
    this.cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
    this.engine.sceneRoot.add(this.cylinder);

    const paperGeometry = new THREE.SphereGeometry( .1, 6, 6 );
    const paperMaterial = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
    this.paperMesh = new THREE.Mesh( paperGeometry, paperMaterial );
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
  }

  handleEnd(e) {
    e.preventDefault();

    if (!this.engine.markerFound) return;

    this.touchEnd = {
      touch: e.changedTouches[0],
      time: this.engine.clock.getElapsedTime(),
    }

    this.paper.push(new Paper(this));
  }

  handleMove(e) {
    e.preventDefault();
  }

  score() {
    this.points += 1;
    document.getElementById('score').innerHTML =`<h1>${this.points} points</h1>`;
  }

  update() {
    // update the scene
    this.paper.forEach(paper => paper.update(this.engine));
  }
}



class Paper {
  constructor(parent) {
    this.parent = parent;
    this.mesh = this.parent.paperMesh.clone();
    this.mesh.position.set(this.parent.engine.camera.position.x, this.parent.engine.camera.position.y, this.parent.engine.camera.position.z);
    this.direction = this.parent.engine.camera.getWorldDirection().divide(new THREE.Vector3(4, 4, 4));
    this.gravity = 0;
    this.parent.engine.sceneRoot.add(this.mesh);
  }

  destroy(engine) {
    this.dead = true;
    engine.sceneRoot.remove(this.mesh);
  }

  collision(object1, object2) {
    object1.geometry.computeBoundingBox(); //not needed if its already calculated
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    
    var box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);
  
    var box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);
  
    return box1.intersectsBox(box2);
  }

  kill(engine) {
    this.destroy(engine);
  }

  update(engine) {
    if (this.dead) return;

    this.mesh.position.add(this.direction);
    this.mesh.position.z += this.gravity / 50;

    this.gravity = Math.min(this.gravity + .1, 3.2);

    if (this.collision(this.mesh, this.parent.cylinder)) {
      this.parent.score();
      this.kill(engine);
    } else if (this.mesh.position.distanceTo(engine.camera.position) > 30) {
      this.kill(engine);
    }
  }
}