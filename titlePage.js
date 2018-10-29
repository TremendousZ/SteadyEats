$(document).ready(initializeApp);

let foodInput = null;
let food = null;
let urlParams = new URLSearchParams(window.location.search);
let userPosition = {lat:33.6348807,lng:-117.74057719999999};
if(urlParams.get('lat')!== null && urlParams.get('lng')!== null){
    userPosition.lat = parseFloat(urlParams.get('lat'));
    userPosition.lng = parseFloat(urlParams.get('lng'));
}

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var markerMap = {}
var mapGenerated = false;
let favoriteLocation = false;
let geoEnabled = false;
/**
 * apply click handlers once document is ready
 * @param {}
 */
function initializeApp () {
    addClickHandler();
    $(".submit").addClass("scale-in");
    $("#reset").addClass("scale-in");
    if(urlParams.get('lat')!== null && urlParams.get('lng')!== null){
            userPosition.lat= parseFloat(urlParams.get('lat'));
            userPosition.lng= parseFloat(urlParams.get('lng'));
        }
}

/**
 * Applies click handler to the submit button
 */
function addClickHandler () {
    $("#search").click(submitClicked);
    $("#enableGeo").click(enableGeolocation);
    $("#findMore").click(showMap);
    $("#reset").click(startOver);
    $("#logo").click(startOver);
    $("#pac-input").hide();
    modalActivity();
    $('#geoModalTrigger').click(showModal);
    $('#titlePage').click(removeIntroModal);
    pressEnterToSubmit();
    if(urlParams.get('food')!== null){
        submitClicked();
    }
    $("#food").on('keyup',unlockSubmitButton);
}

/**
 * If use presses enter, submit entry
 */
function pressEnterToSubmit(){
    document.getElementById('food').onkeydown = function(e){
        if(e.keyCode == 13){
            submitClicked();
        }
    };
}

function unlockSubmitButton(){
    let foodInput = $('#food').val();
    if(geoEnabled == true && foodInput !== ""){
        $("#search").removeClass("disabled");
    }
}

/**
 * Once user presses submit, get input and change page
 */

function submitClicked () { 
    let foodInput = $('#food').val();
    if(foodInput == ""){
        $('.noFoodItem').text("please enter a food item in the search bar").css('color','red');
        return; 
    }
    $('.noFoodItem').text('');
    if(urlParams.get('food')){
        food = urlParams.get('food');
        $("#food").val(food);
        initAutocomplete();
        changePage();
    } else {
        food = $("#food").val()
        initAutocomplete();
        changePage();
    } 
}

/**
 *  Changes the page,  
 */
function changePage () {
    $('#titlePage').addClass('hide');
    $('.foodPage').addClass('show').removeClass('hide');
    $('#locationsTab').addClass('disabledTab');
    $('#restaurantTab').addClass('disabledTab');
    if(urlParams.get('food') !== null){
        $("#userFoodSubmission").text(urlParams.get('food'));
    }else {
        $("#userFoodSubmission").text(food);
    }
    nutritionCallFromServer(food);
    showNutrition();
    const newUrlParams = new URLSearchParams(window.location.search.slice(1));
    let newUrlBase = window.location.toString();
    if (newUrlBase.includes('?')){
        newUrlBase = newUrlBase.slice(0, newUrlBase.indexOf('?'));
    }
    newUrlParams.set('food', food);
    history.pushState(null, null, `${newUrlBase}?${newUrlParams.toString()}`);
}
/**
 * Will use session storage to get user
 * input
 */

function enableGeolocation(){
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            let pos;
            if(urlParams.get('lat')!== null && urlParams.get('lng')!== null){
                pos = {
                    lat: parseFloat(urlParams.get('lat')),
                    lng: parseFloat(urlParams.get('lng')),
                }
            } else {
                pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
        }
        userPosition = pos;
        $('#enableGeo').removeClass('pulse');
        geoEnabled=true;
        unlockSubmitButton();
        const newUrlParams = new URLSearchParams(window.location.search.slice(1));
        let newUrlBase = window.location.toString();
        if (newUrlBase.includes('?')){
            newUrlBase = newUrlBase.slice(0, newUrlBase.indexOf('?'));
        }
        newUrlParams.set('lat', userPosition.lat);
        newUrlParams.set('lng', userPosition.lng);
        if(urlParams.get('lat') == null){
        history.pushState(null, null, `${newUrlBase}?${newUrlParams.toString()}`);
        }
    })
}
    }
  


