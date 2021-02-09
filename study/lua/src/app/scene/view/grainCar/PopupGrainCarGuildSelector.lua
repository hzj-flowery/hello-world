-- Description: 军团选择器
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-11
local ViewBase = require("app.ui.ViewBase")
local PopupGrainCarGuildSelector = class("PopupGrainCarGuildSelector", ViewBase)
local PopupGrainCarGuildSelectorCell = require("app.scene.view.grainCar.PopupGrainCarGuildSelectorCell")
local MineBarNode = require("app.scene.view.mineCraft.MineBarNode")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local CSHelper = require("yoka.utils.CSHelper")


local MAX_CELL_COUNT_NO_SCROLL = 6 --最大不滚动cell个数
local CELL_HEIGHT = 33
local LIST_VIEW_OFFSET = 13

function PopupGrainCarGuildSelector:ctor(mineId)
    self._mineId = mineId
    self._selectorCallback = nil

    local resource = {
		file = Path.getCSB("PopupGrainCarGuildSelector", "grainCar"),
        binding = {
			_btnSearch = {
				events = {{event = "touch", method = "_onBtnSearchClick"}}
			},
		}
	}
	PopupGrainCarGuildSelector.super.ctor(self, resource)
end

function PopupGrainCarGuildSelector:onCreate()
    self:_updateData()
    self:_initUI()
end

function PopupGrainCarGuildSelector:onEnter()
end

function PopupGrainCarGuildSelector:onExit()
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarGuildSelector:_updateData()
    self._guildList = {}
    self._guildList = GrainCarDataHelper.getGuildListDividByGuildWithMineId(self._mineId)
    self._guildList = GrainCarDataHelper.sortGuild(self._guildList)
end

function PopupGrainCarGuildSelector:_initUI()
    self._btnSearch:setString(Lang.get("grain_car_search"))

    local itemCount = #self._guildList

    local bgSize = self._bg:getContentSize()
    self._bg:setContentSize(cc.size(bgSize.width, CELL_HEIGHT * math.min(itemCount, MAX_CELL_COUNT_NO_SCROLL) + LIST_VIEW_OFFSET))
    self._listView:setContentSize(cc.size(bgSize.width, CELL_HEIGHT * math.min(itemCount, MAX_CELL_COUNT_NO_SCROLL)))

    self._listView:setTemplate(PopupGrainCarGuildSelectorCell)
    self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listView:setCustomCallback(handler(self, self._onItemTouch))
    self._listView:resize(#self._guildList)
    self._bg:setVisible(false)
end

------------------------------------------------------------------
----------------------------外部方法-------------------------------
------------------------------------------------------------------
function PopupGrainCarGuildSelector:updateUI(mineId)
    self._mineId = mineId
    self:_updateData()
    self._listView:resize(#self._guildList)
end

--选择器回调
function PopupGrainCarGuildSelector:setSelectorCallback(cb)
    self._selectorCallback = cb
end

--关闭
function PopupGrainCarGuildSelector:close()
    self._bg:setVisible(false)
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarGuildSelector:_onItemUpdate(item, index)
    local data = self._guildList[index + 1]
    item:update(data)
end

function PopupGrainCarGuildSelector:_onItemSelected(item, index)
end

function PopupGrainCarGuildSelector:_onItemTouch(index, guildData)
    dump(guildData)
    if  self._selectorCallback then
        self._selectorCallback(guildData.id)
    end
end

--查找粮车
function PopupGrainCarGuildSelector:_onBtnSearchClick()
    self._bg:setVisible(not self._bg:isVisible())
end

return PopupGrainCarGuildSelector