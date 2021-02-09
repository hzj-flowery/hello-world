
-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动赠送信息

local BaseData = require("app.data.BaseData")
local CakeActivityNoticeData = class("CakeActivityNoticeData", BaseData)

local schema = {}
schema["notice_id"] = {"number", 0}
schema["contents"] = {"table", {}}
schema["fake"] = {"boolean", false}
CakeActivityNoticeData.schema = schema

function CakeActivityNoticeData:ctor(properties)
	CakeActivityNoticeData.super.ctor(self, properties)
	self._contentDes = {}
end

function CakeActivityNoticeData:reset()
	
end

function CakeActivityNoticeData:clear()

end

function CakeActivityNoticeData:updateData(data)
	self:setProperties(data)
	self._contentDes = {}
	local contents = rawget(data, "contents") or {}
	for i, content in ipairs(contents) do
		local key = rawget(content, "key")
		local value = rawget(content, "value")
		self._contentDes[key] = value
	end
end

-- string = "sname" //服务器名称
-- string = "uname" //玩家名称
-- string = "uid" //玩家id
-- string = "uol" //玩家官衔
-- string = "itemid1" //物品id1  （服务器）的xxx捐（item1）时意外获得（item2）！
-- string = "itemid2" //物品id2  （服务器）的xxx捐（item1）时意外获得（item2）！
-- string = "itemnum" //物品数量
-- string = "sgname" //源公会名称
-- string = "sgid" //源公会id
-- string = "tgname" //目标公会名称
-- string = "clv" //蛋糕等级
function CakeActivityNoticeData:getContentDesWithKey(key)
	return self._contentDes[key] or ""
end

function CakeActivityNoticeData:setContentDesWithKey(key, value)
	self._contentDes[key] = value
end

return CakeActivityNoticeData