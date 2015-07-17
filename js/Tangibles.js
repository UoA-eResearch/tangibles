
var tangiblesList=[];
var identifiedTangiblesList=[];
var identifiedTangiblesListIndex=-1;
var rotation = 0.0;
var translation_x = 0.0;
var translation_y = 0.0;
var error = 10; 

// Tangibles class which store all the data of a particular Tangible
function Tangible () {

    // Name of the Tangible Ex. Stick, Leaf
	this.type = "";
	
    // Unique ID
	this.ID = 0;

	this.name= "";
	
	// The coordinates of the touch points of a tangible
	this.touchPoints = new Array(new Array());
	
	// Coordinates of the out line of a Tangible
	this.outlinePoints = new Array(new Array());
	
	// Distances between points
	this.distances = new Array();

    // angles between lines
    this.angles = new Array();

    // angle that creates with center of the trangle 0,0 and the touch point which creates the biggest angle
    this.biggestAnglePoint=[];
	
	// Tangible Point DistanceMap
	this.map = [];

	// Center coordinates
    this.center = [];
	
	// The Transformation Matrix
	this.transformation = [];//new Array(new TangiblePointDistanceMap());

	this.size=[];

	
	// toString() method of the Tangible class
    this.getInfo = function() {
		alert('Type:' + this.name + ' \nID:' + this.ID + ' \nTouch Points :'+this.touchPoints + ' \nOut Line Points:' +this.outlinePoints + ' \nDistances:' +this.distances + ' \nMap:'+this.map);
        return  'Type:' + this.name + ' ID:' + this.ID + ' Touch Points :'+this.touchPoints + ' Out Line Points:' +this.outlinePoints + ' Distances:' +this.distances + ' Map:'+this.map;
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
			//this.map[i]=tangiblePointDistanceMap;

		}
		
		// calculate distances between points and update distances array
		for(var i=0; i< this.touchPoints.length; i++){
			
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
								
					
                    // Disabled MAP
					//tpDistanceMap[1].push([bx,by]);
					//tpDistanceMap[2].push(distance);
					

					this.distances.push(distance);
                    //alert(distance);



                   // The angle of a triangle can be calculated from its sides


                }


				//console.log("\ntpDistanceMap:"+JSON.stringify(tpDistanceMap));
				//this.map[i]=tpDistanceMap;
		}

		console.log('distances.length:'+this.distances.length);
		 if(this.distances.length==3){

            var x=this.distances[0];
            var y=this.distances[1];
            var z=this.distances[2];

            console.log('x:'+x + ' y:'+y + ' z:'+z);

            var a1 = Math.acos((x*x + z*z - y*y)/(2*x*z));
            var a2 = Math.acos((y*y + z*z - x*x)/(2*y*z));
            var a3 = Math.acos((x*x + y*y - z*z)/(2*x*y));

            console.log('a1:'+a1 + ' a2:'+a2 + ' a3:'+a3);

            this.angles.push(a1);
            this.angles.push(a2);
            this.angles.push(a3);

            console.log('touch Points:'+ this.touchPoints);
            var centerX=(this.touchPoints[0][0]+this.touchPoints[1][0]+this.touchPoints[2][0])/3;
            var centerY=(this.touchPoints[0][1]+this.touchPoints[1][1]+this.touchPoints[2][1])/3;

            console.log('centerX:'+centerX + ' centerY:'+centerY);

             this.center[0]=centerX;
             this.center[1]=centerY;

             var maxi = this.distances.indexOf(Math.max.apply(Math, this.distances));

             console.log('maxi:'+maxi);

             if (maxi==2){
                this.biggestAnglePoint=this.touchPoints[0];
             } else if (maxi==1){
                this.biggestAnglePoint=this.touchPoints[1];
             } else if (maxi==0){
                this.biggestAnglePoint=this.touchPoints[2];
             }

             console.log('biggestAnglePoint:'+ this.biggestAnglePoint);

         }

	};


	
	//used when a tangible is being calibrated
	this.populateC= function(id,name,touches,outline,type,size)
	{
		this.ID = id;
		this.name = name;
		this.type = type;
		this.size = size;
		this.touchPoints = touches;
		this.outlinePoints = outline;
		this.calculateDistances();  //this fills the tangible point distance map
		console.log(JSON.stringify(this));
		return this;
	};
	
	//used when a tangible identified when drawing
	this.populateI= function(touches) {
		this.ID = -1;
		this.name = "unknown";
		this.touchPoints = touches;
		this.calculateDistances();  //this fills the tangible point distance map
		return this;
	};
	
 };
 

