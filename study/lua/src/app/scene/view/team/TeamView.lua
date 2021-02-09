local ViewBase = require("app.ui.ViewBase")
local TeamView = class("TeamView", ViewBase)
local TeamHeroIcon = require("app.scene.view.team.TeamHeroIcon")
local TeamHeroBustIcon = require("app.scene.view.team.TeamHeroBustIcon")
local TeamPartnerButton = require("app.scene.view.team.TeamPartnerButton")
local TeamHeroNode = require("app.scene.view.team.TeamHeroNode")
local TeamPetNode = require("app.scene.view.team.TeamPetNode")
local TeamYokeNode = require("app.scene.view.team.TeamYokeNode")
local HeroConst = require("app.const.HeroConst")
local PetConst = require("app.const.PetConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TeamConst = require("app.const.TeamConst")
local PopupChooseHero = require("app.ui.PopupChooseHero")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local TeamHeroPageItem = require("app.scene.view.team.TeamHeroPageItem")
local PopupChoosePet = require("app.ui.PopupChoosePet")
local PopupChoosePetHelper = require("app.ui.PopupChoosePetHelper")

--判断条件，是否要打开界面
function TeamView:waitEnterMsg(callBack, param)
	local function checkHero(pos)
		if pos and pos ~= TeamConst.PET_POS and G_UserData:getTeam():getStateWithPos(pos) == TeamConst.STATE_OPEN then
			local isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE1)
			if isEmpty then
				G_Prompt:showTip(Lang.get("hero_popup_list_empty_tip" .. PopupChooseHeroHelper.FROM_TYPE1))
				return false
			end
		end
		return true
	end

	local function checkPet(pos)
		if pos and pos == TeamConst.PET_POS and G_UserData:getTeam():getPetState() == TeamConst.STATE_OPEN then
			local isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE1)
			if isEmpty then
				G_Prompt:showTip(Lang.get("pet_popup_list_empty_tip" .. PopupChoosePetHelper.FROM_TYPE1))
				return false
			end
		end
		return true
	end

	local pos = nil
	if param and type(param) == "table" then
		pos = unpack(param)
	end

	if checkHero(pos) == false then
		return
	end
	if checkPet(pos) == false then
		return
	end
	callBack()
end

--
function TeamView:ctor(pos)
	self._pos = pos --当前选中的阵位

	local resource = {
		file = Path.getCSB("TeamView", "team"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnEmbattle = {
				events = {{event = "touch", method = "_onButtonEmbattleClicked"}}
			}
		}
	}
	self:setName("TeamView")
	TeamView.super.ctor(self, resource, 2005)
end

--
function TeamView:onCreate()
	self:_initCurPos()
	self:_initData()
	self:_initView()
end

function TeamView:_initCurPos()
	if
		self._pos and self._pos ~= TeamConst.PET_POS and
			G_UserData:getTeam():getStateWithPos(self._pos) == TeamConst.STATE_HERO
	 then
		G_UserData:getTeam():setCurPos(self._pos)
	elseif self._pos == TeamConst.PET_POS and G_UserData:getTeam():getPetState() == TeamConst.STATE_HERO then
		G_UserData:getTeam():setCurPos(self._pos)
	else
		G_UserData:getTeam():setCurPos(1)
	end
end

function TeamView:_initData()
	self._subLayers = {} --存储子layer
	self._curSelectedPanelIndex = 0 --1武将 2神兽 3羁绊
	self._enterEffects = {} --存储入场动画
	self._isPageViewMoving = false --pageview是否在拖动过程中
end

function TeamView:_initView()
	self._topbarBase:setImageTitle("txt_sys_com_zhenrong")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)
	local topbarConst = isOpen and TopBarStyleConst.STYLE_COMMON2 or TopBarStyleConst.STYLE_COMMON
	self._topbarBase:updateUI(topbarConst)

	self._buttonAwake:setSwallowTouches(false)

	self:_initLeftIcons()
	self:_initPageView()
	self:_initPetNode()
	self._imageTipInitPos = cc.p(self._imageTip:getPositionX(), self._imageTip:getPositionY())
end

function TeamView:_initLeftIcons()
	local function createIcon(icon, isHeroBust)
		local iconBg = ccui.Widget:create()
		local iconBgSize = cc.size(114, 108)
		if isHeroBust then
			iconBgSize = cc.size(100, 127)
		end
		iconBg:setContentSize(iconBgSize)
		icon:setPosition(cc.p(iconBgSize.width / 2, iconBgSize.height / 2))
		iconBg:addChild(icon)
		return iconBg
	end

	--左侧头像滑动条
	self._listViewLineup:setScrollBarEnabled(false)
	self._iconBgs = {}
	self._leftIcons = {}
	self._heroIcons = {}
	self._petIcons = {}
	for i = 1, 6 do
		if i <= 6 then --前6个是武将Icon
			local icon = TeamHeroBustIcon.new(i, handler(self, self._onLeftIconClicked))
			local iconBg = createIcon(icon, true)
			self._listViewLineup:pushBackCustomItem(iconBg)
			table.insert(self._iconBgs, iconBg)
			table.insert(self._leftIcons, icon)
			table.insert(self._heroIcons, icon)
		elseif require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_PET_HOME) then
			local icon = TeamHeroIcon.new(i, handler(self, self._onLeftIconClicked), true)
			local iconBg = createIcon(icon)
			self._listViewLineup:pushBackCustomItem(iconBg)
			table.insert(self._iconBgs, iconBg)
			table.insert(self._leftIcons, icon)
			table.insert(self._petIcons, icon)
		end
	end
	self._partnerButton = TeamPartnerButton.new(handler(self, self._onButtonJiBanClicked))
	local iconBg = createIcon(self._partnerButton)
	self._listViewLineup:pushBackCustomItem(iconBg)
	table.insert(self._iconBgs, iconBg)
