--弹出界面
--奖励弹窗，恭喜获得界面
local PopupBase = require("app.ui.PopupBase")
local PopupNewFunction = class("PopupNewFunction", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")

function PopupNewFunction:ctor(funcId, callback, onShowCall)
	self._funcId = funcId

	local funcLevelInfo = require("app.config.function_level").get(funcId)
    assert(funcLevelInfo, "Invalid function_level can not find funcId "..funcId)

	self._funcInfo = funcLevelInfo
	self._callback = callback
	self._callOnShow = onShowCall
	self._nodeOpenFuncDesc = nil --开启功能描述
	self._textFuncDesc = nil
	self._commonBtn =nil
	self._textFuncName = nil
	self._imgFuncIcon =nil
	--
	local resource = {
		file = Path.getCSB("PopupNewFunction", "common"),
	}
	self:setName("PopupNewFunction")
	PopupNewFunction.super.ctor(self, resource, false, false)
end

function PopupNewFunction:onShowFinish()
	
	if self._callOnShow then
		self._callOnShow()
	end

end

function PopupNewFunction:_updateFuncInfo()

end
--
function PopupNewFunction:onCreate()
	-- button
	--self._commonBtn:setString(Lang.get("common_btn_go_look"))
	--self._commonBtn:addClickEventListenerEx(handler(self,self._onGoLook))
	self:_updateFuncInfo()
end

function PopupNewFunction:_onGoLook( ... )
	if self._callback then
		self._callback()
	end
	self:close()
end

function PopupNewFunction:_onInit()
end


function PopupNewFunction:onEnter()
    self:play()
end

function PopupNewFunction:onExit()

end

function PopupNewFunction:_createActionNode(effect)
	local function effectFunction(effect)
		if effect == "icon_zi" then
			local params1 ={
				name = "label1",
				text = self._funcInfo.name,
				fontSize = 26,
				color = Colors.BUTTON_TWO_NOTE,
				outlineColor = Colors.BUTTON_TWO_NOTE_OUTLINE,
			}
			local label = UIHelper.createLabel(params1)
			return label
		elseif effect == "effect_xingongneng_tubiao_sangceng" then
		    local subEffect = EffectGfxNode.new("effect_xingongneng_tubiao_sangceng")
            subEffect:play()
            return subEffect
		elseif effect == "icon_tubiao" then
		    local sprite = display.newSprite(Path.getCommonIcon("main",self._funcInfo.icon))
        	return sprite
		elseif effect == "effect_xingongneng_tubiao_di" then
		    local subEffect = EffectGfxNode.new("effect_xingongneng_tubiao_di")
            subEffect:play()
            return subEffect
		end

	end
	local function eventFunction(event)

    end

    if effect == "xingongneng_shuoming" then
		local paramList = {
			[1] ={
				name = "label1",
				text = Lang.get("common_txt_open_new_func1"),
				fontSize = 22,
				color = Colors.SYSTEM_TIP,
				outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			},
			[2] ={
				name = "label2",
				text = Lang.get("common_txt_open_new_func2",{ fuc_name = self._funcInfo.name}),
				fontSize = 22,
				color = Colors.CLASS_GREEN,
				outlineColor = Colors.CLASS_GREEN_OUTLINE,
			},
			[3] ={
				name = "label3",
				text = Lang.get("common_txt_open_new_func3"),
				fontSize = 22,
				color = Colors.SYSTEM_TIP,
				outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			},
		}
		local labelNode = UIHelper.createLabels(paramList)
		return labelNode
    elseif effect == "moving_xingongneng_tubiao" then
		local node = cc.Node:create()
	    local effect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_xingongneng_tubiao", effectFunction, eventFunction , false )
		effect:play()
        return node        
    elseif effect == "button" then
		local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
		btn:setString(Lang.get("common_btn_go_look"))
		btn:addClickEventListenerEx(handler(self,self._onGoLook))
		btn:setButtonName("_commonBtn")
        return btn 
	end
end

function PopupNewFunction:play()
	
    local function effectFunction(effect)
        if effect == "effect_bg5"then
            local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        elseif effect == "effect_txt_bg" then
            local subEffect = EffectGfxNode.new("effect_txt_bg")
            subEffect:play()
            return subEffect
        elseif effect == "effect_xingongneng_dazi" then
            local subEffect = EffectGfxNode.new("effect_xingongneng_dazi")
            subEffect:play()
            return subEffect
        elseif effect == "effect_xingongneng_xiaodi" then
            local subEffect = EffectGfxNode.new("effect_xingongneng_xiaodi")
            subEffect:play()
            return subEffect
        elseif effect == "effect_win_2" then
            local subEffect = EffectGfxNode.new("effect_win_2")
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
			logWarn("PopupNewFunction:_createActionNode")
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
        end
    end
	
	G_AudioManager:playSoundWithId(AudioConst.SOUND_NEW_FUNC_OPEN)
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self:getResourceNode(), "moving_xingongneng", effectFunction, eventFunction , false )
    local size = self:getResourceNode():getContentSize()  
    effect:setPosition(0, 0)
end

return PopupNewFunction