// 修改axios为form默认模式
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

/**
 * URL跳转设定
 * @returns {{url: jQuery, change: (function(*, *): $.fn.urlparam), gourl: gourl}}
 */
Vue.prototype.urlparam = function(config){
    var turl;
    if(config !== undefined && config !== null && typeof config === 'object'){
        if(typeof config.url === 'string'){
            turl = config.url.trim();
        }
    }
    if(turl === undefined || turl === null || turl === "") turl = window.location.href;
    var up = {
        url : turl,
        timeout : 1500,
        is_load: false,
        //url参数增加或替换
        set : function (name, value, is_encode) {
            if(typeof name === "object"){
                for(var i in name){
                    this.set(i, name[i], is_encode);
                }
                return this;
            }
            var url = this.url;
            var newUrl="";
            var reg_name = name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
            var reg1 = new RegExp("(^|)([?])("+ reg_name +")=([^&]*)(|$)");
            var reg2 = new RegExp("(^|)([&])("+ reg_name +")=([^&]*)(|$)");
            if(value === undefined){
                value = '';
            }else if(is_encode !== false){
                value = encodeURIComponent(value);
            }
            var tmp = name + "=" + value;
            if(url.match(reg1) != null){
                newUrl= url.replace(eval(reg1), "?" + tmp);
            }else if(url.match(reg2) != null) {
                newUrl= url.replace(eval(reg2), "&" + tmp);
            }else{
                if(url.match("[\?]")){
                    newUrl= url + "&" + tmp;
                }else{
                    newUrl= url + "?" + tmp;
                }
            }
            newUrl = newUrl.replace("?&", "?").replace(/&&/g, "&");
            this.url = newUrl;
            return this;
        },
        //获取URL参数
        get : function(name) {
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r != null) return  unescape(r[2]);
            return "";
        },
        //获取URL所有参数
        get_params: function(){
            var ret = {};
            var turl = this.url;
            var pos = turl.indexOf('?');
            if(pos < 0){
                return ret;
            }

            var url_ext = turl.substr(pos + 1);
            var url_arr = url_ext.split("&");
            for(var i in url_arr){
                var iv = url_arr[i];
                pos = iv.indexOf("=");
                if(pos < 0){
                    continue;
                }
                var key = decodeURIComponent(iv.substr(0, pos).trim().replace(/'"/g, ""));
                var value = decodeURIComponent(iv.substr(pos + 1).trim());
                var pos_l = key.indexOf("[");
                if(pos_l < 0){
                    ret[key] = value;
                    continue;
                }
                var pos_r = key.indexOf("]");
                if(pos_r < 0){
                    ret[key] = value;
                    continue;
                }

                var ikey = key.substr(0, pos_l).trim();
                var index = key.substr(pos_l + 1, pos_r - pos_l - 1).trim();
                var rstr = key.substr(pos_r + 1).trim();
                if(ret[ikey] === undefined || typeof ret[ikey] !== 'object'){
                    ret[ikey] = {};
                }
                var tmp = ret[ikey];
                var prev_tmp = ret[ikey];
                var index_tmp = index;
                var inc = 0;
                while(rstr !== ''){
                    if(tmp[index] === undefined){
                        tmp[index] = {};
                    }
                    prev_tmp = tmp;
                    index_tmp = index;
                    tmp = tmp[index];
                    pos_l = rstr.indexOf("[");
                    if(pos_l < 0){
                        break;
                    }
                    pos_r = rstr.indexOf("]");
                    if(pos_r < 0){
                        break;
                    }
                    index = rstr.substr(pos_l + 1, pos_r - pos_l - 1).trim();
                    rstr = rstr.substr(pos_r + 1).trim();
                    inc ++;
                }

                if(inc > 0){
                    prev_tmp[index_tmp][index] = value;
                }else{
                    ret[ikey][index] = value;
                }
            }
            return ret;
        },
        //设置url
        setUrl : function(url){
            if(url.replace(/:\/\//g, "").indexOf('/') < 0){
                url += '/';
            }
            this.url = url;
            return this;
        },
        //获取URL
        getUrl : function(){
            return this.url;
        },
        //url参数删除
        remove : function () {
            var url = this.url;
            for(var i in arguments) {
                var name = arguments[i];
                name = name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
                var newUrl = "";
                var reg1 = new RegExp("(^|)([?])(" + name + ")=([^&]*)(|$)");
                var reg2 = new RegExp("(^|)([&])(" + name + ")=([^&]*)(|$)");
                var tmp = "#";
                if (url.match(reg1) != null) {
                    newUrl = url.replace(eval(reg1), "?" + tmp);
                } else if (url.match(reg2) != null) {
                    newUrl = url.replace(eval(reg2), tmp);
                }
                if(newUrl !== "") url = newUrl.replace("?#&", "?").replace(/#&/g, "&").replace("?#", "").replace(/#/g, "");
            }
            this.url = url;
            return this;
        },
        run : function (is_no_flush) {
            var jmpurl = this.url;
            if(is_no_flush){
                window.history.pushState({}, 0, jmpurl);
            }else{
                window.location.href = jmpurl;
            }
        },
        open : function () {
            window.open(this.url, '_blank');
        }
    };

    return up;
};

// 更新子组件信息
Vue.prototype.forceUpdate = function(){
    var sobjs = this._sobj_;
    if(typeof sobjs === 'object'){
        if(sobjs !== undefined && sobjs !== null){
            for(var i in sobjs){
                for(var j in sobjs[i]) {
                    sobjs[i][j].$forceUpdate();
                }
            }
        }
    }
    this.$forceUpdate();
};

// 返回输入数字模式
Vue.prototype.get_input_number = function(value, decimal){
    if(decimal === undefined || decimal === null || typeof decimal !== 'number'){
        decimal = 0;
    }else if(decimal < 0){
        decimal = 0;
    }else if(decimal > 8){
        decimal = 0;
    }else{
        decimal = parseInt(decimal + '');
    }
    var t = value.charAt(0);
    if(decimal <= 0){
        value = value.replace(/\./g, "");
    }else{
        value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    }
    value = value.replace(/[^\d.]/g, "").replace(/^\./g, "").replace(new RegExp('([0-9]+\.[0-9]{${decimal}})[0-9]*', 'g'), "$1");
    if (t === '-') {
        value = '-' + value;
    }
    return value;
};

Vue.prototype.set_input_number = function(obj, key, value, decimal){
    obj[key] = this.get_input_number(value, decimal);
};

// 设置子组件数据
Vue.prototype.setDataForChild = function(keyname, data){
    var sobjs = this._sobj_;
    if(typeof sobjs === 'object' && typeof keyname === 'string'){
        var objs = sobjs[keyname];
        if(objs !== undefined){
            if(this._sdata_ === undefined){
                this._sdata_ = {};
            }
            this._sdata_[keyname] = data;
            for(var i in objs) {
                objs[i].$forceUpdate();
            }
        }
    }
};

// 获取GET数据
Vue.prototype.__axios_get = function (url, func, func_err) {
    var that = this;
    that.loading = true;
    axios
        .get(url)
        .then(function (response) {
            var data = response.data;
            if(data.code === 0){
                if(typeof func_err === 'function'){
                    func_err(data.msg);
                }else{
                    error_msg(that, '错误提示', data.msg);
                }
            }else{
                if(typeof func === 'function'){
                    func(data.msg, data.data);
                }
            }
            that.loading = false;
        })
        .catch(function (error) { // 请求失败处理
            that.loading = false;
            if(typeof func_err === 'function'){
                func_err(error);
            }else{
                error_msg(that, '错误提示', error);
            }
            that.loading = false;
        });
};

// 获取POST数据
Vue.prototype.__axios_post = function (url, data, func, func_err) {
    var that = this;
    that.loading = true;
    axios
        .post(url, data)
        .then(function (response) {
            var data = response.data;
            if(data.code === 0){
                if(typeof func_err === 'function'){
                    func_err(data.msg);
                }else{
                    error_msg(that, '错误提示', data.msg);
                }
            }else{
                if(typeof func === 'function'){
                    func(data.msg, data.data);
                }
            }
            that.loading = false;
        })
        .catch(function (error) { // 请求失败处理
            if(typeof func_err === 'function'){
                func_err(error);
            }else{
                error_msg(that, '错误提示', error);
            }
            that.loading = false;
        });
};

// 获取POST数据
Vue.prototype.confirm = function (title, msg, func) {
    var that = this;
    that.$confirm(msg, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        if(typeof func === 'function'){
            func();
        }
    }).catch(function () {

    });
};

// MD5加密
if(typeof md5 === 'undefined'){
    Vue.prototype.$md5 = function (value) {
        return value;
    };
}else{
    Vue.prototype.$md5 = md5;
}

// 获取POST数据
Vue.prototype.set_status_value = function (data, key) {
    var value = data[key];
    if(value === null || value === undefined){
        value = '0';
    }
    value = (value + '').trim();
    if(value === '' || value !== '1'){
        value = '0';
    }
    data[key] = value;
};

// 获取随机字符串
Vue.prototype.random = function () {
    var chs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var chs_len = chs.length;
    var ram = '';
    for (var i = 0; i < 10; i++) {
        ram += chs.charAt(Math.floor(Math.random() * chs_len));
    }
    ram = (new Date()).getTime() + "_" + ram;
    return this.$md5(ram).substring(8, 24);
};

// 获取cookie
Vue.prototype.get_cookie = function (name) {
    var strcookie = document.cookie;
    var arrcookie = strcookie.split("; ");
    for ( var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] === name){
            return arr[1];
        }
    }
    return "";
};

