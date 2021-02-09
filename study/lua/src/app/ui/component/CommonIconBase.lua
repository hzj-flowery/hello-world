--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
--
local CommonIconBase = class("CommonIconBase")

local UIHelper = require("yoka.utils.UIHelper")

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"loadColorBg",
	"loadIcon",
	"appendUI",
	"updateUI",
	"setName",
	"showName",
	"setCount",
	"showCount",
	"setIconMask",
	"setIconDark",
	"isIconDark",
	"setIconSelect",
	"setTouchEnabled",
	"setSwallowTouchesEnabled",
	"setCallBack",
	"getItemParams",
	"getType",
	"getPanelSize",
	"setIconVisible",
	"setNameFontSize",
	"refreshToEmpty",
	"showLightEffect",
	"removeLightEffect",
	"showIconEffect",
	"addBgImageForName",
	"removeBgImageForName",
	"isClickFrame",
	"hideBg",
	"showDoubleTips"
}

function CommonIconBase:ctor()
	self._type = nil
	self._target = nil
	self._itemParams = nil

	self._imageBg = nil --icon 图片背景框
	self._imageIcon = nil -- icon 图标
	self._textItemCount = nil -- icon 右下数字
	self._labelItemName = nil -- 名称
	self._callback = nil  -- 点击回调
	self._iconDark = false
end

function CommonIconBase:_init()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._imageIcon:ignoreContentAdaptWithSize(true)
	self._doubleTips = ccui.Helper:seekNodeByName(self._target, "ImageDoubleTips")
	--创建Panel
	if self._panelItemContent == nil then
		local panelItemContent = ComponentIconHelper.buildItemContentPanel()
		self._target:addChild(panelItemContent)
		self._panelItemContent = panelItemContent

		--触摸回调默认开启
		self._panelItemContent:setTouchEnabled(true)
		--不吞噬点击事件
        self._panelItemContent:setSwallowTouches(false)
        self._panelItemContent:addTouchEventListener(handler(self, self._onTouchCallBack))
	end

end



function CommonIconBase:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonIconBase:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonIconBase:getPanelSize()
	if self._panelItemContent then
		return self._panelItemContent:getContentSize()
	end
	return cc.size(0,0)
end
function CommonIconBase:loadColorBg(res,opacity)
	self._imageBg:setVisible(true)
	self._imageBg:setOpacity(opacity or 255)
	self._imageBg:loadTexture(res)
	self._imageBg:ignoreContentAdaptWithSize(true)
end

function CommonIconBase:loadIcon(res)
	self._imageIcon:setVisible(true)
	self._imageIcon:loadTexture(res)
end

function CommonIconBase:appendUI(node, zOrder)
	assert(self._panelItemContent,node, "Invalid appendUI %s", tostring(self._panelItemContent))
	if zOrder then
		self._panelItemContent:addChild(node, zOrder)
	else
		self._panelItemContent:addChild(node)
	end
end

function CommonIconBase:getType()
	return self._type or 0
end

--根据传入参数，创建并，更新UI
function CommonIconBase:updateUI(value, size, rank, limitLevel, limitRedLevel)
	if self:getType() > 0 then

		local itemParams = TypeConvertHelper.convert(self:getType(), value, nil, nil, limitLevel, limitRedLevel)

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

		--if itemParams.name ~= "" then
			--self:setName(itemParams.name)
		--end

		self._itemParams = itemParams
		return itemParams
	end

	return nil
end

function CommonIconBase:getItemParams()
	return self._itemParams
end

--构建底部数字，右下角
function CommonIconBase:setCount(size)
	if self._textItemCount == nil then

		local params = {
			name = "_textItemCount",
			text = "x".."0",
			fontSize = 18,
			color = Colors.WHITE_DEFAULT,
			outlineColor = Colors.DEFAULT_OUTLINE_COLOR,
		}
		ComponentIconHelper._setPostion(params,"rightBottom")

		local uiWidget = UIHelper.createLabel(params)

		self:appendUI(uiWidget)
		self._textItemCount = uiWidget
	end

	local color = size > 0 and Colors.WHITE_DEFAULT or Colors.uiColors.RED
	self._textItemCount:setString(""..size)
	self._textItemCount:setColor(color)
	self._textItemCount:setVisible( size > 1 )
