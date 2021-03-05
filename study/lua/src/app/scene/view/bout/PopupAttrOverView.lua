-- @Author  panhoa
-- @Date  4.3.2020
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupAttrOverView = class("PopupAttrOverView", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local TextHelper = require("app.utils.TextHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")


function PopupAttrOverView:ctor()
    
    local resource = {
		file = Path.getCSB("PopupAttrOverView", "bout"),
	}
	PopupAttrOverView.super.ctor(self, resource, true, false)
end

function PopupAttrOverView:onCreate()
    self._attrPanelSize = self._panelAttr:getContentSize()
	self._commonNodeBk:addCloseEventListener(function( ... )
        -- body
        self:close()
    end)
end

function PopupAttrOverView:onEnter()
    self:_updateUI()
    self:_acquiredBout()
end

function PopupAttrOverView:onExit()
end

function PopupAttrOverView:_acquiredBout( ... )
    -- body
    local nameList = ""
    local BoutHelper = require("app.scene.view.bout.BoutHelper")
    local boutList = G_UserData:getBout():getBoutList()
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local boutInfo = G_UserData:getBout():getBoutInfo()

    local list = G_UserData:getBout():getBoutAcquire()
    local count = table.nums(list)
    if boutList[curBoutId] and table.nums(boutList[curBoutId]) > 0 then
        count = (count + 1)
    end
    count = cc.clampf(1, count, table.maxn(boutInfo))

    for i=1, count do
        local info = BoutHelper.getBoutBaseItem(i)
        local ser = i == 1 and nameList or nameList.."、"
        if i == 5 then
            ser = ser.."\n"
        end
        nameList = ser..info.name
    end
    self._boutName:setString(nameList)
end

function PopupAttrOverView:_updateUI( ... )
    -- body
    self._panelAttr:removeAllChildren()
    local count = 1
    local result = {}
    AttrDataHelper.appendAttr(result, G_UserData:getBout():getAttrSingleInfo())
    
    for k,v in pairs(result) do
        local attrName, attrValue = TextHelper.getAttrBasicText(k, v)
        attrName = TextHelper.expandTextByLen(attrName, 4)
        local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
        uiNode:updateUI(attrName.."：", attrValue)
        local posX = (count % 2) == 1 and 90 or 345
        local posY = 225 - math.ceil(count / 2) * 30
        uiNode:setPosition(cc.p(posX, posY))
        uiNode:setFontSize(20)
        self._panelAttr:addChild(uiNode)
        count = (count + 1)
    end
end


return PopupAttrOverView