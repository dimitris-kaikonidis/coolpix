Vue.component("upload-image-modal-component", {
    template: "#upload-image-modal-component",
    data() {
        return {
            visible: false,
            title: "",
            description: "",
            username: "" || "anonymous",
            file: null,
            size: 0,
            error: ""
        };
    },
    methods: {
        toggle() {
            this.visible = !this.visible;
        },
        reset() {
            this.title = "";
            this.description = "";
            this.file = null;
            this.size = 0;
            this.error = "";
        },
        selectImg(event) {
            this.file = event.target.files[0];
            this.size = (this.file.size / 1024 / 1024).toFixed(2);
        },
        uploadImg() {
            try {
                const formData = new FormData();
                formData.append("title", this.title);
                if (!this.title) throw "You must enter a title";
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                axios.post("/api/upload", formData)
                    .then(res => {
                        if (res.data.success) {
                            this.$emit("uploaded", ...res.data.images);
                            this.visible = false;
                        }
                        else this.error = "Upload was unsuccessful. Please Try again";
                    });
            } catch (error) {
                this.error = error;
            }
        }
    }
});

Vue.component("image-modal-component", {
    template: "#image-modal-component",
    props: ["imageId"],
    data() {
        return {
            image: null,
            date: ""
        };
    },
    mounted() {
        axios.get(`/api/images/${this.imageId}`)
            .then(res => {
                if (res.data.success) {
                    this.image = res.data.image;
                    this.date = `${(new Date(this.image.created_at)).getMonth()}/${(new Date(this.image.created_at)).getFullYear()}`;
                }
            })
            .catch(error => console.log(error));
    },
    methods: {
        closeMethod() {
            this.$emit("close");
        },
        deleteImage() {
            this.$emit("delete", this.imageId);
        },
        next() {
            this.$emit("next", this.image.next_id);
        },
        prev() {
            this.$emit("prev", this.image.prev_id);
        }
    },
});

Vue.component("comment-component", {
    template: "#comment-component",
    props: ["imageId"],
    data() {
        return {
            comments: [],
            username: "",
            comment: "",
            error: ""
        };
    },
    mounted() {
        axios.get(`/comments/${this.imageId}`)
            .then(res => {
                if (res.data.success) {
                    this.comments = res.data.comments;
                }
            })
            .catch(error => console.log(error));
    },
    methods: {
        makeComment() {
            try {
                if (!this.comment) throw "empty";
                axios.post("/comment", { comment: this.comment, username: this.username || "anonymous", imageId: this.imageId })
                    .then(res => this.comments.unshift(res.data))
                    .catch(error => console.log(error));
            } catch (error) {
                this.error = error;
            }
        },
        reset() {
            this.comment = "";
        }
    }
});

new Vue({
    el: "#main",
    data: {
        images: [],
        imageSelected: null,
        error: "",
        totalImageCount: 0,
        remainingImagesCount: 0,
        scrollable: this.remainingImagesCount ? true : false
    },

    mounted() {
        axios.get("/api/images/first")
            .then(result => {
                this.images = result.data;
                this.totalImageCount = result.data[0].count;
                this.remainingImagesCount = this.totalImageCount - 16 > 0 ? this.totalImageCount - 16 : 0;
            })
            .catch(error => console.log(error));
    },

    methods: {
        renderNewImages(newImg) {
            this.images.unshift(newImg);
            this.totalImageCount++;
        },
        closeModal() {
            this.imageSelected = null;
        },
        filterImages(id) {
            this.images = this.images.filter(image => image.id !== id);
            this.imageSelected = null;
        },
        loadMoreImages() {
            try {
                const lastId = this.images[this.images.length - 1].id;
                axios.get(`api/images/next/${lastId}`)
                    .then(result => {
                        this.images.push(...result.data);
                        this.remainingImagesCount = this.remainingImagesCount - 16 > 0 ? this.remainingImagesCount - 16 : 0;
                    })
                    .catch(error => console.log(error));
            } catch (error) {
                return;
            }

        },
        next(id) {
            this.imageSelected = id;
        },
        prev(id) {
            this.imageSelected = id;
        }
    }
});
