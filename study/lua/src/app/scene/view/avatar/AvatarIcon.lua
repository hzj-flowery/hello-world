--
-- Author: Liangxu
-- Date: 2017-12-25 14:23:21
-- 变身卡Icon
local ViewBase = require("app.ui.ViewBase")
local AvatarIcon = class("AvatarIcon", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local COLOR2RES = {
    [3] = "img_transform_frame_03",
	[4] = "img_transform_frame_04",
	[5] = "img_transform_frame_05",
	[6] = "img_transform_frame_06",
	[7] = "img_transform_frame_07",
}

local COVER_RES = {
    [3] = "img_transform_03",
    [4] = "img_transform_04",
    [5] = "img_transform_05",
    [6] = "img_transform_06",
    [7] = "img_transform_07",
}

function AvatarIcon:ctor(index, callback)
	self._index = index
	self._callback = callback

	local resource = {
		file = Path.getCSB("AvatarIcon", "avatar"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
		}
	}

	AvatarIcon.super.ctor(self, resource)
end

function AvatarIcon:onCreate()
	self:setContentSize(self._panelTouch:getContentSize())
	self._panelTouch:setSwallowTouches(false)
	self:_initUI()
end

function AvatarIcon:onEnter()
	
end

function AvatarIcon:onExit()
	
end

function AvatarIcon:_initUI()
	self._fileNodeCommon:setVisible(false)
	self._fileNodeCommon:setTouchEnabled(false)
	self._imageSelected:setVisible(false)
	self._imageTop:setVisible(false)
	self._textName:setVisible(false)
	self._imageRP:setVisible(false)
end

function AvatarIcon:updateUI(baseId)
	self:_initUI()

	if baseId == 0 then --本体
		self:_updateMe()
	else
		self:_updateCommon(baseId)
	end
end

function AvatarIcon:_updateMe()
	self._fileNodeCommon:setVisible(true)
	local baseId = G_UserData:getHero():getRoleBaseId()
	self._fileNodeCommon:setType(TypeConvertHelper.TYPE_HERO)
	self._fileNodeCommon:updateUI(baseId)

	local officialInfo = G_UserData:getBase():getOfficialInfo()
	local color = officialInfo.color
	local bgResName = COLOR2RES[color]
	if bgResName then
		self._imageBg:loadTexture(Path.getUICommonFrame(bgResName))
    end
    
    local coverRes  = COVER_RES[color]
    if coverRes then
        self._imageCover:loadTexture(Path.getUICommonFrame(coverRes))
    end

	self._textName:setVisible(true)
	self._textName:setString(G_UserData:getBase():getName())
	self._textName:setColor(Colors.getColor(color))
	-- self._textName:enableOutline(Colors.getColorOutline(color), 2)

	local isEquip = G_UserData:getBase():isEquipAvatar()
	self._imageTop:setVisible(not isEquip) --没装备表示装备了自己╮(╯▽╰)╭
end

function AvatarIcon:_updateCommon(baseId)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId)
	self._fileNodeCommon:setVisible(true)
	self._fileNodeCommon:setType(TypeConvertHelper.TYPE_AVATAR)
	self._fileNodeCommon:updateUI(baseId)

    local bgResName = COLOR2RES[param.color]
	if bgResName then
		self._imageBg:loadTexture(Path.getUICommonFrame(bgResName))
    end
    
    local coverRes  = COVER_RES[param.color]
    if coverRes then
        self._imageCover:loadTexture(Path.getUICommonFrame(coverRes))
    end

	self._textName:setVisible(true)
	self._textName:setString(param.list_name)
	self._textName:setColor(param.icon_color)
	-- self._textName:enableOutline(param.icon_color_outline, 2)

	local unitData = G_UserData:getAvatar():getUnitDataWithBaseId(baseId)
	if unitData then
		self._fileNodeCommon:setIconMask(false)
		-- self._fileNodeCommon:setLevel(unitData:getLevel())
		self._imageTop:setVisible(unitData:isEquiped())
		local redValue = AvatarDataHelper.isBetterThanCurEquiped(unitData)
		self._imageRP:setVisible(redValue)
	else
		self._fileNodeCommon:setIconMask(true)
	end
end

function AvatarIcon:_onPanelTouch(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		if self._callback then
			self._callback(self._index)
		end
	end
end

function AvatarIcon:setSelected(selected)
	self._imageSelected:setVisible(selected)
end

return AvatarIcon