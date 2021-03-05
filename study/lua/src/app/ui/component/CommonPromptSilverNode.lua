

local CommonPromptSilverNode = class("CommonPromptSilverNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
    "updateUI",
    "setCount",
    "setCrt",
    "playCrtEffect",
    "getCrtNum",
}

function CommonPromptSilverNode:ctor()
    self._crtNum = 0
end

function CommonPromptSilverNode:_init()
	self._imageRes = ccui.Helper:seekNodeByName(self._target, "Image")
	self._textNum =  ccui.Helper:seekNodeByName(self._target, "Text_num")
	self._textCrt = ccui.Helper:seekNodeByName(self._target, "Text_crt")
    self._resInfo = ccui.Helper:seekNodeByName(self._target, "ResInfo") 
    self._effectNode = ccui.Helper:seekNodeByName(self._target, "effectNode") 

    cc.bind(  self._resInfo, "CommonResourceInfo")
  
end

function CommonPromptSilverNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPromptSilverNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonPromptSilverNode:updateUI(type, value, size)
	type = type or TypeConvertHelper.TYPE_RESOURCE

	local itemParams = TypeConvertHelper.convert(type, value)

	self._itemParams = itemParams
	if itemParams.res_mini then
		self._imageRes:loadTexture(itemParams.res_mini)
	end
	if size then
		self:setCount(size)
	end
	

        --[[
    self._resInfo:updateUI(type, value, size)
    ]]
end

function CommonPromptSilverNode:setCount(count)
   
    if self._textNum then
        self._textNum:setString("X"..tostring(count))
    end
 
end

function CommonPromptSilverNode:getCrtNum()
    return self._crtNum
end

function CommonPromptSilverNode:setCrt(crt)
    self._crtNum = crt
    if self._textCrt and crt > 0 then
        if crt == 1 then
             self._textCrt:setVisible(false)
        else  
             self._textCrt:setVisible(true)     
        end
        self._textCrt:setString("暴击X"..tostring(crt))
        local color = Colors.getCritPromptColor(crt)
        local outlineColor = Colors.getCritPromptColorOutline(crt)

        self:setCountTextColor(color,outlineColor)
        self:setCrtTextColor(color,outlineColor)
    end

      --[[
     self._resInfo:updateCrit(crt)
     ]]  
end

function CommonPromptSilverNode:playCrtEffect ()
    self._effectNode:removeAllChildren()

    if self._crtNum == 2 then
        G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_jubaopen_huangkuang", function() end)
    elseif self._crtNum == 3 then
        G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_jubaopen_huangkuang", function() end)
    elseif self._crtNum == 5 then
        G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_jubaopen_huangkuang", function() end)
    elseif self._crtNum == 10 then
        G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_jubaopen_hongkuang", function() end)
    end
end

function CommonPromptSilverNode:setCountTextColor(textColor,outlineColor)
	self._textNum:setColor(textColor)
    --self._textNum:enableOutline(outlineColor, 2)

    --self._resInfo:setTextColor(textColor)
end

function CommonPromptSilverNode:setCrtTextColor(textColor,outlineColor)
	self._textCrt:setColor(textColor)
	--self._textCrt:enableOutline(outlineColor, 2)
end



return CommonPromptSilverNode