/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
 var map;
 //will store the markers of locations
 var markers = [];

//array of locations
var locations = [
            {title:"Men's hostel g - block(My block) ",location:{lat:12.9737467,lng:79.1596992},bool:true},
            {title:'Enzo(eatery)',location:{lat:12.9726155,lng: 79.1588798},bool:true},
            {title:'SJT (Main education building for CSE,IT)',location:{lat:12.9713315,lng: 79.1635564},bool:true},
            {title:'TT (Main education building for EEE,ECE)',location:{lat:12.9709444,lng: 79.1594751},bool:true},
            {title:'Anna Auditorium',location:{lat:12.9696704,lng: 79.1557084},bool:true},
            {title:'Main gate',location:{lat:12.9682346,lng: 79.1558501},bool:true},
 ];
//function to make the information dynamic
 var location_add = function(loc){
 	this.title = ko.observable(loc.title);
    this.position = ko.observable(loc.location);
 	this.visiblity = ko.observable(loc.bool);
 };

//initialise function to create map
 function initMap(){

    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 12.9726128, lng: 79.159064},
            zoom: 16
     });

    var largeInfowindow = new google.maps.InfoWindow();

    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          var temp,humidity;
          var url1="http://api.openweathermap.org/data/2.5/weather?lat="+marker.position.lat()+"&lon="+marker.position.lng()+"&APPID=9a743925ab6fa9a332db48c0b30b9eb4";
        
          $.ajax(url1,{
              dataType:"json",
              success:function(data){
             
              temp=data.main.temp;
              humidity=data.main.humidity;
              console.log(temp);
              console.log(humidity);
              $('<p>Temp : '+temp+'K Humidity: '+humidity+'%</p>').appendTo("#accuweather");
              },
              error: function(){
                console.log('There is some error!');
              }
            });
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('<div id="info_title">'+marker.title+'</div><div id="accuweather"></div><div></div><div id="pano"></div>');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          

        
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          var getStreetView = function(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
               
                 
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          };


          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }
//implementing the viewmodal of knockout
var viewModel = function(){
		var self=this;
		this.filter= ko.observable("");
	
	self.items = ko.observableArray([]);

    locations.forEach(function(loc){
		self.items.push(new location_add(loc));
	});

this.openInfo = function(loc) {
    //closes already opened infowindow
    largeInfowindow.close();
    // will trigger the click event on the selected location marker
    google.maps.event.trigger(loc.marker, 'click');
    };

      

self.items().forEach(function(loc) {
    var marker = new google.maps.Marker({
      // tells the marker where to show
      map: map,
      // position as defined in observable array
      position: loc.position(),
      // title of the location as present in obsevable array
      title: loc.title(),
      
    });
    markers.push(marker);

    loc.marker= marker;

    marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
});
    //for filtering the list when user types in
	self.filteredItems = ko.computed(function() {
        var filter = this.filter().toLowerCase();
        if (!filter) {
            self.items().forEach(function(loc){
            	loc.marker.setMap(map);
                loc.visiblity(true);
            });
        } else {
            self.items().forEach(function(loc){
            	if(loc.title().toLowerCase().indexOf(filter)===-1){
            		loc.visiblity(false);
                   loc.marker.setMap(null);
            	}
            	else{
            		loc.marker.setMap(map);
                    loc.visiblity(true);
            	}
            });
        }
}, self);

};
ko.applyBindings(new viewModel());
}
	