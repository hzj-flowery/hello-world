-- @Author panhoa
-- @Date 10.17.2018
-- @Role

local ViewBase = require("app.ui.ViewBase")
local GoldHeroLayer = class("GoldHeroLayer", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function GoldHeroLayer:ctor(heroId, callBack)
    self._heroId = heroId
    self._isPageViewMoving = false
    self._callBack  = callBack

    local resource = {
        file = Path.getCSB("GoldHeroLayer", "gachaDrawGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
            },
        }
	}
	GoldHeroLayer.super.ctor(self, resource)
end

function GoldHeroLayer:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size)
    self:_initSelectedPos(self._heroId)
    self:_initPageView()

    self._buttonLeft:setVisible(false)
    self._buttonRight:setVisible(false)
end

function GoldHeroLayer:onEnter()
    self:_createPageView()
    --self:_updateArrowBtn()
end

function GoldHeroLayer:onExit()
end

function GoldHeroLayer:_initSelectedPos(id)
    self._allHeroIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupId() or {}
    self._selectedPos = table.keyof(self._allHeroIds, id)
    self._heroCount = #self._allHeroIds
end

function GoldHeroLayer:_initPageView( ... )
    self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))
    self._pageViewSize = self._pageView:getContentSize()
end

function GoldHeroLayer:_onPageTouch(sender, state)
    if ccui.TouchEventType.began == state then
        self._isPageViewMoving = true
		self:_updatePageItemVisible()
    elseif ccui.TouchEventType.ended == state or state == ccui.TouchEventType.canceled then
        self._isPageViewMoving = false
    end
end

function GoldHeroLayer:_onPageViewEvent(sender, event)
    if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			--self:_updateArrowBtn()
			self:_updatePageItem()
		end
	end
end

function GoldHeroLayer:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._heroCount)
end

function GoldHeroLayer:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	--self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updatePageItem()
end

function GoldHeroLayer:_onButtonRightClicked()
	if self._selectedPos >= self._heroCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	--self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updatePageItem()
end

function GoldHeroLayer:_createPageView()
    local function createPageItem()
        local widget = ccui.Widget:create()
        widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)
        return widget
    end

	self._pageItems = {}
	self._pageView:removeAllPages()
    for i = 1, self._heroCount do
        local item = createPageItem()
        item:setAnchorPoint(cc.p(0.5, 0.5))
        self._pageView:addPage(item)
        table.insert(self._pageItems, item)
    end
    self:_updatePageItem()
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function GoldHeroLayer:_updatePageItem()
    local index = self._selectedPos
	for i = index-1, index+1 do
		local widget = self._pageItems[i]
		if widget then
			local count = widget:getChildrenCount()
			local heroId = self._allHeroIds[i]
            if count == 0 and heroId > 0 then
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar2", "common"))
                avatar:updateUI(heroId)
                avatar:setAvatarScale(0.7)
                avatar:setPosition(cc.p(self._pageViewSize.width / 2, 112))
                widget:addChild(avatar)                
			end
		end
	end
    self:_updatePageItemVisible()
    if self._callBack then
        self._callBack(self._selectedPos)
    end
end

function GoldHeroLayer:_updatePageItemVisible()
    for i, item in ipairs(self._pageItems) do
		if i == self._selectedPos then
			item:setVisible(true)
		else
			item:setVisible(self._isPageViewMoving)
		end
	end
end



return GoldHeroLayer