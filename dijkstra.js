/***********************************************************
*  Dijkstra: an implementation in javascript
*  Author: Neal Bohling
*  Date  : April 28, 2014
*  Why   : to expand my javascript knowledge and play with the d3 libraries
*
*  First we need a representation of the graph
*  Two objects:
*   - Vertex - an object to represent an intersection
*     - List of edges - limited to 4 for this version
*     - int x - for display
*     - int y - for display
*     - boolean selected
*     - boolean isBeginning
*     - boolean isEnd
*     - int distance (for calculations)
*   - Edge - a link between two edges
*     - int length
*     - vertex origin
*     - vertex destination
***************************************************************************
*
*  Program Structure:
*    Classes defined first
*    Then the mainline code
*    Lastly, the functions
*
**************************************************************************/

/*************************************
 *  OBJECTS
 ************************************/

// Vertex object constructor
// Sets all the values that we'll need
function Vertex( ) {
    this.id = "";
    this.id_name = "";
    this.edges = new Array();
    this.curEdge = 0;
    this.selected = false,
    this.isBeginning = false,
    this.isEnd = false,
    this.visited = false;
    this.previous = null;
    vertex_.x = 0;
    vertex_.y = 0;
}


function Vertex( nid ) {
    this.id = nid;
    this.edges = new Array();
    this.curEdge = 0;
    this.selected = false,
    this.isBeginning = false,
    this.isEnd = false,
    this.visited = false;
    this.previous = null;
}

// Vertex prototype
// - defines all the methods and defaults
Vertex.prototype = {
    // Set some defaults
    x:0, y:0, distance:0,
    constructor: Vertex,
    // toString - returns a string representation of the Vertex
    toString: function() {
        var toRet = "Vertex " + this.id+". Current Distance: "+this.distance+"\r\n";
        /*
        for( var i = 0; i<this.edges.length; i++ ) {
            toRet += this.edges[i].toString()+"\r\n";
        }*/
        return toRet;
    },
    // addEdge - just adds the edge to the list of edges
    addEdge: function( newEdge ) {
        if( this.curEdge < 4 ) {
            this.edges[this.curEdge] = newEdge;
            this.curEdge++;
            if( debug ) addMsg( "Adding edge to "+this.id+", count now "+this.edges.length );
        }
    },
    // test if this Vertex already connects to another Vertex
    isConnected: function( node ) {
        var toRet = false;
        for( var i=0; i<this.edges.length; i++ ) {
            if( this.edges[i] != null &&
               (this.edges[i].destination.id == node.id || this.edges[i].origin.id == node.id ) ) {
                toRet = true;
            }
        }
        // If not found
        return toRet;
    },
    // Takes in another Vertex and creates an Edge between them
    connectVertex: function( newVertex ) {
        if( debug ) addMsg( "Connecting: "+this.id+" to "+newVertex.id );
        if( !this.isConnected( newVertex ) && !newVertex.isConnected( this ) ) {
            var upEdge = new Edge( "e"+this.id+"_"+newVertex.id, this, newVertex );
            this.addEdge( upEdge );
            newVertex.addEdge( upEdge );
            if( debug ) addMsg( "Connected "+upEdge.toString() );
            return upEdge;
        }
        return null;
    },
    findEdge: function( dest ) {
        var toRet = null;
        for( var i=0; i<this.edges.length; i++ ) {
            if( this.edges[i] != null &&
               (this.edges[i].destination.id == dest.id || this.edges[i].origin.id == dest.id ) ) {
                toRet = this.edges[i];
            }
        }
        // If not found
        return toRet;
    }
};


// Edge constructor
// Sets values based on passed arguments
// Accepts between 1 and 4 arguments
//   1 - ID, any string or number
//   2&3 - Vertexes for the edge to connect
//   4 - Weight value.. Not setting this results in random values

function Edge() {
    this.id = "";
    this.weight = 10;
    this.origin = null,
    this.destination = null;
}

function Edge( newId ) {
    this.id = newId;
    this.weight = 1;
    this.origin = null,
    this.destination = null;
    if( arguments.length >= 3 ) {
        this.origin = arguments[1];
        this.destination = arguments[2];
    }
    if( arguments.length >= 4 ) {
        this.weight = arguments[3];
    } else {
        this.weight = Math.ceil( Math.random() * 10 );
    }
}

