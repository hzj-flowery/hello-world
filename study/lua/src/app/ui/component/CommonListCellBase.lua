--
-- Author: hedili
-- Date: 2017-07-12 17:51:00
-- 通用ListCellBase
local CommonListCellBase = class("CommonListCellBase")
local UserDataHelper = require("app.utils.UserDataHelper")
local HeroConst = require("app.const.HeroConst")



local EXPORTED_METHODS = {
	"updateUI",
	"setCallBack",
	"setUniqueId",
	"setName",
	"getIconId",
	"getCommonIcon",
	"setIconCount",
	"setTouchEnabled",
	"setCountText",
    "getNameSizeWidth",
    "setEquipBriefVisible",
    "updateEquipBriefBg",
    "updateEquipBriefIcon",
}

function CommonListCellBase:ctor()
	self._target = nil
	self._icon = nil
end

function CommonListCellBase:_init()
	self._commonIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	cc.bind(self._commonIcon, "CommonIconTemplate")
	self._nodeCount = ccui.Helper:seekNodeByName(self._target, "NodeCount")
end

function CommonListCellBase:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonListCellBase:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonListCellBase:updateUI(type,value,size, param)
	local params = nil
	if not param then
		self._commonIcon:unInitUI()
		self._commonIcon:initUI(type,value,size)
		params = self._commonIcon:getItemParams()
	else
		params = param
	end

	self._textName:setString(params.name)
	self._textName:setColor(params.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName, params)

	self._cellId = value
end

function CommonListCellBase:setUniqueId(id)
	if self._commonIcon then
		self._commonIcon:setUniqueId(id)
	end
end

function CommonListCellBase:setName(name, color, params)
	if name == nil then
		name = ""
	end
	self._textName:setString(name)
	if color then
		self._textName:setColor(color)
	end
	if params then
		require("yoka.utils.UIHelper").updateTextOutline(self._textName, params)
	end
end

function CommonListCellBase:setCallBack(callback)
	self._commonIcon:setCallBack(callback)
end

function CommonListCellBase:setTouchEnabled(enabled)
	self._commonIcon:setTouchEnabled(enabled)
end


function CommonListCellBase:getCommonIcon()
	return self._commonIcon
end

function CommonListCellBase:getIconId()
	return self._cellId
end	

function CommonListCellBase:setIconCount(num)
	self._commonIcon:setCount(num)
end

function CommonListCellBase:setCountText(richText)
	self._nodeCount:removeAllChildren()
	if richText then
		local posX = self._textName:getPositionX()
		local posY = self._textName:getPositionY()
		local width = self._textName:getContentSize().width
		richText:setAnchorPoint(cc.p(0, 0.5))
		self._nodeCount:setPosition(cc.p(posX + width, posY))
		self._nodeCount:addChild(richText)
	end
end

function CommonListCellBase:getNameSizeWidth()
	local width = self._textName:getContentSize().width
	return width
end

function CommonListCellBase:setEquipBriefVisible(visible)
    self._commonIcon:setEquipBriefVisible(visible)
end

function CommonListCellBase:updateEquipBriefBg(horseLevel)
    self._commonIcon:updateEquipBriefBg(horseLevel)
end

function CommonListCellBase:updateEquipBriefIcon(stateList)
    self._commonIcon:updateEquipBriefIcon(stateList)
end

return CommonListCellBase