end

function CommonIconBase:showCount( needShow )
	if needShow == nil then
		needShow = false
	end
	if self._textItemCount ~= nil then
		self._textItemCount:setVisible(needShow)
	end
end

function CommonIconBase:showName(needShow, fixWidth)
	if self._itemParams and needShow then
		self:setName(self._itemParams.name)
		self._labelItemName:setColor(self._itemParams.icon_color)
		UIHelper.updateTextOutline(self._labelItemName, self._itemParams)

		if fixWidth and fixWidth > 0 then
			local render = self._labelItemName:getVirtualRenderer()
			render:setMaxLineWidth(fixWidth)
			self._labelItemName:setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER)
		end
	else
		if self._labelItemName then
			self._labelItemName:setVisible(false)
		end
	end
end
--收集中图片
function CommonIconBase:setName(name)

	if self._labelItemName == nil then
		local params = {
			name = "_labelItemName",
			text = name,
			fontSize = 18,
			color = Colors.WHITE_DEFAULT,
			-- outlineColor = Colors.DEFAULT_OUTLINE_COLOR,
		}
		ComponentIconHelper._setPostion(params,"midEnd")

		local uiWidget = UIHelper.createLabel(params)
		self:appendUI(uiWidget)
		self._labelItemName = uiWidget
		self._labelItemName:setString(name)

	end

	if name and name ~= "" then
		logWarn("CommonIconBase:setName   "..name)
		self._labelItemName:setVisible(true)
		self._labelItemName:setString(name)
	else
		self._labelItemName:setVisible(false)
	end
end
--为名称下面添加一张底图
function CommonIconBase:addBgImageForName(bgPath, fixWidth, heightAdjustParam)
	if self._labelItemName == nil then
		return
	end
	self:removeBgImageForName()
	if self._labelItemNameBgImage == nil then
		local params = {
			name = "_labelItemNameBgImage",
			texture = bgPath or Path.getUICommon("img_com_board01_large_list01a"),
		}
		ComponentIconHelper._setPostion(params,"midEnd")

		local uiWidget = UIHelper.createImage(params)
		uiWidget:setScale9Enabled(true)
		uiWidget:setCapInsets(cc.rect(4,4,4,4))
		local render = self._labelItemName:getVirtualRenderer()
		local size = render:getContentSize()
		local width = size.width
		if fixWidth then
			width = fixWidth
		end
		local heightAdjust = heightAdjustParam or 8
		uiWidget:setContentSize( cc.size(width , size.height + heightAdjust))
		self._labelItemName:setPositionY(uiWidget:getPositionY() - math.ceil(heightAdjust/2))

		self:appendUI(uiWidget, -1)
		self._labelItemNameBgImage = uiWidget
	end
end

function CommonIconBase:removeBgImageForName(bgPath)
	if self._labelItemNameBgImage ~= nil then
		self._labelItemNameBgImage:removeFromParent(true)
		self._labelItemNameBgImage = nil
	end
end

function CommonIconBase:showDoubleTips(isShow)
	if self._doubleTips then
		self._doubleTips:setVisible(isShow)
	end
end

function CommonIconBase:setNameFontSize(fontSize)
	if self._labelItemName then
		self._labelItemName:setFontSize(fontSize)
	end
end

--收集中图片
function CommonIconBase:showCollect(needShow)
	if needShow == nil then
		needShow = false
	end

	if self._imageItemCollect == nil then
		local params = {
			name = "_imageItemCollect",
			texture = Path.getUIText("signet/img_iconcover"),
			adaptWithSize = true,
		}
		ComponentIconHelper._setPostion(params,"midTop")

		local uiWidget = UIHelper.createImage(params)
		self:appendUI(uiWidget)
		self._imageItemCollect = uiWidget
	end
	self._imageItemCollect:setVisible(needShow)
