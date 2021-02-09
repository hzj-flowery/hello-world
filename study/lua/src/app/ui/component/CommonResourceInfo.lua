--
-- Author: hedl
-- Date: 2017-02-27 18:02:15
-- 通用资源信息， resMiniIcon resCount

local CommonResourceInfo = class("CommonResourceInfo")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local Color = require("app.utils.Color")

CommonResourceInfo.SPACE_WIDTH = 5

local EXPORTED_METHODS = {
    "setCount",
    "updateUI",
	"setCountColorRed",
	"setCountColorBeige",
	"setCountUnknown",
	"showImageAdd",
	"setMaxColorBeige",
	"showResName",
	"setTextColor",
	"setTextColorToATypeColor",
	"setTextColorToDTypeColor",
	"setTextColorToDRevisionTypeColor",
	"updateCrit",
    "setCritVisible",
	"setTextColorToGAndBTypeColor",
	"setTextOutLine",
	"getResSize",
	"getResName",
    "setTextResNameHighLight",
    "setTextResNameNormal",
	"playCritAction",
	"setCritImageVisible",
	"setTextColorToATypeGreen",
	"getContentWidth",
	"setImageResScale",
	"setAddButtonCall",
    "setResNameColor",
    "setTextCountSize",
	"setResNameFontSize",
	"setPlusNum"
}

function CommonResourceInfo:ctor()

end

function CommonResourceInfo:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textCount =  ccui.Helper:seekNodeByName(self._target, "Text")
	self._textMax  = ccui.Helper:seekNodeByName(self._target, "Text_max")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "Button_add")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "Panel_touch")
	self._textResName = ccui.Helper:seekNodeByName(self._target, "Text_ResName")
	self._textCrit = ccui.Helper:seekNodeByName(self._target, "Text_Crit")
	self._imageCrit = ccui.Helper:seekNodeByName(self._target, "Image_Crit")
	self._textLevel = ccui.Helper:seekNodeByName(self._target, "Text_level")
	self._panelTouch:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._textMax:setVisible(false)
	self._textResName:setVisible(false)
	self._textCrit:setVisible(false)
	self._imageCrit:setVisible(false)
	self._textLevel:setVisible(false)
end

function CommonResourceInfo:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonResourceInfo:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonResourceInfo:updateUI(type, value, size)
	type = type or TypeConvertHelper.TYPE_RESOURCE
	local itemParams = TypeConvertHelper.convert(type, value)

	self._itemParams = itemParams
	if itemParams.res_mini then
		self._imageRes:loadTexture(itemParams.res_mini)
	end
	if size then
		self:setCount(size)
	end
end

--传入倍率暴击数
function CommonResourceInfo:updateCrit(index, size)
	local posX = self._textCount:getPositionX() + self._textCount:getContentSize().width + CommonResourceInfo.SPACE_WIDTH
	self._textCrit:setPositionX(posX)
	self._textCrit:setVisible(true)
	local stringCrit = "+"..tostring(size)
	self._textCrit:setString(stringCrit)
	self._textCrit:setColor(Color.getColor(index))
	local imageCritPos = posX + self._textCrit:getContentSize().width + CommonResourceInfo.SPACE_WIDTH
	local pic = Path.getTextSignet("txt_baoji0"..index)
	self._imageCrit:loadTexture(pic)
	self._imageCrit:setPositionX(imageCritPos)
	self._imageCrit:setVisible(true)
	-- self._textCrit:enableOutline(Color.getColorOutline(index), 2)
end

function CommonResourceInfo:setCritVisible(trueOrFalse)
    self._imageCrit:setVisible(trueOrFalse)
    self._textCrit:setVisible(trueOrFalse)
end


function CommonResourceInfo:showResName(needShow,name)
	needShow = needShow or false

	if needShow then
		name = name or self._itemParams.name.." : "
		self._textResName:setVisible(needShow)
		self._textResName:setString(name)
	end
end

function CommonResourceInfo:getResName( ... )
	return self._itemParams.name
end

function CommonResourceInfo:setCount(count, max, customColor)
	if count ~= nil then
		self._textCount:setString(""..count)
		--self._textCount:setColor(Colors.BRIGHT_BG_ONE)
	end


	if max ~=nil and max >= 0 then
		local posX = self._textCount:getPositionX() + self._textCount:getContentSize().width
		self._textMax:setString(" / "..max)
		self._textMax:setVisible(true)
		self._textMax:setPositionX(posX)
		self._textLevel:setVisible(false)
		--[[
		if count >= max then
			self._textCount:setColor(Colors.uiColors.GREEN)
			self._textMax:setColor(Colors.uiColors.GREEN)
		else
			self._textCount:setColor(Colors.uiColors.RED)
			self._textMax:setColor(Colors.BRIGHT_BG_ONE)
		end
]]

	end
	if not customColor then
		self:setTextColorToATypeColor()
	end
end

function CommonResourceInfo:setAddButtonCall(addCall )
	-- body
	self._addCall = addCall
end
function CommonResourceInfo:showImageAdd(needShow,showBuyDialog)
	if needShow == nil then
		needShow = false
	end
	if needShow == true then
		local callback = showBuyDialog and handler(self,self._onBuyAndUseRes) or handler(self,self._onShowResWay)
		local posX = self._textMax:getPositionX() + self._textMax:getContentSize().width + 20
		self._buttonAdd:setVisible(true)
		self._buttonAdd:setPositionX(posX)
		self._buttonAdd:addClickEventListenerEx(callback, true, nil, 0)
		self._panelTouch:setVisible(true)
		self._panelTouch:addClickEventListenerEx(callback, true, nil, 0)
	else
		self._buttonAdd:setVisible(false)
		self._panelTouch:setVisible(false)
	end
