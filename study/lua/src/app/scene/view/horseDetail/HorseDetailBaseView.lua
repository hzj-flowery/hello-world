--
-- Author: Liangxu
-- Date: 2018-8-29
--
local ViewBase = require("app.ui.ViewBase")
local HorseDetailBaseView = class("HorseDetailBaseView", ViewBase)
local HorseDetailAttrNode = require("app.scene.view.horseDetail.HorseDetailAttrNode")
local HorseDetailSkillNode = require("app.scene.view.horseDetail.HorseDetailSkillNode")
local HorseDetailRideNode = require("app.scene.view.horseDetail.HorseDetailRideNode")
local HorseDetailBriefNode = require("app.scene.view.horseDetail.HorseDetailBriefNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HorseConst = require("app.const.HorseConst")

function HorseDetailBaseView:ctor(horseData, rangeType, recordAttr, horseEquipItem)
	self._textName 			= nil
	self._textFrom			= nil
	self._textDetailName 	= nil
    self._listView 			= nil 
    self._nodeEquip         = nil
    self._lastAttr          = {}
    self._difAttr           = {}

	self._horseData 		= horseData
    self._rangeType         = rangeType

    -- 记录战马属性
    self._recordAttr        = recordAttr
    self._horseEquipItem 	= horseEquipItem --战马装备

	local resource = {
		file = Path.getCSB("HorseDetailBaseView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		
		}
	}
	HorseDetailBaseView.super.ctor(self, resource)
end

function HorseDetailBaseView:onCreate()
	
end

function HorseDetailBaseView:onEnter()
    self._singleHorseEquipAddSuccess = G_SignalManager:add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS,handler(self,self._horseEquipAddSuccess))

    self:_updateInfo()
end

function HorseDetailBaseView:onExit()
    self._singleHorseEquipAddSuccess:remove()
    self._singleHorseEquipAddSuccess = nil
end

function HorseDetailBaseView:_updateInfo()
	local horseData = self._horseData
	local horseBaseId = horseData:getBase_id()
	local star = horseData:getStar()
	local horseParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseBaseId)

	local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseData:getId())

	if heroUnitData == nil then
		self._textFrom:setVisible(false)
		-- self._imageTalentBg:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		-- self._imageTalentBg:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("horse_detail_from", {name = heroParam.name}))
	end

	--名字
	local horseName = HorseDataHelper.getHorseName(horseBaseId, star)
	self._textName:setString(horseName)
	self._textName:setColor(horseParam.icon_color)
	-- self._textName:enableOutline(horseParam.icon_color_outline, 2)
	self._textDetailName:setString(horseName)
	self._textDetailName:setColor(horseParam.icon_color)
	-- self._textDetailName:enableOutline(horseParam.icon_color_outline, 2)

    self._nodeStar:setCount(horseData:getStar(), HorseConst.HORSE_STAR_MAX)

	--详情列表
    self:_updateListView()
end

function HorseDetailBaseView:_updateListView()
    --详情List开始
    self._listView:removeAllChildren()
    --属性
    self:_buildAttrModule()
    --技能
    self:_buildSkillModule()
    --骑乘
    self:_buildRideModule()
    --简介
    self:_buildBriefModule()
end

function HorseDetailBaseView:_buildAttrModule()
	self._attrItem = HorseDetailAttrNode.new(self._horseData, self._rangeType, self._recordAttr)
	self._listView:pushBackCustomItem(self._attrItem)
end

function HorseDetailBaseView:_buildSkillModule()
	local item = HorseDetailSkillNode.new(self._horseData)
	self._listView:pushBackCustomItem(item)
end

function HorseDetailBaseView:_buildRideModule()
	local item = HorseDetailRideNode.new(self._horseData)
	self._listView:pushBackCustomItem(item)
end

function HorseDetailBaseView:_buildBriefModule()
	local item = HorseDetailBriefNode.new(self._horseData)
	self._listView:pushBackCustomItem(item)
end

-- 新增刷新战马装备的逻辑
function HorseDetailBaseView:_horseEquipAddSuccess(event,equipPos)
    self._horseEquipItem:updateHorseEquip(equipPos)

    local attrInfo = HorseDataHelper.getHorseAttrInfo(self._horseData)    
    self._recordAttr:updateData(attrInfo)

    -- 播放属性变化
    self._attrItem:playBaseAttrPromptSummary(self._recordAttr)
end

function HorseDetailBaseView:updateHorseEquipDifPrompt()
    logWarn("HorseDetailBaseView:updateHorseEquipDifPrompt")

    local refresh = false
    if not self._horseData:isInBattle() then
        refresh = true
    end

    self._attrItem:playBaseAttrPromptSummary(self._recordAttr,refresh)
end

return HorseDetailBaseView