// 设置cookie
Vue.prototype.set_cookie = function (name, value) {
    var days = 30;
    var o_date = new Date();
    o_date.setDate(o_date.getDate() + days*24*60*60*1000);
    document.cookie = name + "=" + value + "; expires=" + o_date.toDateString() + " ;path=/;";
};

// 获取验证规则正则配置
Vue.prototype.get_rules_regs = function () {
    return {
        number: {
            code: /^[0-9]*$/,
            msg: '请输入数字类型'
        },
        int: {
            code: /^-?[1-9]\d*$/,
            msg: '请输入整数类型'
        },
        float: {
            code: /^(\-|\+)?\d+(\.\d+)?$/,
            msg: '请输入小数类型'
        },
        positive: {
            code: /^(\+)?\d+(\.\d+)?$/,
            msg: '请输入正数类型'
        },
        negative: {
            code: /^(\-)\d+(\.\d+)?$/,
            msg: '请输入负数类型'
        },
        mobile: {
            code: /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/,
            msg: '请输入正确的手机格式'
        },
        email: {
            code: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            msg: '请输入正确的邮箱地址'
        },
        id: {
            code: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/,
            msg: '请输入正确的身份证号'
        },
        date: {
            code: /^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/,
            msg: '请输入正确的日期'
        },
        time: {
            code: /^(0\d{1}|1\d{1}|2[0-3]):[0-5]\d{1}:([0-5]\d{1})$/,
            msg: '请输入正确的时间'
        },
        datetime: {
            code: /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/,
            msg: '请输入正确的日期时间'
        },
        qq: {
            code: /^[1-9][0-9]{4,10}$/,
            msg: '请输入正确的QQ号码'
        },
        url: {
            code: /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?/,
            msg: '请输入正确的URL地址'
        },
        ip: {
            code: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
            msg: '请输入正确的IP地址'
        },
        letter: {
            code: /^[A-Za-z]+$/,
            msg: '仅允许英文字母'
        },
        letter_number: {
            code: /^[A-Za-z0-9]+$/,
            msg: '英文字母和数字组合'
        },
        lower: {
            code: /^[a-z0-9]+$/,
            msg: '英文字母需小写'
        },
        upper: {
            code: /^[A-Z0-9]+$/,
            msg: '英文字母需大写'
        }
    };
}

