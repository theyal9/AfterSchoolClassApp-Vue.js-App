let webstore = new Vue({
    el: '#classApp',
    data:{
        title: 'After School Adventures',
        lessons: [],
        cart: [],
        cartCount: 0,
        showLessons: true,
        showCheckoutDetails: false,
        selectedSort: 'subject',
        sortOrder: 'asc',
        isFormValid: false,
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
        },
        // Validation function for Name (letters only) and Phone (numbers only)
        validateForm() {
            const nameRegex = /^[A-Za-z\s]+$/;
            const phoneRegex = /^[0-9]+$/;

            // Validate the Name and Phone fields
            this.isFormValid = nameRegex.test(this.order.firstName) && 
                                nameRegex.test(this.order.lastName) &&
                               phoneRegex.test(this.order.phoneNumber);
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
        async placeOrder() {
            let orderSuccessful = true;
        
            // Copy of the cart to iterate over while modifying original cart
            const cartCopy = [...this.cart];
        
            for (let i = 0; i < cartCopy.length; i++) {
                const lesson = cartCopy[i];
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
                        
                        // Remove the lesson from the original cart
                        const index = this.cart.findIndex(item => item.id === lesson.id);
                        if (index !== -1) {
                            this.cart.splice(index, 1);
                        }
                    } else {
                        console.error('Error updating lesson spaces:', updateResponse.statusText);
                        orderSuccessful = false;
                    }
                } catch (error) {
                    console.error('Error in updating spaces:', error);
                    orderSuccessful = false;
                } 
            }
            this.fetchLessons();
            return orderSuccessful;
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

        // Watch the Name and Phone fields to validate form in real-time
        'order.firstName': 'validateForm',
        'order.phoneNumber': 'validateForm'
    },
    mounted() {
        // Fetch data when the Vue component is mounted
        this.fetchLessons();
    }
})