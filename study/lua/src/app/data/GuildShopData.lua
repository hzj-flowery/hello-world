--
-- Author: Liangxu
-- Date: 2017-06-12 19:51:02
-- 军团商店数据
local BaseData = require("app.data.BaseData")
local GuildShopData = class("GuildShopData", BaseData)

function GuildShopData:ctor(properties)
	GuildShopData.super.ctor(self, properties)
end

function GuildShopData:clear()
	
end

function GuildShopData:reset()
	
end

return GuildShopData