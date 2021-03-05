--
-- Author: Liangxu
-- Date: 2017-04-19 17:57:03
-- 装备精炼
local ViewBase = require("app.ui.ViewBase")
local EquipTrainRefineLayer = class("EquipTrainRefineLayer", ViewBase)
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local MasterConst = require("app.const.MasterConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local CSHelper = require("yoka.utils.CSHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local UIHelper = require("yoka.utils.UIHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")

local ITEM2INDEX = {
	[DataConst.ITEM_REFINE_STONE_1] = 1,
	[DataConst.ITEM_REFINE_STONE_2] = 2,
	[DataConst.ITEM_REFINE_STONE_3] = 3,
	[DataConst.ITEM_REFINE_STONE_4] = 4
}

function EquipTrainRefineLayer:ctor(parentView)
	self._parentView = parentView

	self._textName = nil --装备名称
	self._textPotential = nil --品级
	self._textRefineLevel = nil --精炼等级
	self._loadingBarExp = nil --进度条
	self._textExpPercent1 = nil --经验比例
	self._textOldLevel1 = nil --当前等级
	self._textOldLevel2 = nil --当前等级
	self._textNewLevel = nil --下一等级
	self._fileNodeAttr1 = nil --属性变化1
	self._fileNodeAttr2 = nil --属性变化2
	self._fileNodeMaterial1 = nil --消耗材料1
	self._fileNodeMaterial2 = nil --消耗材料2
	self._fileNodeMaterial3 = nil --消耗材料3
	self._fileNodeMaterial4 = nil --消耗材料4
	self._buttonRefineOne = nil --精炼一级按钮
	self._buttonRefineFive = nil --精炼五级按钮

	local resource = {
		file = Path.getCSB("EquipTrainRefineLayer", "equipment"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonRefineOne = {
				events = {{event = "touch", method = "_onButtonRefineOneClicked"}}
			},
			_buttonRefineFive = {
				events = {{event = "touch", method = "_onButtonRefineFiveClicked"}}
			}
		}
	}
	EquipTrainRefineLayer.super.ctor(self, resource)
end

function EquipTrainRefineLayer:onCreate()
	self:_initData()
	self:_initView()
end

function EquipTrainRefineLayer:onEnter()
	self._signalEquipRefineSuccess =
		G_SignalManager:add(SignalConst.EVENT_EQUIP_REFINE_SUCCESS, handler(self, self._equipRefineSuccess))

	self:_updateData()
	self:_updateView()
end

function EquipTrainRefineLayer:onExit()
	self._signalEquipRefineSuccess:remove()
	self._signalEquipRefineSuccess = nil
end

function EquipTrainRefineLayer:_initData()
	self._isLimit = false --是否达到上限
	self._isGlobalLimit = false --是否达到开放等级上限
	self._limitLevel = 0 --等级限制
	self._limitExp = 0 --限制经验
	self._newMasterLevel = 0 --新精炼大师等级
	self._successData = nil --精炼成功返回的数据
	self._ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000
	self._beforeMasterInfo = nil --保存之前的强化大师信息
	self._curMasterInfo = nil
	self._equipData = nil --当前装备数据
	self._canClick = true
	self._diffLevel = 0
	self._diffExp = 0
	self._materialFakeCount = nil --材料假个数
	self._materialFakeCostCount = 0 --材料假的消耗个数
	self._fakeCurTotalExp = 0 --假的当前总经验
	self._fakeLevel = 0 --假的等级
	self._fakeCurAttrData = {} --假的当前属性
	self._fakeNextAttrData = {} --假的下一等级数据
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2)
end

function EquipTrainRefineLayer:_initView()
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("equipment_refine_detail_title"))
	self._fileNodeCostTitle:setFontSize(24)
	self._fileNodeCostTitle:setTitle(Lang.get("equipment_refine_cost_title"))
	self._buttonRefineOne:setString(Lang.get("equipment_refine_btn_one"))
	self._buttonRefineFive:setString(Lang.get("equipment_refine_btn_five"))
	local isFunctionOpen = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2)
	self._buttonRefineOne:setVisible(isFunctionOpen) --是否到了显示等级
	self._buttonRefineFive:setVisible(isFunctionOpen) --是否到了显示等级

	self._parentView:setArrowBtnEnable(true)
	self._pageView:setEnabled(true)
	self._labelCount:setVisible(false)
	self:_initPageView()

	for i = 1, 4 do
		local itemId = DataConst["ITEM_REFINE_STONE_" .. i]
		self["_fileNodeMaterial" .. i]:updateUI(
			itemId,
			handler(self, self._onClickMaterialIcon),
			handler(self, self._onStepClickMaterialIcon)
		)
		self["_fileNodeMaterial" .. i]:setStartCallback(handler(self, self._onStartCallback))
		self["_fileNodeMaterial" .. i]:setStopCallback(handler(self, self._onStopCallback))
	end
