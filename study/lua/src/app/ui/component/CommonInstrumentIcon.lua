--
-- Author: Liangxu
-- Date: 2017-02-20 17:51:01
-- 神兵Icon
local CommonIconBase = import(".CommonIconBase")

local CommonInstrumentIcon = class("CommonInstrumentIcon", CommonIconBase)

local UIHelper = require("yoka.utils.UIHelper")

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"setTopNum",
	"setLevel",
	"setRlevel",
	"setId",
}

function CommonInstrumentIcon:ctor()
	CommonInstrumentIcon.super.ctor(self)
	self._textItemTopNum = nil -- 顶部数字按钮
	self._type = TypeConvertHelper.TYPE_INSTRUMENT
	self._id = nil
end

function CommonInstrumentIcon:_init()
	CommonInstrumentIcon.super._init(self)
	self:setTouchEnabled(false)
end

function CommonInstrumentIcon:bind(target)
	CommonInstrumentIcon.super.bind(self, target)

	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonInstrumentIcon:unbind(target)
	CommonInstrumentIcon.super.unbind(self, target)

	cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonInstrumentIcon:setId(id)
	self._id = id
end


--根据传入参数，创建并，更新UI
function CommonInstrumentIcon:updateUI(value, size, limitLevel)
	self._limitLevel = limitLevel
	local itemParams = TypeConvertHelper.convert(self._type, value, nil, nil, limitLevel)
	itemParams.size = size
	--加载背景框
	if itemParams.icon_bg ~= nil then
		self:loadColorBg(itemParams.icon_bg)
	end
	--加载icon
	if itemParams.icon ~= nil then
		self:loadIcon(itemParams.icon)
	end
	
	if itemParams.size then
		self:setCount(itemParams.size)
	end
	self._itemParams = itemParams
end

function CommonInstrumentIcon:setTopNum(size)
	if self._textItemTopNum == nil then
		local params = {
			name = "_textItemTopNum",
			text = "x".."0",
			fontSize = 16,
			color = Colors.WHITE_DEFAULT,
			outlineColor = Colors.DEFAULT_OUTLINE_COLOR,
		}
		ComponentIconHelper._setPostion(params,"leftTop")

		local uiWidget = UIHelper.createLabel(params)

		self:appendUI(uiWidget)
		self._textItemTopNum = uiWidget
	end
	self._textItemTopNum:setString(""..size)
	self._textItemTopNum:setVisible( size > 0 ) 
end

--设置强化等级
function CommonInstrumentIcon:setLevel(level)
	if self._textLevel == nil then
		local params = {
			name = "_textLevel",
			text = "0",
			fontSize = 16,
			color = Colors.COLOR_QUALITY[1],
			outlineColor = Colors.COLOR_QUALITY_OUTLINE[1],
		}

		local label = UIHelper.createLabel(params)
		label:setAnchorPoint(cc.p(0.5, 0.5))
		label:setPosition(cc.p(21, 10))
		
		self._textLevel = label
	end

	local itemParam = self:getItemParams()
	if self._imageLevel == nil then
		local params = {
			name = "_imageLevel",
			texture = Path.getUICommonFrame("img_iconsmithingbg_0"..itemParam.color),
		}
		local imageBg = UIHelper.createImage(params)
		imageBg:addChild(self._textLevel)
		imageBg:setAnchorPoint(cc.p(0, 1))
		imageBg:setPosition(cc.p(3, 95))

		self._imageLevel = imageBg
		self:appendUI(imageBg)
	end
	self._textLevel:setString(level)
	self._imageLevel:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0"..itemParam.color))
	self._imageLevel:setVisible(level > 0)
end

--设置精炼等级
function CommonInstrumentIcon:setRlevel(rLevel)
	if self._textRlevel == nil then
		local params = {
			name = "_textRlevel",
			text = "+".."0",
			fontSize = 16,
			color = Colors.COLOR_QUALITY[2],
			outlineColor = Colors.COLOR_QUALITY_OUTLINE[2],
		}

		local label = UIHelper.createLabel(params)
		label:setAnchorPoint(cc.p(0.5, 0.5))
		label:setPosition(cc.p(46, 20))

		self:appendUI(label)
		self._textRlevel = label
	end
	self._textRlevel:setString("+"..rLevel)
	self._textRlevel:setVisible(rLevel > 0)
end

function CommonInstrumentIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then

			if self._callback then
				self._callback(sender, self._itemParams, self._limitLevel)
			else
				local PopupInstrumentDetail = require("app.scene.view.instrumentDetail.PopupInstrumentDetail").new(
					TypeConvertHelper.TYPE_INSTRUMENT,self._itemParams.cfg.id, nil, self._limitLevel)
				PopupInstrumentDetail:openWithAction()
			end

		end
	end
end

return CommonInstrumentIcon