
local CustomActivityVipRecommendGiftNode = class("CustomActivityVipRecommendGiftNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function CustomActivityVipRecommendGiftNode:ctor(target)
	self._target = target
	self._nodeIcon = ccui.Helper:seekNodeByName(self._target, "NodeIcon")
	cc.bind(self._nodeIcon, "CommonIconTemplate")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonBuy = ccui.Helper:seekNodeByName(self._target, "ButtonBuy")
	cc.bind(self._buttonBuy, "CommonButtonLevel1Highlight")
	self._buttonBuy:addClickEventListenerEx(handler(self, self._onClickBuy))
	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")

	self._configInfo = nil
end

function CustomActivityVipRecommendGiftNode:updateUI(data)
	local awards = data:getAwards()
	local award = awards[1] --数据上支持多个，现阶段只用一个
	assert(award, string.format("CustomActivityVipRecommendGiftNode award is empty") )
	local param = TypeConvertHelper.convert(award.type, award.value, award.size)
	local configInfo = require("app.config.vip_pay").get(data:getProduct_id())
	self._configInfo = configInfo
	local rmb = configInfo.rmb
	local gold = configInfo.gold
	local buttonName = ""
	local isBuyed = data:getPurchased_times() >= 1
	if isBuyed then
		buttonName = Lang.get("common_already_buy")
	else
		buttonName = Lang.get("common_rmb", {num = rmb})
	end
	local tip = Lang.get("common_go_cost", {num = gold})

	self._nodeIcon:unInitUI()
	self._nodeIcon:initUI(award.type, award.value, award.size)
	self._textName:setString(param.name)
	self._textName:setColor(param.icon_color)
	self._buttonBuy:setString(buttonName)
	self._buttonBuy:setEnabled(not isBuyed)
	self._textTip:setString(tip)
end

function CustomActivityVipRecommendGiftNode:setScale(scale)
	self._target:setScale(scale)
end

function CustomActivityVipRecommendGiftNode:_onClickBuy()
	if self._configInfo == nil then
		return
	end
	
	G_GameAgent:pay(self._configInfo.id, 
					self._configInfo.rmb, 
					self._configInfo.product_id, 
					self._configInfo.name, 
					self._configInfo.name)
end

return CustomActivityVipRecommendGiftNode