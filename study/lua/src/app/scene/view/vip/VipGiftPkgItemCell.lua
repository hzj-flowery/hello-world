
local ListViewCellBase = require("app.ui.ListViewCellBase")
local VipGiftPkgItemCell = class("VipGiftPkgItemCell", ListViewCellBase)

function VipGiftPkgItemCell:ctor()
	self._resourceNode = nil --根节点
	self._nodeCondition = nil--富文本节点
	self._imageReceive = nil--已领取图片
    self._buttonReceive = nil

    
	local resource = {
		file = Path.getCSB("VipGiftPkgItemCell", "vip"),
		binding = {
			_buttonReceive = {
				events = {{event = "touch", method = "_onItemClick"}}
			}
		},
	}
	VipGiftPkgItemCell.super.ctor(self, resource)
end

function VipGiftPkgItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._buttonReceive:switchToNormal()
    self._buttonReceive:setString(Lang.get("lang_activity_fund_receive"))
    --self._buttonReceive:setSwallowTouches(false)


    self._itemList:setListViewSize(536,98)
    self._itemList:setItemSpacing(6)
end

function VipGiftPkgItemCell:_onItemClick(sender,state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
        	local curSelectedPos = self:getTag()
            logWarn("VipGiftPkgItemCell:_onIconClicked  "..curSelectedPos)
            self:dispatchCustomCallback(curSelectedPos)
		end
	end
end

--创建领取条件富文本
function VipGiftPkgItemCell:_createConditionRichText(richText)
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeCondition:removeAllChildren()
    self._nodeCondition:addChild(widget)
end

function VipGiftPkgItemCell:updateUI(vipItemData)
    self._vipItemData = vipItemData
    local vipLevel = vipItemData:getId()

 

    self._vipNode:setString(tostring(vipLevel))
    self:_updateVipButtonState()
    
    

	local itemList = vipItemData:getVipGiftList()

    self._itemList:updateUI(itemList,1)
--[[
    for i, item in ipairs(self._items) do
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
    
]]

    local currentVipExp = G_UserData:getVip():getExp()
    local currentVipTotalExp = G_UserData:getVip():getCurVipTotalExp()

    local max =  G_UserData:getVip():getVipTotalExp(0,vipLevel)
    --[[]
    if vipLevel - 1 >= 0 then
        local VipLevelInfo = require("app.config.vip_level")
        local preLevelInfo = VipLevelInfo.indexOf(vipLevel-1+1)
        assert(preLevelInfo, "vip_level can not find id "..tostring(vipLevel-1))
        max = preLevelInfo.vip_exp    
    end
]]
    local exp = math.min(currentVipTotalExp,max)
    
    local richText = Lang.get("lang_vip_gift_pkg_progress",
            {
                progress =  math.floor(exp/10),
                max = math.floor(max/10),
                titleColor = Colors.colorToNumber(exp < max and Colors.BRIGHT_BG_TWO or Colors.BRIGHT_BG_GREEN ),
                progressColor =  Colors.colorToNumber(Colors.BRIGHT_BG_GREEN), 
                maxColor = Colors.colorToNumber(exp < max and Colors.BRIGHT_BG_TWO or Colors.BRIGHT_BG_GREEN )
            })
    self:_createConditionRichText(richText)       
end

function VipGiftPkgItemCell:_updateVipButtonState()
	local currVipLevel = self._vipItemData:getId()
	local playerVipLevel = G_UserData:getVip():getLevel()
	
	if currVipLevel > playerVipLevel then	
        self._nodeCondition:setVisible(true)
        self._imageReceive:setVisible(false)
	    self._buttonReceive:setVisible(true)
		self._buttonReceive:setString(Lang.get("lang_vip_gift_pkg_go_recharge"))
        self._buttonReceive:switchToHightLight()
		return
	else
		if G_UserData:getVip():isVipRewardTake(currVipLevel) then
            self._nodeCondition:setVisible(false)
            self._imageReceive:setVisible(true)
			self._buttonReceive:setVisible(false)
			return
		end
	end
    self._nodeCondition:setVisible(true)
    self._imageReceive:setVisible(false)
	self._buttonReceive:setVisible(true)
	self._buttonReceive:setString(Lang.get("lang_buy_gift"))
    self._buttonReceive:switchToNormal()
end


return VipGiftPkgItemCell
