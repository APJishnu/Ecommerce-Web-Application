function addToCart(button, proId) {
    // Disable the button to prevent multiple clicks
    button.disabled = true;
  
    $.ajax({
      url: '/add-to-cart/' + proId,
      method: 'get',
      success: function (response) {
        if (response.status) {
          let count = $('#cart-count').html();
          count = parseInt(count) + 1;
          $("#cart-count").html(count);
  
          // Call the function to update the button
          updateButton(button);
        } else {
          // If the user is not logged in, redirect to the login page
          window.location.href = '/login';
        }
      },
      error: function (xhr, status, error) {
        // Handle the error
        console.error(xhr.responseText);
      },
      complete: function () {
        // Re-enable the button after the request is complete
        button.disabled = false;
      }
    });
  }
  
  // Function to update the button after a successful add-to-cart operation
  function updateButton(button) {
    // Change the button text to "Go to Cart"
    button.innerText = 'Go to Cart';
    button.setAttribute('onclick', 'goToCart()'); // Add an onclick event for "Go to Cart" functionality
    button.classList.remove('btn-warning'); // Remove the warning class
    button.classList.add('btn-success'); // Add the success class
    
  }
  
  // Function to handle "Go to Cart" button click
  function goToCart() {
    // Redirect the user to the cart page
    window.location.href = '/cart';
  }
  


  //rating functions 
  // Get all elements with the class "average-rating"
const averageRatingElements = document.querySelectorAll('.average-rating');

// Loop through each "average-rating" element
averageRatingElements.forEach((element) => {
  // Get the average rating from the data attribute
  const averageRating = parseFloat(element.dataset.average);
  // Calculate the number of full stars
  const fullStars = Math.floor(averageRating);
  // Check if there is a half star
  const hasHalfStar = averageRating % 1 !== 0;

  // Create an array to hold the star elements with appropriate colors
  const starIcons = [];

  // Add full stars with yellow color to the array
  for (let i = 0; i < fullStars; i++) {
    starIcons.push('<span class="fa fa-star checked" style="color: yellow;"></span>');
  }

  // Add half star with yellow color if necessary
  if (hasHalfStar) {
    starIcons.push('<span class="fa fa-star-half-alt checked" style="color: yellow;"></span>');
  }

  // Add empty stars with black color to fill up to 5 stars
  for (let i = starIcons.length; i < 5; i++) {
    starIcons.push('<span class="fa fa-star" style="color: black;"></span>');
  }

  // Set the HTML content of the "average-rating" element to the star icons
  element.innerHTML = starIcons.join('');
});
//rating functionsss 