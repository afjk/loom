// 3D Scene Preview: a small three.js viewport that represents each Scene Sync
// object as a cube on a grid floor, driven by the running graph's scene.*
// effects. The pure effect->state reduction lives in
// src/scenesync/preview-transform.js; this module only renders the resulting
// per-object state and owns the WebGL lifecycle.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CUBE_COLORS = [0x4a90e2, 0xff70a6, 0x80ed99, 0xffd166, 0xc792ea];

export class Scene3DPreview {
  constructor(host, options = {}) {
    this.host = host;
    this.onObjectPointerEvent = typeof options.onObjectPointerEvent === 'function'
      ? options.onObjectPointerEvent
      : null;
    this.initialized = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.objects = new Map(); // objectId -> THREE.Mesh
    this._colorCursor = 0;
    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();
    this._pointerDown = null;
    this._hoverObjectId = null;
    this._boundPointerDown = (event) => this._handlePointerDown(event);
    this._boundPointerMove = (event) => this._handlePointerMove(event);
    this._boundPointerUp = (event) => this._handlePointerUp(event);
    this._boundPointerCancel = () => {
      this._pointerDown = null;
    };
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
    this.renderer.domElement.addEventListener('pointerdown', this._boundPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this._boundPointerMove);
    this.renderer.domElement.addEventListener('pointerup', this._boundPointerUp);
    this.renderer.domElement.addEventListener('pointercancel', this._boundPointerCancel);

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

  _handlePointerDown(event) {
    const picked = this._pickObject(event);
    this._pointerDown = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      time: performance.now(),
      objectId: picked?.objectId || null
    };

    if (picked) {
      this._emitObjectPointerEvent('pointer.down', picked.objectId, event);
    }
  }

  _handlePointerMove(event) {
    const picked = this._pickObject(event);
    const nextObjectId = picked?.objectId || null;
    const previousObjectId = this._hoverObjectId;

    if (this.renderer?.domElement) {
      this.renderer.domElement.style.cursor = nextObjectId ? 'pointer' : '';
    }

    if (nextObjectId === previousObjectId) return;

    this._hoverObjectId = nextObjectId;

    if (previousObjectId) {
      this._emitObjectPointerEvent('pointer.leave', previousObjectId, event, {
        relatedTarget: nextObjectId
      });
    }
    if (nextObjectId) {
      this._emitObjectPointerEvent('pointer.enter', nextObjectId, event, {
        relatedTarget: previousObjectId
      });
    }
  }

  _handlePointerUp(event) {
    if (!this._pointerDown || event.button !== this._pointerDown.button) {
      this._pointerDown = null;
      return;
    }

    const dx = event.clientX - this._pointerDown.x;
    const dy = event.clientY - this._pointerDown.y;
    const elapsed = performance.now() - this._pointerDown.time;
    const moved = Math.hypot(dx, dy);
    const downObjectId = this._pointerDown.objectId;
    this._pointerDown = null;

    const picked = this._pickObject(event);
    if (picked) {
      this._emitObjectPointerEvent('pointer.up', picked.objectId, event);
    }

    if (moved > 5 || elapsed > 650 || !picked || picked.objectId !== downObjectId) return;

    this._emitObjectPointerEvent('pointer.click', picked.objectId, event);
  }

  _pickObject(event) {
    if (!this.initialized) return null;

    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    this._pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this._raycaster.setFromCamera(this._pointer, this.camera);

    const meshes = [...this.objects.values()].filter((mesh) => mesh.visible);
    const intersects = this._raycaster.intersectObjects(meshes, false);
    const mesh = intersects[0]?.object;
    const objectId = mesh?.userData?.objectId;
    return objectId ? { objectId, mesh } : null;
  }

  _emitObjectPointerEvent(channel, objectId, event, extraPayload = {}) {
    if (!this.onObjectPointerEvent) return;

    this.onObjectPointerEvent({
      channel,
      objectId,
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button ?? 0,
      payload: extraPayload
    });
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
    mesh.userData.objectId = objectId;
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
    this.renderer.domElement.removeEventListener('pointerdown', this._boundPointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this._boundPointerMove);
    this.renderer.domElement.removeEventListener('pointerup', this._boundPointerUp);
    this.renderer.domElement.removeEventListener('pointercancel', this._boundPointerCancel);
    this.renderer.domElement.style.cursor = '';
    this._hoverObjectId = null;
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
