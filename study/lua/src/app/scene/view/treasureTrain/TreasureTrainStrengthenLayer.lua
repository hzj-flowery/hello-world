--
-- Author: Liangxu
-- Date: 2017-05-10 14:55:25
-- 宝物强化
local ViewBase = require("app.ui.ViewBase")
local TreasureTrainStrengthenLayer = class("TreasureTrainStrengthenLayer", ViewBase)
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local DataConst = require("app.const.DataConst")
local TreasureConst = require("app.const.TreasureConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TextHelper = require("app.utils.TextHelper")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local MasterConst = require("app.const.MasterConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local CSHelper = require("yoka.utils.CSHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")

--材料id对应材料控件索引
local ITEM_ID_2_MATERICAL_INDEX = {
	[DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_1"]] = 1,
	[DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_2"]] = 2,
	[DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_3"]] = 3,
	[DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_4"]] = 4,
}

function TreasureTrainStrengthenLayer:ctor(parentView)
	self._fileNodeName = nil --宝物名称
	self._textFrom = nil --装备于
	self._textLevel = nil --等级
	self._textPotential = nil --品级
	self._loadingBarExp = nil --经验进度条
	self._textExpPercent1 = nil --经验百分比
	self._textOldLevel1 = nil --当前等级
	self._textNewLevel = nil --下一等级
	self._fileNodeAttr1 = nil --属性1
	self._fileNodeAttr2 = nil --属性2
	self._buttonStrengthenOne = nil --强化1级
	self._buttonStrengthenFive = nil --强化5级

	self._canLimit = false 		-- 是否可以界限突破

	self._parentView = parentView

	local resource = {
		file = Path.getCSB("TreasureTrainStrengthenLayer", "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonStrengthenOne = {
				events = {{event = "touch", method = "_onButtonStrengthenOneClicked"}},
			},
			_buttonStrengthenFive = {
				events = {{event = "touch", method = "_onButtonStrengthenFiveClicked"}},
			},
			_buttonLimit = {
				events = {{event = "touch", method = "_onButtonLimitClicked"}},
			},
		},
	}
	self:setName("TreasureTrainStrengthenLayer")
	TreasureTrainStrengthenLayer.super.ctor(self, resource)
end

function TreasureTrainStrengthenLayer:onCreate()
	self:_initData()
	self:_initView()
end

function TreasureTrainStrengthenLayer:onEnter()
	self._signalTreasureUpgrade = G_SignalManager:add(SignalConst.EVENT_TREASURE_UPGRADE_SUCCESS, handler(self, self._onTreasureUpgradeSuccess))
end

function TreasureTrainStrengthenLayer:onExit()
	self._signalTreasureUpgrade:remove()
	self._signalTreasureUpgrade = nil
end

function TreasureTrainStrengthenLayer:updateInfo()
	self._parentView:setArrowBtnVisible(true)
	self:_updateData()
	self:_updatePageView()
	self:_updateView()
	self._parentView:updateArrowBtn()
end

function TreasureTrainStrengthenLayer:_initData()
	self._isLimit = false --是否达到上限
	self._isLimitTop = false -- 是否界限到最高级
	self._isGlobalLimit = false --是否达到开放等级上限

	self._beforeMasterInfo = nil --保存强化之前的强化大师信息
	self._curMasterInfo = nil
	self._curAttrData = {} --当前属性
	self._nextAttrData = {} --下一级属性

	self._lastExp = 0 --记录宝物强化经验
	self._diffExp = 0 --记录宝物强化经验差值
	self._lastLevel = 0 --记录宝物强化等级
	self._diffLevel = 0 --记录宝物强化等级差值
	self._newMasterLevel = 0 --新强化大师等级

	self._limitLevel = 0 --等级限制
	self._limitExp = 0 --限制经验
	self._materialFakeCount = nil --材料假个数
	self._materialFakeCostCount = 0 --材料假的消耗个数
	self._fakeCurExp = 0 --假的当前经验
	self._fakeLevel = 0 --假的等级
	self._fakeCurAttrData = {} --假的当前属性
	self._fakeNextAttrData = {} --假的下一等级数据

	self._costMaterials = {}
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1)
end

function TreasureTrainStrengthenLayer:_initView()
	self._buttonLimit:setString(Lang.get("treasure_limit_break_btn"))
	self._fileNodeName:setFontSize(20)
	self._fileNodeName2:setFontSize(22)
	self._fileNodeName2:showTextBg(false)
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("treasure_strengthen_detail_title"))
	self._fileNodeDetailTitle2:setFontSize(24)
	self._fileNodeDetailTitle2:setTitle(Lang.get("treasure_strengthen_detail_title2"))
	self._buttonStrengthenOne:setString(Lang.get("treasure_strengthen_btn_strengthen_1"))
	self._buttonStrengthenFive:setString(Lang.get("treasure_strengthen_btn_strengthen_5"))
	self._labelCount:setVisible(false)
	self:_initImgMaterialTop()
	self:_initPageView()

	for i = 1, 4 do
		local itemId = DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..i]
		self["_fileNodeMaterial"..i]:updateUI(itemId, handler(self, self._onClickMaterialIcon), handler(self, self._onStepClickMaterialIcon))
		self["_fileNodeMaterial"..i]:setStartCallback(handler(self, self._onStartCallback))
		self["_fileNodeMaterial"..i]:setStopCallback(handler(self, self._onStopCallback))
	end
end

function TreasureTrainStrengthenLayer:_updateData()
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	self._unitData = G_UserData:getTreasure():getTreasureDataWithId(curTreasureId)
	self._limitLevel = self._unitData:getMaxStrLevel()
	local level = self._unitData:getLevel()
	self._isLimit = level >= self._limitLevel --是否已达上限
	local templet = self._unitData:getConfig().levelup_templet
	self._limitExp = UserDataHelper.getTreasureNeedExpWithLevel(templet, self._limitLevel)

	
	if self._unitData:isCanLimitBreak()
		and require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)
		and self._unitData:getLimit_cost() < TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL then
		self._canLimit = true
	else
		self._canLimit = false
	end

	self._isLimitTop = self._unitData:getLimit_cost() >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL

	self:_updateAttrData()
	self:_recordAddedExp()
	self:_recordAddedLevel()
	G_UserData:getAttr():recordPower()
