var HOST = "https://reqres.in"
var $li = null
var $card = null
var users = []
var user_total = 0
var item_total = 0
var PER_PAGE_V = 7
var PER_PAGE_H = 5
var current_page_v = 0

// list is loading flag (to prevent duplicates)
var v_loading = false

function getUsers() {

  $.ajax({
    url: HOST+'/api/users',
    method: 'GET',
    dataType: 'json',
    data: {
      per_page: user_total
    }
  })
  .done(function(result) {
    users = result.data
  })
}

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
    $t_card.find('[data-toggle]').attr('data-id',users[i].id)

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
    $temp.find('[data-users]').html(users_html)

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
      // vertical list is loading flag
      v_loading = true
    },
  })
  .always(function() {
    $('[data-loading="list"]').addClass('d-none')
  })
  .done(function(result) {

    item_total = result.total
    total_pages_v = result.total_pages

    if(Array.isArray(result.data))
    {
      $('#list')[is_append ? 'append' : 'html'](formatToLi(result.data))
    }
    // save current page
    current_page_v = result.page

    typeof cb === 'function' ? cb(result.page) : null
  })
  .fail(function(a,b,c) {

    $('#list').html('<li class="list-group-item">No items in list.</li>')
  })
  .always(function() {
    v_loading = false
  })
}

// GET users (for horizontal list)
$.ajax({
  url: HOST+'/api/users',
  async: false,
  method: 'GET',
  dataType: 'json',
  data: {
    per_page: PER_PAGE_H
  }
})
.done(function(result) {
  user_total = result.total
  // get all users
  getUsers()
})


// GET horizontal list item html
$.get('html/user_card.html')
  .done(function(result) {
    $card = $(result)
  })
  .fail(function() {
    // TODO handler of error
    $('[data-alert="danger"]').removeClass('d-none')
  })

// GET list item html
$.get('html/list_item.html')
  .done(function(result) {
    $li = $(result)
  })
  .fail(function() {
    // TODO handler of error
    $('[data-alert="danger"]').removeClass('d-none')
  })

$(document).ready(function() {

  // get initial page load (items per page dependent on PER_PAGE_V)
  renderVList({per_page: PER_PAGE_V})

  // lazy loading of vertical list
  $(document).scroll(function(){

    // if at the bottom of the page
    if(($(window).scrollTop() + $(window).height() + 50) >= $(document).height()) {

      // if there are still other pages left
      // and the list is not currently loading
      if(current_page_v < total_pages_v && !v_loading)
      {
        renderVList({per_page: PER_PAGE_V, page: current_page_v+1},true)
      }
    }
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

  // user info
  $('.main.card').on('click', '[data-users] [data-info]', function(){
    var id = $(this).attr('data-id')


    $.ajax({
      url: HOST+'/api/users/'+id,
      method: 'GET',
      dataType: 'json',
      beforeSend: function() {
        // show loading
        $('[data-loading="info"]').removeClass('d-none')
      }
    })
    .done(function(result) {
      var data = result.data
      // show details
      $('[data-details]').removeClass('d-none')
        .find('[data-avatar]').attr('src',data.avatar).end()
        .find('[data-firstname]').text(data.first_name).end()
        .find('[data-lastname]').text(data.last_name).end()
        .find('[data-id]').attr('data-id',data.id).end()
      // hide loading
      $('[data-loading="info"]').addClass('d-none')
    })
  })

  // delete user 
  $('[data-delete]').on('click', function() {
    // hide button
    $(this).addClass('d-none')
    // show confirmation message
    $('[data-confirm]').removeClass('d-none')
  })

  // confirm delete
  $('[data-confirm]').on('click','[data-proceed]',function(){
    var proceed = $(this).attr('data-proceed')
    var id = $(this).attr('data-id')

    if(!id)
    {
      return false
    }

    switch(proceed)
    {
      case 'no':
        // hide confirmation message
        $('[data-confirm]').addClass('d-none')
        // show delete button
        $('[data-delete]').removeClass('d-none')
        break

      // proceed with deletion
      case 'yes':
        $.ajax({
          url: HOST+'/api/users/'+id,
          method: 'DELETE',
          dataType: 'json',
          beforeSend: function() {
            $('#info_modal').find('[data-dismiss="modal"]').addClass('d-none')
          }
        })
        .always(function(a,b,c){

          // hide confirmation message
          $('[data-confirm]').addClass('d-none')
          
          // delete success
          if(c.status == 204)
          {
            // show message
            $('[data-done]').removeClass('d-none')
            setTimeout(function(){
              // show dismiss modal button
              $('#info_modal').find('[data-dismiss="modal"]').removeClass('d-none')
              // hide modal
              $('#info_modal').modal('hide')
            },1500)
          }
          else
          {
            // delete failed

            // show dismiss modal button
            $('#info_modal').find('[data-dismiss="modal"]').removeClass('d-none')

            // show delete button
            $('[data-delete]').removeClass('d-none')
          }
        })
        break
    }
  })

  $('#info_modal').on('hide.bs.modal', function() {
    // hide info
    $('[data-details]').addClass('d-none')
    // show loading
    $('[data-loading="info"]').removeClass('d-none')
    // show delete button
    $('[data-delete]').removeClass('d-none')
    // hide message
    $('[data-done]').addClass('d-none')
  })
})