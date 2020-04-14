

(function ($) {
  'use strict';
  $('.table').DataTable();
  $('textarea').wysihtml5();

})(jQuery);
function readURL(input) {
  if (input.files && input.files[0]) {

    $('.image-upload-wrap').hide();
    for (var i = 0; i < input.files.length; i++) {
      $('.d-flex').append("<div  id='img" + i + "'><img class='file-upload-image' style='width:150px; height:150px;'  src='" + URL.createObjectURL(event.target.files[i]) + "'>"
        + '<div class="image-title-wrap " ><button type="button" onclick="removeUpload(' + i + ')" class="remove-image">Remove</button></div>');
    }
    $('.file-upload-content').show();
  };


}

function removeUpload(id) {

 
  //console.log($('.file-upload-image').length);
  $('#img' + id).remove();
  if ($('.file-upload-image').length == 0) {
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
   // $('#upload_file')['0'].files={}; 
   $('#upload_file').replaceWith($('#upload_file').val('').clone(true))
  }

}
$('.image-upload-wrap').bind('dragover', function () {
  $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function () {
  $('.image-upload-wrap').removeClass('image-dropping');
});
