--
-- Author: Liangxu
-- 真武战神商店cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceShopCell = class("UniverseRaceShopCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")

function UniverseRaceShopCell:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopCell", "equipActiveShop"),
		binding = {
			_button1 = {
				events = {{event = "touch", method = "_onClickButton1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onClickButton2"}}
			},
		}
	}
	UniverseRaceShopCell.super.ctor(self, resource)
end

function UniverseRaceShopCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function UniverseRaceShopCell:update(goodId1, goodId2, isExchange)
	local function updateNode(index, goodId, isExchange)
		if goodId then
			self["_item"..index]:setVisible(true)
			local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
			local info = data:getConfig()
			local param = TypeConvertHelper.convert(info.type, info.value)
			local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
			local isBought = data:isBought()
			local restCount = data:getRestCount()
			local strButton = ""
			if isExchange then
				strButton = Lang.get("shop_btn_exchange")
			else
				strButton = isBought and Lang.get("shop_btn_buyed") or Lang.get("shop_btn_buy")
			end

			self["_icon"..index]:unInitUI()
			self["_icon"..index]:initUI(info.type, info.value, info.size)
			self["_icon"..index]:setTouchEnabled(true)
			self["_textName"..index]:setString(param.name)
			self["_textName"..index]:setColor(param.icon_color)
			for i = 1, 2 do
				local cost = costInfo[i]
				if cost then
					self["_cost"..index.."_"..i]:setVisible(true)
					self["_cost"..index.."_"..i]:updateUI(cost.type, cost.value, cost.size)
				else
					self["_cost"..index.."_"..i]:setVisible(false)
				end
			end
			self["_button"..index]:setString(strButton)
            self["_button"..index]:setEnabled(not isBought)
            --限制购买
            local des = ""
            if data:getConfig().num_ban_type ~= 0 then
                if restCount > 0 then
                    des = Lang.get("universe_race_shop_buy_count_limit_des", {count = restCount})
                else
                    des = Lang.get("universe_race_shop_buy_reach_limit_des")
                end
            end
            
            self["_textDes"..index]:setString(des)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateNode(1, goodId1)
	updateNode(2, goodId2)
end

function UniverseRaceShopCell:_onClickButton1()
	self:dispatchCustomCallback(1)
end

function UniverseRaceShopCell:_onClickButton2()
	self:dispatchCustomCallback(2)
end

return UniverseRaceShopCell