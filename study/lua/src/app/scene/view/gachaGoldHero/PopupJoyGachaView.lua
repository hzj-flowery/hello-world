-- @Author panhoa
-- @Date 5.7.2019
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupJoyGachaView = class("PopupJoyGachaView", PopupBase)
local BonusPoolAwardCell = import(".BonusPoolAwardCell")
local scheduler = require("cocos.framework.scheduler")
local TabScrollView = require("app.utils.TabScrollView")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")


function PopupJoyGachaView:ctor(closeBack)
    self._scrollViewAward  = nil
    self._countDownHandler = nil
    self._closeBack = closeBack

    local resource = {
        file = Path.getCSB("PopupJoyGachaView", "gachaGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_commonFoward = {
				events = {{event = "touch", method = "_onButtonForward"}}
			},
        }
    }
    self:setName("PopupJoyGachaView")
    PopupJoyGachaView.super.ctor(self, resource)
end

function PopupJoyGachaView:onCreate()
    self._poolData = GachaGoldenHeroHelper.getGachaState()
    self._prizeLists = G_UserData:getGachaGoldenHero():getPrizeLists()
    self:_initRewardsScrollView()
end

function PopupJoyGachaView:onEnter()
    self._signalLuckList   = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_LUCKLIST, handler(self, self._onEventLuckList))     -- 中奖名单

    self:_initCommonBack()
    self:_updateStateData()
    self:_updateDropIcon()
    self:_updateRewardMember()
    self:_updateCountDown()
    self:_updateEnterPrizeLists()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.5)
end

function PopupJoyGachaView:onExit()
    self._signalLuckList:remove()
    self._signalLuckList = nil

    self:_endSchedule()
    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end
end

function PopupJoyGachaView:_onEventLuckList()
    self:_updateEnterPrizeLists()
    self:_updateStateData()
end

function PopupJoyGachaView:_initCommonBack( ... )
    self._commonBack:setTitle(Lang.get("gacha_goldenhero_joytitle"))
    self._commonBack:addCloseEventListener(handler(self, self._btnClose))
    self._commonFoward:setString(Lang.get("gacha_goldenhero_forward"))
end

function PopupJoyGachaView:_onButtonForward()
    if self._closeBack then
        self._closeBack()
    end
    self:close()
    G_UserData:getGachaGoldenHero():setAutoPopupJoy(false)
end

function PopupJoyGachaView:_btnClose( ... )
    if self._closeBack then
        self._closeBack()
    end
    self:close()
    G_UserData:getGachaGoldenHero():setAutoPopupJoy(false)
end

