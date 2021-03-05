local PopupBase = require("app.ui.PopupBase")
local PopupSecretView = class("PopupSecretView", PopupBase)

function PopupSecretView:ctor(callback, selectedIndex)
	self._callback = callback
	self._currSelectIndex = selectedIndex or 0
	self._pageDataList = {}
	local resource = {
		file = Path.getCSB("PopupSecretView", "login"),
		binding = {
			_btnAgree = {
				events = {{event = "touch", method = "onButtonAgree"}}
			},
			_btnCancle = {
				events = {{event = "touch", method = "onButtonCancle"}}
			}
		}
	}
	PopupSecretView.super.ctor(self, resource,nil,false)


end

function PopupSecretView:onCreate()
    --_listViewWords
	self:initListViewWords()
	
	self:_initTab()
end

function PopupSecretView:onEnter()

end

function PopupSecretView:onExit()

end

function PopupSecretView:_initTab()

	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = 2,
		textList = {Lang.get("secretview_title1"), Lang.get("secretview_title2")},
		isSwallow = true,
	}

	self._tabGourp:setCustomColor({
		{cc.c3b(0x57, 0x55, 0x55)},
		{cc.c3b(0x57, 0x55, 0x55)}
	})

	self._tabGourp:recreateTabs(param)

	if self._currSelectIndex and self._currSelectIndex > 0 then
		self._tabGourp:setTabIndex(self._currSelectIndex)
	end
end

function PopupSecretView:initListViewWords()

	-- 账户通行证协议
	--self._strQianYan = "前言："
    self._strAccountWords = cc.FileUtils:getInstance():getStringFromFile("res/secret/AccountAgreement.txt")
	self._strAccountWords1 = cc.FileUtils:getInstance():getStringFromFile("res/secret/AccountAgreement1.txt")

    if  self._listViewWords then
    	self._listViewWords:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self._listViewWords:setCustomCallback(handler(self, self._onItemTouch))

    	--创建前言文字
    	-- local layoutQianYan = ccui.Layout:create()
    	-- local labelQianYan = cc.Label:createWithTTF(self._strQianYan,Path.getCommonFont(),15)
    	-- layoutQianYan:setContentSize(labelQianYan:getContentSize())
    	-- labelQianYan:setColor(Colors.COLOR_SECRET_QIANYAN)
    	-- labelQianYan:setAnchorPoint(cc.p(0, 0))
    	-- layoutQianYan:addChild(labelQianYan)    	
    	-- self._listViewWords:pushBackCustomItem(layoutQianYan)


    	--创建隐私文字
		-- local layoutSecretWords = ccui.Layout:create()
        dump(self._strAccountWords)

        -- local layoutSecretWords = cc.Node:create()
    	-- local labelSecretWords = cc.Label:createWithTTF(self._strAccountWords,Path.getCommonFont(),16)
    	-- labelSecretWords:setWidth(self._listViewWords:getContentSize().width)
    	-- layoutSecretWords:setContentSize(labelSecretWords:getContentSize())    	
    	-- labelSecretWords:setColor(Colors.COLOR_SECRET_WORDS)
    	-- labelSecretWords:setAnchorPoint(cc.p(0, 0))
    	-- layoutSecretWords:addChild(labelSecretWords)
    	
		-- self._listViewWords:pushBackCustomItem(layoutSecretWords)
		
		-- self._listViewWords:setVisible(true)
		
		local inner = self._listViewWords:getInnerContainer()
        inner:removeAllChildren()

		local labelSecretWords1 = cc.Label:createWithTTF(self._strAccountWords1, Path.getCommonFont(), 16)
        labelSecretWords1:setWidth(inner:getContentSize().width)
        labelSecretWords1:setColor(Colors.COLOR_SECRET_WORDS)
		labelSecretWords1:setAnchorPoint(cc.p(0, 0))
		labelSecretWords1:setPositionY(0)
		inner:addChild(labelSecretWords1)

        local labelSecretWords = cc.Label:createWithTTF(self._strAccountWords, Path.getCommonFont(), 16)
        labelSecretWords:setWidth(inner:getContentSize().width)
        labelSecretWords:setColor(Colors.COLOR_SECRET_WORDS)
		labelSecretWords:setAnchorPoint(cc.p(0, 0))
		labelSecretWords:setPositionY(labelSecretWords1:getContentSize().height)
		inner:addChild(labelSecretWords)

		local totalSize = cc.size(labelSecretWords:getContentSize().width, labelSecretWords:getContentSize().height + labelSecretWords1:getContentSize().height)
        self._listViewWords:setInnerContainerSize(totalSize)
        self._listViewWords:setVisible(true)
	end

	--隐私协议
	-- self._strQianYan1 = "前言："
    self._strSecretWords = cc.FileUtils:getInstance():getStringFromFile("res/secret/SecretAgreement.txt")
	
	if self._listViewSecret then
		self._listViewSecret:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self._listViewSecret:setCustomCallback(handler(self, self._onItemTouch))

    	--创建前言文字
    	local layoutQianYan = ccui.Layout:create()
    	-- local labelQianYan = cc.Label:createWithTTF(self._strQianYan1,Path.getCommonFont(),15)
    	-- layoutQianYan:setContentSize(labelQianYan:getContentSize())
    	-- labelQianYan:setColor(Colors.COLOR_SECRET_QIANYAN)
    	-- labelQianYan:setAnchorPoint(cc.p(0, 0))
    	-- layoutQianYan:addChild(labelQianYan)    	
    	self._listViewSecret:pushBackCustomItem(layoutQianYan)


    	--创建隐私文字
		local layoutSecretWords = ccui.Layout:create()
		--dump(self._strSecretWords)
    	local labelSecretWords = cc.Label:createWithTTF(self._strSecretWords, Path.getCommonFont(), 16)
    	labelSecretWords:setWidth(self._listViewSecret:getContentSize().width)
    	layoutSecretWords:setContentSize(labelSecretWords:getContentSize())    	
    	labelSecretWords:setColor(Colors.COLOR_SECRET_WORDS)
    	labelSecretWords:setAnchorPoint(cc.p(0, 0))
    	layoutSecretWords:addChild(labelSecretWords)
    	
		self._listViewSecret:pushBackCustomItem(layoutSecretWords)
		
		self._listViewSecret:setVisible(false)
	end
end

function PopupSecretView:_onTabSelect(index, item)
	self._listViewWords:setVisible(index == 1)
	self._listViewSecret:setVisible(index == 2)
end

function PopupSecretView:_onItemUpdate(item, index)
end


function PopupSecretView:_onItemSelected(item, index)
end

function PopupSecretView:_onItemTouch(index, t)
end

-- 点击同意按钮
function PopupSecretView:onButtonAgree()
	
	local AgreementSetting = require("app.data.AgreementSetting")
    AgreementSetting.saveAllAgreementIsCheck(true)

	G_SignalManager:dispatch(SignalConst.EVENT_AGREE_SECRET)

	G_GameAgent:checkAndLoginGame()

	self:close()
end

-- 点击取消按钮
function PopupSecretView:onButtonCancle()
	self:closeWithAction()
end


return PopupSecretView

