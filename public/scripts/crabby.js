exports.id = function(id) {
  return document.getElementById(id);
}
exports.classes = function(className) {
  return document.getElementsByClassName(className);
}
exports.class = function(className, n) {
  return document.getElementsByClassName(className)[n];
}
exports.tags = function(tagname) {
  return document.getElementsByTagName(tagname);
}
exports.tag = function(tagName, n) {
  return document.getElementsByTagName(tagName)[n];
}
exports.selector = function(selector, n) {
  return document.querySelectorAll(selector)[n];
}
exports.selectors = function(selector) {
  return document.querySelectorAll(selector);
}
exports.doc = function() {
  return document.documentElement;
}
exports.version = function() {
  console.log("🦀 1.0.5")
  return "1.0.5";
}