let infoWindow;
let map;
let previousInfoWindow = false;
let previousRoute = false;

/**
 * Apply click handler to the button with the if of findMore that runs the startOver function
 * Apply click handler to reset button and logo that runs the startOver function
 * Apply click handler to reset button that runs the startOver function
 * Populate the search bar with the storage variable foodName
 * Hide the search bar with the id of pac-input
 * Apply a click handler to the button with the id of goThere have it display the model on click
 * @param { none };
 * @returns { none };
 */

/**
 * shows directions modal when user presses get me there button
 */
function modalActivity(){
    let modal = document.getElementById('directionModal');
    $('#goThere').click(function(){
        $('.modal').addClass("show");
    });
    $('.okBtn').click(function(){
        $('.modal').removeClass("show");
    });
    
}

/**
 * Make a function to autosubmit the input data
 * Target the searchbar with the id pac-input
 * focus on 
 * Trigger the input equivalent to the enter button
 */
function submitFormData () {
    let input = document.getElementById('food');
    try {
        google.maps.event.trigger( input, 'focus');
    } finally {
        google.maps.event.trigger( input, 'keydown', {keyCode:13});
    }
}


/**
 * Make a function that hides the picture with an id of pic, shows the map
 * with an id of map. Store the session storage variable as a variable called 
 * if user clicks button, hide the picture and show the map
 * fill the search bar with the variabe foodInput
 * set a timeout to submit the form data after a short delay 1 second
 */
function showMap(){
    mapGenerated = true;
    showLocationList();
    $("#pic").hide();
    $("#map").show();
    $("#findMore").hide();
    submitFormData();
}

