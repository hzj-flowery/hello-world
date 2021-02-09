
-- Author: nieming
-- Date:2018-06-12 10:31:30
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CrystalChargeShopCell = class("CrystalChargeShopCell", ListViewCellBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function CrystalChargeShopCell:ctor()

	--csb bind var name
	self._alreadyBuy1 = nil  --ImageView
	self._alreadyBuy2 = nil  --ImageView
	self._btnBuy1 = nil  --CommonButtonHighLight
	self._btnBuy2 = nil  --CommonButtonHighLight
	self._buyDesc1 = nil  --Text
	self._buyDesc2 = nil  --Text
	self._costRes11 = nil  --CommonResourceInfoList
	self._costRes12 = nil  --CommonResourceInfoList
	self._costRes21 = nil  --CommonResourceInfoList
	self._costRes22 = nil  --CommonResourceInfoList
	self._discount1 = nil  --ImageView
	self._discount2 = nil  --ImageView
	self._item1 = nil  --ImageView
	self._item2 = nil  --ImageView
	self._itemIcon1 = nil  --CommonIconTemplate
	self._itemIcon2 = nil  --CommonIconTemplate
	self._itemName1 = nil  --Text
	self._itemName2 = nil  --Text

	local resource = {
		file = Path.getCSB("CrystalChargeShopCell", "crystalShop"),
		binding = {
			_btnBuy1 = {
				events = {{event = "touch", method = "_onBtnBuy1"}}
			},
			_btnBuy2 = {
				events = {{event = "touch", method = "_onBtnBuy2"}}
			},
		},
	}
	CrystalChargeShopCell.super.ctor(self, resource)
end

function CrystalChargeShopCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnBuy1:setString(Lang.get("common_btn_name_confirm"))
	self._btnBuy2:setString(Lang.get("common_btn_name_confirm"))
end

function CrystalChargeShopCell:updateUI(cellData)
	for index = 1, 2 do
        self["_item"..index]:setVisible(false)
	end
	
    -- update item
	local function updateItem(index, data)
		if index == 1 then
			self._data1 = data.data
		elseif index == 2 then
			self._data2 = data.data
		end

		local cfg = data.data:getConfig()
		self["_item"..index]:setVisible(true)
        self["_itemIcon"..index]:unInitUI()
		self["_itemIcon"..index]:initUI(cfg.good_type, cfg.good_value, cfg.good_size)

		local itemParams = self["_itemIcon"..index]:getItemParams()
		self["_itemName"..index]:setString(itemParams.name)
		self["_itemName"..index]:setColor(itemParams.icon_color)

		if cfg.discount >= 1 and cfg.discount <= 9 then
			self["_discount"..index]:loadTexture(Path.getTextSignet("txt_sys_activity_sale0"..cfg.discount))
			self["_discount"..index]:setVisible(true)
		else
			self["_discount"..index]:setVisible(false)
		end

		local leftBuyCount = data.data:getLeftBuyCount()
		if leftBuyCount >= 0 then
			self["_buyDesc"..index]:setVisible(true)
			if leftBuyCount > 0 then
				self["_btnBuy"..index]:setEnabled(true)
				self["_btnBuy"..index]:setString(Lang.get("lang_crystal_shop_btn_buy"))
				self["_buyDesc"..index]:setString(Lang.get("lang_crystal_shop_limit", {num = leftBuyCount}))
			else
				self["_btnBuy"..index]:setEnabled(false)
				self["_btnBuy"..index]:setString(Lang.get("lang_crystal_shop_btn_already_buy"))
				self["_buyDesc"..index]:setString(Lang.get("lang_crystal_shop_limit_max"))
			end
		else
			self["_buyDesc"..index]:setVisible(false)
			self["_btnBuy"..index]:setEnabled(true)
			self["_btnBuy"..index]:setString(Lang.get("lang_crystal_shop_btn_buy"))
		end

		for i = 1, 2 do
			local costResName = string.format("_costRes%d%d", index, i)
			if cfg["price_type_"..i] ~= 0 then
				self[costResName]:updateUI( cfg["price_type_"..i],  cfg["price_value_"..i],  cfg["price_size_"..i])
				self[costResName]:setVisible(true)
				local canBuy = LogicCheckHelper.enoughValue(cfg["price_type_"..i],cfg["price_value_"..i],cfg["price_size_"..i],false)
				if not canBuy then
					self[costResName]:setTextColorToRed()
				else
					self[costResName]:setTextColorToATypeColor()
				end
			else
				self[costResName]:setVisible(false)
			end
		end
    end

	for itemIndex, itemData in ipairs(cellData) do
       updateItem(itemIndex, itemData) 
    end
end

-- Describle：
function CrystalChargeShopCell:_onBtnBuy1()
	-- body
	if self._data1 then
		self:dispatchCustomCallback(self._data1)
	end
end
-- Describle：
function CrystalChargeShopCell:_onBtnBuy2()
	-- body
	if self._data2 then
		self:dispatchCustomCallback(self._data2)
	end
end

return CrystalChargeShopCell