end

function TreasureTrainStrengthenLayer:_updateAttrData()
	self._isGlobalLimit = false
	self._curAttrData = UserDataHelper.getTreasureStrengthenAttr(self._unitData)
	self._nextAttrData = UserDataHelper.getTreasureStrengthenAttr(self._unitData, 1)
	if self._nextAttrData == nil then --到顶级了
		self._nextAttrData = {}
		self._isGlobalLimit = true
	end
	self._recordAttr:updateData(self._curAttrData)
end

function TreasureTrainStrengthenLayer:_createPageItem(width, height, i)
	local allTreasureIds = self._parentView:getAllTreasureIds()
	local treasureId = allTreasureIds[i]
	local unitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local baseId = unitData:getBase_id()

	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(width, height)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonTreasureAvatar", "common"))
	avatar:showShadow(false)
	avatar:updateUI(baseId)
	local size = widget:getContentSize()
	avatar:setPosition(cc.p(size.width*0.54, size.height / 2))
	widget:addChild(avatar)

	return widget, avatar
end

function TreasureTrainStrengthenLayer:_initPageView()
	self._pageItems = {}

	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))

	self._pageView:removeAllPages()
	local viewSize = self._pageView:getContentSize()
	local treasureCount = self._parentView:getTreasureCount()
    for i = 1, treasureCount do
    	local widget, avatar = self:_createPageItem(viewSize.width, viewSize.height, i)
        self._pageView:addPage(widget)
        self._pageItems[i] = {widget = widget, avatar = avatar}
    end
    self:_updatePageView()
