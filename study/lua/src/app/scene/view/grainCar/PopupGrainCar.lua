-- Description: 劫镖弹出框
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-04
local PopupBase = require("app.ui.PopupBase")
local PopupGrainCar = class("PopupGrainCar", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local GrainCarScroll = require("app.scene.view.grainCar.GrainCarScroll")
local PopupGrainCarGuildSelector = require("app.scene.view.grainCar.PopupGrainCarGuildSelector")
local GrainCarAttackLeftPanel  = require("app.scene.view.grainCar.GrainCarAttackLeftPanel")
local GrainCarAttackRightPanel  = require("app.scene.view.grainCar.GrainCarAttackRightPanel")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 

local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local Parameter = require("app.config.parameter")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local warringHurtHP = import("app.scene.view.guildCrossWar.warringHurtHP")

function PopupGrainCar:waitEnterMsg(callBack, mineId)
	local function onMsgCallBack(id, message)
		callBack()
    end

    G_UserData:getMineCraftData():c2sEnterMine(mineId)
    local signal = G_SignalManager:add(SignalConst.EVENT_ENTER_MINE, onMsgCallBack)
    return signal
end

function PopupGrainCar:ctor(data)
    self:_initMember(data)

	local resource = {
		file = Path.getCSB("PopupGrainCar", "grainCar"),
		binding = {
            _btnMoveIn = {
                events = {{event = "touch", method = "_onBtnMoveInClick"}}
            },
		}
	}
	self:setName("PopupGrainCar")
	PopupGrainCar.super.ctor(self, resource)
end

function PopupGrainCar:onCreate()
    self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    self._commonNodeBk:setTitle(self._mineData:getConfigData().pit_name)
    self:_updateData()
    self:_initUI()
end

function PopupGrainCar:onEnter()
    self._signalSettleMine = G_SignalManager:add(SignalConst.EVENT_SETTLE_MINE, handler(self, self._onSettleMine))
    self._signalBattleMine = G_SignalManager:add(SignalConst.EVENT_BATTLE_MINE, handler(self, self._onEventBattleMine))
    self._signalMineRespond = G_SignalManager:add(SignalConst.EVENT_GET_MINE_RESPOND, handler(self, self._onEventMineRespond))
    self._singalFastBattle = G_SignalManager:add(SignalConst.EVENT_FAST_BATTLE, handler(self, self._onFastBattle))
    self._signalGrainCarNotify = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(self, self._onEventGrainCarNotify))
    self._signalGrainCarAttack = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_ATTACK, handler(self, self._onEventGrainCarAttack))
    self._signalGrainCarClick = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE, handler(self, self._onEventGrainCarClicked))
    self._signalGrainCarMoveNotify = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(self, self._onEventMoveCarNotify)) -- 粮车进站变动通知

    self:_refreshRoadCost()
end

function PopupGrainCar:onExit()
	self._signalSettleMine:remove()
    self._signalSettleMine = nil
	self._signalBattleMine:remove()
    self._signalBattleMine = nil
	self._signalMineRespond:remove()
    self._signalMineRespond = nil
	self._singalFastBattle:remove()
    self._singalFastBattle = nil
	self._signalGrainCarNotify:remove()
    self._signalGrainCarNotify = nil
	self._signalGrainCarAttack:remove()
    self._signalGrainCarAttack = nil
	self._signalGrainCarClick:remove()
    self._signalGrainCarClick = nil
	self._signalGrainCarMoveNotify:remove()
    self._signalGrainCarMoveNotify = nil
end

function PopupGrainCar:onShowFinish()

end

function PopupGrainCar:_initMember(data)
    self._mineData = data
    self._scroll = nil          --滚动容器
    self._guildSelector = nil   --军团选择器
end

------------------------------------------------------------------
----------------------------data----------------------------------
------------------------------------------------------------------
function PopupGrainCar:_updateData()
end


------------------------------------------------------------------
----------------------------UI------------------------------------
------------------------------------------------------------------
function PopupGrainCar:_initUI()
    self._btnMoveIn:setString(Lang.get("mine_move_in"))
    self._imageMatchSuccess:setVisible(false)
    self:_initScrollView()
    -- 军团选择器暂时不用
    -- self:_initGuildSelector()
end

function PopupGrainCar:_initScrollView()
    self._scroll = GrainCarScroll.new(self._mineData)
    self._commonNodeBk:addChild(self._scroll)
end

