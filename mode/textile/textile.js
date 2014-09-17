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
  var formatting  = 'formatting'
  ,   header      = 'header'
  ,   em          = 'em'
  ,   italic      = 'italic'
  ,   strong      = 'strong'
  ,   bold        = 'bold'
  ,   list1       = 'variable-2'
  ,   list2       = 'variable-3'
  ,   list3       = 'keyword'
  ,   quote       = 'quote'
  ,   footnote    = 'footnote'
  ,   footCite    = 'footnote-citation'
  ,   table       = 'table'
  ,   specialChar = 'special-char'
  ,   cite        = 'cite'
  ,   addition    = 'addition'
  ,   deletion    = 'deletion'
  ,   sub         = 'sub'
  ,   sup         = 'sup'
  ;
  var headerRE    = /^h([1-6])\.\s+/
  ,   paragraphRE = /^(?:p|div)\.\s+/
  ,   textRE      = /^[^_*\[\(\?\+-~^]+/
  ,   ulRE        = /^(\*+)\s+/
  ,   olRE        = /^(#+)\s+/
  ,   quoteRE     = /^bq(\.\.?)\s+/
  ,   footnoteRE  = /^fn\d+\.\s+/
  ,   tableRE     = /^\|.*\|$/
  ,   blockRE     = /^(?:h[1-6]|p|div|bq\.?|fn\d+)\.\s+/
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
    if (state.italic) { styles.push(italic); }
    if (state.strong) { styles.push(strong); }
    if (state.bold) { styles.push(bold); }
    if (state.quote) { styles.push(quote); }
    if (state.footnote) { styles.push(footnote); }
    if (state.footCite) { styles.push(footCite); }
    if (state.table) { styles.push(table); }
    if (state.specialChar) { styles.push(specialChar); styles.push(specialChar + "-" + state.specialChar); }
    if (state.cite) { styles.push(cite); }
    if (state.addition) { styles.push(addition); }
    if (state.deletion) { styles.push(deletion); }
    if (state.sub) { styles.push(sub); }
    if (state.sup) { styles.push(sup); }

    if (state.list !== false) {
      listMod = (state.listDepth - 1) % 3;
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
    var match
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
    } else if (match = stream.match(quoteRE)) {
      state.quote = true;
      if (match[1].length === 2) {
        state.multilineFormat = quote;
      }
      if (modeCfg.highlightFormatting) state.formatting = 'quote';
      return getType(state);
    } else if (stream.match(footnoteRE)) {
      state.footnote = true;
    } else if (stream.match(tableRE)) {
      state.table = true;
    } else if (stream.match(paragraphRE)) {
      return getType(state);
    }

    return switchInline(stream, state, state.inline);
  }

  function toggleFormat(stream, state, format) {
    var type;

    if (state[format]) {
      if (modeCfg.highlightFormatting) state.formatting = format;
      type = getType(state);
      state[format] = false;
      return type;
    } else {
      state[format] = true;
      if (modeCfg.highlightFormatting) state.formatting = format;
      return getType(state);
    }
  }

  function inlineNormal(stream, state) {
    var style = state.text(stream, state)
    ,   ch
    ;
    if (typeof style !== 'undefined') {
      return style;
    }

    ch = stream.next();

    if (ch === '_') {
      if (stream.eat('_')) {
        return toggleFormat(stream, state, 'italic');
      } else {
        return toggleFormat(stream, state, 'em');
      }
    } else if (ch === '*') {
      if (stream.eat('*')) {
        return toggleFormat(stream, state, 'bold');
      } else {
        return toggleFormat(stream, state, 'strong');
      }
    } else if (ch === '[') {
      if (stream.match(/\d+\]/)) {
        state.footCite = true;
      }
    } else if (ch === '(') {
      if (stream.match('r)')) {
        state.specialChar = 'r';
      } else if (stream.match('tm)')) {
        state.specialChar = 'tm';
      } else if (stream.match('c)')) {
        state.specialChar = 'c';
      }
    } else if (ch === '?' && stream.eat('?')) {
      return toggleFormat(stream, state, 'cite');
    } else if (ch === '-') {
      return toggleFormat(stream, state, 'deletion');
    } else if (ch === '+') {
      return toggleFormat(stream, state, 'addition');
    } else if (ch === '~') {
      return toggleFormat(stream, state, 'sub');
    } else if (ch === '^') {
      return toggleFormat(stream, state, 'sup');
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
    state.specialChar = null;

    if (stream.sol()) {
      state.f = state.block;

      if (state.multilineFormat) {
        if (stream.match(blockRE, false)) {
          state[state.multilineFormat] = false;
          state.multilineFormat = null;
        } else {
          state[state.multilineFormat] = true;
        }
      }
    }

    return state.f(stream, state);
  }

  return {
    startState: function() {
      return {
        f: blockNormal,
        inline: inlineNormal,
        block: blockNormal,
        text: handleText,

        em: false,
        italic: false,
        strong: false,
        bold: false,
        header: false,
        list: false,
        quote: false,
        multilineFormat: null,
        footnote: false,
        footCite: false,
        table: false,
        specialChar: null,
        cite: false,
        addition: false,
        deletion: false,
        sub: false,
        sup: false,

        formatting: false
      };
    },

    token: token,

    blankLine: function(state) {
      state.em = false;
      state.italic = false;
      state.strong = false;
      state.bold = false;
      state.header = false;
      state.list = false;
      state.quote = false;
      state.footnote = false;
      state.footCite = false;
      state.table = false;
      state.specialChar = null;
      state.cite = false;
      state.addition = false;
      state.deletion = false;
      state.sub = false;
      state.sup = false;
    }
  };
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
