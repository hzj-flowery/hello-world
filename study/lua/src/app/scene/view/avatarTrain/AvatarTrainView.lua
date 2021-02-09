--
-- Author: Liangxu
-- Date: 2017-12-25 14:23:21
-- 变身卡培养
local ViewBase = require("app.ui.ViewBase")
local AvatarTrainView = class("AvatarTrainView", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PopupRecoveryPreview = require("app.scene.view.recovery.PopupRecoveryPreview")
local RecoveryConst = require("app.const.RecoveryConst")
local AudioConst = require("app.const.AudioConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")

function AvatarTrainView:ctor(avatarId, isJumpWhenBack)
	self._avatarId = avatarId
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景

	local resource = {
		file = Path.getCSB("AvatarTrainView", "avatar"),
		size = {1136, 640},
		binding = {
			_buttonRecovery = {
				events = {{event = "touch", method = "_onButtonRecoveryClicked"}}
			},
			_buttonStr = {
				events = {{event = "touch", method = "_onButtonStrClicked"}}
			},
		}
	}
	
	AvatarTrainView.super.ctor(self, resource)
end

function AvatarTrainView:onCreate()
	self:_initData()
	self:_initView()
end

function AvatarTrainView:onEnter()
	self._signalAvatarEnhance = G_SignalManager:add(SignalConst.EVENT_AVATAR_ENHANCE_SUCCESS, handler(self, self._avatarEnhanceSuccess))
	self._signalAvatarReborn = G_SignalManager:add(SignalConst.EVENT_AVATAR_REBORN_SUCCESS, handler(self, self._avatarRebornSuccess))
	self:_updateData()
	self:_updateView()
end

function AvatarTrainView:onExit()
	self._signalAvatarEnhance:remove()
	self._signalAvatarEnhance = nil
	self._signalAvatarReborn:remove()
	self._signalAvatarReborn = nil
end

function AvatarTrainView:_initData()
	self._curData = nil
	self._curLevel = 0
	self._nextLevel = 0
	self._curAttr = {}
	self._nextAttr = {}
	self._costInfo = {}
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_AVATAR)
end

function AvatarTrainView:_initView()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_bianshenka")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end
	self._buttonStr:setString(Lang.get("avatar_detail_btn_str"))
	local roleBaseId = G_UserData:getHero():getRoleBaseId()
	self._fileNodeHeroName:setName(roleBaseId)
	self._fileNodeDetailTitle:setTitle(Lang.get("avatar_train_title_str"))
	self._fileNodeCostTitle:setTitle(Lang.get("avatar_train_title_cost"))
	self._fileNodeAvatar:setScale(1.4)
	self._materialIcon = nil
end

function AvatarTrainView:_updateData()
	self._curData = G_UserData:getAvatar():getUnitDataWithId(self._avatarId)
	self._curLevel = self._curData:getLevel()
	self._nextLevel = self._curLevel + 1
	local templet = self._curData:getConfig().levelup_cost
	local templet2MaxLevel = G_UserData:getAvatar():getTemplet2MaxLevel()
	local maxLevel = templet2MaxLevel[templet]
	if self._nextLevel > maxLevel then
		self._nextLevel = nil
	end
	self._curAttr = AvatarDataHelper.getAvatarLevelAttr(self._curLevel, templet)
	self._nextAttr = {}
	if self._nextLevel then
		self._nextAttr = AvatarDataHelper.getAvatarLevelAttr(self._nextLevel, templet)
	end
	self._costInfo = AvatarDataHelper.getAvatarSingleCost(self._curLevel, templet)

	self._recordAttr:updateData(self._curAttr)
	G_UserData:getAttr():recordPower()
end

function AvatarTrainView:_updateView()
	self:_updateShow()
	self:_updateTalent()
	self:_updateName()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateCost()
end

function AvatarTrainView:_updateShow()
	self._fileNodeAvatar:updateUI(self._curData:getBase_id())
end

