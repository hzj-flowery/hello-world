-- Author: Conley
local CommonItemListExchangeNode = class("CommonItemListExchangeNode")
local CustomActivityConst = require("app.const.CustomActivityConst")
--默认参数
local DEFAULT_PARAM =
{
  maxWidth = 300,
  gapExchange = 110,
  gap = 90,
  gapAdd = 95, 
  gapOr = 95,
}


local EXPORTED_METHODS = {
    "updateInfo",
    "setGaps",
}

function CommonItemListExchangeNode:ctor()
	self._target = nil
    self._gapParams = DEFAULT_PARAM
end

function CommonItemListExchangeNode:_init()
	self._commonIconTemplate = ccui.Helper:seekNodeByName(self._target, "CommonIconTemplate")
    cc.bind(self._commonIconTemplate, "CommonIconTemplate")
    self._scrollViewSrc = ccui.Helper:seekNodeByName(self._target, "ScrollViewSrc")
    self._scrollViewDst = ccui.Helper:seekNodeByName(self._target, "ScrollViewDst")
    self._nodeExchange = ccui.Helper:seekNodeByName(self._target, "NodeExchange")
    self._nodeOr = ccui.Helper:seekNodeByName(self._target, "NodeOr")
    self._nodeAdd = ccui.Helper:seekNodeByName(self._target, "NodeAdd")
    self._scrollViewList = {self._scrollViewSrc,self._scrollViewDst}
    self._commonIconTemplateList = {{self._commonIconTemplate},{}}
    self._nodeOrList = {{self._nodeOr},{}}
    self._nodeAddList = {{ self._nodeAdd},{}}

    self._scrollViewSrc:setScrollBarEnabled(false)
    self._scrollViewDst:setScrollBarEnabled(false)
    self._scrollViewDst:setSwallowTouches(false)
    local size = self._scrollViewSrc:getContentSize()
    self._templateSize = cc.size(size.width,size.height)
end

function CommonItemListExchangeNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonItemListExchangeNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonItemListExchangeNode:_visibleAllRewards(visible)
    for k1,v1 in ipairs(self._commonIconTemplateList) do 
        for k,v in ipairs(v1) do
            v:setVisible(visible)
        end
    end


    for k1,v1 in ipairs(self._nodeOrList) do 
        for k,v in ipairs(v1) do
            v:setVisible(visible)
        end
    end

    for k1,v1 in ipairs(self._nodeAddList) do 
        for k,v in ipairs(v1) do
            v:setVisible(visible)
        end
    end


end

function CommonItemListExchangeNode:_getCommonIconTemplate(type,index)
    local commonIconTemplate = self._commonIconTemplateList[type][index]    
    if not commonIconTemplate then
        local CSHelper = require("yoka.utils.CSHelper")
		commonIconTemplate = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
        self._scrollViewList[type]:addChild(commonIconTemplate)
        self._commonIconTemplateList[type][index] = commonIconTemplate  
    end
    return commonIconTemplate
end

function CommonItemListExchangeNode:_getNodeOr(type,index)
    local node = self._nodeOrList[type][index]  
    if not node then
        node = self._nodeOr:clone()
        self._scrollViewList[type]:addChild(node)
        node:setVisible(false)
        self._nodeOrList[type][index] = node
    end

    return  node
end

function CommonItemListExchangeNode:_getNodeAdd(type,index)
    local node = self._nodeAddList[type][index]    
    if not node then
         node = self._nodeAdd:clone()
         self._scrollViewList[type]:addChild(node)
         node:setVisible(false)
         self._nodeAddList[type][index] = node
    end

    return  node
end

