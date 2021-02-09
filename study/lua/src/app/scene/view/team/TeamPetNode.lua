--
-- Author: hedili
-- Date: 2018-02-18 11:14:10
-- 阵容神兽模块

local ViewBase = require("app.ui.ViewBase")
local TeamPetNode = class("TeamPetNode",ViewBase)
local PopupChoosePet = require("app.ui.PopupChoosePet")
local PopupChoosePetHelper = require("app.ui.PopupChoosePetHelper")
local AttributeConst = require("app.const.AttributeConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PetDetailViewHelper = require("app.scene.view.petDetail.PetDetailViewHelper")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper = require("yoka.utils.UIHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local UIConst = require("app.const.UIConst")

--需要记录的属性列表
--{属性Id， 对应控件名}
local RECORD_ATTR_LIST = {	
	{AttributeConst.ATK_FINAL, "_fileNodeAttr1"},
	{AttributeConst.HP_FINAL, "_fileNodeAttr3"},
	{AttributeConst.PD_FINAL, "_fileNodeAttr2"},
	{AttributeConst.MD_FINAL, "_fileNodeAttr4"},
}

function TeamPetNode:ctor(parentView)
	self._parentView = parentView
	self._petDesList = nil --神兽天赋列表
	local resource = {
		file = Path.getCSB("TeamPetNode", "team"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonChange = {
				events = {{event = "touch", method = "_onButtonChangeClicked"}}
			},
			_buttonUnload = {
				events = {{event = "touch", method = "_onButtonUnloadClicked"}}
			}
		},
	}

	TeamPetNode.super.ctor(self, resource)
end

function TeamPetNode:onCreate()
	self:_initData()
	self:_initView()
end

function TeamPetNode:_initData()
	self._lastPetLevel = {} --记录神兽等级:{id, level}
	self._lastPetRank = {} --记录神兽突破等级:{id, level}
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_PET_TEAM_SLOT"])
end

function TeamPetNode:_initView()
	self._nodeDetailTitle1:setTitle(Lang.get("team_detail_title_basic"))
	self._nodeDetailTitle2:setTitle(Lang.get("team_detail_title_pet2"))
	self._nodeLevel:setFontSize(20)
end

function TeamPetNode:onEnter()
	self._signalChangePetFormation = G_SignalManager:add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(self, self._changePetFormation))
	self:_updateData()
	self:_updateView()

	if self:_checkPetTrainPrompt() then
		self:_playPetTrainPrompt()
	end
end

function TeamPetNode:onExit()
	self._signalChangePetFormation:remove()
	self._signalChangePetFormation =nil

	if self._curPetData then
		self._lastPetLevel = {self._curPetData:getId(), self._curPetData:getLevel()}--记录等级
		self._lastPetRank = {self._curPetData:getId(), self._curPetData:getStar()}--记录突破等级
	end
end

function TeamPetNode:updateInfo()
	self:_updateData()
	self:_updateView()
end

function TeamPetNode:_updateData()
	local petId = G_UserData:getBase():getOn_team_pet_id()
	G_UserData:getPet():setCurPetId(petId)
	self._curPetData = nil
	if petId > 0 then
		self._curPetData = G_UserData:getPet():getUnitDataWithId(petId)
	end
	
	self:_recordBaseAttr()
	G_UserData:getAttr():recordPower()
end

function TeamPetNode:_updateView()
	self:_updateBaseInfo()
	self:_updateAttr()
	self:_updateSkill()	
	self:_updatePower()
	self:checkPetTrainRP()
end

--更新技能描述
function TeamPetNode:_updateSkill()
	if self._curPetData == nil then
		return
	end

	local baseId = self._curPetData:getBase_id()
	local starLevel = self._curPetData:getStar()
	local skillIds = UserDataHelper.getPetSkillIds(baseId,starLevel )
	
	for i=1, 3 do
		self["_fileNodeSkill"..i]:updateUI(0, true, baseId,starLevel)
	end
	
	for i ,skillId in ipairs(skillIds) do
		self["_fileNodeSkill"..i]:updateUI(skillId, true, baseId,starLevel)
	end
	
