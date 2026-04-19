// Web Worker for Stockfish
// This script runs in the background to avoid blocking the UI thread.

self.onmessage = function(e) {
  if (e.data === 'start') {
    // We'll use a specific version of stockfish.js from a CDN
    importScripts('https://unpkg.com/stockfish.js@10.0.2/stockfish.js');
    
    // The library provides a Stockfish() function that returns an engine instance
    // Note: This requires the CDN version to support being loaded via importScripts
  }
};

// Alternative approach: Load the engine directly
importScripts('https://unpkg.com/stockfish.js@10.0.2/stockfish.js');

const engine = typeof Stockfish === 'function' ? Stockfish() : null;

if (engine) {
  engine.onmessage = function(msg) {
    self.postMessage(msg);
  };

  self.onmessage = function(e) {
    engine.postMessage(e.data);
  };
} else {
  self.postMessage('Error: Stockfish engine could not be initialized.');
}
