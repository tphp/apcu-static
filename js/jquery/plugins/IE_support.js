;(function($) {
	var JPlaceHolder = {
		//检测浏览器是否支持 placeholder
		_check: function () {
			return 'placeholder' in document.createElement('input');
		},
		//初始化
		init: function () {
			if (!this._check()) {
				this.fix();
			}
		},
		//修复
		fix: function () {
			jQuery(':input[placeholder]').each(function (index, element) {
				var self = $(this), txt = self.attr('placeholder');
				self.wrap($('<div style="display:inline;"></div>').css({
					position: 'relative',
					zoom: '1',
					border: 'none',
					background: 'none',
					padding: 'none',
					margin: 'none'
				}));
				var pos = self.position(), h = self.outerHeight(true), paddingleft = self.css('padding-left');
				var holder = $('<span></span>').text(txt).css({
					position: 'absolute',
					left: pos.left,
					top: '2px',
					height: h,
					lienHeight: h,
					paddingLeft: paddingleft,
					color: '#aaa'
				}).appendTo(self.parent());
				self.focusin(function (e) {
					holder.hide();
				}).focusout(function (e) {
					if (!self.val()) {
						holder.show();
					}
				});
				holder.click(function (e) {
					holder.hide();
					self.focus();
				});
			});
		}
	};

	JPlaceHolder.init();
}(jQuery));;