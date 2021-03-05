--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面
local ViewBase = require("app.ui.ViewBase")
local TacticsView = class("TacticsView", ViewBase)
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local TacticsItemCell = require("app.scene.view.tactics.TacticsItemCell")
local TacticsStudyModule = require("app.scene.view.tactics.TacticsStudyModule")
local TacticsTopItemListModule = require("app.scene.view.tactics.TacticsTopItemListModule")
local TacticsUnlockModule = require("app.scene.view.tactics.TacticsUnlockModule")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIConst = require("app.const.UIConst")
local SilkbagConst = require("app.const.SilkbagConst")
local TabScrollView = require("app.utils.TabScrollView")
local PopupTacticsDes = require("app.ui.PopupTacticsDes")
local PopupCheckHeroTactics = require("app.scene.view.tactics.PopupCheckHeroTactics")
local UIHelper = require("yoka.utils.UIHelper")
local AudioConst = require("app.const.AudioConst")


function TacticsView:ctor()

	self._doingAnim = false 		-- 正在播放动画，不能选中，点击按钮，切换页签
	self._selectItem = nil 	-- 选中的节点

	local resource = {
		file = Path.getCSB("TacticsView", "tactics"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	self:setName("TacticsView")
	TacticsView.super.ctor(self, resource)
end

-- 标题 top数量 tab 列表 详情 解锁和研习
function TacticsView:onCreate()
	self:_initData()
	self:_initView()
end

function TacticsView:_initData()
	self._selectTabIndex = 1 		-- 页签 1橙色 2红色 3金色
	self._curTacticsIndex = 1
	self._tacticsUnitList = {}
end

function TacticsView:_initView()
	self._topbarBase:setImageTitle("txt_sys_zhanfa")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:setItemListVisible(false)
	self._topbarBase:updateHelpUI(FunctionConst.FUNC_TACTICS)

	self:_initTab()
	self:_initListView()
	self:_initDetail()
	self:_initTopNum()
end

function TacticsView:_initTab()
	self._tabList = {self._nodeTab1, self._nodeTab2, self._nodeTab3}
	for i,node in ipairs(self._tabList) do
		local path = TacticsDataHelper.getTacticsTabImgPath(i, false)
		local selPath = TacticsDataHelper.getTacticsTabImgPath(i, true)
		node:updateUI("", false, i, path, selPath)
		node:setClickCallback(handler(self, self._onButtonTabClick))
	end
end

function TacticsView:_initListView()
	local scrollViewParam = {
		template = TacticsItemCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listviewContent, scrollViewParam)
end

function TacticsView:_initDetail()
	self._txtName:setString("")
	self._nodeTitleName:setFontSize(24)
	self._nodeTitleName:setTitle(Lang.get("tactics_title_detail"))
	-- self._scDetail:removeAllChildren()
	self._nodeUnlock = TacticsUnlockModule.new(self, self._nodeUnlock, handler(self, self._onButtonUnlockClick))
	self._nodeUnlock:setVisible(false)
	self._nodeStudy = TacticsStudyModule.new(self, self._nodeStudy, handler(self, self._onButtonStudyClick))
	self._nodeStudy:setVisible(false)
end

function TacticsView:_initTopNum()
	self._topItemList = TacticsTopItemListModule.new(self._nodeTop)
	self._topItemList:updateInfo()
end

function TacticsView:_onButtonTabClick(index)
	if self._doingAnim then return end
	if index == self._selectTabIndex then
		return
	end
	self:switchTab(index)
end

function TacticsView:switchTab(index)
	self._selectTabIndex = index
	self._curTacticsIndex = 1
	self:updateInfo()
end

function TacticsView:updateInfo()
	self:_updateData()
	self:_updateTab()
	self:_updateView()
end

function TacticsView:_updateTab()
	local RedPointHelper = require("app.data.RedPointHelper")
	for i,v in ipairs(self._tabList) do
		v:setSelected(false)
		local color = i+4
		local redPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_TACTICS, color)
		v:showRedPoint(redPoint)
	end
	self._tabList[self._selectTabIndex]:setSelected(true)
	self._tabList[self._selectTabIndex]:showRedPoint(false)
end

function TacticsView:onEnter()
	self._signalTacticsGetList = G_SignalManager:add(SignalConst.EVENT_TACTICS_GETLIST, handler(self, self._tacticsGetList)) 					-- 获取战法列表信息
	self._signalTacticsUnlockPos = G_SignalManager:add(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, handler(self, self._tacticsUnlockPos)) 		-- 武将战法位激活
	self._signalTacticsCreate = G_SignalManager:add(SignalConst.EVENT_TACTICS_CREATE, handler(self, self._tacticsCreate)) 						-- 战法解锁
	self._signalTacticsPutOn = G_SignalManager:add(SignalConst.EVENT_TACTICS_ADD_SUCCESS, handler(self, self._tacticsPutOn)) 					-- 武将装备战法
	self._signalTacticsPutDown = G_SignalManager:add(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, handler(self, self._tacticsPutDown)) 			-- 武将卸载战法
	self._signalTacticsAddPro = G_SignalManager:add(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, handler(self, self._tacticsAddPro)) 				-- 增加战法熟练度
	self._signalTacticsGetFormation = G_SignalManager:add(SignalConst.EVENT_TACTICS_GET_FORMATION, handler(self, self._tacticsGetFormation)) 	-- 增加战法熟练度
	
	G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK) 			-- 战法解锁音效
	G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY) 			-- 战法研习音效

	self:updateInfo()
