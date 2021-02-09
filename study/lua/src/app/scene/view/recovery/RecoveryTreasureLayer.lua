--
-- Author: Liangxu
-- Date: 2017-10-14 16:44:46
-- 宝物回收
local ViewBase = require("app.ui.ViewBase")
local RecoveryTreasureLayer = class("RecoveryTreasureLayer", ViewBase)
local RecoveryTreasureNode = require("app.scene.view.recovery.RecoveryTreasureNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")

function RecoveryTreasureLayer:ctor(sceneId)
	self._fileNode1 = nil --回收单件1
	self._fileNode2 = nil --回收单件2
	self._fileNode3 = nil --回收单件3
	self._fileNode4 = nil --回收单件4
	self._fileNode5 = nil --回收单件5
	self._buttonAutoAdd = nil --自动添加按钮
	self._buttonRecovery = nil --回收按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RecoveryTreasureLayer", "recovery"),
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
	RecoveryTreasureLayer.super.ctor(self, resource, sceneId)
end

function RecoveryTreasureLayer:onCreate()
	for i = 1, 5 do
		self["_node"..i] = RecoveryTreasureNode.new(self["_fileNode"..i], i, handler(self, self._onClickAdd), handler(self, self._onClickDelete))
	end
	self._buttonAutoAdd:setString(Lang.get("recovery_btn_auto_add"))
	self._buttonRecovery:setString(Lang.get("recovery_btn_recovery"))
	self._textTip:setString(Lang.get("recovery_tip_5"))
end

function RecoveryTreasureLayer:onEnter()
	self._signalTreasureRecovery = G_SignalManager:add(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS, handler(self, self._treasureRecoverySuccess))
	
	self._recoveryTreasureList = {}
	self:_updateView()
end

function RecoveryTreasureLayer:onExit()
	self._signalTreasureRecovery:remove()
	self._signalTreasureRecovery = nil
end

function RecoveryTreasureLayer:initInfo()
	self._recoveryTreasureList = {}
	self:_updateView()
end

function RecoveryTreasureLayer:_resetTreasureNode()
	for i = 1, 5 do
		self["_node"..i]:reset()

	end
	self._recoveryTreasureList = {}
	self:_updateView()
end

function RecoveryTreasureLayer:_updateView()
	for i = 1, 5 do
		local treasureData = self:getTreasureWithIndex(i)
		if treasureData then
			self["_node"..i]:updateInfo(treasureData:getBase_id())
		else
			self["_node"..i]:updateInfo(nil)
		end
	end
end

function RecoveryTreasureLayer:_onButtonAutoAddClicked()
	local list = G_UserData:getTreasure():getRecoveryAutoList()
	if #list == 0 then
		G_Prompt:showTip(Lang.get("recovery_auto_add_no_treasure"))
		return
	end
	for i = 1, 5 do
		local treasureData = self:getTreasureWithIndex(i)
		if treasureData == nil then
			for j, data in ipairs(list) do
				if not self:checkIsAdded(data) then
					self:insertTreasure(i, data)
					break
				end
			end
		end
	end

	self:_updateView()
end

function RecoveryTreasureLayer:_onButtonRecoveryClicked()
	local count = self:getTreasureCount()
	if count <= 0 then
		G_Prompt:showTip(Lang.get("recovery_no_treasure_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(self._recoveryTreasureList, RecoveryConst.RECOVERY_TYPE_5, handler(self, self._doRecovery))
	popupRecoveryPreview:openWithAction()
end

function RecoveryTreasureLayer:_doRecovery()
	local recoveryId = {}
	for k, data in pairs(self._recoveryTreasureList) do
		table.insert(recoveryId, data:getId())
	end
	G_UserData:getTreasure():c2sRecoveryTreasure(recoveryId)
	self:_setBtnEnable(false)
end

function RecoveryTreasureLayer:_setBtnEnable(enable)
	self._buttonAutoAdd:setEnabled(enable)
	self._buttonRecovery:setEnabled(enable)
end

function RecoveryTreasureLayer:_onClickAdd()
	local PopupCheckTreasureHelper = require("app.ui.PopupCheckTreasureHelper")
	local popup = require("app.ui.PopupCheckTreasure").new(self)
	local callBack = handler(self, self._updateView)
	popup:updateUI(PopupCheckTreasureHelper.FROM_TYPE1, callBack)
	popup:openWithAction()
end

function RecoveryTreasureLayer:_onClickDelete(pos)
	self._recoveryTreasureList[pos] = nil
end

function RecoveryTreasureLayer:_treasureRecoverySuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
	self:_playTreasureFlyEffect(awards)
end

function RecoveryTreasureLayer:_playTreasureFlyEffect(awards)
	local function callback()
		self:_playShake(awards)
	end
	local finishPlayed = false
	for i = 1, 5 do
		local data = self:getTreasureWithIndex(i)
		if data then
			local finishCallback = nil
			if finishPlayed == false then --结束特效只播一次
				finishCallback = callback
				finishPlayed = true
			end
			self["_node"..i]:playFlyEffect(self._nodeFlyTarget, finishCallback)
		end
	end
end

function RecoveryTreasureLayer:_playShake(awards)
	-- G_EffectGfxMgr:applySingleGfx(self._imageLu, "smoving_zhuangbei", callback, nil, nil)
	self:_playLight(awards)
end

function RecoveryTreasureLayer:_playLight(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "finish" then
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    		PopupGetRewards:showRewards(awards)

    		self:_resetTreasureNode()
    		self:_setBtnEnable(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_huishou", effectFunction, eventFunction , false)
end

function RecoveryTreasureLayer:getTreasureWithIndex(pos)
	return self._recoveryTreasureList[pos]
end

function RecoveryTreasureLayer:insertTreasure(pos, data)
	if self._recoveryTreasureList[pos] == nil then
		self._recoveryTreasureList[pos] = data
	end
end

function RecoveryTreasureLayer:deleteTreasureWithTreasureId(treasureId)
	for k, data in pairs(self._recoveryTreasureList) do
		if data:getId() == treasureId then
			self._recoveryTreasureList[k] = nil
			break
		end
	end
end

function RecoveryTreasureLayer:checkIsMaxCount()
	local nowCount = self:getTreasureCount()
	return nowCount >= RecoveryConst.RECOVERY_TREASURE_MAX
end

function RecoveryTreasureLayer:getTreasureCount()
	local count = 0
	for k, data in pairs(self._recoveryTreasureList) do
		if data ~= nil then
			count = count + 1
		end
	end
	return count
end

function RecoveryTreasureLayer:checkIsAdded(treasureData)
	if treasureData == nil then
		return false
	end

	for k, data in pairs(self._recoveryTreasureList) do
		if treasureData:getId() == data:getId() then
			return true
		end
	end
	return false
end

function RecoveryTreasureLayer:getTreasureData()
	return self._recoveryTreasureList
end

return RecoveryTreasureLayer