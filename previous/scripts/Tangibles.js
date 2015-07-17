
var tangiblesList=[];
var rotation = 0.0;
var translation_x = 0.0;
var translation_y = 0.0;
var error = 2; 

// Tangibles class which store all the data of a particular Tangible
function Tangible () {

    // Name of the Tangible Ex. Stick, Leaf
	this.type = "";
	
    // Unique ID
	this.ID = 0;
	
	// The coordinates of the touch points of a tangible
	this.touchPoints = new Array(new Array());
	
	// Coordinates of the out line of a Tangible
	this.outlinePoints = new Array(new Array());
	
	// Distances between points
	this.distances = new Array();
	
	// Tangible Point DistanceMap
	this.map = [];
	
	// The Transformation Matrix
	this.transformation = [];//new Array(new TangiblePointDistanceMap());
	
	// toString() method of the Tangible class
    this.getInfo = function() {
		alert('Type:' + this.type + ' \nID:' + this.ID + ' \nTouch Points :'+this.touchPoints + ' \nOut Line Points:' +this.outlinePoints + ' \nDistances:' +this.distances + ' \nMap:'+this.map);
        return  'Type:' + this.type + ' ID:' + this.ID + ' Touch Points :'+this.touchPoints + ' Out Line Points:' +this.outlinePoints + ' Distances:' +this.distances + ' Map:'+this.map;
	};
	
	// calculate the total distance among the points of the Tangible
	this.calculateDistances= function(){
		
		// push tangiblePointDistanceMaps to map list		
		for(var i=0; i< this.touchPoints.length; i++){
			var tangiblePointDistanceMap = [];
			tangiblePointDistanceMap[0]=[this.touchPoints[i][0],this.touchPoints[i][1]];
			
			tangiblePointDistanceMap[1]=[]; // connected points
			tangiblePointDistanceMap[2]=[]; // distances
			//tangiblePointDistanceMap[3]=[];
			this.map[i]=tangiblePointDistanceMap;
			//tangiblePointDistanceMap[0]
		}
		
		// calculate distances between points and update distances array
		for(var i=0; i< this.touchPoints.length; i++){
			//this.map.push([this.touchPoints[i][0],this.touchPoints[i][1]]);
			
			var ax = this.touchPoints[i][0];    
            var ay = this.touchPoints[i][1];  
			var tpDistanceMap = this.map[i];
			
               for (var j = (i + 1); j < this.touchPoints.length; j++)
                {
                    //console.log('\nI:'+i+' J:'+j);
					// Calculate the distance between two points
					var bx = this.touchPoints[j][0];
                    var by = this.touchPoints[j][1];
                   
                    var dx = ax - bx;
                    var dy = ay - by;
                    var distance = Math.sqrt(dx * dx + dy * dy);
								
					
                    //tpDistanceMap[1].push([ax,ay]);
					tpDistanceMap[1].push([bx,by]);
					tpDistanceMap[2].push(distance);
					
					//tpDistanceMap[1].push(distance);
					
					// Saving distance to near by connectedPoint
					//this.map[i][2]=distance;
                   // this.map[j][2]=distance;
					
					// saving connectedPoints
                    //this.map[i][1]=[bx,by];
                    //this.map[j][1]=[ax,ay];
					
					//Display tangiblePointDistanceMap
					
					/*alert('I='+i+' J='+j
					+'\nNo of Touch Points'+this.touchPoints.length
					+'\nI Point:'+this.map[i][0] + '    I Connected Point:' +this.map[i][1] + '    I Distance:'+this.map[i][2]
					+'\nJ Point:'+this.map[j][0] + '    J Connected Point:' +this.map[j][1] + '    J Distance:'+this.map[j][2]);
					*/
					
					this.distances.push(distance);
                    //alert(distance);
					
                }
				//console.log("\ntpDistanceMap:"+JSON.stringify(tpDistanceMap));
				this.map[i]=tpDistanceMap;

		}
		//alert(this.getInfo());
		//return this.getInfo();
	};
	
	/*this.toJSON = function(key)
	 {
		var replacement = new Object();
		for (var val in this)
		{
			if (typeof (this[val]) === 'string')
				replacement[val] = this[val].toUpperCase();
			else
				replacement[val] = this[val]
		}
		return replacement;
	};*/
	
	//used when a tangible is being calibrated
	this.populateC= function(id,name,touches,outline)
	{
		this.ID = id;
		this.type = name;
		this.touchPoints = touches;
		this.outlinePoints = outline;
		this.calculateDistances();  //this fills the tangible point distance map
		return this;
	};
	
	//used when a tangible identified when drawing
	this.populateI= function(touches) {
		this.ID = -1;
		this.type = "unknown";
		this.touchPoints = touches;
		this.calculateDistances();  //this fills the tangible point distance map 
		return this;
	};
	
 };
 
 // Class which holds the Tangible Point Distance map of a touch point - NOT USED ANYMORE
 /*function TangiblePointDistanceMap(){
 
	// X,Y coordinates of a particular touch point
	this.point = new Array();
	
	// Distances from the touch point to all other touch points
	this.distances=[];
	
	// Connected touch points
	this.connectedPoints=new Array(new Array());
	
	// toString method of the TangiblePointDistanceMap class
	this.getInfo = function() {
        return  'point:' + this.point + ' distances:' + this.distances + ' connectedPoints:'+this.connectedPoints ;
    };
 };*/
  

