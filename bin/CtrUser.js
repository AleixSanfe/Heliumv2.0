/*
  Class: User Controller
  Version: 1.0
*/

/*
  IMPORTS
*/
const CtrData = require(__dirname + '/CtrData.js');
const fs = require('fs');
var app = require('app');

/*
  DATA
*/
var USER = null;
const PATH = __dirname + '/../data/user';

/*
  FUNCTIONS
*/
module.exports.event = (e,data) => {
  var response = {code: 404, data: null};
  switch(e){
    case 'user_register': response = register_user(data.email,data.password,data.confirmation,data.name); break;
    case 'user_log_in': response = log_in(data.email,data.password); break;
    case 'user_log_out': response = log_out(); break;
    case 'user_delete': response = delete_user(data.email,data.password); break;
    case 'user_get': response = get_user_info(data,true); break;
    case 'user_get_id': response = get_user_id(data); break;
    case 'user_get_info': response = get_logged_user_info(); break; //exc: USER is  not null;
    case 'user_get_extension': response = get_logged_user_extension(data.extension); break; //exc: USER is  not null;
    case 'user_get_extensions': response = get_logged_user_extensions(); break; //exc: USER is  not null;
    case 'user_post_info': response = post_looged_user_info(data); break; //exc: USER is  not null;
    case 'user_post_extension': response = post_looged_user_extension(data.id,data.action); break; //exc: USER is  not null;
    case 'user_post_extensions': response = post_looged_user_extensions(data); break; //exc: USER is  not null;
    case 'user_get_users': response = get_users(); break;
    default: response = {code: 404, data: 'Token not found'};
  }

  response.event = e;
  return response;
}

function get_user_id(email){
  var response = {code: 404,data: null};
  const users = get_users();
  for(user of users){
    var user_data = get_user_info(user);
    (user_data.data.info.email === email) ? (response.code = 200,response.data = user) : '';
  }
  return response;
}

function get_user_info(user,out){
  var input = fs.readFileSync(PATH + '/' + user, 'utf8');
  var input = CtrData.unencryptData(input);

  var response = {};
  (input) ? function(){
    var data = JSON.parse( input );
    response = ( (data) ? {code: 200, data: data} : {code: 404, data: 'User does not exist'} );
  }() : (response = {code: 404, data: 'User does not exist'});

  (USER) ? '' : (USER = response.data);
  (out && response.code == 200) ? (delete response.data.info.password) : '';
  return response;
}

function get_users(){
  return fs.readdirSync(PATH);
}

function validateEmail(email){
  const users = get_users();
  var r = true;
  for(user of users){
    var user_data = get_user_info(user);
    (user_data.data.info.email === email) ? (r = false) : '';
  }  return r;
}

function createHash(){ return '_' + Math.random().toString(36).substr(2); }

function register_user(email,password,confirmation,name){
  var response = {code: 404, data: 'Error'};

  return ( (email && email.length) ?
    function(){
      return ( (password && password.length && confirmation && confirmation.length) ?
        function(){
          return ( (password === confirmation) ?
            function(){
              return ( (validateEmail(email)) ?
                function(){
                    const id = createHash();
                    const new_user = {id: id, info:{email: email, password: password, name: name,picture_path: null}};
                    var enc_data = CtrData.encryptData( JSON.stringify(new_user) );
                    USER = new_user;

                    fs.writeFileSync( PATH + '/' + id,enc_data);
                    return {code: 200, data: new_user};
                }() : {code: 404, data: 'This email is already in use'}
             );
            }() : {code: 404,data: 'Password and Confirmation Password must coincide'}
         );
        }() : {code: 404, data: 'Password neither Confirmation Password can not be empty'}
     );
    }() : {code: 404, data: 'Email can not be empty'}
  );
}

function log_in(email,password){
  var response = {code: 404, data: 'Error'};

  return ( (email && email.length) ?
    function(){
      return ( (password && password.length) ?
        function(){
          const users = get_users();
          for(user of users){
            var user_data = get_user_info(user);
            if(user_data.code == 404)return user_data;
            if(user_data.data.info.email === email && user_data.data.info.password != password)return {code: 404, data: 'Wrong Password'};
            if(user_data.data.info.email === email && user_data.data.info.password === password){USER = user_data.data; return {code: 200, data: user_data.data}};
          }
          return {code: 404,data: 'User does not exist'};
        }() : {code: 404, data: 'Password can not be empty'}
     );
    }() : {code: 404, data: 'Email can not be empty'}
  );
}

function log_out(){
  USER = null;
  return {code: 200, data: null};
}

function delete_user(email,password){
  var response = {code: 404, data: 'Error'};
  const users = get_users();
  for(user of users){
    var user_data = get_user_info(user);
    if(user_data.data.info.email === email && user_data.data.info.password != password)return {code: 404, data: 'Wrong Password'};
    if(user_data.data.info.email === email && user_data.data.info.password === password){
      log_out(email,password);
      fs.unlinkSync(PATH + '/' + user);
      var response = {code: 200, data: null};
    };
  }
  return response;
}

function get_logged_user_info(){
  if(USER) return {code: 200,data: USER.info};
  else return {code: 404,data: null};
}

function get_logged_user_extension(extension){
  if(USER) return {code: 200,data: USER.extensions.modules[extension]};
  else return {code: 404,data: null};
}

function get_logged_user_extensions(){
  if(USER) return {code: 200,data: USER.extensions.extension};
  else return {code: 404,data: null};
}

function post_looged_user_extension(id,action){
  var response = {code: 200, data: id};
  (action) ? USER.extensions[id] = get_extension_info(id) :
    function(){
      (USER.extensions[id]) ? (delete USER.extensions[id]) : '';
    }() ;

  app.broadcast_message('extension_dis/enabled');

  save();
  return response;
}

function post_looged_user_extensions(extensions){
  var response = {code: 200, data: extensions};
  (USER && extensions) ? (USER.extensions = extensions,save()) : (response = {code: 404, data: 'No user logged'});
  return response;
}

function save(){
  var encrypted_user = CtrData.encryptData(JSON.stringify(USER));
  var result = fs.writeFileSync(PATH + '/' + USER.id,encrypted_user);
}

function get_extension_info(id){
  var extension_package = fs.readFileSync(__dirname + '/../extensions/'+id+'/package.json', 'utf8');
  extension_package = JSON.parse( extension_package );

  var info = {};
  info.id = id;
  (extension_package.name) ? (info.name = extension_package.name) : '';
  (extension_package.type) ? (info.type = extension_package.type) : '';

  return info;
}
