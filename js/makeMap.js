// Lots of code from:
// http://bl.ocks.org/3757125
// http://bl.ocks.org/3795040
// original arcs: http://bl.ocks.org/dwtkns/4973620/ 
// Emailed dwtkns to ask him if he is ok with us using this code, and crediting him
// to view: python -m SimpleHTTPServer 8888 &
// http://localhost:8888/

// some global vars
var svg, refresh,
    onPointHover, onPointOut, onPointClick,
    onArcHoverOver, onArcHoverOut, onArcClick,
    link_index = [],
    zoom_items_scale, zoom_items_attr;

$(function() {

var width = 5000,
    height = 5000;

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(85)
    //.rotate([-40, 40, 0])
    .scale(290);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(320);

var path = d3.geo.path().projection(proj),
    circle = d3.geo.circle();

var circle_path = d3.geo.path()
    .projection(proj)
    .pointRadius(function(d) { return d.radius; });

zoom_items_scale = [proj, sky];

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);


var swoosh = d3.svg.line()
      .x(function(d) { return d[0] })
      .y(function(d) { return d[1] })
      .interpolate("cardinal")
      .tension(.0);

var links = [],
    arcLines = [];
    

svg = d3.select("body").select('.map').append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown", mousedown);
            //.on("touchmove.drag", mousedown);

// INTERACTIVITY
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")     
    .style("opacity", 0);

// HOVER STATES
onPointHover = function(d){
    // change selected object properties
    d3.select(this)
      .style("fill", "black")
      .style("stroke", "black")

    // associated circles
    svg.selectAll(".point")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(x) {return 'black'})
      .style('fill', function(x) {return 'black'});

    // associated links
    svg.selectAll(".flyer")
        .filter(function(x){return x.id == d.id})       
        .style('stroke', function(x) { return 'black'});
          
    // show div
    div.transition()        
        .duration(200)      
        .style("opacity", .9);      
    
    div.html("Paper: #" + d.id +               
              "</br>Location: " + d.country)  
        .style("left", (d3.event.pageX - 60) + "px")     
        .style("top", (d3.event.pageY - 57) + "px")
        .style({
          "background-color": "white",
          "opacity": 0.8,
          "color": "black",
          "border-radius": "4px",
          "font-family": "'Lato', helvetica, sans-serif"
        });
  }

onArcHoverOver = function (d){
    d3.select(this)
      .style("stroke", "black")
      .attr("stroke-opacity", 1)
      .attr("stroke-width", 2); 

    // associated links
    svg.selectAll(".flyer")
        .filter(function(x){return x.id == d.id})               
        .style("stroke", "black")
        .style('stroke-width', 2);

    // associated circles
    svg.selectAll(".point")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(x) {return 'black'})
      .style('fill', function(x) {return 'black'});

    // show div
    div.transition()        
        .duration(200)      
        .style("opacity", .9);      
    div.html("Paper: #" + d.id +               
              "</br>Connection: " + d.country1 + ', ' + d.country2)  
        .style("left", (d3.event.pageX - 60) + "px")     
        .style("top", (d3.event.pageY - 57) + "px")
        .style({
          "background-color": "white",
          "opacity": 0.8,
          "color": "black",
          "border-radius": "4px",
          "font-family": "'Lato', helvetica, sans-serif"
        });    
  }

onPointOut = function(d) {     
    // change point back
    d3.select(this)
      .style("stroke", function(d) { return (d.status == 1 ? "red" : "green"); })
      .style("fill", function(d){ 
        if(d.category == 'bank' && d.status == 1){
          return 'red'
        }
        else if(d.category == 'bank' && d.status == 0){
          return 'green'
        }else{
          return 'none'
        }
      });  

    // and associated circles
    svg.selectAll(".point")      
      .style('stroke', function(x) {
        if(x.status == 1){return 'red'}                
        else if(x.status == 0){return 'green'}          
      })
      .style("fill", function(d){ 
        if(d.category == 'bank' && d.status == 1){
          return 'red'
        }
        else if(d.category == 'bank' && d.status == 0){
          return 'green'
        }else{
          return 'none'
        }
      });  

    // update associated arcs
    svg.selectAll(".flyer")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(d) { return (d.status == 1 ? "red" : "green"); })
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.8);
    
    // hide div
    div.transition()        
      .duration(500)      
      .style("opacity", 0);   

    // make sure filters are applied
    $('.btn-acc').click();
    $('.btn-acc').click();
    $('.btn-rej').click();
    $('.btn-rej').click();
}