// Tangible recognition and rotation algorithm
function  tangibleRecognizer(touches){
	var recognised = false;
	var tangible = new Tangible();
	//used when a tangible is being calibrated
	tangiblesList=JSON.parse(localStorage.getItem('tangibles'));
	
	// We need to have minimum of three touch points to identify the Tangible and it's orientation.
	if (touches.length>2){
		
		tangible.touchPoints=touches;
		
		tangible.calculateDistances();
		
		for(var i=0; i< this.tangiblesList.length; i++){
							
			var tmpTangible = tangiblesList[i];  
			
			var counter=0;
			
			//alert('Tangible : ' + JSON.stringify(tangible.distances) +'\n Matched with: \n' + JSON.stringify(tmpTangible.distances));
			
			for (var j = 0; j < tmpTangible.distances.length; j++){	
			
				var d = tmpTangible.distances[j];
				
				for (var k = 0; k < tangible.distances.length; k++){
				
					var d1 = tangible.distances[k];
					//alert('d:'+d+' and d1:'+d1);				
					if ( d >= d1 - error && d <= d1 + error) {   //add degree of error here
												
						counter++;
						//alert('Tangible : ' + JSON.stringify(tmpTangible.type) +'\n Distance: \n' + d +' \n with Distance:'+d1+'\n Counter :'+ counter);
						
					} else {
					
						//break;
						
					}
				}					
				
			}
			
			if ((counter == tmpTangible.distances.length) && (tangible.distances.length == tmpTangible.distances.length)){
				
				recognised = true;
				
				//need to reorientate this tangible outline
				
				//reorientate(t, newT, g, true, false);
				
				return tmpTangible;
			}
			
			//newDist = (int[])newd.Clone();				
		}
		return tangible;
	};
		
};       

//This class contains all the code for the tangibles calibration tab including realtimestylus events
function Calibration(){
	
	//holds touch points and ID's 
	var touchIDs = []; 
	
	//records the number of touches
	var tDetected = '';
	
	//touches on screen is accurate representation of what is detected at the time
	var touchesOnScreen = []; 
	
	 //offset is the amount by which to increase the outline boundary
	var offset = 0; //3;   
	
	//check list box
	var tangibleList = []; 
	
	//holds previous point - used for comparision when moving grid lines
	var prevPoint=[];    
	
	//all the tangibles that are in the xml file - to display in listbox
	var allTangibles=[];

	//used when a tangible is being calibrated
	this.recognize = function(touches,loadedTangibles){
		
		// We need to have minimum of three touch points to identify the Tangible and it's orientation.
		if (touches.length>2){
				
			
			
			
		};
	
	};
};

