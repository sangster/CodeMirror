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
  var format = {
    formatting:  'formatting',
    header:      'header',
    em:          'em',
    italic:      'italic',
    strong:      'strong',
    bold:        'bold',
    list1:       'variable-2',
    list2:       'variable-3',
    list3:       'keyword',
    quote:       'quote',
    footnote:    'footnote',
    footCite:    'footnote-citation',
    table:       'table',
    specialChar: 'special-char',
    cite:        'cite',
    addition:    'addition',
    deletion:    'deletion',
    sub:         'sub',
    sup:         'sup',
    span:        'span',
    code:        'code',
    div:         'div',
    pre:         'pre',
    p:           'p'
  };
  // some of there expressions are from http://github.com/borgar/textile-js
  var typeSpec = {
    header:    'h[1-6]',
    para:      'p',
    foot:      'fn\\d+',
    div:       'div',
    bc:        'bc',
    bq:        'bq',
    notextile: 'notextile',
    pre:       'pre',
    list:      '^(?:#+|\\*+)'
  };
  typeSpec.all = [typeSpec.div, typeSpec.foot, typeSpec.header, typeSpec.bc,
    typeSpec.bq, typeSpec.notextile, typeSpec.pre, typeSpec.para].join('|');

  var attrs = {
    class: '\\([^\\)]+\\)',
    style: '\\{[^\\}]+\\}',
    lang:  '\\[[^\\[\\]]+\\]',
    align: '(?:<>|<|>|=)',
    pad:   '[\\(\\)]+'
  };
  attrs.all = '(?:'+[attrs.class, attrs.style, attrs.lang, attrs.align, attrs.pad].join('|')+')*';

  var re = {
    header:    new RegExp('^'+typeSpec.header),
    para:      new RegExp('^'+typeSpec.para),
    foot:      new RegExp('^'+typeSpec.foot),
    div:       new RegExp('^'+typeSpec.div),
    bc:        new RegExp('^'+typeSpec.bc),
    bq:        new RegExp('^'+typeSpec.bq),
    notextile: new RegExp('^'+typeSpec.notextile),
    pre:       new RegExp('^'+typeSpec.pre),
    list:      new RegExp('^'+typeSpec.list),

    attrs:     new RegExp('^'+attrs.all)
  };
  re.type       = new RegExp('^(?:'+typeSpec.all+')');
  re.typeLayout = new RegExp('^(?:'+typeSpec.all+')'+attrs.all+'\\.\\.?\\s+');
  re.listLayout = new RegExp('^'+typeSpec.list+attrs.all+'\\s+');

  var tableRE     = /^\|.*\|$/
  ,   textRE      = /^[^_*\[\(\?\+-~^%@]+/
  ;

  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false;
  }

  function switchInline(stream, state, f) {
    state.func = state.inlineFunc = f;
    return f(stream, state);
  }

  function switchBlock(stream, state, f) {
    state.func = state.blockFunc = f;
    return f(stream, state);
  }

  function getType(state) {
    var styles = []
    ,   listMod
    ;

    if (state.formatting) {
      styles.push(format.formatting);

      if (typeof state.formatting === "string") state.formatting = [state.formatting];

      for (var i = 0; i < state.formatting.length; i++) {
        styles.push(format.formatting + "-" + state.formatting[i]);

        if (state.formatting[i] === "header") {
          styles.push(format.formatting + "-" + state.formatting[i] + "-" + state.header);
        }
      }
    }

    // Block Type
    if ( state.type ) { styles.push(format[state.type]); }

    // Phrase modifiers
    if (state.em) { styles.push(format.em); }
    if (state.italic) { styles.push(format.italic); }
    if (state.strong) { styles.push(format.strong); }
    if (state.bold) { styles.push(format.bold); }
    if (state.footCite) { styles.push(format.footCite); }
    if (state.table) { styles.push(format.table); }
    if (state.cite) { styles.push(format.cite); }
    if (state.addition) { styles.push(format.addition); }
    if (state.deletion) { styles.push(format.deletion); }
    if (state.sub) { styles.push(format.sub); }
    if (state.sup) { styles.push(format.sup); }
    if (state.span) { styles.push(format.span); }
    if (state.code) { styles.push(format.code); }

    if (state.type === 'header') { styles.push(format.header + "-" + state.header); }
    if (state.specialChar) { styles.push(format.specialChar); styles.push(format.specialChar + "-" + state.specialChar); }

    return styles.length ? styles.join(' ') : null;
  }

  function blockType(stream, state) {
    var match
    ,   type
    ;
    state.type = null;

    if (match = stream.match(re.type)) {
      type = match[0]
    } else {
      return switchInline(stream, state, state.inlineFunc);
    }

    if(match = type.match(re.header)) {
      state.type = 'header';
      state.header = parseInt(match[0][1]);
    } else if (type.match(re.bq)) {
      state.type = 'quote';
    } else if (type.match(re.bc)) {
      state.type = 'code';
    } else if (type.match(re.foot)) {
      state.type = 'footnote';
    } else if (type.match(re.notextile)) {
      state.type = 'notextile';
    } else if (type.match(re.pre)) {
      state.type = 'pre';
    } else if (type.match(re.div)) {
      state.type = 'div';
    }

    state.func = state.inlineFunc = state.attrsFunc;
    return getType(state);
  }

  function attrsFunc(stream, state) {
    var t
    ,   style = ''
    ;
    if (stream.match(attrs.all)) {
      style = 'attributes';
    }

    state.func = state.inlineFunc = state.typeLenFunc;
    t = getType(state);
    return t;//(t.length ? (t + ' ') : '') + style;
  }

  function typeLenFunc(stream, state) {
    if (stream.eat('.') && stream.eat('.')) {
      state.multiBlock = true;
    }

    state.func = state.inlineFunc = state.normalFunc;
    return getType(state);
  }

  function listFunc(stream, state) {
    var match    = stream.match(re.list)
    ,   listType
    ,   listMod
    ;

    state.listDepth = match[0].length;
    listMod = (state.listDepth - 1) % 3;
    if (!listMod) {
      state.type = 'list1';
    } else if (listMod === 1) {
      state.type = 'list2';
    } else {
      state.type = 'list3';
    }
    if (modeCfg.highlightFormatting) {
      listType = (match[0][0] === '#' ? 'ol' : 'ul');
      state.formatting = ["list", "list-" + listType];
    }
    state.func = state.inlineFunc = state.attrsFunc;
    return getType(state);
  }

  function blockNormal(stream, state) {
    if (stream.match(re.typeLayout, false)) {
      state.multiBlock = false;
      return switchBlock(stream, state, state.typeFunc);
    } else if (stream.match(re.listLayout, false)) {
      return switchBlock(stream, state, state.listFunc);
    } else if (stream.match(tableRE)) {
      state.type = 'table';
      return getType(state);
    }

    return switchInline(stream, state, state.inlineFunc);
  }

  function togglePhrase(stream, state, format, closeRE) {
    var type;

    if (state[format]) { // remove format
      if (modeCfg.highlightFormatting) state.formatting = format;
      type = getType(state);
      state[format] = false;
      return type;
    } else if (stream.match(closeRE, false)) { // add format
      state[format] = true;
      if (modeCfg.highlightFormatting) state.formatting = format;
      return getType(state);
    }
  }

  function inlineNormal(stream, state) {
    var style = state.textFunc(stream, state)
    ,   ch
    ;
    if (typeof style !== 'undefined') {
      return style;
    }

    ch = stream.next();

    if (ch === '_') {
      if (stream.eat('_')) {
        return togglePhrase(stream, state, 'italic', /^.*__/);
      } else {
        return togglePhrase(stream, state, 'em', /^.*_/);
      }
    } else if (ch === '*') {
      if (stream.eat('*')) {
        return togglePhrase(stream, state, 'bold', /^.*\*\*/);
      } else {
        return togglePhrase(stream, state, 'strong', /^.*\*/);
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
      return togglePhrase(stream, state, 'cite', /^.*\?/);
    } else if (ch === '-') {
      return togglePhrase(stream, state, 'deletion', /^.*-/);
    } else if (ch === '+') {
      return togglePhrase(stream, state, 'addition', /^.*\+/);
    } else if (ch === '~') {
      return togglePhrase(stream, state, 'sub', /^.*~/);
    } else if (ch === '^') {
      return togglePhrase(stream, state, 'sup', /^.*\^/);
    } else if (ch === '%') {
      return togglePhrase(stream, state, 'span', /^.*%/);
    } else if (ch === '@') {
      return togglePhrase(stream, state, 'code', /^.*@/);
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
      state.func = state.blockFunc;
    }

    return state.func(stream, state);
  }

  function resetPhraseModifiers(state) {
    state.em = false;
    state.italic = false;
    state.strong = false;
    state.bold = false;
    state.addition = false;
    state.deletion = false;
    state.sub = false;
    state.sup = false;
    state.span = false;
    state.code = false;
    state.cite = false;
  }

  return {
    startState: function() {
      return {
        func: blockNormal,
        inlineFunc: inlineNormal,
        normalFunc: inlineNormal,
        blockFunc: blockNormal,
        textFunc: handleText,
        typeFunc: blockType,
        attrsFunc: attrsFunc,
        listFunc: listFunc,
        typeLenFunc: typeLenFunc,

        type: null,
        header: false,
        list: false,

        em: false,
        italic: false,
        strong: false,
        bold: false,
        cite: false,
        addition: false,
        deletion: false,
        sub: false,
        sup: false,
        span: false,
        code: false,
        footCite: false,

        table: false,
        specialChar: null,

        multiBlock: false,
        formatting: false
      };
    },

    token: token,

    blankLine: function(state) {
      resetPhraseModifiers(state);

      state.func = state.blockFunc = blockNormal;

      if (!state.multiBlock) {
        state.type = null;
      }
      state.header = false;
      state.list = false;
      state.footCite = false;
      state.table = false;
      state.specialChar = null;
    }
  };
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
