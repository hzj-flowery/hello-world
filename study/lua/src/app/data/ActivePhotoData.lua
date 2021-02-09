-- Author: liangxu
-- Date:2018-3-1 11:30:30
-- Describle：激活图鉴数据

local BaseData = require("app.data.BaseData")
local ActivePhotoData = class("ActivePhotoData", BaseData)

local schema = {}
schema["active_type"] = {"number", 0}
schema["active_id"] = {"number", 0}
ActivePhotoData.schema = schema

ActivePhotoData.KARMA_TYPE = 1 --名将册
ActivePhotoData.AVATAR_TYPE = 2 --变身卡
ActivePhotoData.PET_TYPE = 3 --神兽
ActivePhotoData.HORSE_TYPE = 5  --战马图鉴

function ActivePhotoData:ctor(properties)
	ActivePhotoData.super.ctor(self, properties)
end

function ActivePhotoData:clear()

end

function ActivePhotoData:reset()

end

return ActivePhotoData