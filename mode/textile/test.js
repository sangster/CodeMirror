// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function() {
  var mode = CodeMirror.getMode({tabSize: 4}, 'textile');
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }
  var modeHighlightFormatting = CodeMirror.getMode({tabSize: 4}, {name: 'textile', highlightFormatting: true});
  function FT(name) { test.mode(name, modeHighlightFormatting, Array.prototype.slice.call(arguments, 1)); }


  FT('simple_header',
      '[formatting&formatting-header&formatting-header-1&header&header-1 h1. ]' +
      '[header&header-1 Give RedCloth a try!]');

  MT('plainText',
      'This is some text.');

  MT('h1',
      '[header&header-1 h1. foo]');

  MT('h2',
      '[header&header-2 h2. foo]');

  MT('h3',
      '[header&header-3 h3. foo]');

  MT('h4',
      '[header&header-4 h4. foo]');

  MT('h5',
      '[header&header-5 h5. foo]');

  MT('h6',
      '[header&header-6 h6. foo]');

  MT('h7',
      'h7. foo');

  MT('h1inline',
      '[header&header-1 h1. foo ][header&header-1&em _bar_][header&header-1 baz]');

  MT('strong',
      'foo [strong *bar*]');

  MT('italics',
      'foo [em __bar__]');

  MT('bold',
      'foo [strong **bar**]');

  MT('ul',
      'foo',
      'bar',
      '',
      '[variable-2 * foo]',
      '[variable-2 * bar]');

  MT('ulNoBlank',
      'foo',
      'bar',
      '[variable-2 * foo]',
      '[variable-2 * bar]');

  MT('ol',
      'foo',
      'bar',
      '',
      '[variable-2 # foo]',
      '[variable-2 # bar]');

  MT('olNoBlank',
      'foo',
      'bar',
      '[variable-2 # foo]',
      '[variable-2 # bar]');

  MT('ulFormatting',
      '[variable-2 * ][variable-2&em _foo_][variable-2 bar]',
      '[variable-2 * ][variable-2&strong *][variable-2&em&strong _foo_][variable-2&strong *][variable-2  bar]',
      '[variable-2 * ][variable-2&strong *foo*][variable-2 bar]');

  MT('olFormatting',
      '[variable-2 # ][variable-2&em _foo_][variable-2 bar]',
      '[variable-2 # ][variable-2&strong *][variable-2&em&strong _foo_][variable-2&strong *][variable-2  bar]',
      '[variable-2 # ][variable-2&strong *foo*][variable-2 bar]');

  MT('ulNested',
      '[variable-2 * foo]',
      '[variable-3 ** bar]',
      '[keyword *** bar]',
      '[variable-2 **** bar]',
      '[variable-3 ** bar]');

  MT('olNested',
      '[variable-2 # foo]',
      '[variable-3 ## bar]',
      '[keyword ### bar]',
      '[variable-2 #### bar]',
      '[variable-3 ## bar]');

  MT('ulNestedWithOl',
      '[variable-2 * foo]',
      '[variable-3 ## bar]',
      '[keyword *** bar]',
      '[variable-2 #### bar]',
      '[variable-3 ** bar]');

  MT('olNestedWithUl',
      '[variable-2 # foo]',
      '[variable-3 ** bar]',
      '[keyword ### bar]',
      '[variable-2 **** bar]',
      '[variable-3 ## bar]');

  MT('paragraph',
      'p. foo bar');

  MT('div',
      'div. foo bar');

  MT('paragraphFormatting',
      'p. [strong *foo ][strong&em _bar_][strong *]');

  MT('divFormatting',
      'div. [strong *foo ][strong&em _bar_][strong *]');
})();
