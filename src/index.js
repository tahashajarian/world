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
      jump: false
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
    this._camera.position.set(0, 60, -130);
    this._scene = new THREE.Scene();
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    this._scene.add(light);
    light = new THREE.AmbientLight(0xffffff, 0.25);
    this._scene.add(light);
    this.OrbitControls = new OrbitControls(this._camera, this._threejs.domElement);
    this.OrbitControls.maxPolarAngle = Math.PI * 0.5 - 0.1;
    this.OrbitControls.minDistance = 20;
    this.OrbitControls.maxDistance = 5000;
    this.OrbitControls.update();
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
    // const near = 1;
    // const far = 2;
    const color = 'lightblue';
    this._scene.fog = new THREE.Fog(0xcce0ff, 100, 3000);
    this._scene.add(ground);
    this._animations = {};
    this.mixers = [];
    this.loadPlayer()
    this.loadTrees();
    this.loadTrees2();
    this.loadTrees3();
    this.loadTrees4();
    this.loadClouds()
    this._RAF();
  }

  loadPlayer() {
    const loader = new FBXLoader();
    loader.load(require('./resources/zombie/mremireh_o_desbiens.fbx').default, (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this.player = this._target
      this.player.position.set(0, 0.4, 0)
      this._scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this.player);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        // this._stateMachine.SetState('idle');
        // console.log(
        //   this._animations.idle
        // )
        const idleAction = this._animations.idle.action
        idleAction.play()
        this._mixer.update()
        // console.log(idleAction)
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);

        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.load(require('./resources/zombie/walk.fbx').default, (a) => { _OnLoad('walk', a); });
      loader.load(require('./resources/zombie/run.fbx').default, (a) => { _OnLoad('run', a); });
      loader.load(require('./resources/zombie/idle.fbx').default, (a) => { _OnLoad('idle', a); });
      loader.load(require('./resources/zombie/dance.fbx').default, (a) => { _OnLoad('dance', a); });
      loader.load(require('./resources/zombie/backWalk.fbx').default, (a) => { _OnLoad('backWalk', a); });
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
        for (let i = 0; i < 250; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() * 0.1 + 0.05);
          cloneTree.position.set(
            Math.random() * -5000,
            0,
            Math.random() * -5000
          );
          this._scene.add(cloneTree);
        }
      },

    );
  }

  loadClouds() {
    const FBXLoaderInstance = new FBXLoader();
    FBXLoaderInstance.load(
      require(`./resources/Cloud_${parseInt(Math.random() * 4 + 1)}.fbx`).default,
      (object) => {
        object.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });
        for (let i = 0; i < 100; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() + 0.7);
          cloneTree.position.set(
            Math.random() * 10000 - 5000,
            600,
            Math.random() * 10000 - 5000
          );
          this._scene.add(cloneTree);
        }
      },

    );
  }

  loadTrees2() {
    const FBXLoaderInstance = new FBXLoader();
    FBXLoaderInstance.load(
      require("./resources/tree2.fbx").default,
      (object) => {
        object.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });
        for (let i = 0; i < 250; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() * 0.08 + 0.04);
          cloneTree.position.set(
            Math.random() * 5000,
            0,
            Math.random() * -5000
          );
          this._scene.add(cloneTree);
        }
      },

    );
  }


  loadTrees3() {
    const FBXLoaderInstance = new FBXLoader();
    FBXLoaderInstance.load(
      require("./resources/tree3.fbx").default,
      (object) => {
        object.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });
        for (let i = 0; i < 250; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() * 0.08 + 0.04);
          cloneTree.position.set(
            Math.random() * -5000,
            0,
            Math.random() * 5000
          );
          this._scene.add(cloneTree);
        }
      },

    );
  }

  loadTrees4() {
    const FBXLoaderInstance = new FBXLoader();
    FBXLoaderInstance.load(
      require("./resources/tree4.fbx").default,
      (object) => {
        object.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
        });
        for (let i = 0; i < 250; i++) {
          const cloneTree = object.clone();
          cloneTree.rotation.y = Math.PI / (Math.random() * 2);
          cloneTree.scale.setScalar(Math.random() * 0.08 + 0.04);
          cloneTree.position.set(
            Math.random() * 5000,
            0,
            Math.random() * 5000
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
      case "Space":
        if (!this.movement.jumping)
          this.movement.jump = true;
        break;
      case "KeyX":
        if (!this.movement.dancing)
          this.movement.dance = true;
    }
  };


  updatePlayer(delta) {
    this.playerSpeed = 10;
    this.playerJumpHeight = 100
    const cameraPosition = this._camera.position
    const playerPosition = this.player ? this.player.position : { x: 0, y: 0, z: 0 }

    if (this.movement.moveForward) {
      if (this._animations && this._animations.walk) {
        const clipAction = this._animations.walk.action
        clipAction.play()
        this._mixer.update(0.02)
      }
      this.player.position.set(playerPosition.x, playerPosition.y, playerPosition.z + this.playerSpeed * delta)
      this._camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z + this.playerSpeed * delta)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    } else {
      // if (this._animations && this._animations.idle) {
      //   const clipAction = this._animations.idle.action
      //   clipAction.play()
      //   this._mixer.update()
      // }
    }

    if (this.movement.moveBackward) {
      this.player.position.set(playerPosition.x, playerPosition.y, playerPosition.z - this.playerSpeed * delta)
      this._camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z - this.playerSpeed * delta)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
      if (this._animations && this._animations.backWalk) {
        const clipAction = this._animations.backWalk.action
        clipAction.play()
        this._mixer.update(0.02)
      }
    }

    if (this.movement.moveLeft) {
      this.player.position.set(playerPosition.x + this.playerSpeed * delta, playerPosition.y, playerPosition.z)
      this._camera.position.set(cameraPosition.x + this.playerSpeed * delta, cameraPosition.y, cameraPosition.z)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    }

    if (this.movement.moveRight) {
      this.player.position.set(playerPosition.x - this.playerSpeed * delta, playerPosition.y, playerPosition.z)
      this._camera.position.set(cameraPosition.x - this.playerSpeed * delta, cameraPosition.y, cameraPosition.z)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    }

    if (this.movement.jump) {
      this.movement.jumping = true
      this.player.position.set(playerPosition.x, playerPosition.y + this.playerJumpHeight * delta, playerPosition.z)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
      if (!this.playerJumpTimeOut)
        this.playerJumpTimeOut = setTimeout(() => {
          this.movement.jump = false
          this.playerJumpTimeOut = null
          setTimeout(() => {
            this.movement.jumpDown = true
          }, 150);
        }, 300);
    }

    if (this.movement.jumpDown) {
      let yPosition = playerPosition.y - this.playerJumpHeight * delta;
      if (yPosition <= 0) {
        yPosition = 0;
        this.movement.jumpDown = false
        this.movement.jumping = false
      }
      this.player.position.set(playerPosition.x, yPosition, playerPosition.z)
      this.OrbitControls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
      this._camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    }

    if (this.movement.dance) {
      this.movement.dancing = true
      this.movement.dance = false
      if (this._animations && this._animations.dance) {
        const clipAction = this._animations.dance.action
        clipAction.play()
        this._mixer.update(0.1)
      }
      this.movement.dancing = false
    }
    // if (this.mov)
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
