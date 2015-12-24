;(function(){
  'use strict';

  var articleBgHeight = new ReactiveVar(0),
      articleBgWidth  = new ReactiveVar(0),
      titleOffsetX    = new ReactiveVar(0),
      titleOffsetY    = new ReactiveVar(0),
      windowScrollY   = new ReactiveVar(0),
      editMode        = new ReactiveVar(false),
      editTitle       = new ReactiveVar(''),
      articleRendered = new ReactiveVar(false),
      titleLines      = new ReactiveVar([]),
      articleTitle    = new ReactiveVar(''),
      articleBodyTop  = new ReactiveVar(0),
      headerLogoTop   = new ReactiveVar(0),
      backgroundImg   = new ReactiveVar(''),

      $window = $(window),

      backgrounds = [
        '/images/article-bg-0.jpg',
        '/images/article-bg-1.jpg',
        '/images/article-bg-2.jpg',
        '/images/article-bg-3.jpg',
        '/images/article-bg-4.jpg'
      ],

      $headerLogo,
      $articleBg,
      $articleTitle,
      $titleBg,
      $articleBody;

  function getElems (tmpl) {
    $headerLogo   = $('#app-header .header-logo')[0];
    $articleBg    = tmpl.find('.article-hero-bg');
    $articleTitle = tmpl.find('.article-title');
    $titleBg      = tmpl.find('#title-bg');
    $articleBody  = tmpl.find('.article-body');
  }

  function getInitialTitle () {

    var articleTitleTmp = dimsum(1).split(' '),
        articleTitleText = '';

    for (var i = 0, len = 10; i < len; i++) {
      articleTitleText += articleTitleTmp[i] + ' ';
    }

    articleTitle.set( articleTitleText );
    editTitle.set( articleTitleText );
  }

  function checkBgImgLoad () {
    var tmpImg = new Image();
    tmpImg.onload = function() { getElemBounds(); };
    tmpImg.src = backgroundImg.get();
  }

  function getElemBounds () {
    var titleBounds       = $articleTitle.getBoundingClientRect(),
        articleBgBounds   = $articleBg.getBoundingClientRect(),
        articleBodyBounds = $articleBody.getBoundingClientRect(),
        headerLogoBounds  = $headerLogo.getBoundingClientRect();

    articleBgHeight.set( articleBgBounds.width * (1280/1920) );
    articleBgWidth.set( articleBgBounds.width );
    titleOffsetX.set( titleBounds.left );
    titleOffsetY.set( titleBounds.top );
    windowScrollY.set( window.scrollY );
    articleBodyTop.set( articleBodyBounds.top );
    headerLogoTop.set( headerLogoBounds.top );
  }

  function generateSlug (string) {
    var words = string.trim().split(' '),
        processedWords = [],
        word;

    for(var i = 0, len = words.length; i < len; i++) {
      word = words[i];
      word = word.toLowerCase();
      word = word.replace(/\W/g, '');
      processedWords.push( word );
    }

    return processedWords.join( '-' );
  }

  function getTitleLines (tmpl) {
    var $tmpEl         = $('<span class="tmp" />'),
        $$articleTitle = $($articleTitle),
        titleWords     = editTitle.get().split(' '),
        currentHeight  = 0,
        line           = titleWords[0],
        fullTitle      = line,
        lines          = [];

    $$articleTitle.append( $tmpEl );

    $tmpEl.text( fullTitle );
    currentHeight = $tmpEl.height();

    for ( var i = 1, len = titleWords.length; i < len; i++ ) {
      fullTitle += ' ' + titleWords[i];
      $tmpEl.text( fullTitle );

      if ( $tmpEl.height() > currentHeight ) {
        lines.push( line.trim() );
        line = '';
        currentHeight = $tmpEl.height();
      }

      line += ' ' + titleWords[i];
    }

    $tmpEl.remove();

    lines.push( line.trim() );
    titleLines.set( lines );
  }

  function handleScroll () {
    var showLogo = ( articleBodyTop.get() - window.scrollY > headerLogoTop.get() );
    $titleBg.setAttribute('y', 0 - (titleOffsetY.get() - window.scrollY + windowScrollY.get()));
    Session.set('showLogo', showLogo);
  }

  function pickRandomBg () {
    var randomIndex = Math.floor( Math.random() * backgrounds.length );
    backgroundImg.set( backgrounds[randomIndex] );
  }

  Template.Article.events({
    'click .edit-controls .edit' : function() {
      editMode.set(true);
    },
    'click .edit-controls .cancel' : function() {
      editMode.set(false);
      editTitle.set( articleTitle.get() );
    },
    'click .edit-controls .save' : function(evnt, tmpl) {
      editMode.set(false);
      articleTitle.set( editTitle.get() );
    },
    'keyup [contenteditable]' : function(evnt) {
      editTitle.set( evnt.currentTarget.innerText );

      if ( evnt.keyCode === 13 ) {
        evnt.preventDefault();
        editMode.set(false);
        articleTitle.set( editTitle.get() );
      }
    }
  });

  Template.Article.helpers({
    articleBgHeight : function() { return articleBgHeight.get(); },
    articleBgWidth  : function() { return articleBgWidth.get(); },
    titleOffsetX    : function() { return titleOffsetX.get(); },
    titleOffsetY    : function() { return titleOffsetY.get(); },
    windowScrollY   : function() { return windowScrollY.get(); },
    editMode        : function() { return editMode.get(); },
    editTitle       : function() { return Tracker.nonreactive(function(){ return editTitle.get(); }); },
    backgroundImg   : function() { return backgroundImg.get(); },
    slug            : function() {
      return generateSlug( editTitle.get() );
    },
    getElems        : function() {
      var tmpl = Template.instance();
      setTimeout( function(){
        getElems(tmpl);
        getElemBounds();
      }, 50 );
    },
    getTitleLines : function() {
      if ( articleRendered.get() && articleTitle.get().length ) {
        getTitleLines();
      }
    },
    titleLines : function() {
      var tmpl = Template.instance();
      setTimeout( function(){
        getElems(tmpl);
        getElemBounds();
      }, 50 );
      return titleLines.get();
    },
    lineY : function(index) {
      return 77 + ( index * 72 ) + (index * 5);
    },
    articleBodyCopy: function() {
      var bodyCopy = '';

      dimsum.configure({ flavor: 'jabberwocky' });

      bodyCopy += dimsum(Math.floor(Math.random() * 2 + 2), { format: 'html' });
      bodyCopy += '<blockquote>' + dimsum.sentence(1) + '</blockquote>';
      bodyCopy += dimsum(Math.floor(Math.random() * 4 + 2), { format: 'html' });

      return bodyCopy;
    }
  });

  Template.Article.onRendered(function(){
    var tmpl = this;

    getElems(tmpl);
    getElemBounds();
    getInitialTitle();
    checkBgImgLoad();
    pickRandomBg();

    $window.on('scroll.article', handleScroll);
    $window.on('resize.article', getElemBounds);

    setTimeout( getTitleLines, 250 );
    articleRendered.set(true);
  });

  Template.Article.onDestroyed(function(){
    $window.off('scroll.article');
    $window.off('resize.article');
  });

})();
