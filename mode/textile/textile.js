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

  var headerRE = /^h([1-6])\./
  ,   textRE   = /^[^_]+/;

  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false;
  }

  function switchInline(stream, state, f) {
    state.f = state.inline = f;
    return f(stream, state);
  }

  function switchBlock(stream, state, f) {
    state.f = state.block = f;
    return f(stream, state);
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

    if (state.header) { styles.push(header); styles.push(header + "-" + state.header); }
    if (state.em) { styles.push(em); }

    return styles.length ? styles.join(' ') : null;
  }

  function blockNormal(stream, state) {
    var ch
    ,   match;

    if (stream.eatSpace()) {
      return getType(state);
    } else if(match = stream.match(headerRE)) {
      state.header = parseInt(match[1]);
      if (modeCfg.highlightFormatting) state.formatting = 'header';
      return getType(state);
    }

    return switchInline(stream, state, state.inline);
  }

  function inlineNormal(stream, state) {
    var style = state.text(stream, state)
    ,   ch;

    if (typeof style !== 'undefined') {
      return style;
    }

    ch = stream.next();

    if (ch === '_') {
      if(state.em) { // Remove EM
        if (modeCfg.highlightFormatting) state.formatting = "em";
        var t = getType(state);
        state.em = false;
        return t;
      } else { // Add EM
        state.em = ch;
        if (modeCfg.highlightFormatting) state.formatting = "em";
        return getType(state);
      }
    }

    return getType(state);
  }

  function handleText(stream, state) {
    if (stream.match(textRE, true)) {
      return getType(state);
    }
    return undefined;
  }

  function token(stream, state) {
    state.formatting = false;

    if (stream.sol()) {
      state.f = state.block;
    }

    var result = state.f(stream, state);
    if (stream.start == stream.pos) {
//      return this.token(stream, state);
    }
    return result;
  }

  return {
    startState: function() {
      return {
        f: blockNormal,
        inline: inlineNormal,
        block: blockNormal,
        text: handleText,

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
