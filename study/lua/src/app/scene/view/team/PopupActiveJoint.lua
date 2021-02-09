--
-- Author: Liangxu
-- Date: 2017-08-02 16:40:09
-- 合击激活弹框
local PopupBase = require("app.ui.PopupBase")
local PopupActiveJoint = class("PopupActiveJoint", PopupBase)
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function PopupActiveJoint:ctor(parentView, heroUnitData)
    self._parentView = parentView
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("PopupActiveJoint", "team"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClickTouch"}},
			}
		}
	}
	self:setName("PopupActiveJoint")
	PopupActiveJoint.super.ctor(self, resource, false, false)
end

function PopupActiveJoint:onCreate()
	
end

function PopupActiveJoint:onEnter()
	self._canContinue = false
	self:_updateInfo()
	self._nodeContinue:setVisible(false)
	self:_playEffect()
end

function PopupActiveJoint:onExit()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupActiveJoint:onExit")
end

function PopupActiveJoint:_onClickTouch()
	if self._canContinue then
        if self._parentView and self._parentView.onExitPopupActiveJoint then
            self._parentView:onExitPopupActiveJoint()
        end
		self:close()
	end
end

function PopupActiveJoint:_updateInfo()
	local heroConfig = self._heroUnitData:getConfig()
	local baseId = self._heroUnitData:getBase_id()
	local jointType = heroConfig.skill_3_type
	local jointHeroId = heroConfig.skill_3_partner
	self._heroId1 = jointType == 1 and baseId or jointHeroId --主将id
	self._heroId2 = jointType == 1 and jointHeroId or baseId

    local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	local heroRankConfig = HeroDataHelper.getHeroRankConfig(self._heroId1, 0, limitLevel, limitRedLevel)
    if heroRankConfig == nil then
        heroRankConfig = HeroDataHelper.getHeroRankConfig(self._heroId1, 0, 0, 0) --有的武将没配界限，就先传0
    end
	self._iconRes = nil
	self._contentDes = nil
	local skillId = heroRankConfig.rank_skill_3
	if skillId > 0 then
		local skillActiveConfig = require("app.config.hero_skill_active").get(skillId)
		assert(skillActiveConfig, string.format("hero_skill_active config can not find id = %d", skillId))

		self._iconRes = skillActiveConfig.skill_icon
		local name = skillActiveConfig.name
		local des = skillActiveConfig.description
		self._contentDes = Lang.get("team_joint_active_des", {
			name = name,
			des = des,
		})
	end
end

function PopupActiveJoint:_playEffect()
	local function effectFunction(effect)
        if effect == "effect_hejijihuo_jiahao" then
            local subEffect = EffectGfxNode.new("effect_hejijihuo_jiahao")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_bg5" then
        	local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_txt_bg" then
    		local subEffect = EffectGfxNode.new("effect_txt_bg")
            subEffect:play()
            return subEffect
    	end

		if effect == "effect_hejijihuo_dazi" then
    		local subEffect = EffectGfxNode.new("effect_hejijihuo_dazi")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_win_2" then
    		local subEffect = EffectGfxNode.new("effect_win_2")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_bg4" then
    		local subEffect = EffectGfxNode.new("effect_bg4")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_bg3" then
    		local subEffect = EffectGfxNode.new("effect_bg3")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_bg2" then
    		local subEffect = EffectGfxNode.new("effect_bg2")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_bg1" then
    		local subEffect = EffectGfxNode.new("effect_bg1")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_hejijihuo_gongxi" then
    		local subEffect = EffectGfxNode.new("effect_hejijihuo_gongxi")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_bejilibao_allbg" then
    		local subEffect = EffectGfxNode.new("effect_bejilibao_allbg")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_xiujiang_heidi" then
            local subEffect = cc.Node:create()
            return subEffect
    	end

        return self:_createActionNode(effect)
    end

    local function eventFunction(event)
    	if event == "finish" then
        	self._nodeContinue:setVisible(true)
        	self._canContinue = true
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN,"PopupActiveJoint")
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_hejijihuo", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(0, 0))
end

function PopupActiveJoint:_createIconNode1()
	local function effectFunction(effect)
        if effect == "icon_1" then
            local icon1 = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))
			icon1:updateUI(self._heroId1)
			return icon1
        end

        if effect == "effect_hejilibao_zhujiang" then
            local subEffect = EffectGfxNode.new("effect_hejilibao_zhujiang")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_hejijihuo_faguangkuang" then
            local subEffect = EffectGfxNode.new("effect_hejijihuo_faguangkuang")
            subEffect:play()
            return subEffect
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_hejijihuo_icon_1", effectFunction, eventFunction , false)
    return node
end

function PopupActiveJoint:_createIconNode2()
	local function effectFunction(effect)
        if effect == "icon_2" then
            local icon2 = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))
			icon2:updateUI(self._heroId2)
			return icon2
        end

        if effect == "effect_hejijihuo_faguangkuang" then
            local subEffect = EffectGfxNode.new("effect_hejijihuo_faguangkuang")
            subEffect:play()
            return subEffect
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_hejijihuo_icon_2", effectFunction, eventFunction , false)
    return node
end

function PopupActiveJoint:_createShouMingNode()
	local function effectFunction(effect)
        if effect == "shuoming" then
            local desNode = CSHelper.loadResourceNode(Path.getCSB("ActiveJointDesNode", "team"))
            local imageSkillIcon = ccui.Helper:seekNodeByName(desNode, "ImageSkillIcon")
            local nodeDesPos = ccui.Helper:seekNodeByName(desNode, "NodeDesPos")

            if self._iconRes then
            	imageSkillIcon:loadTexture(Path.getCommonIcon("skill", self._iconRes))
            end

            if self._contentDes then
            	local richText = ccui.RichText:createWithContent(self._contentDes)
				richText:setAnchorPoint(cc.p(0, 1))
				richText:ignoreContentAdaptWithSize(false)
				richText:setContentSize(cc.size(430, 0))
				nodeDesPos:addChild(richText)
            end
			return desNode
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_hejijihuo_shuoming", effectFunction, eventFunction , false)
    return node
end

function PopupActiveJoint:_createActionNode(effect)
	if effect == "moving_hejijihuo_icon_1" then
		local node = self:_createIconNode1()
    	return node
	end

	if effect == "moving_hejijihuo_icon_2" then
		local node = self:_createIconNode2()
    	return node
	end

	if effect == "txt" then

	end

	if effect == "moving_hejijihuo_shuoming" then
		local node = self:_createShouMingNode()
		return node
	end

	return cc.Node:create()
end

return PopupActiveJoint