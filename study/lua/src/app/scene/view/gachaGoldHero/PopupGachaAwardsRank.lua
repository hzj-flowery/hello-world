-- @Author panhoa
-- @Date 5.14.2019
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupGachaAwardsRank = class("PopupGachaAwardsRank", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local BonusAwardCell= import(".BonusAwardCell")
local scheduler = require("cocos.framework.scheduler")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")


function PopupGachaAwardsRank:ctor(isClickOtherClose, isNotCreateShade)
	self._panelContent = nil
    self._rankView  = nil
    self._commonTab = nil
    self._scrollViewRank = nil
    self._selectTabIdx = 1

    local resource = {
        file = Path.getCSB("PopupGachaAwardsRank", "gachaGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
    }
	PopupGachaAwardsRank.super.ctor(self, resource, false, false)
end

function PopupGachaAwardsRank:onCreate()
	self._commonNodeBk:setTitle(Lang.get("gacha_goldenhero_shoptitle"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
    self._commonHelp:updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_JOY)
    self:_initCommonTab()
	self:_initScrollView()
end

function PopupGachaAwardsRank:onEnter()
    self._rankConfig = G_UserData:getGachaGoldenHero():getGoldenHeroRankCfg()
    self:_onTabSelect(1)
    self:_updateOwnView()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.5)
end

function PopupGachaAwardsRank:onExit()
    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end
end

function PopupGachaAwardsRank:_onBtnClose()
	self:close()
end

function PopupGachaAwardsRank:_initCommonTab()
    local tabNameList = {
		Lang.get("gacha_goldenhero_awardjoy"),
		Lang.get("gacha_goldenhero_awardtotal"),
    }
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._commonTab:recreateTabs(param)
end

function PopupGachaAwardsRank:_onTabSelect(index, sender)
    local rankType = (3 - index)
    self._rankData = self._rankConfig[rankType] or {}
    self._selectTabIdx = index
    self:_updateDesc()
    self:_updateOwnView()
    self:_updateScrollView()
end

function PopupGachaAwardsRank:_updateDesc()
    self._textCountDown:setString(Lang.get("gacha_goldenhero_awardtitle" ..self._selectTabIdx))
    local targetPosX = (self._textCountDown:getPositionX() + self._textCountDown:getContentSize().width + 5)
    self._textCountTime:setPositionX(targetPosX)

    if self._selectTabIdx == 1 then
        self:_updateCountDown()
    else
        self._textCountDesc:setString(Lang.get("gacha_goldenhero_awardcontent2"))
        local endTime = G_UserData:getGachaGoldenHero():getEnd_time()
        if G_ServerTime:getLeftSeconds(endTime) <= 0 then
            self._textCountTime:setString(Lang.get("gacha_goldenhero_recharging"))
        else
            self._textCountTime:setString(tostring(G_ServerTime:getLeftDHMSFormatEx(G_UserData:getGachaGoldenHero():getEnd_time())))
        end
    end
end

function PopupGachaAwardsRank:_updateCountDown()
    self._textCountDesc:setString(Lang.get("gacha_goldenhero_awardcontent1"))
    local poolData = GachaGoldenHeroHelper.getGachaState()
    if poolData and poolData.stage <= 0 then
        self._textCountTime:setString(Lang.get("gacha_goldenhero_recharging"))
        self._textCountTime:setFontSize(20)
        return
    end

    local leftTime = G_ServerTime:getLeftSeconds(poolData.countDowm)
    if leftTime <= 0 then
        poolData = GachaGoldenHeroHelper.getGachaState()
    end
    
    if poolData.isLottery then
        self._textCountTime:setString(Lang.get("gacha_goldenhero_awarding"))
    else
        if poolData.isCrossDay then
            if poolData.isOver then
                self._textCountTime:setString(Lang.get("gacha_goldenhero_joy_overjoy"))
            else
                self._textCountTime:setString(Lang.get("gacha_goldenhero_awarding2"))
            end
        else
            self._textCountTime:setString(tostring(G_ServerTime:getLeftDHMSFormatEx(poolData.countDowm)))
        end
    end
end

function PopupGachaAwardsRank:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = BonusAwardCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._rankView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupGachaAwardsRank:_updateOwnView()
    local ownRankData = G_UserData:getGachaGoldenHero():getOwnRankData()
    local curRank = ownRankData[GachaGoldenHeroConst.FLAG_OWNRANK ..self._selectTabIdx]
    if curRank then
        local str = curRank.rank == 0 and Lang.get("common_text_no_rank") or tostring(curRank.rank)
        if curRank.rank == 0 and curRank.point > 0 then
            str = Lang.get("gacha_goldenhero_awardsjoin")
        end
        self._ownRank:setString(str)
        self._textOwnPoint:setString(curRank.point)
    end
end

function PopupGachaAwardsRank:_updateScrollView()
	self._rankView:updateListView(1, table.nums(self._rankData))
end

function PopupGachaAwardsRank:_onCellUpdate(cell, index)
    local idx = (index + 1)
    local cellData = {
        index = idx,
        cfg = self._rankData[idx],
    }
    cell:updateUI(cellData)
end

function PopupGachaAwardsRank:_onCellSelected(cell, index)
end

function PopupGachaAwardsRank:_onCellTouch(index, data)
end

function PopupGachaAwardsRank:_update(dt)
    self:_updateDesc()
end


return PopupGachaAwardsRank