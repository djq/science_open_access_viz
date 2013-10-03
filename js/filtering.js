// $(function() {

// store all of these statuses (stati?) in a dictionary 
var show = {acc:1, rej:1, bank:1, email:1, loc:1}

// var cat_filter = function (d, show_status, cat){
  
//   if (show_status == 1){
//     return true
//   }
//   else if((show_status == 0) && (d.cat1 == cat || d.cat2 == cat)){  
//     return false
//   }
//   else if((show_status == 0) && (d.category == cat)){ 
//     return false
//   }
//   else{
//     return true
//   }
// }

// FILTERS
// TODO: roll into one, if I could pass args in properly
var bank_filter = function (d){

  if (show.bank == 1){
    return true
  }
  else if((show.bank == 0) && (d.cat1 == 'bank' || d.cat2 == 'bank')){  
    return false
  }
  else if((show.bank == 0) && (d.category == 'bank')){ 
    return false
  }
  else{
    return true
  }
}

var email_filter = function (d){
  if (show.email == 1){
    return true
  }
  else if((show.email == 0) && (d.cat1 == 'email' || d.cat2 == 'email')){    
    return false
  }
  else if((show.email == 0) && (d.category == 'email')){ 
    return false
  }
  else{
    return true
  }
}

var loc_filter = function (d){
  if (show.loc == 1){
    return true
  }
  else if((show.loc == 0) && (d.cat1 == 'loc' || d.cat2 == 'loc')){    
    return false
  }
  else if((show.loc == 0) && (d.category == 'loc')){ 
    return false
  }
  else{
    return true
  }
}
// SORRY!!!!!!!!!!
//////////////////


// function to show/hide things
// using the "show" variable order as a hierarchy
var showHide = function(){

  // acc/rej cases

  // acc
  if(show.acc == 1){
    // show all accepted
    svg.selectAll('.flyer')
      .filter(function(d) { return d.status == 1 })  
      .filter(bank_filter) 
      .filter(email_filter)
      .filter(loc_filter)    
      .style('stroke-opacity', 1)
      .on("mouseover", onArcHoverOver)
      .on("mouseout", onArcHoverOut)
      .on("click", onArcClick);

    svg.selectAll('.arc')
      .filter(function(d) { return d.status == 1 })  
      .filter(bank_filter) 
      .filter(email_filter)
      .filter(loc_filter)   
      .style('stroke-width', 4);

     svg.selectAll('.point')
      .filter(function(d) { return d.status == 1 })  
      .filter(bank_filter) 
      .filter(email_filter)  
      .filter(loc_filter)       
      .style('stroke-opacity', 1)  
      .style('opacity', 1)
      .style("fill", function(d){ return (d.category == 'bank' ? 'red' : 'none')});

    // for clickable points, just filter by id + 
    svg.selectAll('.point')
      .filter(function(d) { return d.status == 1 }) 
      .on("mouseover", onPointHover)  
      .on("mouseout", onPointOut)   
      .on("click", onPointClick)

  }else if(show.acc == 0){
    // hide everything that was accepted and remove all mouse events
    svg.selectAll('.flyer')
      .filter(function(d) { return d.status == 1 })      
      .style('stroke-opacity', 0)
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null);

    svg.selectAll('.arc')
      .filter(function(d) { return d.status == 1 })      
      .style('stroke-width', 0); 

    svg.selectAll('.point')
      .filter(function(d) { return d.status == 1 })          
      .style('stroke-opacity', 0)
      .style('opacity', 0)
      .style('fill', 'none')
      .on("mouseover", null)  
      .on("mouseout", null)   
      .on("click", null);  
  }

  // rej
  if(show.rej == 1){
    // show all accepted
    svg.selectAll('.flyer')
      .filter(function(d) { return d.status == 0 })  
      .filter(bank_filter) 
      .filter(email_filter)
      .filter(loc_filter)    
      .style('stroke-opacity', 0.9)
      .on("mouseover", onArcHoverOver)
      .on("mouseout", onArcHoverOut)
      .on("click", onArcClick)

     svg.selectAll('.arc')
      .filter(function(d) { return d.status == 0 })  
      .filter(bank_filter) 
      .filter(email_filter)
      .filter(loc_filter)   
      .style('stroke-width', 4);  

     svg.selectAll('.point')
      .filter(function(d) { return d.status == 0 })  
      .filter(bank_filter) 
      .filter(email_filter)  
      .filter(loc_filter)       
      .style('stroke-opacity', 1)  
      .style('opacity', 1)
      .style("fill", function(d){ return (d.category == 'bank' ? 'green' : 'none')})
      .on("mouseover", onPointHover)  
      .on("mouseout", onPointOut)   
      .on("click", onPointClick)

  }else if(show.rej == 0){
    // hide everything that was accepted and remove all mouse events
    svg.selectAll('.flyer')
      .filter(function(d) { return d.status == 0 })      
      .style('stroke-opacity', 0)
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null);

     svg.selectAll('.arc')
      .filter(function(d) { return d.status == 0 })      
      .style('stroke-width', 0);   

    svg.selectAll('.point')
      .filter(function(d) { return d.status == 0 })          
      .style('stroke-opacity', 0)
      .style('opacity', 0)
      .style('fill', 'none')
      .on("mouseover", null)  
      .on("mouseout", null)   
      .on("click", null);  
  }
  
}

// HIGHEST LEVEL
// show hide acc
$('.btn-acc').click(
    function(){
        $('.btn-acc').button('toggle');
        if($('.btn-acc').hasClass('active')){
          show.acc = 1;
          showHide();
        }else{
          show.acc = 0;
          showHide();
        }      
    } 
);

// show hide rej
$('.btn-rej').click(
    function(){
        $('.btn-rej').button('toggle');
        if($('.btn-rej').hasClass('active')){
          show.rej = 1;     
          showHide();      
        }else{          
          show.rej = 0;
          showHide();
        }      
    } 
);


// BANK
$('.btn-bank').click(
    function(){
        $('.btn-bank').button('toggle');
        if($('.btn-bank').hasClass('active')){
          show.bank = 1;
          showHide();      
        }else{          
          show.bank = 0;
          showHide();
          // AHHHHH!
          $('.btn-acc').click();
          $('.btn-acc').click();
          $('.btn-rej').click();
          $('.btn-rej').click();
        }      
    } 
);

// EDITOR
$('.btn-editor').click(
    function(){
        $('.btn-editor').button('toggle');
        if($('.btn-editor').hasClass('active')){
          show.email = 1;
          showHide();      
        }else{          
          show.email = 0;
          showHide();
          // AHHHHH!
          $('.btn-acc').click();
          $('.btn-acc').click();
          $('.btn-rej').click();
          $('.btn-rej').click();
        }      
    } 
);

// PUBLISHER
$('.btn-publisher').click(
    function(){
        $('.btn-publisher').button('toggle');
        if($('.btn-publisher').hasClass('active')){
          show.loc = 1;
          showHide();      
        }else{          
          show.loc = 0;
          showHide();
          // AHHHHH!
          $('.btn-acc').click();
          $('.btn-acc').click();
          $('.btn-rej').click();
          $('.btn-rej').click();
        }      
    } 
);




// });