end

function TreasureTrainStrengthenLayer:_updatePageView()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)

	local allTreasureIds = self._parentView:getAllTreasureIds()
	local treasureId = allTreasureIds[selectedPos]
	local unitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local baseId = unitData:getBase_id()
	self._pageItems[selectedPos].avatar:updateUI(baseId)
end

function TreasureTrainStrengthenLayer:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allTreasureIds = self._parentView:getAllTreasureIds()
			local curTreasureId = allTreasureIds[targetPos]
			G_UserData:getTreasure():setCurTreasureId(curTreasureId)
			self._parentView:updateArrowBtn()
			self:_updateData()
			self:_updateView()
			self._parentView:updateTabIcons()
		end
	end
end

function TreasureTrainStrengthenLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateLoading()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateCost()
	self:_updateButton()
end

--基本信息
function TreasureTrainStrengthenLayer:_updateBaseInfo()
	local baseId = self._unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId)
	local rLevel = self._unitData:getRefine_level()
	self._fileNodeName:setName(baseId, rLevel)
	self._fileNodeName2:setName(baseId, rLevel)

	local heroUnitData = UserDataHelper.getHeroDataWithTreasureId(self._unitData:getId())

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
	self._textPotential:setString(Lang.get("treasure_detail_txt_potential", {value = param.potential}))
	self._textPotential:setColor(param.icon_color)
	self._textPotential:enableOutline(param.icon_color_outline, 2)


	self:_setButtonEnable(not self._isLimit)
	self:_setChangePageEnable(true)
end

--进度条
function TreasureTrainStrengthenLayer:_updateLoading(withAni)
	local level = self._unitData:getLevel()
	self._textLevel:setString(Lang.get("hero_upgrade_txt_level", {level = level}))

	local treasureConfig = self._unitData:getConfig()
	local templet = treasureConfig.levelup_templet
	local needCurExp = UserDataHelper.getTreasureLevelUpExp(level, templet)
	local nowExp = self._unitData:getExp() - UserDataHelper.getTreasureNeedExpWithLevel(templet, level)
	
	local percent = nowExp / needCurExp * 100
	self._loadingBarExp:setPercent(percent)

	if withAni then --播滚动动画
		local lastValue = tonumber(self._textExpPercent1:getString())
		if nowExp ~= lastValue then
			self._textExpPercent2:doScaleAnimation()
		end
		self._textExpPercent1:updateTxtValue(nowExp)
	else
		self._textExpPercent1:setString(nowExp)
	end
	self._textExpPercent2:setString("/"..needCurExp)
end

--等级
function TreasureTrainStrengthenLayer:_updateLevel()
	local level = self._unitData:getLevel()

	self._textOldLevel1:setString(level)
	self._textOldLevel2:setString("/"..self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))

	local newDes = Lang.get((level+1).."/"..self._limitLevel)
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_strengthen_max_level")
	end
	
	self._textNewLevel:setString(newDes)
end

--属性
function TreasureTrainStrengthenLayer:_updateAttr()
	local curDesInfo = TextHelper.getAttrInfoBySort(self._curAttrData)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._nextAttrData)

	for i = 1, 2 do
		local curInfo = curDesInfo[i]
		local nextInfo = nextDesInfo[i] or {}
		if curInfo then
			self["_fileNodeAttr"..i]:updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end
end

-- 登峰造极 图片
function TreasureTrainStrengthenLayer:_initImgMaterialTop()
	local offsetY = 19
	-- 最高级，去界限
	local sp = cc.Sprite:create(Path.getTextTeam("img_team_treasure_levelup"))
	local size = self._panelMaterial:getContentSize()
	sp:setPosition(cc.p(size.width/2, size.height/2+offsetY))
	sp:setVisible(false)
	self._panelMaterial:addChild(sp)
	self._imgMaterialTopLimit = sp
	-- 最高级
	local sp = cc.Sprite:create(Path.getText("txt_train_breakthroughtop"))
	local size = self._panelMaterial:getContentSize()
	sp:setPosition(cc.p(size.width/2, size.height/2+offsetY))
	sp:setVisible(false)
	self._panelMaterial:addChild(sp)
	self._imgMaterialTop = sp
