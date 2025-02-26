import * as THREE from 'three';

export class GameWorld {
  constructor(container, worldData) {
    this.container = container;
    this.worldData = worldData;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.animate = this.animate.bind(this);
  }

  setupRenderer() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // Handle resize
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  setupControls() {
    // Add your existing control setup here
    // This could integrate with your existing player controls
  }

  loadWorld() {
    // Load world data from this.worldData
    // This would integrate with your existing world loading system
  }

  animate() {
    requestAnimationFrame(this.animate);
    
    // Update your game logic here
    
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.loadWorld();
    this.animate();
  }

  cleanup() {
    // Clean up Three.js resources
    this.renderer.dispose();
    // Add any additional cleanup needed
  }
}

// Create a web component for the game world
class GameWorldElement extends HTMLElement {
  constructor() {
    super();
    this.gameWorld = null;
  }

  connectedCallback() {
    const worldData = JSON.parse(this.getAttribute('world-data') || '{}');
    this.gameWorld = new GameWorld(this, worldData);
    this.gameWorld.start();
  }

  disconnectedCallback() {
    if (this.gameWorld) {
      this.gameWorld.cleanup();
    }
  }
}

// Register the web component
customElements.define('game-world', GameWorldElement);