// 获取验证规则
Vue.prototype.get_rules = function (field, is_add) {
    if(is_add){
        if(this.__add_rules !== undefined){
            return this.__add_rules;
        }
    }else{
        if(this.__edit_rules !== undefined){
            return this.__edit_rules;
        }
    }
    var ret = {};
    var regs = this.get_rules_regs();
    for(var i in field){
        var iv = field[i];
        if(is_add){
            if(!iv['is_add']){
                continue;
            }
        }else if(!iv['is_edit']){
            continue;
        }
        var verify = iv['verify'];
        var iv_name = iv['name'];
        var decimal = iv['decimal'];
        var rule = [];
        if(verify !== undefined){
            if(verify['required_def']){
                rule.push({ required: true, message: iv_name + '不能为空 (默认)'});
                delete verify['required_def'];
            }else if(verify.required){
                rule.push({ required: true, message: iv_name + '不能为空'});
                delete verify['required'];
            }
            if(verify.zero){
                rule.push({
                    validator: function (r, value, callback) {
                        if (value === 0 || value.trim() === '0') {
                            callback(new Error('不能为零'));
                        } else {
                            callback();
                        }
                    }
                });
                delete verify['zero'];
            }
            for(var j in verify){
                var reg_info = regs[j];
                if(reg_info === undefined){
                    continue;
                }

                rule.push({
                    validator: function (r, value, callback) {
                        if (r.reg_info.code.test(value)) {
                            callback();
                        } else {
                            callback(new Error(r.reg_info.msg));
                        }
                    },
                    reg_info: reg_info
                });
            }
        }

        // 自定义正则验证
        var regular = iv['regular'];
        if(regular !== undefined){
            if(regular['code'] !== undefined && regular['msg'] !== undefined){
                rule.push({
                    validator: function (r, value, callback) {
                        var regular_code = r.regular['code'];
                        var regular_msg = r.regular['msg'];
                        var reg = new RegExp(regular_code);
                        if (reg.test(value)) {
                            callback();
                        } else {
                            callback(new Error(regular_msg));
                        }
                    },
                    regular: regular
                });
            }
        }

        // 数值范围设置
        var number = iv['number'];
        if(number !== undefined && number !== null && iv['type'] === 'number'){
            if(number['min'] !== undefined || number['max'] !== undefined){
                var number_min = number['min'];
                if(number_min !== undefined && typeof number_min === 'string'){
                    number_min = parseFloat(number_min);
                }
                var number_max = number['max'];
                if(number_max !== undefined && typeof number_max === 'string'){
                    number_max = parseFloat(number_max);
                }
                rule.push({
                    validator: function (r, value, callback) {
                        value = parseFloat(value);
                        if(r.number_min === undefined){
                            if(value > r.number_max){
                                callback(new Error("最大值为：" + r.number_max));
                                return false;
                            }
                        }else if(r.number_max === undefined){
                            if(value < r.number_min){
                                callback(new Error("最小值为：" + r.number_min));
                                return false;
                            }
                        }else{
                            if(r.number_min > r.number_max){
                                callback();
                                return false;
                            }else{
                                if(value > r.number_max || value < r.number_min){
                                    callback(new Error("数值范围：" + r.number_min + " ~ " + r.number_max));
                                    return false;
                                }
                            }
                        }
                        callback();
                    },
                    number_min: number_min,
                    number_max: number_max
                });
            }
        }

        // 长度范围设置
        var length = iv['length'];
        if(length !== undefined && length !== null && (iv['type'] === 'string' || iv['type'] === 'number')){
            if(length['min'] !== undefined || length['max'] !== undefined){
                var length_min = length['min'];
                if(length_min !== undefined && typeof length_min === 'string'){
                    length_min = parseFloat(length_min);
                }
                var length_max = length['max'];
                if(length_max !== undefined && typeof length_max === 'string'){
                    length_max = parseFloat(length_max);
                }
                rule.push({
                    validator: function (r, value, callback) {
                        if(value === undefined || value === null){
                            value = "";
                        }else{
                            value = value + "";
                        }
                        var value_len = value.length;
                        if(r.type === 'number'){
                            if(value_len > 1 && (value[0] === '+' || value[0] === '-')){
                                value_len --;
                            }
                        }
                        var l_max = 0;
                        if(r.length_max !== undefined){
                            l_max = r.length_max;
                            if(r.decimal !== undefined){
                                var v_index = value.indexOf('.');
                                if(v_index >= 0){
                                    if(v_index > r.decimal){
                                        l_max -= r.decimal;
                                    }else{
                                        value_len -= 1;
                                    }
                                }else{
                                    l_max -= r.decimal;
                                }
                            }
                        }
                        if(r.length_min === undefined){
                            if(r.length_max !== undefined){
                                if(value_len > l_max){
                                    var msg = "";
                                    if(r.decimal === undefined){
                                        msg = "最大长度为：" + r.length_max;
                                    }else{
                                        msg = "最大整数位长度：" + l_max + "， 最大小数位长度：" + r.decimal;
                                    }
                                    callback(new Error(msg));
                                    return false;
                                }
                            }
                        }else if(r.length_max === undefined){
                            if(value_len < r.length_min){
                                callback(new Error("最小长度为：" + r.length_min));
                                return false;
                            }
                        }else{
                            if(r.length_min > l_max){
                                callback();
                                return false;
                            }else{
                                if(value_len > l_max || value_len < r.length_min){
                                    var msg = "";
                                    if(r.decimal === undefined){
                                        msg = "长度范围：" + r.length_min + " ~ " + r.length_max;
                                    }else{
                                        msg = "最大整数位长度：" + l_max + "， 最大小数位长度：" + r.decimal;
                                    }
                                    callback(new Error(msg));
                                    return false;
                                }
                            }
                        }
                        callback();
                    },
                    length_min: length_min,
                    length_max: length_max,
                    type: iv['type'],
                    decimal: decimal
                });
            }
        }

        if(rule.length > 0){
            ret[i] = rule;
        }
    }
    if(is_add){
        this.__add_rules = ret;
    }else{
        this.__edit_rules = ret;
    }
    return ret;
};

// 获取验证规则（列表验证）
Vue.prototype.get_list_rules = function (rule, value) {
    var regs = this.get_rules_regs();
    var verify = rule['verify'];
    var rule_name = rule['name'];
    if(verify !== undefined){
        if(verify['required_def']){
            if(value === null || value === undefined || value.trim() === ''){
                return rule_name + '不能为空 (默认)';
            }
        }else if(verify.required){
            if(value === null || value === undefined || value.trim() === ''){
                return rule_name + '不能为空';
            }
        }else if(verify.zero){
            if (value === 0 || value.trim() === '0') {
                return '不能为零';
            }
        }
        for(var j in verify){
            var reg_info = regs[j];
            if(reg_info === undefined){
                continue;
            }
            if (!reg_info.code.test(value)) {
                return reg_info.msg;
            }
        }
    }

    // 自定义正则验证
    var regular = rule['regular'];
    if(regular !== undefined){
        if(regular['code'] !== undefined && regular['msg'] !== undefined){
            var reg = new RegExp(regular['code']);
            if (!reg.test(value)) {
                return regular['msg'];
            }
        }
    }

    // 数值范围设置
    var number = rule['number'];
    if(number !== undefined && number !== null && rule['type'] === 'number'){
        if(number['min'] !== undefined || number['max'] !== undefined){
            var number_min = number['min'];
            if(number_min !== undefined && typeof number_min === 'string'){
                number_min = parseFloat(number_min);
            }
            var number_max = number['max'];
            if(number_max !== undefined && typeof number_max === 'string'){
                number_max = parseFloat(number_max);
            }

            value = parseFloat(value);
            if(number_min === undefined){
                if(value > number_max){
                    return "最大值为：" + number_max;
                }
            }else if(number_max === undefined){
                if(value < number_min){
                    return "最小值为：" + number_min;
                }
            }else{
                if(number_min < number_max && (value > number_max || value < number_min)){
                    return "数值范围：" + number_min + " ~ " + number_max;
                }
            }
        }
    }

    // 长度范围设置
    var length = rule['length'];
    if(length !== undefined && length !== null && (rule['type'] === 'string' || rule['type'] === 'number')){
        if(length['min'] !== undefined || length['max'] !== undefined){
            var length_min = length['min'];
            if(length_min !== undefined && typeof length_min === 'string'){
                length_min = parseFloat(length_min);
            }
            var length_max = length['max'];
            if(length_max !== undefined && typeof length_max === 'string'){
                length_max = parseFloat(length_max);
            }
            if(value === undefined || value === null){
                value = "";
            }else{
                value = value + "";
            }
            var value_len = value.length;
            if(rule.type === 'number'){
                if(value_len > 1 && (value[0] === '+' || value[0] === '-')){
                    value_len --;
                }
            }
            var l_max = 0;
            var decimal = rule['decimal'];
            if(length_max !== undefined){
                l_max = length_max;
                if(decimal !== undefined){
                    var v_index = value.indexOf('.');
                    if(v_index >= 0){
                        if(v_index > decimal){
                            l_max -= decimal;
                        }else{
                            value_len -= 1;
                        }
                    }else{
                        l_max -= decimal;
                    }
                }
            }
            if(length_min === undefined){
                if(value_len > l_max){
                    var msg = "";
                    if(decimal === undefined){
                        msg = "最大长度为：" + length_max;
                    }else{
                        msg = "最大整数位长度：" + l_max + "， 最大小数位长度：" + decimal;
                    }
                    return msg;
                }
            }else if(length_max === undefined){
                if(value_len < length_min){
                    return "最小长度为：" + length_min;
                }
            }else{
                if(length_min < l_max && (value_len > l_max || value_len < length_min)){
                    var msg = "";
                    if(decimal === undefined){
                        msg = "长度范围：" + length_min + " ~ " + length_max;
                    }else{
                        msg = "最大整数位长度：" + l_max + "， 最大小数位长度：" + decimal;
                    }
                    return msg;
                }
            }
        }
    }
    return true;
};

