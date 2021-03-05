--
-- Author: Liangxu
-- Date: 2018-1-10 10:50:21
-- 变身卡图鉴Node
local AvatarBookDrawNode = class("AvatarBookDrawNode")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local AvatarConst = require("app.const.AvatarConst")

local COLOR_KARMA = {
	{cc.c3b(0xff, 0xde, 0x6d), cc.c4b(0xd4, 0x4d, 0x08, 0xff)}, --未激活
	{cc.c3b(0xf3, 0xff, 0x2b), cc.c4b(0x64, 0xbd, 0x0d, 0xff)}, --已激活
}

function AvatarBookDrawNode:ctor(target, callback)
	self._target = target
	self._callback = callback
	self._bookId = 0
	self._avatarId1 = 0
	self._avatarId2 = 0
	self:_init()
end

function AvatarBookDrawNode:_init()
	for i = 1, 4 do
		self["_fileNodeAttr"..i] = ccui.Helper:seekNodeByName(self._target, "FileNodeAttr"..i)
		cc.bind(self["_fileNodeAttr"..i], "CommonAttrNode")
	end
	self._buttonActive = ccui.Helper:seekNodeByName(self._target, "ButtonActive")
	self._imageActivated = ccui.Helper:seekNodeByName(self._target, "ImageActivated")
	self._imageTitle = ccui.Helper:seekNodeByName(self._target, "ImageTitle")
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "TextTitle")
	self._fileNodeIcon1 = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon1")
	self._textName1 = ccui.Helper:seekNodeByName(self._target, "TextName1")
	self._fileNodeIcon2 = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon2")
	self._textName2 = ccui.Helper:seekNodeByName(self._target, "TextName2")

	cc.bind(self._buttonActive, "CommonButtonLevel1Highlight")
	self._buttonActive:addClickEventListenerEx(handler(self, self._onButtonClicked))
	self._buttonActive:setString(Lang.get("avatar_btn_active"))

	cc.bind(self._fileNodeIcon1, "CommonAvatarIcon")
	cc.bind(self._fileNodeIcon2, "CommonAvatarIcon")
	self._fileNodeIcon1:setTouchEnabled(true)
	self._fileNodeIcon2:setTouchEnabled(true)
	self._fileNodeIcon1:setCallBack(handler(self, self._onClickIcon1))
	self._fileNodeIcon2:setCallBack(handler(self, self._onClickIcon2))
end

function AvatarBookDrawNode:updateUI(bookId)
	self._bookId = bookId
	self:_updateBaseInfo(bookId)
	for i = 1, 2 do
		self:_updateIcon(i)
	end
	self:_updateAttr(bookId)
end

function AvatarBookDrawNode:_updateBaseInfo(bookId)
	local showConfig = AvatarDataHelper.getAvatarShowConfig(bookId)
	local name = showConfig.name
	self._avatarId1 = showConfig.avatar_id1
	self._avatarId2 = showConfig.avatar_id2
	self._textTitle:setString(name)
end

function AvatarBookDrawNode:_updateIcon(index)
	local avatarId = self["_avatarId"..index]
	local isHave = G_UserData:getAvatar():isHaveWithBaseId(avatarId)
	local avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId)
	self["_fileNodeIcon"..index]:updateUI(avatarId)
	self["_fileNodeIcon"..index]:setIconMask(not isHave)
	self["_textName"..index]:setString(avatarConfig.list_name)
	self["_textName"..index]:setColor(Colors.getColor(avatarConfig.color))
end

function AvatarBookDrawNode:_updateAttr(bookId)
	local isHave = AvatarDataHelper.isHaveAvatarShow(bookId)
	local isActive = G_UserData:getAvatarPhoto():isActiveWithId(bookId)
	self._buttonActive:setEnabled(isHave)
	self._buttonActive:setVisible(not isActive)
	self._imageActivated:setVisible(isActive)
	local reach = AvatarDataHelper.isCanActiveBookWithId(bookId)
	self._buttonActive:showRedPoint(reach)

	local color = isActive and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
	local attrInfo = AvatarDataHelper.getShowAttr(bookId)
	for i = 1, 4 do
		local info = attrInfo[i]
		if info then
			local attrId = info.attrId
			local attrValue = info.attrValue
			self["_fileNodeAttr"..i]:updateView(attrId, attrValue, -10)
			self["_fileNodeAttr"..i]:setNameColor(color)
			self["_fileNodeAttr"..i]:setValueColor(color)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end

	-- if #attrInfo == 1 then
	-- 	self["_fileNodeAttr1"]:setPositionX(112)
	-- else
	-- 	self["_fileNodeAttr1"]:setPositionX(40)
	-- end

	local resName = isActive and Path.getFetterRes("img_namebg_light") or Path.getFetterRes("img_namebg_nml")
	self._imageTitle:loadTexture(resName)
	local titleColor = isActive and COLOR_KARMA[2][1] or COLOR_KARMA[1][1]
	local titleOutline = isActive and COLOR_KARMA[2][2] or COLOR_KARMA[1][2]
	self._textTitle:setColor(titleColor)
	self._textTitle:enableOutline(titleOutline, 2)
end

function AvatarBookDrawNode:_onClickIcon1(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		G_UserData:getAvatar():setCurAvatarId(self._avatarId1)
		G_SceneManager:popScene()
	end
end

function AvatarBookDrawNode:_onClickIcon2(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		G_UserData:getAvatar():setCurAvatarId(self._avatarId2)
		G_SceneManager:popScene()
	end
end

function AvatarBookDrawNode:_onButtonClicked()
	if self._callback then
		self:_callback()
	end
end

return AvatarBookDrawNode