end

--花费
function TreasureTrainStrengthenLayer:_updateCost()
	for i = 1, 4 do
		self["_fileNodeMaterial"..i]:updateCount()
	end
	self._fileNodeDetailTitle2:setVisible(not self._isGlobalLimit)
	for i = 1, 4 do
		self["_fileNodeMaterial"..i]:setVisible(not self._isGlobalLimit)
	end
	self._textMaterialTip:setVisible(not self._isGlobalLimit)
	self._imgMaterialTop:setVisible(self._isGlobalLimit)
	if self._isGlobalLimit and self._canLimit then
		self._imgMaterialTopLimit:setVisible(true)
		self._imgMaterialTop:setVisible(false)
	elseif self._isGlobalLimit then
		self._imgMaterialTopLimit:setVisible(false)
		self._imgMaterialTop:setVisible(true)
	else
		self._imgMaterialTopLimit:setVisible(false)
		self._imgMaterialTop:setVisible(false)
	end
end

function TreasureTrainStrengthenLayer:_onStartCallback(itemId, count)
	self._materialFakeCount = count
	self._materialFakeCostCount = 0
	self._fakeCurExp = self._unitData:getExp()
	self._fakeLevel = self._unitData:getLevel()
	self._fakeCurAttrData = self._curAttrData
	self._fakeNextAttrData = self._nextAttrData
end

function TreasureTrainStrengthenLayer:_onStopCallback()
	self._labelCount:setVisible(false)
end

function TreasureTrainStrengthenLayer:_onStepClickMaterialIcon(itemId, itemValue)
	if self._materialFakeCount == nil or self._materialFakeCount <= 0 then
		return false
	end
	if self._fakeCurExp >= self._limitExp then
		return false
	end

	self._materialFakeCount = self._materialFakeCount - 1
	self._materialFakeCostCount = self._materialFakeCostCount + 1
	self._fakeCurExp = self._fakeCurExp + itemValue
	self:_fakeUpdateView(itemId)
	self:_fakePlayEffect(itemId)

	return true
end

--假的刷新界面，根据客户端自己算的数据
function TreasureTrainStrengthenLayer:_fakeUpdateView(itemId)
	local config = self._unitData:getConfig()
	local templet = config.levelup_templet
	self._fakeLevel = UserDataHelper.getCanReachTreasureLevelWithExp(self._fakeCurExp, templet)
	self._textLevel:setString(Lang.get("hero_upgrade_txt_level", {level = self._fakeLevel}))

	--xN
	self._labelCount:setString("+"..self._materialFakeCostCount)
	self._labelCount:setVisible(self._materialFakeCostCount > 1)

	--进度条
	local needCurExp = UserDataHelper.getTreasureLevelUpExp(self._fakeLevel, templet)
	local nowExp = self._fakeCurExp - UserDataHelper.getTreasureNeedExpWithLevel(templet, self._fakeLevel)
	local percent = nowExp / needCurExp * 100
	self._loadingBarExp:setPercent(percent)
	self._textExpPercent1:updateTxtValue(nowExp)
	self._textExpPercent2:setString("/"..needCurExp)
	self._textExpPercent2:doScaleAnimation()

	--等级
	self._textOldLevel1:setString(self._fakeLevel)
	self._textOldLevel2:setString("/"..self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))
	local newDes = Lang.get((self._fakeLevel+1).."/"..self._limitLevel)
	if self._isGlobalLimit then
		newDes = Lang.get("equipment_strengthen_max_level")
	end
	self._textNewLevel:setString(newDes)

	--属性
	self._fakeCurAttrData = UserDataHelper.getTreasureStrAttrWithConfigAndLevel(config, self._fakeLevel)
	self._fakeNextAttrData = UserDataHelper.getTreasureStrAttrWithConfigAndLevel(config, self._fakeLevel + 1) or {}
	local curDesInfo = TextHelper.getAttrInfoBySort(self._fakeCurAttrData)
	local nextDesInfo = TextHelper.getAttrInfoBySort(self._fakeNextAttrData)

	for i = 1, 2 do
		local curInfo = curDesInfo[i]
		local nextInfo = nextDesInfo[i] or {}
		if curInfo then
			self["_fileNodeAttr"..i]:updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end

	--消耗
	local index = ITEM_ID_2_MATERICAL_INDEX[itemId]
	self["_fileNodeMaterial"..index]:setCount(self._materialFakeCount)
