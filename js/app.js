let webstore = new Vue({
    el: '#classApp',
    data:{
        title: 'After School Adventures',
        lessons: [],
        cart:[],
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
                const response = await fetch(`http://localhost:3000/collections/lesson`);
                this.lessons = await response.json();
            } catch (error) {
                console.error("Error fetching lessons:", error);
            }
        },
        addItemToCart(lesson)
        {
            this.cart.push(lesson.id);
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
        cartCount(id)
        {
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) 
            {
                if (this.cart[i] === id)
                {
                    count++;
                }
            }
            return count;
        },
        canAddToCart(lesson)
        {
            return lesson.spaces > this.cartCount(lesson.id);
        },
        availableSpace(lesson)
        {
            return lesson.spaces - this.cartCount(lesson.id);
        }
    },
    computed:{
        itemInCart:function()
        {
            return this.cart.length > 0 ? "(" + this.cart.length + ")" : "";
        },
        availableSpaces() {
            // Return an object where the keys are lesson ids and the values are available spaces
            let spaces = {};
            this.lessons.forEach(lesson => {
                spaces[lesson.id] = lesson.spaces - this.cartCount(lesson.id);
            });
            return spaces;
        },
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