onArcHoverOut = function (d){   
     d3.select(this)
      .style('stroke', function(d) { return (d.status == 1 ? "red" : "green"); })     
      .style('stroke-width', 1)
      .style('stroke-opacity', 0.8)
      .style("opacity", function(d) {
        return fade_at_edge(d)
      }); 

    // update associated arcs
    svg.selectAll(".flyer")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(d) { return (d.status == 1 ? "red" : "green"); })
      .style('stroke-width', 1)
      .style("opacity", function(d) {
        return fade_at_edge(d)
      });

    // update circles
    svg.selectAll(".point")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(x) {
        if(x.status == 1){ return 'red'}
        else {return 'green'}          
      })
      .style("fill", function(d){ return 'none' })
      .style("fill", function(d){ 
        if(d.category == 'bank' && d.status == 1){
          return 'red'
        }
        else if(d.category == 'bank' && d.status == 0){
          return 'green'
        }else{
          return 'none'
        }
      }); 

    // hide div
    div.transition()        
        .duration(500)      
        .style("opacity", 0);   

    // make sure filters are applied
    $('.btn-acc').click();
    $('.btn-acc').click();
    $('.btn-rej').click();
    $('.btn-rej').click();
  }

onPointClick = function(d){      

        // update sidebar 
        $('.journal').scrollTop()       
        $('.journal-title').html(getJournal(d.id));
        $('.journal-publisher').html(getPublisher(d.id));
        $(".paper-id").html('<b>Paper:</b> #' + d.id);
        $('.journal-status').html('<b>Status:</b> ' + statusText(d.status) + ' ' + statusIcon(d.status));       
        $('.journal-correspondence').html(
          emailProcesser(d.id ) +      
          '</br><a href="data/merged_emails/' + d.id + '/merged.pdf" target="_blank">View all emails</a>'              
        );

        // update locations
        getLocations(d.id);

        // update circles
        svg.selectAll(".point")
          .filter(function(x){return x.id == d.id})
          .style('stroke', function(x) {return 'black'}); 

        // update arcs
        svg.selectAll(".flyer")
          .filter(function(x){return x.id == d.id})
          .style('stroke', function(x) { return 'black'})
          .style('opacity', 1)
          .style('stroke-width', 1);
          // .style('stroke-opacity', 1); 

}


onArcClick = function (d){
        // update sidebar       
        $('.journal').scrollTop()    
        $('.journal-title').html(getJournal(d.id));
        $('.journal-publisher').html(getPublisher(d.id));
        $(".paper-id").html('<b>Paper:</b> #' + d.id);
        $('.journal-status').html('<b>Status:</b> ' + statusText(d.status) + ' ' + statusIcon(d.status));        
        $('.journal-correspondence').html(
          emailProcesser(d.id ) +      
          '</br><a href="data/merged_emails/' + d.id + '/merged.pdf" target="_blank">View all emails</a>'              
        );

        // update locations
        getLocations(d.id);

     d3.select(this)
      .style("stroke", "black")
      .style('opacity', 1)
      .style('stroke-width', 1);

    // update circles
    svg.selectAll(".point")
      .filter(function(x){return x.id == d.id})
      .style('stroke', function(x) { return 'black'})        
      .style('fill', function(x) { return 'black'});
  }

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json, "data/places.json")
    .await(ready);

