$(document).ready(initializeApp);

let food = sessionStorage.getItem("setFood");

/**
 * Once DOM is ready, get nutrition from server and add animations
 * to submit and reset button
 */
function initializeApp(){
    $(".submit").addClass("scale-in");
    $("#reset").addClass("scale-in");
    nutritionCallFromServer();
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