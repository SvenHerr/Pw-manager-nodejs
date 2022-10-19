// This script runs on clientside

$(document).ready(function () {

    $('.showPwFormId').submit(function (e) {
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
            url: '/administration/showpw',
            success: function (result) {

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



    $('.copyFormId').submit(function (e) {
        e.preventDefault();

        var data = {
            id: this.id.value
        };

        $.ajax({
            type: 'POST',
            data: data,
            cache: false,
            datatype: "json",
            url: '/administration/copypw',
            success: function (result) {
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
            error: function (error) {
                showmessage({
                    type: 'danger',
                    speed: 200,
                    content: 'Pw not copy'
                });

                if (error != null) {
                    console.log(error);
                }
            }
        });
    });



    $('#exampleModalCenter').on('shown.bs.modal', function (e) {
        e.preventDefault();
        var target = $('#customers');
        
        $.ajax({
            type: 'POST',
            cache: false,
            datatype: "json",
            url: '/administration/getcustomers',
            success: function (result) {

                if (result === null)
                    return;

                if (result.length <= 0)
                    return;

                var resultString = '<option value="0">Allgemein</option>';
                result.forEach(element => {

                    resultString += '<option value="' + element.Id + '">' + element.Name + '</option>'
                });

                target.html(resultString);
            },
            error: function (error) {
                console.log("error: " + error);

                showmessage({
                    type: 'danger',
                    speed: 200,
                    content: 'error: Customers'
                });
            }
        });
    });



    //Load data at beginning.
        //e.preventDefault();
        var target = $('#pwlist');
        console.log("ich wurde aufgerufen");
        $.ajax({
            type: 'POST',
            cache: false,
            datatype: "json",
            url: '/administration/getpwlist',
            success: function (result) {

                if (result === null)
                    return;

                if (result.length <= 0)
                    return;

                var resultString = '';
                result.forEach(element => {

                    resultString += 
                    `
                    <tr>
                        <td class="py-1">

                        `+ 'TODO'+`

                        </td>
                        <td>
                        `+ element.Name+`
                        </td>
                        <td>
                            ` +'TODO'+`
                        </td>
                        <td>
                            `+ element.Loginname+`
                        </td>
                        <td>
                            <p style=" margin:0px;"
                                id="tempPw`+ element.Id+`">*****</p>
                        </td>

                        <td>
                            <form class="showPwFormId">

                                <input type="text" name="id"
                                    value="`+ element.Id+`" hidden>
                                <button
                                    class="nav-link btn btn-success create-new-button d-inline-block hidebutton"
                                    style="display: none !important;"
                                    id="HideButton` +element.Id+`">Hide</button>
                                <button
                                    class="nav-link btn btn-warning create-new-button d-inline-block"
                                    id="ShowButton` +element.Id+`">Show</button>

                            </form>
                        </td>
                        <td>
                            <form class="copyFormId">
                                <input type="text" name="id" id="id"
                                    value="`+ element.Id+`" hidden>
                                <button
                                    class="nav-link btn btn-success create-new-button d-inline-block">Copy</button>
                            </form>
                        </td>
                        <td>
                            <a class="nav-link btn btn-warning create-new-button d-inline-block changeapppw"
                                id="openChangeAppPassword"
                                data-changeelement="`+ element.Id+`"
                                data-toggle="modal"
                                data-target="#changeAppPwModalCenter"
                                aria-expanded="false" href="#">Change Pw</a>
                        </td>
                        <td>
                            ` +'TODO'+`
                        </td>
                        <td>
                            <a class="nav-link btn btn-danger create-new-button d-inline-block delete"
                                id="openDeletePassword"
                                data-element-id="` +element.Id+`"
                                data-toggle="modal"
                                data-target="#deletePwModalCenter"
                                aria-expanded="false" href="#">Delete</a>

                        </td>
                    </tr> `
                });

                target.html(resultString);
            },
            error: function (error) {
                console.log("error: " + error);

                showmessage({
                    type: 'danger',
                    speed: 200,
                    content: 'error: Customers'
                });
            }
        });
    


    
});
