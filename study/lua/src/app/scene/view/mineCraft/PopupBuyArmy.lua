local PopupBase = require("app.ui.PopupBase")
local PopupBuyArmy = class("PopupBuyArmy", PopupBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local MineBarNode = require("app.scene.view.mineCraft.MineBarNode")

function PopupBuyArmy:ctor()
    self._useNum = 1
    self._needFood = 0
    self._buyFoodGold = 0
	local resource = {
		file = Path.getCSB("PopupBuyArmy", "mineCraft"),
		binding = {
            _btnOk = {
				events = {{event = "touch", method = "_onBtnOkClick"}}
            },
            _btnOneKey = {
				events = {{event = "touch", method = "_onBtnOneKey"}}
			},
		}
    }
	PopupBuyArmy.super.ctor(self, resource)
end

function PopupBuyArmy:onCreate()
	self._commonNodeBk:setTitle(Lang.get("mine_buy_army_title"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._onClickClose))
    self._selectNumNode:setCallBack(handler(self, self._onNumSelect))

    self._itemName:setString(Lang.get("ming_bingli"))
    self._costResInfo1:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)

    self._btnOk:setString(Lang.get("mine_buy_food_confirm"))
    self._btnOneKey:setString(Lang.get("mine_one_key_buy"))
    self._barArmy = MineBarNode.new(self._armyBar)

    self:_refreshBuyDetail()
end

function PopupBuyArmy:onEnter()
    self._signalMineBuyArmy = G_SignalManager:add(SignalConst.EVENT_MINE_BUY_ARMY, handler(self, self._onEventBuyArmy))
end

function PopupBuyArmy:onExit()
    self._signalMineBuyArmy:remove()
    self._signalMineBuyArmy = nil
end

function PopupBuyArmy:_refreshBuyDetail()
    local nowArmy = G_UserData:getMineCraftData():getMyArmyValue()
    local maxArmy = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxArmy = (maxArmy + soilderAdd)
    end
    -- self._itemOwnerCount:setString(Lang.get(nowArmy.."/"..maxArmy))
    self._barArmy:setPercent(nowArmy, true, G_UserData:getMineCraftData():isSelfPrivilege())
    self._needFood = maxArmy - nowArmy

    local maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)
    local limit = math.min(maxFood, maxArmy-nowArmy)
    self._selectNumNode:setMaxLimit(limit)

    self._selectNumNode:setAmount(1)
    self._costResInfo1:setCount(1)
    self._useNum = 1
end

function PopupBuyArmy:_onNumSelect(num)
    self._useNum = num
    self:_updateBuyCount()
end

function PopupBuyArmy:_updateBuyCount()
    self._costResInfo1:setCount(self._useNum)
end

function PopupBuyArmy:_onBtnOkClick()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD, self._useNum)
    if not success then
        return 
    end
    G_UserData:getMineCraftData():c2sMineBuyArmy(self._useNum)
end

function PopupBuyArmy:_onBtnOneKey()
    local maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)
    local goldToFood = tonumber(require("app.config.parameter").get(ParameterIDConst.MINE_GOLD_TO_FOOD).content)
    self._needMoney = 0
    local strContent = ""
    if maxFood >= self._needFood then 
        strContent = Lang.get("mine_buy_all", {count = self._needFood})
    elseif maxFood == 0 then
        self._buyFoodGold = self._needFood*goldToFood
        strContent = Lang.get("mine_buy_all_no_food", {count = self._buyFoodGold})
    else
        local leftGold = (self._needFood - maxFood)*goldToFood
        self._buyFoodGold = leftGold
        strContent = Lang.get("mine_buy_all_money", {count1 = maxFood, count2 = leftGold})
    end
    
    local title = Lang.get("mine_one_key_title")
    local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, strContent, handler(self, self._sendBuyAll))
    popupSystemAlert:setCheckBoxVisible()
    popupSystemAlert:openWithAction()
end

function PopupBuyArmy:_sendBuyAll()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, self._buyFoodGold)
    if not success then
        return 
    end
    G_UserData:getMineCraftData():c2sMineBuyArmy(self._needFood)
end

function PopupBuyArmy:_onEventBuyArmy(eventName, buyCount)
    self:_refreshBuyDetail()
    self:closeWithAction()
end

function PopupBuyArmy:_onClickClose()
    self:closeWithAction()
end



return PopupBuyArmy