function AvatarTrainView:_updateTalent()
	self._nodeTalent:removeAllChildren()

	local level = self._curData:getLevel()
	local templet = self._curData:getConfig().levelup_cost
	local nextTalentInfo = AvatarDataHelper.getNextTalentDes(level, templet)
	if nextTalentInfo then
		local talentInfo = Lang.get("avatar_train_talent_des", {
			name = nextTalentInfo.talent_name,
			des = nextTalentInfo.talent_description,
			unlock = nextTalentInfo.level,
		})
		local label = ccui.RichText:createWithContent(talentInfo)
		label:setAnchorPoint(cc.p(0.5, 1))
		label:ignoreContentAdaptWithSize(false)
		label:setContentSize(cc.size(340,0))
		label:formatText()
		self._nodeTalent:addChild(label)
	end
end

function AvatarTrainView:_updateName()
	local baseId = self._curData:getBase_id()
	self._fileNodeAvatarName:setName(baseId)
end

function AvatarTrainView:_updateLevel()
	self._textOldLevel:setString(self._curLevel)
	local nextLevel = self._nextLevel and self._nextLevel or Lang.get("hero_break_txt_reach_limit")
	self._textNewLevel:setString(nextLevel)
end

function AvatarTrainView:_updateAttr()
	local curDes = TextHelper.getAttrInfoBySort(self._curAttr)
	for i = 1, 4 do
		local curInfo = curDes[i]
		if curInfo then
			self["_fileNodeAttr"..i]:setVisible(true)
			self["_fileNodeAttr"..i]:updateInfo(curInfo.id, self._curAttr[curInfo.id], self._nextAttr[curInfo.id], 4)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end
end

function AvatarTrainView:_updateCost()
	local isReachMax = self._nextLevel == nil
	self._fileNodeCostTitle:setVisible(not isReachMax)
	self._panelCost:removeAllChildren()
	self._materialIcon = nil
	self._nodeResource:setVisible(false)
	self._buttonStr:setEnabled(not isReachMax)
	if isReachMax then --达到顶级了
		local sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
		local size = self._panelCost:getContentSize()
		sp:setPosition(cc.p(size.width/2, size.height/2))
		self._panelCost:addChild(sp)
		return
	end

	local itemInfo = {}
	for value, size in pairs(self._costInfo[TypeConvertHelper.TYPE_ITEM]) do
		itemInfo = {type = TypeConvertHelper.TYPE_ITEM, value = value, size = size}
		break
	end
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
	node:updateView(itemInfo)
	node:setPosition(cc.p(159, 56))
	self._panelCost:addChild(node)
	self._materialIcon = node

	local resInfo = {}
	for value, size in pairs(self._costInfo[TypeConvertHelper.TYPE_RESOURCE]) do
		resInfo = {type = TypeConvertHelper.TYPE_RESOURCE, value = value, size = size}
		break
	end
	self._nodeResource:updateUI(resInfo.type, resInfo.value, resInfo.size)
	self._nodeResource:setTextColor(Colors.BRIGHT_BG_TWO)
	self._nodeResource:setVisible(true)
end

function AvatarTrainView:_onButtonRecoveryClicked()
	if self._curData:isEquiped() then
		G_Prompt:showTip(Lang.get("avatar_recovery_condition_tip_1"))
		return
	end

	if not self._curData:isTrained() then
		G_Prompt:showTip(Lang.get("avatar_recovery_condition_tip_2"))
		return
	end

	local popup = PopupRecoveryPreview.new(self._curData, RecoveryConst.RECOVERY_TYPE_9, handler(self, self._doReborn))
	popup:openWithAction()
end

