-- Author: Liangxu
-- Date: 2017-03-30 11:14:10
-- 阵容武将模块
local ViewBase = require("app.ui.ViewBase")
local TeamHeroNode = class("TeamHeroNode", ViewBase)
local TeamEquipIcon = require("app.scene.view.team.TeamEquipIcon")
local TeamTreasureIcon = require("app.scene.view.team.TeamTreasureIcon")
local HeroConst = require("app.const.HeroConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TeamConst = require("app.const.TeamConst")
local EquipConst = require("app.const.EquipConst")
local TreasureConst = require("app.const.TreasureConst")
local PopupChooseHero = require("app.ui.PopupChooseHero")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
local AttributeConst = require("app.const.AttributeConst")
local RedPointHelper = require("app.data.RedPointHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local EquipMasterHelper = require("app.scene.view.equipTrain.EquipMasterHelper")
local MasterConst = require("app.const.MasterConst")
local UIActionHelper = require("app.utils.UIActionHelper")
local TeamInstrumentIcon = require("app.scene.view.team.TeamInstrumentIcon")
local TeamHorseIcon = require("app.scene.view.team.TeamHorseIcon")
local TeamHistoryHeroIcon = require("app.scene.view.team.TeamHistoryHeroIcon")
local TeamTacticsPositionIcon = require("app.scene.view.team.TeamTacticsPositionIcon")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AudioConst = require("app.const.AudioConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HorseConst = require("app.const.HorseConst")

--需要记录的属性列表
--{属性Id， 对应控件名}
local RECORD_ATTR_LIST = {
	{AttributeConst.ATK, "_fileNodeAttr1"},
	{AttributeConst.HP, "_fileNodeAttr3"},
	{AttributeConst.PD, "_fileNodeAttr2"},
	{AttributeConst.MD, "_fileNodeAttr4"},
	{AttributeConst.CRIT, nil},
	{AttributeConst.NO_CRIT, nil},
	{AttributeConst.HIT, nil},
	{AttributeConst.NO_HIT, nil},
	{AttributeConst.HURT, nil},
	{AttributeConst.HURT_RED, nil}
}

function TeamHeroNode:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("TeamHeroNode", "team"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonPet = {
				events = {{event = "touch", method = "_onButtonPetClicked"}}
			},
			_buttonMaster = {
				events = {{event = "touch", method = "_onButtonMasterClicked"}}
			},
			_buttonChange = {
				events = {{event = "touch", method = "_onButtonChangeClicked"}}
			},
			_buttonOneKey = {
				events = {{event = "touch", method = "_onButtonOneKeyClicked"}}
			},
			_panelKarma = {
				events = {{event = "touch", method = "_onKarmaClicked"}}
			},
			_panelYoke = {
				events = {{event = "touch", method = "_onYokeClicked"}}
			},
			_panelAttrTouch = {
				events = {{event = "touch", method = "_onAttrClicked"}}
			},
			_buttonAwake = {
				events = {{event = "touch", method = "_onButtonAwakeClicked"}}
			},
			_buttonAvatar = {
				events = {{event = "touch", method = "_onButtonAvatarClicked"}}
			},
			_buttonSilkbag = {
				events = {{event = "touch", method = "_onButtonSilkbagClicked"}}
			},
			_buttonHistoryHero = {
				events = {{event = "touch", method = "_onButtonHistoryHeroClicked"}}
			}
		}
	}
	self:setName("TeamHeroNode")
	TeamHeroNode.super.ctor(self, resource)
end

function TeamHeroNode:onCreate()
	self:_initData()
	self:_initView()
end

function TeamHeroNode:_initData()
	self._isInstrumentShow = false --记录是否显示神兵
	self._allYokeData = {} --羁绊信息
	self._needPopupEquipReplace = false --是否需要弹出更换装备弹框
	self._needEquipClearPrompt = false --是否要装备卸掉后飘字
	self._needPopupTreasureReplace = false --是否需要弹出更换宝物弹框
	self._needPopupInstrumentReplace = false --是否需要弹出更换神兵弹框
	self._needPopupHorseReplace = false --是否需要弹出更换战马弹框
	self._needTreasureRemovePrompt = false -- 是否要宝物卸掉后飘字
	self._needInstrumentRemovePrompt = false -- 是否要神兵卸掉后飘字
	self._needHorseRemovePrompt = false -- 是否要战马卸掉后飘字
	self._changeOldHeroId = 0 --记录更换武将，原来武将的id, 0表示原来没武将

	local curPos = G_UserData:getTeam():getCurPos()
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_TEAM_SLOT" .. curPos])

	self._lastHeroLevel = {} --记录武将等级:{id, level}
	self._lastHeroRank = {} --记录武将突破等级:{id, level}
	self._lastHeroAwake = {} --记录武将觉醒等级:{id, level}
	self._lastHeroLimit = {} --记录武将界限等级:{id, level}
	self._lastEquipLevel = {} --记录装备等级,{[1] = {id, level}, [2] = {id, level}, [3] = {id, level}, [4] = {id, level}}
	self._lastEquipRLevel = {} --记录装备精炼等级,{[1] = {id, rLevel}, ...}
	self._lastTreasureLevel = {} --记录宝物升级等级,{[1] = {id, rLevel}, ...}
	self._lastTreasureRLevel = {} --记录宝物精炼等级,{[1] = {id, rLevel}, ...}
	self._lastInstrumentLevel = {} --记录神兵升级等级,{[1] = {id, rLevel}, ...}
	self._lastHorseLevel = {} --记录战马升星等级,{[1] = {id, rLevel}, ...}
	self._lastHistoryHeroLevel = {} --记录历代名将升星等级,{[1] = {id, rLevel}, ...}
	self._lastEquipStrMasterLevel = {} --记录装备强化大师等级:{pos, level}
	self._diffEquipStrMasterLevel = 0 --记录装备强化大师等级差
	self._lastEquipStrMasterInfo = nil --记录装备强化大师信息
	self._lastEquipRefineMasterLevel = {} --记录装备精炼大师等级,{pos, level}
	self._diffEquipRefineMasterLevel = 0 --记录装备精炼大师等级差
	self._lastTreasureStrMasterLevel = {} --记录宝物强化大师等级,{pos, level}
	self._diffTreasureStrMasterLevel = 0 --记录宝物强化大师等级差
	self._lastTreasureRefineMasterLevel = {} --记录宝物精炼大师等级,{pos, level}
	self._diffTreasureRefineMasterLevel = 0 --记录宝物精炼大师等级差
	self._oneKeyEquipIndexs = {} --记录一键强化装备的索引
	self._enterEffects = {} --存储入场动画
end

function TeamHeroNode:_initView()
	self._popupKarma = nil --武将名将册弹框
	self._nodeDetailTitleBasic:setTitle(Lang.get("team_detail_title_basic"))
	self._nodeDetailTitleTactics:setTitle(Lang.get("team_detail_title_tactics"))
	self._nodeDetailTitleKarma:setTitle(Lang.get("team_detail_title_karma"))
	self._nodeDetailTitleYoke:setTitle(Lang.get("team_detail_title_yoke"))
	self._nodeLevel:setFontSize(20)
	self._nodePotential:setFontSize(20)

	self._panelAttrTouch:setSwallowTouches(false)

	-- 战法
	self:_initTacticsNode()

	--装备
	self._equipments = {}
	for i = 1, 4 do --4个装备
		local equip = TeamEquipIcon.new(self["_fileNodeEquip" .. i])
		table.insert(self._equipments, equip)
	end

	--宝物
	self._treasures = {}
	for i = 1, 2 do --2个宝物
		local treasure = TeamTreasureIcon.new(self["_fileNodeTreasure" .. i])
		table.insert(self._treasures, treasure)
	end

	--神兵
	self._instrument = TeamInstrumentIcon.new(self._fileNodeInstrument)

	--战马
	self._horse = TeamHorseIcon.new(self._fileNodeHorse)

	--历代名将
	self._historyHero = TeamHistoryHeroIcon.new(self._fileNodeHistoryHero)
end

function TeamHeroNode:_initTacticsNode()
	for i=1,3 do
		-- self["_nodeTactics"..i]:setVisible(false)
		local node = CSHelper.loadResourceNode(Path.getCSB("TeamTacticsPositionIcon", "team"))
		self["_nodeTactics"..i]:addChild(node)
		local item = TeamTacticsPositionIcon.new(node)
		self["_fileNodeTactics"..i] = item
	end
end

function TeamHeroNode:onEnter()
	self._signalChangeHeroFormation =
		G_SignalManager:add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(self, self._changeHeroFormation))
	self._signalHeroKarmaActive =
		G_SignalManager:add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(self, self._heroKarmaActiveSuccess))
	self._signalEquipAddSuccess =
		G_SignalManager:add(SignalConst.EVENT_EQUIP_ADD_SUCCESS, handler(self, self._equipAddSuccess))
	self._signalTreasureAddSuccess =
		G_SignalManager:add(SignalConst.EVENT_TREASURE_ADD_SUCCESS, handler(self, self._treasureAddSuccess))
	self._signalInstrumentAddSuccess =
		G_SignalManager:add(SignalConst.EVENT_INSTRUMENT_ADD_SUCCESS, handler(self, self._instrumentAddSuccess))
	self._signalHorseAddSuccess =
		G_SignalManager:add(SignalConst.EVENT_HORSE_ADD_SUCCESS, handler(self, self._horseAddSuccess))
	self._signalHorseRemoveSuccess =
		G_SignalManager:add(SignalConst.EVENT_HORSE_CLEAR_SUCCESS, handler(self, self._horseRemoveSuccess))
	self._signalEquipSuperUpgrade =
		G_SignalManager:add(SignalConst.EVENT_EQUIP_SUPER_UPGRADE_SUCCESS, handler(self, self._onEventEquipSuperUpgrade))
	self._signalHistoryHeroFormationUpdate = 
		G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(self, self._onHistoryHeroFormationUpdate)) -- 名将阵容变化

	self._signalUserLevelup = 
		G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onUserLevelup)) -- 玩家等级提升
	self._signalTacticsPosUnlock = 
		G_SignalManager:add(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, handler(self, self._onTacticsPosUnlock)) -- 战法位解锁成功
	self._signalTacticsAddSuccess = 
		G_SignalManager:add(SignalConst.EVENT_TACTICS_ADD_SUCCESS, handler(self, self._onTacticsAddSuccess)) -- 战法装备成功
	self._signalTacticsRemoveSuccess = 
		G_SignalManager:add(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, handler(self, self._onTacticsRemoveSuccess)) -- 战法卸载成功

	if G_UserData:getTeam():getCurPos() < 1 or G_UserData:getTeam():getCurPos() > 6 then
		return
	end
	
	G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK) 		-- 战法位解锁音效

	self:_onEquipEvent()
	self:_onTreasureEvent()
	self:_onInstrumentEvent()
	self:_onHorseEvent()

	self:_updateData()
	if self._needTreasureRemovePrompt then
		self:_playRemoveTreasureSummary()
		self._needTreasureRemovePrompt = false
	elseif self._needEquipClearPrompt then
		self:_playRemoveEquipSummary()
		self._needEquipClearPrompt = false
	elseif self._needInstrumentRemovePrompt then
		self:_playRemoveInstrumentSummary()
		self._needInstrumentRemovePrompt = false
	elseif self._needHorseRemovePrompt then
		self:_playRemoveHorseSummary()
		self._needHorseRemovePrompt = false
	elseif self:_checkHeroTrainPrompt() then
		self:_playHeroTrainPrompt()
	elseif self:_checkEquipTrainPrompt() then
		self:_playEquipTrainPrompt()
	elseif self:_checkTreasureTrainPrompt() then
		self:_playTreasureTrainPrompt()
	elseif self:_checkInstrumentTrainPrompt() then
		self:_playInstrumentTrainPrompt()
	elseif self:_checkHorseTrainPrompt() then
		self:_playHorseTrainPrompt()
	elseif self:_checkAvatarEquipPrompt() then
		self:_playAvatarEquipPrompt()
	elseif self:_checkHistoryHeroPrompt() then
		self:_playHistoryHeroTrainPrompt()
	else
		self:_updateView()
	end