// Edge Prototype
// Defines the various methods/functions that this object has
Edge.prototype = {
    constructor: Edge,
    getOtherVertex: function( aVert ) {
        if( this.origin != null && this.origin.id == aVert.id ) return this.destination;
        else return this.origin;
    },
    toString: function() {
        return "Edge connecting "+this.origin.id + " to " + this.destination.id + " with weight "+this.weight;
    }

};


//-----------------------------------------------
// MAINLINE - main code starts here
//-----------------------------------------------

var maxWidth = 25, maxHeight = 15;
var vertices = new Array();
var edges    = new Array();
var intervalTime = 5;
var debug = false;
var randFreq = 0.75;



// First generate the vertices
// var vertexCount = 0;

/*

for( var i=0; i<maxWidth; i++ ) {
    for( var j=0; j<maxHeight; j++ ) {
        var tempVertex = new Vertex(vertexCount++);
        tempVertex.x = (i*30)+15;
        tempVertex.y = (j*30)+15;
        vertices[(i*maxHeight)+j] = tempVertex;
    }
}

if( debug ) addMsg( "Vertices built!" );

// Create edges
// Loop over the vertices and connect them with new edges
// Criteria - look forward
//   If on a corner (based on i and j) then only create two vertices
//   If not a corner, find first non-null vertex and connect to
//     Up, Down, Left, Right
//   as we progress, up and left will probably already be set, so
//   check if they exist, and then generate those that don't
//   If an edge, only create 3
var edgeCount = 0;
for( var i=0; i<maxWidth; i++ ) {
    for( var j=0; j<maxHeight; j++ ) {
        var curIx = (i*maxHeight)+j;
        var curVertex = vertices[curIx];

        // We really only need to add down and right

        // If we're not at the top row
        // Add a vertex to the upwards
        // NOte - connectVertex checks if we're already connected

        // If not the last row
        // Add down
        if( j<maxHeight-1 ) {
            // Add a 75% chance of having an edge, just for fun
            if( Math.random() < randFreq ) {
                var downIx = curIx + 1;
                edges[edgeCount++] = curVertex.connectVertex( vertices[downIx] );
            }
        }

        // If not the last column
        // Add right
        if( i<maxWidth-1) {
            // Add a 75% chance of having an edge, just for fun
            if( Math.random() < randFreq ) {
                var rightIx = curIx + maxHeight;
                edges[edgeCount++] = curVertex.connectVertex( vertices[rightIx] );
            }
        }
    }
}

if( debug ) addMsg( "Connections made!" );


// Now let's figure out how to draw it.
var chartWidth=900,
    chartHeight=650;

var xscale = d3.scale.linear()
    .domain([0, (maxWidth)*30])
    .range([0, chartWidth]);

var yscale = d3.scale.linear()
    .domain([0,(maxHeight*30)])
    .range([0,chartHeight-50]);

var radius = xscale(7);

var chart = d3.select(".chart")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

var lines = d3.select(".chart").selectAll("line").data(edges)
      .enter().append("line")
      .attr( "x1", function(d) { return xscale( d.origin.x ); } )
      .attr( "y1", function(d) { return yscale( d.origin.y ); } )
      .attr( "x2", function(d) { return xscale( d.destination.x ); } )
      .attr( "y2", function(d) { return yscale( d.destination.y ); } )
      .attr( "class", "line" )
      .attr( "id", function(d) { return d.id; } );

var weights = d3.select(".chart").selectAll(".weight").data(edges)
     .enter().append("text")
     .attr("x", function(d) {
        if( d.origin.x == d.destination.x ) {
            return xscale( d.origin.x );
        } else {
            return xscale( (d.origin.x + d.destination.x)/2 );
        } } )
     .attr("y", function(d) {
        if( d.origin.y == d.destination.y ) {
            return yscale( d.origin.y );
        } else {
            return yscale( (d.origin.y + d.destination.y) / 2 );
        } } )
     .text( function(d) { return d.weight; } )
     .attr("class", "weight" );

var circle = d3.select(".chart").selectAll("circle").data(vertices)
      .enter().append("circle")
      .attr( "r", radius )
      .attr( "class", function(d) { return d.selected?"vertex selected":"vertex"; } )
      .attr( "cx", function(d) { return xscale( d.x ); } )
      .attr( "cy", function(d) { return yscale( d.y ); } )
      .attr( "id", function(d) { return "vx"+d.id; } );


var distances = d3.select(".chart").selectAll(".distance").data(vertices)
     .enter().append("text")
     .attr("x", function(d) { return xscale( d.x-2 ); } )
     .attr("y", function(d) { return yscale( d.y+2 ); } )
     .text( function(d) { return (d.distance!=Infinity&&d.distance>0)?d.distance:""; } )
     .attr( "class" , ".distance" );

var barscale = d3.scale.linear()
    .domain([0, (maxWidth*maxHeight)])
    .range([0, chartWidth-50]);

var bardata = [0,0];
var visitedBar = d3.select(".chart").selectAll(".bar").data(bardata).enter()
    .append("rect")
    .attr("x","0")
    .attr("y", function(d,i) { return chartHeight - ((i+1)*25); } )
    .attr("height", 20 )
    .attr("class", "bar" )
    .attr("width", function(d) { return barscale(d); });

var visitedBarText = d3.select(".chart").selectAll(".bartext").data(bardata)
    .enter().append("text")
    .attr("x", function(d) { return barscale(d)+2; })
    .attr("y", function(d,i) { return chartHeight - ((i+1)*25)+11; } )
    .attr( "class", "bartext" )
    .text( function(d) { return d; } );

*/