end

function TeamView:_initPageView()
	self._pageItems = {}
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))
	self._pageView:addTouchEventListener(handler(self, self._onTouchCallBack))

	local showDatas = TeamViewHelper.getHeroAndPetShowData()
	local viewSize = self._pageView:getContentSize()
	for i, data in ipairs(showDatas) do
		if self._pageItems[i] == nil then
			local item = TeamHeroPageItem.new(viewSize.width, viewSize.height, handler(self, self._showHeroDetailView), i)
			self._pageItems[i] = item
			self._pageView:insertPage(item, i - 1)
		end
	end
end

--需要在初始化时，先把神兽界面创建出来，主要目的是注册事件
--因为神兽有下阵操作，可能会先接到事件才跳转到神兽界面
function TeamView:_initPetNode()
	local layer = TeamPetNode.new(self)
	self._nodeContent:addChild(layer)
	self._subLayers[2] = layer
end

function TeamView:onEnter()
	self._signalChangeHeroFormation =
		G_SignalManager:add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(self, self._changeHeroFormation))
	self._signalPetOnTeam =
		G_SignalManager:add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(self, self._changePetFormation))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalAvatarEquip =
		G_SignalManager:add(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, handler(self, self._avatarEquipSuccess))

	self._funcId2HeroReach = {} --存储武将各个模块的红点值

	self:_updateLeftIcons()
	self:_updateLeftIconsSelectedState()
	self:_updateHeroPageView()

	if G_UserData:getTeam():getCurPos() == -1 then --如果已经在援军面板了
		self:_switchPanelView(3)
		self:_updateView()
	elseif G_UserData:getTeam():getCurPos() == TeamConst.PET_POS then
		self:_switchPanelView(2)
		self:getPetLayer():checkPetTrainRP()
	else
		self:_switchPanelView(1)
		self:_checkPosState()
		self:getHeroLayer():checkHeroTrainRP()
		self:_playEnterEffect()
		self:_updateView()
	end
	self:_checkReinforcementPosRP(FunctionConst.FUNC_TEAM)
end

--
function TeamView:onExit()
	self._signalChangeHeroFormation:remove()
	self._signalChangeHeroFormation = nil
	self._signalPetOnTeam:remove()
	self._signalPetOnTeam = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
	self._signalAvatarEquip:remove()
	self._signalAvatarEquip = nil

	for k, item in pairs(self._pageItems) do
		item:stopScheduler()
	end
end

function TeamView:_avatarEquipSuccess()
	self:_updateView()
end

--检查阵位索引状态
--如果发现阵位索引为“+”号，就直接打开选择武将弹框
function TeamView:_checkPosState()
	if self._pos then
		if self._pos == TeamConst.PET_POS then
			local state = G_UserData:getTeam():getPetState()
			if state == TeamConst.STATE_OPEN then
				local popup = PopupChoosePet.new()
				popup:setTitle(Lang.get("pet_replace_title"))
				popup:updateUI(PopupChoosePetHelper.FROM_TYPE1, handler(self, self._changePetCallBack))
				popup:openWithAction()

				self._pos = nil
			end
		elseif G_UserData:getTeam():getStateWithPos(self._pos) == TeamConst.STATE_OPEN then
			local popupChooseHero = PopupChooseHero.new()
			local callBack = handler(self, self._changeHeroCallBack)
			popupChooseHero:setTitle(Lang.get("hero_replace_title"))
			popupChooseHero:updateUI(PopupChooseHeroHelper.FROM_TYPE1, callBack, self._pos)
			popupChooseHero:openWithAction()

			self._pos = nil
		end
	end
end

--更新左侧Icon列表
function TeamView:_updateLeftIcons()
	local iconData = TeamViewHelper.getHeroAndPetIconData()
	for i, data in ipairs(iconData) do
		local icon = self._leftIcons[i]
		if icon then
			icon:updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel)
		end
	end
	self:_checkHeroIconRP()
	self:_checkPetIconRP()
end

--更新武将Icon列表
function TeamView:_updateHeroIcons()
	local iconData = TeamViewHelper.getHeroIconData()
	for i, data in ipairs(iconData) do
		local icon = self._heroIcons[i]
		icon:updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel)
	end

	self:_checkHeroIconRP()
end

function TeamView:_updatePetIcon()
	local iconData = TeamViewHelper.getPetIconData()
	for i, data in ipairs(iconData) do
		local icon = self._petIcons[i]
		icon:updateIcon(data.type, data.value, data.funcId)
	end
	self:_checkPetIconRP()
end

--更新武将列表中Icon的选中状态
function TeamView:_updateLeftIconsSelectedState()
	local curPos = G_UserData:getTeam():getCurPos()
	for i, icon in ipairs(self._leftIcons) do
		if i == curPos then
			icon:setSelected(true)
		else
			icon:setSelected(false)
		end
	end
	if curPos >= 1 and curPos <= 4 then
		self._listViewLineup:jumpToTop()
	elseif curPos >= 5 and curPos <= 7 then
		self._listViewLineup:jumpToBottom()
	end
