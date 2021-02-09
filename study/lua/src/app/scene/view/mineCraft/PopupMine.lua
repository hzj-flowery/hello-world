local PopupBase = require("app.ui.PopupBase")
local PopupMine = class("PopupMine", PopupBase)

local PopupMineNode = require("app.scene.view.mineCraft.PopupMineNode")
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

PopupMine.MINE_FIX = 0     --每个矿的基准x坐标0点
PopupMine.MINE_SPACE = 220
PopupMine.POS_LINE_Y = 
{
    400, 260, 120
}
PopupMine.MINE_COUNT_LINE = 3       --每行3个

function PopupMine:waitEnterMsg(callBack, mineId)
	local function onMsgCallBack(id, message)
		callBack()
    end

    -- local configData = G_UserData:getMineCraftData():getMineConfigById(mineId)
    -- if not G_UserData:getMineCraftData():isMineHasUser(mineId) or configData.pit_type == 2 then
    --     G_UserData:getMineCraftData():c2sEnterMine(mineId)
    --     local signal = G_SignalManager:add(SignalConst.EVENT_ENTER_MINE, onMsgCallBack)
    --     return signal
    -- else 
    --     callBack()
    -- end

    G_UserData:getMineCraftData():c2sEnterMine(mineId)
    local signal = G_SignalManager:add(SignalConst.EVENT_ENTER_MINE, onMsgCallBack)
    return signal
end

function PopupMine:ctor(data)
	self._data = data
    self._config = data:getConfigData()
    self._page = nil
    self._dataIndex = 0
    
    self._mineUsers = {}
    self._signalEnterMine = nil
    self._signalSettleMine = nil
    self._signalBattleMine = nil
    self._signalGetMineWorld = nil
    self._signalMineRespond = nil
    self._singalFastBattle = nil

    self._foodCost = 0

    -- self._isFirstEnter = true

	local resource = {
		file = Path.getCSB("PopupMine", "mineCraft"),
		binding = {
			_btnPagePrev = {
				events = {{event = "touch", method = "_onPagePrevClick"}}
			},
            _btnPageNext = {
                events = {{event = "touch", method = "_onPageNextClick"}}
            },
            _btnMoveIn = {
                events = {{event = "touch", method = "_onBtnMoveInClick"}}
            },
		}
    }
    self:setName("PopupMine")
	PopupMine.super.ctor(self, resource)
end

function PopupMine:onCreate()
    self._popBG:addCloseEventListener(handler(self,self.closeWithAction))
    self._popBG:setTitle(self._config.pit_name)

    local background = Path.getBackground(self._config.pit_bg)
    self._imageBG:loadTexture(background)

    self:_createMineNode()
    self._btnMoveIn:setString(Lang.get("mine_move_in"))

    for i = 1, 3 do 
        self["_imageInfo"..i]:setLocalZOrder(1)
    end

    if self._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY then
        self._imageOutput:setVisible(false)
    end

    self._imageState:ignoreContentAdaptWithSize(true)

    self:_updatePeaceNode()
end

function PopupMine:onEnter()
    self._signalEnterMine = G_SignalManager:add(SignalConst.EVENT_ENTER_MINE, handler(self, self._enterMine))
    self._signalSettleMine = G_SignalManager:add(SignalConst.EVENT_SETTLE_MINE, handler(self, self._settleMine))
    self._signalBattleMine = G_SignalManager:add(SignalConst.EVENT_BATTLE_MINE, handler(self, self._onEventBattleMine))
    self._signalGetMineWorld = G_SignalManager:add(SignalConst.EVENT_GET_MINE_WORLD, handler(self, self._onEventGetMineWorld))
    self._signalMineRespond = G_SignalManager:add(SignalConst.EVENT_GET_MINE_RESPOND, handler(self, self._onEventMineRespond))
    self._singalFastBattle = G_SignalManager:add(SignalConst.EVENT_FAST_BATTLE, handler(self, self._onFastBattle))
    self._signalGrainCarMoveNotify = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(self, self._onEventGrainCarMoveNotify))
    --self._signalUseItemMsg = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem)) -- 刷新粮草令
    local showPage = self:_getMyPage() or 1
    self:_refreshUserPage(showPage)
    self:_refreshData()
    self:_refreshRoadCost()

    if self._data:getMultiple() > 1 then 
        local doubleId = self._data:getMultiple()
        local pic = Path.getMineDoubleImg(doubleId-1)
        self._imageDouble:setVisible(true)
        self._imageDouble:loadTexture(pic)
    else 
        self._imageDouble:setVisible(false)
    end
end