end

function TeamHeroNode:onExit()
	self._signalChangeHeroFormation:remove()
	self._signalChangeHeroFormation = nil
	self._signalHeroKarmaActive:remove()
	self._signalHeroKarmaActive = nil
	self._signalEquipAddSuccess:remove()
	self._signalEquipAddSuccess = nil
	self._signalTreasureAddSuccess:remove()
	self._signalTreasureAddSuccess = nil
	self._signalInstrumentAddSuccess:remove()
	self._signalInstrumentAddSuccess = nil
	self._signalHorseAddSuccess:remove()
	self._signalHorseAddSuccess = nil
	self._signalHorseRemoveSuccess:remove()
	self._signalHorseRemoveSuccess = nil
	self._signalEquipSuperUpgrade:remove()
	self._signalEquipSuperUpgrade = nil
	self._signalHistoryHeroFormationUpdate:remove()
	self._signalHistoryHeroFormationUpdate = nil
	self._signalUserLevelup:remove()
	self._signalUserLevelup = nil
	self._signalTacticsPosUnlock:remove()
	self._signalTacticsPosUnlock = nil
	self._signalTacticsAddSuccess:remove()
	self._signalTacticsAddSuccess = nil
	self._signalTacticsRemoveSuccess:remove()
	self._signalTacticsRemoveSuccess = nil

	if self._curHeroData then
		self._lastHeroLevel = {self._curHeroData:getId(), self._curHeroData:getLevel()}
		--记录等级
		self._lastHeroRank = {self._curHeroData:getId(), self._curHeroData:getRank_lv()}
		--记录突破等级
		self._lastHeroAwake = {self._curHeroData:getId(), self._curHeroData:getAwaken_level()}
		--记录觉醒等级
		self._lastHeroLimit = {self._curHeroData:getId(), self._curHeroData:getLimit_level(), self._curHeroData:getLimit_rtg()}
		--记录界限等级
		self:_recordEquipLevel()
		--记录装备等级
		self:_recordTreasureLevel()
		--记录宝物等级
		self:_recordInstrumentLevel()
		--记录神兵等级
		self:_recordHorseStar() --记录战马星级
		--记录历代名将
		self:_recordHistoryHeroStep()
	end

	G_UserData:getTeamCache():setShowHeroTrainFlag(false)
	G_UserData:getTeamCache():setShowEquipTrainFlag(false)
	G_UserData:getTeamCache():setShowTreasureTrainFlag(false)
	G_UserData:getTeamCache():setShowInstrumentTrainFlag(false)
	G_UserData:getTeamCache():setShowHorseTrainFlag(false)
	G_UserData:getTeamCache():setShowAvatarEquipFlag(false)
	G_UserData:getTeamCache():setShowHistoryHeroFlag(false)
	
	G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK)
end

function TeamHeroNode:updateInfo()
	self:_updateData()
	self:_updateView()
end

function TeamHeroNode:_updateData()
	local curPos = G_UserData:getTeam():getCurPos()
	local curHeroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
	G_UserData:getHero():setCurHeroId(curHeroId)
	self._curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
	self:_checkInstrumentIsShow()
	self._allYokeData = UserDataHelper.getHeroYokeInfo(self._curHeroData)
	self:_recordBaseAttr()
	G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
	self:_recordMasterLevel()
end

--检查神兵是否显示
function TeamHeroNode:_checkInstrumentIsShow()
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT)
	local configInfo = self._curHeroData:getConfig()
	local instrumentId = configInfo.instrument_id
	self._isInstrumentShow = isOpen and (instrumentId > 0) --开启并且配置了对应神兵
end

function TeamHeroNode:_updateView()
	self:_updateBaseInfo()
	self:_updateAttr()
	self:_updateSkill()
	self:_updateTacticsPos()
	self:_updateKarma()
	self:_updateYoke()
	self:_updateAttrScrollView()
	self:_updateEquipment()
	self:_updateTreasure()
	self:_updateInstrument()
	self:_updateHorse()
	self:_updateHistoryHero()
	self:checkHeroTrainRP()
	self:_updatePower()
	self:_formatButtons()
end

function TeamHeroNode:_updateBaseInfo()
	local level = self._curHeroData:getLevel()
	local heroConfig = self._curHeroData:getConfig()
	local rank = self._curHeroData:getRank_lv()
	local maxLevel = G_UserData:getBase():getLevel()
	if self._curHeroData:isPureGoldHero() then
		self._nodeLevel:updateUI(Lang.get("goldenhero_train_des"), rank, rank)
		self._nodeLevel:setMaxValue("")
	else
		self._nodeLevel:updateUI(Lang.get("team_detail_des_level"), level, maxLevel)
		self._nodeLevel:setMaxValue("/" .. maxLevel)
	end
	self._nodePotential:updateUI(Lang.get("team_detail_des_potential"), heroConfig.potential)
	self._fileNodeCountry:updateUI(self._curHeroData:getBase_id())
	local limitLevel = self._curHeroData:getLimit_level()
	local limitRedLevel = self._curHeroData:getLimit_rtg()
	self._fileNodeHeroName:setName(self._curHeroData:getBase_id(), rank, limitLevel, nil, limitRedLevel)
	self._fileNodeFeature:setString(heroConfig.feature) --武将定位
	self:_updateAwake()
	self:_playCurHeroVoice()

	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, self._curHeroData)
	self._imageChangeRP:setVisible(reach)
	if self._curHeroData:isLeader() then
		self._imageAvatarRP:setVisible(RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR))
	end
	local curPos = G_UserData:getTeam():getCurPos()
	if curPos > 0 and curPos < 7 then --武将才检查
		self._imageSilkbagRP:setVisible(RedPointHelper.isModuleReach(FunctionConst.FUNC_SILKBAG, curPos))

		local historyHeroData = G_UserData:getHistoryHero():getHeroDataWithPos(curPos)
		if historyHeroData then
			local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "strongerThanMe", historyHeroData)
			local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, historyHeroData)
			self._imageHistoryHeroRP:setVisible(reach1 or reach2)
		else
			self._imageHistoryHeroRP:setVisible(false)
		end
	end	
end

function TeamHeroNode:_playCurHeroVoice()
	local baseId = self._curHeroData:getBase_id()
	G_HeroVoiceManager:playVoiceWithHeroId(baseId)
end

--处理按钮位置
function TeamHeroNode:_formatButtons()
	local buttons = {self._buttonPet, self._buttonMaster, self._buttonOneKey, self._buttonChange, self._buttonAvatar,
		self._buttonSilkbag, self._buttonHistoryHero}
	local btnCount2Pos = {
		[1] = {cc.p(305, 67)},
		[2] = {cc.p(248, 67), cc.p(362, 67)},
		[3] = {cc.p(190, 67), cc.p(305, 67), cc.p(420, 67)},
		[4] = {cc.p(134, 67), cc.p(248, 67), cc.p(362, 67), cc.p(476, 67)},
		[5] = {cc.p(105, 67), cc.p(205, 67), cc.p(305, 67), cc.p(405, 67), cc.p(505, 67)},
		[6] = {cc.p(55, 67), cc.p(155, 67), cc.p(255, 67), cc.p(355, 67), cc.p(455, 67), cc.p(555, 67)}
	}

	local isRole = self._curHeroData:isLeader() --是否主角
	local oneKeyOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_STRENG_ONEKEY)
	local avatarOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_AVATAR)
	local silkbagOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SILKBAG)
	local historyHeroOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	local showButtons = {true, true, oneKeyOpen, not isRole, isRole and avatarOpen, silkbagOpen, false} --各个按钮是否显示

	local btnCount = 0 --要显示的按钮数量
	for i, v in ipairs(showButtons) do
		if v == true then
			btnCount = btnCount + 1
		end
	end
	--处理背景的长度
	local bgWidth = {
		[1] = 300,
		[2] = 400,
		[3] = 500,
		[4] = 600,
		[5] = 700,
		[6] = 700
	}
	local bgHeight = self._imageBtnBg:getContentSize().height
	self._imageBtnBg:setContentSize(cc.size(bgWidth[btnCount], bgHeight))

	local index = 0
	for i, btn in ipairs(buttons) do
		if showButtons[i] == true then
			index = index + 1
			btn:setVisible(true)
			btn:setPosition(btnCount2Pos[btnCount][index])
		else
			btn:setVisible(false)
		end
	end
end

