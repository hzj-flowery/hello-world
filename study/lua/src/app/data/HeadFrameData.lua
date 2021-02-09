--玩家头像框系统
local BaseData = require("app.data.BaseData")
local HeadFrameData = class("HeadFrameData", BaseData)
local HeadFrameInfo = require("app.config.head_frame")
local HeadFrameItemData = require("app.data.HeadFrameItemData")


local schema = {}

HeadFrameData.schema = schema

function HeadFrameData:ctor(properties)
	HeadFrameData.super.ctor(self, properties)

	self._curFrame = nil
	self._s2cChangeHeadFrameListener =
		G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeHeadFrame, handler(self, self._s2cChangeHeadFrame)) -- 更换头像框

	self._s2cGetHeadFrameInfoListener =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetHeadFrameInfo, handler(self, self._s2cGetHeadFrameInfo)) -- 获取头像框列表
	
	self._s2cClearHeadFrameRedPointListener = 
		G_NetworkManager:add(MessageIDConst.ID_S2C_ClearHeadFrameRedPoint, handler(self, self._s2cClearHeadFrameRedPoint)) -- 清除头像框小红点

	self._headFrameList = {} -- 头像框数据列表
	self._redPointList = {} -- 小红点列表
	self:initFrameData()
end

function HeadFrameData:clear()
    self._s2cChangeHeadFrameListener:remove()
	self._s2cChangeHeadFrameListener = nil

    self._s2cGetHeadFrameInfoListener:remove()
	self._s2cGetHeadFrameInfoListener = nil

	self._s2cClearHeadFrameRedPointListener:remove()
	self._s2cClearHeadFrameRedPointListener = nil

end

function HeadFrameData:getCurrentFrame( ... )
	return self._curFrame
end


function HeadFrameData:setCurrentFrame( frame )
	if frame ~= nil then 
		if self._curFrame == nil or self._curFrame:getId() ~= frame:getId() then
			self._curFrame = frame
			G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_HEAD_FRAME)
		end

		self._curFrame = frame
	end
end


function HeadFrameData:reset()
	self._headFrameList = {}
	self._redPointList = {}
	self._curFrame = nil
end

function HeadFrameData:initFrameData( ... )
	self._headFrameList = {}
	local function covertTab(t)
	    local tab = {}
	    local keyMap = {
			id = 1,    --序号-int 
			name = 2,    --名称-string 
			limit_level = 3,    --限制等级-int 
			day = 4,    --开服天数-int 
			resource = 5,    --资源-string 
			color = 6,    --品质-int 
			time_type = 7,    --时间类型-int 
			time_value = 8,    --时间类型值-int 
			des = 9,    --条件描述-string 
	    }

	    for k,v in pairs(keyMap) do
	        tab[k] = t[k]
	    end
	    return tab
	end

	for i = 1, HeadFrameInfo.length() do
		local frameInfo = covertTab(HeadFrameInfo.indexOf(i))
		local frame = HeadFrameItemData.new(frameInfo)
		table.insert(self._headFrameList,frame)
	end
	self:_sortFrameList()
end



function HeadFrameData:_sortFrameList( ... )
	table.sort(self._headFrameList,function ( a,b )
		-- local curA = a:getId() == 1 and 0 or 1  -- 默认的排在第一个
		-- local curB = b:getId() == 1 and 0 or 1

		-- if curA ~= curB then
		-- 	return curA < curB
		-- end
		if a:isHave() == b:isHave() then
			if a:getColor() == b:getColor() then
				return a:getId() > b:getId()
			else
				return a:getColor() > b:getColor()
			end
		else
			return a:isHave()
		end
	end)

end




function HeadFrameData:c2sClearHeadFrameRedPoint( ... )
	G_NetworkManager:send(MessageIDConst.ID_C2S_ClearHeadFrameRedPoint,{})
end


function HeadFrameData:_s2cClearHeadFrameRedPoint( id,message )
	-- body
end


-- 装备当前id的头像框
function HeadFrameData:c2sChangeHeadFrame(frameId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeHeadFrame, {id = frameId})
end