// Add identified tangible to the list to the first time
function  addIdentifiedTangibles(tangible,imageElementID){
	var arrayLength=identifiedTangiblesList.length;
	identifiedTangiblesList[arrayLength]=[5];
	identifiedTangiblesList[arrayLength][0]=imageElementID; // Image Element ID
	identifiedTangiblesList[arrayLength][1]=tangible; 		// Tangible Object
	identifiedTangiblesList[arrayLength][2]=[];   			// Latest Touch points
	identifiedTangiblesList[arrayLength][3]=[2]; 			// Center of the Tangible
	identifiedTangiblesList[arrayLength][4]=[]; 			// Orientation Info [orientation,[translationX,TranslationY]]
	//identifiedTangiblesList[arrayLength][2]=newTouches[0][0];
	console.log('successfully added the '+ identifiedTangiblesList[arrayLength][1].name+' to identifiedTangiblesList['+ arrayLength+']');
	return arrayLength;
} 

// update the new orientation of the tangible
function  updateOrientation(index,orientationArray){
	var orientation=orientationArray[0];
	var translationX=orientationArray[1][0];
	var translationY=orientationArray[1][1];
	identifiedTangiblesList[index][4][0]=orientation;
	identifiedTangiblesList[index][4][1]=[2];
	identifiedTangiblesList[index][4][1][0]=translationX;
	identifiedTangiblesList[index][4][1][1]=translationY;
	console.log('updated the orientation of the '+ index + 'as : '+ JSON.stringify(identifiedTangiblesList[index][4]));
}

// update the new position of the tangible
function  updatePosition(index,newTouches){
	var centerX = 0;
	var centerY = 0;
    identifiedTangiblesList[index][2]=[]
	identifiedTangiblesList[index][3]=[2];
	
	for(var l=0; l< newTouches.length; l++){
	    identifiedTangiblesList[index][2][l]=[2];
		var tempX=newTouches[l][0];
		var tempY=newTouches[l][1];
		identifiedTangiblesList[index][2][l][0]=tempX;
		identifiedTangiblesList[index][2][l][1]=tempY;
		centerX += newTouches[l][0];
		centerY += newTouches[l][1];
		console.log('Center X: '+centerX +'Center Y: '+centerY);
	
	}

    centerX= centerX/3;
	centerY= centerY/3;
	console.log('Center X: '+centerX);
	console.log('Center Y: '+centerY);

	identifiedTangiblesList[index][3][0]=centerX;
	identifiedTangiblesList[index][3][1]=centerY;
	
	console.log('successfully updated the '+ identifiedTangiblesList[index][1].name+' \'s position as:'+ JSON.stringify(identifiedTangiblesList[index][2]) + 'center:'+JSON.stringify(identifiedTangiblesList[index][3]));
	return true;
} 

function typeToText(type){
var identi_name = null;
  switch(type) {
	case 1: identi_name= 'Stick'; break;
	case 2: identi_name= 'Grass'; break;
	case 3: identi_name= 'Leaf'; break;
	case 4: identi_name= 'boar'; break;
	default: identi_name = null; break;
  }
  return identi_name;
}

//   Method to delete an item from identified tangibles list
function  deleteFromIdentifiedTangibles(index){
	
	if (index > -1&&index<identifiedTangiblesList.length) {
		identifiedTangiblesList.splice(index, 1);
		return true;
	}
	
	/*for(var l=index; l< (identifiedTangiblesList.length-1); l++){
		var identifyTangibleListItem=identifiedTangiblesList[l+1];
		identifiedTangiblesList[l]=identifyTangibleListItem;
		if (l== (identifiedTangiblesList.length-2)){
			return true;
		}
		
	}*/
	return false;
};


//   Method to delete an item from identified tangibles list
function  deleteAllIdentifiedTangibles(){
	
	identifiedTangiblesList=[];
	return true;
};