--基础属性
function TeamHeroNode:_updateAttr()
	self._fileNodeAttr1:updateView(AttributeConst.ATK, self._recordAttr:getCurValue(AttributeConst.ATK))
	self._fileNodeAttr2:updateView(AttributeConst.PD, self._recordAttr:getCurValue(AttributeConst.PD))
	self._fileNodeAttr3:updateView(AttributeConst.HP, self._recordAttr:getCurValue(AttributeConst.HP))
	self._fileNodeAttr4:updateView(AttributeConst.MD, self._recordAttr:getCurValue(AttributeConst.MD))
end

--更新技能描述
function TeamHeroNode:_updateSkill()
	local skillIds = AvatarDataHelper.getShowSkillIdsByCheck(self._curHeroData)
	for i = 1, 3 do
		local skillId = skillIds[i]
		self["_fileNodeSkill" .. i]:updateUI(skillId, true)
	end
end

-- 战法位信息
function TeamHeroNode:_updateTacticsPos()
	local isTacticsShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TACTICS)
	if not isTacticsShow then
		return
	end
	local isTacticsPos3Show = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TACTICS_POS3)
	local pos = G_UserData:getTeam():getCurPos()
	if not isTacticsPos3Show then
		local posX = {100, 246}
		for i=1,2 do
			self["_nodeTactics"..i]:setPositionX(posX[i])
			self["_fileNodeTactics"..i]:updateUI(pos,i)
		end
		self["_nodeTactics"..3]:setVisible(false)
	else
		local posX = {67, 173, 279}
		for i=1,3 do
			self["_nodeTactics"..i]:setPositionX(posX[i])
			self["_fileNodeTactics"..i]:updateUI(pos,i)
		end
		self["_nodeTactics"..3]:setVisible(true)
	end

	local curPos = G_UserData:getTeam():getCurPos()
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "posRP", curPos)
	self._imageTacticsRedPoint:setVisible(reach)
end

function TeamHeroNode:_playTacticsPrompt(tacticsId)
	local summary = {}
	local param = {
		content = tacticsId == 0 and Lang.get("summary_tactics_unload_success") or Lang.get("summary_tactics_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TACTICS},
	} 
	table.insert(summary, param)

	G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
	G_Prompt:showSummary(summary)

	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

function TeamHeroNode:_playTacticsPosPrompt()
	local summary = {}
	local param = {
		content = Lang.get("summary_tactics_pos_unlock_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TACTICS},
	} 
	table.insert(summary, param)

	G_Prompt:showSummary(summary)
end

function TeamHeroNode:_addBaseAttrPromptSummary(summary)
	local attrIds = self._recordAttr:getAllAttrIdsBySort()
	for i, attrId in ipairs(attrIds) do
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TACTICS+UIConst.SUMMARY_OFFSET_X_ATTR},
			}
			table.insert(summary, param)
		end
	end
	return summary
end

-- 设置动画结束状态，强制刷新界面更新战法位节点的展示和隐藏
function TeamHeroNode:setAnimationEnd()
	self._animationEnd = true
	self:_updateAttrScrollView()
end

-- 更新属性滚动列表
function TeamHeroNode:_updateAttrScrollView()
	local isTacticsOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TACTICS)
	if self._animationEnd then
		self._panelTactics:setVisible(isTacticsOpen)
	end
	if not isTacticsOpen then
		local offset = 158
		local height = 566
		local contentSize = self._scAttr:getInnerContainerSize()
		local size = cc.size(contentSize.width, height)
		self._scAttr:setInnerContainerSize(size)
		self._scAttr:setTouchEnabled(false)

		self._panelBasic:setPositionY(452-offset)
		self._panelKarma:setPositionY(295-offset)
		self._nodePanelYoke:setPositionY(self._karamOffset-30)
	else
		local offset = self._karamOffset
		local height = 158+566-offset
		local contentSize = self._scAttr:getInnerContainerSize()
		local size = cc.size(contentSize.width, height)
		self._scAttr:setInnerContainerSize(size)
		self._scAttr:setTouchEnabled(true)

		self._panelBasic:setPositionY(452-offset)
		self._panelTactics:setPositionY(323-offset)
		self._panelKarma:setPositionY(145-offset)
		self._nodePanelYoke:setPositionY(-25)
	end
end

--缘分信息
function TeamHeroNode:_updateKarma()
	local imageMark = {
		[AttributeConst.ATK_PER] = {"img_com_team_sign02", "img_com_team_sign02b"}, --攻击加成
		[AttributeConst.DEF_PER] = {"img_com_team_sign04", "img_com_team_sign04b"}, --防御加成
		[AttributeConst.HP_PER] = {"img_com_team_sign03", "img_com_team_sign03b"} --生命加成
	}

	local count = 0
	local allKaramData = UserDataHelper.getHeroKarmaData(self._curHeroData:getConfig())
	for i = 1, HeroConst.HERO_KARMA_MAX do --7条缘分
		local data = allKaramData[i]
		if data then
			local isReach = UserDataHelper.getReachCond(self._curHeroData, data["cond1"], data["cond2"]) --是否达成显示条件
			local isActivated = G_UserData:getKarma():isActivated(data.id)
			if isActivated or isReach then
				count = count + 1
				local text = self["_textYuanFenDes" .. count]
				local mark = self["_imageYuanFenMark" .. count]
				local bg = self["_imageYuanFenBg" .. count]
				text:setVisible(true)
				local markInfo = imageMark[data.attrId]
				assert(markInfo, string.format("hero_friend config talent_attr is wrong = %d", data.attrId))
				local markRes = isActivated and markInfo[1] or markInfo[2]
				local color = isActivated and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
				text:setString(data.karmaName)
				text:setColor(color)
				mark:setVisible(true)
				mark:loadTexture(Path.getTeamUI(markRes))
				-- bg:setVisible(isActivated)
				bg:setVisible(false)
			end
		end
	end

	if count < 5 then
		self._imgLine1:setContentSize(cc.size(54, 5))
	elseif count < 7 then
		self._imgLine1:setContentSize(cc.size(82, 5))
    elseif count < 9 then
        self._imgLine1:setContentSize(cc.size(110, 5))
	else
		self._imgLine1:setContentSize(cc.size(128, 5))
	end

	for i = count + 1, HeroConst.HERO_KARMA_MAX do
		self["_textYuanFenDes" .. i]:setVisible(false)
		self["_imageYuanFenMark" .. i]:setVisible(false)
		self["_imageYuanFenBg" .. i]:setVisible(false)
	end
	
	local LINE_HEIGHT = 30
	local line = math.ceil(count / 2)

	self._karamOffset = (5 - line) * LINE_HEIGHT
    
	self._nodePanelYoke:setPositionY((4 - line) * LINE_HEIGHT + 15) 	-- 会在更新scrollview过程中更新位置

	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, self._curHeroData)
	self._imageKarmaRedPoint:setVisible(reach)
	self._imageKarmaTip:setPosition(cc.p(255, 170)) --恢复初始位置
	self._imageKarmaTip:setVisible(reach)
	if reach then
		UIActionHelper.playSkewFloatEffect(self._imageKarmaTip)
	end
end

--羁绊信息
function TeamHeroNode:_updateYoke()
	local allYokeData = self._allYokeData
	if allYokeData and #allYokeData.yokeInfo > 0 then
		self._panelYoke:setVisible(true)
		self._panelNoYoke:setVisible(false)
		for i = 1, 6 do --6条羁绊
			self:_updateOneYoke(i)
		end
	else
		self._panelYoke:setVisible(false)
		self._panelNoYoke:setVisible(true)
	end
end

--更新一条羁绊
function TeamHeroNode:_updateOneYoke(index)
	local allYokeData = self._allYokeData
	local text = self["_textJiBanDes" .. index]
	local mark = self["_imageJiBanMark" .. index]
	if allYokeData and allYokeData.yokeInfo and allYokeData.yokeInfo[index] then
		local info = allYokeData.yokeInfo[index]
		text:setVisible(true)
		local color = info.isActivated and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
		text:setString(info.name)
		text:setColor(color)
		mark:setVisible(info.isActivated)
	else
		text:setVisible(false)
		mark:setVisible(false)
	end
end

--装备信息
function TeamHeroNode:_updateEquipment()
	local curPos = G_UserData:getTeam():getCurPos()
	for i = 1, 4 do
		local equipIcon = self._equipments[i]
		equipIcon:updateIcon(curPos, i)

		local param = {pos = curPos, slot = i}
		local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "slotRP", param)
		local reach2 = false
		local reach3 = false
		local equipId = G_UserData:getBattleResource():getResourceId(curPos, 1, i)
		local isLimit = false
		if equipId then
			local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
			reach1 = reach1 or EquipTrainHelper.isNeedRedPointByUnitData(equipUnitData)
			reach1 = reach1 or EquipTrainHelper.needJadeRedPoint(equipId)
			reach2 = reach2 or RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, "slotRP", equipUnitData)
			reach3 = reach3 or RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, "slotRP", equipUnitData)
		end
		equipIcon:showRedPoint(reach1)
		local reach = reach2 or reach3
		equipIcon:showUpArrow(reach) --箭头
		-- equipIcon:showEffect() --流光特效
	end
end

--宝物信息
function TeamHeroNode:_updateTreasure()
	local curPos = G_UserData:getTeam():getCurPos()
	for i = 1, 2 do
		local treasureIcon = self._treasures[i]
		treasureIcon:updateIcon(curPos, i)
		local reach2 = false
		local reach3 = false
		local reach4 = false
		local reach5 = false
		local treasureId = G_UserData:getBattleResource():getResourceId(curPos, 2, i)
		if treasureId then
			local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
			reach2 =
				reach2 or RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, "slotRP", treasureUnitData)
			reach3 =
				reach3 or RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, "slotRP", treasureUnitData)
			reach4 =
				reach4 or RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, "slotRP", treasureUnitData)
			local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
			reach5 = 
				reach5 or TreasureTrainHelper.needJadeRedPoint(treasureUnitData:getId())
		end

		--红点提示
		local param = {pos = curPos, slot = i}
		local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "slotRP", param)
		treasureIcon:showRedPoint(reach1 or reach5)

		local reach = reach2 or reach3 or reach4
		treasureIcon:showUpArrow(reach)
	end
end