function PopupGrainCar:_initGuildSelector()
    self._guildSelector = PopupGrainCarGuildSelector.new(self._mineData:getId())
    self._guildSelector:setSelectorCallback(handler(self, self._onSelectorCallback))
    self._nodeSelector:removeAllChildren()
    self._nodeSelector:addChild(self._guildSelector)
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCar:_refreshRoadCost()
    local selfMineId = G_UserData:getMineCraftData():getSelfMineId()
    if self._mineData:getId() == selfMineId then 
        self._moveResource:updateUI( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD,  0)
        self._moveResource:setTextColor(Colors.getMineStateColor(1))
        self._btnMoveIn:setEnabled(false)
        return
    end
    self._moveRoads = MineCraftHelper.getRoad2(selfMineId, self._mineData:getId())
    local parameterContent = Parameter.get(ParameterIDConst.FOOD_PER_MOVE)
    assert(parameterContent, "not id, "..ParameterIDConst.FOOD_PER_MOVE)
    self._foodCost = #self._moveRoads*tonumber(parameterContent.content)
    --神树祈福Buff
    local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
    local HomelandConst = require("app.const.HomelandConst")
    local isCanUse, buffData = HomelandHelp.checkBuffIsCanUse(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_17)
    if isCanUse then
        local restCount = buffData:getRestCount()
        local costCount = math.max(#self._moveRoads-restCount, 0) --需要消耗粮草的格数
        self._foodCost = costCount*tonumber(parameterContent.content)
    end

    -- self._moveResource:setTextColorToDTypeColor()
    self._moveResource:updateUI( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD,  self._foodCost)
    local myFood =  UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)
    if myFood < self._foodCost then
        self._moveResource:setTextColor(Colors.getMineStateColor(3))
    else
        self._moveResource:setTextColor(Colors.getMineStateColor(1))
    end
    -- self._moveResource:showResName(true, Lang.get("mine_cost_food"))
end

function PopupGrainCar:_moveInGold()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, self._moveGold)
    if not success then
        return 
    end
    G_UserData:getMineCraftData():c2sSettleMine(self._moveRoads)
    self:closeWithAction()
end

function PopupGrainCar:_getBuyString()
    local maxValue = tonumber(require("app.config.parameter").get(G_ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxValue = (maxValue + soilderAdd)
    end
    local str = ""
    local food, money, needFood = MineCraftHelper.getBuyArmyDetail()
    if food and money then 
        str = Lang.get("mine_not_50_army", {count1 = food, count2 = money, count3 = maxValue})
    elseif food then 
        str = Lang.get("mine_not_50_army_food", {count = food, count1 = maxValue})
    elseif money then 
        str = Lang.get("mine_not_50_army_gold", {count = money, count1 = maxValue})
    end
    return str, money, needFood
end

function PopupGrainCar:_buyArmy(count, money)
    if money then
        local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money)
        if not success then
            return 
        end
    end
    G_UserData:getMineCraftData():c2sMineBuyArmy(count)    
end

--播放攻击动画
function PopupGrainCar:_playAttackAnimation(awards, hurt, army, desc_army)
    self._imageMatchSuccess:setVisible(true)
    self._imageMatchSuccess:setOpacity(230)
    self._commonNodeBk:setCloseVisible(false)
    local function effectFunction(effect)
		if effect == "wanjia1" then
			local node1 = GrainCarAttackLeftPanel.new()
			node1:updateUI(army)
            return node1
		elseif effect == "wanjia2" then
			local node2 = GrainCarAttackRightPanel.new()
			node2:updateUI(self._curAtkCarUnit)
            return node2
        elseif effect == "hit1" then
			local node = warringHurtHP.new()
			node:updateUI(-1 * desc_army)
            return node
        elseif effect == "hit2" then
			local node = warringHurtHP.new()
			node:updateUI(-1 * hurt)
            return node
		end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._imageMatchSuccess:setVisible(false)
            self._commonNodeBk:setCloseVisible(true)
            local name = self._curAtkCarUnit:getConfig().name
            -- G_Prompt:showTip(Lang.get("grain_car_attack_success", {name = name, hurt = self._hurt}))
            G_Prompt:showAwards(awards)
        end
    end
    self._centerNode:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._centerNode, "moving_kuafujuntuanzhan", effectFunction, eventFunction , false)
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCar:_onButtonClose()
	self:close()
end

--guildSelector回调
function PopupGrainCar:_onSelectorCallback(guildId)
    self._guildSelector:close()
	self._scroll:scroll2Guild(guildId)
end

