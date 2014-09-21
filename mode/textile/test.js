// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function() {
  var mode = CodeMirror.getMode({tabSize: 4}, 'textile');
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }
  var modeHighlightFormatting = CodeMirror.getMode({tabSize: 4}, {name: 'textile', highlightFormatting: true});
  function FT(name) { test.mode(name, modeHighlightFormatting, Array.prototype.slice.call(arguments, 1)); }


//  FT('simple_header',
//      '[formatting&formatting-header&formatting-header-1&header&header-1 h1. ]' +
//      '[header&header-1 Give RedCloth a try!]');

  MT('plainText',
      'This is some text.');

  MT('simpleLink',
      '[link "CodeMirror":http://codemirror.net]');

  MT('referenceLink',
      '[link "CodeMirror":code_mirror]',
      'Normal Text.',
      '[link-definition [[code_mirror]]http://redcloth.org]');

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
      '[header&header-1 h1. foo ][header&header-1&em _bar_][header&header-1  baz]');

  MT('em',
      'foo [em _bar_]');

  MT('emBoogus',
      'code_mirror');

  MT('strong',
      'foo [strong *bar*]');

  MT('strongBogus',
      '3 * 3 = 9');

  MT('italic',
      'foo [italic __bar__]');

  MT('italicBogus',
      'code__mirror');

  MT('bold',
      'foo [bold **bar**]');

  MT('boldBogus',
      '3 ** 3 = 27');

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
      '[div div. foo bar]');

  MT('divWithAttribute',
      '[div div][div&attributes (#my-id)][div . foo bar]');

  MT('divWithAttributeAnd2emLeftPadding',
      '[div div][div&attributes (((#my-id)][div . foo bar]');

  MT('divWithClassAndId',
      '[div div][div&attributes (my-class#my-id)][div . foo bar]');

  MT('paragraphFormatting',
      'p. [strong *foo ][strong&em _bar_][strong *]');

  MT('divFormatting',
      '[div div. ][div&strong *foo ][div&strong&em _bar_][div&strong *]');

  MT('bq.',
      '[quote bq. foo bar]',
      '',
      'Normal text.');

  MT('bq..ThenParagraph',
      '[quote bq.. foo bar]',
      '',
      '[quote More quote.]',
      'p. Normal Text');

  MT('bq..ThenH1',
      '[quote bq.. foo bar]',
      '',
      '[quote More quote.]',
      '[header&header-1 h1. Header Text]');

  MT('bc..ThenParagraph',
      '[code bc.. foo bar]',
      '',
      '[code More.]',
      'p. Normal Text');

  MT('fn1..ThenParagraph',
      '[footnote fn1.. foo bar]',
      '',
      '[footnote More.]',
      'p. Normal Text');

  MT('pre..ThenParagraph',
      '[pre pre.. foo bar]',
      '',
      '[pre More.]',
      'p. Normal Text');

  MT('footCite',
      '42.7% of all statistics are made up on the spot.[footnote-citation [[1]]]');

  MT('footCiteBogus',
      '42.7% of all statistics are made up on the spot.[[1a2]]');

  MT('footnote',
      '[footnote fn123. foo ][footnote&strong *bar*]');

  MT('table',
      '[table&table-heading |_. name |_. age|]',
      '[table |][table&strong *Walter*][table |   5  |]',
      '[table |Florence|   6  |]');

  MT('special-characters',
      'RegisteredTrademark[special-char&special-char-r (r)], ' +
      'Trademark[special-char&special-char-tm (tm)], and ' +
      'Copyright [special-char&special-char-c (c)] 2008');

  MT('cite',
      "My wife's favorite book is [cite ??The Count of Monte Cristo??] by Dumas.");

  MT('additionAndDeletion',
      'The news networks declared [deletion -Al Gore-] [addition +George W. Bush+] the winner in Florida.');

  MT('subAndSup',
      'f(x, n) = log [sub ~4~] x [sup ^n^]');

  MT('spanAndCode',
      'A [span %span element%] and [code @code element@]');

  MT('spanBogus',
      'Percentage 25% is not a span.');

  MT('citeBogus',
      'Question? is not a cite.');

  MT('codeBogus',
      'user@example.com');

  MT('subBogus',
      '~username');

  MT('supBogus',
      'foo ^ bar');

  MT('deletionBogus',
      '3 - 3 = 0');

  MT('additionBogus',
      '3 + 3 = 6');
})();
