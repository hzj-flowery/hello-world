-- 技能详情弹框
-- Author: Liangxu
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupSkillDes = class("PopupSkillDes", PopupBase)

function PopupSkillDes:ctor(fromNode, skillId, baseId, starLevel)
	self._fromNode = fromNode
	self._skillId = skillId
	self._baseId = baseId
	self._starLevel = starLevel
	local resource = {
		file = Path.getCSB("PopupSkillDes", "common"),
		binding = {
			
		}
	}
	PopupSkillDes.super.ctor(self, resource, false, true)
end

function PopupSkillDes:onCreate()
	self._label = nil
	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
end

function PopupSkillDes:onEnter()
	self:_updateView()
end

function PopupSkillDes:onExit()
	
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupSkillDes:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupSkillDes:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function PopupSkillDes:_updateView()
	self._nodeIcon:updateUI(self._skillId)
	local config = require("app.config.hero_skill_active").get(self._skillId)
	assert(config, string.format("hero_skill_active config can not find id = %d", self._skillId))
	
	self._textName:setString("【"..config.name.."】")
	if self._label == nil then
		self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 22)
		self._label:setAnchorPoint(cc.p(0, 1))
		self._label:setColor(Colors.DARK_BG_ONE)
		self._label:setWidth(370)
		self._desNode:addChild(self._label)
	end

	local pendingSkill = ""
	if self._baseId and self._baseId > 0 then
		local UserDataHelper = require("app.utils.UserDataHelper")
		local petStarCfg = UserDataHelper.getPetStarConfig(self._baseId, self._starLevel )
		if petStarCfg.skill2 == self._skillId then
			pendingSkill = petStarCfg.chance_description
		end
	end

	self._label:setString(config.description..pendingSkill)

	local txtHeight = self._label:getContentSize().height
	local panelHeight = 132
	if txtHeight > 132 - 60 then
		panelHeight = 60 + txtHeight
		self._nodeIcon:setPositionY(panelHeight - 55)
		self._textName:setPositionY(panelHeight - 14)
		self._desNode:setPositionY(panelHeight - 49)
		local bgSize = self._panelBg:getContentSize()
		self._panelBg:setContentSize(cc.size(bgSize.width, panelHeight))
	end

	--确定位置
	local nodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0,0))
	local nodeSize = self._fromNode:getContentSize()
	local posX = nodePos.x - nodeSize.width / 2 - self._panelBg:getContentSize().width / 2
	local posY = nodePos.y - self._panelBg:getContentSize().height / 2
	local dstPos = self:convertToNodeSpace(cc.p(posX, posY))
	self._panelBg:setPosition(dstPos)
end

function PopupSkillDes:_onClick()
	self:close()
end

return PopupSkillDes