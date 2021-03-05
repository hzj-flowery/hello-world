local ListViewCellBase = require("app.ui.ListViewCellBase")
local TowerSweepNode = class("TowerSweepNode", ListViewCellBase)

local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

TowerSweepNode.HEIGHT_FIX = 0	--高度补充系数

function TowerSweepNode:ctor(rewards, addRewards, title)
    self._reward = rewards
    self._addRewards = addRewards

    self._title = title
    --ui
    self._nodeBG = nil      --根结点1
    self._textTitle = nil   --标题
    self._res1 = nil        --奖品1
    self._res2 = nil        --奖品2
	local resource = {
		file = Path.getCSB("TowerSweepNode", "tower"),
		binding = {
		}
	}
	TowerSweepNode.super.ctor(self, resource)
end

function TowerSweepNode:onCreate()
	local size = self._nodeBG:getContentSize()
	self:setContentSize(size.width, size.height + TowerSweepNode.HEIGHT_FIX)

    self._textTitle:setString(self._title)
    self._nodeBG:setVisible(true)
    for i = 1, #self._reward do
        local reward = self._reward[i]
        self["_res"..i]:updateUI(reward.type, reward.value, reward.size)
        self["_res"..i]:showResName(true)
        self["_res"..i]:setTextColor(Colors.BRIGHT_BG_ONE)
        if self._addRewards then
            for _, v in pairs(self._addRewards) do
                if v.type == reward.type and v.value == reward.value then 
                    self["_res"..i]:updateCrit(v.index, v.size)
                    break
                end
            end
        end
    end


end

return TowerSweepNode