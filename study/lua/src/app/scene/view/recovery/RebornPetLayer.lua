--
-- Author: Liangxu
-- Date: 2017-04-28 10:29:08
-- 武将重生
local ViewBase = require("app.ui.ViewBase")
local RebornPetLayer = class("RebornPetLayer", ViewBase)
local RebornPetNode = require("app.scene.view.recovery.RebornPetNode")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local AudioConst = require("app.const.AudioConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function RebornPetLayer:ctor(sceneId)
	self._fileNode = nil --武将
	self._buttonReborn = nil --重生按钮
	self._textTip = nil --提示字

	local resource = {
		file = Path.getCSB("RebornPetLayer", "recovery"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonReborn = {
				events = {{event = "touch", method = "_onButtonRebornClicked"}},
			},
		},
	}
	RebornPetLayer.super.ctor(self, resource, sceneId)
end

function RebornPetLayer:onCreate()
	self._buttonReborn:setString(Lang.get("reborn_btn"))
	self._textTip:setString(Lang.get("recovery_tip_10"))
	self._node = RebornPetNode.new(self._fileNode, handler(self, self._onClickAdd), handler(self, self._onClickDelete))

	self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
	local costCount = RecoveryDataHelper.getRebornCostCount()
	self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	self._fileNodeCost:setTextColor(Colors.DARK_BG_ONE)
end

function RebornPetLayer:onEnter()
	self._signalPetReborn = G_SignalManager:add(SignalConst.EVENT_PET_REBORN_SUCCESS, handler(self, self._heroRebornSuccess))
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornPetLayer:onExit()
	self._signalPetReborn:remove()
	self._signalPetReborn = nil
end

function RebornPetLayer:initInfo()
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornPetLayer:_updateView()
	local heroData = self:getRebornHeroData()
	if heroData then
		local baseId = heroData:getBase_id()
		self._node:updateInfo(baseId)
	else
		self._node:updateInfo(nil)
	end
end

function RebornPetLayer:_onButtonRebornClicked()
	local heroData = self:getRebornHeroData()
	if heroData == nil then
		G_Prompt:showTip(Lang.get("reborn_no_pet_tip"))
		return
	end
	local popupRecoveryPreview = PopupRecoveryPreview.new(heroData, RecoveryConst.RECOVERY_TYPE_10, handler(self, self._doReborn))
	popupRecoveryPreview:openWithAction()
end

function RebornPetLayer:_doReborn()
	local costCount = RecoveryDataHelper.getRebornCostCount()
	local success, popFunc = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
	if not success then
		return
	end

	local recoveryId = self._rebornHeroData:getId()
	G_UserData:getPet():c2sPetReborn(recoveryId)
	self._buttonReborn:setEnabled(false)
end

function RebornPetLayer:_onClickAdd()
	local PopupChoosePetHelper = require("app.ui.PopupChoosePetHelper")
	local isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE4)
	if isEmpty then
		G_Prompt:showTip(Lang.get("pet_popup_list_empty_tip"..PopupChoosePetHelper.FROM_TYPE4))
	else
		local popup = require("app.ui.PopupChoosePet").new()
		local callBack = handler(self,self._onChooseHero)
		popup:setTitle(Lang.get("recovery_choose_pet_title"))
		popup:updateUI(PopupChoosePetHelper.FROM_TYPE4, callBack)
		popup:openWithAction()
	end
end

function RebornPetLayer:_onClickDelete()
	self:setRebornHeroData(nil)
end

function RebornPetLayer:_heroRebornSuccess(eventName, awards)
	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
    self:_playEffect(awards)
end

function RebornPetLayer:_playEffect(awards)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "start" then
			G_EffectGfxMgr:applySingleGfx(self._fileNode, "smoving_zhuangbei", nil, nil, nil)
		elseif event == "play" then
			self._fileNode:setVisible(false)
		elseif event == "finish" then
			local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    		PopupGetRewards:showRewards(awards)
    		self:_resetHeroNode()
    		self._buttonReborn:setEnabled(true)
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_chongsheng", effectFunction, eventFunction , false)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_REBORN) --播音效
end

function RebornPetLayer:_resetHeroNode()
	self._fileNode:setVisible(true)
	self:setRebornHeroData(nil)
	self:_updateView()
end

function RebornPetLayer:setRebornHeroData(data)
	self._rebornHeroData = data
end

function RebornPetLayer:getRebornHeroData()
	return self._rebornHeroData
end

function RebornPetLayer:_onChooseHero(heroId)
	local data = G_UserData:getPet():getUnitDataWithId(heroId)
	self:setRebornHeroData(data)
	self:_updateView()
end

return RebornPetLayer