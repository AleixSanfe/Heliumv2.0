/*
  Class: Data Controller
*/

/*
  Imports
*/

/*
  Data
*/
const ENCRYPTOR = 'SOME BINARY ENCRYPTOR';

/*
  Functions
*/
module.exports.encryptData = (data) => {
  return toBynari(data);
}

module.exports.unencryptData = (data) => {
  return fromBynari(data);
}

function toBynari(data){
  var encrypted_data = '';
  for(char of data){

    var byte = char.charCodeAt(0).toString(2);
    var normalized_byte = normalize_byte(byte);
    var encrypted_byte = encrypt_byte(normalized_byte);
    encrypted_data = encrypted_data + encrypted_byte;
  }

  return encrypted_data
}

function fromBynari(bynari){
  var data = '';
  var i = 0;
  while(i < bynari.length){
    var byte = bynari.substring(i,i+8);
    var unencrypted_byte = encrypt_byte(byte);
    var int_char = parseInt(unencrypted_byte, 2);
    var char = String.fromCharCode(int_char);
    data = data + char;

    i = i+8;
  }
  return data;
}

function encrypt_byte(byte){
  var i=0;
  var result = '';
  for(bit of byte){
    var encryptor_bit = ENCRYPTOR[i];
    ( (bit == '0' && encryptor_bit == '0') || (bit == '1' && encryptor_bit == '1') ) ?
      result = result + '0' :
      result = result + '1' ;
    i++;
    i = i % 8;
  }

  return result;
}

function normalize_byte(byte){
  byte = ((byte.length < 8) ? normalize_byte('0'+byte) : byte);
  return byte;
}
