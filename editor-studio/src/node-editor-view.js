import { NODE_TYPES } from '../../src/loom.js';
import { applyEditorOperation } from '../../src/loom-editor-model.js';

export class NodeEditorView {
  constructor(container, onOperation) {
    this.container = container;
    this.onOperation = onOperation;
    this.selectedNodeId = null;
    this.draggedNode = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.isConnecting = false;
    this.connectFromNodeId = null;
    this.connectFromPort = null;
    this.editorModel = null;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.cursor = 'grab';
    this.container.innerHTML = '';
    this.container.appendChild(this.svg);

    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.tempLineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    this.svg.appendChild(this.tempLineGroup);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.svg.addEventListener('mousedown', (e) => {
      if (e.target === this.svg) {
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.svg.style.cursor = 'grabbing';
      }
    });

    this.svg.addEventListener('mousemove', (e) => {
      if (e.buttons === 1 && this.dragStartX !== 0) {
        this.offsetX += e.clientX - this.dragStartX;
        this.offsetY += e.clientY - this.dragStartY;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.render();
      }

      if (this.isConnecting) {
        const tempLine = this.tempLineGroup.querySelector('line');
        if (tempLine) {
          tempLine.setAttribute('x2', e.clientX - this.offsetX);
          tempLine.setAttribute('y2', e.clientY - this.offsetY);
        }
      }
    });

    this.svg.addEventListener('mouseup', () => {
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.svg.style.cursor = 'grab';
      this.isConnecting = false;
    });
  }

  render(editorModel) {
    if (editorModel) {
      this.editorModel = editorModel;
    }
    if (!this.editorModel) return;

    this.edgesGroup.innerHTML = '';
    this.nodesGroup.innerHTML = '';

    const nodeWidth = 200;
    const nodeHeight = 100;
    const portRadius = 6;
    const portSpacing = 25;

    for (const edge of Object.values(this.editorModel.edgesById)) {
      const fromNode = this.editorModel.nodesById[edge.fromNodeId];
      const toNode = this.editorModel.nodesById[edge.toNodeId];
      if (!fromNode || !toNode) continue;

      const x1 = fromNode.position.x + nodeWidth;
      const y1 = fromNode.position.y + 50;
      const x2 = toNode.position.x;
      const y2 = toNode.position.y + 50;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#999');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('data-edge-id', edge.id);
      line.style.cursor = 'pointer';

      line.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onOperation({ type: 'removeEdge', edgeId: edge.id });
      });