//   recognition of overlapped Tangibles
function  isOverlapped(newTouches,identifiedTangibleType,center){

	var errorX=30;
	var errorY=30;
	var tangibleType=typeToText(identifiedTangibleType);
	
	console.log('identifiedTangiblesList.length:'+identifiedTangiblesList.length);
	console.log('identifiedTangibleType:'+tangibleType);
	
	if (identifiedTangiblesList.length==0){
		console.log('identifiedTangiblesList.length==0');
	   return (['false',null,null,null]);
	   
	} else {
			
		for(var i=0; i< identifiedTangiblesList.length; i++){
			console.log('identifiedTangiblesList[i][2].length='+identifiedTangiblesList[i][2].length +'  and touches.length='+newTouches.length);
			if (identifiedTangiblesList[i][2].length==newTouches.length){
				var tmpTouches = identifiedTangiblesList[i][2];
				console.log('new touches:',JSON.stringify(newTouches));
				console.log('identifiedTangibles touches:'+JSON.stringify(tmpTouches));
				var counter=0;
				for(var j=0; j< newTouches.length; j++){
					var touchX=newTouches[j][0];
					var touchY=newTouches[j][1];
					console.log('touch '+j+' :'+JSON.stringify('['+touchX+','+touchY+']'));
					for(var k=0; k< tmpTouches.length; k++){
						if(touchX>=(tmpTouches[k][0]-errorX)&&touchX<=(tmpTouches[k][0]+errorX)){
							if(touchY>=(tmpTouches[k][1]-errorY)&&touchY<=(tmpTouches[k][1]+errorY)){
								counter++;
								console.log('touch point ['+touchX+','+touchY+'] equals '+identifiedTangiblesList[i][1].name + ' : [' +tmpTouches[k][0]+','+tmpTouches[k][1]+'] Counter:'+counter);
							}
						}
					}
				}
				
				var ax= center[0];
				var ay=center[1];
				var bx = identifiedTangiblesList[i][3][0];
                var by = identifiedTangiblesList[i][3][1];
                   
                var dx = ax - bx;
                var dy = ay - by;
                var distance = Math.sqrt(dx * dx + dy * dy);
				console.log('distance:'+distance);
				console.log('counter:'+counter+'   newTouches.length:'+newTouches.length+'   \ntangibleType:'+tangibleType+
				'   identifiedTangiblesList[i][1].name:'+identifiedTangiblesList[i][1].name);
				
				if (counter==newTouches.length&&tangibleType==identifiedTangiblesList[i][1].name&&distance<100){
					console.log('Overlapping found:'+i+identifiedTangiblesList[i][1].name + '   In distance:'+distance);
					return (['true',i,identifiedTangiblesList[i][0],identifiedTangiblesList[i][1].name]);
				} /*else if (counter==touches.length&&tangibleType!=identifiedTangiblesList[i][1].type){
					console.log('Overlapping for different type:'+i+identifiedTangiblesList[i][1].type);
					return (['false',i,identifiedTangiblesList[i][0],identifiedTangiblesList[i][1].type]);
				}*/
				
			}
		}
			console.log('No overlapping');
			return (['false',null,null,null]);
	}
};


// Tangible recognition and rotation algorithm
function  tangibleRecognizer(touches){
	var recognised = false;
	var tangible = new Tangible();
	//used when a tangible is being calibrated
	tangiblesList=JSON.parse(localStorage.getItem('tangibles'));
	
	// We need to have minimum of three touch points to identify the Tangible and it's orientation.
	if (touches.length>2 && this.tangiblesList!= null){
		
		tangible.touchPoints=touches;
		tangible.type='unrecognized';
		tangible.ID=-1;
		
		tangible.calculateDistances();
		
		for(var i=0; i< this.tangiblesList.length; i++){
							
			var tmpTangible = tangiblesList[i];  
			
			var counter=0;
			
			console.log('Tangible : ' + JSON.stringify(tangible.distances) +'\n Matched with: \n' + JSON.stringify(tmpTangible.distances));
			
			for (var j = 0; j < tmpTangible.distances.length; j++){	
			
				var d = tmpTangible.distances[j];
				
				for (var k = 0; k < tangible.distances.length; k++){
				
					var d1 = tangible.distances[k];
					console.log('d:'+d+' and d1:'+d1);
					if ( d >= d1 - error && d <= d1 + error) {   //add degree of error here
												
						counter++;
						console.log('Tangible : ' + JSON.stringify(tmpTangible.name) +' Distance: ' + d +' with Distance:'+d1+' Counter :'+ counter);
						break;
					} else {
					
						//break;
						
					}
				}					
			}
			console.log('counter : ' + counter +' tmpTangible.distances.length: ' + tmpTangible.distances.length+' tangible.distances.length:'+tangible.distances.length);
			if ((counter == tmpTangible.distances.length) && (tangible.distances.length == tmpTangible.distances.length)){
				
				recognised = true;
				
				//need to reorientate this tangible outline
				
				//reorientate(t, newT, g, true, false);
				
				return tmpTangible;
			}
			
			//newDist = (int[])newd.Clone();				
		}
		return tangible;
	}
		
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
				
	
		}
	
	}
};