function PopupMine:onExit()
    self._signalEnterMine:remove()
    self._signalEnterMine = nil	
    self._signalSettleMine:remove()
    self._signalSettleMine = nil
    self._signalBattleMine:remove()
    self._signalBattleMine = nil
    self._signalGetMineWorld:remove()
    self._signalGetMineWorld = nil
    self._signalMineRespond:remove()
    self._signalMineRespond = nil
    self._singalFastBattle:remove()
    self._singalFastBattle = nil
    self._signalGrainCarMoveNotify:remove()
    self._signalGrainCarMoveNotify = nil
    --self._signalUseItemMsg:remove()
    --self._signalUseItemMsg = nil
end

function PopupMine:_onPagePrevClick()
    self._page = self._page - 1
    self:_refreshUserPage()
end

function PopupMine:_onPageNextClick()
    self._page = self._page + 1
    self:_refreshUserPage()
end

function PopupMine:_getBuyString()
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

function PopupMine:_buyArmy(count, money)
    if money then
        local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money)
        if not success then
            return 
        end
    end
    G_UserData:getMineCraftData():c2sMineBuyArmy(count)    
end

function PopupMine:_onBtnClose()
    self:closeWithAction()
end

function PopupMine:_onBtnMoveInClick()
    local selfMineId = G_UserData:getMineCraftData():getSelfMineId()
    if myMineId == self._data:getId() then  --已经在这个矿里面了
        G_Prompt:showTip(Lang.get("mine_already_in"))
        return
    end

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

function PopupMine:_moveInGold()
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, self._moveGold)
    if not success then
        return 
    end
    G_UserData:getMineCraftData():c2sSettleMine(self._moveRoads)
    self:closeWithAction()
end

function PopupMine:_createMineNode()
    for i = 1, #PopupMine.POS_LINE_Y do 
        for j = 1, PopupMine.MINE_COUNT_LINE do 
            local popupMineNode = PopupMineNode.new(self._data)
            self._nodeBase:addChild(popupMineNode)
            local posX = self._config["position_x_"..i] + PopupMine.MINE_FIX + PopupMine.MINE_SPACE*(j-1)
            local posY = PopupMine.POS_LINE_Y[i]
            popupMineNode:setPosition(cc.p(posX, posY))
            table.insert(self._mineUsers, popupMineNode)
        end
    end
end

function PopupMine:_refreshUserPage(page)
    if page then
        self._page = page 
    end
    local curTotalPageCount, totalPageCount = self:_getTotalPage()
    if self._page > totalPageCount then 
        self._page = totalPageCount
    end
    local userList = self._data:getUsers()
    local beginCount, pageUserCount = self:_getPageBegin(self._page)
    local needGet = false
    -- 下一页不是末尾，并且不满9个
    if self._page==curTotalPageCount and #userList%pageUserCount>0 then
        needGet = true
    end
    -- 当前页不满9个
    if self._page>curTotalPageCount then
        needGet = true
        if #userList%pageUserCount>0 then
            self._page = math.max(0, self._page-1)
        end
    end
    if self._page==totalPageCount then
        needGet = false
    end
    if needGet then  -- 请求下一数据页
        if not self._data:isRequestData() then
            self._dataIndex = self._dataIndex+1
            G_UserData:getMineCraftData():c2sEnterMine(self._data:getId(), self._dataIndex)
        end
        return
    end
    local mineCount = 1
    for i = beginCount, beginCount+pageUserCount-1 do 
        local user = userList[i]
        self._mineUsers[mineCount]:refreshUserData(user)
        mineCount = mineCount + 1
    end

    self._btnPagePrev:setVisible(true)
    self._btnPageNext:setVisible(true)
    if self._page == 1 then 
        self._btnPagePrev:setVisible(false)
    end
    if self._page == totalPageCount then 
        self._btnPageNext:setVisible(false)
    end

    self._textPageNum:setString(self._page.."/"..totalPageCount)
end

