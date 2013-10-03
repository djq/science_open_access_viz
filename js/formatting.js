// $(function() {

// status
var statusText = function(d){
  if(d==1){
    return 'Accepted';
  }else{
    return 'Rejected';
  }
}

var statusIcon = function(d){
  if(d==1){
    return '<div class="icon-ok-sign top-icon-accepted "></div>';
  }else{
    return '<div class="icon-minus-sign top-icon-rejected"></div>';
  }
}


// PROCESS EMAIL INFO
var emailProcesser = function(id){
  var emails = journal_files[id]['emails']
  var attachments = journal_files[id]['attachments']
  var email_string = '<h5>Email & Attachments</h5>'
  
  for(i=0; i < emails.length; i++){
    email_string += '<a href="data/journals/' + emails[i] + '" target="_blank">Email ' + (i+1).toString() + '</a>' 
    if (attachments[i] != ''){
      for(j=0; j<attachments[i].length; j++){
        email_string += ' (<a href="data/journals/' + attachments[i][j] + '" target="_blank">'+ (j+1).toString() +'</a>)  '
      }
    }
    email_string += '</br>'
  }

  return email_string;

}

// PROCESS JOURNAL METADATA
var getJournal = function(id){
  var j_name = journal_metadata[id].journal_name;
  var j_url = journal_metadata[id].journal_url;
  return '<h4>Journal: <a href="' + j_url + '" target="_blank">' + j_name + '</a></h4>';
}

var getPublisher = function(id){
  var p_name = journal_metadata[id].publisher_name;
  var p_url = journal_metadata[id].publisher_url;
  return '<b>Publisher:</b> <a href="' + p_url + '" target="_blank">' + p_name + '</a>';
}
  
var getLocations = function(id){

  $('.geo-bank').html('<b>Bank: </b><i>unknown</i>');
  $('.geo-editor').html('<b>Editor: </b><i>unknown</i>');
  $('.geo-publisher').html('<b>Publisher: </b><i>unknown</i>');
  
  for(var i=0; i < values.length; i++){
    if(values[i].id == id){
      
      if(values[i].bank != '' && values[i].bank != undefined){              
        $('.geo-bank').html( '<b>Bank: </b>' + values[i].bank);        
      }
      if(values[i].editor != '' && values[i].editor != undefined){        
        $('.geo-editor').html( '<b>Editor: </b>' + values[i].editor);
      }
      if(values[i].publisher != '' && values[i].publisher != undefined){        
        $('.geo-publisher').html( '<b>Publisher: </b>' + values[i].publisher);
      }
    }
  }
}


// });