end

function TacticsView:onExit()
	self._signalTacticsGetList:remove()
	self._signalTacticsGetList = nil
	self._signalTacticsUnlockPos:remove()
	self._signalTacticsUnlockPos = nil
	self._signalTacticsCreate:remove()
	self._signalTacticsCreate = nil
	self._signalTacticsPutOn:remove()
	self._signalTacticsPutOn = nil
	self._signalTacticsPutDown:remove()
	self._signalTacticsPutDown = nil
	self._signalTacticsAddPro:remove()
	self._signalTacticsAddPro = nil
	self._signalTacticsGetFormation:remove()
	self._signalTacticsGetFormation = nil

	self._selectItem = nil 		-- 跳转界面时，清除选择，防止动画报错
	
	G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK)
	G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY)
end

function TacticsView:_updateData()
	local color = self._selectTabIndex + 4
	self._tacticsUnitList =  G_UserData:getTactics():getTacticsList(TacticsConst.GET_LIST_TYPE_ALL, color)
end

function TacticsView:_updateView()
	self:_updateBaseInfo()
	self:_updateList()
end

function TacticsView:_updateDesc(strDesc, suitType, isShowAll)
	self._scDetail:removeAllChildren()

	local size = self._scDetail:getContentSize()
	if isShowAll then
		self._scDetail:setContentSize(cc.size(size.width, 407))
	else
		self._scDetail:setContentSize(cc.size(size.width, 150))
	end
	size = self._scDetail:getContentSize()

	local sizeTemp = cc.size(size.width,0)

	local isSuitAll = suitType == TacticsConst.SUIT_TYPE_ALL

	self._textDesc = ccui.RichText:create()
	local content = ""
	if isSuitAll then
		content = Lang.get("tactics_info_detail2", {content=strDesc})
	else
		content = Lang.get("tactics_info_detail", {content=strDesc})
	end
	self._textDesc:setRichTextWithJson(content)

	self._textDesc:setAnchorPoint(cc.p(0, 1))
	self._textDesc:setVerticalSpace(10)
	self._textDesc:setContentSize(sizeTemp)
	self._textDesc:ignoreContentAdaptWithSize(false)
	self._scDetail:addChild(self._textDesc)
    self._textDesc:formatText()
    local richTextContentSize = self._textDesc:getVirtualRendererSize()

	local height = math.max(size.height, richTextContentSize.height)
	self._scDetail:setInnerContainerSize(cc.size(size.width, height))
	if size.height<richTextContentSize.height then
		self._textDesc:setPositionY(richTextContentSize.height)
		self._scDetail:setTouchEnabled(true)
	else
		self._textDesc:setPositionY(size.height)
		self._scDetail:setTouchEnabled(false)
	end

	if not isSuitAll then
		local node = self._textDesc:getVirtualRenderer()
		node:setSwallowTouches(false)
		node:setTouchEnabled(true)
		node:addClickEventListenerEx(handler(self, self._onDescriptionClick))
	end
