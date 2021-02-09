--
-- Author: Liangxu
-- Date: 2017-03-30 11:14:10
-- 查看阵容武将模块

local ViewBase = require("app.ui.ViewBase")
local UserDetailHeroNode = class("UserDetailHeroNode", ViewBase)
local TeamEquipIcon = require("app.scene.view.team.TeamEquipIcon")
local TeamTreasureIcon = require("app.scene.view.team.TeamTreasureIcon")
local TeamInstrumentIcon = require("app.scene.view.team.TeamInstrumentIcon")
local UserDataHelper = require("app.utils.UserDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local SilkbagIcon = require("app.scene.view.silkbag.SilkbagIcon")
local SilkbagConst = require("app.const.SilkbagConst")
local TeamHorseIcon = require("app.scene.view.team.TeamHorseIcon")
local HeroConst = require("app.const.HeroConst")
local TeamHistoryHeroIcon = require("app.scene.view.team.TeamHistoryHeroIcon")
local TeamTacticsPositionIcon = require("app.scene.view.team.TeamTacticsPositionIcon")
local CSHelper = require("yoka.utils.CSHelper")

function UserDetailHeroNode:ctor(parentView, detailData)
	self._parentView = parentView
	self._detailData = detailData

	local resource = {
		file = Path.getCSB("UserDetailHeroNode", "common"),
		binding = {
			_buttonSilkbag = {
				events = {{event = "touch", method = "_onButtonSilkbagClicked"}}
			},
			_buttonEquip = {
				events = {{event = "touch", method = "_onButtonEquipClicked"}}
			}
		}
	}

	UserDetailHeroNode.super.ctor(self, resource)
end

function UserDetailHeroNode:onCreate()
	self:_initData()
	self:_initView()
end

function UserDetailHeroNode:_initData()
	self._switchIndex = 1
end

function UserDetailHeroNode:_initView()
	self._nodeDetailTitleBasic:setTitle(Lang.get("team_detail_title_basic"))
	self._nodeDetailTitleKarma:setTitle(Lang.get("team_detail_title_karma"))
	self._nodeDetailTitleTactics:setTitle(Lang.get("team_detail_title_tactics"))
	self._nodeDetailTitleYoke:setTitle(Lang.get("team_detail_title_yoke"))
	self._nodeLevel:setFontSize(17)
	self._nodePotential:setFontSize(17)
	for i = 1, 4 do
		self["_fileNodeAttr" .. i]:setFontSize(17)
	end

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

	--锦囊
	for i = 1, SilkbagConst.SLOT_MAX do
		self["_silkbagIcon" .. i] = SilkbagIcon.new(i)
		self["_silkbagIcon" .. i]:setScale(0.8)
		self._panelSilkbag:addChild(self["_silkbagIcon" .. i])
	end
	local count2Pos = {
		[1] = {cc.p(247, 425)},
		[2] = {cc.p(105, 405), cc.p(390, 405)},
		[3] = {cc.p(247, 425), cc.p(115, 198), cc.p(380, 198)},
		[4] = {cc.p(140, 381), cc.p(356, 381), cc.p(140, 168), cc.p(355, 168)},
		[5] = {cc.p(247, 425), cc.p(102, 322), cc.p(391, 322), cc.p(158, 152), cc.p(337, 152)},
		[6] = {cc.p(247, 425), cc.p(116, 350), cc.p(379, 350), cc.p(115, 198), cc.p(379, 198), cc.p(247, 123)},
		[7] = {cc.p(247, 425), cc.p(128, 370), cc.p(365, 370), cc.p(99, 241), cc.p(396, 241), cc.p(180, 139), cc.p(313, 139)},
		[8] = {
			cc.p(247, 425),
			cc.p(140, 382),
			cc.p(356, 382),
			cc.p(94, 275),
			cc.p(399, 275),
			cc.p(139, 168),
			cc.p(354, 168),
			cc.p(247, 123)
		},
		[9] = {
			cc.p(247, 425),
			cc.p(148, 392),
			cc.p(345, 392),
			cc.p(97, 302),
			cc.p(398, 302),
			cc.p(115, 200),
			cc.p(380, 200),
			cc.p(196, 132),
			cc.p(300, 132)
		},
		[10] = {
			cc.p(201, 420),
			cc.p(294, 420),
			cc.p(125, 365),
			cc.p(370, 365),
			cc.p(95, 276),
			cc.p(398, 276),
			cc.p(125, 186),
			cc.p(370, 186),
			cc.p(200, 131),
			cc.p(293, 131)
		}
	}

	
	local isTacticsOpen = self._detailData:funcIsOpened(FunctionConst.FUNC_TACTICS)
	self._panelTactics:setVisible(isTacticsOpen)

	local count = 0
	for i = 1, SilkbagConst.SLOT_MAX do
		local isOpen = self._detailData:funcIsOpened(FunctionConst["FUNC_SILKBAG_SLOT" .. i])
		if isOpen then
			count = i
		else
			break
		end
	end

	self._showSilkbagIcons = {}
	for i = 1, SilkbagConst.SLOT_MAX do
		if i <= count then
			self["_silkbagIcon" .. i]:setVisible(true)
			self["_silkbagIcon" .. i]:setPosition(count2Pos[count][i])
			table.insert(self._showSilkbagIcons, self["_silkbagIcon" .. i])
		else
			self["_silkbagIcon" .. i]:setVisible(false)
		end
	end
end

function UserDetailHeroNode:_initTacticsNode()
	for i=1,3 do
		local node = CSHelper.loadResourceNode(Path.getCSB("TeamTacticsPositionIcon", "team"))
		self["_nodeTactics"..i]:addChild(node)
		self["_nodeTactics"..i]:setScale(0.9072)
		local item = TeamTacticsPositionIcon.new(node)
		-- item:setTouchEnabled(false)
		self["_fileNodeTactics"..i] = item
	end
end

function UserDetailHeroNode:onEnter()
end

function UserDetailHeroNode:onExit()
end

function UserDetailHeroNode:updateInfo(pos)
	self:_updateData(pos)
	self:_updateView()
	self:_switchEquipOrSilkbag()
end

function UserDetailHeroNode:_updateData(pos)
	self._pos = pos
	self._curHeroData = self._detailData:getHeroDataWithPos(pos)
	if self._curHeroData then
		self._allYokeData = UserDataHelper.getHeroYokeInfo(self._curHeroData)
	end
end

function UserDetailHeroNode:_updateView()
	self:_updateBaseInfo()
	self:_updateAttr()
	self:_updateSkill()
	self:_updateKarma()
	self:_updateTacticsPos()
	self:_updateYoke()
	self:_updateAttrScrollView()
	self:_updateEquipment()
	self:_updateTreasure()
	self:_updateInstrument()
	self:_updateHorse()
	self:_updateSilkbag()
	self:_updatePower()
	self:_updateSilkbagBtn()
	self:_updateHistoryHero()
end

function UserDetailHeroNode:_updateBaseInfo()
	local level = self._curHeroData:getLevel()
	local heroConfig = self._curHeroData:getConfig()
	local rank = self._curHeroData:getRank_lv()
	local maxLevel = self._detailData:getLevel()

	if self._curHeroData:isPureGoldHero() then
		self._nodeLevel:updateUI(Lang.get("goldenhero_train_des"), rank, rank)
		self._nodeLevel:setMaxValue("")
	else
		self._nodeLevel:updateUI(Lang.get("team_detail_des_level"), level, maxLevel)
		self._nodeLevel:setMaxValue("/" .. maxLevel)
	end

	self._nodePotential:updateUI(Lang.get("team_detail_des_potential"), heroConfig.potential)
	self._fileNodeCountry:updateUI(self._curHeroData:getBase_id())
	if self._pos == 1 then
		self._fileNodeHeroName:setNameInUserDetail(self._detailData:getName(), self._detailData:getOfficeLevel(), rank)
	else
		self._fileNodeHeroName:setName(self._curHeroData:getBase_id(), rank, self._curHeroData:getLimit_level(),
			nil, self._curHeroData:getLimit_rtg())
	end
	self:_updateAwake()
end

--基础属性
function UserDetailHeroNode:_updateAttr()
	local attrInfo = UserDataHelper.getOtherUserTotalAttr(self._curHeroData, self._detailData)
	self._fileNodeAttr1:updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK])
	self._fileNodeAttr2:updateView(AttributeConst.PD, attrInfo[AttributeConst.PD])
	self._fileNodeAttr3:updateView(AttributeConst.HP, attrInfo[AttributeConst.HP])
	self._fileNodeAttr4:updateView(AttributeConst.MD, attrInfo[AttributeConst.MD])
