// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

!(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("textile", function() {
  var mode = {
    token: token,
    startState: startState,
    blankLine: blankLine
  };




  function Parser(stream, state) {
    this.stream = stream;
    this.state = state;
    this._format = {
      addition: 'addition',
      attributes: 'attributes',
      bold: 'bold',
      cite: 'cite',
      code: 'code',
      deletion: 'deletion',
      div: 'div',
      em: 'em',
      footnote: 'footnote',
      footCite: 'footnote-citation',
      header: 'header',
      html: 'html',
      italic: 'italic',
      link: 'link',
      linkDef: 'link-definition',
      list1: 'variable-2',
      list2: 'variable-3',
      list3: 'keyword',
      notextile: 'notextile',
      pre: 'pre',
      p: 'p',
      quote: 'quote',
      span: 'span',
      specialChar: 'special-char',
      strong: 'strong',
      sub: 'sub',
      sup: 'sup',
      table: 'table',
      tableHeading: 'table-heading'
    };

    this.state.specialChar = null;
  }

  Parser.prototype.startNewLine = function() {
    this.state.currentMode = this.state.blockMode;
    this.state.tableHeading = false;
  };

  Parser.prototype.nextType = function () {
    return this.state.currentMode.call(this);
  };

  Parser.prototype.format = function(name) {
    if (this._format.hasOwnProperty(name)) {
      return this._format[name];
    }
    throw 'unknown format';
  };

  Parser.prototype.execMode = function(newMode) {
    this.state.currentMode = newMode;
    return newMode.call(this, this.stream, this.state);
  };

//  Parser.prototype.switchInline = function(newMode) {
//    this.state.currentMode = this.state.inlineMode = newMode;
//    return newMode.call(this, this.stream, this.state);
//  };
//
//  Parser.prototype.switchBlock = function(newMode) {
//    this.state.currentMode = this.state.blockMode = newMode;
//    return newMode.call(this, this.stream, this.state);
//  };

  Parser.prototype.handleSpecialChar = function(ch) {
    if (ch === '_') {
      if (this.stream.eat('_')) {
        return this.togglePhrase('italic', /^.*__/);
      }
      return this.togglePhrase('em', /^.*_/);
    } else if (ch === '*') {
      if (this.stream.eat('*')) {
        return this.togglePhrase('bold', /^.*\*\*/);
      }
      return this.togglePhrase('strong', /^.*\*/);
    } else if (ch === '[') {
      if (this.stream.match(/\d+\]/)) {
        this.state.footCite = true;
      }
      return this.getType(this.state);
    } else if (ch === '(') {
      if (this.stream.match('r)')) {
        this.state.specialChar = 'r';
      } else if (this.stream.match('tm)')) {
        this.state.specialChar = 'tm';
      } else if (this.stream.match('c)')) {
        this.state.specialChar = 'c';
      }
      return this.getType(this.state);
    } else if (ch === '?' && this.stream.eat('?')) {
      return this.togglePhrase('cite', /^.*\?/);
    } else if (ch === '-') {
      return this.togglePhrase('deletion', /^.*-/);
    } else if (ch === '+') {
      return this.togglePhrase('addition', /^.*\+/);
    } else if (ch === '~') {
      return this.togglePhrase('sub', /^.*~/);
    } else if (ch === '^') {
      return this.togglePhrase('sup', /^.*\^/);
    } else if (ch === '%') {
      return this.togglePhrase('span', /^.*%/);
    } else if (ch === '@') {
      return this.togglePhrase('code', /^.*@/);
    }
    return this.getType(this.state);
  };

  Parser.prototype.togglePhrase = function(format, closeRE) {
    if (this.state[format]) { // remove format
      var type = this.getType(this.state);
      this.state[format] = false;
      return type;
    } else if (this.stream.match(closeRE, false)) { // add format
      this.state[format] = true;
      this.state.currentMode = Modes.attrs;
      return this.getType(this.state);
    }
  };

  Parser.prototype.getType = function(state, extraTypes) {
    if (state.type === 'notextile') {
      return this.format('notextile');
    }

    var styles = [];

    // Block Type
    if (state.type) { styles.push(this.format(state.type)); }

    styles = styles.concat(this.activeStyles(state, 'addition', 'bold', 'cite',
        'code', 'deletion', 'em', 'footCite', 'italic', 'link', 'span',
        'strong', 'sub', 'sup', 'table', 'tableHeading'));

    if (state.type === 'header') { styles.push(this.format('header') + "-" + state.header); }
    if (state.specialChar) {
      styles.push(this.format('specialChar'));
      styles.push(this.format('specialChar') + "-" + state.specialChar);
    }

    return this.stylesToString(styles, extraTypes);
  };

  Parser.prototype.stylesToString = function(styles, extraStyles) {
    var type = styles.length ? styles.join(' ') : null;
    if(extraStyles) {
      return type ? (type + ' ' + extraStyles) : extraStyles;
    }
    return type;
  };

  Parser.prototype.activeStyles = function (state) {
    var styles = [],
        length = arguments.length,
        arg,
        i;
    for (i = 1; i < length; ++i) {
      arg = arguments[i];
      if (state[arg]) {
        styles.push(this.format(arg));
      }
    }
    return styles;
  };









  function Reg() {
    this._cache = {};
    this._single = {
      bc: 'bc',
      bq: 'bq',
      div: 'div',
      drawTable: /\|.*\|/,
      foot: /fn\d+/,
      header: /h[1-6]/,
      html: /<(\/)?(\w+)([^>]+)?>([^<]+<\/\1>)?/,
      linkDef: /\[[^\s\]]+\]\S+/,
      list: /(?:#+|\*+)/,
      notextile: 'notextile',
      para: 'p',
      pre: 'pre',
      table: 'table',
      tableAttrs: /[/\\]\d+/,
      tableHeading: /\|_\./,
      tableText: /[^"_\*\[\(\?\+~\^%@|-]+/,
      text: /[^"_\*\[\(\?\+~\^%@-]+/
    };
    this._attrs = {
      align: /(?:<>|<|>|=)/,
      selector: /\([^\(][^\)]+\)/,
      lang: /\[[^\[\]]+\]/,
      pad: /(?:\(+|\)+){1,2}/,
      css: /\{[^\}]+\}/
    };
  }

  Reg.prototype.pattern = function(name) {
    return (this._cache[name] || this._createRe(name));
  };

  Reg.prototype._createRe = function (name) {
    switch (name) {
      case 'bc':
        return this._makeRe('^', this._single.bc);
      case 'bq':
        return this._makeRe('^', this._single.bq);
      case 'div':
        return this._makeRe('^', this._single.div);
      case 'drawTable':
        return this._makeRe('^', this._single.drawTable, '$');
      case 'foot':
        return this._makeRe('^', this._single.foot);
      case 'header':
        return this._makeRe('^', this._single.header);
      case 'html':
        return this._makeRe('^', this._single.html, '(?:', this._single.html, ')*', '$');
      case 'linkDef':
        return this._makeRe('^', this._single.linkDef, '$');
      case 'list':
        return this._makeRe('^', this._single.list);
      case 'listLayout':
        return this._makeRe('^', this._single.list, this.pattern('allAttrs'), '*\\s+');
      case 'notextile':
        return this._makeRe('^', this._single.notextile);
      case 'para':
        return this._makeRe('^', this._single.para);
      case 'pre':
        return this._makeRe('^', this._single.pre);
      case 'tableText':
        return this._makeRe('^', this._single.tableText);
      case 'text':
        return this._makeRe('^', this._single.text);
      case 'table':
        return this._makeRe('^', this._single.table);
      case 'tableAttrs':
        return this._makeRe('^', this._single.tableAttrs);
      case 'tableHeading':
        return this._makeRe('^', this._single.tableHeading);
      case 'type':
        return this._makeRe('^', this.pattern('allTypes'));
      case 'typeLayout':
        return this._makeRe('^', this.pattern('allTypes'), this.pattern('allAttrs'), '*\\.\\.?(\\s+|$)');
      case 'attrs':
        return this._makeRe('^', this.pattern('allAttrs'), '+');

      case 'allTypes':
        return this._choiceRe(this._single.div, this._single.foot,
            this._single.header, this._single.bc, this._single.bq,
            this._single.notextile, this._single.pre, this._single.table,
            this._single.para);

      case 'allAttrs':
        return this._choiceRe(this._attrs.selector, this._attrs.css,
            this._attrs.lang, this._attrs.align, this._attrs.pad);

      default:
        throw 'unknown regex';
    }
  };


  Reg.prototype._makeRe = function () {
    var pattern = '',
        length = arguments.length,
        i,
        arg;

    for (i = 0; i < length; ++i) {
      arg = arguments[i];
      pattern += (typeof arg === 'string') ? arg : arg.source;
    }
    return new RegExp(pattern);
  };

  Reg.prototype._choiceRe = function () {
    var parts = [arguments[0]],
        length = arguments.length,
        i;

    for (i = 1; i < length; ++i) {
      parts[i * 2 - 1] = '|';
      parts[i * 2] = arguments[i];
    }

    parts.unshift('(?:');
    parts.push(')');
    return this._makeRe.apply(this, parts);
  };







  var Modes = {
    list: function() {
      var match = this.stream.match(re.pattern('list')),
          listMod;
      this.state.listDepth = match[0].length;
      listMod = (this.state.listDepth - 1) % 3;
      if (!listMod) {
        this.state.type = 'list1';
      } else if (listMod === 1) {
        this.state.type = 'list2';
      } else {
        this.state.type = 'list3';
      }
      this.state.currentMode = Modes.attrs;
      return this.getType(this.state);
    },

    table: function() {
      this.state.type = 'table';
      return this.execMode(this.state.inlineMode = Modes.tableCell);
    },

    linkDef: function() {
      var type = this.getType(this.state, this.format('linkDef'));
      this.stream.skipToEnd();
      return type;
    },

    html: function() {
      var type = this.getType(this.state, this.format('html'));
      this.stream.skipToEnd();
      return type;
    },

    tableCell: function() {
      if (this.stream.match(re.pattern('tableHeading'))) {
        this.state.tableHeading = true;
      } else {
        this.stream.eat('|');
      }
      this.state.currentMode = this.state.inlineMode = Modes.tableCellAttrs;
      return this.getType(this.state);
    },

    tableCellAttrs: function() {
      var attrsPresent;
      this.state.currentMode = this.state.inlineMode = Modes.inlineTable;

      if (this.stream.match(re.pattern('tableAttrs'))) {
        attrsPresent = true;
      }
      if (this.stream.match(re.pattern('attrs'))) {
        attrsPresent = true;
      }
      if (attrsPresent) {
        return this.getType(this.state, this.format('attributes'));
      }

      return this.getType(this.state);
    },

    link: function() {
      if (this.stream.match(/[^(?:":)]+":\S/)) {
        this.stream.match(/\S+/);
      }
      this.state.currentMode = this.state.inlineMode = Modes.inlineNormal;
      return this.getType(this.state, this.format('link'));
    },

    blockType: function() {
      var match,
          type;
      this.state.type = null;

      if (match = this.stream.match(re.pattern('type'))) {
        type = match[0];
      } else {
        return this.execMode(this.state.inlineMode = this.state.inlineMode);
      }

      if(match = type.match(re.pattern('header'))) {
        this.state.type = 'header';
        this.state.header = parseInt(match[0][1]);
      } else if (type.match(re.pattern('bq'))) {
        this.state.type = 'quote';
      } else if (type.match(re.pattern('bc'))) {
        this.state.type = 'code';
      } else if (type.match(re.pattern('foot'))) {
        this.state.type = 'footnote';
      } else if (type.match(re.pattern('notextile'))) {
        this.state.type = 'notextile';
      } else if (type.match(re.pattern('pre'))) {
        this.state.type = 'pre';
      } else if (type.match(re.pattern('div'))) {
        this.state.type = 'div';
      } else if (type.match(re.pattern('table'))) {
        this.state.type = 'table';
      }

      this.state.currentMode = Modes.attrs;
      return this.getType(this.state);
    },

    attrs: function() {
      this.state.currentMode = this.state.inlineMode = Modes.typeLen;

      if (this.stream.match(re.pattern('attrs'))) {
        return this.getType(this.state, this.format('attributes'));
      }
      return this.getType(this.state);
    },

    typeLen: function() {
      if (this.stream.eat('.') && this.stream.eat('.')) {
        this.state.multiBlock = true;
      }

      this.state.currentMode = this.state.inlineMode = Modes.inlineNormal;
      return this.getType(this.state);
    },

    inlineNormal: function() {
      if (this.stream.match(re.pattern('text'), true)) {
        return this.getType(this.state);
      }

      var ch = this.stream.next();

      if (ch === '"') {
        return this.execMode(this.state.inlineMode = Modes.link);
      }
      return this.handleSpecialChar(ch);
    },

    inlineTable: function() {
      if (this.stream.match(re.pattern('tableText'), true)) {
        return this.getType(this.state);
      }

      if (this.stream.peek() === '|') {
        this.state.currentMode = this.state.inlineMode = Modes.tableCell;
        return this.getType(this.state);
      }
      return this.handleSpecialChar(this.stream.next());
    },

    blockNormal: function() {
      if (this.stream.match(re.pattern('typeLayout'), false)) {
        this.state.multiBlock = false;
        return this.execMode(this.state.inlineMode = Modes.blockType);
      } else if (this.stream.match(re.pattern('listLayout'), false)) {
        return this.execMode(this.state.blockMode = Modes.list);
      } else if (this.stream.match(re.pattern('drawTable'), false)) {
        return this.execMode(this.state.blockMode = Modes.table);
      } else if (this.stream.match(re.pattern('linkDef'), false)) {
        return this.execMode(this.state.blockMode = Modes.linkDef);
      } else if (this.stream.match(re.pattern('html'), false)) {
        return this.execMode(this.state.inlineMode = Modes.html);
      }

      return this.execMode(this.state.inlineMode);
    }
  };










  var re = new Reg();






  function token(stream, state) {
    var parser = new Parser(stream, state);

    if (stream.sol()) {
      parser.startNewLine();
    }
    return parser.nextType();
  }

  function startState() {
    return {
      currentMode: Modes.blockNormal,
      blockMode: Modes.blockNormal,
      inlineMode: Modes.inlineNormal,

      type: null,
      header: false,
      list: false,

      addition: false,
      bold: false,
      cite: false,
      code: false,
      deletion: false,
      em: false,
      footCite: false,
      italic: false,
      link: false,
      span: false,
      strong: false,
      sub: false,
      sup: false,

      table: false,
      tableHeading: false,
      specialChar: null,

      multiBlock: false
    };
  }

  function blankLine(state) {
    resetPhraseModifiers(state);

    state.currentMode = state.blockMode = Modes.blockNormal;

    if (!state.multiBlock) {
      state.type = null;
    }
    state.footCite = false;
    state.header = false;
    state.list = false;
    state.table = false;

    state.specialChar = null;
  }

  function resetPhraseModifiers(state) {
    state.addition = false;
    state.bold = false;
    state.cite = false;
    state.code = false;
    state.deletion = false;
    state.em = false;
    state.italic = false;
    state.span = false;
    state.sub = false;
    state.sup = false;
    state.strong = false;
  }

  return mode;
});

CodeMirror.defineMIME("text/x-textile", "textile");

});