end

function TreasureTrainStrengthenLayer:_fakePlayEffect(itemId)
	local item = {id = itemId, num = 1}
	local materials = {}
	table.insert(materials, item)
	self:_playEffect(materials, true)
end

function TreasureTrainStrengthenLayer:_onClickMaterialIcon(materials)
	if self:_checkLimitLevel() == false then
		return
	end
	self:_doStrengthen(materials)
end

--检查等级限制
function TreasureTrainStrengthenLayer:_checkLimitLevel()
	local level = self._unitData:getLevel()
	if level >= self._limitLevel then
		G_Prompt:showTip(Lang.get("treasure_strengthen_level_limit_tip"))
		return false
	end
	return true
end

--获取升级需要的材料
function TreasureTrainStrengthenLayer:_getUpgradeMaterials(level)
	local templet = self._unitData:getConfig().levelup_templet
	local curLevel = self._unitData:getLevel()
	local targetLevel = math.min(curLevel+level, self._limitLevel)
	local curExp = clone(self._unitData:getExp())
	local targetExp = UserDataHelper.getTreasureNeedExpWithLevel(templet, targetLevel)
	
	local materials = {}
	local reach = false --是否达到限制
	for i = 1, 4 do
		local itemId = self["_fileNodeMaterial"..i]:getItemId()
		local expValue = self["_fileNodeMaterial"..i]:getItemValue()
		local count = self["_fileNodeMaterial"..i]:getCount()
		local item = {id = itemId, num = 0}
		for j = 1, count do
			curExp = curExp + expValue
			item.num = item.num + 1
			if curExp >= targetExp then
				reach = true
				break
			end
		end
		if item.num > 0 then
			table.insert(materials, item)
		end
		if reach then
			break
		end
	end

	return materials
end

--强化1级
function TreasureTrainStrengthenLayer:_onButtonStrengthenOneClicked()
	if self:_checkLimitLevel() == false then
		return
	end

	local materials = self:_getUpgradeMaterials(1)
	self:_doStrengthen(materials)
	self:_setButtonEnable(false)
	self:_setChangePageEnable(false)
end

--强化5级
function TreasureTrainStrengthenLayer:_onButtonStrengthenFiveClicked()
	if self:_checkLimitLevel() == false then
		return
	end

	local materials = self:_getUpgradeMaterials(5)
	self:_doStrengthen(materials)
	self:_setButtonEnable(false)
	self:_setChangePageEnable(false)
end

-- 跳转到界限界面
function TreasureTrainStrengthenLayer:_onButtonLimitClicked()
	if self._canLimit then
		self._parentView:onClickTabIcon(TreasureConst.TREASURE_TRAIN_LIMIT)
	end
end

function TreasureTrainStrengthenLayer:_doStrengthen(materials)
	if #materials == 0 then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_1)
		popup:openWithAction()
		return
	end

	local treasureId = self._unitData:getId()
	G_UserData:getTreasure():c2sUpgradeTreasure(treasureId, materials)
	self._costMaterials = materials
	self:_saveBeforeMasterInfo()
end

