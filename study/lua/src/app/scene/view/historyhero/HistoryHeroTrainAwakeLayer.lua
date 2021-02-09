--[[
   Description: 历代名将养成
   Company: yoka
   Author: chenzhongjie
   Date: 2019-07-14 14:29:19
   LastEditors: chenzhongjie
   LastEditTime: 2019-07-30 16:28:49
]]


local ViewBase = require("app.ui.ViewBase")
local HistoryHeroTrainAwakeLayer = class("HistoryHeroTrainAwakeLayer", ViewBase)
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local Path = require("app.utils.Path")
local RedPointHelper = require("app.data.RedPointHelper")

local COLOR_SKILL_INVALID = cc.c3b(0xfe, 0xf2, 0xc8)
local COLOR_SKILL_VALID = Colors.OBVIOUS_GREEN
local COLOR_SKILL_OUTLINE = cc.c3b(0xa3, 0x65, 0x1e)

function HistoryHeroTrainAwakeLayer:ctor()
	self._buttonAwake 	= nil
	self._resource 		= nil
	self._addWeapon 	= nil
	self._nodeBreak 	= nil
	self._textSkillTitle= nil
	self._nodeEffect	= nil
	self._commonItem01 = nil  
	self._commonItem02 = nil 
	self._commonItem03 = nil  

	

	self._awakeData		= {}	-- 当前觉醒所需道具
	self._awakeId		= 0		-- 觉醒ID
	self._breakData     = {}
	self._unitData		= nil
	self._curAddPos		= 0		--当前点击加号的序号
	self._isFakeData	= false --是否是假数据
	self._heroUsedWeapon= nil	--临时装备武器的名将 

	self._onStatusChangeCallback = nil --装备/觉醒回调(unitData, bAttrChanged)

	local resource = {
		file = Path.getCSB("HistoryHeroTrainAwakeLayer", "historyhero"),
		binding = {
			_buttonAwake = {
				events = {{event = "touch", method = "_onButtonAwake"}}
			},
			_addWeapon = {
				events = {{event = "touch", method = "_onAddWeapon"}}
			},
			_btnUnloadWeapon = {
				events = {{event = "touch", method = "_onUnloadWeapon"}}
			},
		},
	}
	HistoryHeroTrainAwakeLayer.super.ctor(self, resource)
end

function HistoryHeroTrainAwakeLayer:onCreate()
	self._buttonAwake:setString(Lang.get("hero_detail_btn_awake"))
	
	self:_initAddView()

	local UIActionHelper = require("app.utils.UIActionHelper")
	UIActionHelper.playBlinkEffect(self["_addWeapon"], nil, {scale1=1.0, scale2=1.2})
end

function HistoryHeroTrainAwakeLayer:onEnter()
	self._awakeSuccess = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS, handler(self, self._onEquipSuccess))
	self._downSuccess = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_DOWN_SUCCESS, handler(self, self._onBreakDownSuccess))
end

function HistoryHeroTrainAwakeLayer:onExit()
	if self._awakeSuccess then
		self._awakeSuccess:remove()
		self._awakeSuccess = nil
	end
	if self._downSuccess then
		self._downSuccess:remove()
		self._downSuccess = nil
	end
end

function HistoryHeroTrainAwakeLayer:setNodeVisible(bVisible)
	self._resource:setVisible(bVisible)
end

--武器按钮
function HistoryHeroTrainAwakeLayer:setWeaponVisible(bVisible)
	self._addWeapon:setVisible(bVisible)
end

function HistoryHeroTrainAwakeLayer:_initAddView()
	for index = 1, 3 do
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect(self["_imageAdd"..index])
		self["_imageAdd"..index]:setVisible(false)
		self["_imageAdd"..index]:setTag(index)
		self["_imageAdd"..index]:setSwallowTouches(false)
		self["_imageAdd"..index]:setTouchEnabled(true)
		self["_imageAdd"..index]:addClickEventListenerEx(handler(self, self._onClickAdd))
	end
end