end

function CommonResourceInfo:_onShowResWay(sender)
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._itemParams.item_type, self._itemParams.cfg.id)
	PopupItemGuider:openWithAction()
end

function CommonResourceInfo:_onBuyAndUseRes(sender)
	if self._addCall then
		self._addCall()
		return
	end
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,isDeal = LogicCheckHelper.resCheck(self._itemParams.cfg.id,-1,true)
	if not isDeal then
		G_Prompt:showTip(Lang.get("common_not_develop"))
	end
end

function CommonResourceInfo:setCountColorRed(needRed)
	if needRed == nil then
		needRed = false
	end
	if needRed == true then
		self._textCount:setColor(Colors.uiColors.RED)
	else
		self._textCount:setColor(Colors.BRIGHT_BG_ONE)
	end

end

function CommonResourceInfo:setCountColorBeige()
	self._textCount:setColor(Colors.uiColors.BEIGE)
end

function CommonResourceInfo:setMaxColorBeige()
	self._textMax:setColor(Colors.uiColors.BEIGE)
end

function CommonResourceInfo:setCountUnknown()
	self._textCount:setString("???")
end


function CommonResourceInfo:setTextColor(c3b)
	self._textCount:setColor(c3b)
	self._textResName:setColor(c3b)
end

function CommonResourceInfo:setTextOutLine(c3b)
	self._textCount:enableOutline(c3b, 2)
end

function CommonResourceInfo:setTextColorToATypeColor(enoughMaxCount)
	self._textResName:setColor(Colors.BRIGHT_BG_TWO)


	if enoughMaxCount == nil  then
		self._textCount:setColor(Colors.BRIGHT_BG_ONE)
		self._textMax:setColor(Colors.BRIGHT_BG_ONE)
	else
		self._textCount:setColor(enoughMaxCount and Colors.BRIGHT_BG_GREEN or Colors.uiColors.RED)
		self._textMax:setColor(enoughMaxCount and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_ONE)
	end

end

function CommonResourceInfo:setTextColorToDTypeColor(enoughMaxCount)
	self._textResName:setColor(Colors.DARK_BG_TWO)


	if enoughMaxCount == nil  then
		self._textCount:setColor(Colors.DARK_BG_ONE)
		self._textMax:setColor(Colors.DARK_BG_ONE)
	else
		self._textCount:setColor(enoughMaxCount and Colors.DARK_BG_GREEN or Colors.DARK_BG_RED)
		self._textMax:setColor(enoughMaxCount and Colors.DARK_BG_GREEN or Colors.DARK_BG_ONE)
	end

end

function CommonResourceInfo:setTextColorToDRevisionTypeColor(enoughMaxCount)
	self._textResName:setColor(Colors.DARK_BG_THREE)

	if enoughMaxCount == nil  then
		self._textCount:setColor(Colors.DARK_BG_THREE)
		self._textMax:setColor(Colors.DARK_BG_THREE)
	else
		self._textCount:setColor(enoughMaxCount and Colors.DARK_BG_GREEN or Colors.DARK_BG_RED)
		self._textMax:setColor(enoughMaxCount and Colors.DARK_BG_GREEN or Colors.DARK_BG_THREE)
	end
end

function CommonResourceInfo:setTextColorToGAndBTypeColor()
	self._textCount:setColor(Colors.CLASS_WHITE)
	self._textCount:enableOutline(Colors.CLASS_WHITE_OUTLINE, 2)
end


--返回资源大小，做对齐用
function CommonResourceInfo:getResSize()
	local imageSize = self._imageRes:getContentSize()
	local textSize= self._textCount:getContentSize()
	local size = cc.size(textSize.width+imageSize.width, math.max(imageSize.height, textSize.height))
	return size
end

--
function CommonResourceInfo:setTextResNameHighLight()
    if self._textResName then
        self._textResName:setColor(Colors.BRIGHT_BG_RED)
    end

    if self._textCount then
        self._textCount:setColor(Colors.BRIGHT_BG_RED)
    end
end

function CommonResourceInfo:setTextResNameNormal()
    if self._textResName then
        self._textResName:setColor(Colors.BRIGHT_BG_TWO)
    end

    if self._textCount then
        self._textCount:setColor(Colors.BRIGHT_BG_ONE)
    end
end

function CommonResourceInfo:playCritAction(action)
	self._imageCrit:setVisible(true)
	G_EffectGfxMgr:applySingleGfx(self._imageCrit, action, nil, nil, nil)
end

function CommonResourceInfo:setCritImageVisible(v)
	self._imageCrit:setVisible(v)
end

function CommonResourceInfo:setTextColorToATypeGreen()
	self._textCount:setColor(Colors.getATypeGreen())
end

function CommonResourceInfo:getContentWidth()
	return self._textCount:getPositionX() + self._textCount:getContentSize().width
end

function CommonResourceInfo:setImageResScale(scale)
	self._imageRes:setScale(scale)
end

function CommonResourceInfo:setResNameColor(color)
	self._textResName:setColor(color)
end

function CommonResourceInfo:setTextCountSize(fontSize)
    self._textCount:setFontSize(fontSize)
end

function CommonResourceInfo:setResNameFontSize(fontSize)
    self._textResName:setFontSize(fontSize)
end

function CommonResourceInfo:setPlusNum(plusNum)
	if plusNum ~= nil and plusNum > 1 then
		local posX = self._textCount:getPositionX() + self._textCount:getContentSize().width
		self._textLevel:setString("+" .. plusNum)
		self._textLevel:setVisible(true)
		self._textLevel:setPositionX(posX)
		self._textMax:setVisible(false)
		self._textCount:setVisible(false)
	end
end

return CommonResourceInfo
