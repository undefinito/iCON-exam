var HOST = "https://reqres.in"
var $li = null
var $card = null

function formatToLi(data) {

  if(!Array.isArray(data))
  {
    return '<li class="list-group-item d-none">No items on list.</li>'
  }

  var list_html = ''
  for (var i = 0; i < data.length; i++) {

    var $temp = $li.clone()
    $temp.find('[data-head]').text(data[i].name)
    $temp.find('[data-year]').text(data[i].year)
    $temp.find('[data-pantone]').text(data[i].pantone_value)

    list_html += $temp.get(0).outerHTML
  }

  return list_html
}

// GET list item html and place into variable
$.get('html/list_item.html')
  .done(function(result) {
    $li = $(result)
  })
  .fail(function() {
    // TODO handler of error
  })

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
    method: 'GET'
  })
  .done(function(result) {
    console.log(result)
  })

  // GET List <Resource>
  $.ajax({
    url: HOST+'/api/unknown',
    method: 'GET',
    beforeSend: function() {
      $('#list').children('.loading')
          .removeClass('d-none')
    }
  })
  .done(function(result) {
    if(Array.isArray(result.data))
    {
      $('#list').html(formatToLi(result.data))
    }
  })
  .fail(function(a,b,c) {
    $('#list').html(formatToLi(null))
    console.log(a.status)
  })
})