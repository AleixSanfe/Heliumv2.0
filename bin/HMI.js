/*
  Class: Helium Module Interface
  Version: 1.0
*/

/*
  IMPORTS
*/
const electron = require('electron');

/*
  DATA
*/
const IPCMain = electron.ipcMain;
const CtrConfiguration = require(__dirname + '/CtrConfiguration.js');
const CtrUser = require(__dirname + '/CtrUser.js');
const CtrWindows = require(__dirname + '/CtrWindows.js');

/*
  FUNCTIONS
*/
IPCMain.on('synchronous-message', (event, args) => {
  var event_target = args.event.split('_')[0];
  var response = {code: 404,data: null};

  switch(event_target){
    case 'config': response = CtrConfiguration.event(args.event,args.data); break;
    case 'user': response = CtrUser.event(args.event,args.data); break;
    case 'window': response = CtrWindows.event(args.event,event.sender,args.data); break;
  }

  event.returnValue = response;
});

module.exports.new_window = (name) => {
  CtrWindows.event('window_new',null,{name: name});
}
