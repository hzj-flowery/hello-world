--弹出界面
--合击将礼包
local PopupBase = require("app.ui.PopupBase")
local PopupComboHeroGift = class("PopupComboHeroGift", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupComboHeroGift:ctor( callback )

	self._callback = callback

	self._commonBtn =nil
	--
	local resource = {
		file = Path.getCSB("PopupComboHeroGift", "common"),
	}
    self:setName("PopupComboHeroGift")
	PopupComboHeroGift.super.ctor(self, resource, false, false)
end

function PopupComboHeroGift:onShowFinish()
		
	
end

--
function PopupComboHeroGift:onCreate()
	-- button
	self._commonBtn:setString(Lang.get("common_btn_know"))
	self._commonBtn:addClickEventListenerEx(handler(self,self._onGoLook))

end

function PopupComboHeroGift:_onGoLook( ... )
	if self._callback then
		self._callback()
	end
	self:close()
end

function PopupComboHeroGift:_onInit()
end


function PopupComboHeroGift:onEnter()
    self:play()
  	
end

function PopupComboHeroGift:onExit()

end


function PopupComboHeroGift:_createActionNode(effect)
    if effect == "button" then
		local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
		btn:setString(Lang.get("common_btn_go_look"))
		btn:addClickEventListenerEx(handler(self,self._onGoLook))
		btn:setButtonName("_commonBtn")
        return btn 
	end
end

function PopupComboHeroGift:play()
  
    local function effectFunction(effect)
        if effect == "effect_hejilibao_box"then
            local subEffect = EffectGfxNode.new("effect_hejilibao_box")
            subEffect:play()
            return subEffect
        elseif effect == "effect_wujiangtupo_xiaoxing" then
            local subEffect = EffectGfxNode.new("effect_wujiangtupo_xiaoxing")
            subEffect:play()
            return subEffect
        elseif effect == "effect_hejilibao_fasanguang" then
            local subEffect = EffectGfxNode.new("effect_hejilibao_fasanguang")
            subEffect:play()
            return subEffect
        elseif effect == "effect_txt_bg" then
            local subEffect = EffectGfxNode.new("effect_txt_bg")
            subEffect:play()
            return subEffect
        elseif effect == "effect_bg5" then
            local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg4" then
            local subEffect = EffectGfxNode.new("effect_bg4")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg3" then
            local subEffect = EffectGfxNode.new("effect_bg3")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg2" then
            local subEffect = EffectGfxNode.new("effect_bg2")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg1" then
            local subEffect = EffectGfxNode.new("effect_bg1")
            subEffect:play()
            return subEffect
		elseif effect == "effect_hejilibao_dazi" then
            local subEffect = EffectGfxNode.new("effect_hejilibao_dazi")
            subEffect:play()
            return subEffect
		elseif effect == "effect_hejilibao_xiaodi" then
            local subEffect = EffectGfxNode.new("effect_hejilibao_xiaodi")
            subEffect:play()
            return subEffect
		elseif effect == "effect_win_2" then
            local subEffect = EffectGfxNode.new("effect_win_2")
            subEffect:play()
            return subEffect
		elseif effect == "hejijihuo_gongxi" then
            local params1 ={
				name = "label1",
				text =  Lang.get("common_gift_hejijiang1"),
				fontSize = 22,
				color = Colors.SYSTEM_TIP,
				outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			}
            local params2 ={
				name = "label2",
				text = Lang.get("common_gift_hejijiang2"),
				fontSize = 22,
				color =Colors.getColor(4) ,
				outlineColor = Colors.getColorOutline(4),
			}
			local label = UIHelper.createTwoLabel(params1,params2)
			return label
		elseif effect == "effect_xiujiang_heidi" then
            local subEffect = cc.Node:create()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end

    local function eventFunction(event)
        if event == "finish" then
            self._isAction = false
			logWarn("PopupComboHeroGift:play")
			
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
        end
    end

    local effect = G_EffectGfxMgr:createPlayMovingGfx( self:getResourceNode(), "moving_hejilibao", effectFunction, eventFunction , false )
    local size = self:getResourceNode():getContentSize()  
    effect:setPosition(0, 0)
end

return PopupComboHeroGift