// Vue.directive('dialogDrag', {
//     bind(el, binding, vnode, oldVnode) {
//         //弹框可拉伸最小宽高
//         var minWidth = 200;
//         var minHeight = 100;
//         //初始非全屏
//         var isFullScreen = false;
//         //当前宽高
//         var nowWidth = 0;
//         var nowHight = 0;
//         //当前顶部高度
//         var nowMarginTop = 0;
//         //获取弹框头部（这部分可双击全屏）
//         const dialogHeaderEl = el.querySelector('.el-dialog__header');
//         //弹窗
//         const dragDom = el.querySelector('.el-dialog');
//         //给弹窗加上overflow auto；不然缩小时框内的标签可能超出dialog；
//         dragDom.style.overflow = "auto";
//         //清除选择头部文字效果
//         //dialogHeaderEl.onselectstart = new Function("return false");
//         //头部加上可拖动cursor
//         dialogHeaderEl.style.cursor = 'move';
//         // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
//         const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);
//         var moveDown = function(e) {
//             // 鼠标按下，计算当前元素距离可视区的距离
//             const disX = e.clientX - dialogHeaderEl.offsetLeft;
//             const disY = e.clientY - dialogHeaderEl.offsetTop;
//             // 获取到的值带px 正则匹配替换
//             var styL, styT;
//             // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
//             if (sty.left.includes('%')) {
//                 styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100);
//                 styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100);
//             } else {
//                 styL = +sty.left.replace(/\px/g, '');
//                 styT = +sty.top.replace(/\px/g, '');
//             };            document.onmousemove = function (e) {
//                 // 通过事件委托，计算移动的距离
//                 const l = e.clientX - disX;
//                 const t = e.clientY - disY;
//                 // 移动当前元素
//                 dragDom.style.left = '${l + styL}px';
//                 dragDom.style.top = '${t + styT}px';
//                 //将此时的位置传出去
//                 //binding.value({x:e.pageX,y:e.pageY})
//             };
//             document.onmouseup = function (e) {
//                 document.onmousemove = null;
//                 document.onmouseup = null;
//             };
//         }
//         dialogHeaderEl.onmousedown = moveDown;
//         //双击头部全屏效果
//         dialogHeaderEl.ondblclick = function(e) {
//             if (isFullScreen === false) {
//                 nowHight = dragDom.clientHeight;
//                 nowWidth = dragDom.clientWidth;
//                 nowMarginTop = dragDom.style.marginTop;
//                 dragDom.style.left = 0;
//                 dragDom.style.top = 0;
//                 dragDom.style.height = "100VH";
//                 dragDom.style.width = "100VW";
//                 dragDom.style.marginTop = 0;
//                 isFullScreen = true;
//                 dialogHeaderEl.style.cursor = 'initial';
//                 dialogHeaderEl.onmousedown = null;
//             } else {
//                 dragDom.style.height = "auto";
//                 dragDom.style.width = nowWidth + 'px';
//                 dragDom.style.marginTop = nowMarginTop;
//                 isFullScreen = false;
//                 dialogHeaderEl.style.cursor = 'move';
//                 dialogHeaderEl.onmousedown = moveDown;
//             }
//         }
//         dragDom.onmousemove = function (e) {
//             var moveE = e;
//             if (e.clientX > dragDom.offsetLeft + dragDom.clientWidth - 10 || dragDom.offsetLeft + 10 > e.clientX) {
//                 dragDom.style.cursor = 'w-resize';
//             } else if (el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 10) {
//                 dragDom.style.cursor = 's-resize';
//             } else {
//                 dragDom.style.cursor = 'default';
//                 dragDom.onmousedown = null;
//             }
//             dragDom.onmousedown = function(e) {
//                 const clientX = e.clientX;
//                 const clientY = e.clientY;
//                 var elW = dragDom.clientWidth;
//                 var elH = dragDom.clientHeight;
//                 var EloffsetLeft = dragDom.offsetLeft;
//                 var EloffsetTop = dragDom.offsetTop;
//                 dragDom.style.userSelect = 'none';
//                 var ELscrollTop = el.scrollTop;
//                 //判断点击的位置是不是为头部
//                 if (clientX > EloffsetLeft && clientX < EloffsetLeft + elW && clientY > EloffsetTop && clientY < EloffsetTop + 100) {
//                     //如果是头部在此就不做任何动作，以上有绑定dialogHeaderEl.onmousedown = moveDown;
//                 }else{
//                     document.onmousemove = function (e) {
//                         e.preventDefault(); // 移动时禁用默认事件
//                         //左侧鼠标拖拽位置
//                         if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
//                             //往左拖拽
//                             if (clientX > e.clientX) {
//                                 dragDom.style.width = elW + (clientX - e.clientX) * 2 + 'px';
//                             }
//                             //往右拖拽
//                             if (clientX < e.clientX) {
//                                 if(dragDom.clientWidth < minWidth){
//                                 }else{
//                                     dragDom.style.width = elW - (e.clientX - clientX) * 2 + 'px';
//                                 }
//                             }
//                         }
//                         //右侧鼠标拖拽位置
//                         if (clientX > EloffsetLeft + elW - 10 && clientX < EloffsetLeft + elW) {
//                             //往左拖拽
//                             if (clientX > e.clientX) {
//                                 if (dragDom.clientWidth < minWidth) {
//                                 } else {
//                                     dragDom.style.width = elW - (clientX - e.clientX) * 2 + 'px';
//                                 }
//                             }
//                             //往右拖拽
//                             if (clientX < e.clientX) {
//                                 dragDom.style.width = elW + (e.clientX - clientX) * 2 + 'px';
//                             }
//                         }
//                         //底部鼠标拖拽位置
//                         if (ELscrollTop + clientY > EloffsetTop + elH - 20 && ELscrollTop + clientY < EloffsetTop + elH) {
//                             //往上拖拽
//                             if (clientY > e.clientY) {
//                                 if (dragDom.clientHeight < minHeight) {
//                                 } else {
//                                     dragDom.style.height = elH - (clientY - e.clientY) * 2 + 'px';
//                                 }
//                             }
//                             //往下拖拽
//                             if (clientY < e.clientY) {
//                                 dragDom.style.height = elH + (e.clientY - clientY) * 2 + 'px';
//                             }
//                         }
//                     };
//                     //拉伸结束
//                     document.onmouseup = function (e) {
//                         document.onmousemove = null;
//                         document.onmouseup = null;
//                     };
//                 }
//             }
//         }
//     }
// });