--神兵信息
function TeamHeroNode:_updateInstrument()
    if not self._isInstrumentShow then
        self._instrument:setVisible(true)
        self._instrument:showUnlockView(true)
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	local heroBaseId = self._curHeroData:getBase_id()
    self._instrument:showUnlockView(false)
    self._instrument:updateIcon(curPos, heroBaseId)
    self._instrument:setVisible(true)
    
	-- 红点提示
	local param = {pos = curPos, slot = 1, heroBaseId = heroBaseId}
	local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "slotRP", param)
	local reach2 = false
	local reach3 = false
	local instrumentId = G_UserData:getBattleResource():getResourceId(curPos, 3, 1)
	if instrumentId then
		local instrumentUnitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, "slotRP", instrumentUnitData)
		reach3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, "slotRP", instrumentUnitData)
	end

	self._instrument:showRedPoint(reach1 or reach2 or reach3)
	self._instrument:showTextBg(false)
end

--战马
function TeamHeroNode:_updateHorse()
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE)
	if not isOpen then
		self._fileNodeHorse:setVisible(false)
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	self._horse:updateIcon(curPos)
	self._fileNodeHorse:setVisible(true)
	-- 红点提示
	local heroBaseId = nil
	local heroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
	if heroId > 0 then
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		heroBaseId = unitData:getBase_id()
	end

	local param = {pos = curPos, slot = 1, heroBaseId = heroBaseId}
	local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "slotRP", param)
	local reach2 = false
	local horseId = G_UserData:getBattleResource():getResourceId(curPos, HorseConst.FLAG, 1)
	if horseId then
		local horseUnitData = G_UserData:getHorse():getUnitDataWithId(horseId)
		reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, "slotRP", horseUnitData)
	end

	self._horse:showRedPoint(reach1 or reach2)
end

--历代名将
function TeamHeroNode:_updateHistoryHero()
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	if not isOpen then
		self._fileNodeHistoryHero:setVisible(false)
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	self._historyHero:updateIcon(curPos)
	self._fileNodeHistoryHero:setVisible(true)
	
	--记录历代名将
	self:_recordHistoryHeroStep()
	-- local historyHeroData = G_UserData:getHistoryHero():getHeroDataWithPos(curPos)
	-- if historyHeroData then
	-- 	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "strongerThanMe", historyHeroData)
	-- 	self._historyHero:updateIcon(reach)
	-- else
	-- 	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "space")
	-- 	self._historyHero:updateIcon(reach)
	-- end
end

--战斗力
function TeamHeroNode:_updatePower()
	local param = {
		heroUnitData = self._curHeroData
	}
	local attrInfo = UserDataHelper.getHeroPowerAttr(param)
	local power = AttrDataHelper.getPower(attrInfo)
	self._fileNodePower:updateUI(power)
	-- local width = self._fileNodePower:getWidth()
	-- local posX = 306 - (width / 2)
	-- self._fileNodePower:setPositionX(posX)
end

--觉醒显示
function TeamHeroNode:_updateAwake()
	local visible = false
	local star = 0
	local showRP = false

	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	if HeroGoldHelper.isPureHeroGold(self._curHeroData) then
		self._imageAwakeBg:setVisible(false)
		self._parentView:updateAwake(false, star, showRP)
		return
	end
	local HeroTrainHelper = require("app.scene.view.heroTrain.HeroTrainHelper")
	local isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(self._curHeroData)
	local isCanAwake = self._curHeroData:isCanAwake()
	if isOpen and isCanAwake then
		self._imageAwakeBg:setVisible(true)
		local awakeLevel = self._curHeroData:getAwaken_level()
		star = UserDataHelper.convertAwakeLevel(awakeLevel)
		self._nodeHeroStar:setStarOrMoon(star)
		showRP = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, self._curHeroData)
		self._imageAwakeRedPoint:setVisible(showRP)
		visible = true
	else
		self._imageAwakeBg:setVisible(false)
		visible = false
	end

	self._parentView:updateAwake(visible, star, showRP)
end

-- 点击神兽
function TeamHeroNode:_onButtonPetClicked()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_HOME)
end

--点击大师
function TeamHeroNode:_onButtonMasterClicked()
	if not EquipMasterHelper.isOpen(FunctionConst.FUNC_STRENGTHEN_MASTER) then
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	if not EquipMasterHelper.isFull(curPos) then
		return
	end

	local popupEquipMaster = require("app.scene.view.equipTrain.PopupEquipMaster").new(curPos)
	popupEquipMaster:openWithAction()
end

--点击更换
function TeamHeroNode:_onButtonChangeClicked()
	local curPos = G_UserData:getTeam():getCurPos()
	local isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE2, {curPos})
	if isEmpty then
		G_Prompt:showTip(Lang.get("hero_popup_list_empty_tip" .. PopupChooseHeroHelper.FROM_TYPE2))
	else
		local popupChooseHero = PopupChooseHero.new()
		local callBack = handler(self, self._changeHeroCallBack)
		popupChooseHero:setTitle(Lang.get("hero_replace_title"))
		popupChooseHero:updateUI(PopupChooseHeroHelper.FROM_TYPE2, callBack, curPos)
		popupChooseHero:openWithAction()
	end
end

--点击一键强化
function TeamHeroNode:_onButtonOneKeyClicked()
	local curPos = G_UserData:getTeam():getCurPos()
	local value, indexs = UserDataHelper.getOneKeyStrengCost(curPos)
	self._oneKeyEquipIndexs = indexs

	if value == -1 then
		G_Prompt:showTip(Lang.get("equipment_strengthen_fetch_equip_hint"))
		return
	end
	if value == -2 then
		G_Prompt:showTip(Lang.get("equipment_strengthen_all_reach_limit"))
		return
	end
	if value == 0 then
		G_Prompt:showTip(Lang.get("common_money_not_enough"))
		return
	end
	local content = Lang.get("equipment_strengthen_onekey_content", {value = TextHelper.getAmountText1(value)}) --
	local PopupSystemAlert = require("app.ui.PopupSystemAlert")
	local popupSystemAlert =
		PopupSystemAlert.new(Lang.get("equipment_strengthen_onekey_title"), content, handler(self, self._doOneKeyStreng))
	popupSystemAlert:setCheckBoxVisible(false)
	popupSystemAlert:openWithAction()
end

--do一键强化
function TeamHeroNode:_doOneKeyStreng()
	local curPos = G_UserData:getTeam():getCurPos()
	G_UserData:getEquipment():c2sSuperUpgradeEquipment(curPos)
	self._buttonOneKey:setEnabled(false)
	self:_saveEquipStrMasterInfo()
end

--觉醒
function TeamHeroNode:_onButtonAwakeClicked()
	local heroId = self._curHeroData:getId()
	G_SceneManager:showScene("heroTrain", heroId, HeroConst.HERO_TRAIN_AWAKE, HeroConst.HERO_RANGE_TYPE_2, false)
end

--变身卡
function TeamHeroNode:_onButtonAvatarClicked()
	local isOpen, comment = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_AVATAR)
	if not isOpen then
		G_Prompt:showTip(comment)
		return
	end

	G_SceneManager:showScene("avatar", nil, true)
end

--锦囊
function TeamHeroNode:_onButtonSilkbagClicked()
	local isOpen, comment = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SILKBAG)
	if not isOpen then
		G_Prompt:showTip(comment)
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	G_SceneManager:showScene("silkbag", curPos)
end

--历代名将
function TeamHeroNode:_onButtonHistoryHeroClicked()
	local isOpen, comment = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	if not isOpen then
		G_Prompt:showTip(comment)
		return
	end
	local curPos = G_UserData:getTeam():getCurPos()
	G_SceneManager:showScene("historyheroTrain", curPos)
end


function TeamHeroNode:_showHeroDetailView()
	local curPos = G_UserData:getTeam():getCurPos()
	local heroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
	G_SceneManager:showScene("heroDetail", heroId, HeroConst.HERO_RANGE_TYPE_2)
end

function TeamHeroNode:_onKarmaClicked()
	if self._popupKarma == nil then
		self._popupKarma =
			require("app.scene.view.heroTrain.PopupHeroKarma").new(self, self._curHeroData, HeroConst.HERO_RANGE_TYPE_2)
		self._popupKarmaSignal = self._popupKarma.signal:add(handler(self, self._onPopupHeroKaramClose))
		self._popupKarma:openWithAction()
	end
end

function TeamHeroNode:_onPopupHeroKaramClose(event)
	if event == "close" then
		self._popupKarma = nil
		if self._popupKarmaSignal then
			self._popupKarmaSignal:remove()
			self._popupKarmaSignal = nil
		end

		local curPos = G_UserData:getTeam():getCurPos()
		--当断线时，会先清理数据，然后走到onExit，此时再调用数据，就会报错
		--在此做个判断
		if curPos == nil then
			return
		end
		self:_recordBaseAttr()
		G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
		local summary = {}
		self:_addBaseAttrPromptSummary(summary)
		G_Prompt:showSummary(summary)
		G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
	end
end

function TeamHeroNode:_onYokeClicked()
	local popup = require("app.scene.view.team.PopupHeroYoke").new(self._curHeroData)
	popup:openWithAction()
end

function TeamHeroNode:_onAttrClicked()
	local popup = require("app.scene.view.team.PopupAttrDetail").new(self._curHeroData)
	popup:openWithAction()
end

--阵容更换成功回调
function TeamHeroNode:_changeHeroFormation(eventName, pos, oldHeroId)
	G_UserData:getTeam():setCurPos(pos)

	self:_updateData()
	self:_updateBaseInfo()
	self:_updateSkill()
	self:_updateTacticsPos()
	self:_updateKarma()
	self:_updateYoke()
	self:_updateAttrScrollView()
	self:_updateEquipment()
	self:_updateTreasure()
	self:_updateInstrument()
	self:_updateHorse()
	self:_updateHistoryHero()
	self:checkHeroTrainRP()
	self:_updatePower()
	self:_formatButtons()

	self._changeOldHeroId = oldHeroId
	local isActive = self._curHeroData:isActiveJoint()
	if isActive then
		self:_popupActiveJoint()
	else
		self:_playChangeHeroSummary()
	end
end

function TeamHeroNode:_heroKarmaActiveSuccess(eventName, destinyId)
	self:_updateData()
	self:_updatePower()
	self:_updateKarma()
	self:_updateAttr()
	self:_updateAttrScrollView()
