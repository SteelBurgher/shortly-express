window.Shortly = Backbone.View.extend({
  template: Templates['layout'],

  events: {
    'click li a.index':  'renderIndexView',
    'click li a.create': 'renderCreateView',
    'click .logout': 'logout'
  },

  initialize: function(){
    console.log( 'Shortly is running' );
    $('body').append(this.render().el);

    this.router = new Shortly.Router({ el: this.$el.find('#container') });
    this.router.on('route', this.updateNav, this);

    Backbone.history.start({ pushState: true });
  },

  logout: function(e){
    e && e.preventDefault();
    var self = this;

    $.ajax('/logout', {
      method: 'POST',
      success: function(){
        // self.router.navigate('/', { trigger: true });
        window.location.reload();
      }
    });
  },

  render: function(){
    this.$el.html( this.template() );
    return this;
  },

  renderIndexView: function(e){
    e && e.preventDefault();
    this.router.navigate('/', { trigger: true });
  },

  renderCreateView: function(e){
    e && e.preventDefault();
    this.router.navigate('/create', { trigger: true });
  },

  updateNav: function(routeName){
    this.$el.find('.navigation li a')
      .removeClass('selected')
      .filter('.' + routeName)
      .addClass('selected');
  }
});
