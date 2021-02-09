
--
-- Author: Liangxu
-- Date: 2019-5-20
-- 蛋糕奖励预览弹框

local PopupBase = require("app.ui.PopupBase")
local PopupCakeAwardPreview = class("PopupCakeAwardPreview", PopupBase)
local CakeAwardPreviewCell = require("app.scene.view.cakeActivity.CakeAwardPreviewCell")
local CakeActivityConst = require("app.const.CakeActivityConst")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local TabScrollView = require("app.utils.TabScrollView")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

function PopupCakeAwardPreview:ctor(index)
	self._selectTabIndex = index or 1

	local resource = {
		file = Path.getCSB("PopupGachaAwardsRank", "gachaGoldHero"),
		binding = {
			
		}
	}
	PopupCakeAwardPreview.super.ctor(self, resource)
end

function PopupCakeAwardPreview:onCreate()
	self._actStage = CakeActivityConst.ACT_STAGE_0
	self._targetTime = 0
	self._datas = {}
	self._rankView  = nil

	self._commonNodeBk:setTitle(Lang.get("cake_activity_award_preview_title"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self._commonHelp:setVisible(false)
	self._textRankTitle:setString(Lang.get("cake_activity_rank_guild_title"))
	local name = CakeActivityDataHelper.getFoodName()
	self._textPointTitle:setString(Lang.get("cake_activity_award_preview_cake_level_des", {name = name}))
	self._textCountTime:setPositionX(260) --位置调整，写死

	self:_initCommonTab()
end

function PopupCakeAwardPreview:_initCommonTab()
	local scrollViewParam = {
		template = CakeAwardPreviewCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._rankView = TabScrollView.new(self._scrollView, scrollViewParam, self._selectTabIndex)

    local tabNameList = {
		Lang.get("cake_activity_award_preview_tab_1"),
		Lang.get("cake_activity_award_preview_tab_2"),
    }
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._commonTab:recreateTabs(param)
end

function PopupCakeAwardPreview:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
    self:_updateCountDown()
end

function PopupCakeAwardPreview:onEnter()
	self._commonTab:setTabIndex(self._selectTabIndex)
	self:_updateView()
	self:_updateRankDesc()
	self:_startCountDown()
end

function PopupCakeAwardPreview:onExit()
	self:_stopCountDown()
end

function PopupCakeAwardPreview:_updateView()
	self:_updateActivityStage()
	self:_updateBanner()
	self:_updateList()
	self:_updateDesc()
end

function PopupCakeAwardPreview:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function PopupCakeAwardPreview:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function PopupCakeAwardPreview:_updateCountDown()
	local countDown = self._targetTime - G_ServerTime:getTime()
	if countDown >= 0 then
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
    	self._textCountTime:setString(timeString)
    else
    	self._textCountTime:setString("")
    	if self._targetTime ~= 0 then
    		self:_updateActivityStage()
    	end
	end
end

function PopupCakeAwardPreview:_updateActivityStage()
	local actStage, startTime, endTime = CakeActivityDataHelper.getActStage()
	self._actStage = actStage
	
	if self._selectTabIndex == 1 then
		if actStage == CakeActivityConst.ACT_STAGE_1 then
			self._textCountDown:setString(Lang.get("cake_activity_award_preview_countdown_title_1"))
			self._targetTime = endTime
		else
			self._textCountDown:setString(Lang.get("cake_activity_award_preview_countdown_title_2"))
			self._targetTime = 0
		end
	else
		if actStage == CakeActivityConst.ACT_STAGE_1 or actStage == CakeActivityConst.ACT_STAGE_2 then
			self._textCountDown:setString(Lang.get("cake_activity_award_preview_countdown_title_3"))
			self._targetTime = CakeActivityDataHelper.getAllServerStageStartTime()
		elseif actStage == CakeActivityConst.ACT_STAGE_3 then
			self._textCountDown:setString(Lang.get("cake_activity_award_preview_countdown_title_4"))
			self._targetTime = endTime
		else
			self._textCountDown:setString(Lang.get("cake_activity_award_preview_countdown_title_5"))
			self._targetTime = 0
		end
	end
end

function PopupCakeAwardPreview:_updateBanner()
	if self._selectTabIndex == 1 then
		self._imageBanner:loadTexture(Path.getTextAnniversaryImg("img_gold_bg08", ".jpg"))
	else
		self._imageBanner:loadTexture(Path.getTextAnniversaryImg("img_gold_bg09", ".jpg"))
	end
end

function PopupCakeAwardPreview:_updateList()
	local batch = G_UserData:getCakeActivity():getBatchId()
	local type = 0
	if self._selectTabIndex == 1 then
		type = CakeActivityConst.RANK_AWARD_TYPE_2
	else
		type = CakeActivityConst.RANK_AWARD_TYPE_4
	end
	self._datas = G_UserData:getCakeActivity():getRankInfo(batch, type)
	self._rankView:updateListView(self._selectTabIndex, #self._datas)
end

function PopupCakeAwardPreview:_onItemUpdate(item, index)
	local idx = (index + 1)
    local cellData = {
        index = idx,
        cfg = self._datas[idx],
    }
    item:updateUI(cellData)
end

function PopupCakeAwardPreview:_onItemSelected(item, index)

end

function PopupCakeAwardPreview:_onItemTouch(index, t)

end

function PopupCakeAwardPreview:_updateDesc()
	if self._selectTabIndex == 1 then
		self._textCountDesc:setString(Lang.get("cake_activity_award_preview_des_1"))
	else
		self._textCountDesc:setString(Lang.get("cake_activity_award_preview_des_2"))
	end
end

function PopupCakeAwardPreview:_updateRankDesc()
	local rankData = G_UserData:getCakeActivity():getSelfGuildRank()
	local rankDes = rankData and rankData:getRank() or Lang.get("cake_activity_no_rank")
	local levelDes = rankData and rankData:getCake_level() or Lang.get("cake_activity_no_level")
	self._ownRank:setString(rankDes)
	self._textOwnPoint:setString(levelDes)
end

function PopupCakeAwardPreview:_onBtnClose()
	self:close()
end

return PopupCakeAwardPreview