end

--更新技能描述
function UserDetailHeroNode:_updateSkill()
	local skillIds = {}
	local avatarBaseId = self._detailData:getAvatarBaseId()
	if avatarBaseId > 0 and self._curHeroData:isLeader() then
		local heroBaseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id
		local limitLevel = self._curHeroData:getLimit_level()
		local limitRedLevel = self._curHeroData:getLimit_rtg()
		skillIds = require("app.utils.data.HeroDataHelper").getSkillIdsWithBaseIdAndRank(heroBaseId, 0, limitLevel, limitRedLevel)
	else
		skillIds = require("app.utils.data.HeroDataHelper").getSkillIdsWithHeroData(self._curHeroData)
	end

	for i = 1, 3 do
		local skillId = skillIds[i]
		self["_fileNodeSkill" .. i]:updateUI(skillId, true)
	end
end

-- 战法位信息
function UserDetailHeroNode:_updateTacticsPos()
	local isTacticsPos3Show = self._detailData:funcIsShow(FunctionConst.FUNC_TACTICS_POS3)
	local pos = self._pos
	
	if not isTacticsPos3Show then
		local posX = {100, 208}
		for i=1,2 do
			self["_nodeTactics"..i]:setPositionX(posX[i])
			local state, tacticsUnitData = self._detailData:getTacticsPosState(pos, i)
			self["_fileNodeTactics"..i]:updateUIWithFixState(state, i, tacticsUnitData)
		end
		self["_nodeTactics"..3]:setVisible(false)
	else
		-- local posX = {68, 174, 280}
		for i=1,3 do
			-- self["_nodeTactics"..i]:setPositionX(posX[i])
			local state, tacticsUnitData = self._detailData:getTacticsPosState(pos, i)
			self["_fileNodeTactics"..i]:updateUIWithFixState(state, i, tacticsUnitData)
		end
		self["_nodeTactics"..3]:setVisible(true)
	end
