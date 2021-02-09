--
-- Author: Liangxu
-- Date: 2017-04-17 15:49:06
-- 装备强化
local ViewBase = require("app.ui.ViewBase")
local EquipTrainStrengthenLayer = class("EquipTrainStrengthenLayer", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local TextHelper = require("app.utils.TextHelper")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local MasterConst = require("app.const.MasterConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local CSHelper = require("yoka.utils.CSHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AudioConst = require("app.const.AudioConst")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")

function EquipTrainStrengthenLayer:ctor(parentView)
	self._parentView = parentView

	self._textName = nil --装备名称
	self._textPotential = nil --品级
	self._textOldLevel1 = nil --当前等级
	self._textOldLevel2 = nil --当前等级
	self._textNewLevel = nil --下一等级
	self._fileNodeAttr = nil --属性变化
	self._buttonStrengFive = nil --强化5次按钮
	self._buttonStreng = nil --强化按钮
	self._fileNodeSliver = nil --花销

	local resource = {
		file = Path.getCSB("EquipTrainStrengthenLayer", "equipment"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonStrengFive = {
				events = {{event = "touch", method = "_onButtonStrengFiveClicked"}},
			},
			_buttonStreng = {
				events = {{event = "touch", method = "_onButtonStrengClicked"}},
			},
		},
	}
	self:setName("EquipTrainStrengthenLayer")
	EquipTrainStrengthenLayer.super.ctor(self, resource)
end

function EquipTrainStrengthenLayer:onCreate()
	self:_initData()
	self:_initView()
end

function EquipTrainStrengthenLayer:onEnter()
	self._signalEquipUpgradeSuccess = G_SignalManager:add(SignalConst.EVENT_EQUIP_UPGRADE_SUCCESS, handler(self, self._equipUpgradeSuccess))
	self:_updateData()
	self:_updateView()
end

function EquipTrainStrengthenLayer:onExit()
	self._signalEquipUpgradeSuccess:remove()
	self._signalEquipUpgradeSuccess = nil
end

function EquipTrainStrengthenLayer:_initData()
	self._isLimit = false --是否达到上限
	self._isGlobalLimit = false --是否达到开放等级上限
	self._newMasterLevel = 0 --新强化大师等级
	self._successData = nil --强化成功返回的数据
	self._ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000
	self._beforeMasterInfo = nil --保存强化之前的强化大师信息
	self._equipData = nil --当前装备数据
	self._curAttrInfo = {}
	self._nextAttrInfo = nil
	self._diffLevel = 0 --等级差
	self._pageItems = {}
end

function EquipTrainStrengthenLayer:_initView()
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("equipment_strengthen_detail_title"))
	self._buttonStrengFive:setString(Lang.get("equipment_strengthen_btn_five"))
	self._buttonStreng:setString(Lang.get("equipment_strengthen_btn"))
	self._parentView._buttonLeft:setEnabled(true)
	self._parentView._buttonRight:setEnabled(true)

	self:_initPageView()
end

function EquipTrainStrengthenLayer:updateInfo()
	self:_updateData()
	self:_updatePageView()
	self:_updateView()
	self:_updateItemAvatar()
end

function EquipTrainStrengthenLayer:_updateItemAvatar()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageItems[selectedPos].avatar:updateUI(self._equipData:getBase_id())
end

function EquipTrainStrengthenLayer:_updateData()
	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	if curEquipId == nil then
		self._equipData = nil
		return
	end
	self._equipData = G_UserData:getEquipment():getEquipmentDataWithId(curEquipId)
	local curLevel = self._equipData:getLevel()
	local maxLevel = math.ceil(G_UserData:getBase():getLevel() * self._ratio)
	self._isLimit = curLevel >= maxLevel --是否已达上限

	self:_updateAttrData()
	G_UserData:getAttr():recordPower()
end

function EquipTrainStrengthenLayer:_updateAttrData()
	self._curAttrInfo = UserDataHelper.getEquipStrengthenAttr(self._equipData)
	self._nextAttrInfo = UserDataHelper.getEquipStrengthenAttr(self._equipData, 1)
	if self._nextAttrInfo == nil then --到顶级了
		self._nextAttrInfo = {}
		self._isGlobalLimit = true
	end
end

function EquipTrainStrengthenLayer:_createPageItem(width, height, i)
	local allEquipIds = self._parentView:getAllEquipIds()
	local equipId = allEquipIds[i]
	local unitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	local equipBaseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonEquipAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(equipBaseId)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget, avatar
end

function EquipTrainStrengthenLayer:_initPageView()
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))

	self._pageView:removeAllPages()
	self._pageItems = {}
	local viewSize = self._pageView:getContentSize()
	local equipCount = self._parentView:getEquipCount()
    for i = 1, equipCount do
    	local item, avatar = self:_createPageItem(viewSize.width, viewSize.height, i)
        self._pageView:addPage(item)
        self._pageItems[i] = {item = item, avatar = avatar}
    end
   	self:_updatePageView()
