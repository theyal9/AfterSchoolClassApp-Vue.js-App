let webstore = new Vue({
    el: '#classApp',
    data:{
        title: 'After School Adventures',
        lessons: [],
        cart: [],
        cartCount: 0,
        showLessons: true,
        selectedLessons: [], // Store selected lessons for checkout
        showCart: true,
        showCheckoutDetails: false,
        showSelectedLessons: false, // Toggle between pages
        selectedSort: 'subject',
        sortOrder: 'asc',
        order: {
            firstName: '',
            lastName: '',
            address: '',
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
        async addItemToCart(lesson) {
            // PUT request to update spaces
            try {
                const spaceChange = -1;

                const updateResponse = await fetch(`http://localhost:3000/lesson/${lesson.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        spaces: spaceChange
                    }),
                });

                if (updateResponse.ok) {
                    const updatedLesson = await updateResponse.json();
                    console.log('Lesson spaces updated successfully:', updatedLesson);
                    this.cart.push(lesson);
                    this.fetchLessons();
                } else {
                    console.error('Error updating lesson spaces:', updateResponse.statusText);
                }
            } catch (error) {
                console.error('Error in updating spaces:', error);
            } 
            // try {
            //     const order = {
            //         lessonID: lesson.id,
            //         quantity: 1
            //         // dateAdded: new Date()
            //     };
      
            //     // Send POST request to backend API
            //     const response = await fetch('http://localhost:3000/addOrder', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify(order),
            //     });
      
            //     if (response.ok) {
            //         const result = await response.json();
            //         console.log('Order added successfully:', result);
            //         // PUT request to update spaces if order was successful
            //         try {
            //             const spaceChange = -1;

            //             const updateResponse = await fetch(`http://localhost:3000/lesson/${lesson.id}`, {
            //                 method: 'PUT',
            //                 headers: {
            //                     'Content-Type': 'application/json',
            //                 },
            //                 body: JSON.stringify({
            //                     spaces: spaceChange
            //                 }),
            //             });

            //             if (updateResponse.ok) {
            //                 const updatedLesson = await updateResponse.json();
            //                 console.log('Lesson spaces updated successfully:', updatedLesson);
            //                 this.fetchLessons();
            //                 // this.numOfItemsInCart = this.itemInCart();
            //             } else {
            //                 console.error('Error updating lesson spaces:', updateResponse.statusText);
            //             }
            //         } catch (error) {
            //             console.error('Error in updating spaces:', error);
            //         } 
            //     } else {
            //         console.error('Error adding order:', response.statusText);
            //     }
            // } catch (error) {
            //     console.error('Error in addToCart:', error);
            // }
        },
        async removeItemFromCart(lesson) {
            // PUT request to update spaces
            try {
                const spaceChange = 1;

                const updateResponse = await fetch(`http://localhost:3000/lesson/${lesson.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        spaces: spaceChange
                    }),
                });

                if (updateResponse.ok) {
                    const updatedLesson = await updateResponse.json();
                    console.log('Lesson spaces updated successfully:', updatedLesson);
                    // Remove the lesson from the cart
                    const index = this.cart.findIndex(item => item.id === lesson.id);
                    if (index !== -1) {
                        this.cart.splice(index, 1); // Remove 1 item at the found index
                    }
                    // this.fetchCartLessons();
                } else {
                    console.error('Error updating lesson spaces:', updateResponse.statusText);
                }
            } catch (error) {
                console.error('Error in updating spaces:', error);
            } 
        },
        showCheckout()
        {
            if (this.showLessons)
            {
                this.showLessons = false;
            } else {
                this.showLessons = true;
            }
        },
        submitForm() 
        {
            alert('Order submitted!')
        },
        async getCartCount(id)
        {
            try {
                // Use query parameters to send the id
                const response = await fetch(`http://localhost:3000/order/count/${id}`);
                
                // Ensure response is valid
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
        
                // Parse the JSON response
                const data = await response.json();
        
                // Check if data is valid and has the 'quantity' property
                if (data && typeof data.quantity !== 'undefined') {
                    // // Ensure the quantity is an integer
                    // const quantity = parseInt(data.quantity, 10);
        
                    // // Return the integer quantity or 0 if it's NaN
                    // return Number.isNaN(quantity) ? 0 : quantity;
                    this.cartCount = data.quantity || 0;
                } else {
                    return 0;
                }
            } catch (error) {
                // console.error("Error fetching order quantity:", error);
                return 0;  // Return 0 if there's an error or invalid response
            }
        },
        toggleSelectedView() {
            if (this.showCart) {
                // Go back to the selection page
                this.showCart = false;
            } else {
                // Proceed to the checkout page with selected items only
                this.showCart = true;
            }
        },
        toggleShowCheckoutDetails() {
            if (this.showCart) {
                // Go back to the selection page
                this.showCheckoutDetails = false;
            } else {
                this.showCheckoutDetails = true;
            }
        }
    },
    computed:{
        // itemInCart() {
        //     const count = this.getCartCount();  // Await the asynchronous cartCount function
        //     console.log("Cart orders amounted to:", count); 
        //     // return count > 0 ? `(${count})` : "";
        //     return count > 0 ? "(" + count + ")" : "";
        // }
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
        }
    },
    mounted() {
        // Fetch data when the Vue component is mounted
        this.fetchLessons();
        this.getCartCount();
        // this.numOfItemsInCart = this.itemInCart(); 
    }
})