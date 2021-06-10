Vue.component("upload-image-modal-component", {
    template: "#upload-image-modal-component",
    data() {
        return {
            visible: false,
            id: "",
            title: "",
            description: "",
            username: "",
            tags: [],
            file: null,
            size: 0,
            step: 1,
            error: "",
            loading: false
        };
    },
    methods: {
        toggle() {
            this.visible = !this.visible;
        },
        reset() {
            this.id = "";
            this.title = "";
            this.description = "";
            this.tags = [];
            this.file = null;
            this.size = 0;
            this.error = "";
            this.step = 1;
            this.loading = false;
        },
        selectImg(event) {
            this.file = event.target.files[0];
            this.size = (this.file.size / 1024 / 1024).toFixed(2);
            this.step = 2;
        },
        uploadImg() {
            try {
                this.loading = true;
                const formData = new FormData();
                formData.append("title", this.title);
                if (!this.title) throw "You must enter a title";
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                formData.append("tags", this.tags);
                axios.post("/api/upload", formData)
                    .then(res => {
                        if (res.data.success) {
                            this.$emit("uploaded", ...res.data.images);
                            this.tags = res.data.images[0].tags;
                            this.id = res.data.images[0].id;
                            this.step = 3;
                        }
                        else this.error = "Upload was unsuccessful. Please Try again";
                    });
            } catch (error) {
                this.loading = false;
                this.error = error;
            }
        },
        setTags() {
            axios.post("/api/tags", { id: this.id, tags: this.tags })
                .then(res => {
                    this.tags = res.data;
                    this.visible = false;
                })
                .catch(error => console.log(error));
        }
    }
});

Vue.component("image-modal-component", {
    template: "#image-modal-component",
    props: ["imageId"],
    data() {
        return {
            image: null,
            date: "",
            tags: ""
        };
    },
    mounted() {
        this.getImages();
    },
    watch: {
        imageId: function () {
            this.getImages();
        }
    },
    methods: {
        getImages() {
            axios.get(`/api/images/${this.imageId}`)
                .then(res => {
                    if (res.data.success) {
                        this.image = res.data.image;
                        this.date = `${(new Date(this.image.created_at)).getMonth()}/${(new Date(this.image.created_at)).getFullYear()}`;
                        this.tags = this.image.tags ? this.image.tags.map(tag => "#" + tag) : "";
                    }
                })
                .catch(error => console.log(error));
        },
        closeMethod() {
            this.$emit("close");
        },
        deleteImage() {
            this.$emit("delete", this.image.id);
            axios.delete(`/api/delete/${this.imageId}`);
            this.closeMethod();
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
        this.getComments();
    },
    watch: {
        imageId: function () {
            this.comments = [];
            this.getComments();
        }
    },
    methods: {
        getComments() {
            axios.get(`/comments/${this.imageId}`)
                .then(res => {
                    if (res.data.success) {
                        this.comments = res.data.comments;
                    }
                })
                .catch(error => console.log(error));
        },
        makeComment() {
            try {
                if (!this.comment) throw "empty";
                axios
                    .post("/comment", {
                        comment: this.comment,
                        username: this.username || "anonymous",
                        imageId: this.imageId
                    })
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
        imageSelected: location.hash.slice(1),
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
        window.addEventListener("hashchange", () => {
            this.imageSelected = location.hash.slice(1);
        });
    },
    methods: {
        renderNewImages(newImg) {
            this.images.unshift(newImg);
            this.totalImageCount++;
        },
        closeModal() {
            this.imageSelected = null;
            history.pushState(null, null, "/");
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
