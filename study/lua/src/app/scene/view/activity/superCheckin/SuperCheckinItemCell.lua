-- @Author panhoa
-- @Date 7.6.2018
-- @Role SuperCheckinItemCell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SuperCheckinItemCell = class("SuperCheckinItemCell", ListViewCellBase)
local SuperCheckinConst = require("app.const.SuperCheckinConst")
local ReturnConst = require("app.const.ReturnConst")


function SuperCheckinItemCell:ctor()
    -- body
    local resource = {
        file = Path.getCSB("SuperCheckinItemCell", "activity/superCheckin")
    }
    SuperCheckinItemCell.super.ctor(self, resource)
end

function SuperCheckinItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)

    -- register
    self:_registerClickEventlistener()
end

-- @Role register
function SuperCheckinItemCell:_registerClickEventlistener()
    -- body
    for index = 1, SuperCheckinConst.CELLITEM_NUM do
        local cellItem = self["_cellItem"..index]
        local click = self["_clickIndex"..index]
        if cellItem and click then
            cellItem:setVisible(false)
            click:setSwallowTouches(false)
            click:addClickEventListenerEx(handler(self, self._selectItem))
        end
    end
end

-- @param cellIndex 每行下标 
-- @param cellData  每行数据
-- @Role updateUI   
function SuperCheckinItemCell:updateUI(cellIndex, cellData)
    -- body
    for index = 1, SuperCheckinConst.CELLITEM_NUM do
        self["_cellItem"..index]:setVisible(false)
    end
    local isTodayCheckined = G_UserData:getActivitySuperCheckin():isTodayCheckin()

    local restTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_WUGUFENGDENG)

    -- update item
    local function updateItem(index, data)
        self["_cellItem"..index]:setVisible(true)
        self["_clickIndex"..index]:setTag(index + (cellIndex * SuperCheckinConst.CELLITEM_NUM))
        self["_item"..index]:unInitUI()
        self["_item"..index]:initUI(data.type, data.value, data.size)
        self["_item"..index]:setTouchEnabled(isTodayCheckined)
        self["_item"..index]:showDoubleTips(restTimes > 0)
        self["_selectImage"..index]:setVisible(data.selected)
        local desc = data.selected and Lang.get("lang_activity_super_checkin_select") or
                                        Lang.get("lang_activity_super_checkin_not_select")
        self["_selectText"..index]:setString(desc)
    end

    for itemIndex, itemData in ipairs(cellData) do
       updateItem(itemIndex, itemData) 
    end
end

-- @Role listener the select
function SuperCheckinItemCell:_selectItem(sender)
    -- body
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
    local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)

    if SuperCheckinConst.MOVE_OFFSET > offsetX and SuperCheckinConst.MOVE_OFFSET > offsetY then
        local curSelectedPos = sender:getTag()
        self:dispatchCustomCallback(curSelectedPos)
    end
end

return SuperCheckinItemCell