end

--刷新PageView武将显示
function TeamView:_gotoHeroPageItem()
	local curPos = G_UserData:getTeam():getCurPos()
	local pageIndex = TeamViewHelper.getPageIndexWithIconPos(curPos)
	self._pageView:setCurrentPageIndex(pageIndex - 1)
	self:_playSkillAnimationOnce()
end

--武将播一遍战斗动作
function TeamView:_playSkillAnimationOnce()
	local curIndex = self._pageView:getCurrentPageIndex()
	local pageItems = self._pageView:getItems()
	for i, item in ipairs(pageItems) do
		if i == curIndex + 1 then
			item:playSkillAnimationOnce()
		else
			item:setIdleAnimation()
		end
	end
end

function TeamView:_updateHeroPageView()
	local showDatas = TeamViewHelper.getHeroAndPetShowData()
	local curPos = G_UserData:getTeam():getCurPos()
	local curIndex = TeamViewHelper.getPageIndexWithIconPos(curPos)
	local minIndex = curIndex - 1
	local maxIndex = curIndex + 1
	if minIndex < 1 then
		minIndex = 1
	end
	if maxIndex > #showDatas then
		maxIndex = #showDatas
	end
	local viewSize = self._pageView:getContentSize()
	for i = minIndex, maxIndex do
		if self._pageItems[i] == nil then
			local item = TeamHeroPageItem.new(viewSize.width, viewSize.height, handler(self, self._showHeroDetailView), i)
			self._pageItems[i] = item
			self._pageView:insertPage(item, i - 1)
		end
		local info = showDatas[i]
		self._pageItems[i]:updateUI(info.type, info.value, info.isEquipAvatar, info.limitLevel, info.limitRedLevel)
	end
	self:_gotoHeroPageItem()
	self:_updatePageItemVisible()
end

function TeamView:getCurHeroSpine()
	local curIndex = self._pageView:getCurrentPageIndex()
	local item = self._pageView:getItem(curIndex)
	local spine = item:getAvatar()
	return spine, item
end

--切换武将.神兽.援军信息
function TeamView:_switchPanelView(index)
	self._curSelectedPanelIndex = index

	local layer = self._subLayers[self._curSelectedPanelIndex]
	if layer == nil then
		if self._curSelectedPanelIndex == 1 then
			layer = TeamHeroNode.new(self)
		elseif self._curSelectedPanelIndex == 2 then
			layer = TeamPetNode.new(self)
		elseif self._curSelectedPanelIndex == 3 then
			layer = TeamYokeNode.new(self)
		end
		if layer then
			self._nodeContent:addChild(layer)
			self._subLayers[self._curSelectedPanelIndex] = layer
		end
	end
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)

	self:_resetSomeWidget()
end

function TeamView:_updateView()
	local layer = self._subLayers[self._curSelectedPanelIndex]
	if layer then
		if self._curSelectedPanelIndex == 1 then
			layer:updateInfo()
		elseif self._curSelectedPanelIndex == 2 then
			layer:updateInfo()
		elseif self._curSelectedPanelIndex == 3 then
			local secondHeroDatas = G_UserData:getTeam():getHeroDataInReinforcements()
			local heroDatas = G_UserData:getTeam():getHeroDataInBattle()
			layer:updatePartnerIcon(secondHeroDatas)
			layer:updatePanel(heroDatas)
			layer:checkReinforcementPosRP(FunctionConst.FUNC_TEAM)
		end
	end
end

function TeamView:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetIndex = self._pageView:getCurrentPageIndex() + 1
		local targetPos = TeamViewHelper.getIconPosWithPageIndex(targetIndex)
		local curPos = G_UserData:getTeam():getCurPos()
		if targetPos ~= curPos then
			G_UserData:getTeam():setCurPos(targetPos)
			self:_updateLeftIconsSelectedState()
			self:_updateHeroPageView()
			if targetPos == TeamConst.PET_POS then
				self:_switchPanelView(2)
			else
				self:_switchPanelView(1)
			end
			self:_updateView()
		end
	end
end

function TeamView:_onTouchCallBack(sender, state)
	if state == ccui.TouchEventType.began then
		self._isPageViewMoving = true
		self:_updatePageItemVisible()
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self._isPageViewMoving = false
	end
end

function TeamView:_updatePageItemVisible()
	local curPos = G_UserData:getTeam():getCurPos()
	local curIndex = TeamViewHelper.getPageIndexWithIconPos(curPos)
	for i, item in ipairs(self._pageItems) do
		if i == curIndex then
			item:setVisible(true)
		else
			item:setVisible(self._isPageViewMoving)
		end
	end
end

