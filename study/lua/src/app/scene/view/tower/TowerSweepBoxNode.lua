local ListViewCellBase = require("app.ui.ListViewCellBase")
local TowerSweepBoxNode = class("TowerSweepBoxNode", ListViewCellBase)

local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

TowerSweepBoxNode.HEIGHT_FIX = 0	--高度补充系数
TowerSweepBoxNode.ITEM_GAP = 30

function TowerSweepBoxNode:ctor(rewards,title)
    self._rewards = rewards
    self._title = title
    --ui
    self._nodeBG2 = nil     --根结点2
    self._textTitle = nil   --标题
	local resource = {
		file = Path.getCSB("TowerSweepBoxNode", "tower"),
		binding = {
		}
	}
	TowerSweepBoxNode.super.ctor(self, resource)
end

function TowerSweepBoxNode:onCreate()
	local size = self._nodeBG2:getContentSize()
	self:setContentSize(size.width, size.height + TowerSweepBoxNode.HEIGHT_FIX)

    self._textTitle:setString(self._title)
    self._nodeBG2:setVisible(true)
  
   
    
  --[[
    local rewards = self._reward
    local rewardCount = #rewards
    for i, v in pairs(rewards) do
        local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
        dump(v)
        uiNode:initUI(v.type, v.value, v.size)
        uiNode:setScale(0.8)	
        uiNode:setTouchEnabled(false)
        self:addChild(uiNode)	
        uiNode:setPosition(0,0)
    end        
    ]]
    --创建奖励父节点
    local rewardsNode = ccui.Widget:create()--display.newNode()
    local itemWidgets =  self:_updateAwards(rewardsNode,  self._rewards,TowerSweepBoxNode.ITEM_GAP)
    self._nodeItem:addChild(rewardsNode)
end


function TowerSweepBoxNode:_updateAwards(rewardParentNodes,awards,gap)
    local itemScale = 0.8 ---缩放80%
    local itemWidgets = {}
    local maxCol = #awards
    local commonTemSize = cc.size(0,0)

    for i = 1, #awards, 1 do
        local award = awards[i]
        local itemNode = require("app.ui.component.ComponentIconHelper").createIcon(award.type, award.value, award.size)
		local itemPanel = itemNode:getSubNodeByName("_panelItemContent")
		local itemSize = itemPanel:getContentSize()
		itemNode:showName(false)
        itemNode:setScale(itemScale)
        rewardParentNodes:addChild(itemNode)

        local x = (i - 1) * itemSize.width * itemScale + (i - 1) * gap
        itemNode:setPositionX(x + itemSize.width * itemScale * 0.5)
        itemNode:setPositionY(itemSize.height * itemScale * 0.5)
        itemWidgets[i] = itemNode

        commonTemSize = itemSize
    end

    local totalW = maxCol * commonTemSize.width * itemScale + math.max(maxCol - 1,0) * gap
    local totalH =  commonTemSize.height 

    rewardParentNodes:setContentSize(cc.size(totalW,totalH))
    rewardParentNodes:setAnchorPoint(0.5,0.5)
    return itemWidgets
end

return TowerSweepBoxNode