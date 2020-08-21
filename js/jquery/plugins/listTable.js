/**
 * @name 列表操作(排序，修改值，状态切换，批量操作)
 * @description Based on jQuery 1.4+
 * @author andery@foxmail.com
 * @url http://www.pinphp.com
 */
;(function($) {
	$.fn.listTable = function(options) {
		var binddiv, bindselect, baseuri;
		var self = this,
			local_url = window.location.search,
			settings = {
				url: $(self).attr('data-acturi')
			}
		if(options) {
			$.extend(settings, options);
		}
		binddiv = settings.binddiv;
		bindselect = settings.bindselect;
		baseuri = settings.baseuri;

		//整理排序
		var params  = local_url.substr(1).split('&');
		var sort,order;
		for(var i=0; i < params.length; i++) {
			var param = params[i];
			var arr   = param.split('=');
			if(arr[0] == 'sort') {
				sort = arr[1];
			}
			if(arr[0] == 'order') {
				order = arr[1];
			}
		}
		var showDialog=function(obj,ids){
			var self = $(obj),
				dtitle = self.attr('data-title'),
				did = self.attr('data-id'),
				duri = self.attr('data-uri')+'&id='+ids,
				dwidth = parseInt(self.attr('data-width')),
				dheight = parseInt(self.attr('data-height')),
				dpadding = (self.attr('data-padding') != undefined) ? self.attr('data-padding') : '',
				dcallback = self.attr('data-callback');
			$.dialog({id:did}).close();
			$.dialog({
				id:did,
				title:dtitle,
				width:dwidth ? dwidth : 'auto',
				height:dheight ? dheight : 'auto',
				padding:dpadding,
				lock:true,
				ok:function(){
					var info_form = this.dom.content.find('#info_form');
					if(info_form[0] != undefined){
						baseuri = $(binddiv).find(".JS_baseuri").attr("data-uri");
						if(baseuri == undefined || baseuri == '') {
							info_form.submit();
							if(dcallback != undefined){
								eval(dcallback+'()');
							}
                            $('input[data-tdtype="batch_action"]').prop('disabled',false);
							return false;
						}else {
							info_form.ajaxSubmit({
								dataType:'json',
								type:'post',
								success:function(result) {
									if(result.status) {
										$.get(baseuri, function (html) {
											$(binddiv).html(html);
										});
									}
								}
							});
						}
					}
					if(dcallback != undefined){
						eval(dcallback+'()');
					}
				},
				cancel:function(){}
			});
			$.getJSON(duri, function(result){
				if(result.status == 1){
					$.dialog.get(did).content(result.data);
				}
			});
			return false;
		}

		var _this = $(this);

		if(_this.attr("data-nnnflag") == "yes"){
			return false;
		}else{
			_this.attr("data-nnnflag", "yes");
		}

		//点击行选中本行, 并取消其他行
		$(bindselect).on('click', 'tbody tr', function(){
			$(self).find('tbody tr').each(function(){ $(this).removeClass('on').removeClass('select');});
			$(this).addClass('on');
			$(self).find(".J_checkitem").each(function(){
				var _this = $(this);
				var ischeck = _this.prop("checked");
				if(ischeck){
					_this.parent().parent().addClass('select');
				}
			});
		});

		//全选反选
		$(bindselect).on('click', '.J_checkall', function(){
			$(binddiv + '.J_checkitem').prop('checked', this.checked);
			$(binddiv + '.J_checkall').prop('checked', this.checked);
			$(bindselect).find(".J_checkitem").each(function(){
				var _this = $(this);
				var ischeck = _this.prop("checked");
				if(ischeck){
					_this.parent().parent().addClass('select');
				}else{
					_this.parent().parent().removeClass('select');
				}
			});
		});

		//单选按钮
		$(binddiv + 'input[type="radio"]').each(function() {
			var _this = $(this);
			_this.parent().parent().click(function(){
				_this.prop("checked", true);
			});
		});

		//历史排序
		$(binddiv + 'span[data-tdtype="order_by"]').each(function() {
			if($(this).attr('data-field') == sort) {
				if(order == 'asc') {
					$(this).attr('data-order', 'asc');
					$(this).addClass("sort_asc");
				} else if (order == 'desc') {
					$(this).attr('data-order', 'desc');
					$(this).addClass("sort_desc");
				}
			}
			$(this).click(function() {
				var s_name = $(this).attr('data-field'),
					s_order  = $(this).attr('data-order'),
					sort_url = (local_url.indexOf('?') < 0) ? '?' : '';
				sort_url += '&sort=' + s_name + '&order=' + (s_order =='asc' ? 'desc' : 'asc');
				local_url = local_url.replace(/&sort=(.+?)&order=(.+?)$/, '');
				//alert("xxx");
				var ruri = local_url + sort_url;
				if(binddiv == ''){
					location.href = ruri;
				}else{
					sort_url = (baseuri.indexOf('?') < 0) ? '?' : '';
					sort_url += '&sort=' + s_name + '&order=' + (s_order =='asc' ? 'desc' : 'asc');
					local_url = baseuri.replace(/&sort=(.+?)&order=(.+?)$/, '');
					ruri = local_url + sort_url;
					$.get(ruri, function (html) {
						$(binddiv).html(html);
					});
				}
				return false;
			});
		}).addClass('sort_th');

		//修改
		$(bindselect).on('click', 'span[data-tdtype="edit"]', function() {
			var s_val   = $(this).text().replace("\"", "&quot;"),
				s_name  = $(this).attr('data-field'),
				s_id    = $(this).attr('data-id'),
				width   = $(this).width();
			$('<input type="text" value="'+s_val+'" />').width(width).focusout(function(){
				$(this).prev('span').show().text($(this).val());
				if($(this).val().replace("\"", "&quot;") != s_val) {
					$.getJSON(settings.url, {id:s_id, field:s_name, val:$(this).val()}, function(result){
						if(result.status == 0) {
							$.pinphp.tip({content:result.msg, icon:'error'});
							$(binddiv + 'span[data-field="'+s_name+'"][data-id="'+s_id+'"]').text(s_val);
							return;
						}
					});
				}
				var _this = $(this);
				_this.hide();
				setTimeout(function(){_this.remove()}, 10);
			}).insertAfter($(this)).focus().select();
			$(this).hide();
			return false;
		});
		//切换
		$(bindselect).on('click', 'img[data-tdtype="toggle"]', $(self), function() {

			var img    = this,
				s_val  = ($(img).attr('data-value'))== 0 ? 1 : 0,
				s_name = $(img).attr('data-field'),
				s_id   = $(img).attr('data-id'),
				s_src  = $(img).attr('src');
			$.getJSON(settings.url, {id:s_id, field:s_name, val:s_val}, function(result){
				if(result.status == 1) {
					if(s_src.indexOf('disabled')>-1) {
						$(img).attr({'src':s_src.replace('disabled','enabled'),'data-value':s_val});
					} else {
						$(img).attr({'src':s_src.replace('enabled','disabled'),'data-value':s_val});
					}
				}else if(result.status == 0){
                    $.pinphp.tip({content:result.msg, icon:'error'});
                }
			});
			return false;
		});

		//更改URL参数
		function changeParam(name,value){
			var url = window.location.href ;
			var newUrl="";
			var reg = new RegExp("(^|)"+ name +"=([^&]*)(|$)");
			var tmp = name + "=" + value;
			if(url.match(reg) != null){
				newUrl= url.replace(eval(reg),tmp);
			}else{
				if(url.match("[\?]")){
					newUrl= url + "&" + tmp;
				}else{
					newUrl= url + "?" + tmp;
				}
			}
            window.location.href = newUrl;
		}

        //页数跳转
        $(bindselect).on('change ', 'select[data-tdtype="pagenums"]', $(self), function() {
            //window.location.href = local_url+'&pagenums='+$(this).val();
            changeParam('pagenums', $(this).val());
            return false;
        });

		//切换切换2
		$(bindselect).on('click', 'img[data-tdtype="togglex"]', $(self), function() {
			var img    = this,
				s_val  = $(img).attr('data-value'),
				s_name = $(img).attr('data-field'),
				s_id   = $(img).attr('data-id'),
				s_src  = $(img).attr('src');
			$.getJSON(settings.url, {id:s_id, field:s_name, val:s_val}, function(result){
				if(result.status == 1) {
					if(s_src.indexOf('disabled')>-1) {
						$(img).attr({'src':s_src.replace('disabled','enabled'),'data-value':s_val});
					} else {
						$(img).attr({'src':s_src.replace('enabled','disabled'),'data-value':s_val});
					}
				}
			});
			return false;
		});

		$(bindselect).on('click', ".treeTable .checkbtn", function() {
			var _this = $(this);
			var check = _this.find(".J_checkitem");

			var ischeck = check.prop("checked");
			if(ischeck){
				check.prop("checked", false);
			}else{
				check.prop("checked", true);
			}
		});

		$(bindselect).on('click', ".treeTable .J_checkitem", function() {
			var ischeck = $(this).prop("checked");
			$(this).prop("checked", !ischeck);
		});

		//批量操作
		$(bindselect).on('click', 'input[data-tdtype="batch_action"]', function() {
			var btn = this;
			if($(binddiv + '.J_checkitem:checked').length == 0){
				$.pinphp.tip({content:'请选择要操作的项目！', icon:'alert'});
				return false;
			}

			var ids = '';
			$(binddiv + '.J_checkitem:checked').each(function(){
				ids += $(this).val() + ',';
			});
			ids = ids.substr(0, (ids.length - 1));
			var uri = $(btn).attr('data-uri') + '&' + $(btn).attr('data-name') + '=' + ids,
				msg = $(btn).attr('data-msg'),
				acttype = $(btn).attr('data-acttype'),
				title = ($(btn).attr('data-title') != undefined) ? $(this).attr('data-title') : '提示消息';

			if($(btn).hasClass('J_dialog')){
				showDialog(btn,ids);
				return;
			}

			if(msg != undefined){
				$.dialog({
					id:'confirm',
					title:title,
					width:200,
					padding:'10px 20px',
					lock:true,
					content:msg,
					ok:function(){
						action();
					},
					cancel:function(){}
				});
			}else{
				action();
			}
			function action(){
				baseuri = $(binddiv).find(".JS_baseuri").attr("data-uri");
                if(baseuri == undefined) baseuri = '';
				if(acttype == 'ajax_form'){
					var did = $(btn).attr('data-id'),
						dwidth = parseInt($(btn).attr('data-width')),
						dheight = parseInt($(btn).attr('data-height'));
					$.dialog({
						id:did,
						title:title,
						width:dwidth ? dwidth : 'auto',
						height:dheight ? dheight : 'auto',
						padding:'',
						lock:true,
						ok:function(){
							var info_form = this.dom.content.find('#info_form');
							if(info_form[0] != undefined){
								if(baseuri == '') {
									info_form.submit();
									return false;
								}else {
									info_form.ajaxSubmit({
										dataType:'json',
										type:'post',
										success:function(result) {
											if(result.status) {
												$.get(baseuri, function (html) {
													$(binddiv).html(html);
												});
											}
										}
									});
								}
							}
						},
						cancel:function(){}
					});
					$.getJSON(uri, function(result){
						if(result.status == 1){
							$.dialog.get(did).content(result.data);
						}
					});
				}else if(acttype == 'ajax'){
					$.getJSON(uri, function(result){
						if(result.status == 1){
							if(baseuri == ''){
								$.pinphp.tip({content: result.msg});
								window.location.reload();
							}else{
								$.get(baseuri, function(html){
									$.pinphp.tip({content: result.msg});
									$(binddiv).html(html);
								});
							}
						}else{
							$.pinphp.tip({content:result.msg, icon:'error'});
						}
					});
				}else{
					if(baseuri == ''){
						location.href = uri;
					}else{
						$.get(uri, function(html){
							$(binddiv).html(html);
						});
					}
				}
			}
		});
	};
})(jQuery);