end

-- 更新属性滚动列表
function UserDetailHeroNode:_updateAttrScrollView()
	local isTacticsOpen = self._detailData:funcIsOpened(FunctionConst.FUNC_TACTICS)
	self._panelTactics:setVisible(isTacticsOpen)
	if not isTacticsOpen then
		local offset = 158
		local height = 566
		local contentSize = self._scAttr:getInnerContainerSize()
		local size = cc.size(contentSize.width, height)
		self._scAttr:setInnerContainerSize(size)
		self._scAttr:setTouchEnabled(false)

		self._panelBasic:setPositionY(452-offset-200)
		self._panelKarma:setPositionY(295-offset+60+25)
		self._nodePanelYoke:setPositionY(self._karamOffset-30+90)
	else
		local offset = self._karamOffset
		local height = 158+566-offset-110+10
		local contentSize = self._scAttr:getInnerContainerSize()
		local size = cc.size(contentSize.width, height)
		self._scAttr:setInnerContainerSize(size)
		self._scAttr:setTouchEnabled(true)

		self._panelBasic:setPositionY(452-offset-200-110)
		self._panelTactics:setPositionY(323-offset+60-110)
		self._panelKarma:setPositionY(145-offset+120-110-10)
		self._nodePanelYoke:setPositionY(-25+130-110-10)
	end
end

--缘分信息
function UserDetailHeroNode:_updateKarma()
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
			local isReach = UserDataHelper.getReachCond(self._curHeroData, data["cond1"], data["cond2"], 
														self._detailData:getLevel(), self._detailData:getOfficeLevel()) --是否达成显示条件
			local isActivated = self._detailData:isKarmaActivated(data.id)
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

		for i = count + 1, HeroConst.HERO_KARMA_MAX do
			self["_textYuanFenDes" .. i]:setVisible(false)
			self["_imageYuanFenMark" .. i]:setVisible(false)
			self["_imageYuanFenBg" .. i]:setVisible(false)
		end
		local LINE_HEIGHT = 25
		local line = math.ceil(count / 2)
		
		self._karamOffset = (5 - line) * LINE_HEIGHT

		self._nodePanelYoke:setPositionY((4 - line) * LINE_HEIGHT + 15)
	end

	if count < 5 then
		self._imgLine1:setContentSize(cc.size(40, 5))
	elseif count < 7 then
		self._imgLine1:setContentSize(cc.size(73, 5))
	else
		self._imgLine1:setContentSize(cc.size(98, 5))
	end
end

--羁绊信息
function UserDetailHeroNode:_updateYoke()
	for i = 1, 6 do --6条羁绊
		self:_updateOneYoke(i)
	end
end

--更新一条羁绊
function UserDetailHeroNode:_updateOneYoke(index)
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
function UserDetailHeroNode:_updateEquipment()
	local curPos = self._pos
	local heroData = self._detailData:getHeroDataWithPos(curPos)
	local heroBaseId = nil
	if heroData then
		heroBaseId = heroData:getAvatarToHeroBaseIdByAvatarId(self._detailData:getAvatarBaseId())
	end
	for i = 1, 4 do
		local equipIcon = self._equipments[i]
		local equipData = self._detailData:getEquipData(curPos, i)
		local isShow = self._detailData:isShowEquipJade()
		equipIcon:onlyShow(i, equipData, isShow, heroBaseId)
	end