var edges_count = 0;
var vertexCount = 0;
$("#svg_area circle").css("opacity","0");
$("#svg_area circle").each(function(){
    var id_name  = $(this).attr("id");

    var vertex_ = new Vertex();
    vertex_.curEdge = 0;
    
    vertex_.id = vertexCount;
    vertex_.id_name = id_name;
    vertex_.isBeginning = false;
    vertex_.isEnd = false;
    vertex_.selected = false;
    vertex_.visited = false;
    vertex_.x = parseInt($(this).attr("cx"));
    vertex_.y = parseInt($(this).attr("cy"));

    vertices[vertexCount] = vertex_;
    edges = new Array();

    vertex_.edges = edges;

    vertices[vertexCount] = vertex_;
    $(this).attr("id_",vertexCount);
    vertexCount++;


});


//for updating the edges
for(var i1=0;i1<vertices.length;i1++){
    for(var i2=0;i2<connection_floor_4.length;i2++){
        if(vertices[i1].id_name == connection_floor_4[i2].id){
            var edge_list = connection_floor_4[i2].edge.split(",");
            var weight_list = connection_floor_4[i2].weight.split(",");

            edges = new Array();

            for(var i3=0;i3<edge_list.length;i3++){
                var edges_ = new Edge();
                edges_.destination = vertices[i1];
                edges_.id = edge_list[i3]+"_"+2;

                
                for(var i4=0;i4<vertices.length;i4++){
                    if(vertices[i4].id_name == edge_list[i3])
                        edges_.origin = vertices[i4];
                }
                edges_.weight = weight_list[i3];

                edges.push(edges_);
                var vertex_ = vertices[i1];
                vertex_.edges = edges;
                vertices[i1] = vertex_;
            }

    }
    }
}

var vertices_final = vertices;
var start = null;
var   end = null;
var isRunning = false;

