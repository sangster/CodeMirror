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
  var mode = {
    token:      token,
    startState: startState,
    blankLine:  blankLine
  };

  var format = {
    addition:     'addition',
    bold:         'bold',
    cite:         'cite',
    code:         'code',
    deletion:     'deletion',
    div:          'div',
    em:           'em',
    footnote:     'footnote',
    footCite:     'footnote-citation',
    formatting:   'formatting',
    header:       'header',
    italic:       'italic',
    link:         'link',
    linkDef:      'link-definition',
    list1:        'variable-2',
    list2:        'variable-3',
    list3:        'keyword',
    pre:          'pre',
    p:            'p',
    quote:        'quote',
    span:         'span',
    specialChar:  'special-char',
    strong:       'strong',
    sub:          'sub',
    sup:          'sup',
    table:        'table',
    tableHeading: 'table-heading'
  };

  // some of there expressions are from http://github.com/borgar/textile-js
  var typeSpec = {
    bc:           'bc',
    bq:           'bq',
    div:          'div',
    drawTable:    '\\|.*\\|',
    foot:         'fn\\d+',
    header:       'h[1-6]',
    linkDef:      '\\[[^\\s\\]]+\\]\\S+',
    list:         '^(?:#+|\\*+)',
    notextile:    'notextile',
    para:         'p',
    pre:          'pre',
    table:        'table',
    tableHeading:  '\\|_\\.',
    tableText:    '[^"_\\*\\[\\(\\?\\+~\\^%@|-]+',
    text:         '[^"_\\*\\[\\(\\?\\+~\\^%@-]+'
  };
  typeSpec.all = [typeSpec.div, typeSpec.foot, typeSpec.header, typeSpec.bc,
    typeSpec.bq, typeSpec.notextile, typeSpec.pre, typeSpec.table,
    typeSpec.para].join('|');

  var attrs = {
    align: '(?:<>|<|>|=)',
    class: '\\([^\\)]+\\)',
    lang:  '\\[[^\\[\\]]+\\]',
    pad:   '[\\(\\)]+',
    style: '\\{[^\\}]+\\}'
  };
  attrs.all = '(?:'+[attrs.class, attrs.style, attrs.lang, attrs.align, attrs.pad].join('|')+')*';

  var re = {
    bc:           new RegExp('^'+typeSpec.bc),
    bq:           new RegExp('^'+typeSpec.bq),
    div:          new RegExp('^'+typeSpec.div),
    drawTable:    new RegExp('^'+typeSpec.drawTable+'$'),
    foot:         new RegExp('^'+typeSpec.foot),
    header:       new RegExp('^'+typeSpec.header),
    linkDef:      new RegExp('^'+typeSpec.linkDef+'$'),
    list:         new RegExp('^'+typeSpec.list),
    listLayout:   new RegExp('^'+typeSpec.list+attrs.all+'\\s+'),
    notextile:    new RegExp('^'+typeSpec.notextile),
    para:         new RegExp('^'+typeSpec.para),
    pre:          new RegExp('^'+typeSpec.pre),
    tableText:    new RegExp('^'+typeSpec.tableText),
    text:         new RegExp('^'+typeSpec.text),
    table:        new RegExp('^'+typeSpec.table),
    tableHeading: new RegExp('^'+typeSpec.tableHeading),
    type:         new RegExp('^(?:'+typeSpec.all+')'),
    typeLayout:   new RegExp('^(?:'+typeSpec.all+')'+attrs.all+'\\.\\.?(\\s+|$)'),

    attrs:      new RegExp('^'+attrs.all)
  };

  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false;
  }

  function token(stream, state) {
    state.formatting = false;
    state.specialChar = null;

    if (stream.sol()) {
      state.func = state.blockFunc;
      state.tableHeading = false;
    }

    return state.func(stream, state);
  }

  function startState() {
    return {
      func:       blockNormal,
      blockFunc:  blockNormal,
      inlineFunc: inlineNormal,

      type:   null,
      header: false,
      list:   false,

      addition: false,
      bold:     false,
      cite:     false,
      code:     false,
      deletion: false,
      em:       false,
      footCite: false,
      italic:   false,
      link:     false,
      span:     false,
      strong:   false,
      sub:      false,
      sup:      false,

      table:        false,
      tableHeading: false,
      specialChar:  null,

      multiBlock: false,
      formatting: false
    };
  }

  function blockNormal(stream, state) {
    if (stream.match(re.typeLayout, false)) {
      state.multiBlock = false;
      return switchInline(stream, state, blockType);
    } else if (stream.match(re.listLayout, false)) {
      return switchBlock(stream, state, listFunc);
    } else if (stream.match(re.drawTable, false)) {
      return switchBlock(stream, state, tableFunc);
    } else if (stream.match(re.linkDef, false)) {
      return switchBlock(stream, state, linkDefFunc);
    }

    return switchInline(stream, state, state.inlineFunc);
  }

  function switchInline(stream, state, f) {
    state.func = state.inlineFunc = f;
    return f(stream, state);
  }

  function switchBlock(stream, state, f) {
    state.func = state.blockFunc = f;
    return f(stream, state);
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
    } else if (type.match(re.table)) {
      state.type = 'table';
    }

    state.func = attrsFunc;
    return getType(state);
  }

  function attrsFunc(stream, state) {
    state.func = state.inlineFunc = typeLenFunc;

    if (stream.match(re.attrs)) {
      return getType(state, 'attributes');
    }
    return getType(state);
  }

  function typeLenFunc(stream, state) {
    if (stream.eat('.') && stream.eat('.')) {
      state.multiBlock = true;
    }

    state.func = state.inlineFunc = inlineNormal;
    return getType(state);
  }

  function inlineNormal(stream, state) {
    var ch
    ;
    if (stream.match(re.text, true)) {
      return getType(state);
    }

    ch = stream.next();

    if (ch === '"') {
      return switchInline(stream, state, linkFunc);
    }
    return handleSpecialChar(stream, state, ch);
  }

  function inlineTable(stream, state) {
    if (stream.match(re.tableText, true)) {
      return getType(state);
    }

    if (stream.peek() === '|') {
      state.func = state.inlineFunc = tableCellFunc;
      return getType(state);
    }
    return handleSpecialChar(stream, state, stream.next());
  }

  function handleSpecialChar(stream, state, ch) {
    if (ch === '_') {
      if (stream.eat('_')) {
        return togglePhrase(stream, state, 'italic', /^.*__/);
      }
      return togglePhrase(stream, state, 'em', /^.*_/);
    } else if (ch === '*') {
      if (stream.eat('*')) {
        return togglePhrase(stream, state, 'bold', /^.*\*\*/);
      }
      return togglePhrase(stream, state, 'strong', /^.*\*/);
    } else if (ch === '[') {
      if (stream.match(/\d+\]/)) {
        state.footCite = true;
      }
      return getType(state);
    } else if (ch === '(') {
      if (stream.match('r)')) {
        state.specialChar = 'r';
      } else if (stream.match('tm)')) {
        state.specialChar = 'tm';
      } else if (stream.match('c)')) {
        state.specialChar = 'c';
      }
      return getType(state);
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
      state.func = attrsFunc;
      return getType(state);
    }
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
    state.func = attrsFunc;
    return getType(state);
  }

  function tableFunc(stream, state) {
    state.type = 'table';
    return switchInline(stream, state, tableCellFunc);
  }

  function linkDefFunc(stream, state) {
    var type = getType(state, format['linkDef']);
    stream.skipToEnd();
    return type;
  }

  function tableCellFunc(stream, state) {
    if (stream.match(re.tableHeading)) {
      state.tableHeading = true;
    } else {
      stream.eat('|');
    }
    state.func = state.inlineFunc = inlineTable;
    return getType(state);
  }

  function linkFunc(stream, state) {
    if (stream.match(/[^(?:":)]+":\S/)) {
      stream.match(/\S+/);
    }
    state.func = state.inlineFunc = inlineNormal;
    return getType(state, format['link']);
  }

  function getType(state, extraTypes) {
    var styles = []
    ,   type
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

    styles = styles.concat(activeStyles(state, 'addition', 'bold', 'cite',
        'code', 'deletion', 'em', 'footCite', 'italic', 'link', 'span',
        'strong', 'sub', 'sup', 'table', 'tableHeading'));

    if (state.type === 'header') { styles.push(format.header + "-" + state.header); }
    if (state.specialChar) {
      styles.push(format.specialChar);
      styles.push(format.specialChar + "-" + state.specialChar);
    }

    type = styles.length ? styles.join(' ') : null;
    if(extraTypes) {
      return type ? (type + ' ' + extraTypes) : extraTypes;
    }
    return type;
  }

  function activeStyles(state) {
    var styles = []
    ,   i
    ,   length = arguments.length
    ,   arg
    ;
    for (i=1; i < length; ++i) {
      arg = arguments[i];
      if (state[arg]) {
        styles.push(format[arg]);
      }
    }
    return styles;
  }

  function blankLine(state) {
    resetPhraseModifiers(state);

    state.func = state.blockFunc = blockNormal;

    if (!state.multiBlock) {
      state.type = null;
    }
    state.footCite = false;
    state.header   = false;
    state.list     = false;
    state.table    = false;

    state.specialChar = null;
  }

  function resetPhraseModifiers(state) {
    state.addition = false;
    state.bold     = false;
    state.cite     = false;
    state.code     = false;
    state.deletion = false;
    state.em       = false;
    state.italic   = false;
    state.span     = false;
    state.sub      = false;
    state.sup      = false;
    state.strong   = false;
  }

  return mode;
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