end

function EquipTrainRefineLayer:_createPageItem(width, height, i)
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

function EquipTrainRefineLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))

	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
	local equipCount = self._parentView:getEquipCount()
	for i = 1, equipCount do
		local widget, avatar = self:_createPageItem(viewSize.width, viewSize.height, i)
		self._pageView:addPage(widget)
		self._pageItems[i] = {widget = widget, avatar = avatar}
	end
	self:_updatePageView()
end

function EquipTrainRefineLayer:_updatePageView()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function EquipTrainRefineLayer:_onPageViewEvent(sender, event)
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

function EquipTrainRefineLayer:updateInfo()
	self:_updateData()
	self:_updatePageView()
	self:_updateView()
	self:_updateItemAvatar()
end

function EquipTrainRefineLayer:_updateItemAvatar()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageItems[selectedPos].avatar:updateUI(self._equipData:getBase_id())
end

function EquipTrainRefineLayer:_updateData()
	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	self._equipData = G_UserData:getEquipment():getEquipmentDataWithId(curEquipId)
	local curLevel = self._equipData:getR_level()
	self._limitLevel = math.floor(G_UserData:getBase():getLevel() * self._ratio)
	self._isLimit = curLevel >= self._limitLevel --是否已达上限

	self:_updateAttrData()
	G_UserData:getAttr():recordPower()
end

function EquipTrainRefineLayer:_updateAttrData()
	self._isGlobalLimit = false
	self._curAttrInfo = UserDataHelper.getEquipRefineAttr(self._equipData)
	self._nextAttrInfo = UserDataHelper.getEquipRefineAttr(self._equipData, 1)
	if self._nextAttrInfo == nil then
		self._isGlobalLimit = true
		self._nextAttrInfo = {}
	end
	self._recordAttr:updateData(self._curAttrInfo)
end

function EquipTrainRefineLayer:_updateView()
	if self._equipData == nil then
		return
	end

	self:_updateBaseInfo()
	self:_updateLoading()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateCost()
end

--基本信息
function EquipTrainRefineLayer:_updateBaseInfo()
	local equipBaseId = self._equipData:getBase_id()
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)

	--名字
	local equipName = equipParam.name
	local rLevel = self._equipData:getR_level()
	if rLevel > 0 then
		equipName = equipName .. "+" .. rLevel
	end
	self._textName:setString(equipName)
	self._textName:setColor(equipParam.icon_color)
	self._textName:enableOutline(equipParam.icon_color_outline, 2)
	self._textName2:setString(equipName)
	self._textName2:setColor(equipParam.icon_color)
	UIHelper.updateTextOutline(self._textName2, equipParam)

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

--进度条
function EquipTrainRefineLayer:_updateLoading(withAni)
	local config = self._equipData:getConfig()
	local level = self._equipData:getR_level()
	local templet = config.refine_templet
	self._textRefineLevel:setString(Lang.get("equipment_refine_level", {level = level}))
	local curExp = self._equipData:getR_exp()
	local curTotalExp = UserDataHelper.getCurRefineLevelExp(templet, level)
	local percent = curExp / curTotalExp * 100
	self._loadingBarExp:setPercent(percent)

	if withAni then --播滚动动画
		local lastValue = tonumber(self._textExpPercent1:getString())
		if curExp ~= lastValue then
			self._textExpPercent2:doScaleAnimation()
		end
		self._textExpPercent1:updateTxtValue(curExp)
	else
		self._textExpPercent1:setString(curExp)
	end
	self._textExpPercent2:setString("/" .. curTotalExp)
end

--等级
function EquipTrainRefineLayer:_updateLevel()
	local curLevel = self._equipData:getR_level()

	self._textOldLevel1:setString(curLevel)
	self._textOldLevel2:setString("/" .. self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get("equipment_refine_level2", {level = curLevel + 1, maxLevel = self._limitLevel})
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_refine_max_level")
	end
	self._textNewLevel:setString(newDes)
end

--属性
function EquipTrainRefineLayer:_updateAttr()
	local curDesInfo = TextHelper.getAttrInfoBySort(self._curAttrInfo)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._nextAttrInfo)

	for i, info in ipairs(curDesInfo) do
		local nextInfo = nextDesInfo[i] or {}
		self["_fileNodeAttr" .. i]:updateInfo(info.id, info.value, nextInfo.value, 4)
	end
