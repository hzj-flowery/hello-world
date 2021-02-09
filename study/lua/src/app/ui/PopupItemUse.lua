--弹出界面
--物品使用弹框，可以批量使用
--可以更新ICON，以及消耗的物品
local PopupBase = require("app.ui.PopupBase")
local PopupItemUse = class("PopupItemUse", PopupBase)
local Path = require("app.utils.Path")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupItemUse:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_batch_use_item") 
	self._callback = callback
	self._itemId = nil
	self._useNum = 1
	--control init
	self._btnOk = nil -- 
	self._btnCancel = nil
	self._itemNameStr = nil -- 物品名称
	self._itemIcon = nil -- CommonItemIcon
	self._itemOwnerDesc = nil --拥有物品
	self._itemOwnerCount = nil --数量
	self._selectNumNode = nil --CommonSelectNumNode, 通用选择节点
	self._commonNodeBk = nil  --CommonNormalSmallPop
    self._textTips = nil  	  
    self._shopConst = 0 -- 商店ID
	--
	local resource = {
		file = Path.getCSB("PopupItemUse", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
	PopupItemUse.super.ctor(self, resource, true)
end

--
function PopupItemUse:onCreate()
	-- button
	self._btnOk:setString(Lang.get("common_btn_sure"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	-- desc
	self._commonNodeBk:setTitle(self._title)

	self._selectNumNode:setCallBack(handler(self,self._onNumSelect))

	self:setMaxLimit(99)

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

end

function PopupItemUse:checkSlectNum(isClose)
    -- body
    local UserDataHelper = require("app.utils.UserDataHelper")
    local maxValue = UserDataHelper.getResItemMaxUseNum(self._itemId)
    isClose = isClose or false
    if isClose and self._selectNumNode:getMaxLimit() == 0 then
        G_Prompt:showTip(Lang.get("common_tip_enough", {name = self._itemNameStr}))
        return false
    end
    if self._itemNameStr and self._selectNumNode:getMaxLimit() == 0 then
        G_Prompt:showTip(Lang.get("common_tip_enough", {name = self._itemNameStr}))
        return false
    end

    if rawequal(self._useNum, self._selectNumNode:getMaxLimit()) then
         -- 1. Func活动商店/ 2.Shop商品ID
        local ShopConst = require("app.const.ShopConst")
        if self._shopConst == FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP then
            G_Prompt:showTip(Lang.get("common_use_dragpeace_no_have"))
        elseif self._shopConst == ShopConst.SHOP_FIX_LIMIT_RICE or self._shopConst == ShopConst.SHOP_FIX_LIMIT_ATKCMD then
            G_Prompt:showTip(Lang.get("common_tip_enough", {name = self._itemNameStr}))
        end
    end
    return true
end


function PopupItemUse:_onNumSelect(num)
	logDebug("_onNumSelect :"..num)
	self._useNum = num

    --hard code
    if self._useNum == self._selectNumNode:getMaxLimit() then
        if self._itemType == TypeConvertHelper.TYPE_ITEM then
			local UserDataHelper = require("app.utils.UserDataHelper")
			local maxValue = UserDataHelper.getResItemMaxUseNum(self._itemId)
			if self._useNum == maxValue then
				if self._itemId == DataConst.ITEM_VIT then
					G_Prompt:showTip(Lang.get("common_use_vit_max"))
				end

				if self._itemId == DataConst.ITEM_SPIRIT then
					G_Prompt:showTip(Lang.get("common_use_spirit_max"))
                end
                
                if self._itemId == DataConst.ITEM_ARMY_FOOD then
					G_Prompt:showTip(Lang.get("common_use_armyfood_max"))
				end
			end
		end
	end
end
--

function PopupItemUse:setShopConst(type)
    self._shopConst = type
end

function PopupItemUse:updateUI(itemType,itemId,itemSize)
	itemType = itemType or TypeConvertHelper.TYPE_ITEM
	assert(itemId, "PopupItemUse's itemId can't be empty!!!")
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(itemType,itemId,itemSize)
	self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)

	if itemParams.cfg.color == 7 then    -- 金色物品加描边
		self._itemName:enableOutline(itemParams.icon_color_outline, 2)
	end
	
	self._itemId = itemId
    self._itemType = itemType
    self._itemNameStr = itemParams.name
end


function PopupItemUse:setMaxLimit(max)
    --if max == 0 or max == nil then
    if max == nil then
		assert(false, "PopupItemUse:setMaxLimit max can not be 0")
		return
	end
	self._selectNumNode:setMaxLimit(max)
end

function PopupItemUse:setTextTips(s)
	if self._textTips then
		self._textTips:setString(s)
		self._textTips:setVisible(true)
	end
end

function PopupItemUse:setOwnerCount(count)
   self._itemOwnerCount:setString(""..count)
end

function PopupItemUse:setOwnerDesc(desc)
	self._itemOwnerDesc:setString(desc)
end

function PopupItemUse:_onInit()
end


function PopupItemUse:onEnter()
    
end

function PopupItemUse:onExit()
    
end

--
function PopupItemUse:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._itemId, self._useNum)
	end
	if not isBreak then
		self:close()
	end
end


function PopupItemUse:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupItemUse