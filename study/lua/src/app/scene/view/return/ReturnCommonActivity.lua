--
-- Author: hyl
-- Date: 2019-7-4
-- 老玩家回归
local ViewBase = require("app.ui.ViewBase")
local ReturnCommonActivity = class("ReturnCommonActivity", ViewBase)
local ReturnConst = require("app.const.ReturnConst")

function ReturnCommonActivity:ctor(type)
    self._activityType = type or ReturnConst.DAILY_ACTIVITY_TYPE
    self._acitivityInfo = {}

	local resource = {
		file = Path.getCSB("ReturnCommonActivity", "return"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
    }
    
	ReturnCommonActivity.super.ctor(self, resource)
end

function ReturnCommonActivity:onCreate()
    self:_initView()
    self:_initListView()
end


function ReturnCommonActivity:onEnter()
    self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_RETURN_SHOW_REWARD, handler(self, self._updateView))
    self._signalUpdate = G_SignalManager:add(SignalConst.EVENT_RETURN_UPDATE, handler(self, self._updateView))

    self:_updateView()
end

function ReturnCommonActivity:onExit()
	self._signalGetReward:remove()
    self._signalGetReward = nil
    self._signalUpdate:remove()
	self._signalUpdate = nil
end

function ReturnCommonActivity:_initListView ()
    self._listview:setTemplate(ReturnConst.RETURN_LIST_CELL[self._activityType])--依据具体任务数据决定模板
    self._listview:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listview:setCustomCallback(handler(self, self._onItemTouch))
end

function ReturnCommonActivity:_initView()
    self._imageTitle:ignoreContentAdaptWithSize(true)
    self._imageTitle:loadTexture(Path.getReturnText("return_zi"..self._activityType))
    self._imageBg:loadTexture(Path.getReturnBgImg("return_bg"..self._activityType))
end

function ReturnCommonActivity:_onItemUpdate(item, index)
    --print("index "..index)
    --dump(self._acitivityInfo)
    if self._acitivityInfo[index + 1] then
        item:update(self._acitivityInfo[index + 1])
    end
end

function ReturnCommonActivity:_onItemSelected(item, index)

end

function ReturnCommonActivity:_onItemTouch(index, t)

end

function ReturnCommonActivity:setEndTimeLabel(str)
    self._leftTime:setString(str)
end

function ReturnCommonActivity:_updateView()
    if self._activityType == ReturnConst.DAILY_ACTIVITY_TYPE then
        self._acitivityInfo = G_UserData:getReturnData():getDailyActivityInfo()
    elseif self._activityType == ReturnConst.PRIVILEGE_ACTIVITY_TYPE then
        self._acitivityInfo = G_UserData:getReturnData():getPrivilegeInfo()
    elseif self._activityType == ReturnConst.DISCOUNT_ACTIVITY_TYPE then
        self._acitivityInfo = G_UserData:getReturnData():getDiscountInfo()
    elseif self._activityType == ReturnConst.GIFT_ACTIVITY_TYPE then
        self._acitivityInfo = G_UserData:getReturnData():getGiftsInfo()
    end

    --dump(self._acitivityInfo)
    local count = #self._acitivityInfo
    --print("count "..count)
    --self._listview:clearAll()
	self._listview:resize(count)
end

return ReturnCommonActivity