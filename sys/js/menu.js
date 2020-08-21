new Vue({
    el: '#app_menu',
    data: {
    },
    methods: {
        // handleOpen(key, keyPath) {
        //     console.log(key, keyPath);
        // },
        // handleClose(key, keyPath) {
        //     console.log(key, keyPath);
        // },
        select: function (dir) {
            if(menu_dir !== dir){
                if(dir !== '/'){
                    dir = "/" + dir;
                }
                this.urlparam().setUrl(dir).run();
            }
        }
    },
    watch: {
    }
});

new Vue({
    el: '#app_body_top',
    data: {
    },
    methods: {
        exit: function () {
            var that = this;
            that.confirm('提示', '确定退出?', function () {
                that.__axios_post("/user/login/out", {
                    'type': 'login_out'
                }, function () {
                    that.urlparam().setUrl('/user/login').run();
                });
            });
        }
    },
});