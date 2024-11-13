let webstore = new Vue({
    el: '#classApp',
    data:{
        title: 'After School Adventures',
        lessons: [],
        cart: [],
        showLessons: true,
        showCheckoutDetails: false,
        selectedSort: 'subject',
        sortOrder: 'asc',
        isFormValid: false,
        searchQuery: '', 
        searchResults: [], // Store the search results here
        isSearching: false, // Indicate whether search results are being displayed    
        order: {
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            city: '',
            zip: '',
            state: '',
            method: 'Home',
            sendGift: 'Send as a gift',
            dontSendGift: 'Do not send as a gift'
        },
        states: {
            AL: 'Alabam',
            AR: 'Arizona',
            CA: 'California',
            NV: 'Nevada'
        },
        sortBy: {
            Subject: 'subject',
            Location: 'location',
            Price: 'price',
            Spaces: 'spaces'
        }
    },
    methods:{
        async fetchLessons() {
            try {
                const response = await fetch(`http://localhost:3000/lesson/20/${this.selectedSort}/${this.sortOrder}`);
                this.lessons = await response.json();
            } catch (error) {
                console.error("Error fetching lessons:", error);
            }
        },
        lessonCartCount(id) {
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === id) {
                    count++;
                }
            }
            return count;
        },
        addItemToCart(lesson) {
            const lessonWithId = { ...lesson, uniqueId: lesson.id + '-' + (lesson.spaces - this.lessonCartCount(lesson.id)) };
            this.cart.push(lessonWithId);
        },        
        removeItemFromCart(lesson) {
            const index = this.cart.findIndex(item => item.id === lesson.id);
            if (index !== -1) {
                this.cart.splice(index, 1); 
            }
        },
        showCartItems()
        {
            if (this.showLessons)
            {
                this.showLessons = false;
            } else {
                this.showLessons = true;
            }
            this.fetchLessons();
        },
        // Validation function for Name (letters only) and Phone (numbers only)
        validateForm() {
            const nameRegex = /^[A-Za-z\s]+$/;
            const phoneRegex = /^[0-9]+$/;

            // Validate fields
            this.isFormValid = nameRegex.test(this.order.firstName) && 
                               nameRegex.test(this.order.lastName) &&
                               phoneRegex.test(this.order.phoneNumber) &&
                               this.order.address.trim() &&
                               this.order.city.trim() &&
                               this.order.zip.trim() &&
                               this.order.state.trim() &&
                               this.order.method.trim();
        },
        async submitOrder() {
            if (this.isFormValid) {
                const orderSuccess = await this.placeOrder();
                if (orderSuccess) {
                    this.showCheckoutDetails = !this.showCheckoutDetails;
                    alert("Order has been submitted!");
                    this.resetOrderForm();
                    this.showLessons = true;
                } else {
                    alert("There was an issue submitting your order. Please try again.");
                }
            }
            console.log(this.showCheckoutDetails);
        },         

        async placeOrder() 
        {       
            let orderSuccessfull = true;
            let lessonsOrdered = [];
            let lessonsOrderedData = [];
            
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
                        quantity: 1
                    });
                    lessonsOrderedData.push({
                        id: lesson.id,
                        quantity: 1
                    });
                }
            }
         
            const orderData = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                address: this.order.address,
                city: this.order.city,
                zip: this.order.zip,
                state: this.order.state,
                phoneNumber: this.order.phoneNumber,
                method: this.order.method,
                sendGift: this.order.sendGift,
                lessonIDs: lessonsOrderedData
            };
        
            try {
                console.log(lessonsOrderedData);
                // Send the order data to the backend via a POST request
                const response = await fetch('http://localhost:3000/addOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',  // Specify content type as JSON
                    },
                    body: JSON.stringify(orderData)  // Convert the order data to JSON
                });
        
                if (response.ok) {
                    const data = await response.json();

                    for (let i = 0; i < lessonsOrdered.length; i++) {
                        const lesson = lessonsOrdered[i];
                        try {
                            const updateResponse = await fetch(`http://localhost:3000/lesson/${lesson.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    spaces: lesson.spaces - this.lessonCartCount(lesson.id)
                                }),
                            });
                
                            if (updateResponse.ok) {
                                const updatedLesson = await updateResponse.json();
                                console.log('Lesson spaces updated successfully:', updatedLesson);
                            } else {
                                console.error('Error updating lesson spaces:', updateResponse.statusText);
                                return false;
                            }
                        } catch (error) {
                            console.error('Error in updating spaces:', error);
                            return false;
                        }
                    }

                } else {
                    console.error('Error submitting order:', response.statusText);
                    return false;
                }
            } catch (error) {
                console.error('Error sending order:', error);
                return false;
            }
            this.cart=[];
            return orderSuccessfull;
        },   
        resetOrderForm() {
            // Reset the order object fields after submitting the order
            this.order = {
                firstName: '',
                lastName: '',
                address: '',
                city: '',
                zip: '',
                state: '',
                method: 'Home',
                sendGift: 'Send as a gift',
                dontSendGift: 'Do not send as a gift',
                phoneNumber: ''
            };
        },

        async performSearch() {
            if (this.searchQuery.trim() === '') {
                this.isSearching = false;
                this.searchResults = [];
                this.fetchLessons();
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:3000/search/${encodeURIComponent(this.searchQuery)}`);
                this.searchResults = await response.json();
                this.isSearching = true;
            } catch (error) {
                console.error("Error performing search:", error);
            }
        }
    },
    computed:{
        itemInCart() {
            return this.cart.length > 0 ? "(" + this.cart.length + ")" : "";
        }
    },
    watch: {
        selectedSort() {
            this.fetchLessons();
        },
        sortOrder() {
            this.fetchLessons();
        },
        showLessons()
        {
            this.fetchLessons();
        },
        // searchQuery: 'searchLessons',
        searchQuery: 'performSearch',
        // Watch the Name and Phone fields to validate form in real-time
        'order.firstName': 'validateForm',
        'order.phoneNumber': 'validateForm',
        'order.address': 'validateForm',
        'order.phoneNumber': 'validateForm',
        'order.city': 'validateForm',
        'order.zip': 'validateForm',
        'order.state': 'validateForm',
        'order.method': 'validateForm'
    },
    mounted() {
        // Fetch data when the Vue component is mounted
        this.fetchLessons();
    }
})