function ready(error, world, places) {
  var ocean_fill = svg.append("defs").append("radialGradient")
          .attr("id", "ocean_fill")
          .attr("cx", "75%")
          .attr("cy", "25%");
      ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#ddf");
      ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#9ab");

  var globe_highlight = svg.append("defs").append("radialGradient")
        .attr("id", "globe_highlight")
        .attr("cx", "75%")
        .attr("cy", "25%");
      globe_highlight.append("stop")
        .attr("offset", "5%").attr("stop-color", "#ffd")
        .attr("stop-opacity","0.6");
      globe_highlight.append("stop")
        .attr("offset", "100%").attr("stop-color", "#ba9")
        .attr("stop-opacity","0.2");

  var globe_shading = svg.append("defs").append("radialGradient")
        .attr("id", "globe_shading")
        .attr("cx", "55%")
        .attr("cy", "45%");
      globe_shading.append("stop")
        .attr("offset","30%").attr("stop-color", "#fff")
        .attr("stop-opacity","0")
      globe_shading.append("stop")
        .attr("offset","100%").attr("stop-color", "#505962")
        .attr("stop-opacity","0.3");

  var drop_shadow = svg.append("defs").append("radialGradient")
        .attr("id", "drop_shadow")
        .attr("cx", "50%")
        .attr("cy", "50%");
      drop_shadow.append("stop")
        .attr("offset","20%").attr("stop-color", "#000")
        .attr("stop-opacity",".5")
      drop_shadow.append("stop")
        .attr("offset","100%").attr("stop-color", "#000")
        .attr("stop-opacity","0");  

  var ocean = svg.append("circle")
    .attr("cx", width / 2).attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class", "noclicks")
    .style("fill", "url(#ocean_fill)");
  
  var land = svg.append("path")
    .datum(topojson.object(world, world.objects.land))
    .attr("class", "land noclicks")
    .attr("d", path);

  // TODO: check this is not being duplicated
  var graticule = svg.append("path", ".graticule")
    .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
    .attr("class", "land boundary")
    .attr("d", path);

  var globe_highlight = svg.append("circle")
    .attr("cx", width / 2).attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class","noclicks")
    .style("fill", "url(#globe_highlight)");

  var globe_shading = svg.append("circle")
    .attr("cx", width / 2).attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class","noclicks")
    .style("fill", "url(#globe_shading)");

  zoom_items_attr = [ ocean, globe_highlight, globe_shading];

  // create links between publishers using ID match 
  places.features.forEach(function(a) {
      places.features.forEach(function(b) {
          
          // check if link from this index already made
          if (($.inArray([a.properties.id, a.properties.country, b.properties.id, b.properties.country].toString(), link_index) == -1 ) && 
              ($.inArray([b.properties.id, b.properties.country, a.properties.id, a.properties.country].toString(), link_index) == -1 ) 
            ){

            if ((a.properties.id == b.properties.id) && (a.properties.country != b.properties.country)) {

                // add link index to track connections to prevent duplicates  
                link_pairs = [a.properties.id, a.properties.country, b.properties.id, b.properties.country];                        
                link_index.push(link_pairs.toString());
                //link_index.push([b.properties.index, a.properties.index])                

                links.push({
                  source: a.geometry.coordinates,
                  target: b.geometry.coordinates,
                  status: a.properties.status,
                  id: a.properties.id,
                  country1: a.properties.country,
                  country2: b.properties.country,
                  cat1: a.properties.category,
                  cat2: b.properties.category,
                });       
            }
          }    
      });
  });

  ////////////////////////////////
  // build geoJSON features from links array
  links.forEach(function(e,i,a) {
    var feature =   { "type": "Feature", "status": e.status, "country1":e.country1, "country2":e.country2, "cat1":e.cat1, "cat2":e.cat2, "id": e.id, "geometry": { "type": "LineString", "coordinates": [e.source, e.target] }}
    arcLines.push(feature)
  })

  // arcs
  svg.append("g").attr("class","arcs")
    .selectAll("path").data(arcLines)
    .enter().append("path")
      .attr("class","arc")      
      .attr("d",path)

  // swooshes
  svg.append("g").attr("class","flyers")
    .selectAll("path").data(links)
    .enter().append("path")
    .attr("class","flyer")    
    .style('stroke', function(d) { return (d.status == 1 ? "red" : "green"); })
    .style('stroke-width', 1)
    .style('stroke-opacity', 0.8)
    //.attr('class', function(d){ if(d.status == 1){return "flyer flyers-accepted"}else{ return "flyer flyers-rejected"}})
    .attr("d", function(d) { return swoosh(flying_arc(d)) })
    .on("mouseover", onArcHoverOver)
    .on("mouseout", onArcHoverOut)
    .on("click", onArcClick);
    
  // END LINKS 
  ////////////////////////////////

// JOURNAL LOCATIONS
svg.append("g").attr("class","point_circles")
  .selectAll("path.point")
  .data(places.features)
  .enter().append("path")
    .datum(function(d) {
        r = 0;
        if     (d.properties.category == 'bank'){r = 2;}
        else if(d.properties.category == 'email'){r= 2.75;}
        else if(d.properties.category == 'loc'){r= 3.5;}
       return {type: "Point", 
       'category':d.properties.category, 'status':d.properties.status, 'id':d.properties.id, 'country':d.properties.country, coordinates: [d.geometry.coordinates[0], d.geometry.coordinates[1]], radius: r}
    })    
    .attr("class", "point")
    .style("fill", function(d){ 
      if(d.category == 'bank' && d.status == 1){return 'red';}
      else if(d.category == 'bank' && d.status == 0){return 'green';}
      else{return 'none';}
    })
    .style("stroke", function(d){ return (d.status == 1 ? 'red' : 'green')})
    .style("stroke-width", 0.5)
    .style('stroke-opacity', 0.8)
    .style('fill-opacity', 0.8)
    .attr("d", circle_path)   
    .on("mouseover", onPointHover)                  
    .on("mouseout", onPointOut)   
    .on("click", onPointClick);

  refresh();

  // zoominess!
  zoomFunction = function(increment){
    $.each(zoom_items_scale, function(index, element){element.scale(element.scale() + increment);});
    $.each(zoom_items_attr, function(index, element){element.attr('r', parseInt(element.attr('r')) + increment);});
    refresh();
  };

  //ZOOMING
  $('.leaflet-control-zoom-in').on('click', function(){zoomFunction(50)}); 
  $('.leaflet-control-zoom-out').on('click', function(){zoomFunction(-50)}); 

  zoomFunction(200);
}

