var HOST = "https://reqres.in"

function formatToLi(data) {

  if(!Array.isArray(data))
  {
    return '<li class="list-group-item d-none">No items on list.</li>'
  }

  var list_html = '';
  for (var i = 0; i < data.length; i++) {
    list_html += '<li class="list-group-item">';
    list_html += data[i].name;
    list_html += '</li>';
  }

  return list_html
}

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
    },
    data: {
      page: 1
    }
  })
  .done(function(result) {
    if(Array.isArray(result.data))
    {
      setTimeout(()=>{
        $('#list').html(formatToLi(result.data))
      },1000)
    }
  })
  .fail(function(a,b,c) {
    $('#list').html(formatToLi(null))
    console.log(a.status)
  })
})