function AvatarTrainView:_onButtonStrClicked()
	local isReachCondition = self._materialIcon and self._materialIcon:isReachCondition() or false
	if not isReachCondition then
		G_Prompt:showTip(Lang.get("avatar_train_condition_1"))
		return
	end

	--检查花费
	local resInfo = {}
	for value, size in pairs(self._costInfo[TypeConvertHelper.TYPE_RESOURCE]) do
		resInfo = {type = TypeConvertHelper.TYPE_RESOURCE, value = value, size = size}
		break
	end
	local isOk = LogicCheckHelper.enoughMoney(resInfo.size)
	if not isOk then
		G_Prompt:showTip(Lang.get("avatar_train_condition_2"))
		return
	end

	local avatarId = self._curData:getId()
	G_UserData:getAvatar():c2sEnhanceAvatar(avatarId)
	self:_setButtonEnable(false)
end

function AvatarTrainView:_avatarEnhanceSuccess(eventName, avatarId)
	self:_updateData()
	self:_updateTalent()

	self:_playSingleBallEffect()
	self:_updateCost()
end

function AvatarTrainView:_doReborn()
	local avatarId = self._curData:getId()
	G_UserData:getAvatar():c2sRebornAvatar(avatarId)
end

function AvatarTrainView:_avatarRebornSuccess(eventName, awards)
	self:_updateData()
	self:_updateView()

	require("app.utils.data.RecoveryDataHelper").sortAward(awards)
    local popup = require("app.ui.PopupGetRewards").new()
    popup:showRewards(awards)
end

function AvatarTrainView:_playSingleBallEffect()
	local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere5"))
	local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
	if emitter then
		emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
        sp:addChild(emitter)
        emitter:resetSystem()
    end

    local startPos = UIHelper.convertSpaceFromNodeToNode(self._materialIcon, self)
    sp:setPosition(startPos)
    self:addChild(sp)
    local endPos = UIHelper.convertSpaceFromNodeToNode(self._fileNodeAvatar, self, cc.p(0, self._fileNodeAvatar:getHeight() / 2))--飞到中心点
    local pointPos1 = cc.p(startPos.x, startPos.y + 200)
    local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 100)
    local bezier = {
	    pointPos1,
	    pointPos2,
	    endPos,
	}
	local action1 = cc.BezierTo:create(0.7, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	sp:runAction(cc.Sequence:create(
            action2,
            cc.CallFunc:create(function()
            	self:_playExplodeEffect()
        		self:_playPrompt()
        		self:_setButtonEnable(true)
            end),
            cc.RemoveSelf:create()
        )
	)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_LV)
end

function AvatarTrainView:_playExplodeEffect()
	local effect1 = EffectGfxNode.new("effect_wujianglevelup_baozha")
	local effect2 = EffectGfxNode.new("effect_wujianglevelup_light")
	effect1:setAutoRelease(true)
	effect2:setAutoRelease(true)
	self._nodeEffect:addChild(effect1)
	self._nodeEffect:addChild(effect2)
    effect1:play()
    effect2:play()
end

function AvatarTrainView:_playPrompt()
	local summary = {}
    
	local content1 = Lang.get("summary_avatar_str_success")
	local param1 = {
		content = content1,
		startPosition = {x = -170},
		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textOldLevel, self),
		finishCallback = function()
			if self._textOldLevel then
				self._textOldLevel:updateTxtValue(self._curLevel)
				self:_updateLevel()
				self:_onSummaryFinish()
			end
		end
	} 
	table.insert(summary, param1)

	--属性飘字
	self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary()
end

function AvatarTrainView:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = -230},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr"..i], self),
				finishCallback = function()
					local _, curValue = TextHelper.getAttrBasicText(attrId, self._curAttr[attrId])
					self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
					self["_fileNodeAttr"..i]:updateInfo(attrId, self._curAttr[attrId], self._nextAttr[attrId], 4)
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

function AvatarTrainView:_setButtonEnable(enable)
	local isReachMax = self._nextLevel == nil
	self._buttonRecovery:setEnabled(enable)
	self._buttonStr:setEnabled(not isReachMax and enable)
end

function AvatarTrainView:_onSummaryFinish()
	
end

function AvatarTrainView:_setCallback()
	G_UserData:getTeamCache():setShowHeroTrainFlag(true)
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

return AvatarTrainView