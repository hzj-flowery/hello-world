-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupSeasonDailyRewards = class("PopupSeasonDailyRewards", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local SeasonDailyRewardsCell = require("app.scene.view.seasonSport.SeasonDailyRewardsCell")


-- @Role Get Connected-Info while Entry(Obsolutly in SeasonSportView.lua
function PopupSeasonDailyRewards:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
	end

    G_UserData:getSeasonSport():c2sFightsEntrance()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack)
	return signal
end

function PopupSeasonDailyRewards:ctor(isClickOtherClose, isNotCreateShade)
    self._commonNodeBk  = nil
    self._scrollView    = nil
    self._ownDailyData = {}

	local resource = {
		file = Path.getCSB("PopupSeasonDailyRewards", "seasonSport"),
	}
	self:setName("PopupSeasonDailyRewards")
	PopupSeasonDailyRewards.super.ctor(self, resource, false, false)
end

function PopupSeasonDailyRewards:onCreate()
    self._commonNodeBk:setTitle(Lang.get("season_daily_title"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._btnClose))
    self:_initScrollView()
end

function PopupSeasonDailyRewards:onEnter()
    self._getRewards       = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_REWARDS, handler(self, self._onGetRewards))			-- 领取奖励
    self._listnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onListnerSeasonEnd))		-- 监听赛季结束
    
    self._dailyFightResult = G_UserData:getSeasonSport():getDailyFightReward()
    self._dailyWinResult = G_UserData:getSeasonSport():getDailyWinReward()

    self:_initData()
    self:_updateScrollView()
end

function PopupSeasonDailyRewards:onExit()
    self._getRewards:remove()
    self._listnerSeasonEnd:remove()
    self._getRewards = nil
    self._listnerSeasonEnd = nil
end

function PopupSeasonDailyRewards:_onListnerSeasonEnd()
    G_UserData:getSeasonSport():c2sFightsEntrance()
    self:close()
end

function PopupSeasonDailyRewards:_btnClose()
    self:close()
end

-- @Role    奖励数据：可领取——未达成——已领取
function PopupSeasonDailyRewards:_initData()
    self._ownDailyData = SeasonSportHelper.getSeasonDailyData()
end

function PopupSeasonDailyRewards:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = SeasonDailyRewardsCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._ownReportView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupSeasonDailyRewards:_updateScrollView()
    local maxCount = table.nums(self._ownDailyData)
	if not self._ownDailyData or maxCount <= 0 then
		return
	end

    self._ownReportView:updateListView(1, maxCount)
end

function PopupSeasonDailyRewards:_onCellUpdate(cell, index)
    if not self._ownDailyData or table.nums(self._ownDailyData) <= 0 then
		return
    end
    
    local curIndex = (index + 1)
    local cellData = {}
    if self._ownDailyData[curIndex] then
        cellData = self._ownDailyData[curIndex]
        cellData.index = curIndex
        if cellData.type == 1 then
            cellData.state = self._dailyFightResult[cellData.idx] ~= nil and self._dailyFightResult[cellData.idx] or 0
            cellData.curNum = G_UserData:getSeasonSport():getFightNum()
            cellData.canGet = G_UserData:getSeasonSport():getFightNum() >= cellData.num or false
        elseif cellData.type == 2 then
            cellData.state = self._dailyWinResult[cellData.idx] ~= nil and self._dailyWinResult[cellData.idx] or 0
            cellData.curNum = G_UserData:getSeasonSport():getWinNum()
            cellData.canGet = G_UserData:getSeasonSport():getWinNum() >= cellData.num or false
        end

        cell:updateUI(cellData)
    end
end

function PopupSeasonDailyRewards:_onCellSelected(cell, index)
end

-- @Role    
function PopupSeasonDailyRewards:_onCellTouch(index, data)
    if not data  then
        return
    end
    G_UserData:getSeasonSport():c2sFightsBonus(data.type, data.idx - 1)
end

function PopupSeasonDailyRewards:_onGetRewards(id, message)
    if message.bonus_type == 3 then
        return
    end

    G_Prompt:showAwards(message.awards)
    if message.bonus_type == 1 then         -- 每日战斗
        local state = bit.tobits(message.reward_state)
        self._dailyFightResult = state
        G_UserData:getSeasonSport():setDailyFightReward(state)
    elseif message.bonus_type == 2 then     -- 每日胜利
        local state = bit.tobits(message.reward_state)
        self._dailyWinResult = state
        G_UserData:getSeasonSport():setDailyWinReward(state)
    end

    self:_initData()
    self:_updateScrollView()
end


return PopupSeasonDailyRewards