function CommonItemListExchangeNode:_updateRewards(srcRewards,srcRewardsTypes,rewards,rewardsTypes)
    self:_visibleAllRewards(false)
 
    self:_updateSubRewards(1,srcRewards,srcRewardsTypes)
    self:_updateSubRewards(2,rewards,rewardsTypes)

    local srcScrollView = self._scrollViewList[1]
    local srcScrollViewSize = srcScrollView:getContentSize()

    local dstScrollView = self._scrollViewList[2]
    local dstScrollViewSize = dstScrollView:getContentSize()

    local templateSize = self._templateSize
    local templateWidth = templateSize.width 
 
    local totalWidth = srcScrollViewSize.width + dstScrollViewSize.width + self._gapParams.gapExchange-templateWidth
    if totalWidth > self._gapParams.maxWidth then
        logWarn("-------------")
        dump(dstScrollViewSize)
        local tempSize = cc.size(dstScrollViewSize.width,dstScrollViewSize.height)
         --需要设置滚动View总宽度
        dstScrollViewSize.width = self._gapParams.maxWidth - (srcScrollViewSize.width+self._gapParams.gapExchange-templateWidth)
        dump(dstScrollViewSize)
        logWarn("-------------")
        dstScrollView:setContentSize(dstScrollViewSize)
        dstScrollView:getInnerContainer():setContentSize(tempSize)
        srcScrollView:getInnerContainer():setContentSize(srcScrollViewSize)
        totalWidth = self._gapParams.maxWidth
    else
       
        dstScrollView:getInnerContainer():setContentSize(dstScrollViewSize)
        srcScrollView:getInnerContainer():setContentSize(srcScrollViewSize)
    end

    
    --设置滚动View位置和兑换Icon位置
    
    srcScrollView:setAnchorPoint(cc.p(1, 0.5))
    srcScrollView:setPosition(totalWidth-templateWidth*0.5,0)
    dstScrollView:setAnchorPoint(cc.p(0, 0.5))
    dstScrollView:setPosition(-templateWidth*0.5,0)
   
    self._nodeExchange:setPositionX( totalWidth-templateWidth*0.5-srcScrollViewSize.width + templateWidth*0.5
        -self._gapParams.gapExchange *0.5
    )

end

function CommonItemListExchangeNode:_updateSubRewards(type,rewards,rewardsTypes)
    local startPositionX = 0
    local lastRewardType = nil
    local nodeOrCount = 0
    local nodeAddCount = 0
    local rewardNum = math.min(#rewards,#rewardsTypes)
    local size = self._scrollViewList[type]:getContentSize()
    local templateSize = self._templateSize
    local halfTemplateWidth = templateSize.width * 0.5
    startPositionX = halfTemplateWidth

    size.width = 0
    for i = 1,rewardNum,1 do
        local reward = rewards[i]
        local rewardType = rewardsTypes[i]
      
        local commonIconTemplate = self:_getCommonIconTemplate(type,i)
        commonIconTemplate:setVisible(true)
        commonIconTemplate:unInitUI()
        commonIconTemplate:initUI(reward.type, reward.value, reward.size)
        commonIconTemplate:setTouchEnabled(true)
        commonIconTemplate:showCount(true)
        commonIconTemplate:setPositionY(templateSize.height*0.5)

        if lastRewardType then
            local gap = 0
            local node = nil
            if rewardType ~= lastRewardType then  
                nodeAddCount = nodeAddCount + 1 
                node = self:_getNodeAdd(type,nodeAddCount)
                gap = self._gapParams.gapAdd
            elseif lastRewardType == CustomActivityConst.REWARD_TYPE_SELECT then     
                nodeOrCount = nodeOrCount + 1 
                node = self:_getNodeOr(type,nodeOrCount)
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
        else
            commonIconTemplate:setPositionX(startPositionX)    
        end
        lastRewardType = rewardType
    end
    size.width = startPositionX + halfTemplateWidth
    self._scrollViewList[type]:setContentSize(size)
end


--@rewards:奖励数组
--@rewardTypes：奖励类型数组
function CommonItemListExchangeNode:updateInfo(srcRewards,srcRewardsTypes,dstRewards,dstRewardTypes)
    self:_updateRewards(srcRewards,srcRewardsTypes,dstRewards,dstRewardTypes)
end

--@itemGap：
--@gapExchange：
function CommonItemListExchangeNode:setGaps(gap,gapAdd,gapOr,gapExchange,maxWidth)
    self._gapParams.maxWidth = maxWidth
    self._gapParams.gap = gap
    self._gapParams.gapAdd = gapAdd
    self._gapParams.gapOr = gapOr
    self._gapParams.gapExchange = gapExchange
end

return CommonItemListExchangeNode