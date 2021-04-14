'use strict';
console.log('hello');
$('#formupdate').hide();
$('#updateBtn').on('click',function(){
  $('#formupdate').toggle();
});