-- @Role 	刷新加号状态
function HistoryHeroTrainAwakeLayer:_updateAddVisible()
	local bCanAwake = false
	local data = G_UserData:getHistoryHero():getWeaponList()
	for key, value in pairs(data) do
		if value:getId() == self._awakeData.value then
			bCanAwake = true
		end
	end
	self["_addWeapon"]:setVisible(bCanAwake)
end

-- @Role 	刷新上阵数量
function HistoryHeroTrainAwakeLayer:_updateSquadNum(bSquad)
	-- local descStr = bSquad and Lang.get("historyhero_awakeenougth_desc", {num1 = self._awakeData.size, num2 = self._awakeData.size}) 
	-- 						or Lang.get("historyhero_awakenotenougth_desc", {num1 = 0, num2 = self._awakeData.size})
	-- self._nodeItemName:removeAllChildren()
	-- self._nodeItemName:setVisible(not self._isInBanView)


	-- local richText = ccui.RichText:createRichTextByFormatString(descStr,
	-- 			{defaultColor = Colors.BRIGHT_BG_ONE, defaultSize = 22, other ={
	-- 				[1] = {fontSize = 22}
	-- 			}})
	-- richText:setPositionX(25)
	-- richText:setPositionY(2)
	-- self._nodeItemName:addChild(richText)
end

-- @Role 	武器名
function HistoryHeroTrainAwakeLayer:_updateName()
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(self._unitData:getSystem_id(), 1)
	if tonumber(heroStepInfo.type_1) > 0 then
		self._awakeData.type  = heroStepInfo.type_1
		self._awakeData.value = heroStepInfo.value_1
		self._awakeData.size  = heroStepInfo.size_1
	end

	local limitLevel = self._unitData:getBreak_through()
	local color = self._unitData:getConfig().color
	local content
	if color == HistoryHeroConst.QUALITY_ORANGE then
		if limitLevel == 1 then
			-- 点击加号添加名将兵器
			content = Lang.get("historyhero_skill_purple_break1", {
				icon = Path.getQinTomb("img_qintomb_add02"),
			})
		elseif limitLevel == 2 then
			content = Lang.get("historyhero_skill_orange_break2", {
				icon = Path.getQinTomb("img_qintomb_add02"),
			})
		elseif limitLevel == 3 then
			content = Lang.get("historyhero_skill_orange_break3", {
				icon = Path.getCommonImage("img_btn_close01"),
			})
		end
	elseif color == HistoryHeroConst.QUALITY_PURPLE then
		if limitLevel == 1 then
			content = Lang.get("historyhero_skill_purple_break1", {
				icon = Path.getQinTomb("img_qintomb_add02"),
			})
		elseif limitLevel == 2 then
			content = Lang.get("historyhero_skill_purple_break2", {
				icon = Path.getCommonImage("img_btn_close01"),
			})
		end		
	end

	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0.5, 1))
	self._nodeSkillTitle:removeAllChildren()
	self._nodeSkillTitle:addChild(label)

	if color == HistoryHeroConst.QUALITY_ORANGE then
		self:_setTitleStyle(limitLevel == 1 and 1 or 2)
	elseif color == HistoryHeroConst.QUALITY_PURPLE then
		self:_setTitleStyle(1)
	end
end

-- @Role 	刷新觉醒按钮
function HistoryHeroTrainAwakeLayer:_updateAddAwake(data)
	if G_UserData:getHistoryHero():getHeroWeaponUnitData(self._awakeData.value) ~= nil then
		self["_commonItem"]:setIconMask(false)
	else
		self["_commonItem"]:setIconMask(true)
	end
end

-- @Role 	刷新当前武将信息
function HistoryHeroTrainAwakeLayer:updateUI(data, isOnFormation)
	if not data then
		data = self:_createFakeData()
	else
		self._isFakeData = false
	end
	self._unitData = data
	self:_updateFakeDataUI()
	self:_updateName()
	self:_updateIcon()
	self:_updateSkillDesc()
	self:_createAnimation(isOnFormation)
	self:_updateBtn()
end

