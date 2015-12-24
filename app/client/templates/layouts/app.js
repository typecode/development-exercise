;(function(){
  'use strict';

  Session.setDefault('showLogo', true);
  Session.set('openMenu', false);

  Template.AppLayout.events({
    'click .toggle-menu' : function(evnt, tmpl) {
      var $toggleMenu = $(evnt.currentTarget),
          openMenu = !Session.get('openMenu');

      $toggleMenu.toggleClass('open', openMenu);
      Session.set('openMenu', openMenu);
    }
  });

  Template.AppLayout.helpers({
    headerClasses: function() {
      var headerClasses = [];

      if( Session.get('showLogo') ) {
        headerClasses.push('show-logo');
      }

      return headerClasses.join(' ');
    },

    showMenu: function() { return Session.get('openMenu'); },

    articles: function() {
      var articles = [];
      for ( var i = 0, len = 5; i < len; i++ ){
        articles.push( dimsum.sentence(1) );
      }
      return articles;
    }
  });

  Template.AppLayout.uihooks({
    '#app-nav' : {
      container: '.app-main',
      insert: function(node, next, tmpl) {
        var $node = $(node);
        $node.insertBefore(next);

        requestAnimationFrame(function(){
          $node.addClass('transition-in');
        });
      },
      remove: function(node) {
        var $node = $(node);

        $node.on( Session.get('transitionend'), function(){
          $node.remove();
        });

        $node.removeClass('transition-in');
      }
    }
  });

})();