function flying_arc(pts) {
  var source = pts.source,
      target = pts.target;

  var mid = location_along_arc(source, target, .5);
  var result = [ proj(source),
                 sky(mid),
                 proj(target) ]
  return result;
}

refresh = function () {

  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
 
 svg.selectAll(".point_circles")
  .selectAll("path")
      .attr("d", circle_path);
  
  svg.selectAll(".arc").attr("d", path)
    .style("opacity", function(d) {
        return fade_at_edge(d)
    })

  svg.selectAll(".flyer")
    .attr("d", function(d) { return swoosh(flying_arc(d)) })
    .style("opacity", function(d) {
      return fade_at_edge(d)
    }) 

}


function fade_at_edge(d) {
  var centerPos = proj.invert([width/2,height/2]),
      arc = d3.geo.greatArc(),
      start, end;
  // function is called on 2 different data structures..
  if (d.source) {
    start = d.source, 
    end = d.target;  
  }
  else {
    start = d.geometry.coordinates[0];
    end = d.geometry.coordinates[1];
  }
  
  var start_dist = 1.57 - arc.distance({source: start, target: centerPos}),
      end_dist = 1.57 - arc.distance({source: end, target: centerPos});
    
  var fade = d3.scale.linear().domain([-.4,0]).range([0,.4]) 
  var dist = start_dist < end_dist ? start_dist : end_dist; 

  return fade(dist)
}


function location_along_arc(start, end, loc) {
  var interpolator = d3.geo.interpolate(start,end);
  return interpolator(loc)
}

// modified from http://bl.ocks.org/1392560
var m0, o0;
function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = proj.rotate();
  d3.event.preventDefault();
}
function mousemove() {
  if (m0) {
    var lat_max = 30,
        lat_min = -50;

    var m1 = [d3.event.pageX, d3.event.pageY]
      , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
    o1[1] = o1[1] > lat_max  ? lat_max  :
            o1[1] < lat_min ? lat_min :
            o1[1];
    proj.rotate(o1);
    sky.rotate(o1);
    refresh();
  }
}
function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}


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


});
