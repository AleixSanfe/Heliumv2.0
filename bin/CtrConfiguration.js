/*
  Class: User Controller
  Version: 1.0
*/

/*
  IMPORTS
*/
const CtrData = require(__dirname + '/CtrData.js');
const CtrUser = require(__dirname + '/CtrUser.js');
const fs = require('fs');
var app = require('app');

/*
  DATA
*/
var CONFIG = null;
const PATH = __dirname + '/../data/config';

function init(){
  var input = fs.readFileSync(PATH + '/config', 'utf8');
  var input = CtrData.unencryptData(input);
  CONFIG = JSON.parse(input);
}init();

/*
  FUNCTIONS
*/
module.exports.event = (e,data) => {
  var response = {code: 404, data: null};
  switch(e){
    case 'config_get_user_logged': response = get_current_user(); break;
    case 'config_post_user_logged': response = post_current_user(data); break;
    case 'config_get_extensions': response = get_extensions(); break;
    case 'config_import_extension': response = import_extension(data); break;
    case 'config_remove_extension': response = remove_extension(data); break;
    default: response = {code: 404, data: 'Token not found'};
  }

  response.event = e;
  return response;
}

function get_current_user(){
  var response = {};
  (CONFIG.currentUser) ?
    (response.code = 200,response.data = CtrUser.event('user_get',CONFIG.currentUser).data) :
    (response.code = 404,response.data = null);
  return response;
}

function post_current_user(data){
  CONFIG.currentUser = data;
  save();
  return {code: 200,data: CONFIG.currentUser};
}

function get_extensions(){
  response = ( (CONFIG.extensions) ? {code: 200, data: CONFIG.extensions} : {code: 404,data: {}} );
  (response.code == 404) ? (CONFIG.extensions = {}) : '';
  return response;
}

function import_extension(data){
  var extension_id = createHash();
  var response = {};
  try {
    var extension_package = fs.readFileSync(data + '/package.json', 'utf8');
    extension_package = JSON.parse( extension_package );

    response = {code: 200, data: extension_package};
    fs.rename(data,__dirname + '/../extensions/' + extension_id + '/',function(err){
			if(!err){
        (CONFIG.extensions) ? '' : (CONFIG.extensions = {}) ;
        CONFIG.extensions[extension_id] = extension_package;
        save();
      }
		});
  } catch (e) { response = {code: 404, data: 'This is not a vaid extension'} }

  return response;
}

function remove_extension(id){
  var response = {code: 200,data: id};
  ( check_if_user_has_extension(id) ) ?
    (response = {code: 404, data: 'A user is using this extension'}) :
    function(){
      deleteFolderRecursive(__dirname + '/../extensions/' + id);
      delete CONFIG.extensions[id];
    }() ;

  return response;
}

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
};

function check_if_user_has_extension(id){
  const users = CtrUser.event('user_get_users');
  var result = false;
  for(user of users){
    var user_info = CtrUser.event('user_get',user).data;
    (user_info.extensions[id]) ? (result = true) : '';
  }return result;
}

function createHash(){ return '_' + Math.random().toString(36).substr(2); }

function save(){
  var encrypted_config = CtrData.encryptData(JSON.stringify(CONFIG));
  var result = fs.writeFileSync(PATH + '/config',encrypted_config);
}

function send(args){
	response = ipcRenderer.sendSync('synchronous-message', args);
	return response;
}