function PopupMine:_getTotalPage()
    local pageUserCount = PopupMine.MINE_COUNT_LINE * #PopupMine.POS_LINE_Y
    local curTotalPageCount = math.ceil(#self._data:getUsers() / pageUserCount)     -- 本地数据
    local totalPageCount = curTotalPageCount
    if self._config.pit_type ~= MineCraftHelper.TYPE_MAIN_CITY then 			-- 矿区根据usercnt分页
        totalPageCount = math.ceil(self._data:getUserCnt() / pageUserCount)       -- 所有数据
    end
    if curTotalPageCount == 0 then 
        curTotalPageCount = 1
    end
    if totalPageCount == 0 then
        totalPageCount = 1
    end
    return curTotalPageCount, totalPageCount
end

function PopupMine:_getMyPage()
    -- local userList = self._data:getUsers()
    -- for pos = 1, #userList do 
    --     if userList[pos]:getUser_id() == G_UserData:getBase():getId() then 
    --         return pos
    --     end
    -- end
    return 1 --我永远排在第一个
end

function PopupMine:_getPageBegin(pageCount)
    local pageUserCount = PopupMine.MINE_COUNT_LINE * #PopupMine.POS_LINE_Y
    return (pageCount - 1) * pageUserCount + 1, pageUserCount
end

function PopupMine:_enterMine()
    self:_refreshUserPage()
    self:_refreshData()
end

function PopupMine:_settleMine()
    G_Prompt:showTip(Lang.get("mine_food_cost_count", {count = self._foodCost}))
end

function PopupMine:_refreshData()

    for i = 1, 3 do 
        self["_imageInfo"..i]:setVisible(false)
    end
    local change, add, onlyAdd, minus, outputDay, strOutputDay, des = MineCraftHelper.getOutputDetail(self._data:getId())
    self._resourceOutput:setTextCountSize(MineCraftHelper.RESOURCE_FONT_SIZE)
    self._resourceOutput:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, strOutputDay)
    self._resourceOutput:setTextColor(Colors.getMineStateColor(1))

    self:_refreshGuildState()
    self:_updateMineInfo(add, onlyAdd, minus, des)
    self:_updateStateNode(change)
    self:_updateMineState(change)
    self:_updatePeaceNode()

    if self._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY then
        self._imageInfo1:setVisible(true)
        self._imageInfo2:setVisible(false)
        self._imageInfo3:setVisible(false)
        self._textInfo1:setString(Lang.get("mine_no_output"))
        self._textInfo1:setColor(Colors.getMineInfoColor(1))
    end
end

function PopupMine:_refreshGuildState()
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    local guildId = self._data:getGuildId()
    if guildId ~= 0 then 
        self._textGuildName:setString(self._data:getGuildName())
        if myGuildId ~= guildId then 
            self._textGuildName:setColor(Colors.getMineGuildColor(2))
        else
            self._textGuildName:setColor(Colors.getMineGuildColor(1))
        end
    else
        self._textGuildName:setColor(Colors.getMineGuildColor(1))
        self._textGuildName:setString(Lang.get("mine_no_guild"))
    end

    if self._data:isOwn() then 
        self._imageState:setVisible(true)
        self._imageState:loadTexture(Path.getMineNodeTxt("img_mine_occupy02"))
    elseif self._data:getGuildId() ~= 0 then 
        self._imageState:setVisible(true)
        self._imageState:loadTexture(Path.getMineNodeTxt("img_mine_occupy01"))
    else
        self._imageState:setVisible(false)
    end
    local iconX = self._textGuildName:getPositionX() - self._textGuildName:getContentSize().width/2 - 10
    self._imageState:setPositionX(iconX)
end

function PopupMine:_updateMineInfo(add, addOnly, minus, des)
    for i = 1, 3 do 
        self["_imageInfo"..i]:setVisible(true)
    end
    if not self._data:isMyGuildMine() then 
        add = 0
        addOnly = 0
    end
    local titleIndex = 1
    if add == 0 then 
        local parameterContent = Parameter.get(ParameterIDConst.MINE_OUTPUT_ADD)
        assert(parameterContent, "not id, "..ParameterIDConst.MINE_OUTPUT_ADD)
        local showAdd = (tonumber(parameterContent.content)) / 10
        self._textInfo1:setString(Lang.get("mine_guild_state_show", {count = showAdd}))
        self._textInfo1:setColor(Colors.getMineInfoColor(4))
    else 
        self._textInfo1:setString(Lang.get("mine_same_guild", {count = add}))
        self._textInfo1:setColor(Colors.getMineInfoColor(1))
    end

    if addOnly == 0 then 
        local parameterContent = Parameter.get(ParameterIDConst.MINE_ONLY_GUILD)
        assert(parameterContent, "not id, "..ParameterIDConst.MINE_ONLY_GUILD)
        local showAdd = (tonumber(parameterContent.content)) / 10
        self._textInfo2:setString(Lang.get("mine_own_state_show", {count = showAdd}))
        self._textInfo2:setColor(Colors.getMineInfoColor(4))
    else 
        self._textInfo2:setString(Lang.get("mine_only_guild", {count = addOnly}))
        self._textInfo2:setColor(Colors.getMineInfoColor(1))
    end

    self._imageInfo3:setVisible(false)
    if minus ~= 0 then    
        self._textInfo3:setString(Lang.get("mine_state", {state = des, count = minus}))
        self._textInfo3:setColor(Colors.getMineInfoColor(3))
        self._imageInfo3:setVisible(true)
    end
end