// Save new tangibles to the tangiblesList
function Save(tangiblesList, orientation, touchPoints, name, type, size){

	tangiblesList= JSON.parse(localStorage.getItem('tangibles'));

	if(tangiblesList==null){
		tangiblesList=[];
		localStorage.setItem('tangibles', JSON.stringify(tangiblesList));
	}

	//Save tangible to xml file
	var newTangible = addTangible(tangiblesList,orientation, name,touchPoints, type, size);
	tangiblesList.push(newTangible);   //add to tangibles that have been loaded for use
	//allTangibles.Add(newTangible);  //for display list
	//tangibleList.Items.Add(newTangible.ID + ": " + newTangible.type);

	localStorage.setItem('tangibles', JSON.stringify(tangiblesList));

	return tangiblesList;
};

 //Make a new tangible object
 function addTangible(tangiblesList,orientation,name,touchPoints,type, size) {
 
	
	var tangible = new Tangible();
	var id=0;
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

	tangible=tangible.populateC(id, name, touchPoints, outlinePoints, type, size); 
	return tangible;       
};


function reorientate(originalT, newT, g, firsttime, freezeOutline){

			console.log('OriginalMap: '+JSON.stringify(originalT));
			console.log('New map : ' +JSON.stringify(newT));
			console.log('g : ' +g);
			console.log('firsttime : ' +firsttime);
			console.log('freezeOutline: ' +freezeOutline);

            var pose=[];
            var rotation=0;
            pose[0]=rotation;
            pose[1]=[2];

            //var newTranslation_x=0;
            //var newTtranslation_y=0;

            console.log('new center:'+ JSON.stringify(newT.center)+ '  Orginal center:'+ JSON.stringify(originalT.center));
            var newTranslation_x=(newT.center[0]-originalT.center[0]);
            var newTranslation_y=(newT.center[1]-originalT.center[1]);

            console.log('translation_x:'+ newTranslation_x + '  translation_y:'+ newTranslation_y);

            pose[1][0]=newTranslation_x;
            pose[1][1]=newTranslation_y;


            /** Calculates the angle (in radians) between two vectors pointing outward from one center
            *
            * p0 orgin of the cordinates system
            * p1 second point
            * c center point
            */

           var c= originalT.center;
           var p0=[0,0];
           var p1=originalT.biggestAnglePoint;

           // Substitute the p1 to the line which goes through (0,0) and originalT.center and detect which side of the line P1 is
           var sideOfP1=(c[1]/c[0])*(p1[0]);

           var p0c = Math.sqrt(Math.pow(c[0]-p0[0],2)+
                               Math.pow(c[1]-p0[1],2)); // p0->c (b)
           var p1c = Math.sqrt(Math.pow(c[0]-p1[0],2)+
                               Math.pow(c[1]-p1[1],2)); // p1->c (a)
           var p0p1 = Math.sqrt(Math.pow(p1[0]-p0[0],2)+
                                Math.pow(p1[1]-p0[1],2)); // p0->p1 (c)
           var explicitRotation= Math.acos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c));
           console.log('p1:('+p1[0]+','+p1[1]+')');



           var qc= [newT.center[0]-newTranslation_x,newT.center[1]-newTranslation_y];
           var qp0=[0,0];
           var qp1=[newT.biggestAnglePoint[0]-newTranslation_x,newT.biggestAnglePoint[1]-newTranslation_y];
           console.log('qp1:('+qp1[0]+','+qp1[1]+')');

           var qp0c = Math.sqrt(Math.pow(qc[0]-qp0[0],2)+
                               Math.pow(qc[1]-qp0[1],2)); // p0->c (b)
           var qp1c = Math.sqrt(Math.pow(qc[0]-qp1[0],2)+
                               Math.pow(qc[1]-qp1[1],2)); // p1->c (a)
           var qp0p1 = Math.sqrt(Math.pow(qp1[0]-qp0[0],2)+
                                Math.pow(qp1[1]-qp0[1],2)); // p0->p1 (c)
           var newTRotation= Math.acos((qp1c*qp1c+qp0c*qp0c-qp0p1*qp0p1)/(2*qp1c*qp0c));

           // Substitute the qp1 to the line which goes through (0,0) and newT.center and detect which side of the line qP1 is
           var sideOfQP1=(qc[1]/qc[0])*(qp1[0]);
           var explicitCase=0;
           var newTcase=0;

           //Avoid 180 degree problem
           console.log( ' c[y] :' + c[1] + '   side Of P1 Value:'+sideOfP1);
           if (p1[1]<sideOfP1){
                console.log('c[y]<sideOfP1 then explicitRotation:'+explicitRotation*(180/Math.PI));
                explicitCase=1;

             } else if(p1[1]>sideOfP1) {
                 //explicitRotation=Math.PI-explicitRotation;
                 console.log('(c[y]>sideOfP1 then explicitRotation:'+explicitRotation*(180/Math.PI));
                 explicitCase=2;
           }


           console.log( ' qc[y] :' + qc[1] + '   side Of QP1 Value:'+sideOfQP1);
           if (qp1[1]<sideOfQP1){
                console.log('qc[y]<sideOfQP1 then explicitRotation:'+newTRotation*(180/Math.PI));
                newTcase=1;

             } else if(qp1[1]>sideOfQP1) {
                 //newTRotation=Math.PI-newTRotation;
                 console.log('(qc[y]>sideOfQP1 then explicitRotation:'+newTRotation*(180/Math.PI));
                 newTcase=2;

             }

             if((explicitCase==1)&&(newTcase==1)){
                console.log('explicitRotation:'+ explicitRotation * (180/Math.PI));
                console.log('newTRotation:'+ newTRotation * (180/Math.PI));
                pose[0]=newTRotation-explicitRotation;
                console.log('(explicitCase==1)&&(newTcase==1) THEN pose[0]=newTRotation-explicitRotation ');

             }else if((explicitCase==1)&&(newTcase==2)){
                console.log('explicitRotation:'+ explicitRotation * (180/Math.PI));
                console.log('newTRotation:'+ newTRotation * (180/Math.PI));
                 console.log('(explicitCase==1)&&(newTcase==2) THEN pose[0]=newTRotation-explicitRotation ');
                pose[0]=Math.PI+((Math.PI-newTRotation)-explicitRotation);

             }else if((explicitCase==2)&&(newTcase==1)){
                console.log('explicitRotation:'+ explicitRotation * (180/Math.PI));
                console.log('newTRotation:'+ newTRotation * (180/Math.PI));
                 console.log('(explicitCase==2)&&(newTcase==1) THEN pose[0]=Math.PI+((Math.PI-explicitRotation)-newTRotation) ');
                pose[0]=(explicitRotation+newTRotation);

             }else if((explicitCase==2)&&(newTcase==2)){
                console.log('explicitRotation:'+ explicitRotation * (180/Math.PI));
                console.log('newTRotation:'+ newTRotation * (180/Math.PI));
                console.log('(explicitCase==2)&&(newTcase==2) THEN Math.PI+(explicitRotation-newTRotation) ');
                pose[0]=pose[0]=explicitRotation-newTRotation;

             }



           /*console.log('New Tangible Rotation:'+newTRotation*(180/Math.PI));

		   console.log ('if ('+c[1]+'>'+p1[1]+'&&'+qc[1]+'>'+qp1[1]+' ||'+ c[1]+'<'+p1[1]+'&&'+qc[1]+'<'+qp1[1]+')');

		   
		   if (c[1]>p1[1]&&qc[1]>qp1[1]){

                pose[0]=newTRotation-explicitRotation;
                console.log('less than 180 degree: Case 1');

           } else if (c[1]>p1[1]&&qc[1]<qp1[1]) {
		   
				pose[0]=(Math.PI+(Math.PI-newTRotation)-explicitRotation);
				console.log('More than 180 degree: Case 1');
				
				
			}
			
			else if (c[1]<p1[1]&&qc[1]<qp1[1]){

                
				pose[0]=(Math.PI-newTRotation)-(Math.PI-explicitRotation);
                console.log('less than 180 degree: Case2');

           } else if ((c[1]<p1[1]&&qc[1]>qp1[1])){
		   
				pose[0]=Math.PI-((Math.PI-newTRotation)-explicitRotation);
				console.log('more than 180 degree: Case2');
								
			}

		
		   */
		   console.log('explicitRotation:'+ explicitRotation * (180/Math.PI));
		   console.log('newTRotation:'+ newTRotation * (180/Math.PI));
		   console.log('pose[0]:'+ pose[0] * (180/Math.PI));	   
		   
		  

           console.log('POSE:'+JSON.stringify(pose));



           return pose;

}

