-- @Author panhoa
-- @Date 11.22.2018
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local TabScrollView = require("app.utils.TabScrollView")
local CustomActivityFundsView = class("CustomActivityFundsView", ViewBase)
local CustomActivityConst = require("app.const.CustomActivityConst")
local CustomActivityFundsHelper = require("app.scene.view.customactivity.CustomActivityFundsHelper")
local CustomActivityMonthFundsCell = require("app.scene.view.customactivity.CustomActivityMonthFundsCell")
local CustomActivityWeekFundsCell = require("app.scene.view.customactivity.CustomActivityWeekFundsCell")
local CustomActivityWeekFundsV2Cell = require("app.scene.view.customactivity.CustomActivityWeekFundsV2Cell")
local SeasonSportConst = require("app.const.SeasonSportConst")


function CustomActivityFundsView:ctor()
    self._imageBack            = nil -- 月/周底部背景图 
    self._textActivedCountDown = nil -- 活动倒计时
    self._btnActive            = nil
    self._scrollList           = nil
    self._scrollView           = nil
    self._textActivedDesc      = nil -- 活动描述

    self._fundsType            = 1101-- fundsType(quest_type)
    self._countDownTime        = 0   -- 倒计时
    self._fundsData            = {}  -- 当前组基金数据
    self._curSelectDay         = 1   -- 选中当前天
    self._actId                = 0   -- 活动Id
    self._questId              = 0   -- 任务Id
    self._fundsSignedData      = {}  -- 领奖状态
    self._signedDay            = 0   -- 已激活时间
    self._curFundsSigned       = false -- 当前签到记录（空值即未购买
    self._weekV2CellList       = {}  -- V2周基金Cell
    
    local resource = {
        file = Path.getCSB("CustomActivityFundsView", "customactivity"),
        size = G_ResolutionManager:getDesignSize(),
      	binding = {
			_btnActive = {
				events = {{event = "touch", method = "_onActive"}}
            },
            _btnActiveV2 = {
				events = {{event = "touch", method = "_onActive"}}
			}
		},
    }
    CustomActivityFundsView.super.ctor(self, resource)
end

function CustomActivityFundsView:onCreate()
end

function CustomActivityFundsView:onEnter()
    self._listnerFundsRewards = G_SignalManager:add(SignalConst.EVENT_FUNDS_REWARDS, handler(self, self._onFundsRewards))	 -- 领取奖励
    self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0.5)
end

function CustomActivityFundsView:onExit()
    self._listnerFundsRewards:remove()
    self._listnerFundsRewards = nil
end

function CustomActivityFundsView:_onActive()
    local payCfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(self._curActivePay)
    G_GameAgent:pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name)
end

function CustomActivityFundsView:_onFundsRewards(id, message)
    --[[if rawget(message, "awards") ~= nil then
        dump(message.awards)
        G_Prompt:showAwards(message.awards)
    end]]

    if self._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2 then
        self:_updateListView()
    else
        self:_initAwardCells()
    end
end

----------------------------------------------------------------------
-- Init
function CustomActivityFundsView:refreshView(customActUnitData)
    self._imagePurchased:setVisible(false)
    self._imagePurchasedV2:setVisible(false)
    self._countDownTime = customActUnitData:getEnd_time()
    self._actId = customActUnitData:getAct_id()

    local questData = G_UserData:getCustomActivity():getActTaskUnitDataForFundsById(self._actId)
    if questData ~= nil then
        local data = table.values(questData)[1]
        self._fundsType = data:getQuest_type()
        self._curActivePay = data:getParam2()
        self._curFundsGroup = data:getParam3()
        self._questId = table.keys(questData)[1]
        local curFundsSignedData= G_UserData:getCustomActivity():getActTaskDataById(self._actId, self._questId)
        local mask = table.nums(curFundsSignedData.valueMap_) >= 0 and curFundsSignedData.valueMap_[1] or 0 
        self._curFundsSigned = table.nums(curFundsSignedData.valueMap_) > 0
        self._signedDay = math.ceil(math.abs(G_ServerTime:getLeftSeconds(curFundsSignedData.time2_)) / CustomActivityConst.FUNDS_ONEDAY_TIME)
        self._fundsSignedData = bit.tobits(mask)
        
        if self._curFundsSigned then
            self._countDownTime = (curFundsSignedData.time2_ + 
            (table.nums(G_UserData:getCustomActivity():getFundsByGroupId(self._curFundsGroup)) + 1) * CustomActivityConst.FUNDS_ONEDAY_TIME)
        end
      
        self:_initData()
        self:_initView()
        self:_updateUI()
    end
