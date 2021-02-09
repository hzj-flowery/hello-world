-- @Author wangyu
-- @Date 10.23.2019
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupSilkRecommand = class("PopupSilkRecommand", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local PopupSilkRecommandCell = require("app.scene.view.seasonSilk.PopupSilkRecommandCell")



function PopupSilkRecommand:ctor(pos)
    self._commonNodeBk  = nil
    self._scrollView    = nil
    self._recommandData = {}
    self._curGroupPos   = pos

	local resource = {
		file = Path.getCSB("PopupSilkRecommand", "seasonSilk"),
	}
	self:setName("PopupSilkRecommand")
	PopupSilkRecommand.super.ctor(self, resource, true, false)
end

function PopupSilkRecommand:onCreate()
    self._commonNodeBk:setTitle(Lang.get("season_silk_recommand_title"))
    self._commonNodeBk:addCloseEventListener(handler(self, self._btnClose))
    self:_initScrollView()
end

function PopupSilkRecommand:onEnter()
    self._listnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onListnerSeasonEnd))		-- 监听赛季结束
    self._listnerSilkEquipSuccess =
        G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, handler(self, self._onListnerSilkEquipSuccess))		        -- 设置锦囊成功
    
    self:_initData()
    self:_updateScrollView()
end

function PopupSilkRecommand:onExit()
    self._listnerSeasonEnd:remove()
    self._listnerSeasonEnd = nil
    self._listnerSilkEquipSuccess:remove()
    self._listnerSilkEquipSuccess = nil
    if self._callBack then
		self._callBack()
	end
end

function PopupSilkRecommand:_onListnerSeasonEnd()
    -- G_UserData:getSeasonSport():c2sFightsEntrance()
    self:close()
end

function PopupSilkRecommand:_onListnerSilkEquipSuccess()
    self:close()
end

function PopupSilkRecommand:_btnClose()
    self:close()
end

-- @Role    奖励数据：可领取——未达成——已领取
function PopupSilkRecommand:_initData()
    self._recommandData = SeasonSportHelper.getSileRecommand()
end

function PopupSilkRecommand:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = PopupSilkRecommandCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._ownReportView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupSilkRecommand:_updateScrollView()
    local maxCount = table.nums(self._recommandData)
	if not self._recommandData or maxCount <= 0 then
		return
	end

    self._ownReportView:updateListView(1, maxCount)
end

function PopupSilkRecommand:_onCellUpdate(cell, index)
    if not self._recommandData or table.nums(self._recommandData) <= 0 then
		return
    end
    
    local curIndex = (index + 1)
    local cellData = {}
    if self._recommandData[curIndex] then
        cellData = self._recommandData[curIndex]
        cellData.index = curIndex
        cell:updateUI(self._curGroupPos, cellData)
    end
end

function PopupSilkRecommand:_onCellSelected(cell, index)
end

-- @Role    
function PopupSilkRecommand:_onCellTouch(index, data)
end

function PopupSilkRecommand:setCloseCallBack(callback)
	self._callBack = callback
end



return PopupSilkRecommand