end

--花费
function EquipTrainRefineLayer:_updateCost()
	for i = 1, 4 do
		self["_fileNodeMaterial" .. i]:updateCount()
	end
end

function EquipTrainRefineLayer:_onStartCallback(itemId, count)
	self._materialFakeCount = count
	self._materialFakeCostCount = 0
	local fakeCurExp = self._equipData:getR_exp()
	self._fakeLevel = self._equipData:getR_level()
	local templet = self._equipData:getConfig().refine_templet
	self._fakeCurTotalExp = UserDataHelper.getEquipTotalExp(templet, fakeCurExp, self._fakeLevel)
	self._fakeCurAttrData = self._curAttrInfo
	self._fakeNextAttrData = self._nextAttrInfo
end

function EquipTrainRefineLayer:_onStopCallback()
	self._labelCount:setVisible(false)
end

function EquipTrainRefineLayer:_onStepClickMaterialIcon(itemId, itemValue)
	if self._materialFakeCount <= 0 then
		return false
	end
	if self._fakeLevel >= self._limitLevel then
		G_Prompt:showTip(Lang.get("equipment_refine_limit_tip"))
		return false
	end

	self._materialFakeCount = self._materialFakeCount - 1
	self._materialFakeCostCount = self._materialFakeCostCount + 1
	self._fakeCurTotalExp = self._fakeCurTotalExp + itemValue
	self:_fakeUpdateView(itemId)
	self:_fakePlayEffect(itemId)

	return true
end

function EquipTrainRefineLayer:_fakeUpdateView(itemId)
	--xN
	self._labelCount:setString("+" .. self._materialFakeCostCount)
	self._labelCount:setVisible(self._materialFakeCostCount > 1)

	--进度条
	local config = self._equipData:getConfig()
	local templet = config.refine_templet
	self._fakeLevel = UserDataHelper.getCanReachRefineLevelWithExp(self._fakeCurTotalExp, templet)
	self._textRefineLevel:setString(Lang.get("equipment_refine_level", {level = self._fakeLevel}))
	local curTotalExp = UserDataHelper.getCurRefineLevelExp(templet, self._fakeLevel)
	local curExp = UserDataHelper.getEquipCurExp(templet, self._fakeCurTotalExp, self._fakeLevel)
	local percent = curExp / curTotalExp * 100
	self._loadingBarExp:setPercent(percent)
	self._textExpPercent1:updateTxtValue(curExp)
	self._textExpPercent2:setString("/" .. curTotalExp)
	self._textExpPercent2:doScaleAnimation()

	--等级
	self._textOldLevel1:setString(self._fakeLevel)
	self._textOldLevel2:setString("/" .. self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get("equipment_refine_level2", {level = self._fakeLevel + 1, maxLevel = self._limitLevel})
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_refine_max_level")
	end
	self._textNewLevel:setString(newDes)

	--属性
	self._fakeCurAttrData = UserDataHelper.getEquipRefineAttrWithConfig(config, self._fakeLevel)
	self._fakeNextAttrData = UserDataHelper.getEquipRefineAttrWithConfig(config, self._fakeLevel + 1)
	if self._fakeNextAttrData == nil then
		self._fakeNextAttrData = {}
	end

	local curDesInfo = TextHelper.getAttrInfoBySort(self._fakeCurAttrData)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._fakeNextAttrData)

	for i, info in ipairs(curDesInfo) do
		local nextInfo = nextDesInfo[i] or {}
		self["_fileNodeAttr" .. i]:updateInfo(info.id, info.value, nextInfo.value, 4)
	end

	--消耗
	local index = ITEM2INDEX[itemId]
	self["_fileNodeMaterial" .. index]:setCount(self._materialFakeCount)
end

function EquipTrainRefineLayer:_fakePlayEffect(itemId)
	self:_playSingleEffect(itemId, true)
end

function EquipTrainRefineLayer:_onClickMaterialIcon(materials)
	if not self._canClick then
		return
	end

	if self._isLimit then
		G_Prompt:showTip(Lang.get("equipment_refine_limit_tip"))
		return
	end

	self:_saveBeforeMasterInfo()

	local equipId = self._equipData:getId()
	G_UserData:getEquipment():c2sRefineEquipment(equipId, 1, materials)
	self._canClick = false
	self._parentView:setArrowBtnEnable(false)
	self._pageView:setEnabled(false)
end