// Catch a click on the Vertex object and handle appropriately
$(".vertex").click(function() {
        if( !isRunning ) {
            vertices = vertices_final;
            $("#connected-lines").html("");
            if( debug ) addMsg( $(this).attr("id_")+" clicked" );
            var ix = parseInt($(this).attr("id_"));
            var selectstring = "#"+this.id;
            // var t = d3.select(selectstring);

            // Check if we have anything selected already
            if( !vertices[ix].selected ) {
                vertices[ix].selected = true;

                if( start == null ) {
                    // First reset everything back to zero
                    resetDijkstra();
                    start = vertices[ix];
                    start.isBeginning = true;
                    // if( t != null ) t.classed( "start", true );
                    if( debug ) addMsg( selectstring+" set as start" );
                } else if( end == null ) {
                    end = vertices[ix];
                    end.isEnd = true;
                    // if( t != null ) t.classed( "end", true );
                    if( debug ) addMsg( selectstring+" set as end" );
                }
            } else {
                if( vertices[ix].isBeginning ) {
                    vertices[ix].isBeginning = false;
                    start = null;
                    // if( t != null ) t.classed( "start", false );
                    if( debug ) addMsg( selectstring+" removed as start" );
                } else if( vertices[ix].isEnd ) {
                    vertices[ix].isEnd = false;
                    end = null;
                    // if( t != null ) t.classed( "end", false );
                    if( debug ) addMsg( selectstring+" removed as end" );
                }
            }
            if( start != null && end != null ) {
                if( debug ) addMsg( "Both set! Starting the algorithm" );

            var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
            svgimg.setAttributeNS(null,'height','2');
            svgimg.setAttributeNS(null,'width','2');
            svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', 'source.png');
            svgimg.setAttributeNS(null,'x',start.x);
            svgimg.setAttributeNS(null,'y',start.y);
            svgimg.setAttributeNS(null, 'visibility', 'visible');
            svgimg.setAttributeNS(null, 'class', 'conn-image');
            $('#connected-lines').append(svgimg);


            svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
            svgimg.setAttributeNS(null,'height','2');
            svgimg.setAttributeNS(null,'width','2');
            svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', 'desination.png');
            svgimg.setAttributeNS(null,'x',end.x);
            svgimg.setAttributeNS(null,'y',end.y);
            svgimg.setAttributeNS(null, 'visibility', 'visible');
            svgimg.setAttributeNS(null, 'class', 'conn-image');
            $('#connected-lines').append(svgimg);


                startDijkstra(start, end);

                // $('html, body').animate({
                //     scrollTop: $("#"+start.id_name).offset().top - 100
                // }, 500);


            }
        } else {
            alert( "Program running!" );
        }

    });



// Display functions
// Catch a click on the reset button and perform the reset
$("#reset").click(
    function() {
        resetDijkstra(true);
        // redrawDisplay();
    } );

//Catch a hover over a vertex and update the INFO section with Vertex info
// $(".vertex").hover(
//     function() {
//         var ix = parseInt($(this).attr("id_"));
//         $("#info").text( vertices[ix].toString() );
//     } );

$(".optional_trigger").click(
    function() {
        $(".optional").toggle(400);
    });



/*************************************
*
*  Dijkstra Functions
*  They are split in order to take
*  advantage of the setInterval method on the window.
*  StartDijkstra sets up the environment and then
*  sets the first timer. That timer will call
*  doDijkstraIteration, which will do one iteration
*  by popping the bottom node from the unvisited array
*  and updating the adjacent weights.
*
*  If the end is found at this point, no new timer will be set,
*  and the result will be printed.
*
*  If end not yet found, another timer will be set and will do
*  the next iteration
*
************************************/

// Some global variables needed for the algorithm
var found = false;     // indicates whether we've hit the end node
var unvisited = Array();         // list of unvisted vertices

// Start the algorithm
// This function will set up all the global variables
// And set the inital timer
function startDijkstra( start, end ) {
    addMsg( "Started algorithm" );
    isRunning = true;

    // Step1 - reset all vertices
    // Set distance to "infinity" and previous to null
    for( var i=0; i<vertices.length; i++ ) {
        vertices[i].distance = Infinity;
        vertices[i].previous = null;
        vertices[i].visited = false;
    }
    if( debug ) addMsg( "Starting from "+start.id );
    start.distance = 0;
    // redrawDisplay();

    // Copy the array
    unvisited = vertices.concat();
    unvisited.sort( mySort );
    found = false;

    window.setTimeout( doDijkstraIteration, intervalTime, start, end );
}