end

--设置Icon灰色蒙层
function CommonIconBase:setIconMask(needMask)
	if needMask == nil then
		needMask = false
	end
	if self._imageMask == nil then
		local params = {
			name = "_imageMask",
			texture = Path.getUICommon("img_iconcover"),
			adaptWithSize = true,
		}
		ComponentIconHelper._setPostion(params,"midcenter")

		local uiWidget = UIHelper.createImage(params)
		self:appendUI(uiWidget)

		self._imageMask = uiWidget
	end
	self._imageMask:setVisible(needMask)
end

--设置Icon选中
function CommonIconBase:setIconSelect(showSelect)
	if showSelect == nil then
		showSelect = false
	end
	if self._imageSelect == nil then
		local params = {
			name = "_imageSelect",
			texture = Path.getUICommon("img_com_check05b"),--btn_iconselect1_dwn
			adaptWithSize = true,
		}
		ComponentIconHelper._setPostion(params,"selectIcon")

		local uiWidget = UIHelper.createImage(params)
		self:appendUI(uiWidget)

		uiWidget:setScale(1.2)

		self._imageSelect = uiWidget
	end
	self._imageSelect:setVisible(showSelect)
end

function CommonIconBase:isIconDark( ... )
	-- body
	return self._iconDark
end
function CommonIconBase:setIconDark(needDark)
	
	if needDark == true then
		UIHelper.applyGrayFilter(self._target)
		if self._labelItemName then
       		self._labelItemName:setColor(cc.c3b(0x4d,0x4d,0x4d))
		end
        -- self._labelItemName:enableOutline(cc.c4b(0x4d,0x4d,0x4d,0xff), 2)
	else
		UIHelper.removeFilter(self._target)
		if self._labelItemName then
			self._labelItemName:setColor(self._itemParams.icon_color)
		end
		-- self._labelItemName:enableOutline(self._itemParams.icon_color_outline, 2)
	end
	self._iconDark = needDark
end

function CommonIconBase:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			end
			if self._itemParams then
				logDebug("CommonIconBase:_onTouchCallBack : "..self._itemParams.name)
			end
		end
	end
end


function CommonIconBase:setCallBack(callback)
	self:setTouchEnabled(true);
	-- 事件响应
    if callback then
		self._callback = callback
	end
end

function CommonIconBase:setTouchEnabled(enabled)
    	--dump(param)
	 if enabled == nil then
	 	enabled = false
	 end
	 self._panelItemContent:setTouchEnabled(enabled)
	 self._panelItemContent:setSwallowTouches(false)
end

function CommonIconBase:setSwallowTouchesEnabled(enabled)
	if enabled == nil then
	   enabled = false
	end
	self._panelItemContent:setSwallowTouches(enabled)
end

function CommonIconBase:setIconVisible(visible)
	if visible == nil then
		visible = false
	end
	self._imageIcon:setVisible(visible)
end

function CommonIconBase:refreshToEmpty()
	self:setIconVisible(false)
	self:loadColorBg(Path.getUICommon("img_frame_bg01"),25)
end

function CommonIconBase:showLightEffect(scale,effectName)
    local lightEffect = require("app.effect.EffectGfxNode").new(effectName or "effect_icon_guangquan")
    lightEffect:setAnchorPoint(0, 0)
    lightEffect:play()
    lightEffect:setName("flash_effect")
	lightEffect:setScale(scale or 1)
    self._panelItemContent:addChild(lightEffect)
    lightEffect:setPosition(self._panelItemContent:getContentSize().width* 0.5,
	self._panelItemContent:getContentSize().height * 0.5)
end

function CommonIconBase:removeLightEffect()
    self._panelItemContent:removeChildByName("flash_effect")

end

function CommonIconBase:showIconEffect(scale,effectName)

end

function CommonIconBase:isClickFrame( ... )
	-- body
end

function CommonIconBase:hideBg()
	self._imageBg:setVisible(false)
end

return CommonIconBase
