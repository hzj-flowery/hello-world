--
-- Author: liushiyin
-- Date: 2018-12-24
--

local PopupBase = require("app.ui.PopupBase")
local PopupHonorTitle = class("PopupHonorTitle", PopupBase)
local PopupHonorTitleItemCell = require("app.scene.view.playerDetail.PopupHonorTitleItemCell")
local HonorTitleConst = require("app.const.HonorTitleConst")

function PopupHonorTitle:ctor()
    self._titleName = nil -- 称号名称
    self._titleChapter = nil -- 称号获取条件
    self._titleChapter_0 = nil -- 称号有效期
    self._listViewItem = nil -- 称号列表
    self._commonNodeBk = nil -- 通用背景

    self._tabIndex = 0

    self._title = Lang.get("honor_title_title")

    local resource = {
        file = Path.getCSB("PopupPlayerHonorTitle", "playerDetail"),
        binding = {}
    }
    self:setName("PopupHonorTitle")
    PopupHonorTitle.super.ctor(self, resource, true)
end

function PopupHonorTitle:onCreate()
    local TabScrollView = require("app.utils.TabScrollView")
    local scrollViewParam = {
        template = PopupHonorTitleItemCell,
        updateFunc = handler(self, self._onItemUpdate),
        selectFunc = handler(self, self._onItemSelected),
        touchFunc = handler(self, self._onItemTouch)
    }
    self._tabListView = TabScrollView.new(self._listViewItem, scrollViewParam)

    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnCancel))
end

function PopupHonorTitle:onEnter()
    self._signalUpdateTitleInfo =
        G_SignalManager:add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(self, self._onEventUpdateTitleInfo)) -- 称号更新
    self:refreshView()
end

function PopupHonorTitle:onExit()
    self._signalUpdateTitleInfo:remove()
    self._signalUpdateTitleInfo = nil
end

-- 称号数据更细
function PopupHonorTitle:_onEventUpdateTitleInfo(eventName, message)
    self:refreshView()
end

function PopupHonorTitle:_onItemUpdate(item, index)
    if self._itemList and #self._itemList > 0 then
        local data = self._itemList[index + 1]
        if data then
            item:updateUI(index, data)
        end
    end
end

function PopupHonorTitle:_onItemSelected(item)
end

function PopupHonorTitle:_onItemTouch(index)
end

function PopupHonorTitle:_onBtnCancel()
    self:close()
end

function PopupHonorTitle:refreshView()
    self._itemList = {}
    local titleData = G_UserData:getTitles()
    local itemList = titleData:getHonorTitleList()
    self._itemList = itemList

    self._tabListView:updateListView(self._tabIndex, #self._itemList)
end

return PopupHonorTitle
