var HOST = "https://reqres.in"
var $li = null
var $card = null
var users = []

function formatToLi(data) {

  if(!Array.isArray(data))
  {
    return []
  }

  // horizontal list html
  var users_html = ''
  for (var i = 0; i < users.length; i++) {
    var $t_card = $card.clone()
    $t_card.find('[data-avatar]').attr('src',users[i].avatar)
    $t_card.find('[data-name]').text(users[i].first_name + ' ' + users[i].last_name)
    $t_card.find('[data-job]').text(users[i].job)

    users_html += $t_card.get(0).outerHTML
  }

  // generate list item html
  var list_html = ''
  for (var i = 0; i < data.length; i++) {

    var $temp = $li.clone()
    $temp.find('[data-head]').text(data[i].name)
    $temp.find('[data-year]').text(data[i].year)
    $temp.find('[data-pantone]').text(data[i].pantone_value)

    // add users html
    // $temp.find('[data-users]').html(users_html)

    list_html += $temp.get(0).outerHTML
  }

  return list_html
}

function renderVList(data,is_append,cb) {

  is_append = (is_append === true)

  // GET List <Resource>
  $.ajax({
    url: HOST+'/api/unknown',
    method: 'GET',
    dataType: 'json',
    data: data,
    beforeSend: function() {
      $('[data-loading="list"]').removeClass('d-none')
    },
  })
  .always(function() {
    $('[data-loading="list"]').addClass('d-none')
  })
  .done(function(result) {
    if(Array.isArray(result.data))
    {
      $('#list')[is_append ? 'append' : 'html'](formatToLi(result.data))
    }
    typeof cb === 'function' ? cb() : null


  })
  .fail(function(a,b,c) {

    $('#list').html('<li class="list-group-item">No items in list.</li>')
    console.log(a.status)
  })
}

// GET list item html
$.get('html/list_item.html')
  .done(function(result) {
    $li = $(result)
  })
  .fail(function() {
    // TODO handler of error
  })

// GET horizontal list item html
$.get('html/user_card.html')
  .done(function(result) {
    $card = $(result)
  })
  .fail(function() {
    // TODO handler of error
  })

$(document).ready(function() {

  // GET users (for horizontal list)
  $.ajax({
    url: HOST+'/api/users',
    method: 'GET',
    dataType: 'json',
  })
  .done(function(result) {
    console.log(result)

    users = result.data
  })

  renderVList(null,false,function() {

    renderVList({page: 2}, true, function() {
      console.log($(document).height() - $('#main_container').height())

    })

    console.log($(document).height() - $('#main_container').height())
  })

  $('#add_modal').on('hide.bs.modal', function() {
    // clear all inputs
    $('#add_form').find('input').val('')
    // remove error indicators
    $('#add_form').find('input[name]').removeClass('is-invalid')
  })

  // if input is not blank then remove indicator
  $('#add_form').find('input[name]').on('change', function() {
    var val = $(this).val()
    $(this)[val ? 'removeClass' : 'addClass']('is-invalid')
  })

  // custom dismiss button of alert
  $('[data-hide="alert"]').on('click', function() {
    $(this).closest('.alert').addClass('d-none')
  })


  // add user submit button
  $('#submit_add').on('click',function() {
    var form_raw = $('#add_form').serializeArray()
    var form_obj = {}

    for (var i = 0; i < form_raw.length; i++) {
      switch(form_raw[i].name)
      {
        case 'name':
        case 'job':
          $('#add_form').find('input[name="'+form_raw[i].name+'"]')
            [!form_raw[i].value ? 'addClass' : 'removeClass']('is-invalid')
          form_obj[form_raw[i].name] = form_raw[i].value
      }
    }

    console.log('raw:',form_raw)
    console.log('obj:',form_obj)

    if(!form_obj.name || !form_obj.job)
    {
      return false
    }

    // POST create user
    $.ajax({
      url: HOST+'/api/users',
      method: 'POST',
      dataType: 'json',
      data: form_obj,
      beforeSend: function() {
        // show modal loading indicator 
        $('[data-loading="modal"]').removeClass('d-none')
        // disable submit button
        $('#submit_add').prop('disabled',true)
        // hide all alerts
        $('[data-alert]').addClass('d-none')
      }
    })
    .always(function() {
      // hide modal loading indicator
      $('[data-loading="modal"]').addClass('d-none')
      // enable submit button again
      $('#submit_add').prop('disabled',false)
      // hide modal
      $('#add_modal').modal('hide')
    })
    .done(function(result) {
      // show success alert
      $('[data-alert="success"]').removeClass('d-none')
    })
    .fail(function() {
      // show danger alert
      $('[data-alert="danger"]').removeClass('d-none')
    })
  })

})