function PopupJoyGachaView:_initRewardsScrollView()
    local scrollViewParam = {
		template = BonusPoolAwardCell,
		updateFunc = handler(self, self._onCellUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
	}
	self._tabListView = TabScrollView.new(self._scrollViewAward, scrollViewParam)
end

function PopupJoyGachaView:_updateListView()
	local awards = #self._prizeLists
	local lineCount = math.ceil(awards / 2)
	self._tabListView:updateListView(self._scrollViewAward, lineCount)
end

function PopupJoyGachaView:_updateEnterPrizeLists()
    self._prizeLists = G_UserData:getGachaGoldenHero():getPrizeLists()
    self:_updateListView()
    self:_updateRewardsImg()
end

function PopupJoyGachaView:_onCellUpdate(cell, cellIdx)
    if #self._prizeLists <= 0 then
        return
    end

    local cellData = {}
    local cellStartIdx = (cellIdx * 2 + 1)
    local cellEndIdx = (cellIdx * 2 + 2)
    for i = cellStartIdx, cellEndIdx do
        if self._prizeLists[i] then
            table.insert(cellData, self._prizeLists[i])
        end
    end
    cell:updateUI(cellData)
end

function PopupJoyGachaView:_onCellSelected(cell, cellIdx)
end

function PopupJoyGachaView:_onCellTouch(cellIdx, callBackData)
end

function PopupJoyGachaView:_updateStateData()
    if self._poolData and self._poolData.stage <= 0 then
        return
    end

    local isLottery = self._poolData.isLottery
    local isCrossDay = self._poolData.isCrossDay
    self._imageRewardDesc:setVisible(not isCrossDay and isLottery)
    self._imageZhaomuCon:setVisible(not isLottery)
    self._commonFoward:setVisible(not isLottery)
    self._textCurCountDown:setVisible(not isLottery)
    self._textCurTime:setVisible(not isLottery)
    self._imageGroup:setVisible(not isLottery)

    self._textNextCountDown:setVisible(isLottery)
    self._textNextTime:setVisible(isLottery)
    self._textCurLuckPerson:setVisible(isLottery)
    self._panelPrize:setVisible(isLottery)


    local imgBackName = isLottery and GachaGoldenHeroConst.DRAW_JOY_BACKBG[2]
                              or GachaGoldenHeroConst.DRAW_JOY_BACKBG[1]
    self._imageBack:loadTexture(Path.getGoldHeroJPG(imgBackName))
    self._imageBack:ignoreContentAdaptWithSize(true)
end

function PopupJoyGachaView:_updateRewardsImg( ... )
    self._prizeLists = G_UserData:getGachaGoldenHero():getPrizeLists()
    local imgStateName = GachaGoldenHeroHelper.isLottery(self._prizeLists) and GachaGoldenHeroConst.DRAW_JOY_STATE[1]
                                                                      or GachaGoldenHeroConst.DRAW_JOY_STATE[2]
    self._imageRewardDesc:loadTexture(Path.getGoldHeroTxt(imgStateName))
    self._imageRewardDesc:ignoreContentAdaptWithSize(true)
end

function PopupJoyGachaView:_updateCountDown()
    if self._poolData and self._poolData.stage <= 0 then
        return
    end

    local leftTime = G_ServerTime:getLeftSeconds(self._poolData.countDowm)
    if leftTime <= 0 then
        self._poolData = GachaGoldenHeroHelper.getGachaState()
        if self._poolData.isLottery then
            G_UserData:getGachaGoldenHero():setLuck_draw_num(0)
        end
        self:_updateStateData()
        self:_startCountDown()
    end
    local times = G_ServerTime:getLeftDHMSFormatEx(self._poolData.countDowm)
    
    if self._poolData.isLottery then
        self:_updateRewardsImg()
        if self._poolData.isOver then
            self._textNextCountDown:setString(Lang.get("gacha_goldenhero_joy_overcountdown"))
        else
            self._textNextCountDown:setString(Lang.get("gacha_goldenhero_joy_nextcountdown"))
        end
        self._textNextTime:setString(tostring(times))
    else
        if self._poolData.stage == 0 or self._poolData.isCrossDay == true then
            self._textCurCountDown:setString(Lang.get("gacha_goldenhero_joy_opencountdown"))
        else
            self._textCurCountDown:setString(Lang.get("gacha_goldenhero_joy_drawcountdown"))
        end
        self._textCurTime:setString(tostring(times))
    end
end

function PopupJoyGachaView:_startCountDown()
    self:_endSchedule()
    self._countDownHandler = SchedulerHelper.newScheduleOnce(function()
        self:_updateDropIcon()
        self:_updateRewardsImg()
        self:_updateRewardMember()
    end, 1.0)
end

function PopupJoyGachaView:_endSchedule()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

function PopupJoyGachaView:_updateDropIcon()
    if not self._poolData then
        return
    end

    local id = G_UserData:getGachaGoldenHero():getDrop_id()
    local data = GachaGoldenHeroHelper.getGoldenHeroDraw(id)
    if self._poolData.isLottery then
        data = GachaGoldenHeroHelper.getLastReward(id, self._poolData.isOver)
    end

    if data == nil then return end
    self._fileNodeIcon:unInitUI()
    self._fileNodeIcon:initUI(data.type, data.value, 1)
    self._fileNodeIcon:setTouchEnabled(true)
    local params = self._fileNodeIcon:getItemParams()
    self._textAwardsNum:setString(Lang.get("gacha_goldenhero_joyawardnum", {name = params.name, num = data.size}))
    self._textAwardsNum:setColor(params.icon_color)
    self._textGroup:setString(Lang.get("gacha_goldenhero_awardsgroup", {group = data.group})) 
end

function PopupJoyGachaView:_updateRewardMember()
    local drawNum = G_UserData:getGachaGoldenHero():getLuck_draw_num()
    if self._poolData.isLottery or self._poolData.isCrossDay then
        drawNum = 0
    end
    
    self._textDrawCount:setString(Lang.get("gacha_goldenhero_awardnum", {num = drawNum}))
    local strDesc = drawNum > 0 and Lang.get("gacha_goldenhero_award")
                                or Lang.get("gacha_goldenhero_donotaward")
    self._nodeZhaomuCondition:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(
        strDesc,
        {defaultColor = Colors.DARK_BG_THREE, defaultSize = 22, other ={[1] = {fontSize = 22}
    }})
    richText:setAnchorPoint(cc.p(0.5, 0.5))
    self._nodeZhaomuCondition:addChild(richText)
end

function PopupJoyGachaView:_update(dt)
    self:_updateCountDown()
end



return PopupJoyGachaView