--点击左侧Icon
function TeamView:_onLeftIconClicked(pos)
	local iconData = TeamViewHelper.getHeroAndPetIconData()
	local info = iconData[pos]
	if info.type == TypeConvertHelper.TYPE_HERO then
		local state = G_UserData:getTeam():getStateWithPos(pos)
		if state == TeamConst.STATE_HERO then
			local curPos = G_UserData:getTeam():getCurPos()
			if pos == curPos then
				return
			end

			G_UserData:getTeam():setCurPos(pos)
			self:_updateLeftIconsSelectedState()
			self:_updateHeroPageView()
			self:_switchPanelView(1)
			self:_updateView()
		elseif state == TeamConst.STATE_OPEN then
			local isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE1)
			if isEmpty then
				G_Prompt:showTip(Lang.get("hero_popup_list_empty_tip" .. PopupChooseHeroHelper.FROM_TYPE1))
			else
				local popupChooseHero = PopupChooseHero.new()
				local callBack = handler(self, self._changeHeroCallBack)
				popupChooseHero:setTitle(Lang.get("hero_replace_title"))
				popupChooseHero:updateUI(PopupChooseHeroHelper.FROM_TYPE1, callBack, pos)
				popupChooseHero:openWithAction()
			end
		elseif state == TeamConst.STATE_LOCK then
			G_Prompt:showTip(Lang.get("team_not_unlock_tip"))
		end
	elseif info.type == TypeConvertHelper.TYPE_PET then
		local state, funcLevelInfo = G_UserData:getTeam():getPetState()
		if state == TeamConst.STATE_HERO then
			G_UserData:getTeam():setCurPos(pos)
			self:_updateLeftIconsSelectedState()
			self:_updateHeroPageView()
			self:_switchPanelView(2)
			self:_updateView()
		elseif state == TeamConst.STATE_OPEN then
			local isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE1)
			if isEmpty then
				G_Prompt:showTip(Lang.get("pet_popup_list_empty_tip" .. PopupChoosePetHelper.FROM_TYPE1))
			else
				local popup = PopupChoosePet.new()
				popup:setTitle(Lang.get("pet_replace_title"))
				popup:updateUI(PopupChoosePetHelper.FROM_TYPE1, handler(self, self._changePetCallBack))
				popup:openWithAction()
			end
		elseif state == TeamConst.STATE_LOCK then
			local level = funcLevelInfo.level
			G_Prompt:showTip(Lang.get("team_pet_unlock_level", {level = level}))
		end
	end
end

--点击羁绊
function TeamView:_onButtonJiBanClicked()
	local funcId = FunctionConst["FUNC_REINFORCEMENTS"]
	if not LogicCheckHelper.funcIsOpened(funcId, callback) then
		local comment = require("app.config.function_level").get(funcId).comment
		G_Prompt:showTip(comment)
		return
	end

	G_UserData:getTeam():setCurPos(-1) -- 表示援军
	self:_updateLeftIconsSelectedState()
	self:_switchPanelView(3)
	self:_updateView()
end

--点击布阵
function TeamView:_onButtonEmbattleClicked()
	local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction()
end

function TeamView:_showHeroDetailView(index)
	local showDatas = TeamViewHelper.getHeroAndPetShowData()
	local info = showDatas[index]
	if info.type == TypeConvertHelper.TYPE_HERO then
		local curPos = G_UserData:getTeam():getCurPos()
		local heroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
		G_SceneManager:showScene("heroDetail", heroId, HeroConst.HERO_RANGE_TYPE_2)
	elseif info.type == TypeConvertHelper.TYPE_PET then
		G_SceneManager:showScene("petDetail", info.id, PetConst.PET_RANGE_TYPE_2)
	end
end

--神兽更换成功回调
function TeamView:_changePetFormation(eventName, petId)
	local petId = G_UserData:getBase():getOn_team_pet_id()
	local curPos = petId == 0 and 1 or TeamConst.PET_POS
	local panelIndex = petId == 0 and 1 or 2

	G_UserData:getTeam():setCurPos(curPos)
	self:_updatePetIcon()
	self:_updateLeftIconsSelectedState()
	self:_updateHeroPageView()
	self:_switchPanelView(panelIndex)
	self:_updateView()
end

--阵容更换成功回调
function TeamView:_changeHeroFormation(eventName, pos, oldHeroId)
	G_UserData:getTeam():setCurPos(pos)
	self:_updateHeroIcons()
	self:_updateLeftIconsSelectedState()
	self:_updateHeroPageView()
	self:_switchPanelView(1)
end

--设置此界面onEnter时要显示更换装备弹框
function TeamView:setNeedPopupEquipReplace(showRP)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedPopupEquipReplace(showRP)
	end
end

function TeamView:setNeedEquipClearPrompt(need)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedEquipClearPrompt(need)
	end
end

--设置此界面onEnter时要处理的宝物相关事件
function TeamView:setNeedPopupTreasureReplace(showRP)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedPopupTreasureReplace(showRP)
	end
end

function TeamView:setNeedTreasureRemovePrompt(need)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedTreasureRemovePrompt(need)
	end
end

--设置此界面onEnter时要处理的神兵相关事件
function TeamView:setNeedPopupInstrumentReplace(showRP)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedPopupInstrumentReplace(showRP)
	end
end

function TeamView:setNeedInstrumentRemovePrompt(need)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedInstrumentRemovePrompt(need)
	end
end

--设置此界面onEnter时要处理的战马相关事件
function TeamView:setNeedPopupHorseReplace(showRP)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedPopupHorseReplace(showRP)
	end
end

function TeamView:setNeedHorseRemovePrompt(need)
	local layer = self:getHeroLayer()
	if layer then
		layer:setNeedHorseRemovePrompt(need)
	end
end

