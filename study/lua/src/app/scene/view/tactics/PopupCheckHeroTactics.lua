--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法研习列表界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckHeroTactics = class("PopupCheckHeroTactics", PopupBase)
local PopupCheckHeroTacticsCell = require("app.scene.view.tactics.PopupCheckHeroTacticsCell")
local PopupCheckHeroHelper = require("app.ui.PopupCheckHeroHelper")
local TacticsConst = require("app.const.TacticsConst")
local UIHelper = require("yoka.utils.UIHelper")
local AudioConst = require("app.const.AudioConst")


function PopupCheckHeroTactics:ctor(parentView, successCallback)
	self._doingAnim = false
	self._parentView = parentView
	self._successCallback = successCallback
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckHeroTactics", "common"),
		binding = {
			_btnStudy = {
				events = {{event = "touch", method = "_onButtonStudy"}}
			},
		}
	}
	self:setName("PopupCheckHeroTactics")
	PopupCheckHeroTactics.super.ctor(self, resource)
end

function PopupCheckHeroTactics:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))

	local size = G_ResolutionManager:getDesignCCSize()
	self._emptyNode = cc.Node:create()
	self._emptyNode:setPosition(0, size.height*0.5)
	self:addChild(self._emptyNode)

	self._selectList = {} 	-- 选中的数据
	self._maxNum = 10 		-- 选中最大数量
end

function PopupCheckHeroTactics:onEnter()
	self._fileDes1:setDesColor(Colors.TacticsCommonColor)
	self._fileDes1:setValueColor(Colors.TacticsBlueColor)
	self._fileDes1:setMaxColor(Colors.TacticsCommonColor2)
	self._fileDes1:setFontSize(20)
	self._fileDes2:setDesColor(Colors.TacticsCommonColor)
	self._fileDes2:setValueColor1(Colors.TacticsCommonColor2)
	self._fileDes2:setValueColor2(Colors.TacticsBlueColor)
	self._fileDes2:setSpace1(0)
	self._fileDes2:setSpace2(35)

	self._signalTacticsAddPro = G_SignalManager:add(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, handler(self, self._tacticsAddPro)) -- 增加战法熟练度

	
	G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT) 			-- 战法研习音效

	self:_updateInfo()
end

function PopupCheckHeroTactics:onExit()
	self._signalTacticsAddPro:remove()
	self._signalTacticsAddPro = nil
	
	G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT)
end

