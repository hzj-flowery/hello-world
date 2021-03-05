--
-- Author: Liangxu
-- Date: 2017-04-27 18:04:31
-- 武将回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryHeroLayer = class("RecoveryHeroLayer", ViewBase)
local RecoveryHeroNode = require("app.scene.view.recovery.RecoveryHeroNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryHeroLayer:ctor(sceneId)

	self._fileNode1 = nil --武将回收单件1
	self._fileNode2 = nil --武将回收单件2
	self._fileNode3 = nil --武将回收单件3
	self._fileNode4 = nil --武将回收单件4
	self._fileNode5 = nil --武将回收单件5
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryHeroLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonAutoAdd = {
				events = {{event = "touch", method = "_onButtonAutoAddClicked"}},
			},
			_buttonRecovery = {
				events = {{event = "touch", method = "_onButtonRecoveryClicked"}},
			},
		},
	}
	self:setName("RecoveryHeroLayer")
	RecoveryHeroLayer.super.ctor(self, resource, sceneId)
end

function RecoveryHeroLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryHeroNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._targetPos = cc.p(self._nodeFlyTarget:getPosition())

	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_1"))
	self._showRedPoint = false
end

function RecoveryHeroLayer:onEnter()
	self._signalHeroRecovery = G_SignalManager:add(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, handler(self, self._heroRecoverySuccess))
	
	self._recoveryHeroList = {}
	-- self._widgetInfo = {}
	self:_updateView()
	self:updateRedPoint()

	
    --抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function RecoveryHeroLayer:onExit()
	self._signalHeroRecovery:remove()
	self._signalHeroRecovery = nil
end

function RecoveryHeroLayer:initInfo()
	self._recoveryHeroList = {}
	self:_updateView()
end

function RecoveryHeroLayer:_resetHeroNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryHeroList = {}
	self:_updateView()
end

function RecoveryHeroLayer:_updateView()
	for i = 1, 5 do
		local heroData = self:getHeroWithIndex(i)
		if heroData then
			local limitLevel = heroData:getLimit_level()
			local limitRedLevel = heroData:getLimit_rtg()
			self["_node"..i]:updateInfo(heroData:getBase_id(), limitLevel, limitRedLevel)
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryHeroLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getHero():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_hero"))
		return
	end
	for i = 1, 5 do
		local heroData = self:getHeroWithIndex(i)
		if heroData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertHero(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
	self:setRedPoint(false)
	self:updateRedPoint()
end

function RecoveryHeroLayer:_onButtonRecoveryClicked()
	local count = self:getHeroCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_hero_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryHeroList, RecoveryConst.RECOVERY_TYPE_1, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryHeroLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryHeroList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getHero():c2sHeroRecycle(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryHeroLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryHeroLayer:_onClickAdd()
	local PopupCheckHeroHelper = require("app.ui.PopupCheckHeroHelper")
	local popup = require("app.ui.PopupCheckHero").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckHeroHelper.FROM_TYPE2, callBack)
	popup:openWithAction()
end

function RecoveryHeroLayer:_onClickDelete(pos)
	self._recoveryHeroList[pos] = nil
end

function RecoveryHeroLayer:_heroRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playHeroFlyEffect(awards)
end

function RecoveryHeroLayer:_playHeroFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getHeroWithIndex(i)
		if data then
			local finishCallback = nil
			if finishPlayed == false then --结束特效只播一次
				finishCallback = callback
				finishPlayed = true
			end
			self["_node"..i]:playFlyEffect(finishCallback)
		end
	end
end

function RecoveryHeroLayer:_playShake(awards)
	self:_playLight(awards)
end

function RecoveryHeroLayer:_playLight(awards)
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	self:_resetHeroNode()
	self:_setBtnEnable(true)
	self:updateRedPoint()
end

function RecoveryHeroLayer:getHeroWithIndex(pos)
	return self._recoveryHeroList[pos]
end

function RecoveryHeroLayer:insertHero(pos, heroData)
	if self._recoveryHeroList[pos] == nil then
		self._recoveryHeroList[pos] = heroData
	end
end

function RecoveryHeroLayer:deleteHeroWithHeroId(heroId)
	for k, data in pairs(self._recoveryHeroList) do
		if data:getId() == heroId then
			self._recoveryHeroList[k] = nil
			break
		end
	end
end

function RecoveryHeroLayer:checkIsMaxCount()
	local nowCount = self:getHeroCount()
	return nowCount >= RecoveryConst.RECOVERY_HERO_MAX
end

function RecoveryHeroLayer:getHeroCount()
	local count = 0
	for k, data in pairs(self._recoveryHeroList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryHeroLayer:checkIsAdded(heroData)
	if heroData == nil then
		return false
	end

	for k, data in pairs(self._recoveryHeroList) do
		if heroData:getId() == data:getId() then
			return true
		end
	end
	return false
end

function RecoveryHeroLayer:getHeroData()
	return self._recoveryHeroList
end

function RecoveryHeroLayer:updateRedPoint()
	self._buttonAutoAdd:showRedPoint(self._showRedPoint)
end

function RecoveryHeroLayer:setRedPoint(show)
	self._showRedPoint = show
end

return RecoveryHeroLayer