--选择更换武将后的回调
function TeamView:_changeHeroCallBack(heroId, param)
	local pos = unpack(param)
	G_UserData:getTeam():c2sChangeHeroFormation(pos, heroId)
end

function TeamView:_changePetCallBack(petId, param, petData)
	G_UserData:getPet():c2sPetOnTeam(petId, 1)
end

--=======================红点部分=======================================
function TeamView:_onEventRedPointUpdate(eventName, funcId)
	self:_checkHeroIconRP(funcId)
	self:_checkReinforcementPosRP(funcId)
	self:_checkPetIconRP(funcId)
end

function TeamView:_checkHeroIconRP(funcId)
	local function checkTeam(pos)
		local state = G_UserData:getTeam():getStateWithPos(pos)
		if state == TeamConst.STATE_OPEN then
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, "posRP")
			if reach then
				return true
			end
		end
		return false
	end

	local function checkAvatar(pos)
		if pos ~= 1 then
			return false
		end
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR)
		return reach
	end

	local function checkHeroLevelUp(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData)
			return reach
		end
		return false
	end

	local function checkHeroBreak(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData)
			return reach
		end
		return false
	end

	local function checkHeroAwake(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData)
			return reach
		end
		return false
	end

	local function checkHeroLimit(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData)
			return reach
		end
		return false
	end

	local function checkEquip(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "posRP", pos)
			return reach
		end
		return false
	end

	local function checkTreasure(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "posRP", pos)
			return reach
		end
		return false
	end

	local function checkInstrument(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId = unitData:getBase_id()
			local param = {pos = pos, heroBaseId = heroBaseId}
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "posRP", param)
			return reach
		end
		return false
	end

	local function checkHorse(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId = unitData:getBase_id()
			local param = {pos = pos, heroBaseId = heroBaseId}
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "posRP", param)
			return reach
		end
		return false
	end

	local function checkEquipStrengthen(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, pos)
			return reach
		end
		return false
	end

	local function checkEquipRefine(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, pos)
			return reach
		end
		return false
	end

	local function checkTreasureUpgrade(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, pos)
			return reach
		end
		return false
	end

	local function checkTreasureRefine(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, pos)
			return reach
		end
		return false
	end

	local function checkTreasureLimit(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, pos)
			return reach
		end
		return false
	end

	local function checkInstrumentAdvance(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, pos)
			return reach
		end
		return false
	end

	local function checkHorseUpStar(pos)
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_TRAIN, pos)
		return reach
	end

	local function checkKarma(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, heroUnitData)
			return reach
		end
		return false
	end

	local function checkTactics(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "posRP", pos)
			return reach
		end
		return false
	end

	local function checkHeroChange(pos)
		local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, heroUnitData)
			return reach
		end
		return false
	end

	local checkFuncs = {
		[FunctionConst.FUNC_TEAM] = checkTeam,
		[FunctionConst.FUNC_EQUIP] = checkEquip,
		[FunctionConst.FUNC_TREASURE] = checkTreasure,
		[FunctionConst.FUNC_INSTRUMENT] = checkInstrument,
		[FunctionConst.FUNC_HORSE] = checkHorse,
		[FunctionConst.FUNC_AVATAR] = checkAvatar,
		[FunctionConst.FUNC_HERO_TRAIN_TYPE1] = checkHeroLevelUp,
		[FunctionConst.FUNC_HERO_TRAIN_TYPE2] = checkHeroBreak,
		[FunctionConst.FUNC_HERO_TRAIN_TYPE3] = checkHeroAwake,
		[FunctionConst.FUNC_HERO_TRAIN_TYPE4] = checkHeroLimit,
		[FunctionConst.FUNC_EQUIP_TRAIN_TYPE1] = checkEquipStrengthen,
		[FunctionConst.FUNC_EQUIP_TRAIN_TYPE2] = checkEquipRefine,
		[FunctionConst.FUNC_TREASURE_TRAIN_TYPE1] = checkTreasureUpgrade,
		[FunctionConst.FUNC_TREASURE_TRAIN_TYPE2] = checkTreasureRefine,
		[FunctionConst.FUNC_TREASURE_TRAIN_TYPE4] = checkTreasureLimit,
		[FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1] = checkInstrumentAdvance,
		[FunctionConst.FUNC_HORSE_TRAIN] = checkHorseUpStar,
		[FunctionConst.FUNC_HERO_KARMA] = checkKarma,
		[FunctionConst.FUNC_TACTICS] = checkTactics,
		[FunctionConst.FUNC_HERO_CHANGE] = checkHeroChange
	}

	--红点相关的
	local redPointFuncId = {
		FunctionConst.FUNC_TEAM,
		FunctionConst.FUNC_EQUIP,
		FunctionConst.FUNC_TREASURE,
		FunctionConst.FUNC_INSTRUMENT,
		FunctionConst.FUNC_HORSE,
		FunctionConst.FUNC_AVATAR,
		FunctionConst.FUNC_HERO_TRAIN_TYPE1,
		FunctionConst.FUNC_HERO_TRAIN_TYPE2,
		FunctionConst.FUNC_HERO_TRAIN_TYPE3,
		FunctionConst.FUNC_HERO_TRAIN_TYPE4,
		FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
		FunctionConst.FUNC_HORSE_TRAIN,
		FunctionConst.FUNC_HERO_KARMA,
		FunctionConst.FUNC_TACTICS,
		FunctionConst.FUNC_HERO_CHANGE
	}
	--箭头相关的
	local arrowFuncId = {
		FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
		FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
		FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
		FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
		FunctionConst.FUNC_TREASURE_TRAIN_TYPE4
	}

	for i, heroIcon in ipairs(self._heroIcons) do
		local reachArrow = false
		local reachRedPoint = false
		for j, funcId in ipairs(arrowFuncId) do
			local func = checkFuncs[funcId]
			if func then
				local reach = func(i)
				self._funcId2HeroReach[funcId] = reach
				if reach then
					reachArrow = true
					break
				end
			end
		end
		for j, funcId in ipairs(redPointFuncId) do
			local func = checkFuncs[funcId]
			if func then
				local reach = func(i)
				self._funcId2HeroReach[funcId] = reach
				if reach then
					reachRedPoint = true
					break
				end
			end
		end

		if reachArrow then
			heroIcon:showRedPoint(reachRedPoint)
			heroIcon:showImageArrow(not reachRedPoint)
		else
			heroIcon:showRedPoint(reachRedPoint)
			heroIcon:showImageArrow(false)
		end
	end
