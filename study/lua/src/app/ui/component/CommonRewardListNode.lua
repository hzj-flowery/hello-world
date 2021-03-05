-- Author: Conley
local CommonRewardListNode = class("CommonRewardListNode")
local CustomActivityConst = require("app.const.CustomActivityConst")
--默认参数
local DEFAULT_PARAM =
{
    gap = 90,
    gapAdd = 95, 
    gapOr = 95,
    scrollWidth = 626,
}


local EXPORTED_METHODS = {
    "updateInfo",
    "setGaps",
}

function CommonRewardListNode:ctor()
	self._target = nil
    self._gapParams = DEFAULT_PARAM
end

function CommonRewardListNode:_init()
	self._commonIconTemplate = ccui.Helper:seekNodeByName(self._target, "CommonIconTemplate")
    cc.bind(self._commonIconTemplate, "CommonIconTemplate")

    self._nodeOr = ccui.Helper:seekNodeByName(self._target, "NodeOr")
    self._nodeAdd = ccui.Helper:seekNodeByName(self._target, "NodeAdd")
    self._scrollView = ccui.Helper:seekNodeByName(self._target, "ScrollView")
    
    self._scrollView:setScrollBarEnabled(false)
    self._scrollView:setSwallowTouches(false)

    self._commonIconTemplateList = {self._commonIconTemplate}
    self._nodeOrList = {self._nodeOr}
    self._nodeAddList = { self._nodeAdd}
end

function CommonRewardListNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonRewardListNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonRewardListNode:_visibleAllRewards(visible)
    for k,v in ipairs(self._commonIconTemplateList) do
        v:setVisible(visible)
    end
    for k,v in ipairs(self._nodeOrList) do
        v:setVisible(visible)
    end
    for k,v in ipairs(self._nodeAddList) do
        v:setVisible(visible)
    end
end

function CommonRewardListNode:_getCommonIconTemplate(index)
    local commonIconTemplate = self._commonIconTemplateList[index]    
    if not commonIconTemplate then
        local CSHelper = require("yoka.utils.CSHelper")
		commonIconTemplate = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
        --commonIconTemplate:setScale(0.76)
        self._commonIconTemplate:getParent():addChild(commonIconTemplate)
        self._commonIconTemplateList[index] = commonIconTemplate  
    end
    return commonIconTemplate
end

function CommonRewardListNode:_getNodeOr(index)
    local node = self._nodeOrList[index]    
    if not node then
        node = self._nodeOr:clone()
         self._nodeOr:getParent():addChild(node)
         node:setVisible(false)
        self._nodeOrList[index] = node
    end

    return  node
end

function CommonRewardListNode:_getNodeAdd(index)
    local node = self._nodeAddList[index]    
    if not node then
         node = self._nodeAdd:clone()
         self._nodeAdd:getParent():addChild(node)
         node:setVisible(false)
         self._nodeAddList[index] = node
    end

    return  node
end

function CommonRewardListNode:_updateRewards(rewards,rewardsTypes)
    self:_visibleAllRewards(false)
    local startPositionX = self._commonIconTemplate:getPositionX()
    local lastRewardType = nil
    local nodeOrCount = 0
    local nodeAddCount = 0
    local rewardNum = math.min(#rewards,#rewardsTypes)
    for i = 1,rewardNum,1 do
        local reward = rewards[i]
        local rewardType = rewardsTypes[i]
      
        local commonIconTemplate = self:_getCommonIconTemplate(i)
        commonIconTemplate:setVisible(true)
        commonIconTemplate:unInitUI()
        commonIconTemplate:initUI(reward.type, reward.value, reward.size)
        commonIconTemplate:setTouchEnabled(true)
        commonIconTemplate:showCount(true)
       
        if lastRewardType then
            local gap = 0
            local node = nil
            if rewardType ~= lastRewardType then  
                nodeAddCount = nodeAddCount + 1 
                node = self:_getNodeAdd(nodeAddCount)
                gap = self._gapParams.gapAdd
            elseif lastRewardType == CustomActivityConst.REWARD_TYPE_SELECT then     
                nodeOrCount = nodeOrCount + 1 
                node = self:_getNodeOr(nodeOrCount)
                gap = self._gapParams.gapOr
            elseif rewardType == CustomActivityConst.REWARD_TYPE_ALL  then    
                gap = self._gapParams.gap
            end
        
            local positionX = startPositionX + gap
            if node then
                node:setVisible(true)
                node:setPositionX((startPositionX + positionX)/2)
            end
            commonIconTemplate:setPositionX(positionX)

            startPositionX = positionX
        end
        lastRewardType = rewardType
    end
    local templateSize = self._commonIconTemplate:getContentSize()
    local size = self._scrollView:getContentSize()

    self._scrollView:getInnerContainer():setPositionX(0)
    self._scrollView:getInnerContainer():setContentSize(cc.size(startPositionX + size.width,size.height))
    self._scrollView:setContentSize(cc.size(
        math.min(self._gapParams.scrollWidth,startPositionX + size.width) ,size.height))
        logWarn("xxas---------------"..(startPositionX + size.width))
end


--
--@rewards:奖励数组
--@rewardTypes：奖励类型数组
function CommonRewardListNode:updateInfo(rewards,rewardTypes)
    self:_updateRewards(rewards,rewardTypes)
end

--@gap：两个固定奖励之间的间隔
--@gapAdd：加号两边奖励之间的间隔
--@gapOr：或两边奖励之间的间隔
function CommonRewardListNode:setGaps(gap,gapAdd,gapOr,scrollWidth)
    self._gapParams.gap = gap
    self._gapParams.gapAdd = gapAdd
    self._gapParams.gapOr = gapOr
    if scrollWidth then
        self._gapParams.scrollWidth = scrollWidth
    end
    
end

return CommonRewardListNode