// VUE过滤器
// 千分位
Vue.prototype.get_number_sep = function (value, bit, is_cut) {
    if(bit === undefined || bit === null){
        bit = 2;
    }
    if(typeof bit !== 'number'){
        bit = 2;
    }else{
        bit = parseInt(bit + "");
    }
    if(bit < 0){
        bit = 0;
    }
    if (!value && value !== 0) return ' ';
    var v =  Number(value);
    if(isNaN(v)){
        return value;
    }

    var v_float = v.toFixed(bit);

    if(is_cut) {
        var pot = v_float.indexOf('.');
        var v_float_ext = "";
        if(pot >= 0){
            v_float_ext = v_float.substring(pot + 1);
            v_float = v_float.substring(0, pot);
        }
        v_float = v_float.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if(v_float_ext !== ''){
            v_float += '.' + v_float_ext;
        }
    }
    return v_float;
};

// 错误信息
function error_msg(that, title, msg) {
    that.$alert('<div class="error_msg"><span class="h-icon-error"></span>' + msg + '</div>', title, {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
    });
}


// 初始化组件
function vueComponentCreated(obj){
    var _v_model = 'init_data';
    if(obj.$vnode.data.model !== undefined){
        _v_model = obj.$vnode.data.model.expression;
    }
    var obj_parent = obj.$parent.$parent;
    if(obj_parent._sdata_ === undefined){
        obj_parent['_sdata_'] = {};
    }
    if(obj_parent._sobj_ === undefined){
        obj_parent['_sobj_'] = {};
    }
    if(obj_parent._sobj_[_v_model] === undefined){
        obj_parent._sobj_[_v_model] = [];
    }
    obj_parent._sobj_[_v_model].push(obj);
    if(obj_parent._sdata_[_v_model] === undefined){
        obj_parent._sdata_[_v_model] = [];
        var olist = obj.list;
        var ourl = obj.url;
        if(olist !== undefined){
            obj_parent._sdata_[_v_model] = JSON.parse(olist);
        }else if(ourl !== undefined){
            obj.loading = true;
            obj.__axios_get(ourl, function (msg, data) {
                var d_type = typeof data;
                if(d_type === 'object'){
                    for(var i in data){
                        data[i]['key'] += '';
                    }
                    obj_parent._sdata_[_v_model] = data;
                }else if(d_type === 'string'){
                    obj.error_msg = data;
                }

                if(typeof obj.check_update === 'function'){
                    obj.check_update();
                }
                obj.loading = false;
            }, function (msg) {
                obj.loading = false;
                obj.error_msg = msg;
            });
        }
    }
    return [obj_parent._sdata_, _v_model];
}

//复选框
Vue.component('list-checkbox', {
    props: ['value', 'type', 'disabled', 'list', 'url'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        if(typeof this.value !== 'object' || this.value === null || this.value === undefined){
            this.value = [];
        }
        var vcc = vueComponentCreated(this);
        return {
            info: vcc[0],
            index: vcc[1],
            indeterminate: false,
            checked: false,
            min_length: 2,
            loading: this.loading,
            error_msg: this.error_msg
        };
    },
    template: '\
<div class="css_group_checkbox">\
    <el-checkbox :indeterminate="get_indeterminate()" v-model="checked" :checked="get_checked()" @change="check_all" class="check_all" v-show="info[index].length > min_length" :disabled="disabled">全选</el-checkbox>\
    <el-checkbox-group v-model="value" @change="check_update">\
        <span class="first"></span>\
        <el-checkbox v-for="vl in info[index]" :label="vl.key" :key="vl.key" :disabled="disabled || vl.disabled"><span v-html="vl.value"></span></el-checkbox>\
    </el-checkbox-group>\
    <el-link :underline="false" v-show="info[index].length <= 0">\
        <div v-if="loading"><i class="el-icon-loading"></i>正在获取数据...</div>\
        <div v-else>\
            <el-popover placement="right" trigger="hover" :content="error_msg">\
                <el-link :underline="false" slot="reference">获取失败</el-link>\
            </el-popover>\
        </div>\
    </el-link>\
</div>',
    methods: {
        check_all: function () {
            if(this.value === null || this.value === undefined || this.value.length <= 0){
                if(this.value === null || this.value === undefined || typeof this.value !== "object"){
                    this.value = [];
                }
                var _info_ = this.info[this.index];
                for(var i in _info_){
                    this.value.push(_info_[i]['key']);
                }
            }else{
                this.value = [];
            }
            this.check_update();
        },
        check_update: function () {
            if(this.info[this.index].length <= this.min_length){
                return false;
            }
            if(this.value === undefined || this.value === null){
                this.value = [];
            }
            this.$emit('_input_', this.value);
            this.update_values();
            if(this.value === null || this.value === undefined || this.value.length <= 0){
                this.indeterminate = false;
                this.checked = false;
            }else if(this.value.length < this.info[this.index].length && this.value.length > 0){
                this.indeterminate = true;
                this.checked = false;
            }else{
                this.indeterminate = false;
                this.checked = true;
            }
        },
        get_indeterminate: function () {
            this.check_update();
            return this.indeterminate;
        },
        get_checked: function () {
            this.check_update();
            return this.checked;
        },
        update_values: function () {
            var that = this;
            var keys = {};
            var _info_ = that.info[that.index];
            for(var i in _info_){
                keys[_info_[i]['key']] = true;
            }
            var new_value = [];
            for(var i in that.value){
                var iv = that.value[i];
                if(keys[iv]){
                    new_value.push(iv);
                }
            }
            if(that.value === null || that.value === undefined || new_value.length !== that.value.length){
                that.value = new_value;
            }
        }
    },
    watch: {
        value: function () {
            this.update_values();
        }
    }
});

