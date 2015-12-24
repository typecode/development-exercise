;(function(){
  'use strict';

  var TILDA_KEYCODE = 192;

  Session.setDefault('showGrid', false);
  Session.setDefault('transitionend', 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend')

  Meteor.startup(function(){
    var $document = $(document),
        $body     = $(document.body);

    $document.on('keydown', function(evnt){
      if (evnt.keyCode === TILDA_KEYCODE) {
        Session.set('showGrid', !Session.get('showGrid'));
      }
    });

    Tracker.autorun(function(){
      var showGrid = Session.get('showGrid');
      $body.toggleClass('show-grid', showGrid);
    });

    Tracker.autorun(function(){
      var openMenu = Session.get('openMenu');
      $body.toggleClass('open-menu', openMenu);
    })
  });

})();