end

function TeamHeroNode:_equipAddSuccess(eventName, oldId, pos, slot)
	self:_updateData()
	self:_updateEquipment()
	self:_updatePower()
	self:_playEquipAddSummary(oldId, pos, slot)
end

--历代名将阵容变化
function TeamHeroNode:_onHistoryHeroFormationUpdate()
	self:_updateData()
	self:_updateHistoryHero()
	self:_updatePower()
	self:_playHistoryHeroTrainPrompt()
end

-- 玩家等级提升
function TeamHeroNode:_onUserLevelup(eventName)
	self:_updateTacticsPos()
end

-- 战法位解锁成功
function TeamHeroNode:_onTacticsPosUnlock(eventName, pos, slot)
	local curPos = G_UserData:getTeam():getCurPos()
	if pos==curPos then
		self["_fileNodeTactics"..slot]:unlockPosition(handler(self, self._playTacticsPosPrompt))
		G_AudioManager:playSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK)
	end
end


-- 战法装备成功
function TeamHeroNode:_onTacticsAddSuccess(eventName, newId, pos, slot)
	-- self:_updateData()
	self:_updateTacticsPos()
	self:_updatePower()

	self:_playTacticsPrompt(newId)
	-- self:_playTreasureAddSummary(oldId, pos, slot)
end

-- 战法卸载成功
function TeamHeroNode:_onTacticsRemoveSuccess(eventName, oldId, pos, slot)
	-- self:_updateData()
	self:_updateTacticsPos()
	self:_updatePower()

	self:_playTacticsPrompt(0)
	-- self:_playTreasureAddSummary(oldId, pos, slot)
end

--装备一键强化成功
function TeamHeroNode:_onEventEquipSuperUpgrade(eventName, crits, saveMoney)
	self:_updateData()
	local curPos = G_UserData:getTeam():getCurPos()
	self:_playOneKeyEffect(crits, saveMoney, curPos)
end

--设置此界面onEnter时要显示更换装备弹框
function TeamHeroNode:setNeedPopupEquipReplace(showRP)
	self._needPopupEquipReplace = true
	self._btnEquipShowRP = showRP --是否需要显示红点
end

function TeamHeroNode:setNeedEquipClearPrompt(need)
	self._needEquipClearPrompt = need
end

function TeamHeroNode:_onEquipEvent()
	if self._needPopupEquipReplace then
		self:_popupReplaceEquip()
		self._needPopupEquipReplace = false
	end
end

function TeamHeroNode:_popupReplaceEquip()
	local curPos = G_UserData:getTeam():getCurPos()
	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	local curEquipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(curEquipId)
	local curEquipSlot = curEquipUnitData:getSlot()
	local result, noWear, wear = G_UserData:getEquipment():getReplaceEquipmentListWithSlot(curPos, curEquipSlot)
	if #result == 0 then
		G_Prompt:showTip(Lang.get("equipment_empty_tip"))
	else
		local PopupChooseEquipHelper = require("app.ui.PopupChooseEquipHelper")
		local popup = require("app.ui.PopupChooseEquip2").new()
		local callBack = handler(self, self._onChooseEquip)
		popup:setTitle(Lang.get("equipment_replace_title"))
		popup:updateUI(
			PopupChooseEquipHelper.FROM_TYPE2,
			callBack,
			result,
			self._btnEquipShowRP,
			curEquipUnitData,
			noWear,
			curPos
		)
		popup:openWithAction()
	end
end

function TeamHeroNode:_onChooseEquip(equipId)
	local curPos = G_UserData:getTeam():getCurPos()
	local curEquipId = G_UserData:getEquipment():getCurEquipId()
	local curEquipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(curEquipId)
	local curEquipSlot = curEquipUnitData:getSlot()
	G_UserData:getEquipment():c2sAddFightEquipment(curPos, curEquipSlot, equipId)
end

function TeamHeroNode:_treasureAddSuccess(eventName, oldId, pos, slot)
	self:_updateData()
	self:_updateTreasure()
	self:_updatePower()

	self:_playTreasureAddSummary(oldId, pos, slot)
end

--设置此界面onEnter时要处理的宝物相关事件
function TeamHeroNode:setNeedPopupTreasureReplace(showRP)
	self._needPopupTreasureReplace = true
	self._btnTreasureShowRP = showRP
end

function TeamHeroNode:setNeedTreasureRemovePrompt(need)
	self._needTreasureRemovePrompt = need
end

function TeamHeroNode:_onTreasureEvent()
	if self._needPopupTreasureReplace then
		self:_popupReplaceTreasure()
		self._needPopupTreasureReplace = false
	end
end

function TeamHeroNode:_popupReplaceTreasure()
	local curPos = G_UserData:getTeam():getCurPos()
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	local curTreasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(curTreasureId)
	local curTreasureSlot = curTreasureUnitData:getSlot()
	local result, noWear, wear = G_UserData:getTreasure():getReplaceTreasureListWithSlot(curPos, curTreasureSlot)
	if #result == 0 then
		G_Prompt:showTip(Lang.get("treasure_empty_tip"))
	else
		local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")
		local popup = require("app.ui.PopupChooseTreasure2").new()
		local callBack = handler(self, self._onChooseTreasure)
		popup:setTitle(Lang.get("treasure_replace_title"))
		popup:updateUI(
			PopupChooseTreasureHelper.FROM_TYPE2,
			callBack,
			result,
			self._btnTreasureShowRP,
			curTreasureUnitData,
			noWear,
			curPos
		)
		popup:openWithAction()
	end
end

function TeamHeroNode:_onChooseTreasure(treasureId)
	local curPos = G_UserData:getTeam():getCurPos()
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	local curTreasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(curTreasureId)
	local curTreasureSlot = curTreasureUnitData:getSlot()
	G_UserData:getTreasure():c2sEquipTreasure(curPos, curTreasureSlot, treasureId)
end

function TeamHeroNode:_instrumentAddSuccess(eventName, id, pos, oldId)
	self:_updateData()
	self:_updateInstrument()
	self:_updatePower()

	self:_playInstrumentAddSummary(id, pos, oldId)
end

function TeamHeroNode:_horseAddSuccess(eventName, id, pos, oldId)
	self:_updateData()
	self:_updateHorse()
	self:_updatePower()

	self:_playHorseAddSummary(id, pos, oldId)
end

function TeamHeroNode:_horseRemoveSuccess(eventName)
	self:_updateData()
	self:_updateHorse()
	self:_updatePower()
end

--设置此界面onEnter时要处理的神兵相关事件
function TeamHeroNode:setNeedPopupInstrumentReplace(showRP)
	self._needPopupInstrumentReplace = true
	self._btnInstrumentShowRP = showRP
end

function TeamHeroNode:setNeedInstrumentRemovePrompt(need)
	self._needInstrumentRemovePrompt = need
end

function TeamHeroNode:_onInstrumentEvent()
	if self._needPopupInstrumentReplace then
		self:_popupReplaceInstrument()
		self._needPopupInstrumentReplace = false
	end
end

function TeamHeroNode:_popupReplaceInstrument()
	local curPos = G_UserData:getTeam():getCurPos()
	local heroBaseId = self._curHeroData:getBase_id()
	local instrumentId = G_UserData:getInstrument():getCurInstrumentId()
	local curInstrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	local result, noWear, wear = G_UserData:getInstrument():getReplaceInstrumentListWithSlot(curPos, heroBaseId)
	if #result == 0 then
		G_Prompt:showTip(Lang.get("instrument_empty_tip"))
	else
		local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")
		local popup = require("app.ui.PopupChooseInstrument").new()
		local callBack = handler(self, self._onChooseInstrument)
		popup:setTitle(Lang.get("instrument_replace_title"))
		popup:updateUI(PopupChooseInstrumentHelper.FROM_TYPE2, callBack, result, self._btnInstrumentShowRP, curInstrumentData)
		popup:openWithAction()
	end
end

function TeamHeroNode:_onChooseInstrument(instrumentId)
	local curPos = G_UserData:getTeam():getCurPos()
	G_UserData:getInstrument():c2sAddFightInstrument(curPos, instrumentId)
end

--设置此界面onEnter时要处理的战马相关事件
function TeamHeroNode:setNeedPopupHorseReplace(showRP)
	self._needPopupHorseReplace = true
	self._btnHorseShowRP = showRP
end

function TeamHeroNode:setNeedHorseRemovePrompt(need)
	self._needHorseRemovePrompt = need
end

function TeamHeroNode:_onHorseEvent()
	if self._needPopupHorseReplace then
		self:_popupReplaceHorse()
		self._needPopupHorseReplace = false
	end
end

