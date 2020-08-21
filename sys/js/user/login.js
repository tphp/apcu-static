if(axios !== undefined) {
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded';
    axios.defaults.transformRequest = [function (data) {
        var ret_list = []
        for (var it in data) {
            ret_list.push(encodeURIComponent(it) + '=' + encodeURIComponent(data[it]));
        }
        return ret_list.join("&")
    }];
}

new Vue({
    el: '#app',
    data: {
        username: null,
        password: null,
        crf: crf,
        loading: false,
    },
    mounted: function() {
        this.$refs.username.focus();
    },
    methods: {
        login: function () {
            if(this.username === undefined || this.username === null || this.username.trim() === ''){
                this.$message.error('账号不能为空');
                return false;
            }
            if(this.password === undefined || this.password === null){
                this.password = '';
            }

            var that = this;
            if(that.loading === true){
                return false;
            }
            that.loading = true;
            axios
                .post('login', {
                    username: that.username,
                    password: md5(that.password),
                    crf: that.crf
                })
                .then(function (response) {
                    var data = response.data;
                    if(typeof data === 'object'){
                        if(data.code === 0){
                            that.$message({
                                message: data.msg,
                                type: 'error',
                                onClose: function () {
                                    that.loading = false;
                                }
                            });
                        }else{
                            that.$message({
                                message: data.msg,
                                type: 'success',
                                duration: 1000,
                                onClose: function () {
                                    window.location.href = '/';
                                    that.loading = false;
                                }
                            });
                        }
                    }else{
                        that.$message.error(data);
                    }
                })
                .catch(function (error) {
                    that.$message({
                        message: error,
                        type: 'error',
                        onClose: function () {
                            that.loading = false;
                        }
                    });
                });
        }
    },
});