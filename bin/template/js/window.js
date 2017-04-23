const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const remote = require('remote');
const app = remote.require('app');


function send(args){
	response = ipcRenderer.sendSync('synchronous-message', args);
	if(response.status == 400) return null;
	return response;
}

function get_browserwindow(){
	 var name = send({event: 'window_name', data: null}).data;
	 init(name);
	 return app.WINDOWS[name];
};
const browserwindow = get_browserwindow();

var mc_min = document.getElementById('mc_min');
mc_min.addEventListener('click',function(){
  browserwindow.minimize();
});

var mc_max = document.getElementById('mc_max');
mc_max.addEventListener('click',function(){
  ((browserwindow.isMaximized()) ? browserwindow.unmaximize() : browserwindow.maximize());
});

var mc_cls = document.getElementById('mc_cls');
mc_cls.addEventListener('click',function(){
  browserwindow.close();
});

function init(name){
	var view = document.getElementById('view');
	view.innerHTML = '<webview id="view_window" src="'+__dirname+'/../../extensions/'+name+'/index.html'+'" nodeintegration></webview>';

	var view_window = document.getElementById('view_window');
	view_window.addEventListener('dom-ready',function(){
		view_window.openDevTools();
	});

	var foo = document.getElementById('foo');
	foo.style.height = screen.height + 'px';
};
