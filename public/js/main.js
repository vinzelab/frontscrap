jQuery(document).ready(function($) {

  // tooltip
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });

  //link row table
  $(".clickable-row").dblclick(function(){
    window.document.location = $(this).data("href");
  });

  //check selected checkbox
  var countChecked = function() {
    var n = $( "input:checked" ).length;
    $( ".badge" ).text(n);
  };
  countChecked();
  $( "input[type=checkbox]" ).on( "click", countChecked );

  $("#checkAll").change(function () {
      $("tbody input:checkbox:visible").prop('checked', $(this).prop("checked"));
      countChecked();
  });

  //Add class on checkbox
  $("table").on('click', 'input:checkbox', function() {
    $(this).closest('tr').toggleClass('checked', this.checked);
  });
  // initialization
  $('table input:checkbox:checked').closest('td').addClass('checked');

  // selected checkbox for export in csv
  $("#extract-select").click(function (event) {
    var values = [];

    $('tbody input:checkbox:checked').each(function() {

      // $(this).find("table tr").each(function(){
        values.push($(this).attr("name"));
      // });
});
console.log(values);
      $.ajax({
         url:'/getchecked',type:'post',
         dataType: "json",
         data:{content:values},
         success:function(response){
           console.log(content[0]);
         }
      });
  });

// Get value for modify scrapping settings

//search general
$('.search').keyup(function () {
          $("input:checkbox").prop('checked',false);
          countChecked();
           var rex = new RegExp($(this).val(), 'i');
           $('tbody tr').hide();
           $('tbody tr').filter(function () {
               return rex.test($(this).text());
           }).show();
           var countable=$('tbody tr:visible').length;
           $('.counter').text(countable + ' lignes trouvées');
           if(countable == '0') {$('.no-result').show();}
           else {$('.no-result').hide();}
		  });


// count line
var countline=$('tbody tr').length;
$('.countline').text(countline+' annonces trouvées');
});