end

-- @Role    Init scrollData
function CustomActivityFundsView:_initData()
    self._fundsData = G_UserData:getCustomActivity():getFundsByGroupId(self._curFundsGroup)
end

-- @Role    Show View By type of Funds
function CustomActivityFundsView:_initView()
    -- body
    local bVisible = (self._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2)
    --self._panelTop:setVisible(not bVisible)
    --self._panelCenter:setVisible(not bVisible)
    --self._panelTopV2:setVisible(bVisible)
    --self._panelCenterV2:setVisible(bVisible)
    --self._panelBottomV2:setVisible(bVisible)

    self._nodeMonthFund:setVisible(not bVisible)
    self._nodeWeeKV2:setVisible( bVisible)
end

-- @Role    UpdateData
function CustomActivityFundsView:_updateUI()
    -- body
    if self._fundsData == nil or table.nums(self._fundsData) <= 0 then
        return
    end
    if self._fundsType == CustomActivityConst.FUNDS_TYPE_WEEKV2 then
        self._textDesc:setString(Lang.get("funds_actived_weekV2desc"))
        self._imageBackWeekV2:loadTexture(Path.getCustomActivityUI(self._fundsData[1].background))
        self._imageBackWeekV2:ignoreContentAdaptWithSize(true)
        self:_initListBottomView()
        self:_initListview()
    else
        --self:_initScrollOffsetY()
        --self:_initScrollview()
        self:_initScrollTopView()
        self:_initAwardCells()
        --self:_updateScrollView()
    end
end

-------------------------------------------------------------------------------------------
-- @Role    Init scrollView
function CustomActivityFundsView:_initScrollview()
    local scrollViewParam = {}
    if self._fundsType == CustomActivityConst.FUNDS_TYPE_WEEK then
        scrollViewParam.template = CustomActivityWeekFundsCell
        self._cellMaxItemsNum = CustomActivityConst.FUNDS_WEEKITEMNUM_NORAML
        self._textActivedDesc:setString(Lang.get("funds_actived_weekdesc"))
    elseif self._fundsType == CustomActivityConst.FUNDS_TYPE_MONTH then
        scrollViewParam.template = CustomActivityMonthFundsCell
        self._cellMaxItemsNum = CustomActivityConst.FUNDS_MONTHITEMNUM
        self._textActivedDesc:setString(Lang.get("funds_actived_monthdesc"))
    end
    
    scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
    scrollViewParam.selectFunc = handler(self, self._onCellSelected)
    scrollViewParam.touchFunc = handler(self, self._onItemTouch)
	self._scrollList = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function CustomActivityFundsView:_createListData(index, value)
    -- body
    local cellData = value
    cellData.isCurSelected = (self._curSelectDay == index)
    cellData.isActived = self._curFundsSigned
    cellData.canSignedDay = index <= self._signedDay
    if table.nums(self._fundsSignedData) > 0 and self._fundsSignedData[index] ~= nil then
        cellData.canGet = self._fundsSignedData[index]
    else
        cellData.canGet = self._curFundsSigned and 0 or 3
    end
    return cellData
end

-- @Role    Init ListView
function CustomActivityFundsView:_initListview()
    -- body
    self._listView:removeAllChildren()
    for index, value in ipairs(self._fundsData) do
        local cell = CustomActivityWeekFundsV2Cell.new(handler(self, self._rewardWeekV2))
        local cellData = self:_createListData(index, value)
        cell:updateUI(cellData)
        cell:setName("weekFundsV2Cell"..index)
        self._listView:pushBackCustomItem(cell)
    end
    self._listView:adaptWithContainerSize()
    local contentsize = self._listView:getInnerContainerSize()
    self._listView:setContentSize(contentsize)
end

-- @Role    UpdateList
function CustomActivityFundsView:_updateListView()
    -- body
    for index, value in ipairs(self._fundsData) do
        local cell = self._listView:getChildByName("weekFundsV2Cell"..index)
        if cell ~= nil then
            local cellData = self:_createListData(index, value)
            cell:updateUI(cellData)
        end
    end