function TreasureTrainStrengthenLayer:_setButtonEnable(enable)
	self._buttonStrengthenOne:setEnabled(enable)
	self._buttonStrengthenFive:setEnabled(enable)
end

function TreasureTrainStrengthenLayer:_setChangePageEnable(enable)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function TreasureTrainStrengthenLayer:_updateButton()
	if self._isGlobalLimit and not self._isLimitTop then
		self._buttonStrengthenOne:setVisible(false)
		self._buttonStrengthenFive:setVisible(false)
		self._buttonLimit:setVisible(true)
	else
		self._buttonStrengthenOne:setVisible(true)
		self._buttonStrengthenFive:setVisible(true)
		self._buttonLimit:setVisible(false)
	end
	self._buttonLimit:setEnabled(self._canLimit)
end

function TreasureTrainStrengthenLayer:_onTreasureUpgradeSuccess()
	self:_updateData()
	self:_updateLoading(true)
	self:_updateCost()
	self:_updateButton()
	self:_saveCurMasterInfo()

	if self._materialFakeCount == 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
		self._materialFakeCount = nil
		self:_playEffect(nil, true, true, true)
		return
	end

	self:_playEffect(self._costMaterials, true, true, true)
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(TreasureConst.TREASURE_TRAIN_STRENGTHEN)
	end
end

--isPlayEvent 是否播play事件
--isNextEvent 是否播next事件
--isFinishEvent 是否播finish事件
function TreasureTrainStrengthenLayer:_playEffect(costMaterials, isPlayEvent, isNextEvent, isFinishEvent)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "start" then
    		if type(costMaterials) == "table" then
    			for i, item in ipairs(costMaterials) do
			    	local itemId = item.id
			    	local index = ITEM_ID_2_MATERICAL_INDEX[itemId]
			    	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
			    	local color = param.cfg.color
					local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere"..color))
					local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
					if emitter then
						emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
				        sp:addChild(emitter)
				        emitter:resetSystem()
				    end

				    local worldPos = self["_fileNodeMaterial"..index]:convertToWorldSpace(cc.p(0, 0))
					local pos = self:convertToNodeSpace(worldPos)
				    sp:setPosition(pos)
				    self:addChild(sp)
				    local function finishCallback()
				    	sp:runAction(cc.RemoveSelf:create())
				    end
				    G_EffectGfxMgr:applySingleGfx(sp, "smoving_baowuqianghua_lizi"..index, finishCallback, nil, nil)
			    end
    		end
    	elseif event == "play" then
    		if isPlayEvent then
    			if self._smovingZB then
	    			self._smovingZB:reset()
	    		end
	    		local selectedPos = self._parentView:getSelectedPos()
	    		local avatar = self._pageItems[selectedPos].avatar
	    		self._smovingZB = G_EffectGfxMgr:applySingleGfx(avatar, "smoving_zhuangbei", nil, nil, nil)
    		end
		elseif event == "next" then
			if isNextEvent then
				self:_setButtonEnable(not self._isLimit)
				self:_setChangePageEnable(true)
				self._newMasterLevel = self:_checkIsReachNewMasterLevel()
				if not self._newMasterLevel then
					self:_playPrompt()
				end
			end
		elseif event == "finish" then
			if isFinishEvent then
				self:_onEffectFinish()
			end
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_baowuqianghua", effectFunction, eventFunction , false)
	local offsetX = require("app.const.UIConst").EFFECT_OFFSET_X
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5+offsetX, G_ResolutionManager:getDesignHeight()*0.5))
end

function TreasureTrainStrengthenLayer:_playSingleBallEffect()
	
end

function TreasureTrainStrengthenLayer:_onEffectFinish()
	
end

--保存强化前的强化大师信息
function TreasureTrainStrengthenLayer:_saveBeforeMasterInfo()
	local pos = self._unitData:getPos()
	self._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3)
end

