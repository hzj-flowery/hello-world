--变身卡商店购买确认框

local PopupBase = require("app.ui.PopupBase")
local PopupAvatarShopBuyConfirm = class("PopupAvatarShopBuyConfirm", PopupBase)
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local AvatarConst = require("app.const.AvatarConst")

function PopupAvatarShopBuyConfirm:ctor(goodId, callback)
	self._goodId = goodId
	self._callback = callback

	local resource = {
		file = Path.getCSB("PopupAvatarShopBuyConfirm", "avatarShop"),
		binding = {
			_buttonCancel = {
				events = {{event = "touch", method = "_onClickButtonCancel"}}
			},
			_buttonBuy = {
				events = {{event = "touch", method = "_onClickButtonBuy"}}
			},
		}
	}
	
	PopupAvatarShopBuyConfirm.super.ctor(self, resource)
end

function PopupAvatarShopBuyConfirm:onCreate()
	self._selectIndex = 1
	self._popupBg:setTitle(Lang.get("shop_pop_title"))
	self._popupBg:hideBtnBg()
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
	self._buttonCancel:setString(Lang.get("shop_btn_cancel"))
	self._buttonBuy:setString(Lang.get("shop_btn_buy"))
end

function PopupAvatarShopBuyConfirm:onEnter()
	self:_updateView()
	self:_updateCheckBox()
end

function PopupAvatarShopBuyConfirm:onExit()
	
end

function PopupAvatarShopBuyConfirm:_updateView()
	local goodId = self._goodId
	local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
	local info = data:getConfig()
	local avatarId = info.value
	local avatarInfo = AvatarDataHelper.getAvatarConfig(avatarId)
	local avatarColor = avatarInfo.color
	local resBg = AvatarConst.color2ImageBg[avatarColor]
	local heroId = avatarInfo.hero_id
	local resName = AvatarConst.color2NameBg[avatarColor] or "img_Turnscard_namebg"
	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)

	if resBg then
		self._imageBg:loadTexture(Path.getTurnscard(resBg, ".jpg"))
	end
	self._fileNodeDraw:updateUI(heroId)
	self._imageNameColor:loadTexture(Path.getTurnscard(resName))
	self._imageHeroName:loadTexture(Path.getShowHeroName(heroId))

	self._textName:setString(Lang.get("shop_avatar_confirm_name", {name = avatarInfo.name}))
	self._textName:setColor(Colors.getColor(avatarInfo.color))
	local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_AVATAR)
	self._textDes:setString(Lang.get("shop_avatar_confirm_des", {level = funcLevelInfo.level}))

	for i = 1, 2 do
		local cost = costInfo[i]
		if cost then
			self["_nodeCost"..i]:setVisible(true)
			self["_nodeCost"..i]:updateUI(cost.type, cost.value, cost.size)
			self["_nodeCost"..i]:showResName(true, Lang.get("shop_avatar_cost_title"))
		else
			self["_nodeCost"..i]:setVisible(false)
		end
	end
end

function PopupAvatarShopBuyConfirm:_onClickButtonCancel()
	self:close()
end

function PopupAvatarShopBuyConfirm:_onClickButtonBuy()
	if self._callback then
		local success = self._callback(self._goodId, self._selectIndex)
		if success then
			self:close()
		end
	end
end

function PopupAvatarShopBuyConfirm:_onCheckBoxClicked1()
	self._selectIndex = 1
	self:_updateCheckBox()
end

function PopupAvatarShopBuyConfirm:_onCheckBoxClicked2()
	self._selectIndex = 2
	self:_updateCheckBox()
end

function PopupAvatarShopBuyConfirm:_updateCheckBox()
	self._checkBox1:setSelected(self._selectIndex == 1)
	self._checkBox2:setSelected(self._selectIndex == 2)
end

return PopupAvatarShopBuyConfirm