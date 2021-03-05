local ViewBase = require("app.ui.ViewBase")
local CampSummaryNode = class("CampSummaryNode", ViewBase)

function CampSummaryNode:ctor()
	local resource = {
		file = Path.getCSB("CampSummaryNode", "campRace"),
		binding = {
		}
	}
    CampSummaryNode.super.ctor(self, resource)
end

function CampSummaryNode:onCreate()
end

function CampSummaryNode:onEnter()
end

function CampSummaryNode:onExit()
end

function CampSummaryNode:showRank(old, new)
    self._nodeRank:setVisible(true)
    self._nodePoint:setVisible(false)
    self._textRankOld:setString(old)
    self._textRankNew:setString(new)
    if new < old then 
        self._textRankNew:setColor(Colors.getCampGreen())
    elseif new > old then 
        self._textRankNew:setColor(Colors.getCampRed())
    end
    local size1 = self._textRankOld:getContentSize()
    local size2 = self._imageArrow:getContentSize()
    self._imageArrow:setPositionX(size1.width+10)
    self._textRankNew:setPositionX(size1.width+size2.width)
end

function CampSummaryNode:showPoint(now, change)
    self._nodeRank:setVisible(false)
    self._nodePoint:setVisible(true)
    self._textPoint:setString(now)
    if change < 0 then 
        self._textPointChange:setString("（"..change.."）")
        self._textPointChange:setColor(Colors.getCampRed())
    else 
        self._textPointChange:setString("（+"..change.."）")
        self._textPointChange:setColor(Colors.getCampGreen())
    end
    local size1 = self._textPoint:getContentSize()
    self._textPointChange:setPositionX(size1.width)
end

return CampSummaryNode