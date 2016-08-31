$(document).ready(function(){
  window.addEventListener('message', function(event) {
    //client sent bldg_id
    var bldg_id = event.data;
    //shiny does not respond to jquery change of inputbox, 
    //we merely change bldg_id inputbox to keep the value of bldg_id on ui and server in sync
    $("#bldg_id").val(bldg_id);
    $('label[for=bldg_id], input#bldg_id').hide();
    //instead, we send the bldg_id to server using Shiny.onInputChange
    console.log("send bldg_id " + bldg_id + " to server");
    Shiny.onInputChange("bldg_id", bldg_id);
  });
});
