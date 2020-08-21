var args_init;
$(function () {
    var db_url = $('body').attr('data-base-url');
    var control = 'M';
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
            var tpl_type = $("body").attr("data-tpl-type");
            if (tpl_type == undefined) tpl_type = "";
            if (tpl_type == 'add' || tpl_type == 'edit') {
                handle();
            }
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

        editor.setTheme(themes.sqlserver);
        editor.session.setMode("ace/mode/sqlserver");
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
                    $(this).width(lfiw - jirlleft - 40);
                }else{
                    $(this).width("");
                }
            });

            var ww = $(window).width();
            var wh = $(window).height();
            var sqlcode = $("#sqlcode");
            var sqlcodetop = sqlcode.offset().top;
            var wh2 = 0;
            if(control == 'M') {
                wh2 = (wh - sqlcodetop) / 2 - 15;
                sqlcode.height(wh2);
            }else if(control == 'T'){
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


        $('.js_field_list').on('click', '.del', function () {
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
        var areawidth = 600;
        var areaheight = 400;

        //编辑字段配置
        $('.js_field_list').on('click', '.edit', function () {
            var pt = $(this).parent();
            var jsfn = ".js_set_field_html .js_set_field_name";
            var jsff = ".js_set_field_html .js_set_field_func";

            var fname = pt.attr("key");
            if (fname == undefined) fname = "";
            var func = pt.attr("func");
            if (func == undefined) func = "";

            dbclick_close(layer.open({
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
            }));

            $(jsfn).val(fname).attr("disabled", "");
            $(jsff).val(func).keydown(function (event) {
                if(event.keyCode == 9) {
                    $(this).insert("\t");
                    return false;
                }
            });
        });

        //字段上移
        $('.js_field_list').on('click', '.up', function () {
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
        $('.js_field_list').on('click', '.down', function () {
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
            var kname = fname.replace(/"/g, "&quot;");
            var keyobjstr = '.js_field_list>div[key="' + kname + '"]';
            var ret = false;
            if($(keyobjstr).size() > 0){
                layer.msg("字段名称 " + fname + " 已存在，请重新填写！", {icon:2});
            }else if(fname == undefined || fname == ""){
                layer.msg("字段名称不能为空！", {icon:2});
            }else {
                $(".js_field_list").append(
                    $('<div></div>').attr("key", fname).attr("func", func).append(
                        $('<span class="fname"></span>').html(fname)
                    ).append('<span class="edit">编辑</span><span class="del">删除</span><span class="up fa fa-long-arrow-up"></span><span class="down fa fa-long-arrow-down"></span>')
                );
                ret = true;
            }
            return ret;
        }

        //设置字段
        var jfljson = $(".js_field_list").attr('data-json');
        if(jfljson != undefined && jfljson != "") {
            var dj = eval("(" + $(".js_field_list").attr('data-json') + ")");
            for (var i in dj) {
                addfield(dj[i]['key'], dj[i]['func']);
            }
        }

        //增加字段配置
        $(".js_field_title_button").click(function () {
            dbclick_close(layer.open({
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
                    if(addfield(fname, func)){
                        layer.close(index);
                    }
                    getFieldset();
                }
                , btn2: function () {
                    layer.closeAll();
                }
            }));
            $(".js_set_field_html .js_set_field_func").keydown(function (event) {
                if(event.keyCode == 9) {
                    $(this).insert("\t");
                    return false;
                }
            });
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

        function canvas_ok(msg) {
            $(".Canvas").html('<div style="margin: 20px;">' + msg + '</div>');
        }

        function canvas_error(msg) {
            $(".Canvas").html('<div style="color:#F00; margin: 20px;">' + msg + '</div>');
        }

        //获取设置参数
        function getArgs(){
            var result = {};
            var data = {};
            result.code = false;
            var db = $("select[input='database_id']").val();
            if(db == undefined || db == ""){
                canvas_error("未选择数据源！");
                return result;
            }
            data.db = db;

            var sql = $.trim(editor.getValue());
            if(sql == undefined || sql == ""){
                canvas_error("SQL语句不能为空！");
                return result;
            }
            data.sql = sql;
            data.type = $("#type").val();
            data.fields = getFieldset();
            data.args = get_args_str();
            result.code = true;
            result.data = data;
            return result;
        }

        //运行SQL代码并展示
        $(".js_run_sql").click(function () {
            $("#Canvas_msg").html("");
            canvas_ok('正在执行SQL语句...');
            var args = getArgs();
            if(!args.code) return;
            var data = args.data;
            $.ajax({
                type: "post",
                url: db_url + "/run",
                data: data,
                success: function (result) {
                    if(result.code == 1){
                        $("#Canvas_msg").html(result.data.msg);
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
                        $("#RawJson").val(JSON.stringify(rdata));
                        Process();
                    }else{
                        canvas_error(result.msg);
                    }
                }
            });
        });

        //查看生成SQL
        $(".js_run_sql_view").click(function () {
            var _this = $(this);
            var args = getArgs();
            if(!args.code) return;
            var data = args.data;
            data['is_sql_code'] = 'true';
            $.ajax({
                type: "post",
                url: db_url + "/run",
                data: data,
                success: function (result) {
                    var html = result.msg;
                    var sqlcode_view;
                    dbclick_close(layer.open({
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
                    }));

                    $("#sqlcode_view").html(html);
                    sqlcode_view = ace.edit("sqlcode_view");
                    sqlcode_view.setTheme(themes.sqlserver);
                    sqlcode_view.session.setMode("ace/mode/sqlserver");
                }
            });
        });

        //获取sql语句中的参数
        function getSqlArgs(sql){
            sql += "\n";
            sql = sql.replace(/--#:(\s*){/g, ":");
            sql = sql.replace(/\'(.|\s)*?\'/g, "");
            sql = sql.replace(/\/\*(.|\s)*?\*\//g, "");
            sql = sql.replace(/\-\-(.|\s)*?\n/g, "");
            sql = sql.replace(/\n|\r|\t|\)|\(|\.|\{|\}|\[|\]|\=|\>|\<|\,/g, " ");
            sql = sql.replace(/:/g, " :");

            var bool = false;
            var len = sql.length;
            var args = [];
            var __args = [];
            var tmpstr = "";
            for(var i = 0; i < len; i++){
                if(sql[i] == ":"){
                    bool = true;
                }else if(bool){
                    if(sql[i] == ' '){
                        if(tmpstr != undefined){
                            tmpstr = tmpstr.trim().toLowerCase();
                            if(tmpstr != '') {
                                if(tmpstr.length >= 2 && tmpstr[0] == '_' && tmpstr[1] == '_'){
                                    args.push("__");
                                    __args.push(tmpstr);
                                }else{
                                    args.push(tmpstr);
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
            if(tmpstr != ''){
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
                if(value == undefined){
                    value = "";
                }
                retarr[key] = value;
            }
            return [1, retarr, __args];
        }

        //获取字段JSON数据
        function get_args_str(){
            var data = get_args();
            if(data[0] == 0){
                return '{}';
            }
            var d1 = data[1];
            var d2 = data[2];
            if(d2 != undefined && d2.length > 0) {
                var __ = d1['__'];
                delete(d1['__']);
                var __arr = [];
                if (__ != undefined && __ != '') {
                    __arr = __.split("|")
                }
                var arr = {};
                for (var a in __arr) {
                    arr["__" + __arr[a].trim().toLowerCase()] = true;
                }

                for (var k in d2) {
                    var v = d2[k];
                    if(arr[v]){
                        d1[v] = 'Y';
                    }else{
                        d1[v] = '';
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
                var value = args[key].replace(/"/g, "&quot;");
                args_html += '<div class="layui-form-item">' +
                    '   <label class="layui-form-label">' + key + '</label>' +
                    '   <div class="layui-input-block"><input type="text" class="layui-input js_set_args_name" data-name="' + key + '" value="' + value + '"></div>' +
                    '</div>';
                argslen ++;
            }
            args_html += "</div>";
            var ah = argslen * 53 + 120;
            if(ah > 480) ah = 480;

            dbclick_close(layer.open({
                type: 1
                , title: "参数传递"
                , area: [areawidth + 'px', ah + 'px']
                , shade: 0.1
                , offset: 'auto'
                , content: args_html
                , btn: ['确定', '取消']
                , yes: function (index) {
                    var sjs = {};
                    $(".js_set_args_name").each(function () {
                        var _t = $(this);
                        sjs[_t.attr('data-name')] = _t.val();
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

        $(".js_run_list").scroll(function () {
            var scrollt = $(this).scrollTop();
            if (scrollt > 200) {
                $("#gotop").fadeIn(400); //淡出
            } else {
                $("#gotop").stop().fadeOut(400); //如果返回或者没有超过,就淡入.必须加上stop()停止之前动画,否则会出现闪动
            }
        });

        $("#gotop").click(function () { //当点击标签的时候,使用animate在200毫秒的时间内,滚到顶部
            $(".js_run_list").animate({scrollTop: "0px"}, 200);
        });

        $(".js_set_input_value").each(function () {
            $("#" + $(this).attr("input")).val($(this).val());
        });

        $("select.js_set_input_value").each(function () {
            var _this = $(this);
            var input = _this.attr("input");
            _this.parent().find("div.layui-form-select dl.layui-anim-upbit dd").click(function () {
                $("#" + input).val($(this).attr("lay-value"));
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
