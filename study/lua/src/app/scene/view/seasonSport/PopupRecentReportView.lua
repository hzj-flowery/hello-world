-- @Author panhoa
-- @Date 8.16.2018
-- @Role SeasonRankView

local PopupBase = require("app.ui.PopupBase")
local PopupRecentReportView = class("PopupRecentReportView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local RecentReportCell = require("app.scene.view.seasonSport.RecentReportCell")


function PopupRecentReportView:ctor(data)
    self._commonNodeBk  = nil
    self._scrollView    = nil
    self._fileNodeIcon  = nil
    self._textPlayerName= nil
    self._textServerName= nil
    self._textFightCount= nil
    self._textWinPercent= nil
    self._recentReportView = nil
    self._recentReportData = data

	local resource = {
		file = Path.getCSB("PopupRecentReportView", "seasonSport"),
	}
	self:setName("PopupRecentReportView")
	PopupRecentReportView.super.ctor(self, resource, false, false)
end

function PopupRecentReportView:onCreate()
    self._commonNodeBk:setTitle(Lang.get("season_recent_report"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._btnClose))
    self:_initBaseView()
    self:_initScrollView()
end

function PopupRecentReportView:onEnter()
    self:_updateScrollView()
end

function PopupRecentReportView:onExit()
end

function PopupRecentReportView:_btnClose()
    self:close()
end

-- @Role    Init BaseView
function PopupRecentReportView:_initBaseView()
    if not self._recentReportData then
        return
    end

    -- HeroIcon
    local avatarData = {
        baseId = self._recentReportData.base_id,
        avatarBaseId = self._recentReportData.avatar_base_id,
        covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(self._recentReportData.avatar_base_id, self._recentReportData.base_id),
        isHasAvatar = self._recentReportData.avatar_base_id and self._recentReportData.avatar_base_id > 0 
    }
    self._fileNodeIcon:updateIcon(avatarData)

    -- HeroName
    if string.match(self._recentReportData.sname, "(%a+%d+)") ~= nil then
        local nameStr = (string.match(self._recentReportData.sname, "(%a+%d+)"))
        self._textServerName:setString(nameStr)
    else
        self._textServerName:setString(self._recentReportData.sname)
    end 

    -- FightInfo
    local targetPosX = (self._textServerName:getPositionX() + self._textServerName:getContentSize().width + 10)
    self._textPlayerName:setPositionX(targetPosX)
    self._textPlayerName:setString(self._recentReportData.name)
    self._textPlayerName:setColor(Colors.getOfficialColor(self._recentReportData.title))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textPlayerName, self._recentReportData.title)
    self._textFightCount:setString(tostring(self._recentReportData.fight_count))
    self._textWinPercent:setString(self._recentReportData.fight_count > 0
                                        and Lang.get("season_win_percent", {number = string.format("%.2f", 100 * self._recentReportData.win_count/self._recentReportData.fight_count)}) 
                                        or Lang.get("season_win_percent", {number = 0}))
end

function PopupRecentReportView:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = RecentReportCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._recentReportView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupRecentReportView:_updateScrollView()
	if not self._recentReportData or rawget(self._recentReportData, "units") == nil then
		return
    end

    local idsNums = table.nums(self._recentReportData.units)
    if idsNums < SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS then
        return
    end
    self._recentReportView:updateListView(1, idsNums / SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS)
end

function PopupRecentReportView:_onCellUpdate(cell, index)
	if not self._recentReportData or rawget(self._recentReportData, "units") == nil then
		return
	end

    local curIndex = (index + 1)
    local lineStartIdx = (index * SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS + 1)
    local lineEndIdx = ((index + 1) * SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS)
	local cellData = {}
    if self._recentReportData.units then
        local ids = {}
        for i = lineStartIdx, lineEndIdx do
            if rawget(self._recentReportData.units, i) ~= nil then
                table.insert(ids, self._recentReportData.units[i])
            end
        end
        cellData.ids = ids
        cellData.index = curIndex
		cell:updateUI(cellData)
    end
end

function PopupRecentReportView:_onCellSelected(cell, index)
end

function PopupRecentReportView:_onCellTouch(index, data)
end

return PopupRecentReportView