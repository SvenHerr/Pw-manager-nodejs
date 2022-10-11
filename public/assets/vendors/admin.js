$(function() {
  var text = $('#errorMessage').text();
  if (text) {
    showmessage({content : text });
  }

  $(document).on('click', '.delete',
                 function() {
                   var my_id_value = $(this).data('elementId');
                   $(".modal-body #elementId").val(my_id_value);
                 }),

      $(document).on('click', ".changeapppw", function() {
        var my_id_value = $(this).data('changeelement');
        $(".modal-body #changeelement").val(my_id_value);
      });
});
