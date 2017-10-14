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
//deals with error in google maps api call
function gerror(){
	alert("Error in loading google maps api!");
}
//array of locations
var locations = [{
		title: "Mall near my home in UP.",
		location: {
			lat: 28.6395286,
			lng: 77.3147442
		},
		bool: true
	},
	{
		title: "Kutch desert (hut view)",
		location: {
			lat: 23.758878,
			lng: 69.511124
		},
		bool: true
	},
	{
		title: 'Traditional Bengali home',
		location: {
			lat: 22.533466,
			lng: 88.349108
		},
		bool: true
	},
	{
		title: 'Nandan Gurudwara,Madhya Pradesh',
		location: {
			lat: 19.152107,
			lng: 77.317845
		},
		bool: true
	},
	{
		title: 'Taj Mahal',
		location: {
			lat: 27.173992,
			lng: 78.041993
		},
		bool: true
	},
	{
		title: 'Raj Ghat, Varanasi',
		location: {
			lat: 25.326028,
			lng: 83.034883
		},
		bool: true
	},
	{
		title: 'Main gate',
		location: {
			lat: 12.9682346,
			lng: 79.1558501
		},
		bool: true
	},
];
//function to make the information dynamic
var location_add = function (loc) {
	this.title = ko.observable(loc.title);
	this.position = ko.observable(loc.location);
	this.visiblity = ko.observable(loc.bool);
};

//initialise function to create map
function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 23.082266, 
			lng: 77.615811
		},
		zoom: 5
	});

	var largeInfowindow = new google.maps.InfoWindow();

	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			var temp, humidity;
			var url1 = "http://api.openweathermap.org/data/2.5/weather?lat=" + marker.position.lat() + "&lon=" + marker.position.lng() + "&APPID=9a743925ab6fa9a332db48c0b30b9eb4";

			$.ajax(url1, {
				dataType: "json",
				success: function (data) {
					temp = data.main.temp;
					humidity = data.main.humidity;
					console.log(temp);
					console.log(humidity);
					infowindow.setContent('<div id="info_title">' + marker.title + '</div><div id="accuweather"><p>Temp : ' + temp + 'K Humidity: ' + humidity + '%</p></div><div></div><div id="pano"></div>');
					streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

				},
				error: function () {
					alert('There is some error in displaying temperature!');
				}
			});
			// Clear the infowindow content to give the streetview time to load.

			infowindow.marker = marker;
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function () {
				infowindow.marker = null;
			});
			var streetViewService = new google.maps.StreetViewService();
			var radius = 50;


			// In case the status is OK, which means the pano was found, compute the
			// position of the streetview image, then calculate the heading, then get a
			// panorama from that and set the options
			var getStreetView = function (data, status) {
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
					infowindow.setContent('<div>' + marker.title + '</div>' + '<div id="accuweather"><p>Temp : ' + temp + 'K Humidity: ' + humidity + '%</p></div>' +
						'<div>No Street View Found</div>');
				}
			};


			// Use streetview service to get the closest streetview image within
			// 50 meters of the markers position

			// Open the infowindow on the correct marker.
			infowindow.open(map, marker);
		}
	}
	//implementing the viewmodal of knockout
	var ViewModel = function () {
		var self = this;
		this.filter = ko.observable("");

		self.items = ko.observableArray([]);

		locations.forEach(function (loc) {
			self.items.push(new location_add(loc));
		});

		this.openInfo = function (loc) {
			//closes already opened infowindow
			largeInfowindow.close();
			// will trigger the click event on the selected location marker
			google.maps.event.trigger(loc.marker, 'click');
		};


		self.items().forEach(function (loc) {
			var marker = new google.maps.Marker({
				// tells the marker where to show
				map: map,
				// position as defined in observable array
				position: loc.position(),
				// title of the location as present in obsevable array
				title: loc.title(),

				animation: google.maps.Animation.DROP,

			});
			markers.push(marker);

			loc.marker = marker;

			marker.addListener('click', function () {
				populateInfoWindow(this, largeInfowindow);
				toggleBounce();
			});

			function toggleBounce() {
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				} else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function () {
						marker.setAnimation(null);
					}, 1500);
				}
			}
		});
		//for filtering the list when user types in
		self.filteredItems = ko.computed(function () {
			var filter = this.filter().toLowerCase();
			if (!filter) {
				self.items().forEach(function (loc) {
					loc.marker.setMap(map);
					loc.visiblity(true);
				});
			} else {
				self.items().forEach(function (loc) {
					if (loc.title().toLowerCase().indexOf(filter) === -1) {
						loc.visiblity(false);
						loc.marker.setMap(null);
					} else {
						loc.marker.setMap(map);
						loc.visiblity(true);
					}
				});
			}
		}, self);

	};
	ko.applyBindings(new ViewModel());
}