end

--宝物信息
function UserDetailHeroNode:_updateTreasure()
	local curPos = self._pos
	local heroData = self._detailData:getHeroDataWithPos(curPos)
	local heroBaseId = nil
	if heroData then
		heroBaseId = heroData:getAvatarToHeroBaseIdByAvatarId(self._detailData:getAvatarBaseId())
	end
	for i = 1, 2 do
		local treasureIcon = self._treasures[i]
		local treasureData = self._detailData:getTreasureData(curPos, i)
		local isShow = self._detailData:isShowTreasureJade()
		treasureIcon:onlyShow(i, treasureData, isShow, heroBaseId)
	end
end

--神兵信息
function UserDetailHeroNode:_updateInstrument()
	local curPos = self._pos
	local data = self._detailData:getInstrumentData(curPos, 1)
	self._instrument:onlyShow(data)
	self._instrument:showTextBg(false)
end

--战马信息
function UserDetailHeroNode:_updateHorse()
	local isOpen = self._detailData:funcIsOpened(FunctionConst.FUNC_HORSE)
	if not isOpen then
		self._fileNodeHorse:setVisible(false)
		return
	end
	self._fileNodeHorse:setVisible(true)
	local curPos = self._pos
	local data = self._detailData:getHorseData(curPos, 1)
	local horseEquipData = self._detailData:getHorseEquipData()
	self._horse:onlyShow(data, horseEquipData)
end

--历代名将信息
function UserDetailHeroNode:_updateHistoryHero()
	local isOpen = self._detailData:funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	if not isOpen then
		self._fileNodeHistoryHero:setVisible(false)
		return
	end
	self._fileNodeHistoryHero:setVisible(true)
	local curPos = self._pos
	local historyHeroData = self._detailData:getHistoryHeroData(curPos)
	self._historyHero:onlyShow(historyHeroData)
end

--锦囊
function UserDetailHeroNode:_updateSilkbag()
	local curPos = self._pos
	for i = 1, SilkbagConst.SLOT_MAX do
		self["_silkbagIcon" .. i]:onlyShow(curPos, self._detailData)
	end
end

--战斗力
function UserDetailHeroNode:_updatePower()
	local attrInfo = UserDataHelper.getOtherHeroPowerAttr(self._curHeroData, self._detailData)
	local power = AttrDataHelper.getPower(attrInfo)
	self._fileNodePower:updateUI(power)
	local width = self._fileNodePower:getWidth()
	local panelWidth = self._imageBtnBg:getContentSize().width
	local posX = (panelWidth - width) / 2
	self._fileNodePower:setPositionX(posX)
end

--觉醒显示
function UserDetailHeroNode:_updateAwake()
	local visible = false
	local star = 0

	local HeroTrainHelper = require("app.scene.view.heroTrain.HeroTrainHelper")
	local isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(self._curHeroData)
	local isCanAwake = self._curHeroData:isCanAwake()
	self._isShowAwake = isOpen and isCanAwake
	if self._isShowAwake then
		self._imageAwakeBg:setVisible(true)
		local awakeLevel = self._curHeroData:getAwaken_level()
		star = UserDataHelper.convertAwakeLevel(awakeLevel)
		self._nodeHeroStar:setStarOrMoon(star)
		visible = true
	else
		self._imageAwakeBg:setVisible(false)
		visible = false
	end

	self._parentView:updateAwake(visible, star)
end

function UserDetailHeroNode:_onButtonSilkbagClicked()
	self._switchIndex = 2
	self:_switchEquipOrSilkbag()
end

function UserDetailHeroNode:_onButtonEquipClicked()
	self._switchIndex = 1
	self:_switchEquipOrSilkbag()
end

function UserDetailHeroNode:_switchEquipOrSilkbag()
	if self._switchIndex == 1 then --装备
		self._panelDetail:setVisible(true)
		self._panelSilkbag:setVisible(false)
		self._parentView:updateAwake(self._isShowAwake)
	elseif self._switchIndex == 2 then --锦囊
		self._panelDetail:setVisible(false)
		self._panelSilkbag:setVisible(true)
		self._parentView:updateAwake(false)
	end
end

function UserDetailHeroNode:_updateSilkbagBtn()
	local isOpen = self._detailData:funcIsOpened(FunctionConst.FUNC_SILKBAG)
	self._buttonSilkbag:setVisible(isOpen)
end

return UserDetailHeroNode