      this.edgesGroup.appendChild(line);
    }

    for (const nodeId of this.editorModel.order) {
      const node = this.editorModel.nodesById[nodeId];
      if (!node) continue;

      const isSelected = nodeId === this.selectedNodeId;
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.position.x);
      rect.setAttribute('y', node.position.y);
      rect.setAttribute('width', nodeWidth);
      rect.setAttribute('height', nodeHeight);
      rect.setAttribute('fill', isSelected ? '#4a90e2' : '#333');
      rect.setAttribute('stroke', isSelected ? '#fff' : '#999');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '4');
      rect.style.cursor = 'move';

      rect.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.selectedNodeId = nodeId;
        this.draggedNode = node;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.render();
      });

      rect.addEventListener('mousemove', (e) => {
        if (this.draggedNode === node && e.buttons === 1) {
          const dx = e.clientX - this.dragStartX;
          const dy = e.clientY - this.dragStartY;
          this.onOperation({
            type: 'moveNode',
            id: nodeId,
            position: { x: node.position.x + dx, y: node.position.y + dy }
          });
          this.dragStartX = e.clientX;
          this.dragStartY = e.clientY;
        }
      });

      nodeGroup.appendChild(rect);

      const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleText.setAttribute('x', node.position.x + 10);
      titleText.setAttribute('y', node.position.y + 25);
      titleText.setAttribute('fill', '#fff');
      titleText.setAttribute('font-size', '14');
      titleText.setAttribute('font-weight', 'bold');
      titleText.textContent = node.type;
      nodeGroup.appendChild(titleText);

      const nodeType = NODE_TYPES[node.type];
      if (nodeType) {
        let portY = 45;

        for (const inputName of nodeType.inputs || []) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', node.position.x);
          circle.setAttribute('cy', node.position.y + portY);
          circle.setAttribute('r', portRadius);
          circle.setAttribute('fill', '#666');
          circle.style.cursor = 'pointer';

          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', node.position.x + 15);
          label.setAttribute('y', node.position.y + portY + 4);
          label.setAttribute('fill', '#aaa');
          label.setAttribute('font-size', '12');
          label.textContent = inputName;

          circle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isConnecting) {
              if (this.connectFromNodeId !== nodeId) {
                this.onOperation({
                  type: 'addEdge',
                  edge: {
                    id: '',
                    fromNodeId: this.connectFromNodeId,
                    fromPort: this.connectFromPort,
                    toNodeId: nodeId,
                    toPort: inputName
                  }
                });
              }
              this.isConnecting = false;
              this.tempLineGroup.innerHTML = '';
            } else {
              this.isConnecting = true;
              this.connectFromNodeId = nodeId;
              this.connectFromPort = inputName;
              const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              tempLine.setAttribute('x1', node.position.x);
              tempLine.setAttribute('y1', node.position.y + portY);
              tempLine.setAttribute('x2', node.position.x);
              tempLine.setAttribute('y2', node.position.y + portY);
              tempLine.setAttribute('stroke', '#4a90e2');
              tempLine.setAttribute('stroke-width', '2');
              this.tempLineGroup.appendChild(tempLine);
            }
          });

          nodeGroup.appendChild(circle);
          nodeGroup.appendChild(label);
          portY += portSpacing;
        }

        portY = 45;
        for (const outputName of (nodeType.outputs || []).map(o => o.name || o)) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', node.position.x + nodeWidth);
          circle.setAttribute('cy', node.position.y + portY);
          circle.setAttribute('r', portRadius);
          circle.setAttribute('fill', '#4a90e2');
          circle.style.cursor = 'pointer';

          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', node.position.x + nodeWidth - 50);
          label.setAttribute('y', node.position.y + portY + 4);
          label.setAttribute('fill', '#aaa');
          label.setAttribute('font-size', '12');
          label.setAttribute('text-anchor', 'end');
          label.textContent = outputName;

          circle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isConnecting) {
              if (this.connectFromNodeId !== nodeId) {
                this.onOperation({
                  type: 'addEdge',
                  edge: {
                    id: '',
                    fromNodeId: nodeId,
                    fromPort: outputName,
                    toNodeId: this.connectFromNodeId,
                    toPort: this.connectFromPort
                  }
                });
              }
              this.isConnecting = false;
              this.tempLineGroup.innerHTML = '';
            } else {
              this.isConnecting = true;
              this.connectFromNodeId = nodeId;
              this.connectFromPort = outputName;
              const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              tempLine.setAttribute('x1', node.position.x + nodeWidth);
              tempLine.setAttribute('y1', node.position.y + portY);
              tempLine.setAttribute('x2', node.position.x + nodeWidth);
              tempLine.setAttribute('y2', node.position.y + portY);
              tempLine.setAttribute('stroke', '#4a90e2');
              tempLine.setAttribute('stroke-width', '2');
              this.tempLineGroup.appendChild(tempLine);
            }
          });

          nodeGroup.appendChild(circle);
          nodeGroup.appendChild(label);
        }

        let paramY = 45;
        for (const [paramName, paramValue] of Object.entries(node.params || {})) {
          const paramLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          paramLabel.setAttribute('x', node.position.x + 10);
          paramLabel.setAttribute('y', node.position.y + paramY);
          paramLabel.setAttribute('fill', '#aaa');
          paramLabel.setAttribute('font-size', '11');
          paramLabel.textContent = `${paramName}: ${JSON.stringify(paramValue).substring(0, 15)}`;
          nodeGroup.appendChild(paramLabel);
          paramY += 15;
        }
      }

      this.nodesGroup.appendChild(nodeGroup);
    }
  }
}
