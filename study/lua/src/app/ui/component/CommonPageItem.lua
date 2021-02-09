
-- Author: hedili
-- Date:2017-10-18 15:24:46
-- Describle：用于武将，装备， 宝物等翻页功能

local CommonPageItem = class("CommonPageItem", ViewBase)

local EXPORTED_METHODS = {
    "setUserData",
	"setCallBack",
	"getPageSize",
	"updateSelectById",
	"getPageItems",
	"getSelectedPos",
	"setCurPage",
	"setTouchEnabled",
}


function CommonPageItem:ctor()

	self._selectedPos = 0
	self._updateCallBack = nil
	self._dataList = {}
	self._dataCount = 0
end

-- Describle：
function CommonPageItem:_init()
	self._buttonRight = ccui.Helper:seekNodeByName(self._target, "Button_Right")
	self._buttonLeft = ccui.Helper:seekNodeByName(self._target, "Button_Left")
	self._pageView = ccui.Helper:seekNodeByName(self._target, "Page_View")

	
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageView:addTouchEventListener(handler(self,self._onPageTouch))
    self._pageViewSize = self._pageView:getContentSize()


	self._buttonRight:addClickEventListenerEx(handler(self,self._onButtonRightClicked))
	self._buttonLeft:addClickEventListenerEx(handler(self,self._onButtonLeftClicked))
end

function CommonPageItem:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPageItem:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPageItem:updateSelectById(itemId)

end
function CommonPageItem:setUserData(userData,selectPos)

	self._dataList = userData
	self._dataCount = #userData

	if self._dataCount > 0 then
		 self:_initPageView()
	end


	self._selectedPos = selectPos
	self:_updatePageItem()
	self:_updateArrowBtn()
    self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function CommonPageItem:setCallBack( params )
	-- body
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	if type(params) == "function" then
		self._updateCallBack = params
	end
	if type(params) == "number" then
		if params == TypeConvertHelper.TYPE_HERO then
			self._updateCallBack = self._updateHeroAvatar
		end
	end
end
--只创建widget，减少开始的加载量
function CommonPageItem:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function CommonPageItem:_updateHeroAvatar(widget, index)
	if index <= 0 then
		return
	end
	
	local cfgData = self._dataList[index]
	if cfgData == nil then
		return
	end
	local CSHelper = require("yoka.utils.CSHelper")
	local heroBaseId = cfgData.id
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
	avatar:updateUI(heroBaseId)
	avatar:setScale(1.4)
	avatar:setPosition(cc.p(self._pageViewSize.width / 2, 100))
	widget:addChild(avatar)
end


function CommonPageItem:_updatePageItem()
	local index = self._selectedPos
	for i = index-1, index+1 do
		local widget = self._pageItems[i]
		if widget then --如果当前位置左右没有加Avatar，加上
			if self._updateCallBack and type(self._updateCallBack) == "function" then
				self._updateCallBack(self, widget, i, self._selectedPos)
			end
		end
	end
	self:_showNearItem(false)
end

function CommonPageItem:_initPageView()
	self._pageItems = {}
	self._pageView:removeAllPages()
    for i = 1, self._dataCount do
    	local item = self:_createPageItem()
        self._pageView:addPage(item)
        table.insert(self._pageItems, item)
    end
    

end


function CommonPageItem:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._dataCount)
end

function CommonPageItem:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function CommonPageItem:_onButtonRightClicked()
	if self._selectedPos >= self._dataCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	--G_UserData:getHero():setCurHeroId(curHeroId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end



function CommonPageItem:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		self:_showNearItem(true)
		return true
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		-- self:_showNearItem(false)
	end
end

function CommonPageItem:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			self:_updateArrowBtn()
			self:_updateInfo()
			self:_updatePageItem()
		end
	end
end

--显示临近的两个item
function CommonPageItem:_showNearItem(show)
	local index = self._selectedPos
	local curItem = self._pageItems[index]
	local leftItem = self._pageItems[index-1]
	local rightItem = self._pageItems[index+1]
	if curItem then
		curItem:setVisible(true)
	end
	if leftItem then
		leftItem:setVisible(show)
	end
	if rightItem then
		rightItem:setVisible(show)
	end
end

function CommonPageItem:_updateInfo()

end

function CommonPageItem:getPageSize()
	return self._pageViewSize
end

function CommonPageItem:getPageItems()
	return self._pageItems
end

function CommonPageItem:getSelectedPos()
	return self._selectedPos
end

function CommonPageItem:setCurPage(selectedPos)
	self._selectedPos = selectedPos
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function CommonPageItem:setTouchEnabled(enabled)
	self._pageView:setTouchEnabled(enabled)
end

return CommonPageItem