local ViewBase = require("app.ui.ViewBase")
local StageNode = class("ChapterView", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

StageNode.SCALE = 0.8
StageNode.STAR_DELAY = 0.3		--美一个星星掉下的间隔
StageNode.STAR_SCALE = 0.7
StageNode.TALK_WIDTH = 300		--说话长度

function StageNode:ctor(stageData, callback, isFamous)
    self._stageInfo = stageData:getConfigData()
    self._stageData = stageData
	self:setName("stageId_"..self._stageInfo.id)
	self._nodeSword = nil
	self._isShow = false
	self._nodeInfo = nil		--顶部信息栏
	self._panelAvatar = nil		--avatarShow
	self._panelTouch = nil		--触摸板
	self._enterCallback = nil		--进入后回掉函数
	self._isFamous = isFamous
	

	self._starPanel1 = nil		--星1
	self._starPanel2 = nil		--星2
	self._starPanel3 = nil		--星3

	self._starEftCount = 0 		--播放星星的数量
	self._starEftFinish = 0		--完成播放动画的数量
	self._star = self._stageData:getStar()		--记录一下创建的时候的星数

	self._callback = callback
	self._dropPanelSize = nil
	self._dropHeroData = {}

	if self._stageData:isIs_finished() then
		self._isPass = true
		self._isShow = true
	else 
		self._isPass = false
	end
    local resource = {
		file = Path.getCSB("StageNode", "stage"),
		size = {1136, 640},
        binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	StageNode.super.ctor(self, resource)
end

function StageNode:getStageId()
	return self._stageInfo.id
end

function StageNode:onCreate()
    self._panelTouch:setSwallowTouches(false)
    self:_createHeroSpine()
	self._stageName:setString(self._stageInfo.name)
	self._stageName:setColor(Colors.getColor(self._stageInfo.color))
	self._stageName:enableOutline(Colors.getColorOutline(self._stageInfo.color), 1)
	local nameWidth = self._stageName:getContentSize().width
	self._imageNameBG:setContentSize(cc.size(nameWidth + 65, 33))
	self._starPanel = {self._starPanel1, self._starPanel2, self._starPanel3}

	self:_createUIGuideNode()

	local size = self._panelGet:getContentSize()
	self._dropPanelSize = size
	self._panelGet:setVisible(false)
end

function StageNode:onEnter()
	if self._isFamous then
		for i, v in pairs(self._starPanel) do
			v:setVisible(false)
		end
	end
end

--人物进入动画
function StageNode:playEnter(callBack)
	-- self._isPass = true
	-- self:setVisible(true)
	self._isShow = true
	self._enterCallback = callBack
	self:setVisible(self._isShow)
	self:_createSwordEft()
	self._nodeInfo:setVisible(false)
	self._nodeSword:setVisible(false)
	self._panelTouch:setVisible(false)
	self._panelAvatar:setBubbleVisible(false)

	G_EffectGfxMgr:applySingleGfx(self._panelAvatar, "smoving_guaiwu_jump", handler(self, self._finishAnimCallback), nil, nil)
	-- G_EffectGfxMgr:applySingleGfx(self._panelAvatar, "smoving_guaiwu_jump", handler(self, self._finishAnimCallback), nil, nil)

	
	if G_TutorialManager:isDoingStep() == false then
		local UIGuideConst = require("app.const.UIGuideConst")
		self._uiGuideRootNode:bindUIGuide(UIGuideConst.GUIDE_TYPE_STAGE_ICON,self._stageInfo.id,self._nodeSword)
	end

end

function StageNode:_createUIGuideNode()
	local UIGuideConst = require("app.const.UIGuideConst")
	local UIGuideRootNode = require("app.scene.view.uiguide.UIGuideRootNode")
	if not self._uiGuideRootNode then
		self._uiGuideRootNode = UIGuideRootNode.new()
		self:addChild(self._uiGuideRootNode)
	end
end

function StageNode:isPass()
	return self._isPass
end



--进入完成后回掉
function StageNode:_finishAnimCallback()
	self._nodeInfo:setVisible(true)
	self._nodeSword:setVisible(true)
	self._panelTouch:setVisible(true)	
	if G_UserData:getStage():isLastStage(self._stageInfo.id) then
		self._panelAvatar:turnBubble()
	end
	self._panelAvatar:setBubble(self._stageInfo.talk,nil,2,true,StageNode.TALK_WIDTH)
	if self._enterCallback then
		self._enterCallback()
	end

	self:_refreshHeroGet()
	
end

--刷新人物节点状态
function StageNode:refreshStageNode()
	-- if not self._isShow then	--如果是不显示的，再来判断是否需要显示
	-- 	self._isShow = self._stageData:isIs_finished()
	-- end
	if self._stageData:isIs_finished() then
		self._uiGuideRootNode:unbindAllUIGuide()
		self._nodeSword:removeAllChildren()
	end
	self:setVisible(self._isShow)
	self:_refreshStar()
	if self._stageData:isIs_finished() then
		self._panelAvatar:setBubbleVisible(false)
	end
	local height = self._panelAvatar:getHeight()
	self._nodeInfo:setPositionY(height*StageNode.SCALE)

	self:_refreshHeroGet()
end

--刷新星星
function StageNode:_refreshStar()
	local star = self._stageData:getStar()
	local needEft = false
	if star > self._star then
		needEft = true
		self._star = star
	end
	if needEft then
		self:_setStarCount(0)
		self:_playStarEft()
		return 
	end
	self:_setStarCount(star)
end

--设置星星数量
function StageNode:_setStarCount(count)
	for i, v in pairs(self._starPanel) do
		local starNode = v:getSubNodeByName("Star")
		if i <= count then
			starNode:setVisible(true)
		else
			starNode:setVisible(false)
		end
	end
end

--创建剑特效
function StageNode:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
end

--创建人物spine
function StageNode:_createHeroSpine()
	self._panelAvatar:updateUI(self._stageInfo.res_id)
	self._panelAvatar:setTouchEnabled(false)	
	self._panelAvatar:setScale(StageNode.SCALE)
	self._panelAvatar:turnBack()
	self._panelAvatar:moveTalkToTop()
end

--人物面板点击
function StageNode:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:showStageDetail()
	end
end

--打开详细面板
function StageNode:showStageDetail()
	-- local popStageDetail = require("app.scene.view.stage.PopupStageDetail").new(self._stageInfo.id)
	-- popStageDetail:openWithAction()
	if self._isFamous then
		local popupFamous = require("app.scene.view.stage.PopupFamousDetail").new(self._stageInfo.id)
		popupFamous:open()
	else
		self._callback(self._stageInfo.id)
	end
end

--返回人物触摸面板
function StageNode:getPanelTouch()
	return self._panelTouch
end

--播放星星特效
function StageNode:_playStarEft()
	local star = self._stageData:getStar()
	self._starEftCount = star
	self._starEftFinish = 0
	for i = 1, star do
		local starPanel = self._starPanel[i]
		local delayTime = StageNode.STAR_DELAY * (i-1)
		self:_playSingleStarEft(starPanel, delayTime)
	end
end

--播放单个星星动画
function StageNode:_playSingleStarEft(node, delayTimme)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_xiaoxingxing"then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect 
        end
    end
	local function eventFunction(event)
		if event == "finish" then
			self._starEftFinish = self._starEftFinish + 1
			if self._starEftFinish >= self._starEftCount then
				--动画全部完结
				G_SignalManager:dispatch(SignalConst.EVENT_STAR_EFFECT_END)
			end
		end
	end
	local function funcStar()	
		local effect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_xiaoxingxing", effectFunction, eventFunction, false )	
		local nodeSize = node:getContentSize()
		local pos = cc.p(nodeSize.width*0.5, nodeSize.height*0.5)
		effect:setPosition(pos)
		effect:setScale(StageNode.STAR_SCALE)
	end
	local action1 = cc.DelayTime:create(delayTimme)
	local action2 = cc.CallFunc:create(function() funcStar() end)
	local action = cc.Sequence:create(action1, action2)
	node:runAction(action)
end

function StageNode:_isDropDataSame(dropHeroData,newDropHeroData)
	if #dropHeroData ~= #newDropHeroData then
	 	return false
	end
	for k,v in ipairs(dropHeroData)	do
		local v2 = newDropHeroData[k]
		if v.type ~= v2.type or  v.value ~= v2.value then
			return false
		end
	end
	return true
end


function StageNode:_refreshHeroGet()	
	if G_UserData:getBase():getLevel() < UserDataHelper.getParameter(ParameterIDConst.STAGE_SHOW_HERO) then
		self._panelGet:setVisible(false)
		return
	end
	local ChapterCityDropHeroCell = require("app.scene.view.chapter.ChapterCityDropHeroCell")
	local dropHeroDatas =  self._stageData:getDropHintDatas()--耗时比较长
	if self:_isDropDataSame(self._dropHeroData,dropHeroDatas) then
		self._panelGet:setVisible(#self._dropHeroData > 0)
		return
	end
	self._dropHeroData = dropHeroDatas
	self._listItem:clearAll()
	for i, data in ipairs(dropHeroDatas) do
		local cell = ChapterCityDropHeroCell.new()
		cell:updateUI(data.type,data.value,data.size)
		self._listItem:pushBackCustomItem(cell)
	end
	dump(dropHeroDatas)
	if #dropHeroDatas <= 0 then
		self._panelGet:setVisible(false)
		return
	end
	self._panelGet:setVisible(true)
	self._listItem:doLayout()
	local size = self._listItem:getInnerContainer():getContentSize()
	dump(size)
	self._listItem:setContentSize(size)
	self._panelGet:setContentSize(self._dropPanelSize.width + size.width,self._dropPanelSize.height)
end

return StageNode