end

function TeamView:_checkPetIconRP(funcId)
	for i, petIcon in ipairs(self._petIcons) do
		local reach = false
		local petId = G_UserData:getBase():getOn_team_pet_id()
		if petId and petId > 0 then
			local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
			local reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData)
			local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData)
			local reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData)
			reach = reach1 or reach2 or reach3
		end
		petIcon:showRedPoint(reach)
	end
end

function TeamView:_checkReinforcementPosRP(funcId)
	if funcId and funcId == FunctionConst.FUNC_TEAM then
		local reach = RedPointHelper.isModuleSubReach(funcId, "reinforcementEmptyRP")
		self._partnerButton:showRedPoint(reach)
	end
end

--入场动画------------------------------------------------------------------
function TeamView:_playEnterEffect()
	local function effectFunction(effect)
		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "top_down" then
			self:_playTopAndDownEnter()
		elseif event == "ren" then
			self:_playHeroEnter()
		elseif event == "left_right" then
			self:_playLeftHeroIconEnter()
			self:_playRightPanelEnter()
		elseif event == "zhanli" then
			self:_playPowerEnter()
		elseif event == "left_right_icon" then
			self:_playEquipAndTreasureIconEnter()
		elseif event == "mingcheng" then
			self:_playBasicInfoEnter()
			self:_playAwakeStarEnter()
		elseif event == "shenbing" then
			self:_playInstrumentIconEnter()
			self:_playHorseIconEnter()
			self:_playHistoryHeroIconEnter()
		elseif event == "finish" then
			self:_onEnterEffectFinish()
		end
	end

	self:_resetEffectNode()
	self:_hideAllEffectNode()
	if self._enterMoving then
		self._enterMoving:runAction(cc.RemoveSelf:create())
		self._enterMoving = nil
	end
	self._enterMoving =
		G_EffectGfxMgr:createPlayMovingGfx(self._nodeTotalEffect, "moving_zhenrong_ui", effectFunction, eventFunction, false)
end

function TeamView:_resetEffectNode()
	for i, effect in ipairs(self._enterEffects) do
		effect:reset()
	end
	self._enterEffects = {}
end

--隐藏所有入场相关控件
function TeamView:_hideAllEffectNode()
	self._topbarBase:setVisible(false)
	self._nodeInDown:setVisible(false)
	self._pageView:setVisible(false)
	self._nodeAwake:setVisible(false)
	self:_hideLeftHeroIcon()
	self:_hideRightPanel()
	self:_hidePowerPanel()
	self:_hideEquipAndTreasureIcon()
	self:_hideTopPanel()
	self:_hideInstrumentPanel()
	self:_hideHorsePanel()
	self:_hideHistoryHeroPanel()
end

function TeamView:_hideLeftHeroIcon()
	for i, iconBg in ipairs(self._iconBgs) do
		iconBg:setVisible(false)
	end
end

function TeamView:_hideRightPanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._panelAttr:setVisible(false)
		heroLayer._panelBasic:setVisible(false)
		heroLayer._panelTactics:setVisible(false)
		heroLayer._panelKarma:setVisible(false)
		heroLayer._nodePanelYoke:setVisible(false)
	end
end

function TeamView:_hidePowerPanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._nodeInPower:setVisible(false)
	end
end

function TeamView:_hideEquipAndTreasureIcon()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		for i = 1, 4 do
			heroLayer["_fileNodeEquip" .. i]:setVisible(false)
		end
		for i = 1, 2 do
			heroLayer["_fileNodeTreasure" .. i]:setVisible(false)
		end
	end
end

function TeamView:_hideTopPanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._nodeInTop:setVisible(false)
	end
end

function TeamView:_hideInstrumentPanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._nodeInInstrument:setVisible(false)
	end
end

function TeamView:_hideHorsePanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._nodeInHorse:setVisible(false)
	end
end

function TeamView:_hideHistoryHeroPanel()
	local heroLayer = self:getHeroLayer()
	if heroLayer then
		heroLayer._nodeInHistoryHero:setVisible(false)
	end
end