/**
 * Make a function that creats a new google map attached to the div with the 
 * id of map, cet the center to the origin, zoom to 13, and mapTypeId to roadmap.
 */

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: userPosition,
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    infoWindow = new google.maps.InfoWindow;
            infoWindow.setPosition(userPosition);
            infoWindow.setContent('You are Here');
            infoWindow.open(map);
            map.setCenter(userPosition);
            previousInfoWindow = infoWindow;
            () => {
            handleLocationError(true, infoWindow, map.getCenter());
        };
   
    // Create the search box and link it to the search bar element with the id of pac-input.
    let input = document.getElementById('food');
    let searchBox = new google.maps.places.SearchBox(input);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    var marker, i;



    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      let places = searchBox.getPlaces();
        if (places.length == 0) {
            let noRestaurantFound = $('<li>').text("No locations found");
            $('.marker-list').append(noRestaurantFound);
            return;
        }
        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
        let bounds = new google.maps.LatLngBounds();
        places.forEach(function(place, index) {
            if (!place.geometry) {
               
                return;
            }

            let infoWindow = new google.maps.InfoWindow({
                content: `${place.name}`,
                pixelOffset: new google.maps.Size(0, 0)
            });
            markerMap[ "marker-" + labelIndex ] = marker 
            var marker = new google.maps.Marker({
                map: map,
                label: labels[labelIndex++ % labels.length],
                title: place.name,
                position: place.geometry.location
            });

            marker.addListener('click', openInfoAndDisplayRoute);

            function openInfoAndDisplayRoute() {
                previousInfoWindow.close();
                showRestaurantInfo();
                infoWindow.open(map, marker);
                previousInfoWindow = infoWindow;
                // break the address up into street address , cit
                const arrayOfString = place.formatted_address.split(',');
                const address = arrayOfString[0];
                const cityName = arrayOfString[1];
                const name = place.name;
                //send name to 
                loveIt(name);
                removeFromFavorites(name);
                // send the relevant data to make the Yelp ajax call
                // send the relevant info to Google Directions
                requestYelpData(name , address, cityName);
                displayRoute( '', place.formatted_address);
            }
            // Get the Favorites string from local storage and covert it into an array
            let favoritesArray, localStorageString, foodEstablishmentName;
            localStorageString = localStorage.getItem("favoritesArray");
            if (localStorageString === null){
                favoritesArray = [];
            } else {
                favoritesArray = localStorageString.split(',');
            }
            
            // Get the location Name
            let locationName = place.name;

            if(favoritesArray.includes(locationName)){
                favoriteLocation = true;
                let favoriteSymbol = $('<i>').addClass("material-icons favIcon pink-text darken-2").text("favorite").css("font-size","inherit");
                foodEstablishmentName = $('<li>').text(`${labels[index]}. ${place.name}`).attr('data-id', `marker-${index}`);
                foodEstablishmentName.append(favoriteSymbol);
            } else {
                favoriteLocation = false;
                foodEstablishmentName = $('<li>').text(`${labels[index]}. ${place.name}`).attr('data-id', `marker-${index}`);
            }
            foodEstablishmentName.on('click', openInfoAndDisplayRoute);
            $('.marker-list').append(foodEstablishmentName);
            // Create a marker for each place.
            markers.push(marker);
            
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

/**
 *
 * @param browserHasGeolocation, passing from initAutocomplete/geolocation
 * @param infoWindow, information that shows on display markers
 * @param pos, position
 * this function is called when not able to find the location
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

/**
 *
 * @param origin
 * @param destination
 * this function display the route on the map
 */
function displayRoute(origin, destination) {
    $("#direction").empty();
    let service = new google.maps.DirectionsService;
    let display = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        panel: document.getElementById('direction')
    });

    service.route({
        origin: userPosition,
        destination: destination,
        travelMode: 'DRIVING',
        drivingOptions:{
            departureTime: new Date(Date.now()),
            trafficModel: 'bestguess',
        },
        avoidTolls: true,
    }, function(response, status) {
        if (status === 'OK') {
            let distance = response.routes[0].legs[0].distance.text
            let duration = response.routes[0].legs[0].duration.text
            appendDrivingInfo(distance,duration);
            if (previousRoute){
                //here we set previous route to null so it clears the previous route
                previousRoute.setMap(null);
            }
            // saved reference of the previous route so we could erase from the map when new destination is clicked
            previousRoute = display;
            display.setDirections(response);
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}

function appendDrivingInfo(distance, duration){
    $('.distance').text(`${distance} from your location`);
    $('.duration').text(`Expected Drive Time: ${duration}`);
}
/**
 * this function calculates the distance of two points
 * @param result, distance of two destinations
 */
function computeTotalDistance(result) {
    let total = 0;
    let myroute = result.routes[0];
    for (let i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    // it displays in km, in future we will converting to miles
    document.getElementById('total').innerHTML = total + ' km';
}

/**
 * callback function. when user presses start over button or logo button, go
 * back to first screen
 */
function startOver(){ 
    // history.pushState(null, null, window.location.pathname);
    const newUrlParams = new URLSearchParams(window.location.search);
    let newUrlBase = window.location.toString();
    newUrlParams.delete("food");
    newUrlBase = newUrlBase.slice(0, newUrlBase.indexOf('?'));
    history.pushState(null, null, `${newUrlBase}?${newUrlParams.toString()}`);
    food='';
    $('#titlePage').addClass('show').removeClass('hide');
    $('.foodPage').addClass('hide').removeClass('show');
    $('#pic').show();
    $('#map').hide();
    $('#findMore').show();
    $('#restaurantTab').off('click');
    $('#locationsTab').off('click');
    $('.loveIt').removeClass("scale-in");
    $('.removeFav').removeClass("scale-in");
    $('#goThere').removeClass("scale-in");
    $('#nutritionTab').css("cursor","default");
    $('#restaurantTab').css("cursor","default");
    $('#locationsTab').css("cursor","default");
    if(mapGenerated){
        recreateSearchBar();
    }
    mapGenerated=false;
    $('.marker-list').empty();
}

function recreateSearchBar(){
    var foodInput = $('<input>', {
        class: "center-align white autocomplete",
        id: "food",
        placeholder: "type food item here",
        type: "text"
    });
    $('.formSection').prepend(foodInput);
    pressEnterToSubmit();
}

/**
 * AJAX call to nutritonix to get nutrition info
 */
function nutritionCallFromServer(){
   let userQuery = food
   let dataForServer = {
       "Content-Type": "application/x-www-form-urlencoded",
    // "x-app-id": "0657689d",
    // "x-app-key": "1c577a065dc2109313e314fdb410b965",
       "x-app-id": "ff571cbd",
       "x-app-key": "f4112a83315f79c5cdff346b54f08998",
       "x-remote-user-id": "0",
       "Cache-Control": "no-cache",
       "query": 'apple',
   };
   let options = {
       dataType: 'json',
       url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
       headers: dataForServer,
       data: {
           'query': userQuery
       },
       method: 'post',
       success: function(response) {
           let src = response.foods[0].photo.highres;
           if( src === null){
               src = "./img/image_not_available.gif";
           }
           let img = $('<img>').attr('src', src);
           
           $('#pic').html(img);
           storeNutritionToDOM(response.foods[0])
       },
       error: function(error){
           if (error.statusText === "Not Found") {
               alert("Couldn't find " + food + "! Press Ok to go back to home screen");
               location.assign("index.html");
               sessionStorage("setFood", "");
           }
       }
   }
   $.ajax(options);
}


/**
 * Updates DOM with nutrition facts
 * @param  {} foodObj the food object retrieved from nutrition api
 */
function storeNutritionToDOM (foodObj) {
   $(".serving").text(foodObj.serving_qty + " " + foodObj.serving_unit);
   $(".calories").text(foodObj.nf_calories + " cal");
   $(".carbohydrate").text(foodObj.nf_total_carbohydrate + " g");
   $(".protein").text(foodObj.nf_protein + " g");
   $(".fat").text(foodObj.nf_total_fat + " g");
   if(foodObj.nf_sugars === null){
    foodObj.nf_sugars = 0;
   }
   $(".sugar").text(foodObj.nf_sugars + " g");
   $(".sodium").text(foodObj.nf_sodium + " mg");
   $(".cholesterol").text(foodObj.nf_cholesterol + " mg");
}

let foodItem = null;
let yelpResponse = null;
   
/**
* @param  {keywordOfAddress, location}
* @return {list of resturants}
* Function that pulls yelp API with keyword/address search and current location (city)
*/
function requestYelpData (name, address, city) {
    $(".yelpTitle").addClass('show');
    $(".yelpInfo").addClass('show');
    let customUrl = "https://yelp.ongandy.com/businesses/matches";
    let key = {
        api_key: "9bPpnQ55-8I0jLR62WqbyvBAv20IJ-zF-WJs7YJgLqZeRqokQg2L995TrDHKUVXEmRblz6We2EMClsxkS4vbfmRLLP5G1cPcV5FFX0fzSi388ha6a1qsHR5J97dWW3Yx",
        name: name,
        address1: address,
        city: city,
        state: "CA",
        country: "US",
    }
    let yelpAPI = {
        data: key,
        url: customUrl,
        method: "POST",
        dataType: "json",
        success: function (response) {
            let businessId= response.businesses[0].id;
            getYelpDetails(businessId);
        },
        error: function (error) {
            console.log("error from requestYelpData: ", error);
        }
    }
    $.ajax(yelpAPI)
}

/**
 * use business id from last ajax call to get more info on business
 * @param id, business id we got from previous call
 */
function getYelpDetails (id) {
    let customUrl = "https://yelp.ongandy.com/businesses/details";
    let key = {
        api_key: "TSNkdteSA6PQZxRGtmXSFcYfaR1KHBUGlZg0YS2n5ryM4Q_UDX3rLw8MPK-fwQO48EQdBOH8qX7BL_jOkzsY_voaJ0PhANXxSNiWjeKfPgpr2cwW4UH9x4R9gN63W3Yx",
        id: id,
      }
      // api_key: 9bPpnQ55-8I0jLR62WqbyvBAv20IJ-zF-WJs7YJgLqZeRqokQg2L995TrDHKUVXEmRblz6We2EMClsxkS4vbfmRLLP5G1cPcV5FFX0fzSi388ha6a1qsHR5J97dWW3Yx
    let yelpAPI = {
        data: key,
        url: customUrl,
        method: "POST",
        dataType: "json",
        success:  createYelpDisplay,
        error: function (error) {
            console.log("error from getYelpDetails: ", error);
        }
    }
    $.ajax(yelpAPI)
}

/**
 * @param  {} object response from yelp api
 * Function the displays the data to dom dynamically
 */
function createYelpDisplay(response) {
    console.log("Errors Occur here :" , response);
    let name = response.name;
    $(".name").text(name);
    let phone = response.display_phone;
    $('.phone').text(phone);
    let price = response.price;
    let reviewCount = response.review_count;
    let rating = response.rating;
    $('.reviews').text( ` ${price}, ${reviewCount} reviews, ${rating}/5 Stars`)
    let type = response.categories[0].title;
    $('.type').text(type);
    let displayAddress = response.location.display_address[0];
    $('.address').text(displayAddress);
    let businessImage = response.image_url;
    $('#yelpImage').attr('src', businessImage);
    let openStatus = response.hours[0].is_open_now;
    if(openStatus) {
        $('.openOrClosed').text("OPEN").css('color','green');
    } else {
        $('.openOrClosed').text("CLOSED").css('color','red');
    }
    $("#goThere").addClass("scale-in");
    
    let localStorageString,favoritesArray;
    localStorageString = localStorage.getItem("favoritesArray");
    if (localStorageString === null){
        favoritesArray = [];
    } else {
        favoritesArray = localStorageString.split(',');
    }
        
    if(favoritesArray.includes(name)){
        $('.removeFav').addClass('scale-in')
    } else{
        $('.loveIt').addClass('scale-in');
    }
    
    
    let yelpReview = $('.yelpLink').attr('target',"_blank").attr('href',response.url);
}

function showNutrition(){
    $('#restaurantInfo').removeClass('show');
    $('#locations').removeClass('show');
    $('.nutrition').addClass('show');
    $('#locationsTab').removeClass('selected');
    $('#restaurantTab').removeClass('selected');
    $('#nutritionTab').addClass("selected").css("cursor","pointer");
    $('#nutritionTab').on('click',showNutrition);
}

function showLocationList(){
    $('#restaurantInfo').removeClass('show');
    $('.nutrition').removeClass('show');
    $('#locations').addClass('show');
    $('#nutritionTab').removeClass('selected');
    $('#restaurantTab').removeClass('selected');
    $('#locationsTab').addClass('selected').removeClass('disabledTab').css("cursor","pointer");
    $('#locationsTab').on('click',showLocationList);
}

function showRestaurantInfo(){
    $('.nutrition').removeClass('show');
    $('#locations').removeClass('show');
    $('#restaurantInfo').addClass('show');
    $('#locationsTab').removeClass('selected');
    $('#nutritionTab').removeClass('selected');
    $('#restaurantTab').addClass('selected').removeClass('disabledTab').css("cursor","pointer");
    $('#restaurantTab').on('click',showRestaurantInfo);
}

function showModal(){
    event.stopPropagation();
    $('.modalContainer').addClass('show');  
}

function removeIntroModal(){
    $('.modalContainer').removeClass('show');
}

function loveIt(restaurantName){
    $('.loveIt').on('click', ()=>{
        let favoritesArray, localStorageString;
        localStorageString = localStorage.getItem("favoritesArray");
        if (localStorageString === null){
            favoritesArray = [];
        } else {
            favoritesArray = localStorageString.split(',');
        }
        favoritesArray.push(restaurantName);
        favoritesArray.join(',');
        localStorage.setItem("favoritesArray", favoritesArray);
        $(".loveIt").removeClass("scale-in");
        $('.removeFav').addClass("scale-in");  
    })  
}

function removeFromFavorites(restaurantName){
    $('.removeFav').on('click',()=>{
        let favoritesArray, localStorageString;
        localStorageString = localStorage.getItem("favoritesArray");
        if (localStorageString === null){
            favoriteArray = [];
        } else {
            favoritesArray = localStorageString.split(',');
        }
        favoritesArray = localStorageString.split(',');
        let editedFavoritesArray = favoritesArray.filter(name => name !== restaurantName);
        editedFavoritesArray.join(',');
        localStorage.setItem("favoritesArray",editedFavoritesArray);
        $(".removeFav").removeClass("scale-in");
        $('.loveIt').addClass("scale-in");  
    })
}
