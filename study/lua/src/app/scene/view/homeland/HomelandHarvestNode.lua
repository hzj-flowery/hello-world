
-- Author: hedili
-- Date:2018-05-02 15:59:44
-- Describle：收获节点

local ViewBase = require("app.ui.ViewBase")
local HomelandHarvestNode = class("HomelandHarvestNode", ViewBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function HomelandHarvestNode:ctor()

	local resource = {
		file = Path.getCSB("HomelandHarvestNode", "homeland"),
		binding = {
			_imageGetMoney = {
				events = {{event = "touch", method = "_onGetItemClick"}}
			},
		}
	}
	HomelandHarvestNode.super.ctor(self, resource)
end

-- Describle：
function HomelandHarvestNode:onCreate()

end

-- Describle：
function HomelandHarvestNode:onEnter()

end

-- Describle：
function HomelandHarvestNode:onExit()

end
-- Describle：
function HomelandHarvestNode:_onBtnAdd()
	
end


function HomelandHarvestNode:onCreate()
	local action1 = cc.MoveBy:create(0.5, cc.p(0, 15))
	local action2 = cc.MoveBy:create(0.5, cc.p(0, -15))
	local action = cc.Sequence:create(action1, action2)
	local repeatAct = cc.RepeatForever:create(action)
	self:runAction(repeatAct)

	self:_createProgress()
end

function HomelandHarvestNode:updateUI()
	local count, timePercent = HomelandHelp.getTreeProduce()
	self:setVisible(count >= 1)
	self._textCount:setString(count)
	self:updateTimer(timePercent)
end

function HomelandHarvestNode:updateTimer(percent)
	if percent >= 100 then 
		return 
	end	
	if not self._progressRing then 
		return 
	end
	self._progressRing:setPercentage(percent)
end

function HomelandHarvestNode:_onGetItemClick()
    G_UserData:getHomeland():c2sHomeTreeHarvest()
end

function HomelandHarvestNode:_createProgress()
	local pic = Path.getMineImage("img_mine_shouhuo03")
	self._progressRing = cc.ProgressTimer:create(cc.Sprite:create(pic))
	self._imageGetMoney:addChild(self._progressRing)
	local imgSize = self._imageGetMoney:getContentSize()
	self._progressRing:setPosition(cc.p(imgSize.width/2, imgSize.height/2))
end

return HomelandHarvestNode