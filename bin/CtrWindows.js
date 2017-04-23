/*
  Class: Windows Controller
  Version: 1.0
*/

/*
  Imports
*/
var BrowserWindow = require('browser-window');
var app = require('app');

/*
  Data
*/
app.WINDOWS = {};
app.MAIN_WINDOW = '';

/*
  FUNCTIONS
*/
module.exports.event = (event,sender,data,main) => {
  var response;
  switch(event){
    case 'window_new': response = new_window(data.name,main); break;
    case 'window_focus': response = focus_window(data.name); break;
    case 'window_name': response = get_window_name(sender.browserWindowOptions.name); break;
    case 'window_self': response = get_window(sender.browserWindowOptions.name); break;
    case 'window_windows': response = {code: 200,data: app.WINDOWS}; break;
    case 'window_tab_new': response = open_tab(data.name); break;
  }

  response.event = event;
  return response;
}

function new_window(name,main){
  (app.WINDOWS[name]) ? ''  : (app.WINDOWS[name] = create_window(name,main)) ;
  (main) ? (app.MAIN_WINDOW = name) : '';

  focus_window(name);
  return {code: 200,data: app.WINDOWS[name]};
}

function create_window(name,main){
  var nw = new BrowserWindow({name: name,width: 1000, height: 625,frame:false,movable: true,icon: '/../lib/img/logo.ico',minWidth: 500,minHeight: 300});
  nw.maximize();
  (main) ? nw.loadURL(__dirname + '/../extensions/'+name+'/index.html') : nw.loadURL(__dirname + '/template/index.html');
  nw.name = name;
  nw.id = name;
  nw.openDevTools();

  nw.on('close',function(){ delete app.WINDOWS[name]; });
  nw.on('closed',function(){ nw = null; });

  return nw;
}

function focus_window(name){
  var response = {code: 200, data: app.WINDOWS[name]};
  (app.WINDOWS[name]) ? app.WINDOWS[name].focus()  : (response = {code: 404,data: null});
  return response;
}

function get_window_name(name){
  return {code: 200, data: name};
}

function get_window(name) {
  return {code: 200, data: app.WINDOWS[name]};
}


function open_tab(name) {
  var mw = app.WINDOWS[app.MAIN_WINDOW];
  var response = {code: 200, data: null};

  (mw) ? mw.send('asynchronous-reply', {code: 200, data: name,event: 'window_tab_new'}) : (response = {code: 404, data: 'Error'});
  return response;
}