-- Icon刷新状态
function HistoryHeroTrainAwakeLayer:_updateIcon()
	local data = self._unitData
	local limitLevel = data:getBreak_through()
	if limitLevel < 2 then
		self["_commonItem"]:setVisible(false)
		self["_addWeapon"]:setVisible(not self._isFakeData)

		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, data)
		self._redPointWeapon:setVisible(reach)
	else
		local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data:getSystem_id(), 1)
		self["_commonItem"]:unInitUI()
		self["_commonItem"]:initUI(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1)
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local weaponParam = TypeConvertHelper.convert(heroStepInfo.type_1 , heroStepInfo.value_1, heroStepInfo.size_1)
		self["_commonItem"]:hideBg()
		self["_commonItem"]:setIconScale(0.5)
		self["_commonItem"]:loadIcon(weaponParam.icon_big)
		self["_commonItem"]:setIconMask(false)
		self["_commonItem"]:setVisible(true)
		self["_addWeapon"]:setVisible(false)
	end
	self._btnUnloadWeapon:setVisible(limitLevel == 2 and self._unitData:getMaterialCount() == 0)

	local heroStepInfo2 = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data:getSystem_id(), 2)
	self:_initBreakIcon(heroStepInfo2)
	self:_updateBreakIcon(data)
end

--突破icon
function HistoryHeroTrainAwakeLayer:_initBreakIcon(data)
	-- for index = 1, 3 do
	-- 	self["_commonItem0"..index]:setVisible(false)
	-- end
	self._breakData = {}

	local count = 0
	if tonumber(data.type_1) > 0 then
		count = (count + 1)
		-- self["_commonItem01"]:unInitUI()
		self["_commonItem01"]:setRoundType(true)
		self["_commonItem01"]:setTag(1)
		self["_commonItem01"]:setCloseBtnHandler(handler(self, self._onUnloadHeroTouched))
		-- self["_commonItem01"]:initUI(data.type_1, data.value_1, data.size_1)
		self["_commonItem01"]:updateUI(data.value_1, data.size_1)
		-- self["_commonItem01"]:setRoundIconMask(true)
		if self._breakData[1] == nil then
			self._breakData[1] = {
				type  = data.type_1,
				value = data.value_1,
				size  = data.size_1,
				step  = data.step_1,
			}
		end
	end
	if tonumber(data.type_2) > 0 then
		count = (count + 1)
		-- self["_commonItem02"]:unInitUI()
		self["_commonItem02"]:setRoundType(true)
		self["_commonItem02"]:setTag(2)
		self["_commonItem02"]:setCloseBtnHandler(handler(self, self._onUnloadHeroTouched))
		-- self["_commonItem02"]:initUI(data.type_2, data.value_2, data.size_2)
		self["_commonItem02"]:updateUI(data.value_2, data.size_2)
		-- self["_commonItem02"]:setRoundIconMask(true)
		self._breakData[2] = {
			type  = data.type_2,
			value = data.value_2,
			step  = data.step_2,
		}
	end
	if tonumber(data.type_3) > 0 then
		count = (count + 1)
		-- self["_commonItem03"]:unInitUI()
		self["_commonItem03"]:setRoundType(true)
		self["_commonItem03"]:setTag(3)
		self["_commonItem03"]:setCloseBtnHandler(handler(self, self._onUnloadHeroTouched))
		-- self["_commonItem03"]:initUI(data.type_3, data.value_3, data.size_3)
		self["_commonItem03"]:updateUI(data.value_3, data.size_3)
		-- self["_commonItem03"]:setRoundIconMask(true)
		self._breakData[3] = {
			type  = data.type_3,
			value = data.value_3,
			size  = data.size_3,
			step  = data.step_3,
		}
	end

	local tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_1
	if count == 1 then
		tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_1
	elseif count == 2 then
		tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_2
	elseif count == 3 then
		tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_3
	end
	for index = 1, count do
		self["_commonItem0"..index]:setVisible(true)
		self["_commonItem0"..index]:setRoundIconMask(true)
		self["_commonItem0"..index]:setTouchEnabled(false)
		self["_commonItem0"..index]:updateUIBreakThrough(self._breakData[index].step)
		self["_imageAdd"..index]:setVisible(true)
	end
