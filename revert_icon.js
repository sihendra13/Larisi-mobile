const fs = require('fs');
const path = './src/components/v2/KelolaScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Revert Detail view
content = content.replace(
  "{(c.format === 'reel' || c.format === 'video' || c.hasVideo)\n                  ? <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#fff\"><path d=\"M8 5v14l11-7z\"/></svg>\n                  : <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>\n                }",
  "{(c.hasVideo)\n                  ? <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#fff\"><path d=\"M8 5v14l11-7z\"/></svg>\n                  : <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>\n                }"
);

// Revert List view
content = content.replace(
  "{(camp.format === 'reel' || camp.format === 'video' || camp.hasVideo)\n                    ? <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#fff\"><path d=\"M8 5v14l11-7z\"/></svg>\n                    : <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>\n                  }",
  "{(camp.hasVideo)\n                    ? <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#fff\"><path d=\"M8 5v14l11-7z\"/></svg>\n                    : <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>\n                  }"
);

fs.writeFileSync(path, content, 'utf8');
