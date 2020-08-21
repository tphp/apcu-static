var args_init;
$(function () {
    var js_run_sql_url = $(".js_run_sql").attr('data-uri');
    var control = 'M';
    var js_field_list = $(".js_field_list");
    $.fn.getCursorPosition = function () {
        var el = $(this).get(0);
        var pos = 0;
        if ('selectionStart' in el) {
            pos = el.selectionStart;
        } else if ('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }

    $.fn.extend({
        "insert" : function(value){ //默认参数
            if(value == undefined) value = "";
            var dthis = $(this)[0]; //将jQuery对象转换为DOM元素
            //IE下
            if(document.selection){
                $(dthis).focus(); //输入元素textara获取焦点
                var fus = document.selection.createRange();//获取光标位置
                fus.text = value; //在光标位置插入值
                $(dthis).focus(); ///输入元素textara获取焦点
                fus.moveStart('character', -$(dthis).value.length);
            }else if(dthis.selectionStart || dthis.selectionStart == '0'){ //火狐下标准
                var start = dthis.selectionStart; 　　 //获取焦点前坐标
                var end =dthis.selectionEnd; 　　//获取焦点后坐标
                //以下这句，应该是在焦点之前，和焦点之后的位置，中间插入我们传入的值 .然后把这个得到的新值，赋给文本框
                dthis.value = dthis.value.substring(0, start) + value + dthis.value.substring(end, dthis.value.length);
                dthis.selectionEnd = start + value.length;
            }else{  //在输入元素textara没有定位光标的情况
                this.value += value;
                this.focus();
            };
            return $(this);
        }
    });

    function iframe_div() {
        layui.use(['form'], function () {
            handle();
        });
    }

    if(parent.$(".layui-layer-loading").size() > 0) {
        var timeout = "";
        function iframe_show() {
            clearTimeout(timeout);
            if (parent.$(".layui-layer-loading").size() <= 0) {
                iframe_div();
            } else {
                timeout = setTimeout(iframe_show, 10);
            }
        }
        iframe_show();
    }else{
        iframe_div();
    }

    /**
     * 处理
     */
    function handle() {
        var editor = ace.edit("sqlcode");
        var themes = get_ace_themes();
        var editor_json;
        var sql_type = $('.js_set_input_value option:selected').attr('data-type');
        var sqlcode_view;
        var is_click_down = false;

        editor.setTheme(themes.sqlserver);
        editor.session.setMode("ace/mode/" + sql_type);
        editor.setShowPrintMargin(false);
        editor.setOption('scrollPastEnd', 0.5);
        editor.setOption('enableLiveAutocompletion', true);
        editor.setFontSize(16);

        parent.$(".layui-layer-btn2").remove();
        function resize(){
            $(".js_run").css("display", "none");
            var lfiw = $(".layui-form-item").width();
            $(".js_input_title").each(function () {
                var jirlleft = $(".js_input_title_label").offset().left;

                if(jirlleft > 20) {
                    $(this).width(lfiw - jirlleft - 105);
                }else{
                    $(this).width("");
                }
            });

            var ww = $(window).width();
            var wh = $(window).height();
            var sqlcode = $("#sqlcode");
            var sqlcodetop = sqlcode.offset().top;
            var wh2 = 0;
            if(control === 'M') {
                wh2 = (wh - sqlcodetop) / 2 - 15;
                wh2 = parseInt(wh2 + "");
                sqlcode.height(wh2);
            }else if(control === 'T'){
                sqlcode.height(50);
            }else{
                sqlcode.height(wh - sqlcodetop - 36);
            }

            var jftop = $(".js_field").offset().top;
            var h = wh - jftop;
            if(h < wh2) h = wh2;
            h = h - 1;
            $(".js_field").height(h).find(">.list").height(h - 33);
            $(".js_run").width(ww - 241).height(h).find(">.list").height(h - 33);
            $('body').height(100);
            $(".js_run").css("display", "");
        }

        resize();
        setTimeout(resize, 50);
        $(window).resize(function () {
            resize();
        });


        function control_click(type){
            control = type;
            resize();
            $(window).trigger('resize');
            editor.resize();
            if(editor_json !== undefined){
                editor_json.resize();
            }
        }

        $(".js_control .fa-circle-o").click(function () {
            control_click('M');
        });

        $(".js_control .fa-chevron-up").click(function () {
            control_click('T');
        });

        $(".js_control .fa-chevron-down").click(function () {
            control_click('D');
        });

        $(document).mousemove(function () {
            if(is_click_down){
                if(sqlcode_view !== undefined){
                    sqlcode_view.resize();
                }
            }
        }).mouseup(function () {
            is_click_down = false;
        });

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

        var field_html =    '<div class="layui-form js_set_field_html">' +
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

        var areawidth = 800;
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
                    , area: [areawidth + 'px', areaheight + 'px']
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
                , area: [areawidth + 'px', areaheight + 'px']
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
                if(event.keyCode == 9) {
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
            if(prev[0] != undefined){
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
            if(next[0] != undefined){
                next.after(parent.prop("outerHTML"));
                parent.remove();
            }
            getFieldset();
        });

        //增加字段配置
        function addfield(fname, func){
            var ret = false;
            if(fname == undefined || fname == ""){
                layer.msg("字段名称不能为空！", {icon:2});
            }else {
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
            if(jfljson !== undefined && jfljson != "") {
                var dj = eval("(" + js_field_list.attr('data-json') + ")");
                for (var i in dj) {
                    addfield(dj[i]['key'], dj[i]['func']);
                }
            }
        }

        set_all_field();

        //增加字段配置
        $(".js_field_title_button").click(function () {
            var layerid = layer.open({
                type: 1
                , title: "字段配置"
                , area: [areawidth + 'px', areaheight + 'px']
                , shade: 0.1
                , offset: 'auto'
                , content: field_html
                , btn: ['增加', '取消']
                , yes: function (index) {
                    var jsfh = $(".js_set_field_html");
                    var fname = jsfh.find(".js_set_field_name").val().trim();
                    var func = jsfh.find(".js_set_field_func").val();
                    if(addfield(fname, func)){
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
                if(event.keyCode == 9) {
                    $(this).insert("\t");
                    return false;
                }
            });
            help(layerid);
        });

        //清空字段配置
        $(".js_field_title_clear_button").click(function () {
            var fields = getFieldset();
            if(fields.length > 0) {
                dbclick_close(layer.confirm("确定删除所有字段配置？", {
                    shade: 0.1
                }, function (index) {
                    $(".js_field_list>div").remove();
                    layer.close(index);
                    $("#fieldset").val('[]');
                }));
            }else{
                layer.msg("字段未设置！", {icon: 2, time: 1500});
            }
        });

        function getFieldset() {
            var fields = [];
            $(".js_field_list>div").each(function () {
                var key = $(this).attr("key").trim();
                var func = $(this).attr("func").trim();
                if(key == undefined || key == "" || func == undefined || func == "") return;
                fields.push({key: key, func: func});
            });
            $("#fieldset").val(JSON.stringify(fields));
            return fields;
        }

        function run_data_ok(msg) {
            $(".run_data").html('<div style="color:#080; margin: 20px;">' + msg + '</div>');
        }

        function run_data_error(msg) {
            $(".run_data").html('<div style="color:#F00; margin: 20px;">' + msg + '</div>');
        }

        //获取设置参数
        function getArgs(is_select){
            var result = {};
            var data = {};
            result.code = false;
            var db = $("select[input='database_id']").val();
            if(db == undefined || db == ""){
                run_data_error("未选择数据源！");
                return result;
            }
            data.db = db;

            var sql = "";
            if(is_select){
                sql = editor.session.getTextRange(editor.getSelectionRange());
            }else{
                sql = $.trim(editor.getValue());
            }
            if(sql == undefined || sql == ""){
                run_data_error("SQL语句不能为空！");
                return result;
            }
            data.sql = sql;
            data.type = $("#type").val();
            data.fields = JSON.stringify(getFieldset());
            data.args = get_args_str();
            result.code = true;
            result.data = data;
            return result;
        }

        var js_run_sql_msg = '正在执行SQL语句...';
        var js_run_sql_timeout = "";
        var js_run_sql_is_run = false;
        var js_run_sql_time = 0;
        var js_run_sql_step = 1000;
        function js_run_sql_func(){
            clearTimeout(js_run_sql_timeout);
            if(js_run_sql_is_run){
                js_run_sql_timeout = setTimeout(js_run_sql_func, js_run_sql_step);
                js_run_sql_time ++;
                run_data_ok(js_run_sql_msg + " " + js_run_sql_time + " 秒");
            }
        }

        function __run_sql(is_select){
            if(js_run_sql_is_run){
                layer.msg(js_run_sql_msg, {icon:2});
                return
            }
            $("#run_data_msg").hide();
            var args = getArgs(is_select);
            if(!args.code) return;
            js_run_sql_time = 0;
            clearTimeout(js_run_sql_timeout);
            run_data_ok(js_run_sql_msg);
            js_run_sql_timeout = setTimeout(js_run_sql_func, js_run_sql_step);
            js_run_sql_is_run = true;
            var data = args.data;
            $.ajax({
                type: "post",
                url: js_run_sql_url,
                data: data,
                error: function (XMLHttpRequest, textStatus){
                    js_run_sql_is_run = false;
                    run_data_error(textStatus + ":" + "页面无法访问或超时");
                },
                success: function (result) {
                    js_run_sql_is_run = false;
                    if(result.code === 1){
                        if(result.data === undefined){
                            run_data_ok(result.msg);
                        }else{
                            $("#run_data_msg").html(result.data.msg).show();
                            var rdata = result.data.list;

                            var fields = [];
                            for(var i in rdata){
                                for(var j in rdata[i]){
                                    fields.push(j);
                                }
                                break;
                            }
                            if(fields.length > 0){
                                $("#fieldrun").val(JSON.stringify(fields));
                            }
                            var json_str = JSON.stringify(rdata, null, '\t');
                            $("#RawJson").val(json_str);
                            $(".run_data").html('<div id="run_data_json">' + json_str + '</div>');
                            editor_json = ace.edit("run_data_json");
                            editor_json.setTheme(themes.xcode);
                            editor_json.session.setMode("ace/mode/hjson");
                            editor_json.setShowPrintMargin(false);
                            editor_json.setReadOnly(true);
                        }
                    }else if(result.msg === undefined) {
                        run_data_error(result);
                    }else{
                        run_data_error(result.msg);
                    }
                }
            });
        }

        //运行SQL代码并展示
        $(".js_run_sql").click(function () {
            __run_sql();
        });

        //选择运行SQL代码并展示
        $(".js_run_sql_select").click(function () {
            __run_sql(true);
        });

        //查看生成SQL
        $(".js_run_sql_view").click(function () {
            var _this = $(this);
            var args = getArgs();
            if(!args.code) return;
            var data = args.data;
            data['__is_view__'] = 'yes';
            $.ajax({
                type: "post",
                url: js_run_sql_url,
                data: data,
                error: function (XMLHttpRequest, textStatus){
                    dbclick_close(layer.alert("页面无法访问或超时", {icon: 2, title: textStatus}));
                },
                success: function (result) {
                    var html = result.msg;
                    if(result.code === 0){
                        html = '';
                    }
                    var layeropen = layer.open({
                        type: 1
                        , title: "查看生成SQL"
                        , area: ['800px', '500px']
                        , shade: 0.1
                        , offset: 'auto'
                        , content: '<pre id="sqlcode_view"></pre>'
                        , btn: ['复制', '关闭']
                        , yes: function () {
                            $('#RawView').copy_text("SQL语句复制成功", sqlcode_view.getValue());
                        }
                    });
                    dbclick_close(layeropen);

                    $("#sqlcode_view").html(html);
                    sqlcode_view = ace.edit("sqlcode_view");
                    sqlcode_view.setTheme(themes.sqlserver);
                    sqlcode_view.session.setMode("ace/mode/" + sql_type);
                    sqlcode_view.setOption('enableLiveAutocompletion', true);
                    sqlcode_view.setFontSize(16);
                    $("#layui-layer" + layeropen + " .layui-layer-resize").mousedown(function () {
                        is_click_down = true;
                    }).mouseup(function () {
                        is_click_down = false;
                    });
                }
            });
        });

        //获取sql语句中的参数
        function getSqlArgs(sql){
            sql += "\n";
            sql = sql.replace(/--#:\s*{.*}/g, function (sql_in) {
                sql_in = sql_in.replace(/--#:\s*{(.*)}/g, "$1").trim();
                if(sql_in.indexOf(':') >= 0 || sql_in.indexOf(' ') >= 0){
                    return sql_in;
                }
                return ":" + sql_in;
            });
            sql = sql.replace(/\'(.|\s)*?\'/g, "");
            sql = sql.replace(/\/\*(.|\s)*?\*\//g, "");
            sql = sql.replace(/\-\-(.|\s)*?\n/g, "");
            sql = sql.replace(/\n|\r|\t|\'|\)|\(|\.|\{|\}|\[|\]|\=|\>|\<|\,|\!|\%/g, " ");
            sql = sql.replace(/:/g, " :");
            sql = sql.replace(/;/g, " ;");

            var bool = false;
            var len = sql.length;
            var args = [];
            var __args = [];
            var tmpstr = "";
            for(var i = 0; i < len; i++){
                if(sql[i] === ":"){
                    bool = true;
                }else if(bool){
                    if(sql[i] === ' '){
                        if(tmpstr !== undefined){
                            tmpstr = tmpstr.trim().toLowerCase();
                            if(tmpstr !== '') {
                                tmpstr = tmpstr.replace(/#_#_#/g, " ");
                                if(tmpstr.length >= 2 && tmpstr[0] === '_' && tmpstr[1] === '_'){
                                    args.push("__");
                                    __args.push(tmpstr);
                                }else if(tmpstr[0] !== '?'){
                                    if(tmpstr === '*' || (tmpstr[0] === '*' && tmpstr[1] === '|')){
                                        args.push('p');
                                        args.push('psize');
                                        args.push('_fd_');
                                        args.push('_od_');
                                    }else{
                                        args.push(tmpstr);
                                    }
                                }
                            }
                        }
                        tmpstr = "";
                        bool = false;
                    }else{
                        tmpstr += sql[i];
                    }
                }
            }
            tmpstr = tmpstr.trim().toLowerCase();
            if(tmpstr !== ''){
                tmpstr = tmpstr.replace(/#_#_#/g, " ");
                if(tmpstr.length >= 2 && tmpstr[0] == '_' && tmpstr[1] == '_'){
                    args.push("__");
                    __args.push(tmpstr);
                }else{
                    args.push(tmpstr);
                }
            }

            return [args, __args];
        }

        //数组去重
        function distinct (arr){
            var res = [];
            for(var i=0; i<arr.length; i++){
                if(res.indexOf(arr[i]) == -1){
                    res.push(arr[i]);
                }
            }
            return res;
        }

        //获取字段配置
        function get_args(){
            var sql = $.trim(editor.getValue());
            if(sql == undefined || sql == ""){
                return [0, "SQL语句不能为空！"];
            };
            var argsall = getSqlArgs(sql);
            var args = argsall[0];
            var __args = distinct(argsall[1]);
            var sqlarr = distinct(args);
            if(sqlarr.length <= 0){
                return [0, "没有参数可以设置！"];
            }

            var dj = eval("(" + $("#args").val() + ")");

            var retarr = {};
            for(var i in sqlarr){
                var key = sqlarr[i];
                var value = dj[key];
                if(value === undefined){
                    value = "";
                }
                retarr[key] = value;
            }
            return [1, retarr, __args];
        }

        //获取字段JSON数据
        function get_args_str(){
            var data = get_args();
            if(data[0] === 0){
                return '{}';
            }
            var d1 = data[1];
            var d2 = data[2];
            if(d2 !== undefined && d2.length > 0) {
                var __ = d1['__'];
                delete(d1['__']);
                var __arr = {};
                if (__ !== undefined) {
                    var __g = __['get'];
                    var __p = __['post'];
                    var __real = "";
                    if(__g !== undefined){
                        __g = __g.trim();
                        if(__g !== ''){
                            __real = __g;
                        }
                    }
                    __arr['get'] = __real.split("|")

                    if(__p !== undefined){
                        __p = __p.trim();
                        if(__p !== ''){
                            __real = __p;
                        }
                    }
                    __arr['post'] = __real.split("|")
                }
                var arr_get = {};
                var arr_post = {};
                for (var a in __arr['get']) {
                    arr_get["__" + __arr['get'][a].trim().toLowerCase()] = true;
                }
                for (var a in __arr['post']) {
                    arr_post["__" + __arr['post'][a].trim().toLowerCase()] = true;
                }

                for (var k in d2) {
                    var v = d2[k];
                    d1[v] = {};
                    if(arr_get[v]){
                        d1[v]['get'] = 'Y';
                    }else{
                        d1[v]['get'] = '';
                    }
                    if(arr_post[v]){
                        d1[v]['post'] = 'Y';
                    }else{
                        d1[v]['post'] = '';
                    }
                }
            }else{
                delete(d1['__']);
            }
            return JSON.stringify(d1);
        }

        //字段配置
        $(".js_field_args_button").click(function () {
            var data = get_args();
            if(data[0] == 0){
                dbclick_close(layer.alert(data[1], {icon: 2, title: '错误'}));
                return;
            }

            var args = data[1];

            var args_html = '<div class="layui-form js_set_field_html">';
            var argslen = 0;
            for(var key in args){
                var value = args[key];
                if(value === undefined || typeof value === 'string'){
                    value = {};
                }
                var _get = value['get'];
                if(_get === undefined){
                    _get = '';
                }else{
                    _get = _get.replace(/"/g, "&quot;");
                }
                var _post = value['post'];
                if(_post === undefined){
                    _post = '';
                }else{
                    _post = _post.replace(/"/g, "&quot;");
                }
                args_html += '<div class="layui-form-item">' +
                    '   <label class="layui-form-label" title="' + key + '">' + key + '</label>' +
                    '   <div class="layui-input-block">' +
                    '       <input type="text" class="layui-input js_set_args_name js_set_args_name_get" data-type="get" data-name="' + key + '" value="' + _get + '">' +
                    '       <input type="text" class="layui-input js_set_args_name js_set_args_name_post" data-type="post" data-name="' + key + '" value="' + _post + '">' +
                    '   </div>' +
                    '</div>';
                argslen ++;
            }
            args_html += "</div>";
            var ah = argslen * 53 + 120;
            if(ah > 480) ah = 480;

            dbclick_close(layer.open({
                type: 1
                , title: "参数传递 （ get | post ）"
                , area: [(areawidth - 200) + 'px', ah + 'px']
                , shade: 0.1
                , offset: 'auto'
                , content: args_html
                , btn: ['确定', '取消']
                , yes: function (index) {
                    var sjs = {};
                    $(".js_set_args_name").each(function () {
                        var _t = $(this);
                        var _t_val = _t.val();
                        var _t_type = _t.attr('data-type');
                        var _t_name = _t.attr('data-name');
                        if(sjs[_t_name] == undefined){
                            sjs[_t_name] = {};
                        }
                        sjs[_t_name][_t_type] = _t_val;
                    });
                    $("#args").val(JSON.stringify(sjs));
                    layer.close(index);
                }
            }));
        });

        //初始化设置参数
        args_init = function() {
            var data = get_args();
            if(data[0] == 0){
                $("#args").val('{}');
            }else {
                $("#args").val(JSON.stringify(data[1]));
            }
        }

        args_init();

        $('.js_run_sql_copy').click(function () {
            $('#RawJson').copy_text("JSON数据复制成功");
        });

        $(".js_set_input_value").each(function () {
            $("#" + $(this).attr("input")).val($(this).val());
        });

        $("select.js_set_input_value").each(function () {
            var _this = $(this);
            var input = _this.attr("input");
            _this.parent().find("div.layui-form-select dl.layui-anim-upbit dd").click(function () {
                $("#" + input).val($(this).attr("lay-value"));
                sql_type = $('.js_set_input_value option:selected').attr('data-type');
                editor.session.setMode("ace/mode/" + sql_type);
            });
        });

        $("input.js_set_input_value").on('keyup mouseout', function () {
            $("#" + $(this).attr("input")).val($(this).val());
        });

        $("#code").val(editor.getValue());

        $("#sqlcode").on('keyup mouseout', function () {
            $("#code").val(editor.getValue());
        });
        getFieldset();
    }
});
