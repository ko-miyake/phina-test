



$(function() {
 
  //ウインドウがリサイズされたら発動
  $(window).resize(function() {
 
    var w = $('.warp').width();
    var h = $('.warp').height();

    
    $('#phina-canvas').attr('width', w);
    $('#phina-canvas').attr('height', h);
    console.log(w);

 
  });
});