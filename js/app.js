let webstore = new Vue({
    el: '#classApp',
    data:{
        title: 'After School Adventures',
        lessons: [],
        showLessons: true,
        selectedSort: '',
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
                const response = await fetch(`http://localhost:3000/lesson`);
                this.lessons = await response.json();
            } catch (error) {
                console.error("Error fetching lessons:", error);
            }
        },
        // addItemToCart(lesson)
        // {
        //     this.cart.push(lesson.id);
        // },
        async addItemToCart(lesson) {
            try {
                const order = {
                    lessonID: lesson.id,
                    quantity: 1
                    // dateAdded: new Date()
                };
      
                // Send POST request to backend API
                const response = await fetch('http://localhost:3000/addOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(order),
                });
      
                if (response.ok) {
                    const result = await response.json();
                    console.log('Order added successfully:', result);
                    // PUT request to update spaces if order was successful
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
                            this.fetchLessons();
                        } else {
                            console.error('Error updating lesson spaces:', updateResponse.statusText);
                        }
                    } catch (error) {
                        console.error('Error in updating spaces:', error);
                    } 
                } else {
                    console.error('Error adding order:', response.statusText);
                }
            } catch (error) {
                console.error('Error in addToCart:', error);
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
        async cartCount(id)
        {
            try {
                // Use query parameters to send the id
                const response = await fetch(`http://localhost:3000/order/count?id=${id}`);
                
                // Ensure response is valid
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
        
                // Parse the JSON response
                const data = await response.json();
        
                // Check if data is valid and has the 'count' property
                if (data && typeof data.count !== 'undefined') {
                    // Ensure the count is an integer
                    const count = parseInt(data.count, 10);
        
                    // Return the integer count or 0 if it's NaN
                    return Number.isNaN(count) ? 0 : count;
                } else {
                    return 0;
                }
            } catch (error) {
                console.error("Error fetching order count:", error);
                return 0;  // Return 0 if there's an error or invalid response
            }

            // let count = 0;
            // for (let i = 0; i < this.cart.length; i++) 
            // {
            //     if (this.cart[i] === id)
            //     {
            //         count++;
            //     }
            // }
            // return count;
        },
        async canAddToCart(lesson)
        {   
            console.log(lesson.spaces);
            const count = await this.cartCount(lesson.id);  // Ensure you await the result here
            console.log(count); 
            // console.log(this.cartCount(lesson.id));
            console.log(lesson.spaces > count);
            return lesson.spaces > count;
        },
        // availableSpace(lesson)
        // {
        //     return lesson.spaces - this.cartCount(lesson.id);
        // }
    },
    computed:{
        // itemInCart:function()
        // {
        //     // return this.cart.length > 0 ? "(" + this.cart.length + ")" : "";
        //     return this.cartCount();
        // },
        itemInCart()
        {
            const count = this.cartCount;
            console.log(count); 
            return count > 0 ? "(" + count + ")" : "";
        },
        // availableSpaces() {
        //     // Return an object where the keys are lesson ids and the values are available spaces
        //     let spaces = {};
        //     this.lessons.forEach(lesson => {
        //         spaces[lesson.id] = lesson.spaces - this.cartCount(lesson.id);
        //     });
        //     return spaces;
        // },
        // sortedLessons() {
        //     let sortedLessons = [...this.lessons];  // Clone the lessons array to avoid mutating the original

        //     if (this.selectedSort === 'price') {
        //         sortedLessons = sortedLessons.sort((a, b) => a.price - b.price);
        //     } else if (this.selectedSort === 'subject') {
        //         sortedLessons = sortedLessons.sort((a, b) => a.subject.localeCompare(b.subject));
        //     } else if (this.selectedSort === 'location') {
        //         sortedLessons = sortedLessons.sort((a, b) => a.location.localeCompare(b.location));
        //     } else if (this.selectedSort === 'spaces') {
        //         sortedLessons = sortedLessons.sort((a, b) => this.availableSpaces[a.id] - this.availableSpaces[b.id]);
        //     }

        //     // Sort in ascending or descending order based on the radio button
        //     if (this.sortOrder === 'desc') {
        //         sortedLessons.reverse();
        //     }

        //     return sortedLessons;
        // }
    },
    mounted() {
        // Fetch data when the Vue component is mounted
        this.fetchLessons();
    }
})