function Save(tangiblesList, orientation, touchPoints, type){

	//Save tangible to xml file
	var newTangible = addTangible(tangiblesList,orientation, type,touchPoints);
	tangiblesList.push(newTangible);   //add to tangibles that have been loaded for use
	//allTangibles.Add(newTangible);  //for display list
	//tangibleList.Items.Add(newTangible.ID + ": " + newTangible.type);
	
	localStorage.setItem('tangibles', JSON.stringify(tangiblesList));

	return tangiblesList;
			
};

 //Make a new tangible object
 function addTangible(tangiblesList,orientation,type,touchPoints) {
 
	
	var tangible = new Tangible();
	var id=1;
	//var tangibleName=type;
	//var touchPoints=touchPoints;
	var outlinePoints=[];
	
    /*
	//sort out the array of outlines points
	if(type=='stick')){
		//four points
		outlinePoints.Add(new Point(leftLineX - offset, topLineY - offset));
		outlinePoints.Add(new Point(rightLineX + offset, topLineY  - offset));
		outlinePoints.Add(new Point(rightLineX + offset, bottomLineY + offset));
		outlinePoints.Add(new Point(leftLineX - offset , bottomLineY + offset));
	} 
	else if (type==("Set Square")){
		//three points
		switch (orientation)
		{
			case 0:     //Top Left
				outlinePoints = getOutlineSetSquare(new Point(leftLineX - offset, topLineY - offset),new Point(rightLineX + offset, topLineY - offset),new Point(leftLineX - offset, bottomLineY + offset));
				break;
			case 1:     //Top Right
				outlinePoints = getOutlineSetSquare(new Point(rightLineX + offset, topLineY - offset), new Point(rightLineX + offset, bottomLineY + offset), new Point(leftLineX - offset, topLineY - offset));
				break;
			case 2:     //Bottom Left
				outlinePoints = getOutlineSetSquare(new Point(leftLineX - offset, bottomLineY + offset), new Point(leftLineX - offset, topLineY - offset), new Point(rightLineX + offset, bottomLineY + offset));
				break;
			case 3:     //Bottom Right
				outlinePoints = getOutlineSetSquare(new Point(rightLineX + offset, bottomLineY + offset), new Point(leftLineX - offset, bottomLineY + offset), new Point(rightLineX + offset, topLineY - offset));
				break;
		}              
	}
	else if(type.Equals("Protractor")){
		//two or three points?
		/*Point midPoint = new Point();
		switch (orientation)
		{
			case 0:     //Top                          
				midPoint.X = (rightLineX + leftLineX) / 2;
				midPoint.Y = bottomLineY + offset;
				outlinePoints = getOutlineProtractor(new Point(leftLineX - offset, topLineY - offset), new Point(rightLineX + offset, topLineY - offset), midPoint);
				break;
			case 1:     //Bottom
				midPoint.X = (rightLineX + leftLineX) / 2;
				midPoint.Y = topLineY - offset;
				outlinePoints = getOutlineProtractor(new Point(rightLineX + offset, bottomLineY + offset), new Point(leftLineX - offset, bottomLineY + offset), midPoint);
				break;
			case 2:     //Left
				midPoint.X = rightLineX + offset;
				midPoint.Y = (topLineY + bottomLineY) / 2;
				outlinePoints = getOutlineProtractor(new Point(leftLineX - offset, bottomLineY + offset), new Point(leftLineX - offset, topLineY - offset), midPoint);
				break;
			case 3:     //Right
				midPoint.X = leftLineX - offset;
				midPoint.Y = (topLineY + bottomLineY) / 2;
				outlinePoints = getOutlineProtractor(new Point(rightLineX + offset, topLineY - offset), new Point(rightLineX + offset, bottomLineY + offset), midPoint);
				break;
		}       
	}
	//else if (type.Equals("Compass"))
	//{
	//    MessageBox.Show("Compass calibration not ready");
	//}
	*/
	
	if (tangiblesList.length > 0){
		id = tangiblesList.length;
	}

	tangible=tangible.populateC(id, type, touchPoints, outlinePoints); 
	return tangible;       
};