// Does one iteration of Dijkstra's -- we use this to
// Slow down the process
function doDijkstraIteration(start, end, last) {
    if( debug ) addMsg( "Iteration..." );
    // Algorithm:
    // From start node:
    //   - calculate tenative distances for all adjacent nodes (curNode dist + edge weight)
    //   - use the smaller of either the existing distance or the new tentative distance
    //   - mark the current node as visited and remove from unvisited set
    //   - If we made it to the destination, then we're done
    //   - select node with lowest tentative distance from unvisited set

    // Update the display
    // Highlight the current vertex
    // Reset the "last" vertex to visited.. We delay so that the highlighting will stay long enough to be seen
    if( last != null ) {
        highlightVertex( last, true, "visited" );
        highlightVertex( last, false, "processing" );
    }

    // Step 1 - Calculate tentative distances for adjacent vertices

    // Get the bottom vertex / vertex with the lowest distance so far
    // Also removes it from the unvisited pile
    var curVertex = unvisited.pop();

    // Test if we're done.. If we have found the END vertex, then no need to search further
    if( curVertex == end ) {
        found = true;
    } else if( curVertex != null && curVertex.distance < Infinity ) {
        if( debug ) addMsg( "Processing vertex "+curVertex.toString() );

        // Mark the vertex as in progress in the display
        highlightVertex( curVertex, true, "processing" );
        // updateBars();

        // Run over the list of edges and calculate new distances for
        // the vertices over those edges.. Relax as necessary
        for( var ex=0; ex<curVertex.edges.length; ex++ ) {
            if( curVertex.edges[ex] != null ) {
                var tentativeDistance = curVertex.distance + parseInt(curVertex.edges[ex].weight);
                try{
                    var tentativeVertex = curVertex.edges[ex].getOtherVertex( curVertex );
                if( tentativeDistance < tentativeVertex.distance ) {

                   // $("#connected-lines").append("<line x1='"+tentativeVertex.x+"' y1='"+tentativeVertex.y+"' x2='"+curVertex.x+"' y2='"+curVertex.y+"' style='stroke:rgb(255,0,0);stroke-width:5' />");

                    // var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
                    // newLine.setAttribute('id','line2');
                    // newLine.setAttribute('x1',tentativeVertex.x);
                    // newLine.setAttribute('y1',tentativeVertex.y);
                    // newLine.setAttribute('x2',curVertex.x);
                    // newLine.setAttribute('y2',curVertex.y);
                    // newLine.setAttribute('class','conn-line');
                    //  $("#connected-lines").append(newLine);

                    tentativeVertex.distance = tentativeDistance;
                    tentativeVertex.previous = curVertex;
                    // Update distance labels
                    // var temp_str = 0;

                    // for(var i1=0;i1<10000;i1++)
                    //     for(var i2=0;i2<10000;i2++)
                    // //         temp_str += i2;
                    // console.log("curVertex"+curVertex + "---"+"curVertex.id_name:"+curVertex.id_name);
                    // console.log("tentativeDistance:"+tentativeDistance);

                  //  distances.text( function(d) { return (d.distance!=Infinity&&d.distance>0)?d.distance:""; } );
                }

                }
                catch(err){

                }
            }
        }
        curVertex.visited = true;
    }

    // Re-sort the array so we can get the lowest one
    unvisited.sort( mySort );

    // See if we found it!
    if( found ) {

        if( end.distance != Infinity ) {
            // If so
            // Print out the path
            addMsg( "Path found! Distance: "+end.distance );

            // console.log("first"+start.id_name + "---"+"end:"+end.id_name + "------- dist:"+end.distance);

            // Calculate the Path by working backwards from the endpoint using the PREVIOUS pointers
            var pathBack = "";
            var cv = end;
            while( cv != start ) {
                // Mark the vertices and edges involved to show the path
              //  highlightVertex( cv, true, "path" );
              //  highlightEdge( cv.findEdge( cv.previous ), true, "path" );
                // Generate a string as well
               // pathBack = " --" + cv.findEdge( cv.previous ).weight + "-> " + cv.id + pathBack;
               console.log("cv.id_name--"+cv.id_name);
               var cv_temp = cv.previous;
               drawLineInSVG(cv,cv_temp);

                cv = cv.previous;
            }
            drawLineInSVG(cv,start);
            // Make sure to get the source included
            pathBack = cv.id + pathBack;
          //  highlightVertex( cv, true, "path" );

            // Display the results
            addMsg( pathBack );
        } else {
            addMsg( "No path found! Hit the end vertex, but distance=Infinity" );
        }

        // Reset so we can go again!
        resetDijkstra();

    } else {
        // console.log("Infinite~~~~~first"+start.id_name + "---"+"end:"+end.id_name + "------- dist:"+end.distance);
        // Check if there are still things to find
        if( unvisited.length > 0 ) {
            // Set a timer to pop and run it again at the next interval
            window.setTimeout( doDijkstraIteration, intervalTime, start, end, curVertex );
        } else {
            // In the rare case that no path exists, this will output that message
            addMsg( "No path found! Ran out of vertices to check." );
            resetDijkstra();
        }
    }
}

