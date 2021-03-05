--
-- Author: Liangxu
-- Date: 2019-4-29
-- 蛋糕活动赠送推送

local CakeGivePushNode = class("CakeGivePushNode")
local CakeActivityConst = require("app.const.CakeActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

local RES_INFO = {
	[CakeActivityConst.MATERIAL_TYPE_1] = {
		bgRes = "img_special_03",
		outlineColor = cc.c4b(0x6a, 0x78, 0xff, 0xff),
	},
	[CakeActivityConst.MATERIAL_TYPE_2] = {
		bgRes = "img_special_04",
		outlineColor = cc.c4b(0xde, 0x2a, 0xff, 0xff),
	},
	[CakeActivityConst.MATERIAL_TYPE_3] = {
		bgRes = "img_special_05",
		outlineColor = cc.c4b(0xff, 0xba, 0x00, 0xff),
	},
}

local POS_INFO = {
	[1] = {posY = 370, zOrder = 50},
	[2] = {posY = 295, zOrder = 40},
	[3] = {posY = 220, zOrder = 30},
	[4] = {posY = 145, zOrder = 20},
	[5] = {posY = 70, zOrder = 10},
}

function CakeGivePushNode:ctor(target, pos, onReset, onDoGive)
	self._target = target
	self._lastPos = pos --记录之前的排序位置
	self._curPos = pos --当前排序的位置
	self._onReset = onReset
	self._onDoGive = onDoGive --实际发出协议的回调
	self._isPlaying = false --此节点是否在出现状态
	self._data = nil
	self._itemId = 0
	self._type = 0
	self._playTime = 0 --播放时长
	self._showCount = 0 --用于显示的数量
	self._realCount = 0 --用于发协议的实际数量
	self._schedulerCheck = nil
	self._schedulerSend = nil

	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageBg:ignoreContentAdaptWithSize(true)
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._textDesc = ccui.Helper:seekNodeByName(self._target, "TextDesc")
	self._textCount = ccui.Helper:seekNodeByName(self._target, "TextCount")
	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
end

function CakeGivePushNode:onExit()
	self:_removeCheckSchedule()
	self:_removeSendSchedule()
	self:forceReset()
end

function CakeGivePushNode:updateUI(data)
	self._data = data
	local serverName = require("app.utils.TextHelper").cutText(data:getContentDesWithKey("sname"))
	local name = data:getContentDesWithKey("uname")
	self._itemId = tonumber(data:getContentDesWithKey("itemid1"))
	self._showCount = tonumber(data:getContentDesWithKey("itemnum"))
	self._realCount = tonumber(data:getContentDesWithKey("itemnum"))
	self._type = CakeActivityDataHelper.getMaterialTypeWithId(self._itemId)
	self._playTime = CakeActivityDataHelper.getBulletPlayTime(self._type)
	local info = RES_INFO[self._type]
	self._imageBg:loadTexture(Path.getAnniversaryImg(info.bgRes))
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, self._itemId)
	local effectName = CakeActivityDataHelper.getMaterialMoving(self._type)
	self._nodeEffect:removeAllChildren()
	G_EffectGfxMgr:createPlayGfx(self._nodeEffect, effectName)
	self._textName:setString(serverName.." "..name)
	self._textDesc:setString(Lang.get("cake_activity_give_item_des", {name = itemParam.name}))
	self._textCount:enableOutline(info.outlineColor, 1)
	self._textCount:setString("x"..self._showCount)
end

function CakeGivePushNode:addCount(count)
	self._showCount = self._showCount+count
	self._realCount = self._realCount+count
	self._textCount:setString("x"..self._showCount)
	self._textCount:doScaleAnimation()
	
    self:_checkUpdateCount()
    self:_checkSend()
end

function CakeGivePushNode:playStart()
	self._isPlaying = true
	local posY = self._target:getPositionY()
	local moveTo = cc.MoveTo:create(0.2, cc.p(260, posY))
	local easeBounceOut = cc.EaseBounceOut:create(moveTo)
	easeBounceOut:setTag(123)
	self._target:runAction(easeBounceOut)
	self:_checkUpdateCount()
	self:_checkSend()
