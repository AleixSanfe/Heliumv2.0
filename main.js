var app = require('app');  // Module to control application life.

app.on('window-all-closed', function() {
  if (process.platform != 'darwin' && can_close()) {
    app.quit();
  }
});

const HMI = require(__dirname + '/bin/HMI.js');

app.on('ready', function() {

  HMI.new_window('chrome');
});

function can_close(){
  var i = 0;
  for(w in app.WINDOWS){
    i++;
  }
  return (i == 0);
}