end

function EquipTrainStrengthenLayer:_updatePageView()
	local selectedPos = self._parentView:getSelectedPos()
    self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function EquipTrainStrengthenLayer:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		
	end
end

function EquipTrainStrengthenLayer:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allEquipIds = self._parentView:getAllEquipIds()
			local curEquipId = allEquipIds[targetPos]
			G_UserData:getEquipment():setCurEquipId(curEquipId)
			self._parentView:updateArrowBtn()
			self._parentView:changeUpdate()
			self:updateInfo()
		end
	end
end

function EquipTrainStrengthenLayer:_updateView()
	if self._equipData == nil then
		return
	end
	
	self:_updateBaseInfo()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateCost()
end

--基本信息
function EquipTrainStrengthenLayer:_updateBaseInfo()
	local equipBaseId = self._equipData:getBase_id()
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)

	--名字
	local equipName = equipParam.name
	local rLevel = self._equipData:getR_level()
	if rLevel > 0 then
		equipName = equipName.."+"..rLevel
	end
	self._textName:setString(equipName)
	self._textName:setColor(equipParam.icon_color)
	self._textName:enableOutline(equipParam.icon_color_outline, 2)
	self._textName2:setString(equipName)
	self._textName2:setColor(equipParam.icon_color)
	UIHelper.updateTextOutline(self._textName2, equipParam)

	--装备于
	local heroUnitData = UserDataHelper.getHeroDataWithEquipId(self._equipData:getId())

	if heroUnitData == nil then
		self._textFrom:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("treasure_detail_from", {name = heroParam.name}))
	end

	--品级
	self._textPotential:setString(Lang.get("equipment_detail_txt_potential", {value = equipParam.potential}))
	self._textPotential:setColor(equipParam.icon_color)
	self._textPotential:enableOutline(equipParam.icon_color_outline, 2)
end

--等级
function EquipTrainStrengthenLayer:_updateLevel()
	local curLevel = self._equipData:getLevel()
	local maxLevel = math.ceil(G_UserData:getBase():getLevel() * self._ratio)

	self._textOldLevel1:setString(curLevel)
	self._textOldLevel2:setString("/"..maxLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get("equipment_strengthen_level", {level = curLevel + 1, maxLevel = maxLevel})
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_strengthen_max_level")
	end
	self._textNewLevel:setString(newDes)
end

--属性
function EquipTrainStrengthenLayer:_updateAttr()
	for k, value in pairs(self._curAttrInfo) do
		local nextValue = self._nextAttrInfo[k]
		self._fileNodeAttr:updateInfo(k, value, nextValue, 4)
	end
end

--花费
function EquipTrainStrengthenLayer:_updateCost()
	if self._isLimit then
		self._textCostTitle:setVisible(false)
		self._fileNodeSliver:setVisible(false)
	else
		self._textCostTitle:setVisible(true)
		self._fileNodeSliver:setVisible(true)
		self._costValue = UserDataHelper.getLevelupCostValue(self._equipData)
		self._fileNodeSliver:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, self._costValue)
		self._fileNodeSliver:setTextColor(Colors.BRIGHT_BG_TWO)
	end
end

function EquipTrainStrengthenLayer:_onButtonStrengFiveClicked()
	if self:_checkStrengthenCondition() == false then
		return
	end
	
	if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_STRENGTHEN_FIVE) == false then
		return
	end

	self:_saveBeforeMasterInfo()

	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	G_UserData:getEquipment():c2sUpgradeEquipment(curEquipId, 5)

	self:_setButtonEnable(false)
end

function EquipTrainStrengthenLayer:_onButtonStrengClicked()
	if self:_checkStrengthenCondition() == false then
		return
	end

	self:_saveBeforeMasterInfo()

	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	G_UserData:getEquipment():c2sUpgradeEquipment(curEquipId, 1)

	self:_setButtonEnable(false)
end

function EquipTrainStrengthenLayer:_setButtonEnable(enable)
	self._buttonStreng:setEnabled(enable)
	self._buttonStrengFive:setEnabled(enable)
	self._parentView:setArrowBtnEnable(enable)
	self._pageView:setEnabled(enable)
end

function EquipTrainStrengthenLayer:_checkStrengthenCondition()
	if self._isLimit then
		G_Prompt:showTip(Lang.get("equipment_strengthen_limit_tip"))
		return false
	end

	local isOk, func = LogicCheckHelper.enoughMoney(self._costValue)
	if not isOk then
		func()
		return false
	end

	return true
end

function EquipTrainStrengthenLayer:_equipUpgradeSuccess(eventName, data)
	self._successData = data
	
	self:_recordDiffLevel()
	self:_updateData()
	self:_playEffect()
end

