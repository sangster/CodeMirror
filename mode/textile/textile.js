// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("textile", function(cmCfg, modeCfg) {

  var header     = 'header'
  ,   formatting = 'formatting'
  ,   em         = 'em'
  ,   strong     = 'strong';

  var headerRE = /^h([1-6])\./;

  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false;
  }

  function getType(state) {
    var styles = [];

    if (state.formatting) {
      styles.push(formatting);

      if (typeof state.formatting === "string") state.formatting = [state.formatting];

      for (var i = 0; i < state.formatting.length; i++) {
        styles.push(formatting + "-" + state.formatting[i]);

        if (state.formatting[i] === "header") {
          styles.push(formatting + "-" + state.formatting[i] + "-" + state.header);
        }
      }
    }

    if (state.header) { styles.push(header); }

    return styles.length ? styles.join(' ') : null;
  }

  function token(stream, state) {
    var ch
    ,   match;

    state.formatting = false;

    if(match = stream.match(headerRE)) {
      state.header = parseInt(match[1]);
      if (modeCfg.highlightFormatting) state.formatting = "header";
      return getType(state);
    }

    ch = stream.next();

    return getType(state);
  }

  return {
    startState: function() {
      return {
        em: false,
        strong: false,
        header: false,
        formatting: false
      };
    },

    token: token,

    blankLine: function(state) {
      state.em = false;
      state.strong = false;
      state.header = false;
    }
  };
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