--迁入
function PopupGrainCar:_onBtnMoveInClick()
    local selfMineId = G_UserData:getMineCraftData():getSelfMineId()
   
    local myArmy = G_UserData:getMineCraftData():getMyArmyValue()
    --兵力不足，且在主城
    if myArmy < MineCraftHelper.ARMY_TO_LEAVE and G_UserData:getMineCraftData():getMyMineConfig().pit_type == MineCraftHelper.TYPE_MAIN_CITY then 
        local strBuy, money, needFood = self:_getBuyString()
        local popupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("mine_not_army_title"), strBuy, function ()
            self:_buyArmy(needFood, money)
        end)
        popupSystemAlert:setCheckBoxVisible(false)
        popupSystemAlert:openWithAction()
        return
    end

    --缺粮草
    local nowFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD)
    if nowFood < self._foodCost then 
        local title = Lang.get("mine_no_food")
        local goldToFood = tonumber(require("app.config.parameter").get(ParameterIDConst.MINE_GOLD_TO_FOOD).content)
        self._moveGold = goldToFood * (self._foodCost - nowFood)
        local strContent = Lang.get("mine_run_gold", {count = self._foodCost - nowFood, countmoney = self._moveGold})
        local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, strContent, handler(self, self._moveInGold))
        popupSystemAlert:setCheckBoxVisible()
        popupSystemAlert:openWithAction()

        --[[local itemValue = DataConst.getItemIdByResId(DataConst.RES_ARMY_FOOD)--取出资源对应的道具类型
        local popup = require("app.ui.PopupItemBuyUse").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, itemValue)
		popup:openWithAction()]]
    else
        G_UserData:getMineCraftData():c2sSettleMine(self._moveRoads)
        self:closeWithAction()
    end
end

function PopupGrainCar:_onSettleMine()
    G_Prompt:showTip(Lang.get("mine_food_cost_count", {count = self._foodCost}))
end

function PopupGrainCar:_onEventMineRespond(eventName, oldMineId, newMineId)
    self._mineData = G_UserData:getMineCraftData():getMineDataById(self._mineData:getId())
    -- self._scroll:setDataDirty()
    if oldMineId == self._mineData:getId() or newMineId == self._mineData:getId() then
        self._scroll:updateLayout()
    end
    -- self._guildSelector:updateUI()
end

--攻击
function PopupGrainCar:_onEventBattleMine(eventName, message)
    local myEndArmy = message.self_begin_army - message.self_red_army
    if myEndArmy <= 0 then 
        self:close()
        return
    end
    -- self._scroll:updateLayout()
end

--扫荡
function PopupGrainCar:_onFastBattle()
    if G_UserData:getMineCraftData():getSelfMineId() ~= self._mineData:getId() then 
        self:closeWithAction()
        return
    end
    self._scroll:updateLayout()
end

--粮车变更通知 （攻击后改变血量等）
function PopupGrainCar:_onEventGrainCarNotify(eventName, carUnit)
    if carUnit and carUnit:isInMine(self._mineData:getId()) then
        self._scroll:updateCar(carUnit)
    end
end

--攻击粮车
function PopupGrainCar:_onEventGrainCarAttack(event, awards, hurt, army, desc_army)
    self._hurt = hurt
    self._awards = awards
    self:_playAttackAnimation(awards, hurt, army, desc_army)
    self._scroll:updateLayout()
end

--点击了框内的某个粮车
function PopupGrainCar:_onEventGrainCarClicked(eventName, carUnit)
    self._curAtkCarUnit = carUnit
    if self._mineData:getId() ~= G_UserData:getMineCraftData():getSelfMineId() then
        G_Prompt:showTip(Lang.get("mine_diff_mine"))
        return
    end
    if carUnit:getStamina() <= 0 then
        G_Prompt:showTip(Lang.get("grain_car_has_broken")) --粮车已损坏
        return
    end

    if G_UserData:getMineCraftData():getMyArmyValue() < GrainCarConfigHelper.getGrainCarAttackLose() then
        G_Prompt:showTip(Lang.get("grain_car_not_enough_army")) --当前兵力小于2
        return
    end
    
    if not carUnit:isInMine(self._mineData:getId()) then
        G_Prompt:showTip(Lang.get("grain_car_has_left"))
        self._scroll:updateLayout()
        return
    end

    local canAttack, nextAtkTime = GrainCarDataHelper.canAttackGrainCar()
    if not canAttack then
        G_Prompt:showTip(Lang.get("grain_car_attack_CD"))
        return
    end

    self._scroll:setAtkFocusedGuild(carUnit:getGuild_id())
    G_UserData:getGrainCar():c2sAttackGrainCar(carUnit:getGuild_id(), self._mineData:getId())
end

--粮车进站变动通知
function PopupGrainCar:_onEventMoveCarNotify(eventName, newCarUnit)
    local curPit = newCarUnit:getCurPit()
    if curPit == self._mineData:getId() then
        self._scroll:updateLayout()
    end
end


return PopupGrainCar