end

-- @Role    周基金界面要适配滑动窗口
function CustomActivityFundsView:_initScrollOffsetY()
    if self._fundsType == CustomActivityConst.FUNDS_TYPE_MONTH then
        return
    end
    self._scrollView:setPositionY(CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY)
    self._panelCenter:setPositionY(CustomActivityConst.FUNDS_WEEK_PANELPOSITIONY)
    self._scrollView:setContentSize(cc.size(self._scrollView:getContentSize().width, 
                                            CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY))
    self._panelCenter:setContentSize(cc.size(self._panelCenter:getContentSize().width,  
                                            CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY))
end

-- @Role    Init TopView
function CustomActivityFundsView:_initScrollTopView()
    local fundsType = (math.fmod(self._fundsType, CustomActivityConst.FUNDS_TYPE_WEEK) + 1)
    local CustomActivityFundsHelper = require("app.scene.view.customactivity.CustomActivityFundsHelper")
    local cfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(self._curActivePay)
    
    self._imagePurchased:setVisible(self._curFundsSigned)
    self._btnActive:setVisible(not self._curFundsSigned)
    self._btnActive:setString(Lang.get("funds_active", {rmb = cfg.rmb}))
    self._imageBack:loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_BACKGROUND[fundsType]))
    self._imageBack:ignoreContentAdaptWithSize(true)
end

-- @Role    Init TopView
function CustomActivityFundsView:_initListBottomView()
    local fundsType = (math.fmod(self._fundsType, CustomActivityConst.FUNDS_TYPE_WEEK) + 1)
    local CustomActivityFundsHelper = require("app.scene.view.customactivity.CustomActivityFundsHelper")
    local cfg = CustomActivityFundsHelper.getVipPayConfigByIdOrderId(self._curActivePay)
    
    self._imagePurchasedV2:setVisible(self._curFundsSigned)
    self._btnActiveV2:setVisible(not self._curFundsSigned)
    self._btnActiveV2:setString(Lang.get("funds_active", {rmb = cfg.rmb}))
end

function CustomActivityFundsView:_initAwardCells()
    if self._fundsData == nil or table.nums(self._fundsData) <= 0 then
        return
    end

    local cellData = {}

    for index = 1, 5 do 
        local itemData = self._fundsData[index]
        if itemData ~= nil then
            itemData.isCurSelected = (self._curSelectDay == index)
            itemData.isActived = self._curFundsSigned
            itemData.canSignedDay = index <= self._signedDay
            if table.nums(self._fundsSignedData) > 0 and self._fundsSignedData[index] ~= nil then
                itemData.canGet = self._fundsSignedData[index]
            else
                itemData.canGet = self._curFundsSigned and 0 or 3
            end

            self:_initOneCell(itemData, index)
        end
    end
end

function CustomActivityFundsView:_updateEffect(index, state)
    local selectedFlash = self["_effectNode"..index]:getChildByName("flash_effect"..index)
    if selectedFlash == nil then
        local lightEffect = require("app.effect.EffectGfxNode").new(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[1])
        lightEffect:setAnchorPoint(0, 0)
        lightEffect:play()
        lightEffect:setScale(1.1)
        lightEffect:setVisible(state == 0)
        lightEffect:setName("flash_effect"..index)
        self["_effectNode"..index]:addChild(lightEffect)
        lightEffect:setPosition(self["_effectNode"..index]:getContentSize().width* 0.5,
                                self["_effectNode"..index]:getContentSize().height * 0.5 + 1)
    else
        selectedFlash:setVisible(state == 0)
    end
end


