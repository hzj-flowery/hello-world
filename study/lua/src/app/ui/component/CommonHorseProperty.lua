local CommonHorseProperty = class("CommonHorseProperty")
local HorseDetailAttrNode = require("app.scene.view.horseDetail.HorseDetailAttrNode")
local HorseDetailSkillNode = require("app.scene.view.horseDetail.HorseDetailSkillNode")
local HorseDetailRideNode = require("app.scene.view.horseDetail.HorseDetailRideNode")
local HorseDetailBriefNode = require("app.scene.view.horseDetail.HorseDetailBriefNode")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHorseProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonHorseProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")

    if cc.isRegister("CommonHorseName") then
		cc.bind(self._name2, "CommonHorseName")
	end
end

function CommonHorseProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--属性
function CommonHorseProperty:_buildAttrModule()
	local horseData = self._horseData
	local item = HorseDetailAttrNode.new(horseData)
	self._listView:pushBackCustomItem(item)
end

--技能
function CommonHorseProperty:_buildSkillModule()
	local horseData = self._horseData
	local item = HorseDetailSkillNode.new(horseData)
	self._listView:pushBackCustomItem(item)
end

function CommonHorseProperty:_buildRideModule()
	local horseData = self._horseData
	local item = HorseDetailRideNode.new(horseData)
	self._listView:pushBackCustomItem(item)
end

--描述
function CommonHorseProperty:_buildBriefModule()
	local horseData = self._horseData
	local item = HorseDetailBriefNode.new(horseData)
	self._listView:pushBackCustomItem(item)
end

function CommonHorseProperty:_updateListView()
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

function CommonHorseProperty:updateUI(horseData)
    self._horseData = horseData

    self:_updateListView()

    local horseBaseId = horseData:getBase_id()
    local star = horseData:getStar()
    self._name2:setName(horseBaseId, star)
end

return CommonHorseProperty