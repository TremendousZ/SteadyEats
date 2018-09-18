// $(document).ready(initializeApp);
// let foodItem = sessionStorage.setFood;
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
        api_key: "9bPpnQ55-8I0jLR62WqbyvBAv20IJ-zF-WJs7YJgLqZeRqokQg2L995TrDHKUVXEmRblz6We2EMClsxkS4vbfmRLLP5G1cPcV5FFX0fzSi388ha6a1qsHR5J97dWW3Yx",
        id: id,
      }
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
}