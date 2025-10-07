class Node {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.children = new Map();
    this.data = {};
    this.eventListeners = new Map();
  }

  // Add a child node
  addChild(childNode) {
    if (!(childNode instanceof Node)) {
      throw new Error("Only Node instances can be added as children.");
    }
    if (this.children.has(childNode.name)) {
      throw new Error(`Child with name '${childNode.name}' already exists.`);
    }
    this.children.set(childNode.name, childNode);
    childNode.parent = this; // Ensure child's parent is set correctly
    this.emit('childAdded', childNode);
  }

  // Remove a child node
  removeChild(childName) {
    if (!this.children.has(childName)) {
      throw new Error(`Child with name '${childName}' not found.`);
    }
    const removedChild = this.children.get(childName);
    this.children.delete(childName);
    removedChild.parent = null; // Detach from parent
    this.emit('childRemoved', removedChild);
    return removedChild;
  }

  // Get a child node by name
  getChild(childName) {
    return this.children.get(childName);
  }

  // Set data property
  setData(key, value) {
    const oldValue = this.data[key];
    this.data[key] = value;
    this.emit('dataChanged', { key, oldValue, newValue: value });
  }

  // Get data property
  getData(key) {
    return this.data[key];
  }

  // Traverse the tree and execute a callback for each node
  traverse(callback) {
    callback(this);
    for (const child of this.children.values()) {
      child.traverse(callback);
    }
  }

  // Event handling
  on(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  emit(eventName, ...args) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(listener => listener(...args));
    }
  }
}

// Example Usage:
const root = new Node("root");

const folder1 = new Node("folder1");
const fileA = new Node("fileA");
fileA.setData("content", "This is file A.");

const folder2 = new Node("folder2");
const fileB = new Node("fileB");
fileB.setData("size", 1024);

root.addChild(folder1);
folder1.addChild(fileA);
root.addChild(folder2);
folder2.addChild(fileB);

// Listen for events
root.on('childAdded', (child) => console.log(`Root: Child '${child.name}' added.`));
fileA.on('dataChanged', ({ key, oldValue, newValue }) => console.log(`FileA: Data '${key}' changed from '${oldValue}' to '${newValue}'.`));

// Perform operations
console.log("--- Traversing the structure ---");
root.traverse((node) => console.log(`Node: ${node.name}, Parent: ${node.parent ? node.parent.name : 'None'}`));

fileA.setData("content", "Updated content for file A.");

const removedFileB = folder2.removeChild("fileB");
console.log(`Removed node: ${removedFileB.name}`);

// Accessing data
console.log(`Content of fileA: ${root.getChild("folder1").getChild("fileA").getData("content")}`);

// API to get JSON representation
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/nodes', (req, res) => {
  const serializeNode = (node) => ({
    name: node.name,
    children: Array.from(node.children.values()).map(serializeNode),
    data: node.data
  });

  res.json(serializeNode(root));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});