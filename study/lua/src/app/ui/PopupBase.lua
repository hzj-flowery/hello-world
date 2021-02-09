local ViewBase = require("app.ui.ViewBase")
local PopupBase = class("PopupBase", ViewBase)

local PrioritySignal = require("yoka.event.PrioritySignal")

local LAYER_COLOR_PERCENT = 0.8
local function validateModalLayerVisible()
	local runningScene =  G_SceneManager:getRunningScene()
	local rootPopupNode = runningScene:getPopupNode()
	if rootPopupNode ~= nil then
		local childrens = rootPopupNode:getChildren()
		local numChild = #childrens
		local list = {}
		if numChild > 0 then
			for i=1,numChild do
				local modalLayer = childrens[i]
				if modalLayer:getChildByName("popModalLayer") ~=nil and modalLayer:isAllowHide() then
					list[#list + 1] = modalLayer
					modalLayer:setVisible(false)
					logWarn("validateModalLayerVisible not visibled")
				end
			end

			if #list > 0 then
				local topModalLayer = list[#list]
				if topModalLayer ~= nil then
					topModalLayer:setVisible(true)
					logWarn("validateModalLayerVisible visibled")
				end
			end
		end
	end
end
function PopupBase:ctor(resource, isClickOtherClose,isNotCreateShade)
	self._isShowFinish = true
	self._openWithTarget = false
	self._isClickOtherClose = isClickOtherClose == nil and true or isClickOtherClose
	self._isAllowHide = true
	--
	if not isNotCreateShade then
		self._layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*LAYER_COLOR_PERCENT))
		self._layerColor:setAnchorPoint(0.5,0.5)
		self._layerColor:setIgnoreAnchorPointForPosition(false)
		self:addChild(self._layerColor)
		self._layerColor:setTouchEnabled(true)
		self._layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
		self._layerColor:registerScriptTouchHandler(handler(self, self.onTouchHandler))
		self._layerColor:setName("popModalLayer")
	end
	--
	PopupBase.super.ctor(self, resource)

	--
    self.signal = PrioritySignal.new("string")
end

--
function PopupBase:onTouchHandler(event,x,y)
	if event == "began" then
        return true
    elseif event == "ended" then
        -- 必须是动画做完，并且节点还在界面上，才相应
        if self:getNumberOfRunningActions() == 0 then
            if self._isClickOtherClose then
                local rect = self._resourceNode:getBoundingBox()
				if self._isShowFinish == true then
					if not cc.rectContainsPoint(rect, cc.p(x, y)) then
						if self._otherCloseCallback then self._otherCloseCallback() end
						self:closeWithAction()
					end
				end
            end
        end
    end
end

--
function PopupBase:open()
	validateModalLayerVisible()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
	
end

--弹窗放到断线层
function PopupBase:openToOfflineLevel()
	self:setPosition(G_ResolutionManager:getDesignCCPoint())
	G_TopLevelNode:addToOfflineLevel(self)
end

function PopupBase:onClose()

end

--
function PopupBase:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
	validateModalLayerVisible()
end

--
function PopupBase:getOpenAction()
	return cc.Spawn:create(
    	cc.EaseBackOut:create(
			cc.ScaleTo:create(0.3, 1)
    	),
    	cc.FadeIn:create(0.1)
    )
end

--
function PopupBase:getCloseAction()
	return cc.Spawn:create(
	    cc.ScaleTo:create(0.1, 0),
    	cc.FadeOut:create(0.1)
    )
end

--
function PopupBase:openWithAction()
	self:open()
	self._resourceNode:setCascadeOpacityEnabled(true)
	self._resourceNode:setOpacity(0)
	self._resourceNode:setScale(0.5)
	self._isShowFinish = false
	self._resourceNode:runAction(cc.Sequence:create(self:getOpenAction(), cc.CallFunc:create(function()
		self.signal:dispatch("open")
		self._isShowFinish = true
		self:onShowFinish()
	end)))
end

function PopupBase:openWithTarget(target)

	local function onClickShader(x,y)
		local rect = self._resourceNode:getBoundingBox()
		if self._isShowFinish == true then
			if not cc.rectContainsPoint(rect, cc.p(x, y)) then
				if self._layerColor then
					self._layerColor:removeFromParent()
				end
			end
		end
	end
	local function onTouch(event,x,y)
		if event == "began" then
			return true
		elseif event == "ended" then
			-- 必须是动画做完，并且节点还在界面上，才相应
			if self:getNumberOfRunningActions() == 0 then
				onClickShader(x,y)
			end
		end
	end

	local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*LAYER_COLOR_PERCENT))
	layerColor:setAnchorPoint(0.5,0.5)
	layerColor:setIgnoreAnchorPointForPosition(false)
	layerColor:setTouchEnabled(true)
	layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
	layerColor:registerScriptTouchHandler(onTouch)
	layerColor:addChild(self)
	self._layerColor = layerColor
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(layerColor)


	--self._resourceNode:setAnchorPoint(cc.p(0,0))
	self._resourceNode:setCascadeOpacityEnabled(true)
	self._resourceNode:setOpacity(0)
	self._resourceNode:setScale(0.2)
	local UIActionHelper = require("app.utils.UIActionHelper")
  -- 目标位置
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    local position = target and cc.p(target:convertToWorldSpaceAR(cc.p(0, 0))) or cc.p(width*0.5, height*0.5)
	self:setPosition(position)
	-- 弹框动画，要控制获取一下弹框动画
    local action = UIActionHelper.popupAction(position)
	self._resourceNode:runAction(cc.Sequence:create(action, cc.CallFunc:create(function()
		self.signal:dispatch("open")
		self._isShowFinish = true
		self:onShowFinish()
	end)))

	self.close = function()
		self.signal:dispatch("close")
		self._layerColor:removeFromParent()
	end

end

--
function PopupBase:closeWithAction()
	self._resourceNode:runAction(cc.Sequence:create(self:getCloseAction(), cc.CallFunc:create(function()
		self:close()
	end)))
end

function PopupBase:onShowFinish()
	
end

function PopupBase:setShowFinish(showFinish)
	self._isShowFinish = showFinish
end

function PopupBase:isShowFinish()
	return self._isShowFinish
end

function PopupBase:setClickOtherClose(isClickOtherClose)
	self._isClickOtherClose = isClickOtherClose
end

function PopupBase:setClickOtherCloseCallback(otherCloseCallback)
	self._otherCloseCallback = otherCloseCallback
end

function PopupBase:setAllowHide(allowHide)
	self._isAllowHide = allowHide
end

function PopupBase:isAllowHide()
	return self._isAllowHide 
end

return PopupBase