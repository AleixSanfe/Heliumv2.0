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
    default: return null;
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

function save(){
  var encrypted_config = CtrData.encryptData(JSON.stringify(CONFIG));
  var result = fs.writeFileSync(PATH + '/config',encrypted_config);
}