end

function TacticsView:_onDescriptionClick(sender, state)
	if self._doingAnim then return end

	local unitData = self._tacticsUnitList[self._curTacticsIndex]
	local baseId = unitData:getBase_id()
	local popup = PopupTacticsDes.new(sender, baseId)
	popup:open()
end

function TacticsView:_updateBaseInfo()
	local unitData = self._tacticsUnitList[self._curTacticsIndex]
	if unitData == nil then
		self._layoutInfo:setVisible(false)
		return
	end
	local baseId = unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TACTICS, baseId)
	self._txtName:setString(param.name)
	self._txtName:setColor(param.icon_color)
	
	if param.icon_color_outline_show then
		self._txtName:enableOutline(param.icon_color_outline, 2)
	else
		self._txtName:disableEffect(cc.LabelEffect.OUTLINE)
	end

	local isShowAll = false

	if unitData:isCanWear() then
		self._nodeUnlock:setVisible(false)
		self._nodeStudy:setVisible(false)
		isShowAll = true
	elseif unitData:isUnlocked() then
		self._nodeUnlock:setVisible(false)
		self._nodeStudy:setVisible(true)
		self._nodeStudy:updateInfo(unitData)
	else
		self._nodeUnlock:setVisible(true)
		self._nodeUnlock:updateInfo(unitData)
		self._nodeStudy:setVisible(false)
	end
	local _,_,suitType = G_UserData:getTactics():getSuitInfoWithTacticsId(baseId)
	self:_updateDesc(param.description, suitType, isShowAll)
	
	self._topItemList:updateInfo()
end

