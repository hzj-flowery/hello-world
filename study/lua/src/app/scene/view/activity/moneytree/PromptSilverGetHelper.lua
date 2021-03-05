local PromptSilverGetHelper = class("PromptSilverGetHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst	 = require("app.const.DataConst")

PromptSilverGetHelper.PROMPT_POS = {0,35,76,118,160}--飘字的位置
PromptSilverGetHelper.PROMPT_MAX_NUM = 5--最大提示数量

PromptSilverGetHelper.PROMPT_NODE_DATA = {node = nil,state = 0}

PromptSilverGetHelper.STATE_REUSE  = 0--可复用状态
PromptSilverGetHelper.STATE_WAIT  = 1--等待运动状态
PromptSilverGetHelper.STATE_DO_ACTION  = 2--作动画状态
PromptSilverGetHelper.STATE_ACTION_FINISH  = 3--动画结束

function PromptSilverGetHelper:ctor()
	self._nodePrompt = nil
    self._promptShowNodeList = {}--提示
	self._promptWaitRunNodeList = {}--提示
	self._promptAllNodeList = {}--提示{node = nil,state = 1}
	self._isInRunPrompt = false
end

function PromptSilverGetHelper:setPromptRootNode(node)
	self._nodePrompt = node
end

function PromptSilverGetHelper:_runFadeInAction(nodeData,finishCallback)
	local callAction = cc.CallFunc:create(function() 
		nodeData.state = PromptSilverGetHelper.STATE_ACTION_FINISH 
		if finishCallback then 
			finishCallback()
		end

		if nodeData.node then
			nodeData.node:playCrtEffect()
		end
	end)
	local action = cc.FadeIn:create(0.2)
	local runningAction = cc.Sequence:create(cc.DelayTime:create(0.1),action,callAction)
	nodeData.node:setOpacity(0)
	nodeData.node:runAction(runningAction)
end

function PromptSilverGetHelper:_runFadeOutAction(nodeData,finishCallback)
	local callAction = cc.CallFunc:create(function() 
		self:_recyclePromptNodeData(nodeData)
		if finishCallback then 
			finishCallback()
		end
	end)
	local action = cc.FadeOut:create(0.1)
	local runningAction = cc.Sequence:create(action,callAction)
	nodeData.node:runAction(runningAction)
end

function PromptSilverGetHelper:_runPopAction(nodeData,posY,finishCallback)
	local callAction = cc.CallFunc:create(function() 
		nodeData.state = PromptSilverGetHelper.STATE_ACTION_FINISH 
		if finishCallback then 
			finishCallback()
		end
	end)
	local action = cc.MoveTo:create(0.2, cc.p(0,posY))
	local runningAction = cc.Sequence:create(action,callAction)
	nodeData.node:runAction(runningAction)
end

function PromptSilverGetHelper:addPrompt(money,crt)
	local promptData = self:_findPromptNodeData()
	self:_addWaitRunPromptNodeData(promptData)
	self:_refreshPromptNodeData(promptData,money,crt)

	if self._isInRunPrompt then
		return 
	end
	self:_popPrompt()
end

function PromptSilverGetHelper:_popPrompt()
	local popPromptNodeData = self:_popWaitPromptNodeData()
	if not popPromptNodeData then
		return 
	end
	self._isInRunPrompt = true
	local currPromptNum = #self._promptShowNodeList--当前提示数量
	local maxPromptNum =  PromptSilverGetHelper.PROMPT_MAX_NUM
	local count = 0
	local maxCount = 1

	local finishCallback = function()
		count = count + 1
		if count >= maxCount then
			self._isInRunPrompt = false
			self:_popPrompt()
		end
	end

	--移动到第一格子
	popPromptNodeData.state = PromptSilverGetHelper.STATE_DO_ACTION 
	popPromptNodeData.node:setVisible(true)
	self:_runFadeInAction(popPromptNodeData,finishCallback)
	for i = 1,maxPromptNum,1 do
		local nodeData = self._promptShowNodeList[i]
		if nodeData then
			if i < maxPromptNum then--移动到下一格
				local posY = PromptSilverGetHelper.PROMPT_POS[i+1]
				self:_runPopAction(nodeData,posY,finishCallback)
				nodeData.state = PromptSilverGetHelper.STATE_DO_ACTION 
				maxCount = maxCount +1
			else
				self:_runFadeOutAction(nodeData,finishCallback)
				nodeData.state = PromptSilverGetHelper.STATE_DO_ACTION 
				maxCount = maxCount +1
			end

		end
		
	end

	for i = maxPromptNum-1,1,-1 do
		local nodeData = self._promptShowNodeList[i]
		self._promptShowNodeList[i+1] = nodeData
	end
	self._promptShowNodeList[1] = popPromptNodeData
end

function PromptSilverGetHelper:_popWaitPromptNodeData()
	if #self._promptWaitRunNodeList <= 0 then
		return nil
	end
	local promptData = self._promptWaitRunNodeList[1]
	table.remove( self._promptWaitRunNodeList, 1)
	return promptData
end

function PromptSilverGetHelper:_addWaitRunPromptNodeData(nodeData)
	nodeData.state = PromptSilverGetHelper.STATE_WAIT --等待状态
	table.insert(self._promptWaitRunNodeList,nodeData)
end

function PromptSilverGetHelper:_findPromptNodeData()
	for k,v in ipairs(self._promptAllNodeList) do
		if v.state == PromptSilverGetHelper.STATE_REUSE then
			return v
		end
	end
	local nodeData = self:_createPromptNodeData()
	return nodeData
end

function PromptSilverGetHelper:_recyclePromptNodeData(nodeData)
	nodeData.state = PromptSilverGetHelper.STATE_REUSE
	nodeData.node:setVisible(false)
	nodeData.node:setOpacity(255)
	nodeData.node:setPositionY(0)
	nodeData.node:setCrt(0)
end

--创建一个提示
function PromptSilverGetHelper:_createPromptNodeData( )
	local CSHelper = require("yoka.utils.CSHelper")-- 创建弹框
    local node =  CSHelper.loadResourceNode(Path.getCSB("CommonPromptSilverNode", "common"))
	self._nodePrompt:addChild(node)
    node:setPosition(cc.p(0, 0))
	node:setVisible(false)
--	cc.bind(node, "CommonPromptSilverNode")
    local nodeData = {node = node,state = PromptSilverGetHelper.STATE_REUSE}
    table.insert(self._promptAllNodeList,nodeData)
    return nodeData
end


function PromptSilverGetHelper:_refreshPromptNodeData(nodeData,money,crt)
	nodeData.node:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, money)
	nodeData.node:setCrt(crt)
end


return PromptSilverGetHelper