local ViewBase = require("app.ui.ViewBase")
local MineGetMoneyIcon = class("MineGetMoneyIcon", ViewBase)

function MineGetMoneyIcon:ctor()  
	self._progressRing = nil
	local resource = {
		file = Path.getCSB("MineGetMoneyIcon", "mineCraft"),
		binding = {
			_imageGetMoney = {
				events = {{event = "touch", method = "_onGetMoneyClick"}}
			},
		}
	}
	MineGetMoneyIcon.super.ctor(self, resource)
end

function MineGetMoneyIcon:onCreate()
	local action1 = cc.MoveBy:create(0.5, cc.p(0, 15))
	local action2 = cc.MoveBy:create(0.5, cc.p(0, -15))
	local action = cc.Sequence:create(action1, action2)
	local repeatAct = cc.RepeatForever:create(action)
	self:runAction(repeatAct)

	self:_createProgress()
end

function MineGetMoneyIcon:updateUI(moneyCount)
	self._textCount:setString(moneyCount)
end

function MineGetMoneyIcon:updateTimer(percent)
	if percent >= 100 then 
		return 
	end	
	if not self._progressRing then 
		return 
	end
	self._progressRing:setPercentage(percent)
end

function MineGetMoneyIcon:_onGetMoneyClick()
    G_UserData:getMineCraftData():c2sGetMineMoney()
end

function MineGetMoneyIcon:_createProgress()
	local pic = Path.getMineImage("img_mine_shouhuo03")
	self._progressRing = cc.ProgressTimer:create(cc.Sprite:create(pic))
	self._imageGetMoney:addChild(self._progressRing)
	local imgSize = self._imageGetMoney:getContentSize()
	self._progressRing:setPosition(cc.p(imgSize.width/2, imgSize.height/2))
end

return MineGetMoneyIcon