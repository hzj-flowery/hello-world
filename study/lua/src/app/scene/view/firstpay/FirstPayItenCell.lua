
local ListViewCellBase = require("app.ui.ListViewCellBase")
local FirstPayItenCell = class("FirstPayItenCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")

function FirstPayItenCell:ctor()
	self._resourceNode = nil --根节点
	self._nodeCondition = nil--富文本节点
	self._imageReceive = nil--已领取图片
    self._buttonReceive = nil

    self._items = {}
	local resource = {
		file = Path.getCSB("FirstPayItemCell", "firstpay"),
		binding = {
			_buttonReceive = {
				events = {{event = "touch", method = "_onItemClick"}}
			}
		},
	}
	FirstPayItenCell.super.ctor(self, resource)
end

function FirstPayItenCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width+self._resourceNode:getPositionX(), size.height+self._resourceNode:getPositionY())

    self._buttonReceive:switchToNormal()
   
    --self._buttonReceive:setSwallowTouches(false)

    self._items = {self._item01,self._item02,self._item03,self._item04,self._item05}
end

function FirstPayItenCell:_onItemClick(sender,state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
        	local curSelectedPos = self:getTag()
            logWarn("FirstPayItenCell:_onIconClicked  "..curSelectedPos)
            self:dispatchCustomCallback(curSelectedPos)
		end
	end
end


function FirstPayItenCell:_updateButtonState()

    self._buttonReceive:setEnabled(true)

	local firstPayData = G_UserData:getActivityFirstPay()
    if firstPayData:canReceive(self._data.id) then
        self._imageReceive:setVisible(false)
        self._buttonReceive:setVisible(true)
        self._buttonReceive:setString(Lang.get("lang_buy_gift"))
        self._buttonReceive:switchToNormal()
    elseif firstPayData:hasReceive(self._data.id) then
        self._imageReceive:setVisible(true)
	    self._buttonReceive:setVisible(false)
    else
        self._imageReceive:setVisible(false)
	    self._buttonReceive:setVisible(true)
		self._buttonReceive:setString(Lang.get("lang_vip_gift_pkg_go_recharge"))
        self._buttonReceive:switchToHightLight()
    end 
end


function FirstPayItenCell:updateUI(data)
    self._data = data
    self:_updateButtonState()
    
	local itemList = UserDataHelper.makeRewards(data,3)
    for i, item in ipairs(self._items ) do
        local itemData = itemList[i]
        if itemData then
            item:setVisible(true)
            item:unInitUI()
            item:initUI(itemData.type, itemData.value, itemData.size)
            item:setTouchEnabled(true)
		    item:showIconEffect()
        else
            item:setVisible(false)
        end
	end

end


return FirstPayItenCell