end

function HistoryHeroTrainAwakeLayer:_updateBreakIcon(data)
	if data:getBreak_through() == 3 then
		for index = 1, 3 do
			self["_imageAdd"..index]:setVisible(false)
			self["_commonItem0"..index]:setRoundIconMask(false)
			self["_commonItem0"..index]:showRedPoint(false)
			self["_commonItem0"..index]:showCloseBtn(true)
		end
		return
	end

	local materialData = data:getMaterials()
	if type(materialData) ~= "table" then return end
	-- if next(materialData) == nil then
	-- 	return
	-- end

	for index, cfg in ipairs(self._breakData) do
		self["_imageAdd"..index]:setVisible(true)
		self["_commonItem0"..index]:setRoundIconMask(true)
		self["_commonItem0"..index]:showCloseBtn(false)

		local reach1 = G_UserData:getHistoryHero():existLevel2Hero(cfg.value)
		local reach2 = G_UserData:getHistoryHero():existLevel1HeroWithWeapon(cfg.value)
		local bExist = data:existMaterial(index)
		self["_commonItem0"..index]:showRedPoint(reach1 or reach2)

		for k, v in pairs(materialData) do
			if cfg.type == v.type and cfg.value == v.value then
				self["_imageAdd"..index]:setVisible(false)
				self["_commonItem0"..index]:setRoundIconMask(false)
				self["_commonItem0"..index]:showRedPoint(false)
				self["_commonItem0"..index]:showCloseBtn(true)
			end
		end	
	end
end

function HistoryHeroTrainAwakeLayer:_updateSkillDesc()
	local limitLevel = self._unitData:getBreak_through()
	local color = self._unitData:getConfig().color
	local colorSkill = nil
	if color == HistoryHeroConst.QUALITY_ORANGE then
		if limitLevel == 1 or limitLevel == 2 then
			colorSkill = COLOR_SKILL_INVALID
		elseif limitLevel == 3 then
			colorSkill = COLOR_SKILL_VALID
		end
	elseif color == HistoryHeroConst.QUALITY_PURPLE then
		if limitLevel == 1 then
			colorSkill = COLOR_SKILL_INVALID
		elseif limitLevel == 2 then
			colorSkill = COLOR_SKILL_VALID
		end
	end
	
	--技能描述要-1
	-- limitLevel = limitLevel == 1 and 1 or limitLevel - 1
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(self._unitData:getSystem_id(), limitLevel)

	local skillDes = heroStepInfo.description
	if self._skillDesc then
		self._skillDesc:removeFromParent()
		self._skillDesc = nil
	end
	self._skillDesc = cc.Label:createWithTTF("", Path.getCommonFont(), 18)
	self._skillDesc:setColor(colorSkill)
	self._skillDesc:setAlignment(cc.TEXT_ALIGNMENT_CENTER)
	self._skillDesc:enableOutline(COLOR_SKILL_OUTLINE, 1)
	self._skillDesc:setWidth(185)
	self._skillDesc:setAnchorPoint(cc.p(0.5, 1))
	self._skillDesc:setPosition(self._nodeSkillDesc:getPosition())
	self._fakeSkillNode:addChild(self._skillDesc)
	self._skillDesc:setString(skillDes)
end

function HistoryHeroTrainAwakeLayer:_updateBtn()
	self._buttonAwake:setVisible(false)
end

function HistoryHeroTrainAwakeLayer:_createFakeData(id)
	local HistoryHeroUnit = require("app.data.HistoryHeroUnit")
	local unit = HistoryHeroUnit.new()
	unit:createFakeUnit(id or HistoryHeroConst.DEFAULT_HISTORY_HERO_ID)
	self._isFakeData = true
	return unit
end

