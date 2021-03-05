-- Author: nieming
-- Date:2017-12-22 19:56:20
-- Describle：

local BaseData = require("app.data.BaseData")
local ChapterBoxData = class("ChapterBoxData", BaseData)
local schema = {}
ChapterBoxData.schema = schema


function ChapterBoxData:ctor(properties)
	ChapterBoxData.super.ctor(self, properties)

	self._signalRecvGetPeriodBoxAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetPeriodBoxAward, handler(self, self._s2cGetPeriodBoxAward))
	self._alreadyGetAwardIDs = {}
end

function ChapterBoxData:clear()
	self._signalRecvGetPeriodBoxAward:remove()
	self._signalRecvGetPeriodBoxAward = nil
end

function ChapterBoxData:reset()

end

function ChapterBoxData:udpateCurBoxinfo()
	local storyPeriodBox = require("app.config.story_period_box")
	local lastChapterID = G_UserData:getChapter():getLastOpenChapterId()

	local temps = {}
	local indexs = storyPeriodBox.index()
	for _, v in pairs(indexs)do
		local config = storyPeriodBox.indexOf(v)
		table.insert(temps, config)
	end
	table.sort(temps, function(a, b)
		return a.chapter < b.chapter
	end)


	local lastChapter = 0
	local notFinishList = {}
	for _, v in pairs(temps)do
		local item = {}
		item.length = v.chapter - lastChapter
		item.config = v
		lastChapter = v.chapter
		if not self._alreadyGetAwardIDs[v.id] then
			table.insert(notFinishList, item)
		end
	end
	self._curBoxInfo = notFinishList[1]
end

--最后一张 会为空 要做判断
function ChapterBoxData:getCurBoxInfo()
	if not self._curBoxInfo then
		self:udpateCurBoxinfo()
	end
	return self._curBoxInfo
end

function ChapterBoxData:isCurBoxAwardsCanGet()
	local curBoxInfo = self:getCurBoxInfo()
	if curBoxInfo then
		local lastChapterID = G_UserData:getChapter():getLastOpenChapterId()
		if lastChapterID >  curBoxInfo.config.chapter then
			return true
		end
	end
	return false
end

function ChapterBoxData:updateData(boxInfo)
	if not boxInfo then
		return
	end
	self._alreadyGetAwardIDs = {}
	for _,v in pairs(boxInfo)do
		self._alreadyGetAwardIDs[v] = true
	end
	self:udpateCurBoxinfo()
end



-- Describle：
-- Param:
--	box_id
function ChapterBoxData:c2sGetPeriodBoxAward( box_id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetPeriodBoxAward, {
		box_id = box_id,
	})
end
-- Describle：
function ChapterBoxData:_s2cGetPeriodBoxAward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local box_id = rawget(message, "box_id")
	if box_id then
		self._alreadyGetAwardIDs[box_id] = true
	end
	self:udpateCurBoxinfo()
	local awards = rawget(message, "awards")
	G_SignalManager:dispatch(SignalConst.EVENT_GET_PERIOD_BOX_AWARD_SUCCESS, awards)

end

return ChapterBoxData
