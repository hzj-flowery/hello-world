
--
-- Author: Liangxu
-- Date: 2019-5-15
-- 蛋糕活动商店cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeActivityShopCell = class("CakeActivityShopCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper = require("yoka.utils.UIHelper")

function CakeActivityShopCell:ctor()
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
	CakeActivityShopCell.super.ctor(self, resource)
end

function CakeActivityShopCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function CakeActivityShopCell:update(goodId1, goodId2, isExchange)
	local function updateNode(index, goodId, isExchange)
		if goodId then
			self["_item"..index]:setVisible(true)
			local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
			self["_data"..index] = data
			local info = data:getConfig()
			local param = TypeConvertHelper.convert(info.type, info.value)
			local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
			local isBought = data:isBought()
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
			UIHelper.updateTextOutline(self["_textName"..index], param)
			
			if info.type == TypeConvertHelper.TYPE_FRAGMENT then
				self:_showFragmentNum(info.type, info.value, index)
			end
			
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
			self:_updateBtnEnable(index)
			self:_updateDes(index)
			self:_updateDiscount(info.discount, index)
		else
			self["_data"..index] = nil
			self["_item"..index]:setVisible(false)
		end
	end

	updateNode(1, goodId1, isExchange)
	updateNode(2, goodId2, isExchange)
end

function CakeActivityShopCell:_updateBtnEnable(index)
	local data = self["_data"..index]
	if data then
		local isBought = data:isBought()
		local isCanBuy = true
		if data:getConfig().limit_type == 1 then
			local startTime = G_UserData:getCakeActivity():getActivityStartTime()
			local targetTime = startTime + data:getConfig().limit_value
			isCanBuy = data:isCanBuy({limitTime = targetTime})
		end
		local enableBuy = not isBought and isCanBuy
		self["_button"..index]:setEnabled(enableBuy)
	end
end

function CakeActivityShopCell:_updateDes(index)
	local startTime = G_UserData:getCakeActivity():getActivityStartTime()
	local data = self["_data"..index]
	if data then 
		if data:getConfig().limit_type == 1 then --有限制条件
			local targetTime = startTime + data:getConfig().limit_value
			local countDown = targetTime - G_ServerTime:getTime()
			if countDown > 0 then
				local timeString = G_ServerTime:getLeftDHMSFormatEx(targetTime)
				self["_textDes"..index]:setString(Lang.get("cake_activity_shop_buy_countdown_des", {time = timeString}))
			else
				self:_updateBtnEnable(index)
				self:_updateRestCount(index)
			end
		else
			self:_updateRestCount(index)
		end
	else
		self["_textDes"..index]:setString("")
	end
end

function CakeActivityShopCell:_updateRestCount(index)
	local data = self["_data"..index]
	local restCount = data:getRestCount()
	local des = ""
	if data:getConfig().num_ban_type ~= 0 then
		if restCount > 0 then
			des = Lang.get("cake_activity_shop_buy_count_limit_des", {count = restCount})
		else
			des = Lang.get("cake_activity_shop_buy_reach_limit_des")
		end
	end
	
	self["_textDes"..index]:setString(des)
end

function CakeActivityShopCell:updateDes()
	for i = 1, 2 do
		self:_updateDes(i)
	end
end

function CakeActivityShopCell:_showFragmentNum(type, value, index)
	self["_nodeFragment"..index]:removeAllChildren()
    local textFragment = ccui.RichText:create()
    self["_nodeFragment"..index]:addChild(textFragment)
    textFragment:setAnchorPoint(cc.p(0,0.5))

	local itemParams = TypeConvertHelper.convert(type, value)
	local num = UserDataHelper.getNumByTypeAndValue(type,value)
	local textContent = self["_textName"..index]:getVirtualRendererSize()
	local txtX, txtY = self["_textName"..index]:getPosition()
	self["_nodeFragment"..index]:setVisible(true)

	local richTextColor = Colors.BRIGHT_BG_TWO
	if num >= itemParams.cfg.fragment_num then
		richTextColor = Colors.BRIGHT_BG_GREEN
	else
		richTextColor = Colors.BRIGHT_BG_RED
	end

	local richText = Lang.get("shop_fragment_limit", {
		num = num,
		color =  Colors.colorToNumber(richTextColor),
		max = itemParams.cfg.fragment_num,
	})

	textFragment:setRichTextWithJson(richText)
	self["_nodeFragment"..index]:setPosition(txtX + textContent.width + 4, txtY)--中文括号空隙比较大

end

function CakeActivityShopCell:_updateDiscount(discount, index)
	if discount > 0 and discount < 10 then
		self["_imageDiscount"..index]:loadTexture(Path.getDiscountImg(discount))
		self["_imageDiscount"..index]:setVisible(true)
	else
		self["_imageDiscount"..index]:setVisible(false)
	end
end

function CakeActivityShopCell:_onClickButton1()
	self:dispatchCustomCallback(1)
end

function CakeActivityShopCell:_onClickButton2()
	self:dispatchCustomCallback(2)
end

return CakeActivityShopCell