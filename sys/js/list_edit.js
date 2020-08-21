var list_edit_data = {
    url_form_edit: get_list_url("page.form_edit_more"),
    url_form_edit_get: get_list_url("page.form_edit_get"),
    handle: {
        data: {},
        show: true
    },
    loading: false,
    key: list_edit.key,
    show: list_edit.show,
    form_cot: list_edit.form_cot,
    show_msg: '数据加载中...',
    bgcolor: 'none',
    show_edit: true,
    load_data: null,
    disabled: false,
    is_init: false,
};

// 获取列表处理URL
function get_list_url(url) {
    return list_edit.url.replace("###", url);
}

var app_list_edit = new Vue({
    el: '#app_list_edit',
    data: list_edit_data,
    created: function(){
        var show = this.urlparam().get('__show__');
        if(show === 'false'){
            this.show_edit = false;
        }
        if(this.form_cot === undefined || this.form_cot === null){
            this.form_cot = 0;
        }
        document.getElementById("app_list_edit_top").style.cssText="display: inherit;";
        if(!this.is_init){
            this.is_init = true;
            this.get_edit();
        }
    },
    methods: {
        show_list: function(){
            document.getElementsByClassName("css_more_body")[0].style.cssText="display: inherit;";
            document.getElementsByClassName("css_more_button_nav")[0].style.cssText="display: inherit;";
        },
        get_edit: function () {
            var that = this;
            if(this.form_cot > 0){
                var key_str = JSON.stringify(that.key);
                that.__axios_post(this.url_form_edit_get, {
                    key: key_str
                }, function (msg, data) {
                    that.show = 2;
                    that.handle.data = data;
                    that.loading = true;
                    if(that.load_data === null){
                        that.load_data = JSON.stringify(data);
                    }
                    that.show_list();
                    that.set_list_show(data._ext_);
                }, function (msg) {
                    that.show = 0;
                    that.show_msg = msg;
                });
            }else{
                that.show = 2;
                that.show_list();
                for(var i in list_vues){
                    list_vues[i].get_list();
                }
            }
        },

        set_list_show: function(ext){
            for(var i in ext){
                var iv = ext[i];
                var is_run = false;
                var lek = list_ext_keys[i];
                if(lek === undefined || Object.keys(lek).length !== Object.keys(iv).length){
                    is_run = true;
                }else{
                    for(var j in iv){
                        if(lek[j] !== iv[j]){
                            is_run = true;
                            break;
                        }
                    }
                }
                if(is_run){
                    list_ext_keys[i] = iv;
                    if(list_vues[i] !== undefined){
                        list_vues[i].get_list();
                    }
                }
            }
        },

        // 保存数据
        save: function(){
            var that = this;
            var md5_str = "edit_" + that.$md5(that.urlparam().get('__dir__'));
            that.$refs['form'].validate(function (valid, info) {
                if (valid) {
                    var prev_key = Base64.encode(JSON.stringify(that.key));
                    var edit_url = that.urlparam().setUrl(that.url_form_edit).set('key', prev_key).getUrl();
                    that.disabled = true;
                    that.set_cookie(md5_str, 'no');
                    var thd = JSON.parse(JSON.stringify(that.handle.data));
                    delete thd['_ext_'];
                    delete thd['_next_'];
                    that.__axios_post(edit_url, thd, function (msg, data) {
                        if(typeof data === 'object') {
                            for (var i in that.handle.data) {
                                var di = data[i];
                                if(di === undefined || di === null){
                                    di = '';
                                }
                                that.handle.data[i] = di;
                            }
                            that.key = data._key_;
                            var new_key = Base64.encode(JSON.stringify(that.key));
                            if(prev_key !== new_key){
                                that.urlparam().set('key', new_key).run(true);
                            }

                            that.set_cookie(md5_str, prev_key);
                            that.set_list_show(data._ext_);
                        }
                        that.$message.success(msg);
                        that.disabled = false;
                    }, function (msg) {
                        error_msg(that, '错误提示', msg);
                        that.disabled = false;
                    });
                } else {
                    that.$message.error('请检查验证，错误条数: ' + Object.keys(info).length);
                    return false;
                }
            });
        },

        // 还原
        reset: function () {
            if(this.load_data !== null){
                this.handle.data = JSON.parse(this.load_data);
            }
        },

        // 刷新
        flush: function () {
            this.urlparam().run();
        },

        // 关闭页面
        close: function () {
            window.opener=null;
            window.open('', '_self');
            window.close();
        },

        // 设置标签
        ext_change: function(tab) {
            ext_tab_name = tab.$attrs.tag;
            for(var i in list_vues){
                if(ext_tab_name === i){
                    list_vues[i].show = true;
                    list_vues[i].set_list_height();
                }else{
                    list_vues[i].show = false;
                }
            }
        }
    },
    watch: {
        show_edit: function (value) {
            var vstr;
            if(value){
                vstr = 'true';
            }else{
                vstr = 'false';
            }
            this.urlparam().set('__show__', vstr).run(true);
            if(!this.timer){
                this.timer = true;
                var that = this;
                setTimeout(function(){
                    list_vues[ext_tab_name].set_list_height();
                    that.timer = false
                }, 500);
            }
        }
    }
});

new Vue({
    el: '#app_list_edit_top',
    data: list_edit_data,
    methods: {
        // 保存数据
        save: function(){
            app_list_edit.save();
        },

        // 还原
        reset: function () {
            app_list_edit.reset();
        },

        // 刷新
        flush: function () {
            app_list_edit.flush();
        },

        // 关闭页面
        close: function () {
            app_list_edit.close();
        },
    }
});