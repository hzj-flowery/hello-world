--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 物品icon
local UIHelper  = require("yoka.utils.UIHelper")

local CommonIconBase = import(".CommonIconBase")

local CommonItemIcon = class("CommonItemIcon",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")



function CommonItemIcon:ctor()
	CommonItemIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_ITEM
end

function CommonItemIcon:_init()
	CommonItemIcon.super._init(self)

end

function CommonItemIcon:bind(target)
	CommonItemIcon.super.bind(self, target)
end

function CommonItemIcon:unbind(target)
	CommonItemIcon.super.unbind(self, target)
end

function CommonItemIcon:updateUI(value, size, rank)
	CommonItemIcon.super.updateUI(self, value, size, rank)
	self:showIconEffect()
end

function CommonItemIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				self:popupItemInfo()
			end
		end
	end
end



function CommonItemIcon:showIconEffect(scale)
	self:removeLightEffect()

	if self._itemParams and self._itemParams.cfg.moving ~= "" then
		CommonItemIcon.super.showLightEffect(self,scale, self._itemParams.cfg.moving)
	end
end


function CommonItemIcon:popupItemInfo()
	local UIPopupHelper = require("app.utils.UIPopupHelper")
	local UserDataHelper = require("app.utils.UserDataHelper")
	local itemParam = self._itemParams
	local itemId = itemParam.cfg.id
	local itemConfig = itemParam.cfg

	if itemConfig.item_type == 2 then--任选宝箱类
		local boxId = itemConfig.item_value
		local itemList = UIPopupHelper.getBoxItemList(boxId, itemId)

		local function callBackFunction(awardItem, index, total)
		end

		local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)--当前任选宝箱数量
		local itemListSize =  table.nums(itemList)
		if itemListSize == 1 then--不分组
			local awardItem = nil 
			for i, awards in pairs(itemList) do
				awardItem = awards
			end

			local PopupSelectReward = require("app.ui.PopupSelectReward").new(Lang.get("popup_title_select_reward"),callBackFunction)
			PopupSelectReward:updateUI(awardItem)
			PopupSelectReward:showCheck(false)
			PopupSelectReward:onlyShowOkButton()
		
			PopupSelectReward:openWithAction()

		elseif itemListSize > 1 then--分组，分页签

			local PopupSelectRewardTab = require("app.ui.PopupSelectRewardTab").new(Lang.get("popup_title_select_reward"),callBackFunction)
			PopupSelectRewardTab:updateUI(itemList)
			PopupSelectRewardTab:showCheck(false)
			PopupSelectRewardTab:onlyShowOkButton()
			
			PopupSelectRewardTab:openWithAction()
		end
	
	else
		local PopupItemInfo = require("app.ui.PopupItemInfo").new()
		PopupItemInfo:updateUI(TypeConvertHelper.TYPE_ITEM, itemId)
		PopupItemInfo:openWithAction()
	end



end



return CommonItemIcon