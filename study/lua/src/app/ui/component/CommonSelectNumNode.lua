local CommonIconNameNode = class("CommonIconNameNode")

local EXPORTED_METHODS = {
	"updateAmount",
	"getAmount",
	"setTextDesc",
    "setMaxLimit",
    "setMaxLimitEx",
	"setCallBack",
	"setAmount",
	"showButtonMax",
    "getMaxLimit",
    "updateIncrement",
}

--
function CommonIconNameNode:ctor()
	self._target = nil
	self._button = nil
	self._seleclCallBack = nil

	self._composeCount = 0
	self._maxLimit = 999
	
end

function CommonIconNameNode:getMaxLimit()
	return self._maxLimit
end
--
function CommonIconNameNode:_init()
	self._textBatchUse = ccui.Helper:seekNodeByName(self._target,"Text_batch_use")
	self._btnSub10 = ccui.Helper:seekNodeByName(self._target,"Button_sub10")
	self._btnSub1 = ccui.Helper:seekNodeByName(self._target,"Button_sub1")
	self._btnAdd10 = ccui.Helper:seekNodeByName(self._target,"Button_add10")
	self._btnMax = ccui.Helper:seekNodeByName(self._target,"Button_max")
	self._btnAdd1 = ccui.Helper:seekNodeByName(self._target,"Button_add1")
	self._textAmount = ccui.Helper:seekNodeByName(self._target, "Text_amount")

	self:updateAmount(0)

	local function callBack(isAdd)
		if self._seleclCallBack then
			self._seleclCallBack(self._composeCount, isAdd)
		end
	end
	self._target:updateButton("Button_sub10", function()
        self:updateAmount(-10)
		callBack(false)
    end, -500)
    self._target:updateButton("Button_sub1", function()
        self:updateAmount(-1)
		callBack(false)
    end, -500)
    self._target:updateButton("Button_add10", function()
        self:updateAmount(10)
		callBack(true)
    end, -500)

	self._target:updateButton("Button_max", function()
        self:updateAmount(self._maxLimit)
		callBack(true)
    end, -500)

    self._target:updateButton("Button_add1", function()
        self:updateAmount(1)
		callBack(true)
    end, -500)

	self:showButtonMax(false)
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
function CommonIconNameNode:setCallBack(func)
	if func and type(func) == "function" then
		self._seleclCallBack = func 
	end
end

function CommonIconNameNode:setMaxLimit(max)
	if max > 999 then
		max = 999
	end
	self._maxLimit = max or 999
end

function CommonIconNameNode:setMaxLimitEx(max)
	self._maxLimit = max
end

function CommonIconNameNode:updateAmount(num)
	--dump( self._composeCount )
	local addNum = self._composeCount + num

	self:setAmount(addNum)
end

function CommonIconNameNode:getAmount()
	return self._composeCount
end

function CommonIconNameNode:setAmount(num)
	self._composeCount = num
	
	if self._composeCount >= self._maxLimit then
		self._composeCount = self._maxLimit
	end
	if self._composeCount <= 0 then
		self._composeCount = 1
	end
	self._textAmount:setString(""..self._composeCount)
end


function CommonIconNameNode:setTextDesc(desc)
	if self._textBatchUse then
		self._textBatchUse:setString(desc)
		self._textBatchUse:setVisible(true)
	end
end

function CommonIconNameNode:showButtonMax(needShow)
	if needShow then
		self._btnMax:setVisible(true)
		self._btnAdd10:setVisible(false)
	else
		self._btnMax:setVisible(false)
		self._btnAdd10:setVisible(true)
	end
end

function CommonIconNameNode:_updateAmount( ... )
    -- body
    local function callBack(isAdd)
        if self._seleclCallBack then
            self._seleclCallBack(self._composeCount, isAdd)
        end
    end
    self._target:updateButton("Button_sub10", function()
        self:updateAmount(-100)
        callBack(false)
    end, -500)

    self._target:updateButton("Button_add10", function()
        self:updateAmount(100)
        callBack(true)
    end, -500)

    self._target:updateButton("Button_max", function()
        self:updateAmount(self._maxLimit)
        callBack(true)
    end, -500)
end

function CommonIconNameNode:updateIncrement(num)
    -- body
    local iconSub = self._btnSub10:getChildByName("Image_1")
    local iconAdd = self._btnAdd10:getChildByName("Image_1")
    if iconSub and iconAdd then
        if rawequal(num, 100) then
            iconSub:loadTexture(Path.getUICommon("img_com_btn_minus03"))
            iconAdd:loadTexture(Path.getUICommon("img_com_btn_minus04"))
            self:_updateAmount()
        end
    end
end

return CommonIconNameNode