-------------------------------------------------------------------------
--------------------------------回调-------------------------------------
-------------------------------------------------------------------------
--装备回调
function HistoryHeroTrainAwakeLayer:_onEquipSuccess(id, message)
	local unitData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._unitData:getId())
	if unitData ~= nil then
		self._unitData = unitData
		self._isFakeData = false
		self:_updateIcon()
		self:_updateBtn()
		local bAttrChanged = true
		if unitData:getBreak_through() == 2 then 
			if self._curAddPos == 0 then
				self:_createEffect()
			else
				self:_createEffectWithPos(self._curAddPos)
				bAttrChanged = false
			end
		else
			--觉醒
			self:_createAwakeEffect()
		end
		self:updateUI(unitData)

		if self._heroUsedWeapon then
			--消耗临时装备武器的名将 
			G_UserData:getHistoryHero():c2sStarBreakThrough(self._unitData:getId(), self._curAddPos, self._heroUsedWeapon:getId())
			self._heroUsedWeapon = nil
			return
		end
		if unitData:getBreak_through() == 2 and 
			unitData:getConfig().color == HistoryHeroConst.QUALITY_ORANGE and 
			#unitData:getMaterials() == 0 then
				self:_createUpAnimation()
		end
		
		self._onStatusChangeCallback(unitData, bAttrChanged, false)
		self._curAddPos = 0
	end
end

--装备武器
function HistoryHeroTrainAwakeLayer:_onAddWeapon()
	local weaponId = self._unitData:getConfig().arm
	local bHave = self._unitData:haveWeapon()
	
	if not bHave then
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponId)
		PopupItemGuider:openWithAction()
		return
	end

	G_UserData:getHistoryHero():c2sStarBreakThrough(self._unitData:getId() ,0, nil)
end

--脱下武器
function HistoryHeroTrainAwakeLayer:_onUnloadWeapon()
	if self._unitData:getBreak_through() ~= 2 then
		return
	end

	G_UserData:getHistoryHero():c2sStarBreakDown(self._unitData:getId() ,0)
end

--脱下武器成功回调
function HistoryHeroTrainAwakeLayer:_onBreakDownSuccess()
	local unitData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._unitData:getId())
	if unitData ~= nil then
		self._unitData = unitData
		self:_updateIcon()
		self:_updateBtn()
		local bAttrChanged = true
	
		local materialCount = unitData:getMaterialCount()
		if unitData:getBreak_through() == 2 then 
			if materialCount ~= 2 then 
				bAttrChanged = false
			end
		else
			--觉醒
			-- self:updateUI(unitData)
		end
		self:updateUI(unitData)
		if unitData:getBreak_through() == 1 and 
			unitData:getConfig().color == HistoryHeroConst.QUALITY_ORANGE and 
			#unitData:getMaterials() == 0 then
				self:_createOrangeOpen2CloseAnimation()
		end
		
		self._onStatusChangeCallback(unitData, bAttrChanged, true)
		self._curAddPos = 0
	end
end