end

function CakeGivePushNode:_removeCheckSchedule()
	if self._schedulerCheck ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulerCheck)
        self._schedulerCheck = nil
    end
end

function CakeGivePushNode:_checkUpdateCount()
	self:_removeCheckSchedule()
	self._schedulerCheck = SchedulerHelper.newScheduleOnce(function()
		self:_playEnd()
	end, self._playTime) --x秒钟后此节点消失
end

function CakeGivePushNode:_removeSendSchedule()
	if self._schedulerSend ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulerSend)
        self._schedulerSend = nil
    end
end

function CakeGivePushNode:_checkSend()
	self:_removeSendSchedule()
	self._schedulerSend = SchedulerHelper.newScheduleOnce(function()
		self:_sendMatrical()
	end, 0.5) --0.5秒后发消息
end

function CakeGivePushNode:_playEnd()
	self:_reset()
	if self._onReset then
		self._onReset()
	end
end

function CakeGivePushNode:_sendMatrical()
	local item = nil
	if self._data and self._data:isFake() then
		item = {id = self._itemId, num = self._realCount}
	end
	if self._onDoGive then
		self._onDoGive(item)
	end
	self._realCount = 0
end

function CakeGivePushNode:_reset()
	self._target:setPositionX(0)
	self._isPlaying = false
	self._data = nil
end

function CakeGivePushNode:isEmpty()
	return not self._data --没有数据，表示空了
end

function CakeGivePushNode:isPlaying()
	return self._isPlaying
end

--存的是否假数据
function CakeGivePushNode:isFake()
	if self._data and self._data:isFake() then
		return true
	else
		return false
	end
end

--根据数据对比，判断是否是一样的，用于更新次数
function CakeGivePushNode:isSameNode(data)
	if self._data then
		if self._data:getNotice_id() == CakeActivityConst.NOTICE_TYPE_COMMON --只可能是普通通知样式
			and self._data:getNotice_id() == data:getNotice_id()
			and self._data:getContentDesWithKey("sname") == data:getContentDesWithKey("sname")
			and self._data:getContentDesWithKey("itemid1") == data:getContentDesWithKey("itemid1")
			and self._data:getContentDesWithKey("uol") == data:getContentDesWithKey("uol")
			and self._data:getContentDesWithKey("sgname") == data:getContentDesWithKey("sgname")
			and self._data:getContentDesWithKey("uname") == data:getContentDesWithKey("uname")
			and self._data:getContentDesWithKey("tgname") == data:getContentDesWithKey("tgname")
		then
			return true	
		end
	end
	return false
end

--强制结束
function CakeGivePushNode:forceReset()
	if self._realCount > 0 then
		self:_sendMatrical()
	end
	self:_reset()
end

function CakeGivePushNode:updatePos(pos)
	self._lastPos = self._curPos
	self._curPos = pos
end

function CakeGivePushNode:getPos()
	return self._curPos
end

--移动位置
function CakeGivePushNode:moveToPos()
	local pos = self._curPos
	local posY = self._target:getPositionY()
	if self._target:getActionByTag(123) then --如果正在移动，先修正坐标
		self._target:stopAllActions()
		self._target:setPosition(cc.p(260, posY))
	end
	if self._target:getActionByTag(456) then
		self._target:stopAllActions()
	end

	local posX = self._target:getPositionX()
	local tarPosY = POS_INFO[pos].posY
	local zOrder = POS_INFO[pos].zOrder
	self._target:setLocalZOrder(zOrder)
	if self:isPlaying() then
		local moveTo = cc.MoveTo:create(0.2, cc.p(posX, tarPosY))
		moveTo:setTag(456)
		self._target:runAction(moveTo)
	else
		self._target:setPosition(cc.p(posX, tarPosY)) --如果是没显示状态，直接设置坐标
	end
	
	self:_checkUpdateCount()
end

function CakeGivePushNode:getType()
	return self._type
end

function CakeGivePushNode:getShowCount()
	return self._showCount
end

function CakeGivePushNode:isPosChange()
	return self._lastPos ~= self._curPos
end

return CakeGivePushNode