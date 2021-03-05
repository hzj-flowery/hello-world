--
-- Author: hedili
-- Date: 2018-01-25 16:00:02
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetDetailSkillCell = class("PetDetailSkillCell", ListViewCellBase)
local HeroSkillActiveConfig = require("app.config.hero_skill_active")
local UserDataHelper = require("app.utils.UserDataHelper")
function PetDetailSkillCell:ctor(skillId,showSkillDetail,petBaseId, petStar, petUnitData)
	self._skillId = skillId
	self._label = nil --技能描述文本
	self._showSkillDetail = showSkillDetail
	self._petBaseId = petBaseId or 0
	self._petStar = petStar or 0 
	self._petUnitData = petUnitData
	local resource = {
		file = Path.getCSB("PetDetailSkillCell", "pet"),
		binding = {
			_btnSkill = {
				events = {{event = "touch", method = "_onButtonSkill"}}
			},
		},
	}
	PetDetailSkillCell.super.ctor(self, resource)
end

function PetDetailSkillCell:onCreate()
	if self._showSkillDetail == false then
		self._btnSkill:setVisible(false)
	end
	local contentSize = self._panelBg:getContentSize()
	local height = contentSize.height

	local config = HeroSkillActiveConfig.get(self._skillId)

	local pendingSkill = ""

	if self._petBaseId > 0 then
		local petStarCfg = UserDataHelper.getPetStarConfig(self._petBaseId, self._petStar )
		
		if petStarCfg.skill2 == self._skillId then
			pendingSkill = petStarCfg.chance_description
		end
	end

	if config then
		local skillIconRes = config.skill_icon
		local skillDes = "["..config.name.."]"..config.description
		self._imageSkillIcon:loadTexture(Path.getCommonIcon("skill", skillIconRes))
		if self._label == nil then
			self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
			self._label:setColor(Colors.BRIGHT_BG_TWO)
			self._label:setWidth(260)
			self._label:setAnchorPoint(cc.p(0, 1))
			self._panelBg:addChild(self._label)
		end
		self._label:setString(skillDes..pendingSkill)
		local desHeight = self._label:getContentSize().height + 35
		height = math.max(contentSize.height, desHeight)--上下各扩展5像素
		self._label:setPosition(cc.p(120, height - 5))
	else
		logError(string.format("hero_skill_active config can not find id = %d", self._skillId))
	end
	
	local size = cc.size(contentSize.width, height) 
	self:setContentSize(size)
	self._imageSkillBg:setPosition(cc.p(17, height - 1))
	self._imageBg:setContentSize(cc.size(contentSize.width, height - 2))

	self._btnSkill:setPositionY(4)
end

--点击神兽技能详情
function PetDetailSkillCell:_onButtonSkill( ... )
	-- body
	local petId = G_UserData:getPet():getCurPetId()
	local skillShowList = require("app.scene.view.petDetail.PetDetailViewHelper").makeSkillEx(petId, self._skillId, self._petUnitData)
	local PopupSkillDetail = require("app.ui.PopupSkillDetail").new(skillShowList)
	PopupSkillDetail:openWithAction()
end
return PetDetailSkillCell