function TacticsView:_updateList()
	local tabIndex = self._selectTabIndex
	local rowNum = math.ceil(#self._tacticsUnitList/TacticsConst.CELLITEM_NUM)
	self._tabListView:updateListView(tabIndex, rowNum)
end

function TacticsView:_onItemUpdate(item, index)
	local rowNum = math.ceil(#self._tacticsUnitList/TacticsConst.CELLITEM_NUM)
	if index<=rowNum then
		item:updateUI(self._tacticsUnitList, index, handler(self, self._tacticsSelectItem))
		local selItem = item:updateSelectState(self._curTacticsIndex)
		if selItem ~= nil then
			self._selectItem = selItem
		end
	end
end

function TacticsView:getSelectItem()
	return self._selectItem
end

function TacticsView:_onItemSelected(item, index)
	-- self._curTacticsIndex = index
	-- self:_updateList()
end

function TacticsView:_tacticsSelectItem(index, subIndex)
	if self._doingAnim then return end
	self._curTacticsIndex = index*TacticsConst.UI_LIST_COL_NUM+subIndex
	self:_updateBaseInfo()
	for i,item in ipairs(self._tabListView:getListView(self._selectTabIndex):getItems()) do
		local selItem = item:updateSelectState(self._curTacticsIndex)
		if selItem ~= nil then
			self._selectItem = selItem
		end
	end
end

function TacticsView:_onItemTouch(index, t)
	
end

function TacticsView:_onButtonUnlockClick()
	if self._doingAnim then return end

	local unitData = self._tacticsUnitList[self._curTacticsIndex]
	if not TacticsDataHelper.isCanUnlocked(unitData) then
		return G_Prompt:showTip(Lang.get("tactics_unlock_materials_lack2"))
	end
	local materials = {}
	local list = TacticsDataHelper.getUnlockedMaterials(unitData)
	for i,v in ipairs(list) do
		local baseId = v.value
		local sameCards = G_UserData:getHero():getSameCardCountWithBaseId(baseId)
		local count = 0
		for k, card in pairs(sameCards) do
			if count >= v.size then
				break
			end
			table.insert(materials, card:getId())
			count = count + 1
		end
	end

	G_UserData:getTactics():c2sCreateTactics(unitData:getBase_id(), materials)
end

function TacticsView:_onUnlockEffectPlayEnd()
	if self._selectItem == nil then
		return
	end
	local selItem = self._selectItem

	-- 播放特效
	local position = UIHelper.convertSpaceFromNodeToNode(selItem:getTarget(), self, cc.p(0, 20))
	local promptPos = cc.p(position.x, position.y-20)
	local function eventFunc(event, frameIndex, node)
		if event == "finish" then
			self._doingAnim = false
			self:updateInfo()
			-- 飘字
			self:_playUnlockPrompt(promptPos)
		end
	end
	local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhanfa_yuankuang", eventFunc, true, position)
	subEffect:setScale(1.2)
end

-- 战法解锁飘字
function TacticsView:_playUnlockPrompt(position)
	local size = G_ResolutionManager:getDesignCCSize()
	position.x = position.x - size.width*0.5
	position.y = position.y - size.height*0.5 + 20
	
	local summary = {}

	local param = {
		content = Lang.get("summary_tactics_unlock_success", {
			color=Colors.colorToNumber(Colors.getColor(2)),
			outlineColor=Colors.colorToNumber(Colors.getColorOutline(2))
		}),
		startPosition = {x = position.x, y = position.y },
	} 

	table.insert(summary, param)
	G_Prompt:showSummary(summary)
end

-- 战法研习飘字
function TacticsView:_playStudyPrompt(position, num)
	local size = G_ResolutionManager:getDesignCCSize()
	position.x = position.x - size.width*0.5
	position.y = position.y - size.height*0.5 + 20

	local summary = {}

	local param = {
		content = Lang.get("summary_tactics_study_success", {
			num=num,
			color=Colors.colorToNumber(Colors.getColor(2)),
			outlineColor=Colors.colorToNumber(Colors.getColorOutline(2))
		}),
		startPosition = {x = position.x, y = position.y },
	} 
	table.insert(summary, param)
    G_Prompt:showSummary(summary)
end

function TacticsView:_onButtonStudyClick()
	if self._doingAnim then return end

	local unitData = self._tacticsUnitList[self._curTacticsIndex]
	self._curPro = unitData:getProficiency()
	local callBack = handler(self, self._onStudyConfirm)
	local popup = PopupCheckHeroTactics.new(self, handler(self, self._onStudyClose))
	popup:updateUI(unitData, callBack)
	popup:openWithAction()
end

function TacticsView:_onStudyClose(message)
	if self._selectItem == nil then
		return
	end
	local selItem = self._selectItem

	self._doingAnim = true

	local pro = 0
	if #message.tacticsInfo>0 then
		pro = message.tacticsInfo[1].proficiency or 0
	end
	local num = math.max(0, pro - self._curPro)/10
	local pos1 = UIHelper.convertSpaceFromNodeToNode(selItem:getTarget(), self, cc.p(0, 30))
	local pos2 = cc.p(pos1.x, pos1.y-10)
	local promptPos = cc.p(pos1.x, pos1.y-30)
	-- 播放研习特效
	local function eventFunc(event, frameIndex, node)
		if event == "finish" then
			-- 播放圆框特效
			local function eventFunc(event, frameIndex, node)
				if event == "finish" then
					self._doingAnim = false
					self:updateInfo()
					-- 飘字
					self:_playStudyPrompt(promptPos, num)
				end
			end
			local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhanfa_yuankuang", eventFunc, true, pos2)
			subEffect:setScale(1.2)
		end
	end
	local subEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhanfa_julong", eventFunc, true, pos1)
	subEffect:setScale(3.2)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_TACTICS_STUDY)
end

function TacticsView:_tacticsGetList()
	self:updateInfo()
end

function TacticsView:_tacticsUnlockPos()
	self:updateInfo()
end

function TacticsView:_tacticsCreate()
	self._doingAnim = true
	self._nodeUnlock:playEffect(handler(self, self._onUnlockEffectPlayEnd))
	G_AudioManager:playSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK)
end

function TacticsView:_tacticsPutOn()
	self:updateInfo()
end

function TacticsView:_tacticsPutDown()
	self:updateInfo()
end

function TacticsView:_tacticsAddPro()

end

function TacticsView:_tacticsGetFormation()
	self:updateInfo()
end

return TacticsView