function HistoryHeroTrainAwakeLayer:_onClickAdd(sender)
	local curAddIndex = sender:getTag()
	if type(curAddIndex) ~= "number" then
		return
	end

	if self._unitData:getBreak_through() < 2 then
		G_Prompt:showTip(Lang.get("historyhero_awake_first"))
		return
	end

	--已经觉醒过的列表
	local function getWakedHeroList(notInFormationList)
		local wakedList = {}
		local unwakedList = {}
		for k, v in ipairs(notInFormationList) do
			if v:getBreak_through() == 2 then
				table.insert(wakedList, v)
			end
			if v:getBreak_through() == 1 then
				table.insert(unwakedList, v)
			end
		end
		return wakedList, unwakedList
	end


	local breakData = self._breakData[curAddIndex]
	local notInFormationList = G_UserData:getHistoryHero():getNotInFormationList(breakData.value)
	if #notInFormationList > 0 then
		local wakedList, unwakedList = getWakedHeroList(notInFormationList)
		self._curAddPos = curAddIndex
		if #wakedList > 0 then
			self:_enoughProc(wakedList, curAddIndex)
		else
			self:_notEnoughProc(unwakedList, #notInFormationList, curAddIndex)
		end
	else
		--没有未上阵的 弹武将使用框，弹出获取途径
		self:_noHistoryHeroProc(breakData.value)
		-- local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		-- PopupItemGuider:updateUI(breakData.type, breakData.value)
		-- PopupItemGuider:openWithAction()
	end
end

function HistoryHeroTrainAwakeLayer:_onButtonAwake()
	if #self._unitData:getMaterials() < 3 then
		G_Prompt:showTip(Lang.get("historyhero_material_not_enough"))
		return
	end
	G_UserData:getHistoryHero():c2sStarBreakThrough(self._unitData:getId(), 0, 0)
end

--武将卸载按钮回调
function HistoryHeroTrainAwakeLayer:_onUnloadHeroTouched(commonHistoryHeroIcon)
	if self._unitData:getBreak_through() == 1 then
		return
	end

	local tag = commonHistoryHeroIcon:getTag()
	G_UserData:getHistoryHero():c2sStarBreakDown(self._unitData:getId(), commonHistoryHeroIcon:getTag())
end



--[[
   name: 未上阵名将至少有一个装备了武器，弹框提示突破
   param wakedList:未上阵且已经觉醒列表 curAddIndex:当前坑位index
   return: nil
]]
function HistoryHeroTrainAwakeLayer:_enoughProc(wakedList, curAddIndex)
	-- local paramCfg = self["_commonItem0"..curAddIndex]:getItemParams()
	-- local function onCallBackFunc()
	-- 	local cost = wakedList[1]
	-- 	G_UserData:getHistoryHero():c2sStarBreakThrough(self._unitData:getId(), curAddIndex, cost:getId())
	-- end
	-- onCallBackFunc()

	-- local richList = {}
	-- local richText1 = Lang.get("historyhero_break_enough_material1",
    -- {
    --     resNum = #wakedList,
	-- 	heroName = paramCfg.name,
	-- 	itemColor = Colors.colorToNumber(paramCfg.icon_color),
	-- })
	-- local richText2 = Lang.get("historyhero_break_enough_material2",{})
	
	-- table.insert( richList, richText1)
	-- table.insert( richList, richText2)
	
	-- local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_title_notice"),"", onCallBackFunc)
    -- PopupAlert:addRichTextList(richList)
	-- PopupAlert:openWithAction()

	local PopupHistoryHeroUseWeapon = require("app.ui.PopupHistoryHeroUseWeapon")
	local popupUseWeapon = PopupHistoryHeroUseWeapon.new(handler(self, self._onPopupHistoryHeroUseWeapon2))
	popupUseWeapon:setType(PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON)
	popupUseWeapon:updateUI(wakedList)
	popupUseWeapon:openWithAction()
end

function HistoryHeroTrainAwakeLayer:_onPopupHistoryHeroUseWeapon2(data)
	G_UserData:getHistoryHero():c2sStarBreakThrough(self._unitData:getId(), self._curAddPos, data:getId())
end


--[[
   name: 未上阵名将均未装备武器
   param num:未上阵数量 curAddIndex:当前坑位index
   return: nil
]]
function HistoryHeroTrainAwakeLayer:_notEnoughProc(unwakedList, num, curAddIndex)
	local popupUseWeapon = require("app.ui.PopupHistoryHeroUseWeapon").new(handler(self, self._onPopupHistoryHeroUseWeapon))
	popupUseWeapon:updateUI(unwakedList)
	popupUseWeapon:openWithAction()
end

function HistoryHeroTrainAwakeLayer:_onPopupHistoryHeroUseWeapon(data)
	self._heroUsedWeapon = data
	G_UserData:getHistoryHero():c2sStarBreakThrough(self._heroUsedWeapon:getId(), 0, nil)
end


--没有所需武将
function HistoryHeroTrainAwakeLayer:_noHistoryHeroProc(baseId)
	local popupUseWeapon = require("app.ui.PopupHistoryHeroUseWeapon").new()
	local data = self:_createFakeData(baseId)
	popupUseWeapon:updateUI({data}, 1, true)
	popupUseWeapon:openWithAction()
end










------------------------------------------------------------------------
---------------------------Animation------------------------------------
------------------------------------------------------------------------
function HistoryHeroTrainAwakeLayer:_createAnimation(isOnFormation)
	self:_removeAwakeEffectAvalon()
	if isOnFormation and self._unitData:getConfig().color == HistoryHeroConst.QUALITY_PURPLE then
		--紫色名将上阵 剑：打开-》关闭
		self:_createOpen2CloseAnimation()
		return
	end
	if self._isFakeData then
		self:_createNoHeroOpenAnimation()
		return
	end
	if self._unitData:getBreak_through() == 1 then
		self:_createCloseAnimation()
	elseif self._unitData:getBreak_through() == 3 then
		self:_createOpenAnimation()
		self:_createAwakeEffectAvalon()
	elseif self._unitData:getBreak_through() == 2 then
		if self._unitData:getConfig().color == HistoryHeroConst.QUALITY_PURPLE then
			self:_createCloseAnimation()
		elseif self._unitData:getConfig().color == HistoryHeroConst.QUALITY_ORANGE then
			self:_createOpenAnimation()
		end
	end
end

--剑张开动画
function HistoryHeroTrainAwakeLayer:_createUpAnimation()
	self._nodeEffect:removeAllChildren()
	self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close)
	self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close)
	self._node1:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon1.close)
	self._node2:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon2.close)
	self._node3:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon3.close)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_lidaimingjiang_ui_faguang_copy3" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy2" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
			return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_guangdian_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_guangdian")
            subEffect:play()
            return subEffect
		end
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "finish" then
		elseif event == "start" then
			self._avalon:setVisible(true)
			self._sword:setVisible(true)
			self:_showIcon(true)
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaodong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jiandong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node1, "smoving_lidaimingjiang_ui_icon1dong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node2, "smoving_lidaimingjiang_ui_icon2dong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node3, "smoving_lidaimingjiang_ui_icon3dong", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_up", effectFunction, eventFunction , false )
	self._effectShow = effect
