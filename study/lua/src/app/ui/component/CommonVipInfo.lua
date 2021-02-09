
local CommonVipInfo = class("CommonVipInfo")

local EXPORTED_METHODS = {
    "setProgress",
    "updateVip",
}

function CommonVipInfo:ctor()
	self._target = nil
	 self._totalGoldRichText = nil
end

function CommonVipInfo:_init()
	self._loadingBar = ccui.Helper:seekNodeByName(self._target, "LoadingBar")
	self._textProgress = ccui.Helper:seekNodeByName(self._target, "Text_progress")
    self._atlasLabel1 = ccui.Helper:seekNodeByName(self._target, "AtlasLabel_1")
    self._atlasLabel2 = ccui.Helper:seekNodeByName(self._target, "AtlasLabel_2")
    self._nodeRich = ccui.Helper:seekNodeByName(self._target, "Node_Rich")
    self._imageVip2 = ccui.Helper:seekNodeByName(self._target, "Image_VIP_2")
end

function CommonVipInfo:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonVipInfo:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonVipInfo:setProgress(value,total)
    self._loadingBar:setPercent(value / total * 100)
	self._textProgress:setString(value.."/"..total)
end

function CommonVipInfo:updateInfo()
    local currentVipLv = G_UserData:getVip():getLevel()
    local maxVipLv = G_UserData:getVip():getShowMaxLevel()
    local nextVipLv = currentVipLv == maxVipLv and maxVipLv or currentVipLv + 1
    self:updateVip(currentVipLv,nextVipLv)
end

function CommonVipInfo:updateVip(minVip,maxVip)
    self._atlasLabel1:setString(tostring(minVip))
    self._atlasLabel2:setString(tostring(maxVip))

    local totalExp =  G_UserData:getVip():getVipTotalExp(minVip,maxVip)
    local currentVipExp = G_UserData:getVip():getExp()
    local gold = totalExp - currentVipExp

    self:setProgress(currentVipExp,totalExp)
    self:_refreshNeedGoldView(gold)

    self:_adjustPos()
end

function CommonVipInfo:_refreshNeedGoldView(gold,txtName)
    local txt = Lang.get(txtName or "lang_activity_fund_vip_recharge",{value = gold})
    if  self._totalGoldRichText then
		self._totalGoldRichText:removeFromParent()
	end
	self._totalGoldRichText = ccui.RichText:createWithContent(txt)
	self._totalGoldRichText:setAnchorPoint(cc.p(0,0.5))
    self._totalGoldRichText:formatText()
	self._nodeRich:addChild(self._totalGoldRichText )
end

function CommonVipInfo:_adjustPos()
    local richTextSize = self._totalGoldRichText:getContentSize()
    local labelSize01 = self._atlasLabel1:getContentSize()
    local startX = self._atlasLabel1:getPositionX()
    

    local richTextPosX = startX + labelSize01.width + 10
    local label02PosX = richTextPosX + richTextSize.width + 10

    self._imageVip2:setPositionX(label02PosX)
    self._nodeRich:setPositionX(richTextPosX)
end

return CommonVipInfo