function TreasureTrainStrengthenLayer:_saveCurMasterInfo()
	local pos = self._unitData:getPos()
	self._curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3)
end

--检查是否达到了新的强化大师等级
function TreasureTrainStrengthenLayer:_checkIsReachNewMasterLevel()
	local beforeLevel = self._beforeMasterInfo.masterInfo.curMasterLevel
	local curLevel = self._curMasterInfo.masterInfo.curMasterLevel
	if curLevel > beforeLevel then
		local popup = require("app.scene.view.equipment.PopupMasterLevelup").new(self, self._beforeMasterInfo, self._curMasterInfo, MasterConst.MASTER_TYPE_3)
		popup:openWithAction()
		return curLevel
	end
	return false
end

--记录增加的等级
function TreasureTrainStrengthenLayer:_recordAddedLevel()
	local level = self._unitData:getLevel()
	self._diffLevel = level - self._lastLevel
	self._lastLevel = level
end

--记录增加的经验
function TreasureTrainStrengthenLayer:_recordAddedExp()
	local level = self._unitData:getLevel()
	local treasureConfig = self._unitData:getConfig()
	local templet = treasureConfig.levelup_templet
	local nowExp = self._unitData:getExp() - UserDataHelper.getTreasureNeedExpWithLevel(templet, level)

	self._diffExp = nowExp - self._lastExp
	self._lastExp = nowExp
end

--记录基础属性
function TreasureTrainStrengthenLayer:_recordBaseAttr()
	local diffAttr = {}
	for k, value in pairs(self._curAttrData) do
		local lastValue = self._lastAttr[k] or 0
		diffAttr[k] = value - lastValue
	end

	self._diffAttr = diffAttr
	self._lastAttr = self._curAttrData
end

function TreasureTrainStrengthenLayer:onExitPopupMasterLevelup()
	self:_playPrompt()
end

--飘字
function TreasureTrainStrengthenLayer:_playPrompt()
	self:_setButtonEnable(not self._isLimit)
	self:_setChangePageEnable(true)
	
    local summary = {}
    local content = Lang.get("summary_treasure_str_success")
	local param = {
		content = content,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	} 
	table.insert(summary, param)

    if self._diffLevel == 0 then
    	local content = Lang.get("summary_treasure_str_success_exp", {value = self._diffExp})
    	local param = {
    		content = content,
    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
    		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textExpPercent1, self),
			finishCallback = function()
				if self._onPromptFinish then
					self:_onPromptFinish()
				end
			end,
    	} 
		table.insert(summary, param)
    else
    	if self._newMasterLevel and self._newMasterLevel > 0 then
			local param = {
				content = Lang.get("summary_treasure_str_master_reach", {level = self._newMasterLevel}),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
			}
			table.insert(summary, param)
		end

    	local content1 = Lang.get("summary_treasure_str_success_level", {value = self._diffLevel})
    	local param1 = {
    		content = content1,
    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
    		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textOldLevel1, self),
    		finishCallback = function()
    			if self._textOldLevel1 and self._updateLevel then
    				self._textOldLevel1:updateTxtValue(self._unitData:getLevel())
    				self:_updateLevel()
    			end
				if self._onPromptFinish then
					self:_onPromptFinish()
				end
    		end
    	} 
		table.insert(summary, param1)

		--属性飘字
		self:_addBaseAttrPromptSummary(summary)
    end

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--加入基础属性飘字内容
function TreasureTrainStrengthenLayer:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN+UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr"..i], self),
				finishCallback = function()
					local _, curValue = TextHelper.getAttrBasicText(attrId, self._curAttrData[attrId])
					self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
					self["_fileNodeAttr"..i]:updateInfo(attrId, self._curAttrData[attrId], self._nextAttrData[attrId], 4)
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--飘字播放结束回调
function TreasureTrainStrengthenLayer:_onPromptFinish()
	self:runAction(cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(function()
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
			end)
		)
	)
end

return TreasureTrainStrengthenLayer