var submit;
var reset;
var body = $('body');
var base_url = body.attr("data-base-url"); // 根页面
layui.use(['form', 'layedit', 'laydate'], function(){
    var form = layui.form
        ,layedit = layui.layedit;
    var fieldstr = $('body').attr('data-field');
    var field = {};
    if(fieldstr === undefined || fieldstr === ''){
        field = {};
    }else{
        field = eval('(' + fieldstr + ')');
    }

    //创建一个编辑器
    //var editIndex = layedit.build('LAY_demo_editor');

    //系统验证规则
    var default_verify = {
        title: function(value){
            if(value.length < 5){
                return '标题至少得5个字符啊';
            }
        }
        ,pass: [/(.+){6,12}$/, '密码必须6到12位']
        ,content: function(value){
            layedit.sync(editIndex);
        }
        ,md5: function (value, obj) {
            var name = $(obj).attr("name");
            var nobj = $("input[data-name='" + name + "']");
            var nval = nobj.val();
            if(nval !== '' || value !== '') {
                if (nval !== value) {
                    return "密码输入不一致";
                }
            }
        }
        ,'@number': function(value){
            if(value === undefined || value === ''){
                return false;
            }
            if(!value || isNaN(value)) return '只能填写数字'
        }
    };

    //自定义验证规则
    if(typeof layui_form_verify === 'function'){
        var verify = layui_form_verify();
        if(verify !== undefined){
            for (var i in verify){
                if(default_verify[i] === undefined){
                    default_verify[i] = verify[i];
                }
            }
        }
    }

    form.verify(default_verify);

    //status控件数值转换
    $(".js_status").each(function () {
        var name = $(this).attr("name");
        if(field[name] === undefined || field[name] === '' || field[name] === '0' || field[name] === 0){
            field[name] = '';
        }else{
            field[name] = 'on';
        }
    });

    //表单初始赋值
    form.val('main', field);

    //树状结构加入下一个节点
    function tree_insert_html(obj, key, value, inputkey, notvalues, disabled){
        var keyflag = inputkey + "_" + key;
        var html = '<div class="layui-input-inline layui-form" lay-filter="' + keyflag + '" data-key="' + key + '"><select ' + disabled + '>';
        html += '<option value="' + key + '">-- ' + value['name'] + ' --</option>';
        var list = value['list'];
        var listmore = value['listmore'];
        var next = value['next'] + '';
        if(next === undefined) next = "";
        for(var j in list){
            var k = list[j]['key'];
            var v = list[j]['value'];
            if(listmore !== undefined && listmore.hasOwnProperty(k) && listmore[k] > 0) v = "+ " + v;
            if(k + '' === next){
                html += '<option value="' + k + '" selected="">' + v + '</option>';
            }else{
                html += '<option value="' + k + '">' + v + '</option>';
            }
        }
        html += '</select></div>';
        obj.append(html);
        form.render("select", keyflag);
        obj.find('.layui-input-inline[lay-filter="' + keyflag + '"]').each(function () {
            var _t = $(this);
            var listmore = value['listmore'];
            _t.find("dl.layui-anim dd").click(function () {
                var _tt = $(this);
                var _ttval = _tt.attr("lay-value");
                _t.nextAll(".layui-input-inline").remove();
                $("input[name='" + inputkey + "']").val(_ttval);
                if(listmore !== undefined && listmore.hasOwnProperty(_ttval)) {
                    var url = base_url + ".selectTree";
                    $.ajax({
                        type: "post",
                        url: url,
                        data: {
                            key: inputkey,
                            value: _ttval,
                            notvalues: notvalues
                        },
                        success: function (result) {
                            if(result.code === 1){
                                for(var i in result.data){
                                    tree_insert_html(obj, i, result.data[i], inputkey, notvalues, disabled);
                                }
                            }else{
                                layer.alert(result.msg, {icon: 2, title: '错误'});
                            }
                        }
                    });
                }
            });
        });
    }

    //树状结构
    $(".js_tree").each(function () {
        var _this = $(this);
        var djson = _this.attr("data-json");
        var dnotvalues = _this.attr("data-notvalues");
        if(djson === undefined || djson === 'null' || djson === ''){
            djson = '{}';
        }
        if(dnotvalues === undefined || dnotvalues === 'null' || dnotvalues === ''){
            dnotvalues = '{}';
        }
        var json = $.parseJSON(djson);
        var notvalues = $.parseJSON(dnotvalues);
        var isview = _this.attr("data-isview");
        var disabled = '';
        if(isview === 'true') disabled = 'disabled=""';
        var key = _this.attr("data-key");
        var ii = 0;
        for(var i in json){
            tree_insert_html(_this, json[i]['key'], json[i]['list'], key, notvalues, disabled);
            ii ++;
        }
        if(ii <= 0){
            tree_insert_html(_this, "", {"name":"顶级"}, key, notvalues, disabled);
        }
    });

    var dfield = [];
    var issubmit = false;

    //监听提交
    form.on('submit(submit)', function(data){
        dfield = data.field;
        issubmit = true;
        return false;
    });

    function setData(){
        $(".js_status").each(function () {
            var name = $(this).attr("name");
            if(dfield[name] === undefined || dfield[name] === ''){
                dfield[name] = '0';
            }else{
                dfield[name] = '1';
            }
        });
        $(".js_checkbox").each(function () {
            var size = $(this).find("input[type='checkbox']:checked").size();
            if(size <= 0){
                dfield[$(this).attr("data-key")] = '';
            }
        });
    }


    //提交
    submit = function() {
        issubmit = false;
        $(".layui-btn-submit").click();
        if(issubmit) {
            var retdata;
            setData();
            $.ajax({
                type: "post",
                url: window.location.href,
                data: dfield,
                async: false,
                error: function (XMLHttpRequest, textStatus){
                    xml_http_request_err(XMLHttpRequest, textStatus);
                },
                success: function (result) {
                    retdata = result;
                }
            });
            return retdata;
        }else{
            // setTimeout(function () {
            //     console.log($('.layui-form-danger').parent().html());
            // }, 10);
            // console.log($('.layui-form-danger').parent().html());
            var lfd_index = 0;
            $(".layui-form-main>.layui-tab-item").each(function () {
                lfd_index ++;
                if($(this).find('.layui-form-danger').size() > 0){
                    return false;
                }
            });
            if(lfd_index > 0) {
                $("ul.layui-tab-title>li:nth-child(" + lfd_index + ")").trigger('click');
            }
            return false;
        }
    };

    //重置
    reset = function() {
        $(".layui-btn-reset").click();
        form.val('main', field);
    };

    //保存数据
    $(".js_btn_save").click(function () {
        var result = submit();
        if(result !== false){
            if(result.code === 1){
                layer.msg(result.msg, {icon: 1, time: 1000});
            }else{
                layer.alert(result.msg, {icon: 2, title: '错误'});
            }
        }
    });

    //还原数据
    $(".js_btn_reset").click(function () {
        reset();
    });

    //刷新当前页面
    $(".js_btn_flush").click(function () {
        $().urlparam().run();
    });

    $(".js_name_remark").mouseover(function () {
        var tips = $(this).parent().find(".layui-layer-tips");
        if(tips.hasClass('layui-layer-tips-first')){
            tips.css("top",  '43px');
        }else{
            var height = tips.height() + 5;
            tips.css("top", -height + 'px');

        }
        tips.css("display", "block");
    }).mouseleave(function () {
        $(this).parent().find(".layui-layer-tips").css("display", "none");
    });
});
