
window.onload = function() {
  window.addEventListener('keydown', keydownfunc, true);
}

var keydownfunc = function( event ) {
  var code = event.keyCode;
    switch(code) {
    case 37: // ←
    case 38: // ↑
    case 39: // →
    case 40: // ↓
      event.preventDefault();
      console.log(code);
  }
}