function PopupMine:_updateStateNode(finalCount)
    if not self._data:isMyGuildMine() then
        self._nodeOutput:setVisible(false)
        return
    end
    self._textOutputState:setString("(  "..finalCount.."%)")
    local posX = self._resourceOutput:getPositionX() + self._resourceOutput:getContentWidth()
    self._nodeOutput:setPositionX(posX)
    self._imageDown:setVisible(false)
    self._imageUp:setVisible(false)
    if finalCount < 0 then 
        self._nodeOutput:setVisible(true)
        self._imageDown:setVisible(true)
        self._imageDown:setPositionX(self._textOutputState:getPositionX())
        self._textOutputState:setColor(Colors.getMineInfoColor(3))
    elseif finalCount > 0 then 
        self._nodeOutput:setVisible(true)
        self._imageUp:setVisible(true)
        self._imageUp:setPositionX(self._textOutputState:getPositionX())
        self._textOutputState:setColor(Colors.getMineInfoColor(1))
    else
        self._nodeOutput:setVisible(false)
    end
end

function PopupMine:_updateMineState(finalCount)
    self._textMineOutputState:setString("(  "..finalCount.."%)")
    local posX = self._textGuildName:getPositionX() + self._textGuildName:getContentSize().width/2
    self._nodeMineOutput:setPositionX(posX)
    self._imageMineDown:setVisible(false)
    self._imageMineUp:setVisible(false)
    if finalCount < 0 then 
        self._nodeMineOutput:setVisible(true)
        self._imageMineDown:setVisible(true)
        self._imageMineDown:setPositionX(self._textMineOutputState:getPositionX())
        self._textMineOutputState:setColor(Colors.getMineInfoColor(3))
    elseif finalCount > 0 then 
        self._nodeMineOutput:setVisible(true)
        self._imageMineUp:setVisible(true)
        self._imageMineUp:setPositionX(self._textMineOutputState:getPositionX())
        self._textMineOutputState:setColor(Colors.getMineInfoColor(1))
    else
        self._nodeMineOutput:setVisible(false)
    end
end

function PopupMine:_refreshRoadCost()
    local selfMineId = G_UserData:getMineCraftData():getSelfMineId()
    if self._data:getId() == selfMineId then 
        self._moveResource:updateUI( TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD,  0)
        self._moveResource:setTextColor(Colors.getMineStateColor(1))
        self._btnMoveIn:setEnabled(false)
        return
    end
    self._moveRoads = MineCraftHelper.getRoad2(selfMineId, self._data:getId())
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

--攻击
function PopupMine:_onEventBattleMine(eventName, message)
    local myEndArmy = message.self_begin_army - message.self_red_army
    if myEndArmy <= 0 then 
        self:close()
    end
end

function PopupMine:_onEventGetMineWorld()
    self:_refreshData()
end

function PopupMine:_onEventMineRespond(eventName, oldMineId, newMineId)
    -- if newMineId and newMineId == self._data:getId() then 
    --     G_UserData:getMineCraftData():c2sEnterMine(self._data:getId())
    -- elseif oldMineId == self._data:getId() then
    --     self:_refreshUserPage()
    --     self:_refreshData()
    -- end

    self._data = G_UserData:getMineCraftData():getMineDataById(self._data:getId())

    -- if oldMineId == self._data:getId() or newMineId == self._data:getId() then
        self:_refreshUserPage()
        self:_refreshData()
    -- end
end

function PopupMine:_onFastBattle()
    if G_UserData:getMineCraftData():getSelfMineId() ~= self._data:getId() then 
        self:closeWithAction()
    end
end

function PopupMine:_updatePeaceNode()
	self._nodePeaceEffect:removeAllChildren()
    if not self._data:isPeace() then
        return
    end
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_kuangzhan_hepingguang" then
			local subEffect = EffectGfxNode.new("effect_kuangzhan_hepingguang")
            subEffect:play()
            return subEffect
        elseif effect == "effect_kuangzhan_hepingguangqi" then
            local subEffect = EffectGfxNode.new("effect_kuangzhan_hepingguangqi")
            subEffect:play()
            return subEffect
        elseif effect == "effect_bianshenka_xx" or 
                effect == "effect_bianshenka_copy1" or 
                effect == "effect_bianshenka_copy2" then
            local subEffect = EffectGfxNode.new("effect_bianshenka_xx")
            subEffect:play()
            return subEffect
		else
			return cc.Node:create()
		end
    end
    local function eventFunction(event)
		if event == "finish" then
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodePeaceEffect, "moving_kuangzhan_hepingqizi", effectFunction, eventFunction , false )
end

--粮车变更通知 （攻击后改变血量等）
function PopupMine:_onEventGrainCarMoveNotify(eventName, carUnit)
    if carUnit:isInMine(self._data:getId()) then
        self:_openGrainCarDialog()
    end
end

--打开粮车界面
function PopupMine:_openGrainCarDialog()
    self:closeWithAction()
    G_SignalManager:dispatch(SignalConst.EVENT_GRAIN_CAR_CAR_INTO_MINE, self._data)
end

--[[function PopupMine:_onEventUseItem()
    self:_refreshRoadCost()
end]]


return PopupMine