function PopupCheckHeroTactics:updateUI(tacticsUnitData)
	self._tacticsUnitData = tacticsUnitData

	self._commonNodeBk:setTitle(Lang.get("tactics_study_title"))

	self._herosData = G_UserData:getHero():getStudyHeroList(self._tacticsUnitData:getId())

	self._count = math.ceil(#self._herosData / 3)
	
	if self._count==0 then
		self._listView:setVisible(false)
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local emptyType = TypeConvertHelper.TYPE_HERO
		self._fileNodeEmpty:updateView(emptyType)
		-- self._fileNodeEmpty:setButtonString(Lang.get("tactics_choose_empty_button"))
		self._fileNodeEmpty:setVisible(true)
		self._fileNodeEmpty:setButtonGetVisible(false)
		self._fileNodeEmpty:setTipsString(Lang.get("tactics_study_hero_empty"))
	else
		self._listView:setVisible(true)
		self._listView:setTemplate(PopupCheckHeroTacticsCell)
		self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self._listView:setCustomCallback(handler(self, self._onItemTouch))
		self._listView:resize(self._count)
		self._fileNodeEmpty:setVisible(false)
	end

	self:_updateInfo()
end

function PopupCheckHeroTactics:_onItemUpdate(item, index)
	local index = index * 3
	local dataList = {}
	local isAddedList = {}

	for i=1,3 do
		if self._herosData[index + i] then
			local heroData = self._herosData[index + i]

			dataList[i] = heroData

			isAddedList[i] = self._selectList[index+i] and true or false
		end
	end

	item:update(self._tacticsUnitData, dataList, isAddedList)
end

function PopupCheckHeroTactics:_onItemSelected(item, index)

end

function PopupCheckHeroTactics:getSelectedHeroStudyNum()
	local num = 0
	for k,v in pairs(self._selectList) do
		num = num + self._tacticsUnitData:getStudyNumByHero(v:getBase_id())
	end
	return num
end

function PopupCheckHeroTactics:getSelectedHeroNum()
	local num = 0
	for k,v in pairs(self._selectList) do
		num = num + 1
	end
	return num
end

function PopupCheckHeroTactics:checkIsMaxCount()
	local num1 = self._tacticsUnitData:getProficiency()
	local num2 = self:getSelectedHeroStudyNum()
	if num1+num2>=TacticsConst.MAX_PROFICIENCY then
		return true
	else
		return false
	end
end

function PopupCheckHeroTactics:_onItemTouch(index, t, selected, item)
	if self._doingAnim then return end

	if selected and self:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("tactics_study_select_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	elseif selected and self:getSelectedHeroNum()>=self._maxNum then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end

	local trueIndex = index*3 + t
	local heroData = self._herosData[trueIndex]
	if selected then
		self._selectList[trueIndex] = heroData
	else
		self._selectList[trueIndex] = nil
	end

	self:_updateInfo()
end

function PopupCheckHeroTactics:_onButtonClose()
	if self._doingAnim then return end

	self:close()
end

-- 增加熟练度返回
function PopupCheckHeroTactics:_tacticsAddPro(event, message)
	
	self._doingAnim = true

	local cells = self._listView:getItems()
	local selectItemList = {}
	for i,cell in ipairs(cells) do
		local list = cell:getSelectedState()
		for index,selected in ipairs(list) do
			if selected then
				local item = cell:getItem(index)
				table.insert(selectItemList, item)
			end
		end
	end

	if #selectItemList==0 then
		table.insert( selectItemList, self._emptyNode )
	end

	-- 播放研习特效
	local itemAnimFinishCount = 0
	local size = self._btnStudy:getContentSize()
	local btnPosition = UIHelper.convertSpaceFromNodeToNode(self._btnStudy, self, cc.p(size.width*0.5, size.height*0.5))
	for k, item in pairs(selectItemList) do
		local itemPosition = UIHelper.convertSpaceFromNodeToNode(item, self, cc.p(0, 0))
		if itemPosition.y>=btnPosition.y then 	-- 下面的不播放特效
			local function eventFunc(event, frameIndex, node)
				if event == "forever" then
					node:setVisible(false)
				end
			end
			local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_yanxi_quan", eventFunc, true, itemPosition)
			subEffect:setDouble(0.5)

			
			local scale, angle = self:_calcFlashParam(itemPosition, btnPosition)
			local function eventFunc(event, frameIndex, node)
				if event == "forever" then
					node:setVisible(false)
				end
			end
			local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_yanxi_xiantiao", eventFunc, true, btnPosition)
			subEffect:setScale(scale)
			subEffect:setRotation(angle)
		end
	end

	local position = cc.p(btnPosition.x, btnPosition.y+5)
	local function eventFunc(event, frameIndex, node)
		if event == "finish" then
		end
	end
	local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhanfa_yuankuang", eventFunc, true, position)
	subEffect:setScale(1.5)

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	SchedulerHelper.newScheduleOnce(
		function()
			if self._successCallback then
				self._successCallback(message)
			end
			self:close()
		end,
		1.2
	)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT)
end

function PopupCheckHeroTactics:_calcFlashParam(pos1, pos2)
	local a = 15
	local b = 450
	local c = math.sqrt( a*a + b*b )
	local r = math.atan( a/b )

	local a2 = pos1.x-pos2.x
	local b2 = pos1.y-pos2.y
	local c2 = math.sqrt( a2*a2 + b2*b2 )
	local r2 = math.atan( a2/b2 )

	local scale = c2/c
	local angle = (r2-r)*180/math.pi
	return scale, angle
end

function PopupCheckHeroTactics:_onButtonStudy()
	if self._doingAnim then return end
	
	local materials = {}
	for k,v in pairs(self._selectList) do
		table.insert(materials, v:getId())
	end
	if #materials<1 then
		return G_Prompt:showTip(Lang.get("tactics_study_hero_select_tip"))
	end
	local tacticsUId = self._tacticsUnitData:getId()
	G_UserData:getTactics():c2sAddTacticsPro(tacticsUId, materials)
end

function PopupCheckHeroTactics:_updateInfo()
	local selNum = self:getSelectedHeroNum()
	self._fileDes1:updateUI(Lang.get("tactics_popup_check_hero"), selNum, self._maxNum)
	if selNum>0 then
		self._fileDes1:setValueColor(Colors.TacticsBlueColor)
	else
		self._fileDes1:setValueColor(Colors.TacticsCommonColor2)
	end
	
	local addNum = self:getSelectedHeroStudyNum()/10
	if addNum>0 then
		self._fileDes2:updateUI(Lang.get("tactics_popup_check_proficiency"),
			Lang.get("hero_detail_common_percent", {value=self._tacticsUnitData:getProficiency()/10}),
			Lang.get("tactics_title_study_add_desc", {num=addNum})
		)
	else
		self._fileDes2:updateUI(Lang.get("tactics_popup_check_proficiency"),
			Lang.get("hero_detail_common_percent", {value=self._tacticsUnitData:getProficiency()/10}),
			""
		)
	end
end


return PopupCheckHeroTactics