function EquipTrainRefineLayer:_getMaterialsWithLevel(level)
	local templet = self._equipData:getConfig().refine_templet
	local curLevel = self._equipData:getR_level()
	local targetLevel = math.min(curLevel + level, self._limitLevel)
	local curExp = UserDataHelper.getEquipTotalExp(templet, self._equipData:getR_exp(), curLevel)
	local targetExp = UserDataHelper.getEquipNeedExpWithLevel(templet, targetLevel)
	local materials = {}
	for i = 1, 4 do
		local num = 0
		local count = self["_fileNodeMaterial" .. i]:getCount()
		local itemId = self["_fileNodeMaterial" .. i]:getItemId()
		local itemValue = self["_fileNodeMaterial" .. i]:getItemValue()
		for j = 1, count do
			curExp = curExp + itemValue
			num = num + 1
			if curExp >= targetExp then
				table.insert(materials, {id = itemId, num = num})
				return materials
			end
		end
		if num > 0 then
			table.insert(materials, {id = itemId, num = num})
		end
	end
	return materials
end

--精炼1级
function EquipTrainRefineLayer:_onButtonRefineOneClicked()
	if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false then
		return
	end
	if not self._canClick then
		return
	end
	if self._isLimit then
		G_Prompt:showTip(Lang.get("equipment_refine_limit_tip"))
		return
	end

	local materials = self:_getMaterialsWithLevel(1)
	if #materials == 0 then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFINE_STONE_1)
		popup:openWithAction()
		return
	end

	self:_saveBeforeMasterInfo()

	local equipId = self._equipData:getId()
	G_UserData:getEquipment():c2sRefineEquipment(equipId, 1, materials)
	self._canClick = false
	self:_setClickEnabled(false)
end

--精炼5级
function EquipTrainRefineLayer:_onButtonRefineFiveClicked()
	if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false then
		return
	end
	if not self._canClick then
		return
	end
	if self._isLimit then
		G_Prompt:showTip(Lang.get("equipment_refine_limit_tip"))
		return
	end

	local materials = self:_getMaterialsWithLevel(2)
	if #materials == 0 then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFINE_STONE_1)
		popup:openWithAction()
		return
	end

	self:_saveBeforeMasterInfo()

	local equipId = self._equipData:getId()
	G_UserData:getEquipment():c2sRefineEquipment(equipId, 1, materials)
	self._canClick = false
	self:_setClickEnabled(false)
end

function EquipTrainRefineLayer:_setClickEnabled(enable)
	self._buttonRefineOne:setEnabled(enable)
	self._buttonRefineFive:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
	self._pageView:setEnabled(enable)
end

function EquipTrainRefineLayer:_equipRefineSuccess(eventName, data)
	self._canClick = true

	self._successData = data
	self:_recordDiffExp()
	self:_recordDiffLevel()
	self:_updateData()
	self:_updateBaseInfo()
	self:_updateLoading(true)
	self:_updateCost()
	self:_saveCurMasterInfo()

	local param = self:_checkMasterLevelDiff()

	if self._materialFakeCount == 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
		self._materialFakeCount = nil
		self:_playFinishEffect()
		if param then
			local popup =
				require("app.scene.view.equipment.PopupMasterLevelup").new(
				self,
				param.beforeMasterInfo,
				param.curMasterInfo,
				MasterConst.MASTER_TYPE_2
			)
			popup:openWithAction()
		else
			self:_playRefineSuccessPrompt()
		end
		self:_setClickEnabled(true)
		return
	end

	local subItem = data.subItem
	for i, item in ipairs(subItem) do
		if i == 1 then
			self:_playSingleEffect(item.id, true, true, param)
		else
			self:_playSingleEffect(item.id)
		end
	end
end

function EquipTrainRefineLayer:onExitPopupMasterLevelup()
	self:_playRefineSuccessPrompt()
end

--播放精炼成功飘字
function EquipTrainRefineLayer:_playRefineSuccessPrompt()
	self:_setClickEnabled(true)
	local data = self._successData
	if not data then
		return
	end
	local rLevel = data.rLevel
	local rExp = data.rExp
	local subItem = data.subItem
	local summary = {}

	if self._newMasterLevel and self._newMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_equip_refine_master_reach", {level = self._newMasterLevel}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN}
		}
		table.insert(summary, param)
	end

	if self._diffLevel == 0 then
		local param1 = {
			content = Lang.get("summary_equip_exp_add", {value = self._diffExp}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textExpPercent1, self)
		}
		table.insert(summary, param1)
	else
		local param = {
			content = Lang.get("summary_equip_refine_success"),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN}
		}
		table.insert(summary, param)
		local param1 = {
			content = Lang.get("summary_equip_refine_level", {value = self._diffLevel}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textOldLevel1, self),
			finishCallback = function()
				if self._textOldLevel1 then
					self._textOldLevel1:updateTxtValue(rLevel)
					self:_updateLevel()
				end
			end
		}
		table.insert(summary, param1)
	end

	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--加入基础属性飘字内容