// resetDijkstra
// Resets all the global variables to put the simulation back in zero state
function resetDijkstra( includeDistances ) {
    // Run through all the vertices and reset the values
    for( var i=0; i<vertices.length; i++) {
        with( vertices[i] ) {
            isBeginning = false;
            isEnd = false;
            selected = false;
            visited = false;
            previous = null;
            if( includeDistances ) distance = 0;
        }
    }
    // Reset whether it is running and the start/end points
    isRunning = false;
    start = null;
    end = null;
}


/*************************************
 *  Helper Functions
 ************************************/
// Simple message processor
function addMsg( msg ) {
    $("#messages").append("<p class=\"msg\">"+msg+"</p>" );
}

// highlightVertex
// Highlights a given Vertex per the class given
// input: an Vertex object
// It will look up that object's representation and add the specified class
function highlightVertex( vertex, on, cssclass ) {
    if( vertex != null ) {
        var idname = "#vx"+vertex.id;
        // d3.select(idname).classed( cssclass, on );
    }
}

// highlightEdge
// Highlights a given edge per the class given
// input: an Edge object
// It will look up that object's representation and add the specified class
function highlightEdge( edge, on, cssclass ) {
    if( edge != null ) {
        var idname = "#"+edge.id;
        // d3.select(idname).classed( cssclass, on );
    }
}


// redrawDisplay
// Calls d3 to update the displays -
// Requires:
//   Global vars:
//     lines, circle, distances - all which are set by the createDisplay function
// function redrawDisplay() {
//     if( lines ) lines.attr( "class", "line" );
//     if( circle ) {
//         circle.attr( "class", function(d) {
//             var toRet = "vertex";
//             toRet += d.selected?" selected":"";
//             toRet += d.isBeginning?" start":"";
//             toRet += d.isEnd?" end":"";
//             return toRet;
//         } );
//     }

//     if( distances ) {
//         distances.text( function(d) { return (d.distance!=Infinity&&d.distance>0)?d.distance:""; } );
//     }
//     updateBars();
// }

// function updateBars() {
//     // Fix the scope on these - need to pull the global instead of creating our own
//     bardata[0] = vertices.length - unvisited.length;
//     bardata[1] = 0;
//     for( var i=0; i<unvisited.length; i++) {
//         if( unvisited[i].distance < Infinity ) bardata[1]++;
//     }

//     visitedBar.data(bardata).attr("width", function(d) { return barscale(d); });

//     visitedBarText.data(bardata)
//         .text( function(d,i) { return d+(i<1?" visited":" with distance"); } )
//         .attr("x", function(d) { return barscale(d)+2; });
// }


// mySort
// A quick sorting function to be passed to the Array.sort()
// This sort results in an descending list
function drawLineInSVG(start_vertex,end_vertex){
    var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('id','line2');
    newLine.setAttribute('x1',start_vertex.x);
    newLine.setAttribute('y1',start_vertex.y);
    newLine.setAttribute('x2',end_vertex.x);
    newLine.setAttribute('y2',end_vertex.y);
    newLine.setAttribute('class','conn-line');
    $("#connected-lines").append(newLine);
}

function mySort(a, b) {
    if( a == null && b == null ) return 0;
    if( a == null && b != null ) return 1;
    if( b == null && a != null ) return -1;
    if( a.distance > b.distance ) return -1;
    if( a.distance < b.distance ) return 1;
    else return 0;
}

// Quick message indicating everything is loaded!
addMsg( "Loaded! Select any two vertices to begin." );



