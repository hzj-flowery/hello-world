-- @Author panhoa
-- @Date 8.16.2018
-- @Role SeasonRankView

local PopupBase = require("app.ui.PopupBase")
local PopupSeasonRankView = class("PopupSeasonRankView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local SeasonRankCell = require("app.scene.view.seasonSport.SeasonRankCell")


-- @Role Get Connected-Info while Entry(Obsolutly in SeasonSportView.lua
function PopupSeasonRankView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		self._seasonRankData = rawget(message, "ladder") or {}
		callBack()
	end
	self._seasonRankData 	= {}
	G_UserData:getSeasonSport():c2sFightsLadder()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_RANK, onMsgCallBack)
	return signal
end

function PopupSeasonRankView:ctor(isClickOtherClose, isNotCreateShade)
	self._scrollView 		= nil
	self._rankView			= nil
	self._ownRank			= nil
	self._textOwnStar		= nil
	self._imageOwnDan		= nil
	self._imageSword		= nil
	self._imageStar			= nil
	

	local resource = {
		file = Path.getCSB("PopupSeasonRankView", "seasonSport"),
	}
	self:setName("PopupSeasonRankView")
	PopupSeasonRankView.super.ctor(self, resource, false, false)
end

function PopupSeasonRankView:onCreate()
	self._commonNodeBk:setTitle(Lang.get("common_title_rank"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self:_initScrollView()
end

function PopupSeasonRankView:onEnter()
	self._listnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onListnerSeasonEnd))			-- 监听赛季结束

	self:_updateOwnView()
	self:_updateScrollView()
end

function PopupSeasonRankView:onExit()
	self._listnerSeasonEnd:remove()
	self._listnerSeasonEnd = nil
end

function PopupSeasonRankView:_onListnerSeasonEnd()
	G_UserData:getSeasonSport():c2sFightsEntrance()
	self:close()
end

function PopupSeasonRankView:_onBtnClose()
	self:close()
end

function PopupSeasonRankView:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = SeasonRankCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._rankView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupSeasonRankView:_updateOwnView()
	local rank = G_UserData:getSeasonSport():getOwnRank()
	local star = G_UserData:getSeasonSport():getCurSeason_Star()
	local dan = tonumber(SeasonSportHelper.getDanInfoByStar(star).rank_1)
	local star2 = tonumber(SeasonSportHelper.getDanInfoByStar(star).star2)
	local danPic = SeasonSportHelper.getDanInfoByStar(star).name_pic

	self._textOwnStar:setString(tostring(star2))
	self._ownRank:setString(rank == 0 and Lang.get("common_text_no_rank") or tostring(rank))
	self._imageSword:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[dan]))
	self._imageOwnDan:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[dan]))
	self._imageStar:loadTexture(Path.getSeasonStar(danPic))
end

function PopupSeasonRankView:_updateScrollView()
	if not self._seasonRankData or table.nums(self._seasonRankData) <= 0 then
		return
	end

	self._rankView:updateListView(1, table.nums(self._seasonRankData))
end

function PopupSeasonRankView:_onCellUpdate(cell, index)
	local curIndex = (index + 1)
	if not self._seasonRankData then
		return
	end

	local cellData = {}
	if self._seasonRankData[curIndex] then
		cellData = self._seasonRankData[curIndex]
		cellData.index = curIndex
		cell:updateUI(cellData)
	end
end

function PopupSeasonRankView:_onCellSelected(cell, index)
end

function PopupSeasonRankView:_onCellTouch(index, data)
	if data == nil then return end 
	local PopupRecentReportView = require("app.scene.view.seasonSport.PopupRecentReportView").new(data)
	PopupRecentReportView:open()
end

return PopupSeasonRankView