function TeamHeroNode:_popupReplaceHorse()
	local curPos = G_UserData:getTeam():getCurPos()
	local heroId = G_UserData:getTeam():getHeroIdWithPos(curPos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local result, noWear, wear = G_UserData:getHorse():getReplaceHorseListWithSlot(curPos, heroBaseId)
	if #result == 0 then
		G_Prompt:showTip(Lang.get("horse_empty_tip"))
	else
		local PopupChooseHorseHelper = require("app.ui.PopupChooseHorseHelper")
		local popup = require("app.ui.PopupChooseHorse").new()
		local callBack = handler(self, self._onChooseHorse)
		popup:setTitle(Lang.get("horse_replace_title"))
		popup:updateUI(PopupChooseHorseHelper.FROM_TYPE2, callBack, result, self._btnHorseShowRP)
		popup:openWithAction()
	end
end

function TeamHeroNode:_onChooseHorse(horseId)
	local curPos = G_UserData:getTeam():getCurPos()
	G_UserData:getHorse():c2sWarHorseFit(curPos, horseId)
end

--选择更换武将后的回调
function TeamHeroNode:_changeHeroCallBack(heroId, param)
	local pos = unpack(param)
	G_UserData:getTeam():c2sChangeHeroFormation(pos, heroId)
end

--检查是否激活了合击
function TeamHeroNode:_popupActiveJoint()
	local popup = require("app.scene.view.team.PopupActiveJoint").new(self, self._curHeroData)
	popup:open()
end

function TeamHeroNode:onExitPopupActiveJoint()
	self:_playChangeHeroSummary()
end

--检查培养的红点
function TeamHeroNode:checkHeroTrainRP()
	self._parentView:checkHeroTrainRP(self._curHeroData)
end

--记录基础属性
function TeamHeroNode:_recordBaseAttr()
	local param = {
		heroUnitData = self._curHeroData
	}
	local attrInfo = UserDataHelper.getTotalAttr(param)
	local curPos = G_UserData:getTeam():getCurPos()
	self._recordAttr:updateData(attrInfo)
end

--播放更换武将成功后的飘字
function TeamHeroNode:_playChangeHeroSummary()
	local summary = {}

	--武将上阵\更换成功
	local successStr = ""
	if self._changeOldHeroId and self._changeOldHeroId > 0 then
		successStr = Lang.get("summary_hero_change")
	else
		local curPos = G_UserData:getTeam():getCurPos()
		self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_TEAM_SLOT" .. curPos])
		self._recordAttr:updateData({[AttributeConst.HIT] = 1000})
		self:_recordBaseAttr()
		successStr = Lang.get("summary_hero_inbattle")
	end
	local param2 = {
		content = successStr,
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		finishCallback = function()
			if self._onChangeHeroSummaryFinish then
				self:_onChangeHeroSummaryFinish()
			end
		end
	}
	table.insert(summary, param2)

	--合击激活
	local isActive = self._curHeroData:isActiveJoint()
	if isActive then
		local heroConfig = self._curHeroData:getConfig()
		local baseId = self._curHeroData:getBase_id()
		local jointType = heroConfig.skill_3_type
		local jointHeroId = heroConfig.skill_3_partner
		local heroId1 = jointType == 1 and baseId or jointHeroId --主将id

		local limitLevel = self._curHeroData:getLimit_level()
		local limitRedLevel = self._curHeroData:getLimit_rtg()
		local heroRankConfig = HeroDataHelper.getHeroRankConfig(heroId1, 0, limitLevel, limitRedLevel)
		if heroRankConfig == nil then
			heroRankConfig = HeroDataHelper.getHeroRankConfig(heroId1, 0, 0, 0)
		end
		local skillId = heroRankConfig.rank_skill_3
		if skillId > 0 then
			local skillActiveConfig = require("app.config.hero_skill_active").get(skillId)
			assert(skillActiveConfig, string.format("hero_skill_active config can not find id = %d", skillId))
			local name = skillActiveConfig.name
			local param3 = {
				content = Lang.get("summary_joint_active", {name = name}),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
			}
			table.insert(summary, param3)
		end
	end

	--羁绊
	local function getYokeIndex(fateId)
		local allYokeData = self._allYokeData
		if allYokeData and allYokeData.yokeInfo then
			for i = 1, 6 do
				local info = allYokeData.yokeInfo[i]
				if info and info.id == fateId then
					return i
				end
			end
		end
		return nil
	end

	local heroBaseId = self._curHeroData:getBase_id()
	local count, info = UserDataHelper.getWillActivateYokeCount(heroBaseId)
	local myYokeIndex = nil
	for i, one in ipairs(info) do
		local heroParam = one.heroParam
		local content =
			Lang.get(
			"summary_yoke_active",
			{
				heroName = heroParam.name,
				colorHero = Colors.colorToNumber(heroParam.icon_color),
				outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
				yokeName = one.yokeName
			}
		)
		local dstPosition = nil
		local finishCallback = nil
		local index = getYokeIndex(one.fateId)
		if index then
			myYokeIndex = index
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_textJiBanDes" .. index], self)
			finishCallback = function()
				self:_updateOneYoke(index)
			end
		end
		local param = {
			content = content,
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = dstPosition,
			finishCallback = finishCallback
		}
		table.insert(summary, param)
	end

	local allYokeData = self._allYokeData
	if allYokeData and allYokeData.yokeInfo then
		for i = 1, 6 do
			if i ~= myYokeIndex then
				self:_updateOneYoke(i)
			end
		end
	else
		self:_updateYoke()
	end

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--加入基础属性飘字内容
function TeamHeroNode:_addBaseAttrPromptSummary(summary, pos)
	local curPos = pos or G_UserData:getTeam():getCurPos()
	for i, one in ipairs(RECORD_ATTR_LIST) do
		local attrId = one[1]
		local dstNodeName = one[2]
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM + UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = dstNodeName and UIHelper.convertSpaceFromNodeToNode(self[dstNodeName], self) or nil,
				finishCallback = function()
					if attrId and dstNodeName then
						local curValue = self._recordAttr:getCurValue(attrId)
						self[dstNodeName]:getSubNodeByName("TextValue"):updateTxtValue(curValue)
					end
				end
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--播放宝物卸下飘字
function TeamHeroNode:_playRemoveTreasureSummary()
	self:_updateYoke()
	self:_updateTreasure()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放宝物穿戴飘字
function TeamHeroNode:_playTreasureAddSummary(oldId, pos, slot)
	local summary = {}

	local param1 = {
		content = oldId > 0 and Lang.get("summary_treasure_change_success") or Lang.get("summary_treasure_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		finishCallback = function()
			--穿戴宝物飘字结束事件
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "TeamView:_playTreasureAddSummary")
		end
	}
	table.insert(summary, param1)

	--羁绊
	local function isInYokeCondition(ids, id) --是否在羁绊条件内
		for i, v in ipairs(ids) do
			if v == id then
				return true
			end
		end
		return false
	end

	local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, slot)
	local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	local treasureBaseId = treasureData:getBase_id()
	local allYokeData = self._allYokeData
	if allYokeData and allYokeData.yokeInfo then
		for i = 1, 6 do
			local info = allYokeData.yokeInfo[i]
			if info and info.isActivated and info.fateType == 3 and isInYokeCondition(info.heroIds, treasureBaseId) then --羁绊类型是宝物羁绊
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._curHeroData:getBase_id())
				local heroName = heroParam.name
				local param = {
					content = Lang.get(
						"summary_yoke_active",
						{
							heroName = heroName,
							colorHero = Colors.colorToNumber(heroParam.icon_color),
							outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
							yokeName = info.name
						}
					),
					startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
					dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_textJiBanDes" .. i], self),
					finishCallback = function()
						self:_updateOneYoke(i)
					end
				}
				table.insert(summary, param)
			else
				self:_updateOneYoke(i)
			end
		end
	end

	--宝物强化大师
	self:_addTreasureStrMasterPromptSummary(summary, pos)
	--宝物精炼大师
	self:_addTreasureRefinePromptSummary(summary, pos)

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)
	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放神兵卸下飘字
function TeamHeroNode:_playRemoveInstrumentSummary()
	self:_updateYoke()
	self:_updateInstrument()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放战马卸下飘字
function TeamHeroNode:_playRemoveHorseSummary()
	self:_updateHorse()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放神兵穿戴飘字
function TeamHeroNode:_playInstrumentAddSummary(id, pos, oldId)
	local summary = {}

	local param1 = {
		content = oldId > 0 and Lang.get("summary_instrument_change_success") or Lang.get("summary_instrument_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
	}
	table.insert(summary, param1)

	--羁绊
	local function isInYokeCondition(ids, id) --是否在羁绊条件内
		for i, v in ipairs(ids) do
			if v == id then
				return true
			end
		end
		return false
	end

	local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, 1)
	local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	local instrumentBaseId = instrumentData:getBase_id()
	local allYokeData = self._allYokeData
	if allYokeData and allYokeData.yokeInfo then
		for i = 1, 6 do
			local info = allYokeData.yokeInfo[i]
			if info and info.isActivated and info.fateType == 4 and isInYokeCondition(info.heroIds, instrumentBaseId) then --羁绊类型是神兵羁绊
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._curHeroData:getBase_id())
				local heroName = heroParam.name
				local param = {
					content = Lang.get(
						"summary_yoke_active",
						{
							heroName = heroName,
							colorHero = Colors.colorToNumber(heroParam.icon_color),
							outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
							yokeName = info.name
						}
					),
					startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
					dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_textJiBanDes" .. i], self),
					finishCallback = function()
						self:_updateOneYoke(i)
					end
				}
				table.insert(summary, param)
			else
				self:_updateOneYoke(i)
			end
		end
	end

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)
	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

function TeamHeroNode:_playHorseAddSummary(id, pos, oldId)
	local summary = {}

	local param1 = {
		content = oldId > 0 and Lang.get("summary_horse_change_success") or Lang.get("summary_horse_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
	}
	table.insert(summary, param1)

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)
	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放装备卸下飘字
function TeamHeroNode:_playRemoveEquipSummary()
	self:_updateYoke()
	self:_updateEquipment()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放装备穿戴飘字
function TeamHeroNode:_playEquipAddSummary(oldId, pos, slot)
	local summary = {}

	local param1 = {
		content = oldId > 0 and Lang.get("summary_equip_change_success") or Lang.get("summary_equip_add_success"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		finishCallback = function()
			--穿戴装备飘字结束事件
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "TeamView:_playEquipAddSummary")
		end
	}
	table.insert(summary, param1)

	--羁绊
	local function isInYokeCondition(ids, id) --是否在羁绊条件内
		for i, v in ipairs(ids) do
			if v == id then
				return true
			end
		end
		return false
	end

	local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, slot)
	local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	local equipBaseId = equipData:getBase_id()
	local allYokeData = self._allYokeData
	if allYokeData and allYokeData.yokeInfo then
		for i = 1, 6 do
			local info = allYokeData.yokeInfo[i]
			if info and info.isActivated and info.fateType == 2 and isInYokeCondition(info.heroIds, equipBaseId) then --羁绊类型是装备羁绊
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._curHeroData:getBase_id())
				local heroName = heroParam.name
				local param = {
					content = Lang.get(
						"summary_yoke_active",
						{
							heroName = heroName,
							colorHero = Colors.colorToNumber(heroParam.icon_color),
							outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
							yokeName = info.name
						}
					),
					startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
					dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_textJiBanDes" .. i], self),
					finishCallback = function()
						self:_updateOneYoke(i)
					end
				}
				table.insert(summary, param)
			else
				self:_updateOneYoke(i)
			end
		end
	end

	--装备强化大师
	self:_addEquipStrMasterPromptSummary(summary, pos)
	--装备精炼大师
	self:_addEquipRefineMasterPromptSummary(summary, pos)
	--装备套装
	self:_addEquipSuitPromptSummary(summary, pos, slot)

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)
	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--装备一键强化飘字
