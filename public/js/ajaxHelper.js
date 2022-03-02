// This script runs on clientside

$(document).ready(function() {

    $('.showPwFormId').submit(function(e) {
        e.preventDefault();

        var id = this.id.value;

        var data = {
            id: id
        };

        $.ajax({
            type: 'POST',
            data: data,
            cache: false,
            datatype: "json",
            url: '/showpw',
            success: function(result) {

                $('#tempPw' + id).text(result);
                if (result == "*****") {
                    $('#ShowButton' + id).text('Show');
                    $('#ShowButton' + id).removeClass('btn-success');
                    $('#ShowButton' + id).addClass('btn-warning');

                } else {
                    $('#ShowButton' + id).text('Hide');
                    $('#ShowButton' + id).removeClass('btn-warning');
                    $('#ShowButton' + id).addClass('btn-success');
                }
            }
        });
    });

    $('.copyFormId').submit(function(e) {
        e.preventDefault();

        var data = {
            id: this.id.value
        };

        $.ajax({
            type: 'POST',
            data: data,
            cache: false,
            datatype: "json",
            url: '/copypw',
            success: function(result) {
                console.log("Here are the response in json format: " + result);

                if (result != "" && result != "error" && result != null) {
                    copy(result);

                    showmessage({
                        type: 'success',
                        speed: 200,
                        content: 'Pw copy'
                    });
                }
            },
            error: function(error) {
                showmessage({
                    type: 'danger',
                    speed: 200,
                    content: 'Pw not copy'
                });

                if(error != null){
                    console.log(error);
                }
            }
        });
    });


    $('#sharewithModalCenter').on('shown.bs.modal', function(e) {
        e.preventDefault();
        var target = $('#sharewithdiv');

        $.ajax({
            type: 'POST',
            cache: false,
            datatype: "json",
            url: '/sharewith',
            success: function(result) {
                console.log("Here are the response in json format: " + result);
                if (result != null) {
                    console.log("result is not null");
                    if (result.length > 0) {
                        console.log("result length > 0");
                        console.log("result length: " + result.length);
                        var resultString = "";
                        var count = 0;
                        result.forEach(element => {
                            count += 1;
                            resultString += '<div class="form-group">' +
                                '<label class="col-sm-5 col-form-label">' + element.Username + '</label>' +
                                '<button type="submit" id="' + element.Id + '" class="btn btn-primary">Share</button>' +
                                '</div>'
                        });
                        console.log("count: " + count);
                        console.log(resultString);
                        target.html(resultString);
                    }
                }
            },
            error: function(error) {
                showmessage({
                    type: 'danger',
                    speed: 200,
                    content: 'Pw not copy'
                });
            }
        });
    });
});