end

--剑保持张开
function HistoryHeroTrainAwakeLayer:_createOpenAnimation()
	self._nodeEffect:removeAllChildren()
	self._avalon:setVisible(true)
	self._sword:setVisible(true)
	self:_showIcon(true)
	self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.open)
	self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.open)
	self._node1:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon1.open)
	self._node2:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon2.open)
	self._node3:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon3.open)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_lidaimingjiang_ui_faguang_copy3" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy2" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
			return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_guangdian_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_guangdian")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_guangdian_copy2" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_guangdian")
            subEffect:play()
			return subEffect
		end
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "finish" then
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaobudong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jianbudong", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_open", effectFunction, eventFunction , false )
	self._effectShow = effect
end

--剑保持关闭
function HistoryHeroTrainAwakeLayer:_createCloseAnimation()
	self._nodeEffect:removeAllChildren()
	self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close)
	self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "finish" then
			self._avalon:setVisible(true)
			self._sword:setVisible(true)
			self:_showIcon(false)
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaobudong", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jianbudong", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_clsoe", effectFunction, eventFunction , false )
	self._effectShow = effect
end

--剑收起：无历代名将-》装备历代名将
function HistoryHeroTrainAwakeLayer:_createOpen2CloseAnimation()
	self._nodeEffect:removeAllChildren()
	self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close)
	self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "start" then
			self._avalon:setVisible(true)
			self._sword:setVisible(true)
			self:_showIcon(false)
			self:_updateFakeDataUI()
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaoshou", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jianshou", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_shoujian2", effectFunction, eventFunction , false )
	self._effectShow = effect
end

--剑收起：橙色历代名将卸下武器
function HistoryHeroTrainAwakeLayer:_createOrangeOpen2CloseAnimation()
	self._nodeEffect:removeAllChildren()
	-- self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.open)
	-- self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.open)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		if effect == "effect_lidaimingjiang_ui_faguang_copy3" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy2" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
			return subEffect
		elseif effect == "effect_lidaimingjiang_ui_faguang_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_faguang")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_guangdian_copy1" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_guangdian")
            subEffect:play()
            return subEffect
		elseif effect == "effect_lidaimingjiang_ui_guangdian_copy2" then
			local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_guangdian")
            subEffect:play()
			return subEffect
		end
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "start" then
			self._avalon:setVisible(true)
			self._sword:setVisible(true)
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaoshou", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jianshou", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node1, "smoving_lidaimingjiang_ui_icon1shou", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node2, "smoving_lidaimingjiang_ui_icon2shou", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._node3, "smoving_lidaimingjiang_ui_icon3shou", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_shoujian", effectFunction, eventFunction , false )
	self._effectShow = effect
