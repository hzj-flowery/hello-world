--
-- Author: Liangxu
-- Date: 2017-03-09 17:16:01
-- 武将名字
local CommonPlayerName = class("CommonPlayerName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"setFontSize",
	"updateNameGap",
	"getWidth"
}

function CommonPlayerName:ctor()
	self._target = nil
	self._textName = nil
end

function CommonPlayerName:_init()
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextPlayerName")
	self._imageTitle = ccui.Helper:seekNodeByName(self._target,"Image_title")
end

function CommonPlayerName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPlayerName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPlayerName:updateUI(name, rankLevel)
	-- body
	if rankLevel == nil then
		rankLevel = 0
	end
	self._textName:setString(name)
	self._textName:setColor(Colors.getOfficialColor(rankLevel))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, rankLevel)
	local officialInfo = G_UserData:getBase():getOfficialInfo(rankLevel)
	if rankLevel == 0 then
		self._target:updateImageView("Image_title", Path.getTextHero("guanxianming_1") )
	else
		self._target:updateImageView("Image_title", {texture = Path.getTextHero(officialInfo.picture), visible = true})
	end
end


function CommonPlayerName:updateNameGap(gap)
	self._imageTitle = ccui.Helper:seekNodeByName(self._target,"Image_title")
	gap = gap or 0
	local size = self._imageTitle:getContentSize()
	if size and size.width > 0 then
		self._textName:setPositionX( size.width + 10 + gap )
	end
end	


function CommonPlayerName:disableOutline()
	self._textName:disableEffect(cc.LabelEffect.OUTLINE)
end

function CommonPlayerName:setFontSize(size)
	self._textName:setFontSize(size)
end

function CommonPlayerName:getWidth()
	return self._textName:getContentSize().width + self._textName:getPositionX()
end


return CommonPlayerName
