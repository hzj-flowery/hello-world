local PopupItemUse = require("app.ui.PopupItemUse")
local PopupItemExchange = class("PopupItemExchange", PopupItemUse)
local UserDataHelper = require("app.utils.UserDataHelper")

function PopupItemExchange:ctor(title, callback )
	self._title = title or Lang.get("common_title_exchange_item") 
	self._callback = callback
	self._costResInfo1 = nil --消耗资源
    self._costResInfo2 = nil --消耗资源
    self._costResInfoList = {}

    self._exchangeItem = nil
    self._consumeItems = nil

	self._useNum  = 1 

	PopupItemExchange.super.ctor(self, title, callback)
end

function PopupItemExchange:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupItemExchange", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end


function PopupItemExchange:onCreate()
    PopupItemExchange.super.onCreate(self)
    self._textResName:setVisible(false)
    self._costResInfoList = {self._costResInfo1,self._costResInfo2}
    for k,v in ipairs(self._costResInfoList) do
        v:setVisible(false)
    end
end


function PopupItemExchange:onEnter()
    
end

function PopupItemExchange:onExit()
    
end

function PopupItemExchange:_onNumSelect(num)
	logDebug("_onNumSelect :"..num)
	self._useNum = num

    if type(self._consumeItems) == "table" and table.nums(self._consumeItems) > 2 then
        self._textResName:setVisible(false)
        return
    end

    self._textResName:setVisible(true)
    for k,v in ipairs(self._costResInfoList) do
        local consumeItem = self._consumeItems[k]
        if consumeItem then
            v:updateUI(consumeItem.type,consumeItem.value,consumeItem.size*num)
            v:setVisible(true)
        else
            v:setVisible(false)   
        end

    end
end


function PopupItemExchange:updateUI(exchangeItem,consumeItems,surplusCount)
	self._exchangeItem = exchangeItem
    self._consumeItems = consumeItems

	PopupItemExchange.super.updateUI(self,exchangeItem.type,exchangeItem.value,exchangeItem.size)

	if surplusCount > 0 then-- 剩余购买次数
		self:setMaxLimit(surplusCount)
	end
	
    local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(exchangeItem.type,exchangeItem.value)
	self:setOwnerCount(itemOwnerNum)


	self:_onNumSelect(self._useNum)

end

function PopupItemExchange:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._exchangeItem,self._consumeItems , self._useNum)
	end
	if not isBreak then
		self:close()
	end
end


return PopupItemExchange