function TeamHeroNode:_playEquipSuperUpgradeSummary(crits, saveMoney, pos)
	local summary = {}

	--成功
	local param1 = {
		content = Lang.get("summary_equip_str_success_tip6"),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		finishCallback = function()
			if self._diffEquipStrMasterLevel > 0 then --强化大师
				local curPos = G_UserData:getTeam():getCurPos()
				local curMasterInfo = EquipMasterHelper.getCurMasterInfo(curPos, MasterConst.MASTER_TYPE_1)
				local popup =
					require("app.scene.view.equipment.PopupMasterLevelup").new(
					self,
					self._lastEquipStrMasterInfo,
					curMasterInfo,
					MasterConst.MASTER_TYPE_1
				)
				popup:openWithAction()
			end
		end
	}
	table.insert(summary, param1)

	--暴击
	local critsInfo = {}
	for i, value in ipairs(crits) do
		if value > 1 then
			if critsInfo[value] == nil then
				critsInfo[value] = 0
			end
			critsInfo[value] = critsInfo[value] + 1
		end
	end
	local key2Text = {
		[1] = "一",
		[2] = "两",
		[3] = "三",
		[4] = "四",
		[5] = "五",
		[6] = "六"
	}
	for k, v in pairs(critsInfo) do
		local param2 = {
			content = Lang.get("summary_equip_str_success_tip2", {multiple = key2Text[k], count = v}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
		}
		table.insert(summary, param2)
	end

	--节省
	if saveMoney > 0 then
		local param3 = {
			content = Lang.get("summary_equip_str_success_tip5", {value = saveMoney}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
		}
		table.insert(summary, param3)
	end

	self:_addBaseAttrPromptSummary(summary, pos)

	G_Prompt:showSummary(summary)
	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--装备强化大师飘字
function TeamHeroNode:_addEquipStrMasterPromptSummary(summary, pos)
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1)
	local curLevel = curMasterInfo.masterInfo.curMasterLevel
	local info = self._lastEquipStrMasterLevel
	if info[1] and info[1] == pos and self._diffEquipStrMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_equip_str_master_reach", {level = info[2]}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._buttonMaster, self),
			finishCallback = function()
				UIActionHelper.playScaleUpEffect(self._buttonMaster)
			end
		}
		table.insert(summary, param)
	end
end

--装备精炼大师飘字
function TeamHeroNode:_addEquipRefineMasterPromptSummary(summary, pos)
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2)
	local curLevel = curMasterInfo.masterInfo.curMasterLevel
	local info = self._lastEquipRefineMasterLevel
	if info[1] and info[1] == pos and self._diffEquipRefineMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_equip_refine_master_reach", {level = info[2]}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._buttonMaster, self),
			finishCallback = function()
				UIActionHelper.playScaleUpEffect(self._buttonMaster)
			end
		}
		table.insert(summary, param)
	end
end

--宝物强化大师飘字
function TeamHeroNode:_addTreasureStrMasterPromptSummary(summary, pos)
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3)
	local curLevel = curMasterInfo.masterInfo.curMasterLevel
	local info = self._lastTreasureStrMasterLevel
	if info[1] and info[1] == pos and self._diffTreasureStrMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_treasure_str_master_reach", {level = info[2]}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._buttonMaster, self),
			finishCallback = function()
				UIActionHelper.playScaleUpEffect(self._buttonMaster)
			end
		}
		table.insert(summary, param)
	end
end

--宝物精炼大师飘字
function TeamHeroNode:_addTreasureRefinePromptSummary(summary, pos)
	local curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4)
	local curLevel = curMasterInfo.masterInfo.curMasterLevel
	local info = self._lastTreasureRefineMasterLevel
	if info[1] and info[1] == pos and self._diffTreasureRefineMasterLevel > 0 then
		local param = {
			content = Lang.get("summary_treasure_refine_master_reach", {level = info[2]}),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = UIHelper.convertSpaceFromNodeToNode(self._buttonMaster, self),
			finishCallback = function()
				UIActionHelper.playScaleUpEffect(self._buttonMaster)
			end
		}
		table.insert(summary, param)
	end
end

--激活装备套装飘字
function TeamHeroNode:_addEquipSuitPromptSummary(summary, pos, slot)
	local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, slot)
	local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
	local suitId = equipData:getConfig().suit_id
	if suitId > 0 then --有套装信息
		local componentCount = 0
		local activeCount = 0
		local componentIds = UserDataHelper.getSuitComponentIds(suitId)
		for i, id in ipairs(componentIds) do
			local isHave = UserDataHelper.isHaveEquipInPos(id, pos)
			if isHave then
				componentCount = componentCount + 1
			end
		end
		local attrInfo = UserDataHelper.getSuitAttrShowInfo(suitId)
		for i, one in ipairs(attrInfo) do
			local count = one.count
			if componentCount >= count then
				activeCount = count
			end
		end
		if activeCount > 0 then
			local name = UserDataHelper.getSuitName(suitId)
			local param = {
				content = Lang.get("summary_equip_suit_active", {name = name, count = activeCount}),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM}
			}
			table.insert(summary, param)
		end
	end
end

--更换武将飘字结束后的回调
function TeamHeroNode:_onChangeHeroSummaryFinish()
	--更换武将飘字结束后的回调
	self:runAction(
		cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(
				function()
					G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
				end
			)
		)
	)
end

--检查武将升级界面返回时是否要飘字
function TeamHeroNode:_checkHeroTrainPrompt()
	local flag = G_UserData:getTeamCache():isShowHeroTrainFlag()
	if not flag then
		return false
	end
	--升级
	local curId = self._curHeroData:getId()
	local lastId = self._lastHeroLevel[1] or 0
	local lastLevel = self._lastHeroLevel[2] or 0
	local nowLevel = self._curHeroData:getLevel()
	local heroType = self._curHeroData:getConfig().type
	if lastId == curId and nowLevel > lastLevel and lastLevel > 0 and heroType ~= 1 then
		return true
	end
	--突破
	local lastRank = self._lastHeroRank[2] or -1
	local nowRank = self._curHeroData:getRank_lv()
	if lastId == curId and nowRank > lastRank and lastRank > -1 then
		return true
	end
	--觉醒
	local lastAwake = self._lastHeroAwake[2] or -1
	local nowAwake = self._curHeroData:getAwaken_level()
	if lastId == curId and nowAwake > lastAwake and lastAwake > -1 then
		return true
	end
	--界限
	local lastLimit = self._lastHeroLimit[2] or -1
	local lastRedLimit = self._lastHeroLimit[3] or -1
	local nowLimit = self._curHeroData:getLimit_level()
	local nowRedLimit = self._curHeroData:getLimit_rtg()
	if lastId == curId and ((nowLimit > lastLimit and lastLimit > -1) or (nowRedLimit > lastRedLimit and lastRedLimit > -1)) then
		return true
	end

	return false
end

--武将升级、突破都有改变时的飘字
function TeamHeroNode:_playHeroTrainPrompt()
	self:_updateAwake()
	self:_updateSkill()
	self:checkHeroTrainRP()
	self:_updatePower()

	local summary = {}

	--可以升级
	do
		local lastLevel = self._lastHeroLevel[2]
		local nowLevel = self._curHeroData:getLevel()
		local textLevel = self._nodeLevel:getSubNodeByName("TextValue")
		local function finishCallback1()
			if self._nodeLevel then
				textLevel:updateTxtValue(self._curHeroData:getLevel())
				self:_updateBaseInfo()
			end
		end
		local dstPosition = UIHelper.convertSpaceFromNodeToNode(textLevel, self)
		TeamViewHelper.makeLevelDiffData(summary, self._curHeroData, lastLevel, dstPosition, finishCallback1)
	end

	--提示可以突破
	do
		local function finishCallback2()
			if self._nodeLevel then
				self:_updateBaseInfo()
			end
		end
		local lastRank = self._lastHeroRank[2]
		TeamViewHelper.makeBreakDiffData(summary, self._curHeroData, lastRank, finishCallback2)
	end

	--觉醒等级变化
	do
		local lastAwake = self._lastHeroAwake[2]
		TeamViewHelper.makeAwakeDiffData(summary, self._curHeroData, lastAwake)
	end

	--界限等级变化
	do
		local function finishCallback3()
			if self._nodeLevel then
				self:_updateBaseInfo()
			end
		end
		local lastLimit = self._lastHeroLimit[2]
		local lastRedLimit = self._lastHeroLimit[3]
		TeamViewHelper.makeLimitDiffData(summary, self._curHeroData, lastLimit, lastRedLimit, finishCallback3)
	end

	dump(summary)

	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--记录装备强化大师信息
function TeamHeroNode:_saveEquipStrMasterInfo()
	local pos = G_UserData:getTeam():getCurPos()
	self._lastEquipStrMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1)
end

--记录强化大师等级
function TeamHeroNode:_recordMasterLevel()
	local pos = G_UserData:getTeam():getCurPos()

	local info1 = self._lastEquipStrMasterLevel
	local lastLevel1 = info1[2] or 0
	local curMasterInfo1 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1)
	local curLevel1 = curMasterInfo1.masterInfo.curMasterLevel
	self._diffEquipStrMasterLevel = curLevel1 - lastLevel1
	self._lastEquipStrMasterLevel = {pos, curLevel1}

	local info2 = self._lastEquipRefineMasterLevel
	local lastLevel2 = info2[2] or 0
	local curMasterInfo2 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2)
	local curLevel2 = curMasterInfo2.masterInfo.curMasterLevel
	self._diffEquipRefineMasterLevel = curLevel2 - lastLevel2
	self._lastEquipRefineMasterLevel = {pos, curLevel2}

	local info3 = self._lastTreasureStrMasterLevel
	local lastLevel3 = info3[2] or 0
	local curMasterInfo3 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3)
	local curLevel3 = curMasterInfo3.masterInfo.curMasterLevel
	self._diffTreasureStrMasterLevel = curLevel3 - lastLevel3
	self._lastTreasureStrMasterLevel = {pos, curLevel3}

	local info4 = self._lastTreasureRefineMasterLevel
	local lastLevel4 = info4[2] or 0
	local curMasterInfo4 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4)
	local curLevel4 = curMasterInfo4.masterInfo.curMasterLevel
	self._diffTreasureRefineMasterLevel = curLevel4 - lastLevel4
	self._lastTreasureRefineMasterLevel = {pos, curLevel4}
