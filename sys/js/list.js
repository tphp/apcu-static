function config_vue_list(vue_id, t_list, ext_id) {// 获取列表处理URL
    var list_sub_height = 100;
    if(document.getElementById('app_menu')){
        list_sub_height = 140;
    }
    return new Vue({
        el: '#' + vue_id,
        data: function(){
            return {
                field: t_list.field,
                order_by_default: t_list.order_by_default,
                url_list: this.get_list_url("page.list"),
                url_list_edit: this.get_list_url("page.list_edit"),
                url_form_add: this.get_list_url("page.form_add"),
                url_form_edit: this.get_list_url("page.form_edit"),
                url_form_edit_get: this.get_list_url("page.form_edit_get"),
                url_delete: this.get_list_url("page.delete"),
                url_deletes: this.get_list_url("page.deletes"),
                url_more: t_list.url_more,
                rules: t_list.rules,
                edit_name: t_list.edit_name,
                datas: [],
                datas_temp: [],
                data: [],
                data_add: '{}',
                useRadio: false,
                is_batch: false,
                handle: {
                    add: false,
                    show: false,
                    title: '',
                    url: '',
                    key: null,
                    index: null,
                    disabled: false,
                    data: []
                },
                loading: false,
                info: null,
                pagination: {
                    page: null,
                    size: null,
                    total: null
                },
                params: {
                    closeOnMask: false,
                    fullScreen: false,
                    middle: true,
                    hasMask: true,
                    hasDivider: true,
                    hasCloseIcon: false,
                    draggable: true
                },
                height: 10,
                height_min: 465,
                table_height: 0,
                web_edit_md5: null,
                is_interval: false,
                show: true,
                ob: {
                    prop: null,
                    order: null
                }
            }
        },
        created: function(){
            if(ext_id === undefined){
                this.get_list();
            }
            this.web_edit_md5 = this.get_web_edit_md5();
            this.set_web_edit();
        },
        mounted: function(){
            var that = this;
            that.set_document_height();
            window.onresize = function windowResize () {
                that.set_document_height();
            };
            that.web_edit_timer = setInterval( function () {
                if(!that.is_interval){
                    that.is_interval = true;
                    var json_md5 = that.get_web_edit();
                    if(json_md5 === 'no') {
                        that.is_interval = false;
                    }else{
                        var key_str = Base64.decode(json_md5);
                        var is_flush = false;
                        for(var i in that.datas){
                            var iv = that.datas[i];
                            var iv_key_str = JSON.stringify(iv['_key_']);
                            if(key_str === iv_key_str){
                                is_flush = true;
                                break;
                            }
                        }
                        if(is_flush){
                            that.get_list();
                        }
                    }
                }
            }, 1000);
        },

        beforeDestroy: function() {
            clearInterval(this.web_edit_timer);
        },

        methods: {
            get_list_url: function (url) {
                return t_list.url.replace("###", url);
            },
            // 获取路径MD5
            get_web_edit_md5: function(){
                var that = this;
                return "edit_" + that.$md5(that.urlparam().get('__dir__'));
            },
            // 获取子页面数据更改状态
            get_web_edit: function(){
                var that = this;
                return that.get_cookie(that.web_edit_md5);
            },
            // 设置子页面数据更改状态
            set_web_edit: function(){
                var that = this;
                that.set_cookie(that.web_edit_md5, 'no');
            },
            row_click: function(row, column, event){
                if(column !== undefined && column.property !== undefined){
                    if(this.field[column.property]['edit']){
                        this.set_list_input(event, 0, row, column.property, true, false);
                    }
                }
            },

            page_size: function(val){
                this.pagination.size = val;
                this.get_list();
            },

            page_current: function(val){
                this.pagination.page = val;
                this.get_list();
            },

            picker: function(index, data, key){
                var that = this;
                return {
                    shortcuts: [{
                        text: '还原',
                        onClick: function() {
                            data[key] = that.datas_temp[index][key];
                            return false;
                        }
                    }]
                }
            },

            // 排序
            order_by: function(column) {
                if(ext_id === undefined) {
                    var up = this.urlparam({
                        url: this.url
                    });
                    var order = column['order'];
                    if(order === null || order === undefined){
                        up.remove('__ob__');
                    }else{
                        if(order === 'ascending'){
                            order = 'asc';
                        }else{
                            order = 'desc';
                        }
                        up.set('__ob__', column['prop'] + ',' + order);
                    }
                    up.run(true);
                }else{
                    this.ob.prop = column['prop'];
                    this.ob.order = column['order'];
                }
                this.get_list();
            },

            // 清除排序
            order_by_clear: function(){
                this.$refs.table.clearSort();
            },

            get_list: function () {
                var that = this;
                var url_list = this.url_list;
                if (that.pagination.page !== null && that.pagination.page !== undefined) {
                    url_list += "&p=" + that.pagination.page;
                }
                if (that.pagination.size !== null && that.pagination.size !== undefined) {
                    url_list += "&psize=" + that.pagination.size;
                }
                var params = that.urlparam().get_params();
                if(ext_id === undefined){
                    var order_by = params['__ob__'];
                    if(order_by !== null && order_by !== undefined){
                        url_list += "&order_by=" + order_by;
                    }
                }else{
                    var lek = list_ext_keys[ext_id];
                    if(lek !== undefined){
                        url_list += "&ext=" + Base64.encode(JSON.stringify(lek))
                    }
                    if(that.ob !== undefined){
                        var obo =  that.ob.order;
                        if(obo !== null && obo !== undefined){
                            if(obo === 'ascending'){
                                obo = 'asc';
                            }else{
                                obo = 'desc';
                            }
                            url_list += "&order_by=" + that.ob.prop + "," + obo;
                        }
                    }
                }
                delete params['__dir__'];
                delete params['__show__'];
                delete params['__ob__'];
                for (var i in params) {
                    var iv = params[i];
                    if (typeof iv === 'object') {
                        params[i] = JSON.stringify(iv);
                    }
                }
                that.set_web_edit();
                this.__axios_post(url_list, params, function (msg, data) {
                    that.is_interval = false;
                    if (data === undefined) {
                        that.datas = [];
                        that.datas_temp = [];
                        that.pagination.page = null;
                        that.pagination.size = null;
                        that.pagination.total = null;
                    } else {
                        that.datas_temp = JSON.parse(JSON.stringify(data.list));
                        for (var i in data.list) {
                            data.list[i]['_edit_'] = {};
                            for (var j in data.list[i]) {
                                if (j !== '_key_' && j !== '_data_') {
                                    data.list[i]['_edit_'][j] = false;
                                }
                            }
                        }
                        for (var i in data.list) {
                            if (that.datas[i] === undefined) {
                                that.datas.push(data.list[i]);
                            } else {
                                for (var j in data.list[i]) {
                                    that.datas[i][j] = data.list[i][j];
                                }
                            }
                        }
                        var d_list_len = data.list.length;
                        var d_dts_len = that.datas.length;
                        if (d_dts_len > d_list_len) {
                            for (var i = d_list_len; i < d_dts_len; i++) {
                                that.datas.pop();
                            }
                        }
                        that.pagination.page = data.p;
                        that.pagination.size = data.psize;
                        that.pagination.total = data.total;
                    }
                    that.set_list_height();
                }, function (msg) {
                    that.is_interval = false;
                    error_msg(that, '错误提示', msg);
                });
            },

            // 输入数字限制
            input_number: function (e, _data_, key, decimal) {
                _data_[key] = this.get_input_number(e.target.value, decimal);
            },

            // 设置列表高度
            set_document_height: function(){
                this.height = document.documentElement.clientHeight || document.body.clientHeight;
            },

            // 设置列表高度
            set_list_height: function(value){
                var that = this;
                if(!that.timer){
                    that.timer = true;
                    setTimeout(function(){
                        if(value === undefined){
                            value = that.height;
                        }
                        var table_height = value - that.$el.offsetTop - list_sub_height;
                        if(table_height < that.height_min){
                            table_height = that.height_min;
                        }
                        that.table_height = table_height;
                        that.timer = false
                    }, 100);
                }
            },

            add: function () {
                var that = this;
                that.handle.title = '新增';
                that.handle.data = JSON.parse(that.data_add);
                that.handle.add = true;
                that.handle.show = true;
                that.handle.disabled = false;
                that.handle.url = that.url_form_add;
            },

            // 清空新增表单
            add_clear: function(){
                this.data_add = '{}';
                this.handle.data = JSON.parse(this.data_add);
            },

            // 提交新增表单
            add_submit: function(){
                var that = this;
                if(that.handle.disabled){
                    return false;
                }
                that.data_add = JSON.stringify(that.handle.data);
                that.$refs['form'].validate(function (valid, info) {
                    if (valid) {
                        that.handle.disabled = true;

                        var url_add = that.url_form_add;
                        if(ext_id !== undefined){
                            var lek = list_ext_keys[ext_id];
                            if(lek !== undefined){
                                url_add += "&ext=" + Base64.encode(JSON.stringify(lek))
                            }
                        }

                        that.__axios_post(url_add, that.handle.data, function (msg) {
                            that.$message.success(msg);
                            that.handle.show = false;
                            that.get_list();
                        }, function (msg) {
                            error_msg(that, '错误提示', msg);
                            that.handle.disabled = false;
                        });
                    } else {
                        that.$message.error('请检查验证，错误条数: ' + Object.keys(info).length);
                        return false;
                    }
                });
            },

            // 列表单击设置
            set_list_input: function (e, index, _data_, key, bool, is_number) {
                var that = this;
                if(bool){
                    _data_['_edit_'][key] = bool;
                    that.$nextTick(function () {
                        var et = e;
                        if(et.target !== undefined){
                            et = et.target;
                        }
                        for(var i = 0; i <= 100; i ++){
                            if(et.tagName === 'TD'){
                                break;
                            }
                            et = et.parentNode;
                        }
                        if(et.tagName !== 'TD'){
                            return true;
                        }
                        var input_obj = et.getElementsByTagName('textarea');
                        if (input_obj.length > 0) {
                            input_obj[0].focus();
                        }else{
                            input_obj = et.getElementsByTagName('input');
                            if (input_obj.length > 1) {
                                input_obj[1].focus();
                            }else if(input_obj.length > 0){
                                input_obj[0].focus();
                            }
                        }
                    });
                    return true;
                }
                var old_value = that.datas_temp[index][key];
                if(old_value === undefined){
                    old_value = '';
                }else{
                    old_value = (old_value + "").trim()
                }

                var new_value = _data_[key];
                if(is_number){
                    var nv_len = new_value.length;
                    if(nv_len > 0 && new_value.substr(-1) === '.'){
                        new_value = new_value.substr(0, nv_len - 1);
                        _data_[key] = new_value;
                    }
                }
                if(new_value === undefined || new_value === null){
                    new_value = '';
                }else{
                    new_value = (new_value + "").trim()
                }
                if(old_value === new_value){
                    _data_['_edit_'][key] = bool;
                    _data_[key] = new_value;
                    return true;
                }
                var rule = that.rules[key];
                if(rule !== undefined && rule !== null){
                    var rule_msg = that.get_list_rules(rule, new_value);
                    if(rule_msg !== true){
                        var e_parent = e.target.parentNode.parentNode;
                        that.$confirm(rule_msg, that.field[key].name + "： 第" + (index + 1) + "行", {
                            dangerouslyUseHTMLString: true,
                            distinguishCancelAndClose: true,
                            confirmButtonText: '确定',
                            cancelButtonText: '还原',
                            closeOnClickModal: true,
                            type: 'error',
                        }).then(function() {
                            var input_obj = e_parent.getElementsByTagName('textarea');
                            if (input_obj.length > 0) {
                                input_obj[0].focus();
                            }
                        }).catch(function (action) {
                            if(action === 'close'){
                                var input_obj = e_parent.getElementsByTagName('textarea');
                                if (input_obj.length > 0) {
                                    input_obj[0].focus();
                                }
                            }else{
                                that.input_esc(index, key);
                            }
                        });

                        return true;
                    }
                }
                _data_['_edit_'][key] = bool;
                that.list_edit(new_value, index, _data_, key, 'text');
            },

            // 取消时间
            time_cancel: function(index, key){
                this.datas[index][key] = this.datas_temp[index][key];
            },

            // 取消输入
            input_esc: function(index, key){
                this.datas[index][key] = this.datas_temp[index][key];
                this.datas[index]['_edit_'][key] = false;
            },

            more: function (_data_) {
                var that = this;
                var _key_ = _data_._key_;
                var _key_str_ = Base64.encode(JSON.stringify(_key_));
                that.urlparam().setUrl(this.url_more + _key_str_).open()
            },

            edit: function (index, _data_) {
                var that = this;
                var _key_ = _data_._key_;
                var key_str = JSON.stringify(_key_);
                var edit_url = that.urlparam().setUrl(that.url_form_edit).set('key', Base64.encode(key_str)).getUrl();
                var keys = [];
                for(var i in _key_){
                    keys.push(_key_[i]);
                }
                that.handle.title = that.edit_name + ': 第 ' + (index + 1) + ' 行';
                that.handle.disabled = false;
                that.handle.add = false;
                that.__axios_post(this.url_form_edit_get, {
                    key: key_str
                }, function (msg, data) {
                    that.handle.data = data;
                    that.handle.show = true;
                    that.handle.key = _key_;
                    that.handle.index = index;
                    that.handle.url = edit_url;
                });
            },

            // 提交新增表单
            edit_submit: function(){
                var that = this;
                that.$refs['form'].validate(function (valid, info) {
                    if (valid) {
                        var edit_url = that.urlparam().setUrl(that.url_form_edit).set('key', Base64.encode(JSON.stringify(that.handle.key))).getUrl();
                        if(ext_id !== undefined){
                            var lek = list_ext_keys[ext_id];
                            if(lek !== undefined){
                                edit_url += "&ext=" + Base64.encode(JSON.stringify(lek))
                            }
                        }
                        that.handle.disabled = true;
                        var thd = JSON.parse(JSON.stringify(that.handle.data));
                        delete thd['_ext_'];
                        delete thd['_next_'];
                        that.__axios_post(edit_url, thd, function (msg, data) {
                            if(typeof data === 'object') {
                                for (var i in data) {
                                    that.datas[that.handle.index][i] = data[i];
                                }
                                that.datas_temp[that.handle.index] = JSON.parse(JSON.stringify(data));
                            }
                            that.$message.success(msg);
                            that.handle.show = false;
                        }, function (msg) {
                            error_msg(that, '错误提示', msg);
                            that.handle.disabled = false;
                        });
                    } else {
                        that.$message.error('请检查验证，错误条数: ' + Object.keys(info).length);
                        return false;
                    }
                });
            },

            list_edit: function (value, index, _data_, key, type) {
                if(type === 'status'){
                    if(value){
                        value = 1;
                    }else{
                        value = 0;
                    }
                }
                var that = this;
                var _key_ = _data_._key_;
                var edit_url = that.urlparam().setUrl(that.url_list_edit).set('key', Base64.encode(JSON.stringify(_key_))).getUrl();
                if(ext_id !== undefined){
                    var lek = list_ext_keys[ext_id];
                    if(lek !== undefined){
                        edit_url += "&ext=" + Base64.encode(JSON.stringify(lek))
                    }
                }
                var _dt = {};
                _dt[key] = value;
                that.__axios_post(edit_url, _dt, function (msg, data) {
                    if(typeof data === 'object'){
                        for(var i in data){
                            _data_[i] = data[i];
                        }
                        that.datas_temp[index] = JSON.parse(JSON.stringify(data));
                    }
                }, function (msg) {
                    var old_value = that.datas_temp[index][key];
                    if(old_value !== undefined){
                        _data_[key] = old_value;
                    }
                    error_msg(that, '错误提示', msg);
                });
            },
            remove: function (index, _data_) {
                var that = this;
                var _key_ = _data_._key_;
                var key_str = JSON.stringify(_key_);
                var title = '确定删除第 ' + (index + 1) + ' 行？';
                var msg = '<div class="delete_msg"><pre>' + JSON.stringify(_key_) + '</pre></div>';
                that.$confirm(msg, title, {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    // type: 'warning'
                }).then(function() {
                    that.__axios_post(that.url_delete, {
                        key: key_str
                    }, function (msg) {
                        that.$message.success(msg);
                        that.get_list();
                        that.clear_select();
                    });
                }).catch(function () {

                });
            },
            removes: function () {
                var sels = this.$refs.table.selection;
                if(sels.length <= 0){
                    this.$message.error('未选择数据');
                    return false;
                }

                var that = this;
                var title = '删除个数： ' + sels.length;
                var msg = '<i class="h-icon-warn yellow-color" style="font-size: 20px;vertical-align: -3px;margin-right: 10px;"></i>确定删除所选？';

                that.$confirm(msg, title, {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    // type: 'warning'
                }).then(function() {
                    var keys = [];
                    for(var i in sels){
                        keys.push(sels[i]['_key_']);
                    }
                    that.__axios_post(that.url_deletes, {
                        keys: JSON.stringify(keys)
                    }, function (msg) {
                        that.$message.success(msg);
                        that.get_list();
                        that.clear_select();
                    });
                }).catch(function () {

                });
            },

            handle_close: function (done) {
                done();
            },

            clear_select: function () {
                this.$refs.table.clearSelection();
            }
        },
        watch: {
            height: function (value) {
                this.set_list_height(value);
            },
            is_batch: function (value) {
                if(value === false){
                    this.clear_select();
                }
            },
            'handle.show': function (value) {
                var that = this;
                if(value && that.$refs['form'] !== undefined){
                    that.$refs['form'].resetFields();
                }
            }
        }
    });
};