//first time bool is to indicate if this is the first time the tangible is being recognised
function reorientate(originalT, newT, g, firsttime, freezeOutline){
            //need to change the outline points of originalT based on the location of newT's touchpoints
            //first find a matching point
			console.log('OriginalMap: '+JSON.stringify(originalT));
			console.log('New map : ' +JSON.stringify(newT));
			console.log('g : ' +g);
			console.log('firsttime : ' +firsttime);
			console.log('freezeOutline: ' +freezeOutline);
			console.log('originalT.map.length: ' +originalT.map.length);
			//alert ("originalT:"+JSON.stringify(originalT)+"\nnewT:"+JSON.stringify(newT));
            for (var l = 0; l < originalT.map.length; l++)
            {
                var d = originalT.map[l][2];
                var originalMap = originalT.map[l];
				
				console.log('originalMap['+l+'] : ' +JSON.stringify(originalMap));
				console.log('d: '+JSON.stringify(d));
				
                //foreach (TangiblePointDistanceMap newMap in newT.map) { //go through each point
				console.log('newT.map[0].length:'+newT.map[0].length);
				
                for (var s = 0; s < newT.map[0].length; s++)
                {
                    var newMap = newT.map[s];

                    var counter = 0;
                    var indexes = []; //hold the index of the corresponding original distances with newT.distances for the same point
					var indexes2 = [];
					console.log('newMap['+s+']:'+JSON.stringify(newMap[2]));
					var u;
                    for (var t=0;  t<newMap[2].length; t++)
                    {   //go through each distance related to that point
						u=newMap[2][t]; 
                        for (var k = 0; k < d.length; k++)
                        {
                            var j = d[k];
							console.log('u:'+u+'   j:'+j + '  k:'+ k);
                            if (u >= j - error && u <= j + error)
                            {
                                counter++;
                                indexes.push(k);// previous k
								indexes2.push(t);
								console.log('counter:'+counter+'  indexes:'+JSON.stringify(indexes)+'  indexes2:'+JSON.stringify(indexes2));
                            }
                        }
                    }
					console.log('counter:'+counter);
					console.log('indexes:'+JSON.stringify(indexes));
					console.log('counter:'+counter+'   d.length:'+ d.length); 
					
                    //connected points are in the same order as distances i.e distance[0] is from map.p to connectedpoints[0]
                    if (counter == d.length)
                    {
                        
						var org = [originalMap[0][0], originalMap[0][1]];
                        var org2 = [originalMap[1][indexes[0]][0], originalMap[1][indexes[0]][1]];
						console.log('org:'+JSON.stringify(org)+'   org2:'+ JSON.stringify(org2) + '  from:originalMap[1]['+indexes[0]+'][0]' );
                        //find angle betweeen these points
                        var a = org[0]- org2[0];
                        var b = org[1] - org2[1];
						console.log('a:'+a+'  b:'+b);
                        var angle = Math.atan2(b, a);
						console.log('angle:'+angle);
						
                        var new1 = newMap[0];
                        var new2 = newMap[1][indexes2[0]];
						console.log('new1:'+JSON.stringify(new1)+'   new2:'+ JSON.stringify(new2) +  '  from:newMap[1]['+indexes2[0]+']'  );
                        //find angle between these points
                        a = new1[0] - new2[0];
                        b = new1[1] - new2[1];
						console.log('a:'+a+'  b:'+b);
                        var angle2 = Math.atan2(b, a);
                        console.log('angle2:'+angle2);
						
                        var temp_rotation = angle2 - angle;
						console.log('temp_rotation:'+temp_rotation);
						
                        //normalise the rotation
                        var pi = Math.PI;
						console.log('pi:'+pi);
                        while (temp_rotation > pi)
                        {
                            temp_rotation -= pi * 2.0;
                        }
                        while (temp_rotation < -pi)
                        {
                            temp_rotation += pi * 2.0;
                        }
						console.log('temp_rotation after while:'+temp_rotation);
                        
						var pose=[];
						var new_translation_x=0;
						var new_translation_y=0;
                        //the outline only moves if the tangible has moved more than a few degrees
                        //0.09 radians ~ 5deg   - have tried 0.06 too, 0.04 ~ 2.3deg
                        if (freezeOutline && (Math.abs(rotation - temp_rotation) >= 0.09))
                        {
                            console.log('rotation > 5deg');
							//rotation = temp_rotation;
                            //this translation takes into account the translation to the origin, rotation at origin, and translation back 
                            //to the new position
                            //new_translation_x = newMap.p.X - org.X * Math.Cos(temp_rotation) + org.Y * Math.Sin(temp_rotation);
                           //new_translation_y = newMap.p.Y - org.Y * Math.Cos(temp_rotation) - org.X * Math.Sin(temp_rotation);
							new_translation_x = newMap[0][0] - org[0] * Math.cos(temp_rotation) + org[1] * Math.sin(temp_rotation);
                            new_translation_y = newMap[0][1] - org[1] * Math.cos(temp_rotation) - org[0] * Math.sin(temp_rotation);
							
							console.log('new_translation_x:'+new_translation_x);
							console.log('new_translation_y:'+new_translation_y);

                            //new_translation_x = Math.round(new_translation_x * g.DpiX / 2540.0);
                            //new_translation_y = Math.round(new_translation_y * g.DpiY / 2540.0);
							
							//console.log('translation_x:'+new_translation_x);
							//console.log('translation_y:'+new_translation_y);

                            //try to control jitter (small movements)
                            if (((Math.abs(new_translation_x - translation_x) > 0) && (Math.abs(new_translation_y - translation_y) > 0)) /*&& Math.Abs(rotation - temp_rotation) > 0.04 || firsttime*/)
                            {   
								/*	Check whether points are swapped during the recognition of touches 
									Preventing occurrences like 
									org:[30,55]   org2:[50,55]  from:originalMap[1][0][0] 
									new1:[55,65]   new2:[35,65]  from:newMap[1][2] 
									by if (pointsSwapped==true)
									
								*/
								var pointsSwapped=false;
								if(temp_rotation<-3.14 ){
									pointsSwapped=true;
								}
								console.log('pointsSwapped:'+pointsSwapped);
								if (pointsSwapped==false){
									translation_x = new_translation_x;
									translation_y = new_translation_y;
								} else
								{
									new_translation_x = new2[0]-org[0] ;
                                    new_translation_y = new2[1]-org[1] ; 
									translation_x = new_translation_x;
								    translation_y = new_translation_y;
									console.log('new_translation_x:'+translation_x);
									console.log('new_translation_y:'+translation_y);
									
								}
							
                            }
                            rotation = temp_rotation;
							
							console.log('rotation:'+rotation);

                        } else {  // this section was added to handle non rotate transformations of the tangible
						
							console.log(' rotation < 5deg');
							new_translation_x = newMap[0][0] - org[0] * Math.cos(temp_rotation) + org[1] * Math.sin(temp_rotation);
                            new_translation_y = newMap[0][1] - org[1] * Math.cos(temp_rotation) - org[0] * Math.sin(temp_rotation);
							
                            translation_x = new_translation_x;
							translation_y = new_translation_y;
							
							rotation = temp_rotation;
							console.log('new_translation_x:'+new_translation_x);
							console.log('new_translation_y:'+new_translation_y);
						}
						
						pose[0]=rotation;
						pose[1]=[2];
						pose[1][0]=translation_x;
						pose[1][1]=translation_y;
						console.log('POSE:'+JSON.stringify(pose));
                        return pose;
                    }
                }
            }
        }