//first time bool is to indicate if this is the first time the tangible is being recognised
function reorientate_old(originalT, newT, g, firsttime, freezeOutline){
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
					console.log('newMap['+s+']:'+JSON.stringify(newMap));
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
                        var a2 = new1[0] - new2[0];
                        var b2 = new1[1] - new2[1];
						console.log('a2:'+a2+'  b2:'+b2);
                        var angle2 = Math.atan2(b2, a2);
                        console.log('angle2:'+angle2);
						
                        var temp_rotation = angle2 - angle;
						console.log('temp_rotation:'+temp_rotation);
						
						var pi = Math.PI;
						
						/* This IF condition fix the 180 degree orientation bug. 
						It happens when number of mapping points and distances in the two maps are only 1 
						We have only two touch points in the OrginalMap[index] and newMap[index2] this moment
						Therefore needs to access the newT distances array and compare 0th and 2nd positions	
						newT.distances[0]>newT.distances[2] means swapped touch points in 3 touch tangible*/ 
						
						
						if (counter == 1 && d.length===1&&newT.touchPoints.length==3){
								
							console.log('Tangible with Three touch points and sub maps mapped with only one point');
							console.log ('Original T D :'+JSON.stringify(originalT.distances));
							console.log ('New T D :'+JSON.stringify(newT.distances));
							
							if (originalT.distances[0]<originalT.distances[1]&&originalT.distances[0]<originalT.distances[2]&&originalT.distances[1]<originalT.distances[2]) {
								if (newT.distances[0]<newT.distances[1]&&newT.distances[0]>newT.distances[2]&&newT.distances[1]>newT.distances[2]){
									temp_rotation=temp_rotation-pi;
									console.log('Swap Ends Case 1.1 , New Temp Rotation :'+temp_rotation);
								}else if (newT.distances[0]>newT.distances[1]&&newT.distances[0]>newT.distances[2]&&newT.distances[1]>newT.distances[2]){
									temp_rotation=temp_rotation+pi;
									console.log('Swap Ends Case 1.2 , New Temp Rotation :'+temp_rotation);
								}
									
							} else if (originalT.distances[0]<originalT.distances[1]&&originalT.distances[0]>originalT.distances[2]&&originalT.distances[1]>originalT.distances[2]) {
								if (newT.distances[0]>newT.distances[1]&&newT.distances[0]<newT.distances[2]&&newT.distances[1]<newT.distances[2]){
									temp_rotation=temp_rotation;
									console.log('Swap Ends Case 2.1 , New Temp Rotation :'+temp_rotation);
								} 
								else if (newT.distances[0]>newT.distances[1]&&newT.distances[0]>newT.distances[2]&&newT.distances[1]<newT.distances[2]){
									temp_rotation=temp_rotation+pi;
									console.log('Swap Ends Case 2.2 , New Temp Rotation :'+temp_rotation);
								}
								else if (newT.distances[0]<newT.distances[1]&&newT.distances[0]<newT.distances[2]&&newT.distances[1]>newT.distances[2]){
									temp_rotation=temp_rotation-pi;
									console.log('Swap Ends Case 2.3 , New Temp Rotation :'+temp_rotation);
								}
							} else if (originalT.distances[0]>originalT.distances[1]&&originalT.distances[0]>originalT.distances[2]&&originalT.distances[1]<originalT.distances[2]) {
								if (newT.distances[0]<newT.distances[1]&&newT.distances[0]<newT.distances[2]&&newT.distances[1]<newT.distances[2]){
									temp_rotation=temp_rotation-pi;
									console.log('Swap Ends Case 3.1 , New Temp Rotation :'+temp_rotation);
								}
							} else if (originalT.distances[0]>originalT.distances[1]&&originalT.distances[0]>originalT.distances[2]&&originalT.distances[1]>originalT.distances[2]) {
								if (newT.distances[0]>newT.distances[1]&&newT.distances[0]<newT.distances[2]&&newT.distances[1]<newT.distances[2]){
									temp_rotation=temp_rotation-pi;
									console.log('Swap Ends Case 4.1 , New Temp Rotation :'+temp_rotation);
								}
							}
							else {
									console.log('No Swapping of Ends');
							}
						} else
						{
							console.log('Tangible is matched with submaps with two or more touch points or NoOFTouches >3');
						}
                        				
						//normalise the rotation
                        
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
									console.log('new_temp_rotation:'+temp_rotation);
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