//for the aoutocomplete

 var availableTags = [];

    for(var i1=0;i1<connection_floor_4.length;i1++){
        availableTags.push(connection_floor_4[i1].id)
    }
    $( "#search-from,#search-to" ).autocomplete({
      source: availableTags
    });

$("#from-to-submit").click(function(){
    vertices = vertices_final;
    $("#connected-lines").html("");
    var from_val = $( "#search-from" ).val();
    var to_val = $( "#search-to" ).val();
    if(from_val.length > 1 && to_val.length > 1){
        if($("#"+from_val).length == 0){
            alert("provide correct source");
            return;
        }
        if($("#"+to_val).length == 0){
            alert("provide correct destination");
            return;
        }
    }

    var ix = parseInt($("#"+from_val).attr("id_"));
    var ix2 = parseInt($("#"+to_val).attr("id_"));
    vertices[ix].selected = true;
    start = vertices[ix];
    start.isBeginning = true;
    end = vertices[ix2];
    end.isEnd = true;

    var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
    svgimg.setAttributeNS(null,'id','source-icon');
    svgimg.setAttributeNS(null,'height','2');
    svgimg.setAttributeNS(null,'width','2');
    svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', 'source.png');
    svgimg.setAttributeNS(null,'x',start.x);
    svgimg.setAttributeNS(null,'y',start.y);
    svgimg.setAttributeNS(null, 'visibility', 'visible');
    svgimg.setAttributeNS(null, 'class', 'conn-image');
    $('#connected-lines').append(svgimg);

    svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
    svgimg.setAttributeNS(null,'height','3.5');
    svgimg.setAttributeNS(null,'width','2');
    svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', 'desination.png');
    svgimg.setAttributeNS(null,'x',end.x);
    svgimg.setAttributeNS(null,'y',end.y);
    svgimg.setAttributeNS(null, 'visibility', 'visible');
    svgimg.setAttributeNS(null, 'class', 'conn-image');
    $('#connected-lines').append(svgimg);

    startDijkstra(start, end);

    scrollToMiddleFocus($("#source-icon"));

    // $('html, body').animate({
    //     scrollTop: $("#"+start.id_name).offset().top - 100
    // }, 500);
});

function scrollToMiddleFocus(element_focus){
  var el = element_focus;
  var elOffset = el.offset().top;
  var elHeight = el.height();
  var windowHeight = $(window).height();
  var offset;

  if (elHeight < windowHeight) {
    offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
  }
  else {
    offset = elOffset;
  }
  $.smoothScroll({ speed: 700 }, offset);


  var elOffsetLeft = el.offset().left;
  var elWidth = el.width();
  var windowWidth = $(window).width();
  var offsetLeft;
  var diffOffsetWidth = Math.abs(elOffsetLeft - windowWidth/2);
  if(diffOffsetWidth > 20){
      if (elWidth < windowWidth) {
        offsetLeft = elOffsetLeft - ((windowWidth / 2) - (elWidth / 2));
      }
      else {
        offsetLeft = elOffsetLeft;
      }

      $('html, #svg_area').animate({scrollLeft: offsetLeft}, 800);
  }



  
}
//var reset_clicked = false;
$( "div#svg_area" ).dblclick(function() {
      var zoom_val = parseFloat($(this).css("zoom"));
      $(this).css("zoom",zoom_val + 0.1);
});

$("#inc-zoom").click(function(){
    var zoom_val = parseFloat($("div#svg_area").css("zoom"));
    $("div#svg_area").css("zoom",zoom_val + 0.1);
});

$("#dec-zoom").click(function(){
    var zoom_val = parseFloat($("div#svg_area").css("zoom"));
    if(zoom_val > 0.15)
        $("div#svg_area").css("zoom",zoom_val - 0.1);
    else if(zoom_val < 0.15 && zoom_val > 0.02)
        $("div#svg_area").css("zoom",zoom_val - 0.02);
});

// $("div#svg_area *").click(function(event){
//     var b = event.target.getBBox(); 
//     var svg = $("#BG4-4-075"); 
//     svg.setAttribute("viewBox", b.x+" "+b.y+" "+b.width+" "+b.height);
// });

// $(document).bind( "mobileinit", function(event) {
//        $.extend($.mobile.zoom, {locked:false,enabled:true});
// });




