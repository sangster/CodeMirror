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
  ,   italics    = 'em'
  ,   strong     = 'strong'
  ,   bold       = 'strong'
  ,   list1      = 'variable-2'
  ,   list2      = 'variable-3'
  ,   list3      = 'keyword'
  ;
  var headerRE    = /^h([1-6])\.\s+/
  ,   paragraphRE = /^p\.\s+/
  ,   textRE      = /^[^_*]+/
  ,   ulRE        = /^(\*+)\s+/
  ,   olRE        = /^(#+)\s+/
  ;

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
    var styles = []
    ,   listMod
    ;

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
    if (state.italics) { styles.push(italics); }
    if (state.strong) { styles.push(strong); }
    if (state.bold) { styles.push(bold); }

    if (state.list !== false) {
      var listMod = (state.listDepth - 1) % 3;
      if (!listMod) {
        styles.push(list1);
      } else if (listMod === 1) {
        styles.push(list2);
      } else {
        styles.push(list3);
      }
    }

    return styles.length ? styles.join(' ') : null;
  }

  function blockNormal(stream, state) {
    var ch
    ,   match
    ,   listType
    ;
    if (stream.eatSpace()) {
      return getType(state);
    } else if (match = stream.match(headerRE)) {
      state.header = parseInt(match[1]);
      if (modeCfg.highlightFormatting) state.formatting = 'header';
      return getType(state);
    } else if (stream.match(ulRE, false) || stream.match(olRE, false)) {
      if (match = stream.match(ulRE, true)) {
        listType = 'ul';
      } else {
        match = stream.match(olRE, true);
        listType = 'ol';
      }

      state.list = true;
      state.listDepth = match[1].length;
      state.f = state.inline;
      if (modeCfg.highlightFormatting) state.formatting = ["list", "list-" + listType];
      return getType(state);
    } else if (stream.match(paragraphRE)) {
      return getType(state);
    }

    return switchInline(stream, state, state.inline);
  }

  function inlineNormal(stream, state) {
    var style = state.text(stream, state)
    ,   ch
    ,   t;

    if (typeof style !== 'undefined') {
      return style;
    }

    ch = stream.next();

    if (ch === '_') {
      if (stream.eat('_')) {
        if(state.italics) { // Remove ITALICS
          if (modeCfg.highlightFormatting) state.formatting = 'italics';
          t = getType(state);
          state.italics = false;
          return t;
        } else { // Add ITALICS
          state.italics = true;
          if (modeCfg.highlightFormatting) state.formatting = 'italics';
          return getType(state);
        }
      } else {
        if(state.em) { // Remove EM
          if (modeCfg.highlightFormatting) state.formatting = 'em';
          t = getType(state);
          state.em = false;
          return t;
        } else { // Add EM
          state.em = true;
          if (modeCfg.highlightFormatting) state.formatting = 'em';
          return getType(state);
        }
      }
    } else if (ch === '*') {
      if (stream.eat('*')) {
        if(state.bold) { // Remove STRONG
          if (modeCfg.highlightFormatting) state.formatting = 'bold';
          t = getType(state);
          state.bold = false;
          return t;
        } else { // Add STRONG
          state.bold = true;
          if (modeCfg.highlightFormatting) state.formatting = 'bold';
          return getType(state);
        }
      } else {
        if(state.strong) { // Remove STRONG
          if (modeCfg.highlightFormatting) state.formatting = 'strong';
          t = getType(state);
          state.strong = false;
          return t;
        } else { // Add STRONG
          state.strong = true;
          if (modeCfg.highlightFormatting) state.formatting = 'strong';
          return getType(state);
        }
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
        italics: false,
        strong: false,
        bold: false,
        header: false,
        list: false,

        formatting: false
      };
    },

    token: token,

    blankLine: function(state) {
      state.em = false;
      state.italics = false;
      state.strong = false;
      state.bold = false;
      state.header = false;
      state.list = false;
    }
  };
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