end

--战斗力
function TeamPetNode:_updatePower()
	local power = 0
	if self._curPetData then
		power = UserDataHelper.getPetPower(self._curPetData)
	end
	
	self._fileNodePower:updateUI(power)
	local width = self._fileNodePower:getWidth()
	local posX = 306 - (width / 2)
	self._fileNodePower:setPositionX(posX)
end

function TeamPetNode:_updateBaseInfo()
	if self._curPetData == nil then --没有神兽的情况
		self._nodeLevel:updateUI(Lang.get("team_detail_des_level"), 0, 0)
		self._nodeLevel:setMaxValue("/0")
		self._nodePetStar:setCount(0)
		self._petDesList:removeAllChildren()
		return
	end

	local level = self._curPetData:getLevel()
	local starLevel = self._curPetData:getStar()
	local maxLevel = G_UserData:getBase():getLevel()

	self._nodeLevel:updateUI(Lang.get("team_detail_des_level"), level, maxLevel)
	self._nodeLevel:setMaxValue("/"..maxLevel)

	self._fileNodePetName:setConvertType(TypeConvertHelper.TYPE_PET)
	self._fileNodePetName:setName(self._curPetData:getBase_id())
	self._nodePetStar:setCount(starLevel)

	self._petDesList:removeAllChildren()
	local starMax = self._curPetData:getStarMax()
	for i = 1, starMax do
		local des = PetDetailViewHelper.createTalentDes(self._curPetData,i, 300, 14)
		self._petDesList:pushBackCustomItem(des)
	end

	self._petDesList:doLayout()

	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_CHANGE, self._curPetData)
	self._imageChangeRP:setVisible(reach)
end


--记录基础属性
function TeamPetNode:_recordBaseAttr()
	if self._curPetData then
		local param = {unitData = self._curPetData}
		local attrInfo = UserDataHelper.getPetTotalAttr(param)
		self._recordAttr:updateData(attrInfo)
	else
		self._recordAttr:updateData({}) --没有神兽，属性清零
	end
end

--基础属性
function TeamPetNode:_updateAttr()
	self._fileNodeAttr1:updateView(AttributeConst.ATK_FINAL, self._recordAttr:getCurValue(AttributeConst.ATK_FINAL))
	self._fileNodeAttr2:updateView(AttributeConst.PD_FINAL, self._recordAttr:getCurValue(AttributeConst.PD_FINAL))
	self._fileNodeAttr3:updateView(AttributeConst.HP_FINAL, self._recordAttr:getCurValue(AttributeConst.HP_FINAL))
	self._fileNodeAttr4:updateView(AttributeConst.MD_FINAL, self._recordAttr:getCurValue(AttributeConst.MD_FINAL))
end

function TeamPetNode:_onButtonUnloadClicked()
	G_UserData:getPet():c2sPetOnTeam(0,1)
end

function TeamPetNode:_onButtonChangeClicked()
	local petId = G_UserData:getBase():getOn_team_pet_id()
	local isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE2, {petId} )
	if isEmpty then
		G_Prompt:showTip(Lang.get("pet_popup_list_empty_tip"..PopupChoosePetHelper.FROM_TYPE2))
	else
		local PopupChoosePet = PopupChoosePet.new()
		local callBack = handler(self, self._changePetCallBack)
		PopupChoosePet:setTitle(Lang.get("pet_replace_title"))
		PopupChoosePet:updateUI(PopupChoosePetHelper.FROM_TYPE2, callBack, petId)
		PopupChoosePet:openWithAction()
	end
end

--选择更换神兽后的回调
function TeamPetNode:_changePetCallBack(petId)
	
	G_UserData:getPet():c2sPetOnTeam(petId,1)
end