end

--剑保持张开：无历代名将时使用
function HistoryHeroTrainAwakeLayer:_createNoHeroOpenAnimation()
	self._nodeEffect:removeAllChildren()
	self._avalon:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close)
	self._sword:setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		return cc.Node:create()
    end
    local function eventFunction(event)
		if event == "start" then
			self._avalon:setVisible(true)
			self._sword:setVisible(true)
			self:_showIcon(false)
			self:_updateFakeDataUI()
			G_EffectGfxMgr:applySingleGfx(self._avalon, "smoving_lidaimingjiang_ui_jianqiaozhangkai", nil, nil, nil)
			G_EffectGfxMgr:applySingleGfx(self._sword, "smoving_lidaimingjiang_ui_jianzhangkai", nil, nil, nil)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_lidaimingjiang_ui_zhangkai", effectFunction, eventFunction , false )
	self._effectShow = effect
end

function HistoryHeroTrainAwakeLayer:_showIcon(bShow)
	self._node1:setVisible(bShow)
	self._node2:setVisible(bShow)
	self._node3:setVisible(bShow)
end

--style 1 武器装备 2 突破
function HistoryHeroTrainAwakeLayer:_setTitleStyle(style)
	if style == 1 then
		self._trainTitleLv1:setVisible(true)
		self._trainTitleLv2:setVisible(false)
	else
		self._trainTitleLv1:setVisible(false)
		self._trainTitleLv2:setVisible(true)
	end
end

function HistoryHeroTrainAwakeLayer:_createEffect()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new("effect_jinnang_chengsejihuo")
	self._nodeEffectWeapon:removeAllChildren()
	self._nodeEffectWeapon:addChild(subEffect)
    subEffect:play()
end

function HistoryHeroTrainAwakeLayer:_createEffectWithPos(pos)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new("effect_jinnang_chengsejihuo")
	self["_nodeEffect" .. pos]:removeAllChildren()
	self["_nodeEffect" .. pos]:addChild(subEffect)
    subEffect:play()
end

--觉醒特效
function HistoryHeroTrainAwakeLayer:_createAwakeEffect()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_juexing")
	self["_nodeAwakeEffect"]:removeAllChildren()
	self["_nodeAwakeEffect"]:addChild(subEffect)
    subEffect:play()
end

--觉醒特效(剑鞘)
function HistoryHeroTrainAwakeLayer:_createAwakeEffectAvalon()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local subEffect = EffectGfxNode.new("effect_lidaimingjiang_ui_juexingwuqi")
	self["_nodeAwakeEffectWeapon"]:removeAllChildren()
	self["_nodeAwakeEffectWeapon"]:addChild(subEffect)
    subEffect:play()
end

--移除觉醒特效(剑鞘)
function HistoryHeroTrainAwakeLayer:_removeAwakeEffectAvalon()
	self["_nodeAwakeEffectWeapon"]:removeAllChildren()
end



--无历代名将的相关显示
function HistoryHeroTrainAwakeLayer:_updateFakeDataUI()
	self._fakeAddNode:setVisible(not self._isFakeData)
	self._fakeSkillNode:setVisible(not self._isFakeData)
end

------------------------------------------------------------------------
------------------------------------------------------------------------
------------------------------------------------------------------------
--状态回调
--_onStatusChangeCallback (unitData, bAttrChanged)
--unitData 历代名将data
--bAttrChanged 属性是否变化
--bUnload 是否是卸下
function HistoryHeroTrainAwakeLayer:setStatusChangeCallback(cb)
	self._onStatusChangeCallback = cb
end

return HistoryHeroTrainAwakeLayer