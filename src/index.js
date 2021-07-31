import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./base.css";

const basicPath = "./resources/zombie/";



class GameManager {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._threejs.domElement);
    this._stats = Stats();
    document.body.appendChild(this._stats.dom);
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
    this.movement = {
      moveForward: false,
      moveBackward: false,
      moveRight: false,
      moveLeft: false,
      canJump: false
    }

    this.clock = new THREE.Clock();

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(0, 40, -80);
    this._scene = new THREE.Scene();
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    this._scene.add(light);
    light = new THREE.AmbientLight(0xffffff, 0.25);
    this._scene.add(light);
    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5 - 0.1;
    controls.minDistance = 20;
    controls.maxDistance = 5000;
    controls.update();
    this._scene.background = new THREE.Color(0xcce0ff);
    const gt = new THREE.TextureLoader().load(
      require("./resources/g.jpg").default
    );
    const gg = new THREE.PlaneGeometry(10000, 10000);
    const gm = new THREE.MeshPhongMaterial({ color: 0xffffff, map: gt });
    const ground = new THREE.Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(512, 512);
    ground.material.map.wrapS = THREE.RepeatWrapping;
    ground.material.map.wrapT = THREE.RepeatWrapping;
    ground.material.map.encoding = THREE.sRGBEncoding;
    ground.receiveShadow = true;
    this._scene.add(ground);
    this.loadPlayer()
    this.loadTrees();
    this._RAF();
  }

  loadPlayer() {
    const FBXLoaderInstance = new FBXLoader();
    FBXLoaderInstance.load(require('./resources/player.fbx').default, (object) => {
      object.position.set(0, 0, 0)
      object.scale.multiplyScalar(0.25);
      this._scene.add(object);
      this.player = object
    });
  }

  loadTrees() {
    const FBXLoaderInstance = new FBXLoader();

    FBXLoaderInstance.load(
      require("./resources/tree.fbx").default,
      (object) => {
        object.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });
        for (let i = 0; i < 1000; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() * 0.1 + 0.05);
          cloneTree.position.set(
            Math.random() * 10000 - 5000,
            0,
            Math.random() * 10000 - 5000
          );
          this._scene.add(cloneTree);
        }
      },

    );
  }

  onKeyDown(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.movement.moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.movement.moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        this.movement.moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        this.movement.moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        this.movement.canJump = false;
        break;
    }
  };

  onKeyUp(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.movement.moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.movement.moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        this.movement.moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        this.movement.moveRight = false;
        break;
    }
  };

  updatePlayer(delta) {
    this.playerSpeed = 20;
    const playerPosition = this.player ? this.player.position : { x: 0, y: 0, z: 0 }
    if (this.movement.moveForward) {
      this.player.position.set(playerPosition.x, playerPosition.y, playerPosition.z + this.playerSpeed * delta)
    }
    if (this.movement.moveBackward) {
      this.player.position.set(playerPosition.x, playerPosition.y, playerPosition.z - this.playerSpeed * delta)
    }
    if (this.movement.moveLeft) {
      this.player.position.set(playerPosition.x + this.playerSpeed * delta, playerPosition.y, playerPosition.z)
    }
    if (this.movement.moveRight) {
      this.player.position.set(playerPosition.x - this.playerSpeed * delta, playerPosition.y, playerPosition.z)
    }
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      this._RAF();
      this._stats.update();
      this._threejs.render(this._scene, this._camera);
      const delta = this.clock.getDelta()
      this.updatePlayer(delta)
    });
  }
}

let _APP = new GameManager();