function TeamView:_playTopAndDownEnter()
	self._topbarBase:setVisible(true)
	self._nodeInDown:setVisible(true)
	self._enterEffectTop = G_EffectGfxMgr:applySingleGfx(self._topbarBase, "smoving_shangdian_top", nil, nil, nil)
	self._enterEffectDown = G_EffectGfxMgr:applySingleGfx(self._nodeInDown, "smoving_zhenrong_down", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectTop)
	table.insert(self._enterEffects, self._enterEffectDown)
end

function TeamView:_playHeroEnter()
	self._pageView:setVisible(true)
	self._enterEffectHero = G_EffectGfxMgr:applySingleGfx(self._pageView, "smoving_shangdian_alpha", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectHero)
end

--左侧武将Icon依次入场
function TeamView:_playLeftHeroIconEnter()
	local nodes = {}
	for i, iconBg in ipairs(self._iconBgs) do
		table.insert(nodes, iconBg)
	end

	local actions = {}
	for i, node in ipairs(nodes) do
		local action1 =
			cc.CallFunc:create(
			function()
				node:setVisible(true)
				self["_enterEffectHeroIcon" .. i] = G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenrong_left", nil, nil, nil)
				table.insert(self._enterEffects, self["_enterEffectHeroIcon" .. i])
			end
		)
		local action2 = cc.DelayTime:create(0.06)
		table.insert(actions, action1)
		if i ~= #nodes then --不是最后一个
			table.insert(actions, action2)
		end
	end

	local action = cc.Sequence:create(unpack(actions))
	self._nodeTotalEffect:runAction(action)
end

--右侧详情面板依次入场
function TeamView:_playRightPanelEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	local nodes = {
		heroLayer._panelBasic,
		heroLayer._panelKarma,
		heroLayer._nodePanelYoke
	}
	local isTacticsOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TACTICS)
	if isTacticsOpen then
		table.insert( nodes, 2, heroLayer._panelTactics )
	end

	local actions = {}
	local action0 =
		cc.CallFunc:create(
		function()
			heroLayer._panelAttr:setVisible(true)
			self._enterEffectPanelAttr =
				G_EffectGfxMgr:applySingleGfx(heroLayer._panelAttr, "smoving_shangdian_alpha", nil, nil, nil)
			table.insert(self._enterEffects, self._enterEffectPanelAttr)
		end
	)
	local action2 = cc.DelayTime:create(0.06)
	table.insert(actions, action0)
	table.insert(actions, action2)

	for i, node in ipairs(nodes) do
		local action1 =
			cc.CallFunc:create(
			function()
				node:setVisible(true)
				self["_enterEffectRight" .. i] = G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenrong_right", nil, nil, nil)
				table.insert(self._enterEffects, self["_enterEffectRight" .. i])
			end
		)
		table.insert(actions, action1)
		if i ~= #nodes then --不是最后一个
			table.insert(actions, action2)
		end
	end
	-- 告诉界面动画结束，用于解决战法位显示穿帮的问题
	local action3 = cc.CallFunc:create(
		function()
			heroLayer:setAnimationEnd()
		end
	)

	local action = cc.Sequence:create(unpack(actions))
	self._nodeTotalEffect:runAction(action)
end

function TeamView:_playPowerEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	heroLayer._nodeInPower:setVisible(true)
	self._enterEffectPower =
		G_EffectGfxMgr:applySingleGfx(heroLayer._nodeInPower, "smoving_zhenrong_zhanli", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectPower)
end

function TeamView:_playEquipAndTreasureIconEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end

	local leftNodes = {
		heroLayer._fileNodeEquip1,
		heroLayer._fileNodeEquip3,
		heroLayer._fileNodeTreasure1
	}
	local rightNodes = {
		heroLayer._fileNodeEquip2,
		heroLayer._fileNodeEquip4,
		heroLayer._fileNodeTreasure2
	}

	local leftActions = {}
	local actionDelay = cc.DelayTime:create(0.06)
	for i, node in ipairs(leftNodes) do
		local action =
			cc.CallFunc:create(
			function()
				node:setVisible(true)
				self["_enterEffectLeftIcon" .. i] = G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenrong_left_icon", nil, nil, nil)
				table.insert(self._enterEffects, self["_enterEffectLeftIcon" .. i])
			end
		)
		table.insert(leftActions, action)
		if i ~= #leftNodes then --不是最后一个
			table.insert(leftActions, actionDelay)
		end
	end
	local rightActions = {}
	local actionDelay = cc.DelayTime:create(0.06)
	for i, node in ipairs(rightNodes) do
		local action =
			cc.CallFunc:create(
			function()
				node:setVisible(true)
				self["_enterEffectRightIcon" .. i] =
					G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenrong_right_icon", nil, nil, nil)
				table.insert(self._enterEffects, self["_enterEffectRightIcon" .. i])
			end
		)
		table.insert(rightActions, action)
		if i ~= #rightNodes then --不是最后一个
			table.insert(rightActions, actionDelay)
		end
	end

	local leftAction = cc.Sequence:create(unpack(leftActions))
	local rightAction = cc.Sequence:create(unpack(rightActions))
	self._nodeTotalEffect:runAction(leftAction)
	self._nodeTotalEffect:runAction(rightAction)
end

function TeamView:_playBasicInfoEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	heroLayer._nodeInTop:setVisible(true)
	self._enterEffectBasicInfo =
		G_EffectGfxMgr:applySingleGfx(heroLayer._nodeInTop, "smoving_zhenrong_mingcheng", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectBasicInfo)
