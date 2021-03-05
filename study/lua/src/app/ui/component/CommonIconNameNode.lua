--CommonIconNameNode
--主要用于 物品Icon，以及附加物品名称显示

local CommonIconNameNode = class("CommonIconNameNode")

local EXPORTED_METHODS = {
	"updateUI",
	"getPanelSize",
	"setCallBack",
	"setItemSelect",
	"getItemId",
	"updateItemNum",
	"setTouchEnabled",
	"showItemBg",
}

--
function CommonIconNameNode:ctor()
	self._target = nil
	self._iconTemplate = nil
	self._iconName = nil	
end

--
function CommonIconNameNode:_init()

    self._panelRoot = ccui.Helper:seekNodeByName(self._target,"Panel_root")
	self._iconTemplate = ccui.Helper:seekNodeByName(self._target,"Icon_template")


	--手动绑定IconTemplate控件
	if cc.isRegister("CommonIconTemplate") then
        cc.bind(self._iconTemplate, "CommonIconTemplate")
    end
    self._imageNameBg = ccui.Helper:seekNodeByName(self._target,"ImageNameBg")
	self._iconName = ccui.Helper:seekNodeByName(self._target,"Icon_name")

	self._panelRoot:addTouchEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelRoot:setSwallowTouches(false)

	--self._panelRoot:setTouchEnabled(false)
end

function CommonIconNameNode:showItemBg(show)
	show = show == nil and true or show
	self._iconTemplate:setImageTemplateVisible(show)
end


function CommonIconNameNode:setTouchEnabled(needEnabled)
	self._iconTemplate:setTouchEnabled(needEnabled)
end
--
function CommonIconNameNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

--
function CommonIconNameNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--

function CommonIconNameNode:updateUI(iconType, iconValue, iconCount)
	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(iconType, iconValue, iconCount)
	self._iconTemplate:setTouchEnabled(false)

	local type = self._iconTemplate:getType()

	local itemParams = self._iconTemplate:getItemParams()

	if itemParams then
		self._iconName:setFontName(Path.getCommonFont())
		self._iconName:setString(itemParams.name)
		self._iconName:setColor(itemParams.icon_color)
		local UIHelper  = require("yoka.utils.UIHelper")
		UIHelper.updateTextOutline(self._iconName, itemParams)
		-- if type == 7 then
		-- 	local outlineColor = itemParams.icon_color_outline
		-- 	self._iconName:enableOutline(cc.c4b(outlineColor.r, outlineColor.g, outlineColor.b, outlineColor.a))
		-- end
		if self._imageNameBg then
			local size = self._iconName:getVirtualRendererSize()
			if size.width > 88 then
				self._imageNameBg:setContentSize(cc.size(96, 52)) --2行的尺寸
			end
		end
	end
end

function CommonIconNameNode:getPanelSize()
	if self._panelRoot then
		return self._panelRoot:getContentSize()
	end
	return nil
end



function CommonIconNameNode:setItemSelect(needSelect)
	if self._iconTemplate:isInit() == true then
		self._iconTemplate:setIconSelect(needSelect)
	end
	
end



function CommonIconNameNode:setCallBack(callback)
	-- 事件响应
    if callback then
		self._callback = callback
	end
end

function CommonIconNameNode:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击

	if(state == ccui.TouchEventType.ended)then
		local itemParams = self._iconTemplate:getItemParams()
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self, itemParams.cfg.id)
			end
		end
	end

end

function CommonIconNameNode:getTag()
	return self._target:getTag()
end

function CommonIconNameNode:getItemId()
	if  self._iconTemplate:isInit() then
		local itemParams = self._iconTemplate:getItemParams()
		if itemParams then
			return itemParams.cfg.id
		end
	end
	return 0
end


function CommonIconNameNode:updateItemNum(num)
	if  self._iconTemplate:isInit() then
		logWarn(" CommonIconNameNode:updateItemNum " ..num)
		self._iconTemplate:setCount(num)
	end
end
return CommonIconNameNode