function CustomActivityFundsView:_initOneCell (data, index)
    if data == nil then
        return
    end

    --dump(data)

    self["_awardIcon"..index]:unInitUI()
    self["_awardIcon"..index]:initUI(data.reward_type_1, data.reward_value_1, data.reward_size_1)

    if data.isActived and data.canSignedDay then
        self:_updateEffect(index, data.canGet)
        self["_awardIcon"..index]:setIconMask(data.canGet == 1)
        self["_awardIcon"..index]:setTouchEnabled(data.canGet == 1)
        self["_imgGot"..index]:setVisible(data.canGet == 1)
        self["_labelDays"..index]:setVisible(data.canGet == 0)
        self["_panelTouch"..index]:setVisible(data.canGet == 0)
    else
        self:_updateEffect(index, 1)
        self["_awardIcon"..index]:setIconMask(false)
        self["_awardIcon"..index]:setTouchEnabled(true)
        self["_imgGot"..index]:setVisible(false)
        self["_labelDays"..index]:setVisible(true)
        self["_panelTouch"..index]:setVisible(false)
    end

    local param = self["_awardIcon"..index]:getItemParams()
    self["_labelName"..index]:setString(param.name)
    self["_labelName"..index]:setColor(param.icon_color)

    self["_panelTouch"..index]:setTag(data.day)
    self["_panelTouch"..index]:setEnabled(true)
    self["_panelTouch"..index]:setSwallowTouches(false)
    self["_panelTouch"..index]:setTouchEnabled(true)
    self["_panelTouch"..index]:addClickEventListenerEx(handler(self, self._onItemTouch))
end
----------------------------------------------------------------------------------------------------
-- @Role    UpdateCell
function CustomActivityFundsView:_onCellUpdate(cell, cellIndex)
    if self._fundsData == nil or table.nums(self._fundsData) <= 0 then
        return
    end
    local itemFirstIndex = (self._cellMaxItemsNum * cellIndex + 1)
    local itemLastIndex = (self._cellMaxItemsNum * (cellIndex + 1))
    local bFirstCell = (cellIndex == 0 or false)

    local cellData = {}
    for index = itemFirstIndex, itemLastIndex do
        local itemData = self._fundsData[index]
        if itemData ~= nil then
            itemData.isCurSelected = (self._curSelectDay == index)
            itemData.isActived = self._curFundsSigned
            itemData.canSignedDay = index <= self._signedDay
            if table.nums(self._fundsSignedData) > 0 and self._fundsSignedData[index] ~= nil then
                itemData.canGet = self._fundsSignedData[index]
            else
                itemData.canGet = self._curFundsSigned and 0 or 3
            end
            table.insert(cellData, itemData)
        end
    end
    cell:updateUI(cellData, self._fundsType, bFirstCell)
end

function CustomActivityFundsView:_onCellSelected(cell, cellIndex)
end

-- @Role    Require
function CustomActivityFundsView:_sendProtocol(day)
    -- body
    if table.nums(self._fundsSignedData) > 0 and self._fundsSignedData[day] ~= nil then
        if self._fundsSignedData[day] == 0 then
            G_UserData:getCustomActivity():c2sGetCustomActivityFundAward(self._actId, self._questId, day)
        end
    else
        if self._curFundsSigned and day <= self._signedDay then
            G_UserData:getCustomActivity():c2sGetCustomActivityFundAward(self._actId, self._questId, day)
        end
    end
end

-- @Role    Touch
function CustomActivityFundsView:_onItemTouch(sender)
    local day = sender:getTag()
    self._curSelectDay = day
    self:_sendProtocol(day)
    self:_initAwardCells()
end

function CustomActivityFundsView:_rewardWeekV2(day)
    -- body
    if day == nil then
        return
    end
    self._curSelectDay = day
    self:_sendProtocol(day)
    self:_updateListView()
end

-- @Role    UpdateListView
function CustomActivityFundsView:_updateScrollView()
    if self._fundsData == nil or table.nums(self._fundsData) <= 0 then
        return
    end
    self._scrollList:updateListView(1, math.ceil(table.nums(self._fundsData)/self._cellMaxItemsNum))
end

--------------------------------------------------------------------
-- @Role    实时渲染
function CustomActivityFundsView:_update(dt)
    if self._countDownTime > 0 then
        if self._curFundsSigned then
            self._textActivedCountDown:setString(Lang.get("funds_actived_countdown") ..G_ServerTime:getTimeStringDHM(self._countDownTime))
            self._textCountDownV2:setString(Lang.get("funds_actived_countdown") ..G_ServerTime:getTimeStringDHM(self._countDownTime))
        else
            self._textActivedCountDown:setString(Lang.get("funds_active_countdown") ..G_ServerTime:getTimeStringDHM(self._countDownTime))
            self._textCountDownV2:setString(Lang.get("funds_active_countdown") ..G_ServerTime:getTimeStringDHM(self._countDownTime))
        end
    end
end


return CustomActivityFundsView