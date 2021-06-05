new Vue({
    el: "#main",
    data: {
        title: "",
        description: "",
        username: "",
        file: null,
        images: [],
        error: ""
    },

    mounted() {
        axios.get("/images")
            .then(result => this.images = result.data)
            .catch(error => console.log(error));
    },

    methods: {
        selectImg(event) {
            this.file = event.target.files[0];
        },
        uploadImg() {
            try {
                const formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                axios.post("/api/upload", formData)
                    .then(res => {
                        if (res.data.success) this.images.unshift(res.data.images);
                        else this.error = "Upload was unsuccessful. Please Try again";
                    });
            } catch (error) {
                console.log(error, "Something went wrong with the upload.");
            }
        }
    }
});
