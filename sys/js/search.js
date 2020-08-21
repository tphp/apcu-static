new Vue({
    el: '#app_search',
    data: {
        data: search.data,
        show: search.show
    },
    methods: {
        // 控制日期范围选择
        time_start_end: function(start, end, is_start){
            var ret = function(value){
                if(is_start){
                    if(end === undefined || end === null){
                        return false;
                    }
                    return value > new Date(end);
                }else{
                    if(start === undefined || start === null){
                        return false;
                    }
                    var start_date = new Date(start);
                    return value < new Date(start_date.setDate(start_date.getDate()));
                }
            };
            return ret;
        },
        search: function (reset) {
            var up = this.urlparam({
                url: this.url
            });
            var keys = [];
            for(var i in this.data){
                var iv = this.data[i];
                if(typeof iv === 'object'){
                    if(iv === null || iv === undefined){
                        keys.push({
                            key: i,
                            value: iv
                        });
                    }else {
                        var sl = search.lists[i];
                        if(sl === undefined){
                            for (var j in iv) {
                                if (typeof iv[j] === 'object') {
                                    keys.push({
                                        key: i + '[' + j + ']',
                                        value: null
                                    });
                                }else{
                                    keys.push({
                                        key: i + '[' + j + ']',
                                        value: iv[j]
                                    });
                                }
                            }
                        }else {
                            var chks = {};
                            for (var j in iv) {
                                chks[iv[j]] = true;
                            }
                            var chk_list = [];
                            for(var j in chks){
                                chk_list.push(j)
                            }
                            if(chk_list.length > 0){
                                keys.push({
                                    key: i,
                                    value: chk_list.join(",")
                                });
                            }else{
                                keys.push({
                                    key: i,
                                    value: null
                                });
                            }
                        }
                    }
                }else{
                    keys.push({
                        key: i,
                        value: iv
                    });
                }
            }
            for(var i in keys){
                var iv = keys[i];
                var k = iv.key;
                var v = iv.value;
                if(v === null || v === undefined || v === ''){
                    up.remove(k);
                }else{
                    up.set(k, v);
                }
            }

            if(this.show){
                up.set('__show__', 'yes');
            }else{
                up.remove('__show__');
            }
            if(reset){
                up.remove('__ob__');
            }
            up.run(true);
            // console.log(up.getUrl());
            if(vue_list !== undefined){
                if(reset){
                    vue_list.order_by_clear();
                }
                vue_list.get_list();
            }
        },
        reset: function () {
            var re_data = JSON.parse(search.json_str);
            if(typeof re_data === 'object'){
                for(var i in re_data){
                    this._data['data'][i] = re_data[i];
                }
            }
            this.search(true);
        }
    },
    watch: {
        show: function () {
            if(vue_list !== undefined){
                if(!this.timer){
                    this.timer = true;
                    var that = this;
                    setTimeout(function(){
                        vue_list.set_list_height();
                        that.timer = false
                    }, 500)
                }
            }
        }
    }
});