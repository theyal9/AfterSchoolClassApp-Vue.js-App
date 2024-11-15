let webstore = new Vue({
    el: '#classApp', // Bind Vue instance to the HTML element with id 'classApp'
    data: {
        title: 'After School Adventures', // Title of the web store
        lessons: [], // Array to hold lessons fetched from the server
        cart: [], // Array to hold items added to the cart
        showLessons: true, // Flag to toggle the display of lessons
        showCheckoutDetails: false, // Flag to toggle the display of checkout details
        selectedSort: 'subject', // Default sorting criterion for lessons
        sortOrder: 'asc', // Default sorting order (ascending)
        isFormValid: false, // Flag to indicate whether the order form is valid
        searchQuery: '', // Search query entered by the user
        searchResults: [], // Store the search results here
        isSearching: false, // Indicate whether search results are being displayed    
        order: { // Object to hold order details
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            city: '',
            zip: '',
            state: '',
            method: 'Home', // Default shipping method
            sendGift: 'Send as a gift',
            dontSendGift: 'Do not send as a gift'
        },
        states: { // Object to hold US states
            AL: 'Alabama',
            AR: 'Arizona',
            CA: 'California',
            NV: 'Nevada'
        },
        sortBy: { // Object to hold sorting options
            Subject: 'subject',
            Location: 'location',
            Price: 'price',
            Spaces: 'spaces'
        }
    },
    methods: {
        // Fetch lessons from the server based on selected sorting criteria
        async fetchLessons() {
            try {
                const response = await fetch(`http://localhost:3000/lesson/20/${this.selectedSort}/${this.sortOrder}`);
                this.lessons = await response.json(); // Store fetched lessons in the lessons array
            } catch (error) {
                console.error("Error fetching lessons:", error); // Log any errors that occur
            }
        },
        // Count how many times a lesson is in the cart
        lessonCartCount(id) {
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === id) {
                    count++; // Increment count for each occurrence of the lesson in the cart
                }
            }
            return count; // Return the total count
        },
        // Add a lesson to the cart
        addItemToCart(lesson) {
            const lessonWithId = { 
                ...lesson, 
                uniqueId: lesson.id + '-' + (lesson.spaces - this.lessonCartCount(lesson.id)) // Create a unique ID based on spaces left
            };
            this.cart.push(lessonWithId); // Add the lesson to the cart
        },        
        // Remove a lesson from the cart
        removeItemFromCart(lesson) {
            const index = this.cart.findIndex(item => item.id === lesson.id); // Find index of lesson in the cart
            if (index !== -1) {
                this.cart.splice(index, 1); // Remove the lesson from the cart
            }
        },
        // Toggle the display of cart items
        showCartItems() {
            this.showLessons = !this.showLessons; // Toggle the showLessons flag
            this.fetchLessons(); // Fetch lessons again after toggling
        },
        // Validate the order form
        validateForm() {
            const nameRegex = /^[A-Za-z\s]+$/; // Regex for validating names (letters)
            const phoneRegex = /^[0-9]+$/; // Regex for validating phone numbers (digits)

            // Validate all form fields
            this.isFormValid = nameRegex.test(this.order.firstName) && 
                               nameRegex.test(this.order.lastName) &&
                               phoneRegex.test(this.order.phoneNumber) &&
                               this.order.address && this.order.city &&
                               this.order.zip && this.order.state &&
                               this.order.method;
        },
        // Submit the order
        async submitOrder() {
            if (this.isFormValid) { // Check if form is valid before submitting
                const orderSuccess = await this.placeOrder(); // Attempt to place the order
                if (orderSuccess) {
                    this.showCheckoutDetails = !this.showCheckoutDetails; // Toggle checkout details display
                    alert("Order has been submitted!"); // Notify user of successful order submission
                    this.resetOrderForm(); // Reset the order form fields
                    this.showLessons = true; // Show lessons again
                } else {
                    alert("There was an issue submitting your order. Please try again."); // Notify user of submission failure
                }
            }
            console.log(this.showCheckoutDetails); // Log the current state of checkout details display
        },         

        // Place the order and update lesson spaces
        async placeOrder() {       
            let orderSuccessful = true; // Flag to track order success
            let lessonsOrdered = []; // Array to hold lessons ordered
            let lessonsOrderedData = []; // Array to hold lesson data for the order
            
            for (let i = 0; i < this.cart.length; i++) {
                const lesson = this.cart[i];
            
                // Check if the lesson is already in the lessonsOrdered array
                let lessonFound = false;
                for (let j = 0; j < lessonsOrdered.length; j++) {
                    if (lessonsOrdered[j].id === lesson.id) {
                        // If found, increase the quantity by count
                        lessonsOrdered[j].quantity += 1;
                        lessonsOrderedData[j].quantity += 1;
                        lessonFound = true;
                        break; // Exit loop once found
                    }
                }
            
                // If lesson wasn't found, add it to the array
                if (!lessonFound) {
                    lessonsOrdered.push({
                        id: lesson.id,
                        spaces: lesson.spaces,
                        quantity: 1 // Initialize quantity to 1
                    });
                    lessonsOrderedData.push({
                        id: lesson.id,
                        quantity: 1 // Initialize quantity to 1 for ordered data
                    });
                }
            }
         
            const orderData = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                address: this.order.address,
                phoneNumber: this.order.phoneNumber,
                city: this.order.city,
                state: this.order.state,
                zip: this.order.zip,
                sendGift: this.order.sendGift,
                method: this.order.method,
                lessonIDs: lessonsOrderedData // Include lesson IDs in the order data
            };
        
            try {
                console.log(lessonsOrderedData); // Log the ordered lesson data
                // Send the order data to the backend via a POST request
                const response = await fetch('http://localhost:3000/addOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',  // Specify content type as JSON
                    },
                    body: JSON.stringify(orderData)  // Convert the order data to JSON
                });
        
                if (response.ok) {
                    const data = await response.json(); // Parse the response data

                    for (let i = 0; i < lessonsOrdered.length; i++) {
                        const lesson = lessonsOrdered[i];
                        try {
                            const updateResponse = await fetch(`http://localhost:3000/lesson/${lesson.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    spaces: lesson.spaces - this.lessonCartCount(lesson.id) // Update spaces based on cart count
                                }),
                            });
                
                            if (updateResponse.ok) {
                                const updatedLesson = await updateResponse.json(); // Parse the updated lesson response
                                console.log('Lesson spaces updated successfully:', updatedLesson); // Log success message
                            } else {
                                console.error('Error updating lesson spaces:', updateResponse.statusText); // Log error message
                                return false; // Return false if update fails
                            }
                        } catch (error) {
                            console.error('Error in updating spaces:', error); // Log any errors during update
                            return false; // Return false if an error occurs
                        }
                    }

                } else {
                    console.error('Error submitting order:', response.statusText); // Log error message for order submission
                    return false; // Return false if submission fails
                }
            } catch (error) {
                console.error('Error sending order:', error); // Log any errors during order sending
                return false; // Return false if an error occurs
            }
            this.cart = []; // Clear the cart after successful order
            return orderSuccessful; // Return the success status of the order
        },   
        // Reset the order form fields after submitting the order
        resetOrderForm() {
            this.order = {
                firstName: '',
                lastName: '',
                address: '',
                city: '',
                zip: '',
                state: '',
                method: 'Home', // Reset to default shipping method
                sendGift: 'Send as a gift',
                dontSendGift: 'Do not send as a gift',
                phoneNumber: ''
            };
        },

        // Perform search based on user input
        async performSearch() {
            if (this.searchQuery.trim() === '') {
                this.isSearching = false; // Reset search state this.searchResults = []; // Clear search results
                this.fetchLessons(); // Fetch all lessons if search query is empty
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:3000/search/${encodeURIComponent(this.searchQuery)}`); // Fetch search results from the server
                this.searchResults = await response.json(); // Store search results
                this.isSearching = true; // Set searching state to true
            } catch (error) {
                console.error("Error performing search:", error); // Log any errors that occur during search
            }
        }
    },
    computed: {
        // Compute the number of items in the cart for display
        itemInCart() {
            return this.cart.length > 0 ? "(" + this.cart.length + ")" : ""; // Return the count of items or an empty string
        }
    },
    watch: {
        // Watch for changes in sorting criteria and fetch lessons accordingly
        selectedSort() {
            this.fetchLessons(); // Fetch lessons when selected sort changes
        },
        sortOrder() {
            this.fetchLessons(); // Fetch lessons when sort order changes
        },
        showLessons() {
            this.fetchLessons(); // Fetch lessons when the display toggle changes
        },
        // Watch for changes in the search query and perform search
        searchQuery: 'performSearch',
        // Watch the Name and Phone fields to validate form in real-time
        'order.firstName': 'validateForm',
        'order.phoneNumber': 'validateForm',
        'order.address': 'validateForm',
        'order.city': 'validateForm',
        'order.zip': 'validateForm',
        'order.state': 'validateForm',
        'order.method': 'validateForm'
    },
    mounted() {
        // Fetch data when the Vue component is mounted
        this.fetchLessons(); // Initial fetch of lessons
    }
})