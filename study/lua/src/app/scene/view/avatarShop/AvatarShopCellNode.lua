--
-- Author: Liangxu
-- Date: 2018-4-27 10:54:18
-- 变身卡商店单元节点
local AvatarShopCellNode = class("AvatarShopCellNode")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local AvatarConst = require("app.const.AvatarConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function AvatarShopCellNode:ctor(target, callback, index)
	self._target = target
	self._callback = callback
	self._index = index
	self._avatarId = 0
	self:_init()
end

function AvatarShopCellNode:_init()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._fileNodeDraw = ccui.Helper:seekNodeByName(self._target, "FileNodeDraw")
	self._imageNew = ccui.Helper:seekNodeByName(self._target, "ImageNew")
	self._textHeroName = ccui.Helper:seekNodeByName(self._target, "TextHeroName")
	self._resource1 = ccui.Helper:seekNodeByName(self._target, "Resource1")
	self._resource2 = ccui.Helper:seekNodeByName(self._target, "Resource2")
	self._buttonBuy = ccui.Helper:seekNodeByName(self._target, "ButtonBuy")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")

	self._drawPosX, self._drawPosY = self._fileNodeDraw:getPosition()

	cc.bind(self._fileNodeDraw, "CommonStoryAvatar")
	cc.bind(self._resource1, "CommonResourceInfo")
	cc.bind(self._resource2, "CommonResourceInfo")
	cc.bind(self._buttonBuy, "CommonButtonLevel0Highlight")

	self._resource1:setImageResScale(0.8)
	self._resource2:setImageResScale(0.8)
	self._buttonBuy:addClickEventListenerEx(handler(self, self._onButtonBuyClicked))
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
	self._panelTouch:setSwallowTouches(false)
end

function AvatarShopCellNode:updateUI(goodId)
	local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
	local info = data:getConfig()
	local avatarId = info.value
	self._avatarId = avatarId
	local avatarInfo = AvatarDataHelper.getAvatarConfig(avatarId)
	local avatarColor = avatarInfo.color
	local resBg = AvatarConst.color2ImageBg[avatarColor]
	local heroId = avatarInfo.hero_id
	local limitLevel = 0
	if avatarInfo.limit == 1 then
		limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
	end
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, nil, nil, limitLevel)
	local actUnitData = G_UserData:getCustomActivity():getAvatarActivity()
	local curBatch = actUnitData:getBatch()
	local isNew = data:isNew(curBatch)
	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
	local isBought = data:isBought() or G_UserData:getAvatar():isHaveWithBaseId(avatarId)
	local strButton = isBought and Lang.get("shop_btn_buyed") or Lang.get("shop_btn_buy")
	if resBg then
		self._imageBg:loadTexture(Path.getTurnscard(resBg, ".jpg"))
	end
	
	self._fileNodeDraw:updateUI(heroId, limitLevel)
	--调整位置
	local drawPosX = self._drawPosX + avatarInfo.xaxis
	local drawPosY = self._drawPosY + avatarInfo.yaxis
	self._fileNodeDraw:setPosition(cc.p(drawPosX, drawPosY))
	self._textHeroName:setString(heroParam.name)
	self._textHeroName:setColor(heroParam.icon_color)
	self._textHeroName:enableOutline(heroParam.icon_color_outline, 2)
	self._imageNew:setVisible(isNew)
	for i = 1, 2 do
		local cost = costInfo[i]
		if cost then
			self["_resource"..i]:setVisible(true)
			self["_resource"..i]:updateUI(cost.type, cost.value, cost.size)
			self["_resource"..i]:setTextColorToDTypeColor()
		else
			self["_resource"..i]:setVisible(false)
		end
	end
	self._buttonBuy:setString(strButton)
	self._buttonBuy:setEnabled(not isBought)
end

function AvatarShopCellNode:_onButtonBuyClicked()
	if self._callback then
		self._callback(self._index)
	end
end

function AvatarShopCellNode:_onPanelTouch(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		local popup = require("app.scene.view.avatar.PopupAvatarDetail").new(TypeConvertHelper.TYPE_AVATAR, self._avatarId)
		popup:openWithAction()
	end
end

return AvatarShopCellNode