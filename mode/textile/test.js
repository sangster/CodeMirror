// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function() {
  var mode = CodeMirror.getMode({tabSize: 4}, 'textile');
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }

  MT('simpleParagraphs',
      'Some text.',
      '',
      'Some more text.');

  /*
   * Phrase Modifiers
   */

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

  MT('simpleLink',
      '[link "CodeMirror":http://codemirror.net]');

  MT('referenceLink',
      '[link "CodeMirror":code_mirror]',
      'Normal Text.',
      '[link-definition [[code_mirror]]http://redcloth.org]');

  MT('footCite',
      '42.7% of all statistics are made up on the spot.[footnote-citation [[1]]]');

  MT('footCiteBogus',
      '42.7% of all statistics are made up on the spot.[[1a2]]');

  MT('special-characters',
          'RegisteredTrademark[special-char (r)], ' +
          'Trademark[special-char (tm)], and ' +
          'Copyright [special-char (c)] 2008');

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

  MT('image',
      'An image: [image !http://www.example.com/image.png!]');

  MT('imageWithAltText',
      'An image: [image !http://www.example.com/image.png (Alt Text)!]');

  MT('imageWithUrl',
      'An image: [image !http://www.example.com/image.png!:http://www.example.com/]');

  /*
   * Headers
   */

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

  MT('h7Bogus',
      'h7. foo');

  MT('multipleHeaders',
      '[header&header-1 h1. Heading 1]',
      '',
      'Some text.',
      '',
      '[header&header-2 h2. Heading 2]',
      '',
      'More text.');

  MT('h1inline',
      '[header&header-1 h1. foo ][header&header-1&em _bar_][header&header-1  baz]');

  /*
   * Lists
   */

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

  MT('definitionList',
      '[definition-list - coffee := Hot ][definition-list&em _and_][definition-list  black]',
      '',
      'Normal text.');

  MT('definitionListSpan',
      '[definition-list - coffee :=]',
      '',
      '[definition-list Hot ][definition-list&em _and_][definition-list  black =:]',
      '',
      'Normal text.');

  MT('boo',
      '[definition-list - coffee := Hot and black]',
      '[definition-list - tea := Also hot, but a little less black]',
      '[definition-list - milk :=]',
      '[definition-list Nourishing beverage for baby cows.]',
      '',
      '[definition-list Cold drink that goes great with cookies. =:]');

  /*
   * Attributes
   */

  MT('divWithAttribute',
      '[div div][div&attributes (#my-id)][div . foo bar]');

  MT('divWithAttributeAnd2emRightPadding',
      '[div div][div&attributes (#my-id)((][div . foo bar]');

  MT('divWithClassAndId',
      '[div div][div&attributes (my-class#my-id)][div . foo bar]');

  MT('paragraphWithCss',
      'p[attributes {color:blue;letter-spacing:.5em}]. Spacey blue');

  MT('paragraphNestedStyles',
      'p. [strong *foo ][strong&em _bar_][strong *]');

  MT('paragraphWithLanguage',
      'p[attributes [[fr]]]. Parlez-vous français?');

  MT('paragraphLeftAlign',
      'p[attributes <]. Left');

  MT('paragraphRightAlign',
      'p[attributes >]. Right');

  MT('paragraphRightAlign',
      'p[attributes =]. Center');

  MT('paragraphJustified',
      'p[attributes <>]. Justified');

  MT('paragraphWithLeftIndent1em',
      'p[attributes (]. Left');

  MT('paragraphWithRightIndent1em',
      'p[attributes )]. Right');

  MT('paragraphWithLeftIndent2em',
      'p[attributes ((]. Left');

  MT('paragraphWithRightIndent2em',
      'p[attributes ))]. Right');

  MT('paragraphWithLeftIndent3emRightIndent2em',
      'p[attributes ((())]. Right');

  MT('divFormatting',
      '[div div. ][div&strong *foo ][div&strong&em _bar_][div&strong *]');

  MT('phraseModifierAttributes',
      'p[attributes (my-class)]. This is a paragraph that has a class and' +
      ' this [em _][em&attributes (#special-phrase)][em emphasized phrase_]' +
      ' has an id.');

  /*
   * Layouts
   */

  MT('paragraphLayouts',
      'p. This is one paragraph.',
      '',
      'p. This is another.');

  MT('div',
      '[div div. foo bar]');

  MT('pre',
      '[pre pre. Text]');

  MT('bq.',
      '[quote bq. foo bar]',
      '',
      'Normal text.');

  MT('footnote',
      '[footnote fn123. foo ][footnote&strong *bar*]');

  /*
   * Spanning Layouts
   */

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
      '[code bc.. # Output "I love Ruby"]',
      '[code say = "I love Ruby"]',
      '[code puts say]',
      '',
      '[code # Output "I *LOVE* RUBY"]',
      '[code say[[\'love\']] = "*love*"]',
      '[code puts say.upcase]',
      '',
      'p. And that is how you do it.');

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

  /*
   * Tables
   */

  MT('table',
      '[table&table-heading |_. name |_. age|]',
      '[table |][table&strong *Walter*][table |   5  |]',
      '[table |Florence|   6  |]',
      '',
      'Normal text.');

  MT('tableWithAttributes',
      '[table&table-heading |_. name |_. age|]',
      '[table |][table&attributes /2.][table  Jim |]',
      '[table |][table&attributes \\2{color: red}.][table  Sam |]');

  /*
   * HTML
   */

  MT('html',
      '[html <div id="shopping-cart">]',
      '[html <form action="form_action" method="get">]',
      '',
      '[header&header-3 h3. Your cart]',
      '',
      '[variable-2 * Item one]',
      '[variable-2 * Item two]',
      '',
      '[html <p><input type="submit" value="Check Out" /></p>]',
      '',
      '[html </form>]',
      '[html </div>]');

  MT('inlineHtml',
      'I can use HTML directly in my [html <span class="youbetcha">Textile</span>].');

  /*
   * No-Textile
   */

  MT('notextile',
    '[notextile notextile. This has *no* textile formatting, see?]');

  MT('notextileInline',
      'Use [notextile ==*asterisks*==] to say something [strong *strongly*].');
})();
