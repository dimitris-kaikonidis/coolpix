new Vue({

    el: "#main",
    data: {
        images: []
    },

    mounted() {
        axios.get("/images")
            .then(result => this.images = result.data)
            .catch(error => console.log(error));
    },

    methods: {

    }
});