--检查神兽升级界面返回时是否要飘字
function TeamPetNode:_checkPetTrainPrompt()
	if self._curPetData == nil then
		return false
	end
	--升级
	local curId = self._curPetData:getId()
	local lastId = self._lastPetLevel[1] or 0
	local lastLevel = self._lastPetLevel[2] or 0
	local nowLevel = self._curPetData:getLevel()
	if lastId == curId and nowLevel > lastLevel and lastLevel > 0 then
		return true
	end
	--突破
	local lastRank = self._lastPetRank[2] or -1
	local nowRank = self._curPetData:getStar()
	if lastId == curId and nowRank > lastRank and lastRank > -1 then
		return true
	end
	
	return false
end

--检查培养的红点
function TeamPetNode:checkPetTrainRP()
	self._parentView:checkPetTrainRP(self._curPetData)
end

--神兽升级、突破都有改变时的飘字
function TeamPetNode:_playPetTrainPrompt()
	self:_updateSkill()
	self:_updatePower()

	local summary = {}
	--可以升级
	do
		local lastLevel = self._lastPetLevel[2]
		local nowLevel = self._curPetData:getLevel()
		local textLevel = self._nodeLevel:getSubNodeByName("TextValue")
		local function finishCallback1()
			if self._nodeLevel and self._curPetData then
				textLevel:updateTxtValue(self._curPetData:getLevel())
				self:_updateBaseInfo()
			end
		end
		local dstPosition = UIHelper.convertSpaceFromNodeToNode(textLevel, self)
		TeamViewHelper.makeLevelDiffData(summary,self._curPetData,lastLevel,dstPosition,finishCallback1)
	end

	--提示可以突破
	do
		local function finishCallback2()
			if self._nodeLevel then
				self:_updateBaseInfo()
			end
		end
		local lastRank = self._lastPetRank[2]
		TeamViewHelper.makeBreakDiffData(summary,self._curPetData, lastRank, finishCallback2)
	end


	self:_addBaseAttrPromptSummary(summary)


	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end


function TeamPetNode:_showPetDetailView()
	local petId = G_UserData:getBase():getOn_team_pet_id()
	G_SceneManager:showScene("petDetail", petId, PetConst.PET_RANGE_TYPE_2)
end

--加入基础属性飘字内容
function TeamPetNode:_addBaseAttrPromptSummary(summary)
	for i, one in ipairs(RECORD_ATTR_LIST) do
		local attrId = one[1]
		local dstNodeName = one[2]
		local diffValue = self._recordAttr:getDiffValue(attrId)
		dump(diffValue)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM+UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = dstNodeName and UIHelper.convertSpaceFromNodeToNode(self[dstNodeName], self) or nil,
				finishCallback = function()
					if attrId and dstNodeName then
						local curValue = self._recordAttr:getCurValue(attrId)
						self[dstNodeName]:getSubNodeByName("TextValue"):updateTxtValue(curValue)
					end
				end,
			}
			table.insert(summary, param)
		end
	end
	return summary
end

--阵容更换成功回调
function TeamPetNode:_changePetFormation(eventName, newPetId)
   	self:_updateData()
   	self:_updateBaseInfo()
	self:_updateSkill()
	self:_updatePower()

	self:_playChangePetSummary(newPetId)
end

--更换神兽飘字结束后的回调
function TeamPetNode:_onChangePetSummaryFinish()
	--更换神兽飘字结束后的回调
	self:runAction(cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(function()
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
			end)
		)
	)
end

--播放更换神兽成功后的飘字
function TeamPetNode:_playChangePetSummary(newPetId)
	local summary = {}

	--神兽上阵\更换成功
	local successStr = ""
	if newPetId > 0 then
		successStr = Lang.get("summary_pet_change")
	else
		successStr = Lang.get("summary_pet_level_team")
	end
	local param2 = {
		content = successStr,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		finishCallback = function()
			if self._onChangePetSummaryFinish then
				self:_onChangePetSummaryFinish()
			end
		end,
	} 
	table.insert(summary, param2)
	
	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end
return TeamPetNode