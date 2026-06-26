// 3D Scene Preview: a small three.js viewport that represents each Scene Sync
// object as a cube on a grid floor, driven by the running graph's scene.*
// effects. The pure effect->state reduction lives in
// src/scenesync/preview-transform.js; this module only renders the resulting
// per-object state and owns the WebGL lifecycle.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CUBE_COLORS = [0x4a90e2, 0xff70a6, 0x80ed99, 0xffd166, 0xc792ea];

export class Scene3DPreview {
  constructor(host) {
    this.host = host;
    this.initialized = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.objects = new Map(); // objectId -> THREE.Mesh
    this._colorCursor = 0;
  }

  _ensureInit() {
    if (this.initialized) return;

    const width = this.host.clientWidth || 640;
    const height = this.host.clientHeight || 360;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    this.camera.position.set(4.5, 4, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.host.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 0.5, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(5, 8, 6);
    this.scene.add(dir);

    const grid = new THREE.GridHelper(20, 20, 0x39507a, 0x1b2336);
    this.scene.add(grid);
    const axes = new THREE.AxesHelper(1.5);
    this.scene.add(axes);

    this.initialized = true;
  }

  _getOrCreateObject(objectId) {
    let mesh = this.objects.get(objectId);
    if (mesh) return mesh;

    const color = CUBE_COLORS[this._colorCursor % CUBE_COLORS.length];
    this._colorCursor += 1;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5; // sit on the floor by default
    this.scene.add(mesh);
    this.objects.set(objectId, mesh);
    return mesh;
  }

  // objectsState: { [objectId]: { position, rotation, scale, color, visible } }
  applyObjects(objectsState) {
    this._ensureInit();

    for (const [objectId, state] of Object.entries(objectsState || {})) {
      const mesh = this._getOrCreateObject(objectId);
      const [px, py, pz] = state.position;
      // Lift by half the (scaled) height so the cube rests on the floor at y=0.
      const sy = state.scale[1];
      mesh.position.set(px, py + 0.5 * sy, pz);
      mesh.quaternion.set(
        state.rotation[0],
        state.rotation[1],
        state.rotation[2],
        state.rotation[3]
      );
      mesh.scale.set(state.scale[0], state.scale[1], state.scale[2]);
      if (Array.isArray(state.color) && mesh.material?.color) {
        mesh.material.color.setRGB(state.color[0], state.color[1], state.color[2]);
      }
      mesh.visible = state.visible !== false;
    }
  }

  render() {
    if (!this.initialized) return;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.initialized) return;
    const width = this.host.clientWidth || 640;
    const height = this.host.clientHeight || 360;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  // Drop cubes that are no longer driven by the current graph.
  retainObjects(activeIds) {
    const keep = new Set(activeIds);
    for (const [objectId, mesh] of [...this.objects]) {
      if (keep.has(objectId)) continue;
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.objects.delete(objectId);
    }
  }

  dispose() {
    if (!this.initialized) return;
    this.controls.dispose();
    for (const mesh of this.objects.values()) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.objects.clear();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
    this.initialized = false;
  }
}
