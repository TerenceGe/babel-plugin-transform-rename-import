"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = visitor;
/* eslint-disable no-param-reassign */
function isModule(value, original) {
  var pattern = new RegExp("^(" + original + "|" + original + "/.*)$");
  return pattern.test(value);
}

function replace(value, original, replacement) {
  var pattern = new RegExp("^" + original);
  return value.replace(pattern, replacement);
}

function getReplacements(state) {
  if (state.opts instanceof Array) {
    return state.opts;
  }
  return [state.opts];
}

function visitor(_ref) {
  var t = _ref.types;

  var source = function source(value, original, replacement) {
    return t.stringLiteral(replace(value, original, replacement));
  };
  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var replacements = getReplacements(state);
        replacements.forEach(function(_ref2) {
          var original = _ref2.original,
            replacement = _ref2.replacement,
            env = _ref2.env;
          var value = path.node.source.value;

          if (isModule(value, original)) {
            var newModule =
              env && process.env[env] ? process.env[env] : replacement;
            path.node.source = source(value, original, newModule);
          }
        });
      },
      CallExpression: function CallExpression(path, state) {
        var replacements = getReplacements(state);
        replacements.forEach(function(_ref3) {
          var original = _ref3.original,
            replacement = _ref3.replacement;
          var node = path.node;

          if (
            node.callee.name === "require" &&
            node.arguments &&
            node.arguments.length === 1 &&
            t.isStringLiteral(node.arguments[0]) &&
            isModule(node.arguments[0].value, original)
          ) {
            path.node.arguments = [
              source(node.arguments[0].value, original, replacement)
            ];
          }
        });
      }
    }
  };
}
