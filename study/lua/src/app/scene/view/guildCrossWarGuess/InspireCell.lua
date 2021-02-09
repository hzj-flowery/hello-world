-- @Author panhoa
-- @Date 8.15.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local InspireCell = class("InspireCell", ListViewCellBase)
local InspireNode = import(".InspireNode")


local INSPIRE_NODE_POS = {
    {cc.p(169, 1.5), cc.p(338, 1.5), cc.p(507, 1.5), cc.p(676, 1.5), cc.p(845, 1.5)},
    {cc.p(88, 3.5), cc.p(260, 3.5), cc.p(428, 3.5), cc.p(598, 3.5), cc.p(768, 3.5)},
}

function InspireCell:ctor()

    -- body
    local resource = {
        file = Path.getCSB("InspireCell", "guildCrossWarGuess"),
    }
    InspireCell.super.ctor(self, resource)
end

-- @Role
function InspireCell:onCreate()
    self["_panel1"]:setVisible(false)
    self["_panel2"]:setVisible(false)
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

-- @Role    UpdateUI
function InspireCell:updateUI(data)
    if not data then return end

    self["_panel1"]:setVisible(true)
    self["_panel2"]:setVisible(table.nums(data) > 5)
    self["_panel1"]:removeAllChildren()
    self["_panel2"]:removeAllChildren()
    
    for i,v in ipairs(data) do
        if i > 5 then
            local InspireNode = InspireNode.new()
            local index = (i-5)
            InspireNode:setPosition(INSPIRE_NODE_POS[2][i-5])
            InspireNode:updateUI(v)
            self["_panel2"]:addChild(InspireNode)
        else
            local InspireNode = InspireNode.new()
            InspireNode:setPosition(INSPIRE_NODE_POS[1][i])
            InspireNode:updateUI(v)
            self["_panel1"]:addChild(InspireNode)
        end
    end
end


return InspireCell