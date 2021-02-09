
-- CustomNumLabel
-- 自定义数字模块
-- 支持美术单独切碎的数字图片格式
local UTF8 = require("app.utils.UTF8")
local CustomNumLabel = class("CustomNumLabel", function()
	return display.newNode()
end)

local Path = require("app.utils.Path")

-- 居中
CustomNumLabel.ALIGN_CENTER = "align_center"
-- 左对齐
CustomNumLabel.ALIGN_LEFT = "align_left"
-- 右对齐
CustomNumLabel.ALIGN_RIGHT = "align_right"


CustomNumLabel.SIGN_HAS = 1
CustomNumLabel.SIGN_NO = 0
CustomNumLabel.SIGN_STR = 2

function CustomNumLabel.create(spriteFrames, dir, num, sign, align, needSpcial)
	assert(spriteFrames , "spriteFrames and num could not be nil !")
	return CustomNumLabel.new(spriteFrames, dir, num, sign, align, needSpcial)
end

local function autoAlign(basePosition, items, align, space)
    space = space or 2

    -- 先统计总共的宽度，因为这里居中对齐不需要考虑高度
    local totalWidth = 0
    for i=1, #items do
        totalWidth = totalWidth + items[i]:getContentSize().width
    end

    totalWidth = totalWidth + (#items - 1) * space

    local _rWidth = 0
    if align == CustomNumLabel.ALIGN_LEFT then _rWidth = 0
    elseif align == CustomNumLabel.ALIGN_CENTER then _rWidth = -totalWidth/2
    elseif align == CustomNumLabel.ALIGN_RIGHT then _rWidth = -totalWidth
    else assert(false, "Unknown align style: "..tostring(align)) end

    local function convertToNodePosition(position, item)

        -- print("position.x: "..position.x.." position.y: "..position.y)

        -- 居中对齐默认是以cc.p(0, 0.5)为标准
        local anchorPoint = item:getAnchorPoint()

        return cc.p(position.x + anchorPoint.x * item:getContentSize().width, position.y + (anchorPoint.y - 0.5) * item:getContentSize().height)
    end

    -- 然后返回一个函数，用来获取每一项节点的位置（通过index）
    return function(index)

        assert(index > 0 and index <= #items, "Invalid index: "..index)

        -- 统计下目前为止左边项所占据的宽度
        local _width = 0
        for i=1, index-1 do
            _width = _width + items[i]:getContentSize().width + space
        end

        return convertToNodePosition(cc.p(basePosition.x + _rWidth + _width, 0), items[index])

    end
end

local function updateNodeAlign(nodes, align, alignSpace, basePosition, nums)
    local getPosition = autoAlign(basePosition or cc.p(0, 0), nodes, align, alignSpace)
    for i=1, #nodes do
        local node = nodes[i]
		local position = getPosition(i)
		if nums and nums[i] == "7" then
			position.x = position.x + 3
		end
        node:setPosition(position)
    end

end

function CustomNumLabel:ctor(spriteFrames, dir, num, sign, align, needSpcial)
	self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)    

    local node = display.newNode()
	node:setCascadeOpacityEnabled(true)
    node:setCascadeColorEnabled(true)
	self:addChild(node)
	self._numberNode = node
	self._needSpcial = needSpcial

	-- 数字纹理资源
	
    local png, plist = dir..spriteFrames..".png",dir..spriteFrames..".plist"--Path.getBattleNum(self._spriteFrames)
    -- display.addSpriteFrames(plist, png)
    cc.SpriteFrameCache:getInstance():addSpriteFrames(plist)
	self._spriteFrames = spriteFrames

    self._sign = sign or CustomNumLabel.SIGN_HAS
	self._align = align or CustomNumLabel.ALIGN_LEFT

	if not num then
		return
	end
	if self._sign ~= CustomNumLabel.SIGN_STR then
		self:setNumber(tonumber(num))
	else
		self:setString(num)	
	end
    
end

function CustomNumLabel:setNumber(num, convertType)

	num = checknumber(num)
	self._number = num

	self._numberNode:removeAllChildren()

	-- 添加每一个数字，现在还不支持小数
	-- 拆分数字
	local function _splitNumber(num)
		if num == 0 then return end
		local unit = num % 10
		return tostring(unit), _splitNumber((num - unit) / 10)
	end

	-- 这里获取的数据是逆序的
	local nums = {_splitNumber(tonumber(math.abs(num)))}
	if self._sign == CustomNumLabel.SIGN_HAS then
		if num < 0 then
			table.insert(nums, "-")
		elseif num > 0 then
			table.insert(nums, "+")
		else
			table.insert(nums, "0")
		end
	else
		if num == 0 then --等于0的时候，上面的方法没有加入0.所以这里再判断一次。
			table.insert(nums, "0")
		end
	end

	local size = cc.size(0, 0)

	-- 绘制数字
	local numSprites = {}
	local numlist = {}

	local _i = 1
	for i=#nums, 1, -1 do
		local sprite = display.newSprite("#"..self._spriteFrames.."_"..tostring(nums[i])..".png")
		numlist[#numlist+1] = nums[i]
		self._numberNode:addChild(sprite)
		numSprites[#numSprites + 1] = sprite
		size.width = size.width + sprite:getContentSize().width
		size.height = sprite:getContentSize().height
	end
	if not self._needSpcial then
		numlist = nil
	end
	updateNodeAlign(numSprites, CustomNumLabel.ALIGN_LEFT, 0, cc.p(0, 0), numlist)

    self._numberUnitWidth = size.width / #nums

    if convertType and convertType == 1 then
        local sprite = display.newSprite(Path.getTextBattle("allheal_wan"))
        sprite:setPosition(cc.p(size.width + 20, 0))
        self._numberNode:addChild(sprite)
    elseif convertType and convertType == -1 then
        local sprite = display.newSprite(Path.getTextBattle("alldamage_wan"))
        sprite:setPosition(cc.p(size.width + 20, 0))
        self._numberNode:addChild(sprite)
    end

	self:setContentSize(size)
	self:setIgnoreAnchorPointForPosition(false)
	self:setAnchorPoint(cc.p(0.5, 0.5))

	self._numberNode:setPosition(cc.p(size.width/2, size.height/2))
end

function CustomNumLabel:setString(str)
	self._str = str
	self._numberNode:removeAllChildren()
	local size = cc.size(0, 0)
	local numSprites = {}

	local nums = UTF8.utf8len(self._str) 
	for i = 1, nums, 1 do
		local char = UTF8.utf8sub(self._str,i,i) 
		local sprite = display.newSprite("#"..self._spriteFrames.."_"..char..".png")
		self._numberNode:addChild(sprite)
		numSprites[#numSprites + 1] = sprite

		size.width = size.width + sprite:getContentSize().width
        size.height = sprite:getContentSize().height
	end

	updateNodeAlign(numSprites, CustomNumLabel.ALIGN_LEFT, 0)

    self._numberUnitWidth = size.width / nums

	self:setContentSize(size)
	self:setIgnoreAnchorPointForPosition(false)
	self:setAnchorPoint(cc.p(0.5, 0.5))

	self._numberNode:setPosition(cc.p(size.width/2, size.height/2))
end

function CustomNumLabel:registerRoll(listener)
	if cc.isRegister("CommonRollNumber") then
		cc.bind(self, "CommonRollNumber")
	end
	self:setRollListener(listener)
end

function CustomNumLabel:getString()
	return self._str
end

function CustomNumLabel:getNumber()
	return self._number
end

-- 获取数字的位数
function CustomNumLabel:getNumberUnit()
	
	if self._sign == CustomNumLabel.SIGN_HAS then
		local strNum = tostring(math.abs(self._number))
		return string.len(strNum) + 1
	elseif self._sign == CustomNumLabel.SIGN_NO then
		local strNum = tostring(math.abs(self._number))
		return string.len(strNum) 
	elseif self._sign == CustomNumLabel.SIGN_STR then	
		return UTF8.utf8len(self._str) 
	end
	return 0
end

-- 获取单个数字宽度
function CustomNumLabel:getNumberUnitWidth()
	return self._numberUnitWidth
end

function CustomNumLabel:addNumber(number)
	self:setNumber(self._number + number)
end

return CustomNumLabel