end

function TeamView:_playAwakeStarEnter()
	self._nodeAwake:setVisible(true)
	self._enterEffectAwakeStar =
		G_EffectGfxMgr:applySingleGfx(self._nodeAwake, "smoving_zhenrong_mingcheng", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectAwakeStar)
end

function TeamView:_playInstrumentIconEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	heroLayer._nodeInInstrument:setVisible(true)
	self._enterEffectInstrument =
		G_EffectGfxMgr:applySingleGfx(heroLayer._nodeInInstrument, "smoving_zhenrong_shenbing", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectInstrument)
end

function TeamView:_playHorseIconEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	heroLayer._nodeInHorse:setVisible(true)
	self._enterEffectHorse =
		G_EffectGfxMgr:applySingleGfx(heroLayer._nodeInHorse, "smoving_zhenrong_shenbing", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectHorse)
end

function TeamView:_playHistoryHeroIconEnter()
	local heroLayer = self:getHeroLayer()
	if heroLayer == nil then
		return
	end
	heroLayer._nodeInHistoryHero:setVisible(true)
	self._enterEffectHistoryHero =
		G_EffectGfxMgr:applySingleGfx(heroLayer._nodeInHistoryHero, "smoving_zhenrong_shenbing", nil, nil, nil)
	table.insert(self._enterEffects, self._enterEffectHistoryHero)
end

function TeamView:_onEnterEffectFinish()
	--抛出新手事件出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function TeamView:getHeroLayer()
	local layer = self._subLayers[1]
	return layer
end

function TeamView:getPetLayer()
	local layer = self._subLayers[2]
	return layer
end

function TeamView:getYokeLayer()
	local layer = self._subLayers[3]
	return layer
end

--检查培养的红点
function TeamView:checkHeroTrainRP(curHeroData)
	if self._curSelectedPanelIndex ~= 1 then
		self._imageTip:setVisible(false)
		return
	end
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, curHeroData) --可升级
	local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, curHeroData) --可突破
	local resLevelUp = "img_hint02b"
	local resRankUp = "img_hint01b"
	if HeroGoldHelper.isPureHeroGold(curHeroData) then
		resRankUp = "img_hint06b"
		local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
		local none = nil
		none, reach2 = HeroGoldHelper.heroGoldNeedRedPoint(curHeroData)
	end
	self._imageTip:setPosition(self._imageTipInitPos) --恢复初始位置
	if reach1 == true and reach2 == true then
		self._imageTip:setVisible(true)
		local res1 = Path.getTextSignet(resLevelUp)
		local res2 = Path.getTextSignet(resRankUp)
		TeamViewHelper.playSkewFloatSwitchEffect(self._imageTip, res1, res2)
	elseif reach1 == true then
		self._imageTip:setVisible(true)
		local res = Path.getTextSignet(resLevelUp)
		self._imageTip:loadTexture(res)
		TeamViewHelper.playSkewFloatEffect(self._imageTip)
	elseif reach2 == true then
		self._imageTip:setVisible(true)
		local res = Path.getTextSignet(resRankUp)
		self._imageTip:loadTexture(res)
		TeamViewHelper.playSkewFloatEffect(self._imageTip)
	else
		self._imageTip:setVisible(false)
	end
end

--检查培养的红点
function TeamView:checkPetTrainRP(curPetData)
	if curPetData == nil then
		self._imageTip:setVisible(false)
		return
	end
	if self._curSelectedPanelIndex ~= 2 then
		self._imageTip:setVisible(false)
		return
	end

	local reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, curPetData) --可升级
	local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, curPetData) --可突破
	local reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, curPetData) --可界限突破
	self._imageTip:setPosition(self._imageTipInitPos) --恢复初始位置
	if reach1 == true and reach2 == true then
		self._imageTip:setVisible(true)
		local res1 = Path.getTextSignet("img_hint02b")
		local res2 = Path.getTextSignet("img_hint05b")
		TeamViewHelper.playSkewFloatSwitchEffect(self._imageTip, res1, res2)
	elseif reach1 == true then
		self._imageTip:setVisible(true)
		local res = Path.getTextSignet("img_hint02b")
		self._imageTip:loadTexture(res)
		TeamViewHelper.playSkewFloatEffect(self._imageTip)
	elseif reach2 == true then
		self._imageTip:setVisible(true)
		local res = Path.getTextSignet("img_hint05b")
		self._imageTip:loadTexture(res)
		TeamViewHelper.playSkewFloatEffect(self._imageTip)
	else
		self._imageTip:setVisible(false)
	end
end

function TeamView:_resetSomeWidget()
	local isShow = self._curSelectedPanelIndex == 1 or self._curSelectedPanelIndex == 2
	self._panelMid:setVisible(isShow)
	if self._curSelectedPanelIndex == 3 then --只有援军界面把tip隐藏，武将、神兽界面交给checkXXXTrainRP处理
		self._imageTip:setVisible(false)
	end
end

--刷新镜像觉醒星星
--为了防止高个武将把觉醒星星挡掉，在上层加入一个同样的觉醒控件
function TeamView:updateAwake(visible, star, showRP)
	self._imageAwakeBg:setVisible(visible)
	self._nodeHeroStar:setStarOrMoon(star)
	self._imageAwakeRedPoint:setVisible(showRP)
end

return TeamView