function EquipTrainRefineLayer:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr" .. i], self),
				finishCallback = function()
					local attrValue = self._curAttrInfo[attrId]
					if attrValue then
						local _, curValue = TextHelper.getAttrBasicText(attrId, attrValue)
						self["_fileNodeAttr" .. i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
						self["_fileNodeAttr" .. i]:updateInfo(attrId, attrValue, self._nextAttrInfo[attrId], 4)
					end
				end
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--保存强化前的强化大师信息
function EquipTrainRefineLayer:_saveBeforeMasterInfo()
	local pos = self._equipData:getPos()
	self._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2)
end

function EquipTrainRefineLayer:_saveCurMasterInfo()
	local pos = self._equipData:getPos()
	self._curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2)
end

--计算大师等级差
function EquipTrainRefineLayer:_checkMasterLevelDiff()
	local curLevel = self._curMasterInfo.masterInfo.curMasterLevel
	local beforeLevel = self._beforeMasterInfo and self._beforeMasterInfo.masterInfo.curMasterLevel or 0
	if curLevel > beforeLevel then
		self._newMasterLevel = curLevel
		local param = {
			curLevel = curLevel,
			beforeMasterInfo = self._beforeMasterInfo,
			curMasterInfo = self._curMasterInfo
		}
		return param
	end
	self._newMasterLevel = nil
	return nil
end

--记录等级差
function EquipTrainRefineLayer:_recordDiffLevel()
	local curLevel = self._equipData:getR_level()
	self._diffLevel = self._successData.rLevel - curLevel
end

--记录经验差
function EquipTrainRefineLayer:_recordDiffExp()
	local curExp = self._equipData:getR_exp()
	self._diffExp = self._successData.rExp - curExp
end

--播特效
--isPlayFinishEffect , 是否播结束特效
--isPlayPrompt, 是否播飘字
--masterParam, 大师达成弹框所用到的参数
function EquipTrainRefineLayer:_playSingleEffect(itemId, isPlayFinishEffect, isPlayPrompt, masterParam)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	local color = param.cfg.color
	local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere" .. color))
	local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
	if emitter then
		emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
		sp:addChild(emitter)
		emitter:resetSystem()
	end

	local index = ITEM2INDEX[itemId]
	local startPos = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeMaterial" .. index], self)
	sp:setPosition(startPos)
	self:addChild(sp)
	local posIndex = self._parentView:getSelectedPos()
	local avatar = self._pageItems[posIndex].avatar
	local endPos = UIHelper.convertSpaceFromNodeToNode(avatar, self)
	local pointPos1 = cc.p(startPos.x, startPos.y + 200)
	local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 100)
	local bezier = {
		pointPos1,
		pointPos2,
		endPos
	}
	local action1 = cc.BezierTo:create(0.7, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	sp:runAction(
		cc.Sequence:create(
			action2,
			cc.CallFunc:create(
				function()
					if isPlayFinishEffect then
						self:_playFinishEffect()
					end
					if isPlayPrompt then
						if masterParam then
							local popup =
								require("app.scene.view.equipment.PopupMasterLevelup").new(
								self,
								masterParam.beforeMasterInfo,
								masterParam.curMasterInfo,
								MasterConst.MASTER_TYPE_2
							)
							popup:openWithAction()
						else
							self:_playRefineSuccessPrompt()
						end
						self:_setClickEnabled(true)
					end
				end
			),
			cc.RemoveSelf:create()
		)
	)
end

--播放结束特效
function EquipTrainRefineLayer:_playFinishEffect(isPlayPrompt)
	local function effectFunction(effect)
		if effect == "effect_equipjinglian" then
			local subEffect = EffectGfxNode.new("effect_equipjinglian")
			subEffect:play()
			return subEffect
		end

		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "finish" then
		end
	end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_equipjinglian", effectFunction, eventFunction, true)
	local offsetX = require("app.const.UIConst").EFFECT_OFFSET_X
	effect:setPosition(
		cc.p(G_ResolutionManager:getDesignWidth() * 0.5 + offsetX, G_ResolutionManager:getDesignHeight() * 0.5)
	)
end

return EquipTrainRefineLayer