function EquipTrainStrengthenLayer:_playEffect()
	local function effectFunction(effect)
        if effect == "effect_equipqianghua_shuxian" then
            local subEffect = EffectGfxNode.new("effect_equipqianghua_shuxian")
            subEffect:play()
            return subEffect
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "play" then
    		--播装备颤抖
		    local index = self._parentView:getSelectedPos()
			if self._pageItems[index] and self._pageItems[index].avatar then
				local node = self._pageItems[index].avatar
				G_EffectGfxMgr:applySingleGfx(node, "smoving_zhuangbei", nil, nil, nil)
			end
		elseif event == "next" then
			self._newMasterLevel = self:_checkIsReachNewMasterLevel()
    		if not self._newMasterLevel then
				self:_playStrSuccessPrompt()
			end
			self:_setButtonEnable(true)
		elseif event == "finish" then
			
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_equipqianghua", effectFunction, eventFunction , false)
	local offsetX = require("app.const.UIConst").EFFECT_OFFSET_X
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5+offsetX, G_ResolutionManager:getDesignHeight()*0.5))
    G_AudioManager:playSoundWithId(AudioConst.SOUND_EQUIP_STRENGTHEN) --播音效
end

--保存强化前的强化大师信息
function EquipTrainStrengthenLayer:_saveBeforeMasterInfo()
	local pos = self._equipData:getPos()
	self._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1)
end

--检查是否达到了新的强化大师等级
function EquipTrainStrengthenLayer:_checkIsReachNewMasterLevel()
	local pos = self._equipData:getPos()
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1)


	if self._beforeMasterInfo then
		local beforeLevel = self._beforeMasterInfo.masterInfo.curMasterLevel
		local curLevel = curMasterInfo.masterInfo.curMasterLevel
		if curLevel > beforeLevel then
			local popup = require("app.scene.view.equipment.PopupMasterLevelup").new(self, self._beforeMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_1)
			popup:openWithAction()
			return curLevel
		end
	end
	
	return false
end

--
function EquipTrainStrengthenLayer:onExitPopupMasterLevelup()
	self:_playStrSuccessPrompt()
end

--播放强化成功后的飘字
function EquipTrainStrengthenLayer:_playStrSuccessPrompt()
	self:_updateCost()
	local data = self._successData
	local times = data.times
	local critTimes = data.critTimes
	local breakReason = data.breakReason
	local level = data.level
	local crits = data.crits
	local saveMoney = data.saveMoney

	local critInfo = {}
	for i, multiple in ipairs(crits) do
		if multiple > 1 then
			if critInfo[multiple] == nil then
				critInfo[multiple] = 0
			end
			critInfo[multiple] = critInfo[multiple] + 1
		end
	end

	local summary = {}

	local param1= {
		content = Lang.get("summary_equip_str_success_tip6"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	}
	table.insert(summary, param1)

	if self._newMasterLevel and self._newMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_equip_str_master_reach", {level = self._newMasterLevel}),
			startPosition = {UIConst.SUMMARY_OFFSET_X_TRAIN},
		}
		table.insert(summary, param)
	end

	local param3 = {
		content = Lang.get("summary_equip_str_success_tip3", {value = self._diffLevel}),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textOldLevel1, self),
		finishCallback = function()
			if self._textOldLevel1 and self._updateLevel then
				self._textOldLevel1:updateTxtValue(self._equipData:getLevel())
				self:_updateLevel()
			end
		end,
	}
	table.insert(summary, param3)

	--暴击
	if critTimes > 0 then
		for multiple, count in pairs(critInfo) do
			local param = {
				content = Lang.get("summary_equip_str_success_tip2", {multiple = multiple, count = count}),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
			}
			table.insert(summary, param)
		end
	end
	--节省
	if saveMoney > 0 then
		local param = {
			content = Lang.get("summary_equip_str_success_tip5", {value = saveMoney}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		}
		table.insert(summary, param)
	end

	local curLevel = self._equipData:getLevel()
	local attrDiff = UserDataHelper.getEquipStrengthenAttrDiff(self._equipData, curLevel - self._diffLevel, curLevel)
	local attrName = ""
	local attrValue = 0
	for k, value in pairs(attrDiff) do
		attrName, attrValue = TextHelper.getAttrBasicText(k, value)
		break
	end
	local param4 = {
		content = Lang.get("summary_equip_str_success_tip4", {attrName = attrName, attrValue = attrValue}),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._fileNodeAttr, self),
		finishCallback = function()
			if self._equipData then
				for k, value in pairs(self._curAttrInfo) do
					if self._fileNodeAttr then
						local text = self._fileNodeAttr:getSubNodeByName("TextCurValue")
						text:updateTxtValue(value)
						self:_updateAttr()
					end
				end
				self:_onSummaryFinish()
			end
		end,
	}
	table.insert(summary, param4)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--记录等级差
function EquipTrainStrengthenLayer:_recordDiffLevel()
	local curLevel = self._equipData:getLevel()
	self._diffLevel = self._successData.level - curLevel
end

--飘字结束后的回调
function EquipTrainStrengthenLayer:_onSummaryFinish()
	self:runAction(cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(function()
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
			end)
		)
	)
end

return EquipTrainStrengthenLayer