end

--记录装备等级
function TeamHeroNode:_recordEquipLevel()
	local info1 = {}
	local info2 = {}
	local pos = G_UserData:getTeam():getCurPos()
	for i = 1, 4 do
		local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, i)
		if equipId then
			local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			local equipLevel = equipData:getLevel()
			local equipRLevel = equipData:getR_level()
			info1[i] = {equipId, equipLevel}
			info2[i] = {equipId, equipRLevel}
		end
	end
	self._lastEquipLevel = info1
	self._lastEquipRLevel = info2
end

--记录宝物等级
function TeamHeroNode:_recordTreasureLevel()
	local info1 = {}
	local info2 = {}
	local pos = G_UserData:getTeam():getCurPos()
	for i = 1, 4 do
		local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
		if treasureId then
			local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
			local treasureLevel = treasureData:getLevel()
			local treasureRLevel = treasureData:getRefine_level()
			info1[i] = {treasureId, treasureLevel}
			info2[i] = {treasureId, treasureRLevel}
		end
	end
	self._lastTreasureLevel = info1
	self._lastTreasureRLevel = info2
end

--记录神兵等级
function TeamHeroNode:_recordInstrumentLevel()
	local info1 = {}
	local pos = G_UserData:getTeam():getCurPos()
	for i = 1, 1 do
		local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, i)
		if instrumentId then
			local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
			local instrumentLevel = instrumentData:getLevel()
			info1[i] = {instrumentId, instrumentLevel}
		end
	end
	self._lastInstrumentLevel = info1
end

--记录战马星级
function TeamHeroNode:_recordHorseStar()
	local info1 = {}
	local pos = G_UserData:getTeam():getCurPos()
	for i = 1, 1 do
		local horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, i)
		if horseId then
			local horseData = G_UserData:getHorse():getUnitDataWithId(horseId)
			local star = horseData:getStar()
			info1[i] = {horseId, star}
		end
	end
	self._lastHorseLevel = info1
end

--记录历代名将突破等级
function TeamHeroNode:_recordHistoryHeroStep()
	local info1 = {}
	local pos = G_UserData:getTeam():getCurPos()
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
	local historyHeroId = historyHeroIds[pos]
	if historyHeroId and historyHeroId > 0 then
		local historyHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(historyHeroId)
		local step = historyHeroData:getBreak_through()
		info1[pos] = {historyHeroId, step}
	end
	self._lastHistoryHeroLevel = info1
end

--检查装备培养返回时是否要飘字
function TeamHeroNode:_checkEquipTrainPrompt()
	local flag = G_UserData:getTeamCache():isShowEquipTrainFlag()
	if not flag then
		return false
	end

	local pos = G_UserData:getTeam():getCurPos()
	local lastInfo1 = self._lastEquipLevel
	local lastInfo2 = self._lastEquipRLevel
	for i = 1, 4 do
		local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, i)
		if equipId then
			local info1 = lastInfo1[i]
			local info2 = lastInfo2[i]
			if info1 then
				local lastId = info1[1] or 0
				local lastLevel = info1[2] or 0
				local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
				local equipLevel = equipData:getLevel()
				if equipId == lastId and equipLevel > lastLevel then
					return true
				end
			end
			if info2 then
				local lastId = info2[1] or 0
				local lastRLevel = info2[2] or 0
				local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
				local equipRLevel = equipData:getR_level()
				if equipId == lastId and equipRLevel > lastRLevel then
					return true
				end
			end
		end
	end
	return false
end

--播放装备培养返回时飘字
function TeamHeroNode:_playEquipTrainPrompt()
	self:_updateEquipment()
	self:checkHeroTrainRP()
	self:_updatePower()

	local pos = G_UserData:getTeam():getCurPos()
	local summary = {}
	self:_addEquipStrMasterPromptSummary(summary, pos)
	self:_addEquipRefineMasterPromptSummary(summary, pos)
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--检查宝物培养返回时是否要飘字
function TeamHeroNode:_checkTreasureTrainPrompt()
	local flag = G_UserData:getTeamCache():isShowTreasureTrainFlag()
	if not flag then
		return false
	end

	local pos = G_UserData:getTeam():getCurPos()
	local lastInfo1 = self._lastTreasureLevel
	local lastInfo2 = self._lastTreasureRLevel
	for i = 1, 2 do
		local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
		if treasureId then
			local info1 = lastInfo1[i]
			local info2 = lastInfo2[i]
			if info1 then
				local lastId = info1[1] or 0
				local lastLevel = info1[2] or 0
				local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
				local treasureLevel = treasureData:getLevel()
				if treasureId == lastId and treasureLevel > lastLevel then
					return true
				end
			end
			if info2 then
				local lastId = info2[1] or 0
				local lastRLevel = info2[2] or 0
				local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
				local treasureRLevel = treasureData:getRefine_level()
				if treasureId == lastId and treasureRLevel > lastRLevel then
					return true
				end
			end
		end
	end
	return false
end

--播放宝物培养返回时飘字
function TeamHeroNode:_playTreasureTrainPrompt()
	self:_updateTreasure()
	self:checkHeroTrainRP()
	self:_updatePower()

	local pos = G_UserData:getTeam():getCurPos()
	local summary = {}
	self:_addTreasureStrMasterPromptSummary(summary, pos)
	self:_addTreasureRefinePromptSummary(summary, pos)
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

function TeamHeroNode:_checkInstrumentTrainPrompt()
	local flag = G_UserData:getTeamCache():isShowInstrumentTrainFlag()
	if not flag then
		return false
	end

	local pos = G_UserData:getTeam():getCurPos()
	local lastInfo1 = self._lastInstrumentLevel
	for i = 1, 1 do
		local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, i)
		if instrumentId then
			local info1 = lastInfo1[i]
			if info1 then
				local lastId = info1[1] or 0
				local lastLevel = info1[2] or 0
				local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
				local instrumentLevel = instrumentData:getLevel()
				if instrumentId == lastId and instrumentLevel > lastLevel then
					return true
				end
			end
		end
	end
	return false
end

function TeamHeroNode:_checkHorseTrainPrompt()
	local flag = G_UserData:getTeamCache():isShowHorseTrainFlag()
	if not flag then
		return false
	end

	local pos = G_UserData:getTeam():getCurPos()
	local lastInfo1 = self._lastHorseLevel
	for i = 1, 1 do
		local horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, i)
		if horseId then
			local info1 = lastInfo1[i]
			if info1 then
				local lastId = info1[1] or 0
				local lastLevel = info1[2] or 0
				local horseData = G_UserData:getHorse():getUnitDataWithId(horseId)
				local star = horseData:getStar()
				if horseId == lastId and star > lastLevel then
					return true
				end
			end
		end
	end
	return false
end

function TeamHeroNode:_checkHistoryHeroPrompt()
	local flag = G_UserData:getTeamCache():isShowHistoryHeroFlag()
	if not flag then
		return false
	end

	local pos = G_UserData:getTeam():getCurPos()
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
	local lastInfo1 = self._lastHistoryHeroLevel
	local info1 = lastInfo1[pos]
	local historyHeroId = historyHeroIds[pos]
	if historyHeroId and historyHeroId > 0 then
		if info1 then
			local lastId = info1[1] or 0
			local lastLevel = info1[2] or 0
			local historyHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(historyHeroId)
			local level = historyHeroData:getBreak_through()
			if historyHeroId ~= lastId or level ~= lastLevel then
				return true
			end
		else
			return true
		end
	else
		if info1 then
			return true
		end
	end
	return false
end

--播放神兵培养返回时飘字
function TeamHeroNode:_playInstrumentTrainPrompt()
	self:_updateInstrument()
	self:checkHeroTrainRP()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放战马培养返回时飘字
function TeamHeroNode:_playHorseTrainPrompt()
	self:_updateHorse()
	self:checkHeroTrainRP()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--播放历代名将培养返回时飘字
function TeamHeroNode:_playHistoryHeroTrainPrompt()
	self:_updateHistoryHero()
	self:checkHeroTrainRP()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

function TeamHeroNode:_checkAvatarEquipPrompt()
	local flag = G_UserData:getTeamCache():isShowAvatarEquipFlag()
	return flag
end

--播放变身卡装备返回时飘字
function TeamHeroNode:_playAvatarEquipPrompt()
	self:_updateBaseInfo()
	self:_updateSkill()
	self:_updateHorse()
	self:_updatePower()

	local summary = {}
	self:_addBaseAttrPromptSummary(summary)

	G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
end

--特效部分-------------------------------------------------------------------
--一键强化单个特效
function TeamHeroNode:_playOneKeyUnitEffect(index, crits, saveMoney, pos)
	local function effectFunction(effect)
		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "finish" then
		elseif event == "play" then
			local icon = self["_fileNodeEquip" .. index]:getSubNodeByName("FileNodeCommon")
			G_EffectGfxMgr:applySingleGfx(icon, "smoving_zhuangbei", nil, nil, nil)
			if crits and saveMoney and pos then
				local curPos = G_UserData:getTeam():getCurPos()
				if curPos >= 1 and curPos <= 6 then
					self:_updateEquipment()
					self:_updatePower()
					self:_playEquipSuperUpgradeSummary(crits, saveMoney, pos)
				end
				self._buttonOneKey:setEnabled(true)
			end
		end
	end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_yijianqianghua", effectFunction, eventFunction, false)
	effect:setPosition(UIHelper.convertSpaceFromNodeToNode(self["_fileNodeEquip" .. index], self))
end

--一键强化
function TeamHeroNode:_playOneKeyEffect(crits, saveMoney, pos)
	local played = false --是否播过飘字
	local indexs = self._oneKeyEquipIndexs
	for slot, v in pairs(indexs) do
		if not played then
			self:_playOneKeyUnitEffect(slot, crits, saveMoney, pos)
			played = true
		else
			self:_playOneKeyUnitEffect(slot)
		end
	end
	G_AudioManager:playSoundWithId(AudioConst.SOUND_EQUIP_STRENGTHEN) --播音效
end

function TeamHeroNode:getEquipmentIconByIndex(pos)
	return self._equipments[pos]
end

function TeamHeroNode:getTreasureIconByIndex(pos)
	return self._treasures[pos]
end

return TeamHeroNode