//单选框
Vue.component('list-radio', {
    props: ['value', 'type', 'disabled', 'list', 'url'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        var vcc = vueComponentCreated(this);
        this.update_values();
        return {
            info: vcc[0],
            index: vcc[1],
            loading: this.loading,
            error_msg: this.error_msg,
        };
    },
    template: '\
<div>\
    <el-radio-group v-model="value" @input="$emit(\'_input_\', $event)">\
        <el-radio v-for="vl in info[index]" :label="vl.key" :disabled="disabled || vl.disabled"><span v-html="vl.value"></span></el-radio>\
    </el-radio-group>\
    <el-link :underline="false" v-show="info[index].length <= 0">\
        <div v-if="loading"><i class="el-icon-loading"></i>正在获取数据...</div>\
        <div v-else>\
            <el-popover placement="right" trigger="hover" :content="error_msg">\
                <el-link :underline="false" slot="reference">获取失败</el-link>\
            </el-popover>\
        </div>\
    </el-link>\
</div>',
    methods: {
        update_values: function () {
            var value = this.value;
            if(value === undefined || value === null){
                return;
            }
            if(typeof value === 'object' && value.length > 0){
                this.value = value[0];
            }
        }
    },
    watch: {
        value: function () {
            this.update_values();
        }
    }
});

//复选框
Vue.component('list-select', {
    props: ['value', 'multiple', 'type', 'disabled', 'list', 'url', 'tags'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        var vcc = vueComponentCreated(this);
        this.update_values();
        return {
            info: vcc[0],
            index: vcc[1],
            loading: this.loading
        };
    },
    template: '\
<div class="css_list_select">\
    <el-select v-model="value" @input="$emit(\'_input_\', $event)" :collapse-tags="tags" clearable placeholder="请选择" :multiple="multiple" :filterable="info[index].length > 10" :disabled="disabled">\
        <el-option v-for="vl in info[index]" :key="vl.key" :label="get_value(vl.value)" :value="vl.key"><span v-html="vl.value"></span></el-option>\
    </el-select>\
    <el-link :underline="false" v-show="info[index].length <= 0" :class="disabled ? \'css_link_select_disable\' : \'\'">\
        <div v-if="loading"><i class="el-icon-loading"></i>正在获取数据...</div>\
        <div v-else>\
            <el-popover placement="right" trigger="hover" :content="error_msg">\
                <el-link :underline="false" slot="reference">获取失败</el-link>\
            </el-popover>\
        </div>\
    </el-link>\
</div>',
    methods: {
        get_value: function (value) {
            return value.replace(/<[^>]+>/g,"");
        },
        update_values: function () {
            if(!this.multiple){
                var value = this.value;
                if(value === undefined || value === null){
                    return;
                }
                if(typeof value === 'object' && value.length > 0){
                    this.value = value[0];
                }
            }
        }
    },
    watch: {
        value: function () {
            this.update_values();
        }
    }
});

