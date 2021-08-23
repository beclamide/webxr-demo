export default class Demo1 {
  constructor(engine) {
    // load the assets
    
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('/data/head.glb', gltf => {
      gltf.scene.scale.set(.4, .4, .4);
      engine.sceneRoot.add(gltf.scene);
    });
  }

  update() {
    // update the scene
  }
}