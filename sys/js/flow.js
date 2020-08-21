function config_vue_list(vue_id, t_list, ext_id) {// 获取列表处理URL
    var list_sub_height = 100;
    if(document.getElementById('app_menu')){
        list_sub_height = 140;
    }
    return new Vue({
        el: '#' + vue_id,
        data: function(){
            return {
                url_list: this.get_replace_url("flow.list"),
                type: {
                    now: t_list.type,
                    tmp: null,
                    done: true,
                    values: {
                        todo: 100,
                        done: null,
                        mine: null
                    }
                },
                show: true
            }
        },
        created: function(){
        },
        mounted: function(){
        },

        beforeDestroy: function() {
        },

        methods: {
            get_list: function(){
                console.log(this.url_list);
            },

            get_replace_url: function (url) {
                return t_list.url.replace("###", url);
            },

            add: function(){

            },
            change_type: function () {
                var that = this;
                if(that.type.done){
                    this.urlparam().set('type', that.type.now).run(true);
                    that.type.tmp = that.type.now;
                    // that.type.done = false;
                    // setTimeout(function () {
                    //     that.type.done = true;
                    // }, 5000);
                }else{
                    that.$nextTick(function () {
                        that.type.now = that.type.tmp;
                    });
                }
            }
        },
        watch: {
        }
    });
};