//联动选择
Vue.component('link-select', {
    props: ['value', 'disabled', 'url', 'top_value', 'nexts', 'next_key', 'search'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function() {
        return {
            values: [],
            datas: [[]],
            t_loading: true,
            is_error: false,
            is_first: true,
            error_msg: '',
            dict: {},    // 请求缓存字典
            dict_kvs: {},    // 联动属性
            next_str: null,
            next_value: null,
            is_change: false,
            select_value: null
        }
    },
    created: function(){
        if(this.search){
            if(this.value === undefined || this.value === null){
                this.next_str = undefined;
                this.next_value = undefined;
            }else{
                this.next_str = JSON.stringify(this.value);
                this.next_value = this.value;
            }
        }
        this.next(0, this.top_value);
    },
    template: '\
<div class="css_link_select">\
    <el-select v-for="(items, key) in datas" v-model="values[key]" clearable @change="change(key, $event, items)" @clear="clear(key)" :key="key" :filterable="items !== undefined && items.length > 10" :disabled="disabled">\
        <el-option v-for="item in items" :key="item.key" :label="get_value(item.value)" :value="item.key"><span v-html="item.value"></span><span v-if="item.child !== undefined">({{item.child}})</span></el-option>\
    </el-select>\
    <el-link :underline="false" v-show="t_loading" :class="disabled ? \'css_link_select_disable\' : \'\'">\
        <div v-if="is_error">{{error_msg}}</div>\
        <div v-else><i class="el-icon-loading"></i>正在获取数据...</div>\
    </el-link>\
</div>\
',
    methods: {
        get_value: function (value) {
            return value.replace(/<[^>]+>/g,"");
        },
        set_emit: function(value){
            if(this.search){
                this.$emit('_input_', this.values.join(','));
            }else{
                if(value !== undefined && value !== null){
                    this.$emit('_input_', value);
                }
            }
            this.select_value = value;
        },
        set_cuts: function(key, data){
            var that = this;
            if(data === undefined || data === null){
                that.datas.splice(key, that.datas.length);
            }else{
                that.datas.splice(key, that.datas.length, data);
            }
            that.values.splice(key, that.values.length);
            if(this.search) {
                that.set_emit();
            }
        },
        next: function(key, value, callback) {
            if(value === undefined || value === null){
                return;
            }
            value = (value + "").trim();
            if(value === ""){
                return;
            }
            var that = this;
            that.datas.splice(key + 1, that.datas.length);
            that.set_emit(value);
            if(that.dict[value] !== undefined){
                that.set_cuts(key, that.dict[value]);
                if(callback !== undefined){
                    callback();
                }
                return;
            }

            that.is_error = false;
            that.t_loading = true;
            that.__axios_post(that.url, {
                top_value: value,
            }, function (msg, data) {
                var d_type = typeof data;
                if(d_type === 'object'){
                    that.set_cuts(key, data);
                    that.dict[value] = data;
                    for(var i in data){
                        var iv = data[i];
                        var ikey = iv['key'] + '';
                        if(that.dict_kvs[ikey] === undefined){
                            that.dict_kvs[ikey] = value;
                        }
                    }
                    that.t_loading = false;
                    if(callback !== undefined){
                        callback();
                    }
                }else if(d_type === 'string'){
                    that.is_error = true;
                    that.error_msg = data;
                }
            }, function (msg) {
                that.is_error = true;
                that.error_msg = msg;
            });
        },
        change: function(key, e, items) {
            var is_change = false;
            for(var i in items){
                var iv = items[i];
                if(iv.key + "" === e + "" && iv.child !== undefined){
                    is_change = true;
                    break;
                }
            }
            if(is_change){
                this.next(key + 1, e);
            }else{
                if(e !== undefined && e !== null){
                    e = (e + "").trim();
                    if(e !== ""){
                        this.set_emit(e);
                    }
                }
                this.set_cuts(key + 1);
            }
        },
        clear: function(key) {
            this.datas.splice(key + 1);
            this.values.splice(key);
            this.t_loading = false;
            var vlen = this.values.length;
            if(vlen > 0){
                this.value = this.values[vlen - 1] + '';
            }else{
                this.value = '';
            }
            this.$emit('_input_', this.value);
            this.select_value = this.value;
        },
        run_next: function (key) {
            var that = this;
            var key_int = parseInt(key) + 1;
            var key_str = key_int + "";
            var value = that.next_value[key];
            this.next(key_int, value, function () {
                var dts_prev = that.datas[key_int - 1];
                for(var i in dts_prev){
                    var iv = dts_prev[i];
                    if(iv.key + "" === value + ""){
                        if(that.values.indexOf(iv.key) <= 0){
                            that.values.push(iv.key);
                        }
                        break;
                    }
                }

                var is_next = false;
                var dts = that.datas[key_int];
                var value_next = that.next_value[key_str];
                for(var i in dts){
                    var iv = dts[i];
                    if(iv.key + "" === value_next + ""){
                        if(iv['child'] === undefined) {
                            if(that.values.indexOf(iv.key) <= 0) {
                                that.values.push(iv.key);
                            }
                            that.set_emit(iv.key + '');
                        }else{
                            is_next = true;
                        }
                        break;
                    }
                }
                if(this.search) {
                    that.set_emit();
                }
                if(is_next){
                    if(that.next_value[key_str] !== undefined){
                        that.run_next(key_str);
                    }
                }
            });
        }
    },
    watch: {
        value: function (value) {
            if(value === undefined){
                this.values = [];
                this.datas.splice(1, this.datas.length);
                return;
            }
            var is_null = false;
            if(value === null || value.trim() === ''){
                is_null = true;
            }
            if(this.search){
                if(is_null){
                    this.clear(0);
                    this.values = [];
                }
            }else{
                this.select_value = value;
            }

            if(this.nexts !== undefined && this.nexts !== null){
                var nv = this.nexts[this.next_key];
                if(nv === undefined || nv === null){
                    this.next_str = nv;
                }else{
                    this.next_str = JSON.stringify(nv);
                }
                this.next_value = nv;
            }else if(is_null){
                this.next_str = undefined;
            }
        },
        select_value: function(value){
            if(!this.search){
                var links = [];
                var t_val = value + '';
                while (t_val !== undefined){
                    links.push(t_val);
                    t_val = this.dict_kvs[t_val];
                    if(t_val === this.top_value + ''){
                        break;
                    }
                }
                links.reverse();
                var is_eq = true;
                if(links.length !== this.values.length){
                    is_eq = false;
                }else{
                    for(var i in links){
                        if(links[i] + '' !== this.values[i] + ''){
                            is_eq = false;
                            break;
                        }
                    }
                }
                if(!is_eq){
                    for(var i in links){
                        var iv = links[i];
                        var chg = this.dict[iv];
                        if(chg !== undefined){
                            this.datas.splice(i + 1, this.datas.length, chg);
                        }
                        var pid = this.dict_kvs[iv];
                        if(pid !== undefined){
                            var pchg = this.dict[pid];
                            if(pchg !== undefined){
                                var select_v = iv;
                                for(var j in pchg){
                                    var jv = pchg[j];
                                    if(jv.key + '' === iv + ''){
                                        select_v = jv.key;
                                        break;
                                    }
                                }
                                this.values.splice(i, this.values.length, select_v);
                            }
                        }
                    }
                }
            }
        },
        next_str: function () {
            this.datas.splice(1, this.datas.length);
            this.values = [];
            var value = this.next_value;
            if(value !== undefined && value !== null && value.length > 0){
                for(var i in value){
                    this.run_next(i);
                    break;
                }
            }
        }
    }
});

// 不可输入框
Vue.component('disable-input', {
    props: ['value', 'is_add', 'info'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        return {
            i_type: this.info.type,
            i_key: this.info.key,
            i_value: this.info.value,
            is_set: false
        };
    },
    created: function(){
        this.set_input();
    },
    template: '\
<div>\
    <template v-if="is_set">\
        <el-input v-model="i_value" :disabled="true"></el-input>\
    </template>\
    <template v-else>\
        <el-input v-model="value" @input="set_value($event)"></el-input>\
    </template>\
</div>\
',

    methods: {
        set_input: function () {
            var is_set = false;
            if(this.i_type === 'add'){
                if(this.is_add){
                    is_set = true;
                }
            }else{
                is_set = true;
            }
            this.is_set = is_set;
            if(is_set){
                this.$emit('_input_', this.i_key);
            }
        },
        set_value: function (value) {
            if(!this.is_set){
                this.$emit('_input_', value);
            }
        }
    },

    watch: {
        value: function(){
            this.set_input();
        },
        is_add: function () {
            this.set_input();
        }
    }
});

// 上传图片预览延时显示处理
Vue.component('upload-image', {
    props: ['value', 'show'],
    model: {
        prop: 'value'
    },
    data: function(){
        return {
            value_tmp: this.value,
            timer: -1
        };
    },
    template: '\
<el-image icon="el-icon-view" :src="value_tmp" :preview-src-list="[value_tmp]">\
    <div slot="error" class="image-slot"><i class="el-icon-picture-outline"></i></div>\
</el-image>\
',
    watch: {
        value: function (value) {
            var that = this;
            clearTimeout(that.timer);
            that.timer = setTimeout(function () {
                that.value_tmp = value;
            }, 500);
        },
        show: function (value) {
            var that = this;
            if(value){
                that.value_tmp = that.value;
            }
        }
    }
});

// 状态框
Vue.component('upload', {
    props: ['value', 'action', 'disabled', 'type', 'format', 'file_max_size'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        var fmt_arr = this.format.replace(/ /g, '').split(',');
        var format_kv = {};
        for(var i in fmt_arr){
            format_kv[fmt_arr[i]] = true;
        }
        if(this.file_max_size === undefined || this.file_max_size === null || this.file_max_size.trim() === ''){
            this.file_max_size = 0;
        }else{
            this.file_max_size = parseInt(this.file_max_size);
        }
        return {
            loading: null,
            format_kv: format_kv
        };
    },
    template: '\
<el-upload :action="action" :show-file-list="false" slot="append" :on-success="success" :on-error="error" :before-upload="before" :disabled="disabled">\
    <slot></slot>\
</el-upload>\
',
    methods: {
        loading_open: function(){
            this.loading = this.$loading({
                text: '上传中，请稍后...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.3)'
            });
        },
        loading_close: function(){
            if(this.loading){
                this.loading.close();
            }
        },
        success: function(res) {
            var that = this;
            that.loading_close();
            var err_msg = '';
            if(that.type === 'image'){
                err_msg = '生成图片失败';
            }else{
                err_msg = '生成文件失败';
            }
            if(typeof res !== "object"){
                that.$message.error(res);
            }else if(res.code === 0){
                that.$message.error(res.msg);
            }else if(res.data.length <= 0){
                that.$message.error(err_msg);
            }else{
                that.value = res.data[0];
                this.$emit('_input_', this.value);
            }
        },
        error: function(res) {
            this.loading_close();
            var text = res.srcElement.responseText;
            if(text == undefined || text == ''){
                text = "页面无法访问或超时";
            }
            this.$message.error(text);
        },
        before: function(file) {
            var that = this;
            var f_size = file.size / 1024 / 1024;
            if (f_size > that.file_max_size) {
                that.$message.error('上传文件大小不能超过 ' + that.file_max_size + 'MB');
                return false;
            }
            var fn_pos = file.name.lastIndexOf('.');
            if(fn_pos <= 0){
                that.$message.error('无效格式文件');
                return false;
            }
            var fn_ext = file.name.substring(fn_pos + 1).trim().toLowerCase();
            if(!that.format_kv[fn_ext]){
                that.$message.error('仅支持 ' + that.format + ' 格式');
                return false;
            }
            that.loading_open();
            return true;
        }
    }
});

// 编辑器
Vue.component('editor', {
    props: ['value', 'disabled', 'url', 'type', 'format', 'file_max_size'],
    model: {
        prop: 'value',
        event: '_input_'
    },
    data: function(){
        var that = this;
        if(that.value === undefined || that.value === null){
            that.value = '';
        }
        if(this.file_max_size === undefined || this.file_max_size === null || this.file_max_size.trim() === ''){
            this.file_max_size = 0;
        }else{
            this.file_max_size = parseInt(this.file_max_size);
        }
        if(this.url === undefined || this.url === null){
            this.url = '';
        }
        return {
            id: "editor_" + that.random(),
            url_image: this.url.replace('###', 'page.upload_image'),
            url_file: this.url.replace('###', 'page.upload_file'),
            url_media: this.url.replace('###', 'page.upload_media'),
            loading: null,
        };
    },
    mounted: function(){
        var that = this;
        tinyMCE.init({
            selector: '#' + that.id,
            language:'zh_CN',
            menubar: false,
            plugins: 'preview searchreplace fullscreen image link media code table charmap hr insertdatetime advlist lists wordcount textpattern help',
            toolbar: 'code undo redo | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify outdent indent bullist numlist |\
                     hr insertdatetime | table image media charmap | styleselect fontselect fontsizeselect | preview removeformat link help fullscreen',
            fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
            font_formats: '宋体=simsun,serif;仿宋体=FangSong,serif;\
                     黑体=SimHei,sans-serif;\
                     Arial=arial,helvetica,sans-serif;\
                     Arial Black=arial black,avant garde;\
                     Book Antiqua=book antiqua,palatino;\
                     Comic Sans MS=comic sans ms,sans-serif;\
                     Courier New=courier new,courier;\
                     Georgia=georgia,palatino;\
                     Helvetica=helvetica;\
                     Impact=impact,chicago;\
                     Tahoma=tahoma,arial,helvetica,sans-serif;\
                     Terminal=terminal,monaco;\
                     Times New Roman=times new roman,times;',
            template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',
            template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',
            toolbar_mode: 'wrap',
            // 关闭自动转化相对路径
            relative_urls: false,

            images_upload_handler: function (blobInfo, succFun, failFun) {
                var file = blobInfo.blob();
                var f_size = file.size / 1024 / 1024;
                if (f_size > that.file_max_size) {
                    failFun('上传文件大小不能超过 ' + that.file_max_size + 'MB');
                    return false;
                }

                that.loading_open();
                var xhr, formData;
                xhr = new XMLHttpRequest();
                xhr.withCredentials = false;
                xhr.open('POST', that.url_image);
                xhr.onload = function() {
                    that.loading_close();
                    if (xhr.status !== 200) {
                        failFun("错误码: " + xhr.status);
                        return;
                    }
                    var json = JSON.parse(xhr.responseText);
                    if(typeof json !== "object"){
                        failFun(xhr.responseText);
                    }else if(json.code === 0){
                        failFun(json.msg);
                    }else if(json.data.length <= 0){
                        failFun('生成图片失败');
                    }else{
                        succFun(json.data[0]);
                    }
                };
                xhr.onerror = function() {
                    that.loading_close();
                    var text = xhr.responseText;
                    if(text === undefined || text === ''){
                        text = "页面无法访问或超时";
                    }
                    failFun(text);
                };
                formData = new FormData();
                formData.append('file', file, file.name);
                xhr.send(formData);
            },

            file_picker_callback: function(callback, value, meta) {
                // 上传类型
                var file_type = meta['filetype'];
                var post_url = that.url_file;
                if(file_type === 'image'){
                    post_url = that.url_image;
                }else if(file_type === 'media'){
                    post_url = that.url_media;
                }

                var input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.click();
                input.onchange = function() {
                    var file = this.files[0];
                    var f_size = file.size / 1024 / 1024;
                    if (f_size > that.file_max_size) {
                        that.alert('上传文件大小不能超过 ' + that.file_max_size + 'MB');
                        return;
                    }

                    that.loading_open();
                    var xhr, formData;
                    xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', post_url);
                    xhr.onload = function() {
                        that.loading_close();
                        if (xhr.status !== 200) {
                            that.alert('错误码: ' + xhr.status);
                            return;
                        }

                        var json = JSON.parse(xhr.responseText);
                        if(typeof json !== "object"){
                            that.alert(xhr.responseText);
                        }else if(json.code === 0){
                            that.alert(json.msg);
                        }else if(json.data.length <= 0){
                            that.alert('生成图片失败');
                        }else{
                            callback(json.data[0]);
                        }
                    };
                    xhr.onerror = function() {
                        that.loading_close();
                        var text = xhr.responseText;
                        if(text === undefined || text === ''){
                            text = "页面无法访问或超时";
                        }
                        that.alert(text);
                    };
                    formData = new FormData();
                    formData.append('file', file, file.name );
                    xhr.send(formData);
                };
            },
        }).then(function(tobj){
            var ty = tinyMCE.editors[that.id];
            if(ty !== undefined && tobj[0] !== undefined) {
                if(that.readonly === 1){
                    tobj[0].on('change input', function () {
                        ty.setContent(that.value);
                    });
                }else{
                    tobj[0].on('blur', function () {
                        that.$emit('_input_', ty.getContent());
                    });
                }
            }
            that.set_status();
        });
    },
    template: '<textarea v-model="value" :id="id"></textarea>',
    methods: {
        loading_open: function(){
            this.loading = this.$loading({
                text: '上传中，请稍后...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.3)'
            });
        },
        loading_close: function(){
            if(this.loading){
                this.loading.close();
            }
        },
        alert: function (msg) {
            this.$alert(msg, {
                confirmButtonText: '确定',
                closeOnClickModal: true,
                type: 'error'
            });
        },
        set_status: function () {
            var te = tinyMCE.editors[this.id];
            if(this.disabled){
                te.setMode('readonly');
            }else{
                te.setMode('design');
            }
        }
    },
    watch: {
        value: function (value) {
            var te = tinyMCE.editors[this.id];
            if(te !== undefined){
                if(value === undefined || value === null){
                    value = '';
                }
                te.setContent(value);
            }
        },
        disabled: function () {
            this.set_status();
        }
    }
});