var app = require('app');  // Module to control application life.

app.on('window-all-closed', function() {
  if (process.platform != 'darwin' && app.WINDOWS.length == 0) {
    app.quit();
  }
});

const HMI = require(__dirname + '/bin/HMI.js');

app.on('ready', function() {

  HMI.new_window('chrome');
});
