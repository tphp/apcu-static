$(function () {
    var body = $(".body");
    var lfp = $(".layui-form-pane");
    var js_url_input = $(".js_url_input");
    var js_field_list = $(".js_field_list");
    var js_api_args = $(".js_api_args");
    var js_api_oper = $(".js_api_oper");
    var js_move_top_down = $(".js_move_top_down");
    var js_iframe = $(".js_iframe");
    var is_move = false;
    var jir_width = 380;
    var min_size = 200;
    var move_pop = $(".move_pop");
    function resize(){
        var jir = $(".js_post_args input.right");
        var jfa = $(".js_post_args .fa");
        js_url_input.hide();
        jir.hide();
        jfa.hide();
        var left = lfp.position().left + 238;
        var wwidth = $(window).width();
        js_url_input.width(wwidth - left);
        jir.width(wwidth - jir_width)
        js_url_input.show();
        if (wwidth > jir_width){
            jir.show();
            jfa.show();
        }
        resize_run();
    }

    $(window).resize(function () {
        resize();
    });

    $('body').keydown(function(e) {
        //Ctrl + s 保存
        if (e.keyCode == 83 && e.ctrlKey) {
            $(".layui-layer-btn-save").trigger("click");
            return false;
        }
    });

    // 上下移动
    js_move_top_down.mousedown(function () {
        is_move = true;
    }).mouseup(function () {
        is_move = false;
    });

    $(document).mousemove(function (e) {
        if(is_move){
            move_pop.hide();
            move_top_down(e.clientY);
        }
    }).mouseup(function () {
        move_pop.show();
        is_move = false;
    });

    function move_top_down(e_y){
        var b_height = body.height();
        var set_top = e_y - body.offset().top;
        if(set_top < min_size){
            set_top = min_size;
        }
        var set_down = b_height - set_top;
        if(set_down < min_size){
            set_down = min_size;
            set_top = b_height - min_size;
        }
        if(set_top + set_down < min_size * 2){
            set_top = b_height / 2;
            set_down = b_height / 2;
        }
        js_api_args.css('height', set_top);
        js_api_oper.css('height', set_down);
        resize();
    }

    move_top_down(0);

    layui.use(['element'], function(){
        resize();
        $(".layui-form-pane label").click(function () {
            js_url_input.focus();
        });
    });

    function resize_run(){
        $(".js_run").css("display", "none");

        var ww = $(window).width();
        var wh = $(window).height();
        var wh2 = 0;
        var jftop = $(".js_field").offset().top;
        var h = wh - jftop;
        if(h < wh2) h = wh2;
        h = h - 1;
        $(".js_field").height(h).find(">.list").height(h - 33);
        var in_w = ww - 241;
        var in_h = h - 33;
        $(".js_run").width(in_w).height(h).find(">.list").height(in_h);
        js_iframe.width(in_w).height(in_h);
        $('body').height(100);
        $(".js_run").css("display", "");
    }

    /**
     * 正则表达式判定Url
     * @param url
     * @returns {Boolean}
     */
    function check_url(url){
        //url= 协议://(ftp的登录信息)[IP|域名](:端口号)(/或?请求参数)
        var strRegex = '^((https|http|ftp)://)?'//(https或http或ftp):// 可有可无
            + '(([\\w_!~*\'()\\.&=+$%-]+: )?[\\w_!~*\'()\\.&=+$%-]+@)?' //ftp的user@  可有可无
            + '(([0-9]{1,3}\\.){3}[0-9]{1,3}' // IP形式的URL- 3位数字.3位数字.3位数字.3位数字
            + '|' // 允许IP和DOMAIN（域名）
            + '(localhost)|'	//匹配localhost
            + '([\\w_!~*\'()-]+\\.)*' // 域名- 至少一个[英文或数字_!~*\'()-]加上.
            + '\\w+\\.' // 一级域名 -英文或数字  加上.
            + '[a-zA-Z]{1,6})' // 顶级域名- 1-6位英文
            + '(:[0-9]{1,5})?' // 端口- :80 ,1-5位数字
            + '((/?)|' // url无参数结尾 - 斜杆或这没有
            + '(/[\\w_!~*\'()\\.;?:@&=+$,%#-]+)+/?)$';//请求参数结尾- 英文或数字和[]内的各种字符

        // var strRegex1 = '^(?=^.{3,255}$)((http|https|ftp)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/)?(?:\/(.+)\/?$)?(\/\w+\.\w+)*([\?&]\w+=\w*|[\u4e00-\u9fa5]+)*$';
        var re=new RegExp(strRegex,'i');//i不区分大小写
        //将url做uri转码后再匹配，解除请求参数中的中文和空字符影响
        if (re.test(encodeURI(url))) {
            return (true);
        } else {
            return (false);
        }
    }

    layui.use(['form'], function () {
        var themes = get_ace_themes();
        function getFieldset() {
            var fields = [];
            $(".js_field_list>div").each(function () {
                var key = $(this).attr("key").trim();
                var func = $(this).attr("func").trim();
                if (key == undefined || key == "" || func == undefined || func == "") return;
                fields.push({key: key, func: func});
            });
            $("#fieldset").val(JSON.stringify(fields));
            return fields;
        }

        //编辑字段配置
        js_field_list.on('click', '.edit', function () {
            var pt = $(this).parent();
            var jsfn = ".js_set_field_html .js_set_field_name";
            var jsff = ".js_set_field_html .js_set_field_func";

            var fname = pt.attr("key");
            if (fname == undefined) fname = "";
            var func = pt.attr("func");
            if (func == undefined) func = "";

            var layerid = layer.open({
                type: 1
                , title: "编辑 - " + fname
                , area: [(areawidth + 200) + 'px', areaheight + 'px']
                , shade: 0.1
                , offset: 'auto'
                , content: field_html
                , btn: ['保存', '取消']
                , yes: function (index) {
                    pt.attr("key", $(jsfn).val());
                    pt.attr("func", $(jsff).val());
                    layer.close(index);
                    getFieldset();
                }
                , btn2: function () {
                    layer.closeAll();
                }
            });
            dbclick_close(layerid);

            $(jsfn).val(fname).attr("disabled", "");
            $(jsff).val(func).keydown(function (event) {
                if (event.keyCode == 9) {
                    $(this).insert("\t");
                    return false;
                }
            });
            help(layerid);
        });

        //字段上移
        js_field_list.on('click', '.up', function () {
            var _this = $(this);
            var parent = _this.parent();
            var prev = parent.prev();
            if (prev[0] != undefined) {
                prev.before(parent.prop("outerHTML"));
                parent.remove();
            }
            getFieldset();
        });

        //字段下移
        js_field_list.on('click', '.down', function () {
            var _this = $(this);
            var parent = _this.parent();
            var next = parent.next();
            if (next[0] != undefined) {
                next.after(parent.prop("outerHTML"));
                parent.remove();
            }
            getFieldset();
        });

        //增加字段配置
        function addfield(fname, func) {
            var ret = false;
            if (fname == undefined || fname == "") {
                layer.msg("字段名称不能为空！", {icon: 2});
            } else {
                js_field_list.append(
                    $('<div></div>').attr("key", fname).attr("func", func).append(
                        $('<span class="fname"></span>').html(fname)
                    ).append('<span class="edit">编辑</span><span class="del">删除</span><span class="up fa fa-long-arrow-up"></span><span class="down fa fa-long-arrow-down"></span>')
                );
                ret = true;
            }
            return ret;
        }

        //设置字段
        function set_all_field(){
            var jfljson = js_field_list.attr('data-json');
            if (jfljson != undefined && jfljson != "") {
                var dj = eval("(" + js_field_list.attr('data-json') + ")");
                for (var i in dj) {
                    addfield(dj[i]['key'], dj[i]['func']);
                }
            }
        }

        set_all_field();

        //删除字段
        js_field_list.on('click', '.del', function () {
            var pt = $(this).parent();
            dbclick_close(layer.confirm("确定删除 " + pt.attr("key") + " ？", {
                shade: 0.1
            }, function (index) {
                pt.remove();
                layer.close(index);
                getFieldset();
            }));
        });

        var field_html = '<div class="layui-form js_set_field_html">' +
            '<div class="layui-form-item">' +
            '   <label class="layui-form-label">字段名称</label>' +
            '   <div class="layui-input-block"><input type="text" class="layui-input js_set_field_name"></div>' +
            '</div>' +
            '<div class="layui-form-item">' +
            '   <label class="layui-form-label">运行函数</label>' +
            '   <div class="layui-input-block"><textarea class="layui-textarea js_set_field_func" style="height: 220px"></textarea></div>' +
            '</div>' +
            '</div>';

        var all_field_html =    '<div class="layui-form js_set_all_field_html">' +
            '<div class="layui-form-item">' +
            '   <label class="layui-form-label">字段数据</label>' +
            '   <div class="layui-input-block"><textarea class="layui-textarea js_set_all_field_json" style="height: 270px">###</textarea></div>' +
            '</div>' +
            '</div>';

        var areawidth = 600;
        var areaheight = 400;

        function help(layerid){
            var pllb = $('#layui-layer' + layerid + ' .layui-layer-btn');
            pllb.append('<a class="remark">函数说明</a>');
            pllb.append('<a class="all_field">全局设置</a>');
            pllb.find(".remark").css("float", "left").click(function () {
                window.open("/sys/manage/menu/ini", "_blank");
            });
            pllb.find(".all_field").css("float", "left").click(function () {
                var layerid = layer.open({
                    type: 1
                    , title: "全局字段设置"
                    , area: [(areawidth + 200) + 'px', areaheight + 'px']
                    , shade: 0.1
                    , offset: 'auto'
                    , content: all_field_html.replace('###', JSON.stringify(getFieldset(), null, '\t'))
                    , btn: ['设置', '复制', '取消']
                    , yes: function (index) {
                        var json_str = $("#layui-layer" + index).find('.js_set_all_field_json').val();
                        try{
                            var json = JSON.parse(json_str);
                            json_str = JSON.stringify(json);
                        }catch (e) {
                            layer.msg("格式错误！", {icon:2});
                            return false;
                        }
                        js_field_list.attr('data-json', json_str);
                        js_field_list.find(">div").remove();
                        set_all_field();
                        getFieldset();
                        layer.closeAll();
                    }
                    , btn2: function (index) {
                        $("#layui-layer" + index).find('.js_set_all_field_json').copy_text();
                        return false;
                    }
                    , btn3: function (index) {
                        layer.close(index);
                    }
                });
                dbclick_close(layerid);
            });
        }

        var jpah = $(".js_post_args_html").html();
        var jpahh = $(".js_post_args_html_header").html();
        var db_url = $('body').attr('data-base-url');
        var dir = $("#__dir__").val();
        var link_url = '<link rel="stylesheet" href="'  + $("#link_url").val() + '"/>';
        var is_json = false;

        //清空字段配置
        $(".js_field_title_clear_button").click(function () {
            var fields = getFieldset();
            if (fields.length > 0) {
                dbclick_close(layer.confirm("确定删除所有字段配置？", {
                    shade: 0.1
                }, function (index) {
                    $(".js_field_list>div").remove();
                    layer.close(index);
                    $("#fieldset").val('[]');
                }));
            } else {
                layer.msg("字段未设置！", {icon: 2, time: 1500});
            }
        });


        //增加字段配置
        $(".js_field_title_button").click(function () {
            var layerid = layer.open({
                type: 1
                , title: "字段配置"
                , area: [(areawidth + 200) + 'px', areaheight + 'px']
                , shade: 0.1
                , offset: 'auto'
                , content: field_html
                , btn: ['增加', '取消']
                , yes: function (index) {
                    var jsfh = $(".js_set_field_html");
                    var fname = jsfh.find(".js_set_field_name").val().trim();
                    var func = jsfh.find(".js_set_field_func").val();
                    if (addfield(fname, func)) {
                        layer.close(index);
                    }
                    getFieldset();
                }
                , btn2: function () {
                    layer.closeAll();
                }
            });
            dbclick_close(layerid);
            $(".js_set_field_html .js_set_field_func").keydown(function (event) {
                if (event.keyCode == 9) {
                    $(this).insert("\t");
                    return false;
                }
            });
            help(layerid);
        });

        //删除字段
        $('.layui-tab-content').on('click', '.fa-remove', function () {
            $(this).parent().remove();
        });

        //自动向下添加POST或Header字段
        $(".js_post_args_main input").on("keyup contextmenu mouseup",function(){
            var classname = $(this).attr('class').replace("layui-input ", "");
            var tp = $(this).parent();
            var key = tp.find('input.left').val();
            var value = tp.find('input.right').val();
            var type = tp.parent().attr('data-type');
            tp.find('input.left').val("");
            tp.find('input.right').val("");
            if(type === 'post') {
                tp.before(jpah)
            }else{
                tp.before(jpahh)
            }

            var tpp = tp.prev();
            tpp.find("input.left").val(key);
            tpp.find("input.right").val(value);
            tpp.find("." + classname).focus();
            if(type === 'post' && classname === 'right'){
                tpp.find("." + classname).trigger('click');
            }
            resize();
        });

        //设置文本框数据
        $('.layui-tab-content').on('click', '.js_post_args_body .right', function () {
            var _this = $(this);
            var value = _this.attr("value");
            var htmltxt = _this.prev().val();
            dbclick_close(layer.prompt({
                formType: 2,
                title: '编辑：' + htmltxt,
                area: ['400px', '200px'],
                value: value,
                shade: 0.1,
                yes: function(index, layero){
                    layer.close(index);
                    // 获取文本框输入的值
                    var text = layero.find(".layui-layer-input").val();
                    _this.val(text);
                    _this.attr("value", text);
                }
            }));
        });

        //OAuth验证，base64编码
        $(".js_oauth_set").click(function () {
            var user = $("input[name=oauth_user]").val();
            var password = $("input[name=oauth_password]").val();
            var color = '#09C';
            if(user == undefined || user == ''){
                layer.tips('账号不能为空!', '#oauth_user', {
                    tips: [4, color]
                });
                return false;
            }
            if(password == undefined || password == ''){
                layer.tips('密码不能为空!', '#oauth_password', {
                    tips: [4, color]
                });
                return false;
            }
            var base64str = user + ":" + password;
            var base64 = "Basic " + $.base64.btoa(base64str);
            var bool = false;
            var obj = null;
            $(".js_post_args_header .js_post_args").each(function () {
                var _this = $(this);
                var key = _this.find(".left").val().trim();
                if(key === 'Authorization'){
                    obj = _this;
                    _this.find(".right").val(base64);
                    bool = true;
                    return false;
                }
            });

            var jpam = $(".js_post_args_header .js_post_args_main");
            if(!bool){
                jpam.find("input.left").focus().trigger("keyup");
                var jpamp = jpam.prev();
                obj = jpamp;
                jpamp.find(".left").val('Authorization');
                jpamp.find(".right").val(base64);
            }

            $("ul.layui-tab-title li[data-tab='header']").trigger("click");
            obj.find("input.right").focus();
        });

        //关闭
        $(".layui-layer-btn-close").click(function () {
            var llc = parent.$(".layui-layer-close:last");
            if(llc.size() <= 0){
                window.opener=null;
                window.open('','_self');
                window.close();
            }else{
                llc.trigger("click");
            }
        });

        /**
         * 获取POST或Header数据
         * @returns {Array}
         */
        function get_datas(classname, is_value){
            var databools = {};
            var datas = [];
            $(classname).each(function () {
                var key = $(this).find(".left").val();
                var value = "";
                if(is_value) {
                    value = $(this).find(".right").attr('value');
                }else{
                    value = $(this).find(".right").val();
                }
                if(key !== undefined && key !== '' && databools[key] === undefined){
                    databools[key] = true;
                    datas.push({
                        key: key,
                        value: value
                    });
                }
            });
            return datas;
        }

        //获取POST
        function get_posts(){
            return get_datas(".js_post_args_post .js_post_args_body", true);
        }

        //获取Header
        function get_headers(){
            return get_datas(".js_post_args_header .js_post_args_text");
        }

        var js_args_json = $(".js_args_json");
        var js_args_post = $(".js_args_post");
        $("#post_type").change(function () {
            if($(this).val() === 'json'){
                js_args_json.removeClass('css_hide');
                js_args_post.addClass('css_hide');
            }else{
                js_args_json.addClass('css_hide');
                js_args_post.removeClass('css_hide');
            }
        });

        //保存
        $(".layui-layer-btn-save").click(function () {
            var data = {};
            var posts = get_posts();
            var headers = get_headers();
            $("#posts").val(JSON.stringify(posts));
            $("#headers").val(JSON.stringify(headers));
            $(".js_data_save").each(function () {
                var _this = $(this);
                var id = _this.attr("id");
                var value = _this.val();
                data[id] = value;
            });

            if(is_json){
                data['result'] =  $("#RawJson").val();
            }else{
                data['result'] =  "非JSON数据模式";
            }
            $.ajax({
                type: "post",
                url: db_url + "?dir=" + dir,
                data: data,
                error: function (XMLHttpRequest, textStatus){
                    xml_http_request_err(XMLHttpRequest, textStatus);
                },
                success: function (result) {
                    if(result.code == 1){
                        layer.msg(result.msg, {icon:1});
                    }else{
                        dbclick_close(layer.alert(result.msg, {icon: 2, title: '错误'}));
                    }
                }
            });
        });
        var js_run_url_msg = '正在执行...';
        var js_run_url_timeout = "";
        var js_run_url_time = 0;
        var js_run_url_step = 1000;
        function js_run_url_func(){
            clearTimeout(js_run_url_timeout);
            js_run_url_timeout = setTimeout(js_run_url_func, js_run_url_step);
            $(".js_message").html(js_run_url_msg + " " + js_run_url_time + " 秒");
            js_run_url_time ++;
        }

        function js_run_url_start(){
            js_run_url_time = 0;
            $(".js_message").show();
            js_run_url_func();
        }

        function js_run_url_end(){
            clearTimeout(js_run_url_timeout);
            $(".js_message").hide().html("");
        }

        //获取URL链接
        function get_url(url) {
            if(url.substring(0, 8).toLowerCase() != 'https://' && url.substring(0, 7).toLowerCase() != 'http://'){
                url = "http://" + url;
            }
            if(!check_url(url)){
                layer.msg("URL格式不正确", {icon:2});
                return false;
            }
            var post_type = $("#post_type").val();
            if(post_type == 'get') {
                var posts = get_posts();
                if (posts.length > 0) {
                    var urlparam = $().urlparam().setUrl(url);
                    for (var i in posts) {
                        var value = posts[i]['value'].replace(/\n/g, "").replace(/\r/g, "");
                        urlparam.set(posts[i]['key'], value);
                    }
                    url = urlparam.getUrl();
                }
            }
            return url;
        }

        var js_iframe_html_body = $(document.getElementById('js_iframe_html').contentWindow.document.body);
        var js_iframe_code_body = $(document.getElementById('js_iframe_code').contentWindow.document.body);

        $(js_iframe_html_body, js_iframe_code_body).keydown(function(e) {
            //Ctrl + s 保存
            if (e.keyCode == 83 && e.ctrlKey) {
                $(".layui-layer-btn-save").trigger("click");
                return false;
            }
        });

        var id_json = $("#json");
        $(".js_run_post").click(function () {
            var _this = $(this);
            var is_run = _this.attr('is-run');
            if(is_run === 'yes'){
                layer.msg("任务正在执行中...", {icon:2});
                return false;
            }else{
                _this.attr('is-run', 'yes');
            }

            var url = get_url($("#url").val());
            if(url === false){
                _this.attr('is-run', 'no');
                return false;
            }
            var durl = _this.attr("data-url");
            var post_type = $("#post_type").val();
            var headers = get_headers();
            var fieldset = getFieldset();
            var setheaders = {};
            for(var i in headers){
                setheaders[headers[i]['key']] = headers[i]['value'];
            }
            var data = {};
            if(post_type === 'post') {
                var posts = get_posts();
                var postdata = {};
                for(var i in posts){
                    postdata[posts[i]['key']] = posts[i]['value'];
                }
                data['posts'] = JSON.stringify(postdata);
            }else if(post_type === 'json'){
                data['posts'] = id_json.val();
            }
            data['url'] = url;
            data['headers'] = JSON.stringify(setheaders);
            data['fieldset'] = JSON.stringify(fieldset);
            data['type'] = post_type;
            is_json = false;
            js_run_url_start();
            $(".js_control_text").html("<span style='color:#F00;'>获取中...</span>").show();
            var start_time = (new Date()).getTime();
            $.ajax({
                type: "POST",
                dataType: 'html',
                data: data,
                url: durl,
                error: function (XMLHttpRequest, textStatus){
                    _this.attr('is-run', 'no');
                    js_run_url_end();
                    $(".js_control_text").css("display", "");
                    $(".js_message").html("<div style='color:#F00;'>" + textStatus + ":" + "页面无法访问或超时</div>").show();
                    js_iframe_code_body.html("");
                    js_iframe_html_body.html("");
                },
                success: function(result) {
                    var end_time = (new Date()).getTime();
                    $(".js_control_text").html(((end_time - start_time) / 1000) + " ms");
                    _this.attr('is-run', 'no');
                    js_run_url_end();
                    $("#RawJson").val(result);
                    try {
                        //判断是否是JSON格式
                        var rdata = JSON.parse(result);
                        var json_str = JSON.stringify(rdata, null, '\t');

                        $("#js_iframe").hide();
                        $(".js_run_list").html('<div id="run_data_json">' + json_str + '</div>').show();
                        is_json = true;

                        var editor_json = ace.edit("run_data_json");
                        editor_json.setTheme(themes.xcode);
                        editor_json.session.setMode("ace/mode/hjson");
                        editor_json.setShowPrintMargin(false);
                        editor_json.setReadOnly(true);

                    } catch(e) {
                        $(".js_run_list").hide();
                        result = result.replace(/\r/g, "");

                        //iframe 源码
                        var dlhl = new DlHighlight({lang: 'html', lineNumbers : true });
                        var htmlcode = "<html><head>" + link_url + "</head><body>";
                        htmlcode += "<pre class=\"DlHighlight\"><pre>" + dlhl.doItNow(result) + "</pre></pre>";
                        htmlcode += "</body></html>";
                        js_iframe_code_body.html(htmlcode);

                        //iframe HTML
                        var html = $().clear_script(result);
                        js_iframe_html_body.html(html);
                        set_html();
                    }
                }
            });
        });

        $("#show_type").change(function () {
            set_html();
        });

        //设置访问接口返回状况
        function set_html() {
            if(is_json){
                layer.msg("该功能对JSON数据无效！", {icon: 2});
                return;
            }
            var show_type = $("#show_type").val();
            if(show_type == 'code'){
                $("#js_iframe_html").hide();
                $("#js_iframe_code").show();
            }else{
                $("#js_iframe_code").hide();
                $("#js_iframe_html").show();
            }
        }

        $('.js_run_post_copy').click(function () {
            $('#RawJson').copy_text("数据复制成功");
        });

        //预览原URL
        $(".js_run_post_view_url").click(function () {
            var url = get_url($("#url").val());
            if(url === false){
                return false;
            }
            window.open(url, "_blank");
        });

        //预览API URL
        $(".js_run_post_view_api").click(function () {
            var url = get_url($(this).attr("data-url"));
            if(url === false){
                return false;
            }
            window.open(url, "_blank");
        });

        //监听指定开关
        layui.form.on('switch(oauth_status)', function(){
            $("#oauth_status").val(this.checked ? '1' : '0');
        });

        //刷新
        $(".layui-layer-btn-flush").click(function () {
            window.location.reload()
        });
    });
});