-- 更换头像框回复
function HeadFrameData:_s2cChangeHeadFrame(id, message)
	if rawget(message,"ret") == 1 then 
		if rawget(message,"cur_head_frame") then 
			local  frame = HeadFrameItemData.new(rawget(message,"cur_head_frame"))
			self:setCurrentFrame(frame)
			G_Prompt:showTipOnTop(Lang.get("frame_equip_success"))
		end
	end
end

-- 获取当前头像框列表
function HeadFrameData:_s2cGetHeadFrameInfo(id, message)
	dump(message,"头像框信息",6)

	for m,n in pairs(self._headFrameList) do
		n:setHave(false) 
		n:setExpire_time(0)
	end
	
	self._redPointList = {}
	if rawget(message,"headFrames") then
		for k,v in pairs(message.headFrames) do
			for m,n in pairs(self._headFrameList) do
				if n:getId() == v.id then
					n:setHave(true) 
					n:setExpire_time(v.expire_time)
					break
				end
			end
		end
	end

	self:_sortFrameList()
	if rawget(message,"red_point_list") then
		for k,v in pairs(rawget(message,"red_point_list")) do
			table.insert(self._redPointList,v)
		end
	end

	local curId = rawget(message,"cur_head_frame").id
	if curId == 0 then curId = 1 end
	self._curFrame = self:getFrameDataWithId(curId)

	if self._headFrameList[1] ~= nil and self._curFrame == nil then 
		self._curFrame = self._headFrameList[1]
	end

	G_SignalManager:dispatch(SignalConst.EVENT_HEAD_FRAME_INFO, message)
end

function HeadFrameData:getFrameListData( ... )
	return self._headFrameList
end

function HeadFrameData:getRedPointList( ... )
	return self._redPointList
end


function HeadFrameData:hasRedPoint( ... )
	return #self._redPointList > 0
end

-- 该id是否含有小红点
function HeadFrameData:isFrameHasRedPoint( id )
	for k,v in pairs(self._redPointList) do
		if id == v then
			return true
		end
	end
	return false
end

-- 清除某个小红点
function HeadFrameData:deleteRedPointBy(id)
	for k,v in pairs(self._redPointList) do
		if id == v then
			table.remove(self._redPointList,k)
		end
	end
end


function HeadFrameData:clearRedPointList( ... )
	self._redPointList = {}
end


function  HeadFrameData:getFrameDataWithId( id )
	for k,v in pairs(self._headFrameList) do
		if v:getId() == id then 
			return v
		end
	end
	return nil
end



-- 是否含有该id的头像框和位置
function HeadFrameData:isInHeadFrameList( id )
	for i=1,#self._headFrameList do
		if self._headFrameList[i]:getId() == id then
			return true,i
		end
	end
	return false,0
end



function HeadFrameData:updateHeadFrame( frameList )
	for k,v in pairs(self._headFrameList) do
		for m,n in pairs(frameList) do
			if v:getId() == n.id then
				v:setHave(true)
				v:setExpire_time(n.expire_time)
				break
			end
		end
	end
	self:_sortFrameList()
end

function HeadFrameData:insertHeadFrame( frameList )
	for k,v in pairs(self._headFrameList) do
		for m,n in pairs(frameList) do
			if v:getId() == n.id then
				v:setHave(true)
				table.insert(self._redPointList,n.id)
				break
			end
		end
	end
	self:_sortFrameList()
end

function HeadFrameData:deleteHeadFrame( frameList )
	for k,v in pairs(self._headFrameList) do
		for m,n in pairs(frameList) do
			if v:getId() == n then
				v:setHave(false)
				break
			end
		end
	end
	self:_sortFrameList()
end

function HeadFrameData:setCurrentFrameByOp( frame )
	for k,v in pairs(self._headFrameList) do
		if v:getId() == frame.id then
			self:setCurrentFrame(v)
			break
		end
	end
end

function HeadFrameData:isHasRedPoint( ... )
	-- body
end



return HeadFrameData
