(function () {
	  var touches = [];
    var w = 0;
    var h = 0;
    var img_src;

    var ImgX = -1, ImgY = -1;
	  var ImgO = 0;       // orientation
    var type = -1;  	// 1:Stick, 2:Grass, 3:Leaf
    var tempType = -2;

    /*var img1_w = 695;
    var img1_h = 87;
    var img2_w = 320;
    var img2_h = 183;
    var img3_w = 340;
    var img3_h = 140;*/
    var PPI = 5.20;

    var id_count = 1; // IDs for objects
    var current_id = 1;

    var reg = false;
    var is_inreg = false;
    var reg_name;

    var nw = window.innerWidth;
    var nh = window.innerHeight;

    var touchPoints = new Array();   // current detected touch points
    var reg_names = [];

    var current_pose = [];  // crrent position: [x, y]
    var reg_markers = [];

    var tangible_use = ['img/004_signpost.png', 'img/005_dart.png', 'img/006_dont.png', 'img/007_boar.png', 'img/008_one_person.png', 'img/009_one_day.png','img/010_friends.png','img/011_hungry.png','img/012_river.png','img/013_direction.png','img/014_bit_of_path.png','img/015_leaves.png'];

    var typenum = 13;        // 12 tangibles have been used

    // Add image size in local Storage
    function regImgSize(name, size) {
      var image_size_array = localStorage.getItem('imgsizearray');
      console.log(image_size_array);
      if (image_size_array == null) {
        // no image sizes exist in local storage
        var obj = {name: size};
        localStorage.setItem('imgsizearray',JSON.stringify(obj));
        console.log(JSON.stringify(obj));
      }
      else {
        // some image sizes have been stored in local storage
        console.log(JSON.parse(image_size_array));
        var obj = {name: size};
        //JSON.parse(image_size_array).push(obj);
        //localStorage.setItem('imgsizearray',JSON.stringify(image_size_array));
      }
    }

    // Preload images helper function
    function preload(str, src){
      var picStorage = localStorage.getItem(str);

      if (picStorage) {
        var imageObj = new Image();
        imageObj.src = picStorage;
      }
      else {
        // Create XHR, BlobBuilder and FileReader objects
        var xhr = new XMLHttpRequest(),
            blob,
            fileReader = new FileReader();

        xhr.open("GET", src, true);
        xhr.responseType = "arraybuffer";
        xhr.addEventListener("load", function () {
          if (xhr.status === 200) {
            // Create a blob from the response
            blob = new Blob([xhr.response], {type: "image/png"});

            // onload needed since Google Chrome doesn't support addEventListener for FileReader
            fileReader.onload = function (evt) {
              // Read out file contents as a Data URL
              var result = evt.target.result;
              // Set image src to Data URL
              var imageObj = new Image();
              imageObj.src = result;
              // Store Data URL in localStorage
              try {
                localStorage.setItem(str, result);
              }
              catch (e) {
                console.log("Storage failed: " + e);
              }
            };
            // Load blob as Data URL
            fileReader.readAsDataURL(blob);
          }
        }, false);
        // Send XHR
        xhr.send();
      }
    }
    // Preload images
    var str;
    var src;
    /*str = "img1";
    src = 'img/001_stick.png';
    preload(str,src);
    str = "img2";
    src = 'img/002_grass.png';
    preload(str,src);
    str = "img3";
    src = 'img/003_leaf.png';
    preload(str,src);
    str = "img4";
    src = 'img/004_signpost.png';
    preload(str,src);
    str = "img5";
    src = 'img/005_dart.png';
    preload(str,src);
    str = "img6";
    src = 'img/006_dont.png';
    preload(str,src);
    str = "img7";
    src = 'img/007_boar.png';
    preload(str,src);
    str = "img8";
    src = 'img/008_one_person.png';
    preload(str,src);
    str = "img9";
    src = 'img/009_one_day.png';
    preload(str,src);
    str = "img10";
    src = 'img/010_friends.png';
    preload(str,src);
    str = "img11";
    src = 'img/011_hungry.png';
    preload(str,src);
    str = "img12";
    src = 'img/012_river.png';
    preload(str,src);
    str = "img13";
    src = 'img/013_direction.png';
    preload(str,src);
    str = "img14";
    src = 'img/014_bit_of_path.png';
    preload(str,src);
    str = "img15";
    src = 'img/015_leaves.png';
    preload(str,src);*/
    for(var u = 0; u<tangible_use.length; u++){
      var uu = u+1;
      str = 'img'+uu;
      src = tangible_use[u];
      preload(str,src);
    }


    function initialize(){
      console.log(reg_names);
      var temp = localStorage.getItem('regnames');
      var temptan= JSON.parse(localStorage.getItem('tangibles'));
      var image_size_array = localStorage.getItem('imgsizearray');

      console.log(temp);
      console.log(temptan);
      console.log(image_size_array);

      if(temp == null && temptan == null){
        var firsttan = ["Signpost","Dart","Dont","Boar","One Person","One Day","Friends","Hungry","River","Direction","Bit of Path","Leaves"];
        localStorage.setItem('regnames', firsttan);
        reg_names = firsttan;
      } 
      else {
        // parse string to an array
        var array = temp.split(",");
        reg_names = array;
      }
      if(image_size_array == null) {
        // no size exists
        var firstsize = [];
        /*firstsize.push({'name':'Stick', 'size':'695,87'});
        firstsize.push({'name':'Grass', 'size':'320,183'});
        firstsize.push({'name':'Leaf', 'size':'340,140'});*/
        firstsize.push({'name':'Signpost', 'size':'56,600'});
        firstsize.push({'name':'Dart', 'size':'400,34'});
        firstsize.push({'name':'Dont', 'size':'254,225'});
        firstsize.push({'name':'Boar', 'size':'360,196'});
        firstsize.push({'name':'One Person', 'size':'161,400'});
        firstsize.push({'name':'One Day', 'size':'400,134'});
        firstsize.push({'name':'Friends', 'size':'61,350'});
        firstsize.push({'name':'Hungry', 'size':'100,159'});
        firstsize.push({'name':'River', 'size':'43,500'});
        firstsize.push({'name':'Direction', 'size':'450,337'});
        firstsize.push({'name':'Bit of Path', 'size':'400,165'});
        firstsize.push({'name':'Leaves', 'size':'400,449'});

        localStorage.setItem('imgsizearray',JSON.stringify(firstsize));
        console.log("initialize size: "+JSON.stringify(firstsize));
      }
      else {
        // for debug
        var s = [];
        s = JSON.parse(image_size_array);
        console.log(s[0]);
        console.log(s[1]);
        console.log(s[2]);
      }
    }

    function updateRegNames() {
      localStorage.setItem('regnames', reg_names);
    }

    function saveImage_ls(object){
      
    }
    /*
     * test if i is in the reg_markers
     */
    function isin(i){
      var index;
      for(index = 0; index<reg_markers.length; index++){
        if(i == reg_markers[index]) {
          return true;
        }
      }
      return false;
    }
    // Load the dropdown list for register
    function loadRegOptions() {
      var reg_menu = document.getElementById("myList_reg");
      var reg_idx;
      var reg_len;

      while (reg_menu.length>1){
        reg_menu.remove(reg_menu.length-1);
      }

      tangiblesList= JSON.parse(localStorage.getItem('tangibles'));

      if (tangiblesList != null) {
        var idx;
        for (idx = 0; idx < tangiblesList.length; idx++) {
          var tempT = tangiblesList[idx].name;
          var j;
          for(j=0; j<reg_names.length; j++) {
            if(reg_names[j] == tempT) {
              //reg_names.splice(j,1);
              // mark that one has been registered
              if (!isin(j)){
                reg_markers.push(j);
                console.log("in loadRegOptions: j is "+j);
              }
              break;
            }
          }
        }
      }

      reg_len = reg_names.length;
      console.log(reg_names);

      for(reg_idx = 0; reg_idx < reg_len; reg_idx++) {
        var option = document.createElement("option");
        option.text = reg_names[reg_idx];
        if(isin(reg_idx)){
          // has been registered
          option.text = "√  "+option.text;
        }
        console.log("pushing:"+option);
        reg_menu.add(option);
      }
    }
    /*
     * calSize - analyse image's size based on type which is determined by str
     * return: [width,height]
     */
    function calSize(ty) {
      // str is "img"+type
      var size = [];
      console.log(ty);

      var s = [];
      s = JSON.parse(localStorage.getItem('imgsizearray'));
      console.log(s[ty-1]);

      //localStorage.setItem('imgsizearray',JSON.stringify(s));
      var obj = s[ty-1];
      console.log(obj['size']);
      size = obj['size'].split(",");
      return size;
    }
    /*function loadRegedOptions() {
      var reged_menu = document.getElementById("myList");

      while (reged_menu.length>1){
        reged_menu.remove(reged_menu.length-1);
      }

      tangiblesList= JSON.parse(localStorage.getItem('tangibles'));

      if (tangiblesList != null) {
        var idx;
        for(idx=0; idx<tangiblesList.length; idx++) {
          var tempT = tangiblesList[idx].type;
          var option = document.createElement("option");
          option.text = tempT;
          reged_menu.add(option);
        } 
      }
    }*/
    initialize();
    loadRegOptions();

    /*loadRegedOptions();*/
    /*
     * DetectTouchPoints - detect all touch points and store them in global touchPoints
     */
    function DetectTouchPoints(evt){
      while (touchPoints.length > 0) {
        touchPoints.pop();
      }

      touches = evt.touches;
      var i, len = touches.length;
      for (i=0; i<len; i++) {
        var touch = touches[i];
        var px = touch.pageX;
        var py = touch.pageY;

        var temp = new Array(px, py);
        touchPoints.push(temp);
      }
    }


    if ((w != nw) || (h != nh)) {
    	w = nw;
      h = nh;
    }

    var stage = new Kinetic.Stage({
        container: "container",
        width: w,
        height: h
    });
    
    var layer = new Kinetic.Layer();
    var layer1 = new Kinetic.Layer();
    var layer2 = new Kinetic.Layer();
    /*
    var text = new Kinetic.Text({
        x: 10,
        y: 20,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: 'Hello!',
        fill: 'black'
    });
    */

    stage.getContent().addEventListener('touchstart', function(event) {
      if (!is_inreg) {

        nw = window.innerWidth;
        nh = window.innerHeight;

        if ((w != nw) || (h != nh)) {
          w = nw;
          h = nh;
          stage.width(w);
          stage.height(h);
        }

        event.preventDefault();
        touches = event.touches;
        var i, len = touches.length;
        for (i=0; i<len; i++) {
        	var touch = touches[i];
          var px = touch.pageX;
          var py = touch.pageY;
          console.log('px: '+px);
          console.log('py: '+py);
          var c = new Kinetic.Circle({
            radius: 10,
            fill: '#6eb3ca',
            x: px,
            y: py
          });
          layer.add(c);
          layer.draw();
        }
        console.log('normal start');

        // Recognize pre-registered tangibles
        DetectTouchPoints(event);
        var is_rec = recognize();
        console.log(is_rec);
        // Calculate position ImgX & ImgY
        if (type != -1 && is_rec != -1) {
          console.log(type);
          var size = calSize(type);
          var i;
          var cen = [];
          cen[0] = 0;
          cen[1] = 0;

          for (i=0; i<touchPoints.length; i++){
            cen[0] += touchPoints[i][0];
            cen[1] += touchPoints[i][1];
          }
          cen[0] = cen[0]/3;
          cen[1] = cen[1]/3;
          console.log('Center X: '+cen[0]);
          console.log('Center Y: '+cen[1]);

          ImgX = cen[0];
          ImgY = cen[1];
          console.log('ImgX: '+ImgX);
          console.log('ImgY: '+ImgY);

          current_pose[0] = ImgX;
          current_pose[1] = ImgY;

          // test if the touch points overlap previous images
          var result = isOverlapped(touchPoints,type,cen);
		  console.log( 'isOverlapped:'+JSON.stringify(result));
		  //alert( 'isOverlapped:'+JSON.stringify(result)+'\n identifiedTangiblesList :'+JSON.stringify(identifiedTangiblesList));
          if(result[0] == 'false') {
            // no overlapping
            // add new object in the identifiedTangiblesList
            var identifiedTangible = tangibleRecognizer(touchPoints);
            var new_id = current_id+1;
            identifiedTangiblesListIndex=addIdentifiedTangibles(identifiedTangible,new_id);
            // updates the touch points
			
			updatePosition(identifiedTangiblesListIndex,touchPoints);
			
			var firsttime=true;
			var freezeOutline=true;
			var g=[];
			
			var tempTangible = new Tangible();
			id=-1;
			tangibleName='';
			outline=[];
			tempTangible=tempTangible.populateC(id,tangibleName,touchPoints,outline, type);
			
			var pose=reorientate(identifiedTangible, tempTangible, g, firsttime, freezeOutline);
			var jsonText2 = JSON.stringify(pose);
			console.log('POSE:'+ jsonText2);

            updateOrientation(identifiedTangiblesListIndex,pose);

            // Load correct image
            if ((ImgX != -1) && (ImgY != -1)) {
              switch (type) {
                case 1:
                    img_src = "img/001_stick.png";
                    break;
                case 2:
                    img_src = "img/002_grass.png";
                    break;
                case 3:
                    img_src = "img/003_leaf.png";
                    break;
                default:break;
              }
			  
			  // Render the image with new orientation
			  var rv = parseFloat(pose[0]);

			  // transfer radians to degrees
			  var d = rv*180/Math.PI;
			  ImgO = d;
			  //var image_id = '#'+new_id;
			  //layer1.find(image_id).rotate(d);
			  //layer1.draw();
			  
              loadImg();
              tempType = type;
            }
          }
          else {
            // overlapping
            // retrieving the current object from identifiedTangiblesList
           /* var result2=identifiedTangiblesList[result[1]];
            console.log("Image ID: "+result2[0]);
            console.log("Tangible Object: "+JSON.stringify(result2[1]));
            console.log("Tangible Touches: "+result2[2]);*/
			
          }
		  
        }
      }
      else {
        // record touchpoints and deliver them for registration
        DetectTouchPoints(event);
        console.log(touchPoints.toString());
        layer2.destroyChildren();
        var ii, lentp = touchPoints.length;
        for (ii=0; ii<lentp; ii++) {
          var px = touchPoints[ii][0];
          var py = touchPoints[ii][1];

          var c = new Kinetic.Circle({
            radius: 10,
            fill: '#6eb3ca',
            stroke: '#ffffff',
            x: px,
            y: py
          });
          layer2.add(c);
          layer2.draw();
        }
      }
    });

    stage.getContent().addEventListener('touchend', function() {
      if (!is_inreg) {
        event.preventDefault();
        if (layer.hasChildren()) {
          layer.destroyChildren();
          layer.clear();
        }
        ImgX = -1;
        ImgY = -1;
      }
    });

    stage.getContent().addEventListener('touchmove', function(event) {
      if (!is_inreg) {
        event.preventDefault();
        touches = event.touches;
        layer.destroyChildren();
          
        var i, len = touches.length;
        for (i=0; i<len; i++) {
          	var touch = touches[i];
          	var px = touch.pageX;
          	var py = touch.pageY;

          	//ImgX = px;
          	//ImgY = py;

          	var c = new Kinetic.Circle({
            	radius: 10,
            	fill: '#6eb3ca',
            	x: px,
            	y: py
          	});
          	layer.add(c);
          	layer.draw();
        }
        //stage.draw();
      }
    });

    //layer.add(text);
    stage.add(layer);
    stage.add(layer1);
    stage.add(layer2);


    /* 
     * drawImage - Load the image with the right width and height
     *             at the right location
     */
    function drawImage(imageObj) { 
      if (!(ImgX <=0 && ImgY <= 0)) {
        var size = calSize(type);
        var w = size[0];
        var h = size[1];

        
        current_id = id_count;
        // darth vader
        var darthVaderImg = new Kinetic.Image({
            image: imageObj,
            x: ImgX,
            y: ImgY,
            width: w,
            height: h,
            offsetX: w/2,
            offsetY: h/2,
            draggable: true
        });

        if (!reg){
          darthVaderImg.id(current_id);
          console.log("created Image element ID: #"+current_id);
          id_count++;
        }
        if (reg) {
          darthVaderImg.draggable(false);
          darthVaderImg.setId('r');
          reg = false;
        }
		    darthVaderImg.rotate(ImgO);


        // add cursor styling
        darthVaderImg.on('mouseover', function() {
          	document.body.style.cursor = 'pointer';
        });
        darthVaderImg.on('mouseout', function() {
          	document.body.style.cursor = 'default';
        });
        darthVaderImg.on('dragstart', function(event){

        });
        darthVaderImg.on('dragend', function(event){

          var pos_x = this.getAbsolutePosition().x;
          var pos_y = this.getAbsolutePosition().y;

          console.log("Image Position: "+pos_x+", "+pos_y);
          console.log("Window's size: "+nw+", "+nh);

          if (pos_x >= nw || pos_x <= 0 || pos_y <= 10 || pos_y >= nh){
            // do deletion
            this.destroy();
            var jsonText1 = JSON.stringify(identifiedTangiblesList);
            console.log(jsonText1);
            console.log(this.id());

            deleteFromIdentifiedTangibles(this.id()-1);

            jsonText1 = JSON.stringify(identifiedTangiblesList);
            console.log(jsonText1);

            layer1.draw();
          }

        });

        layer1.add(darthVaderImg);
        layer1.draw();

         // enable rotating;
        var startRotate = 0;
        var hammertime = Hammer(darthVaderImg);
        hammertime.on("transformstart", function(e) {
            startRotate = darthVaderImg.rotation();
        }).on("transform", function(e) {
            darthVaderImg.rotation(startRotate + e.gesture.rotation);
            layer1.draw();
        });
        
      }
    }
    document.getElementById("set").onclick = function() {
      console.log("reg_name is before set: "+reg_name);
      if(reg_name != null)
        // register touch points of new tangibles
        addNewTangible();
      // remove tangible name from the register list

      var temp = localStorage.getItem('regnames');
      reg_names = temp.split(",");
      console.log("before: "+reg_names);
      console.log(reg_name);
      
      var i;
      for(i=0; i<reg_names.length; i++){
        if(reg_names[i] == reg_name) {
          //reg_names.splice(i,1);
          if (!isin(i)){
            reg_markers.push(i);
            console.log("in set: i is "+i);
          }
          break;
        }
      }
      console.log("after: "+reg_names);
      loadRegOptions();
      //loadRegedOptions();

      is_inreg = false;
      reg_name = '';
      layer1.find("#r").destroy();
      layer1.draw();
      // delete layer2 which contains touch points' positions
      layer2.find('Circle').destroy();
      layer2.draw();
      ImgX = -1;
      ImgY = -1;
    }; 
    document.getElementById("cancel").onclick = function() {
      layer1.find("#r").destroy();
      layer1.draw();
      layer2.find('Circle').destroy();
      layer2.draw();
      loadRegOptions();
      is_inreg = false;
      reg_name = '';
      ImgX = -1;
      ImgY = -1;
    };

    document.getElementById("add").onclick = function(){
      var selected_file = document.getElementById('input').files[0];
      var newname = document.getElementById('newname').value;

      // Store the image in the LocalStorage
      var str = "img"+typenum;
      typenum++;

      var img = new Image();
      var url = window.URL ? window.URL : window.webkitURL;
      img.src = url.createObjectURL(selected_file);
      console.log(selected_file);
      console.log(img.src);
      img.onload = function(e) {
        url.revokeObjectURL(this.src);
 
        var binaryReader = new FileReader();
        binaryReader.onloadend=function(d) {  
          var exif, transform = "none";

          var canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          var ctx = canvas.getContext("2d");
          console.log(ctx);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          var pixels = ctx.getImageData(0,0,canvas.width,canvas.height);
          var pix = pixels.data,
              newColor = {r:0, g:0, b:0, a:0};

          for (var i = 0, n = pix.length; i <n; i += 4) {
              var r = pix[i],
                  g = pix[i+1],
                  b = pix[i+2];

            if((r >= 180 && r <= 255) && (g >= 180 && g <= 255)&& (b >= 180 && b <= 255)){ 
              // Change the white to the new color.
             pix[i] = newColor.r;
             pix[i+1] = newColor.g;
             pix[i+2] = newColor.b;
             pix[i+3] = newColor.a;
            }
          }

          console.log(pixels);
          ctx.putImageData(pixels, 0, 0);
          console.log(ctx);
          var data = canvas.toDataURL('image/png');
          console.log(data);
          console.log(str);
          localStorage.setItem(str, data);
        };
 
        binaryReader.readAsArrayBuffer(selected_file);
      };

      // add new image's size
      var s = [];
      s = JSON.parse(localStorage.getItem('imgsizearray'));
      // get width
      var neww = document.getElementById('newwidth').value*PPI;
      // get height
      var newh = document.getElementById('newheight').value*PPI;
      var index;
      var tempname = newname;
      var aff = 1;
      for(index = 0; index<s.length; index++) {
        if(s[index].name == tempname) {
          tempname = newname+aff;
          aff++;
        }
      }

      var newdata = {};
      newdata.name = newname;
      newdata.size = neww+","+newh;
      console.log(JSON.stringify(newdata));
      s.push(newdata);

      localStorage.setItem('imgsizearray',JSON.stringify(s));

      // Add to the register list
      reg_names.push(newname);
      updateRegNames();
      loadRegOptions();
    };
    document.getElementById("reload").onclick = function() {
      window.location.href=window.location.href;
      //history.go(0);
    };
    document.getElementById("clear").onclick = function() {
      if (!is_inreg){
        layer.removeChildren();
        layer1.removeChildren();
        layer2.removeChildren();
        ImgX = -1;
        ImgY = -1;
        ImgO = 0;
        id_count = 1;
        current_id = 0;
        type = -1;
        tempType = -2;
        img_src="";
        stage.draw();
        identifiedTangiblesList=[];
      }
    };
   /* document.getElementById("myList").onchange = function() {
      var x = document.getElementById("myList").selectedIndex;

      switch(x){
        case 0:
          break;
        case 1:
          type = 1;
          break;
        case 2:
          type = 2;  
          break;
        case 3:
          type = 3; 
          break;
        default:
          alert("catch default");
          break;
        }
    };*/
    function getType_imgsizearray(name) {
      var type = -1;
      var s = [];
      var image_size_array = localStorage.getItem('imgsizearray');
      s = JSON.parse(image_size_array);

      var i=0;
      for(i=0; i<s.length; i++){
        var temp = s[i];
        if(name == temp['name']) {
          type = i+1;
          break;
        }
      }
      return type;
    }

    document.getElementById("myList_reg").onchange = function() {
      var x = document.getElementById("myList_reg").selectedIndex;
      //console.log(x);
      reg = true;
      is_inreg = true;
      ImgO = 0;
      layer1.find('#r').destroy();

      reg_name = document.getElementById("myList_reg").options[x].text;
      console.log("reg_name is "+reg_name);
      console.log("last char is "+ reg_name.substring(0,1));
      console.log("after modify: "+ reg_name.substring(2,reg_name.length));
      if(reg_name.substring(0,1) == '√'){
        reg_name = reg_name.substring(2,reg_name.length);
      }
      // according to the name get the type from imgsizearray
      console.log(x);
      var t = getType_imgsizearray(reg_name);

      if (t==-1) {
        console.log("type doesn't exit!");
      }
      console.log(t);
      type = t;
      var str = "img"+t;
      // get the size for the image
      var size = calSize(type);
      w = size[0];
      h = size[1];
      console.log(str);
      console.log("width: "+w);
      console.log("height: "+h);

      ImgX = w/2;
      ImgY = h/2+30;
      loadImg();
      tempType = type;

      /*reg_name = document.getElementById("myList_reg").options[x].text;
      if (reg_name == "Stick") {
        type = 1;
        w = img1_w;
        h = img1_h;
        ImgX = w/2;
        ImgY = h/2+30;
        img_src = "img/image001.png";
        loadImg();
        tempType = type;
      }
      else if (reg_name == "Grass") {
        type = 2; 
        w = img2_w;
        h = img2_h;
        ImgX = w/2;
        ImgY = h/2+30;
        img_src = "img/image002.png";
        loadImg();
        tempType = type; 
      }
      else if (reg_name == "Leaf") {
        type = 3; 
        w = img3_w;
        h = img3_h;
        ImgX = w/2;
        ImgY = h/2+30;
        img_src = "img/image003.png";
        loadImg();
        tempType = type;
      }
      else if (reg_name == "H") {
        type = 4;
        w = img3_w;
        h = img3_h;
        ImgX = w/2;
        ImgY = h/2+30;
        //img_src = "img/image003.png";
        loadImg();
        tempType = type;
      }
      else {
        layer1.draw();
      }*/
    };
    /*document.getElementById("Rotate_Sub").onclick = function() {
      var rv = parseFloat(document.getElementById("Rotate_Value").value);

      // transfer radians to degrees
      var d = rv*180/Math.PI;
      var image_id = '#'+current_id;
      layer1.find(image_id).rotate(d);
      layer1.draw();
    };*/

    function loadImg(){
      // Getting a file through XMLHttpRequest as an arraybuffer and creating a Blob
      var str;

      if (type != -1) {
        str = "img"+type;
      }
      else {
        str = "none";
      }
      console.log(str);
      /*switch (type) {
        case 1: str = "img1"; break;
        case 2: str = "img2"; break;
        case 3: str = "img3"; break;
        default: str = "none"; break;
      }*/

      var picStorage = localStorage.getItem(str);

      if (picStorage) {
        var imageObj = new Image();
        imageObj.onload = function() {
          drawImage(this);
        }
        imageObj.src = picStorage;
      }
      else {
        // Create XHR, BlobBuilder and FileReader objects
        var xhr = new XMLHttpRequest(),
            blob,
            fileReader = new FileReader();

        xhr.open("GET", img_src, true);
        xhr.responseType = "arraybuffer";
        xhr.addEventListener("load", function () {
          if (xhr.status === 200) {
            // Create a blob from the response
            blob = new Blob([xhr.response], {type: "image/png"});

            // onload needed since Google Chrome doesn't support addEventListener for FileReader
            fileReader.onload = function (evt) {
              // Read out file contents as a Data URL
              var result = evt.target.result;
              // Set image src to Data URL
              var imageObj = new Image();
              imageObj.onload = function() {
                drawImage(this);
              }
              imageObj.src = result;
              // Store Data URL in localStorage
              try {
                localStorage.setItem(str, result);
              }
              catch (e) {
                console.log("Storage failed: " + e);
              }
            };
            // Load blob as Data URL
            fileReader.readAsDataURL(blob);
          }
        }, false);
        // Send XHR
        xhr.send();
      }
    }

    /*
     * addNewTangible - Function for adding a new tangible
     */
    function addNewTangible(){

      var tangibleName=reg_name;
      var tp=touchPoints; // The touch point array you need to set
      var orientation =0;

      tangiblesList= JSON.parse(localStorage.getItem('tangibles'));
      console.log(tangiblesList);
      console.log(tp);

      if (tangiblesList != null) {
        var idx;
        for (idx = 0; idx < tangiblesList.length; idx++) {
          var tempT = tangiblesList[idx].name;
          if(tempT == reg_name) {
            // override the touchpoints
            tangiblesList.splice(idx,1);
            localStorage.setItem('tangibles', JSON.stringify(tangiblesList));
            break;
          }
        }

        var jsonText = JSON.stringify(tangiblesList);
        var s = calSize(type);
        Save(tangiblesList, orientation, tp, tangibleName, type, s);
        console.log(jsonText);
      
      }
      else{
        var jsonText = JSON.stringify(tangiblesList);
        var s = calSize(type);
        Save(tangiblesList, orientation, tp, tangibleName, type, s);
        console.log(jsonText);
      }
    }

    /*
     * recognize - Recognize already saved tangibles
     */
    function recognize(){
      console.log('begin recognition');
      var identifiedTangible = tangibleRecognizer(touchPoints);
      if (identifiedTangible != null){
        var jsonText = JSON.stringify(identifiedTangible);

        if (identifiedTangible.id != -1) {
          type = identifiedTangible.type;
          /*var identi_name = identifiedTangible.name;
          switch(identi_name) {
            case 'Stick': type= 1; break;
            case 'Grass': type= 2; break;
            case 'Leaf': type= 3; break;
            default: type = -1; break;
          }*/
          console.log("new recognized objec:"+type);
          //console.log(jsonText);
          return 1;
        }
        else {
          type = -1;
          console.log('Cannot recognize!');
          return -1;
        }
      }
      else {
        console.log('Wrong touch points input!');
        return -1;
      }
    }

})();