local Color = {}

local function addColor(colors)
    for k, v in pairs(colors) do
        -- assert(not Color[k], "There is an another color named: "..tostring(k))
        Color[k] = v
    end
end




-- 常用按钮

-- 小按钮（正常样式）
Color.COLOR_BUTTON_LITTLE = cc.c3b(0xff, 0xf8, 0xc6)
-- 小按钮（正常样式）描边
Color.COLOR_BUTTON_LITTLE_OUTLINE = cc.c4b(0x91, 0x48, 0x6, 0xff)
-- 小按钮（强调样式）
Color.COLOR_BUTTON_LITTLE_NOTE = cc.c3b(0xff, 0xfe, 0xe8)
-- 小按钮（强调样式）描边
Color.COLOR_BUTTON_LITTLE_NOTE_OUTLINE = cc.c4b(0xa5, 0x39, 0x24, 0xff)
-- 小按钮（置灰状态）
Color.COLOR_BUTTON_LITTLE_GRAY = cc.c3b(0xff, 0xf8, 0xc6)
-- 小按钮（置灰状态）描边
Color.COLOR_BUTTON_LITTLE_GRAY_OUTLINE = cc.c4b(0x52, 0x4e, 0x4a, 0xff)

-- 大按钮（正常样式）
Color.COLOR_BUTTON_BIG = cc.c3b(0xff, 0xf8, 0xc6)
-- 大按钮（正常样式）描边
Color.COLOR_BUTTON_BIG_OUTLINE = cc.c4b(0x91, 0x48, 0x6, 0xff)
-- 大按钮（强调样式）
Color.COLOR_BUTTON_BIG_NOTE = cc.c3b(0xff, 0xff, 0xff)
-- 大按钮（强调样式）描边
Color.COLOR_BUTTON_BIG_NOTE_OUTLINE = cc.c4b(0xa5, 0x39, 0x24, 0xff)
-- 大按钮（置灰样式）
Color.COLOR_BUTTON_BIG_GRAY = cc.c3b(0xff, 0xf8, 0xc6)
-- 大按钮（置灰样式）描边
Color.COLOR_BUTTON_BIG_GRAY_OUTLINE = cc.c4b(0x52, 0x4e, 0x4a, 0xff)

--排名色
Color.COMMON_RANK_COLOR = 4     --通用排名颜色
Color.RANK_COLOR =
{
    cc.c3b(0xdd, 0x15, 0x00),   -- 第一
    cc.c3b(0xc2, 0x48, 0x00),   -- 第二
    cc.c3b(0x7b, 0x13, 0xbd),   -- 第三
    cc.c3b(0x88, 0x44, 0x1b),   -- 其他
}

function Color.getRankColor(index)
    if Color.RANK_COLOR[index] then
        return Color.RANK_COLOR[index]
    end

    return Color.RANK_COLOR[Color.COMMON_RANK_COLOR]
end

-- 战报解析添加三种颜色
Color.ReportParseColor = 
{
    cc.c3b(0x00,0x00,0x00),
    cc.c3b(0xff,0x00,0x00),
    cc.c3b(0x80,0xff,0x0f),
    cc.c3b(0x00,0x00,0xff),
}
Color.ReportParseColorDefault   = cc.c3b(0xB6,0x65,0x11)

--品质色

Color.COLOR_QUALITY = {
    cc.c3b(0xfa, 0xfa, 0xf3),   -- 白色
    cc.c3b(0x9e, 0xef, 0x13),   -- 绿色
    cc.c3b(0x15, 0xec, 0xff),   -- 蓝色
    cc.c3b(0xe3, 0x32, 0xee),   -- 紫色
    cc.c3b(0xef, 0xa4, 0x13),   -- 橙色
    cc.c3b(0xef, 0x13, 0x13),   -- 红色
    cc.c3b(0xf7, 0xff, 0x13),   -- 金色
}

--弹幕品质色bullet
Color.COLOR_BULLET_QUALITY = {
    cc.c3b(0xff, 0xf6, 0xe5),   -- 白色
    cc.c3b(0x80, 0xff, 0x0f),   -- 绿色
    cc.c3b(0x00, 0xa9, 0xff),   -- 蓝色
    cc.c3b(0xff, 0x0e, 0xff),   -- 紫色
    cc.c3b(0xff, 0xce, 0x0a),   -- 橙色
    cc.c3b(0xff, 0x08, 0x08),   -- 红色
    cc.c3b(0xf7, 0xff, 0x13),   -- 金色
}

Color.COLOR_QUALITY_DARK = {
    cc.c3b(0x58, 0x58, 0x58),   -- 白色
    cc.c3b(0x03, 0x82, 0x00),   -- 绿色
    cc.c3b(0x00, 0x71, 0xb7),   -- 蓝色
    cc.c3b(0x9d, 0x00, 0xa7),   -- 紫色
    cc.c3b(0xd5, 0x54, 0x00),   -- 橙色
    cc.c3b(0xc6, 0x00, 0x00),   -- 红色
}


-- 弹幕品质色的描边
Color.COLOR_BULLET_QUALITY_OUTLINE = {
    cc.c4b(0x2b, 0x09, 0x00, 0xff),   -- 白色
    cc.c4b(0x18, 0x36, 0x00, 0xff),   -- 绿色
    cc.c4b(0x00, 0x15, 0x40, 0xff),   -- 蓝色
    cc.c4b(0x35, 0x00, 0x40, 0xff),   -- 紫色
    cc.c4b(0x3e, 0x0f, 0x00, 0xff),   -- 橙色
    cc.c4b(0x3a, 0x00, 0x00, 0xff),   -- 红色
    cc.c4b(0xac, 0x2a, 0x00, 0xff),   -- 金色
}

-- 品质色的描边

Color.COLOR_QUALITY_OUTLINE = {
    cc.c4b(0x55, 0x37, 0x19, 0xff),   -- 白色
    cc.c4b(0x23, 0x3a, 0x00, 0xff),   -- 绿色
    cc.c4b(0x01, 0x1e, 0x30, 0xff),   -- 蓝色
    cc.c4b(0x3b, 0x19, 0x4d, 0xff),   -- 紫色
    cc.c4b(0x46, 0x15, 0x15, 0xff),   -- 橙色
    cc.c4b(0x59, 0x07, 0x07, 0xff),   -- 红色
    cc.c4b(0xac, 0x2a, 0x00, 0xff),   -- 金色
}


--官衔色
Color.COLOR_OFFICIAL_RANK = {
    cc.c3b(0x9e, 0xef, 0x13),   -- 无 绿色
    cc.c3b(0x15, 0xec, 0xff),   -- 校尉 浅蓝
    cc.c3b(0x15, 0xa4, 0xff),   -- 蓝色
    cc.c3b(0xff, 0x6b, 0xfd),   -- 浅粉紫
    cc.c3b(0xea, 0x10, 0xe6),   -- 紫色
    cc.c3b(0xb2, 0x13, 0xf3),   -- 深紫色
    cc.c3b(0xff, 0xd0, 0x27),   -- 金色
    cc.c3b(0xf2, 0x9f, 0x09),    -- 黄金色
    cc.c3b(0xf4, 0x7a, 0x07),    -- 深金色
    cc.c3b(0xff, 0x5a, 0x49),    --红色
}
Color.COLOR_OFFICIAL_RANK_OUTLINE = {
    cc.c3b(0x23, 0x3a, 0x00),   -- 无 绿色
    cc.c3b(0x01, 0x1e, 0x30),   -- 校尉 浅蓝
    cc.c3b(0x01, 0x1e, 0x30),   -- 蓝色
    cc.c3b(0x3b, 0x19, 0x4d),   -- 浅粉紫
    cc.c3b(0x3b, 0x19, 0x4d),   -- 紫色
    cc.c3b(0x3b, 0x19, 0x4d),   -- 深紫色
    cc.c3b(0x46, 0x15, 0x15),   -- 金色
    cc.c3b(0x46, 0x15, 0x15),   -- 黄金色
    cc.c3b(0x46, 0x15, 0x15),    -- 深金色
    cc.c3b(0x59, 0x07, 0x07),    --红色
}


--神树色
Color.COLOR_HOMELAND = {
    cc.c3b(0x78, 0xff, 0x13),   -- 无 绿色
    cc.c3b(0x32, 0xd6, 0xff),   -- 校尉 浅蓝
    cc.c3b(0x00, 0x84, 0xff),   -- 蓝色
    cc.c3b(0xff, 0x88, 0xd6),   -- 浅粉紫
    cc.c3b(0xef, 0x2b, 0xef),   -- 紫色
    cc.c3b(0xcb, 0x32, 0xff),   -- 深紫色
    cc.c3b(0xff, 0xec, 0x1c),   -- 金色
    cc.c3b(0xff, 0xae, 0x00),    -- 黄金色
    cc.c3b(0xff, 0x7b, 0x11),    -- 深金色
    cc.c3b(0xff, 0x70, 0x4a),    --红色
    cc.c3b(0xff, 0x00, 0x00),    --红色
    cc.c3b(0xff, 0xaa, 0xae),    --
    cc.c3b(0xf4, 0xf4, 0x80),    --
}
Color.COLOR_HOMELAND_OUTLINE = {
    cc.c3b(0x14, 0x63, 0x09),   -- 无 绿色
    cc.c3b(0x00, 0x48, 0xa9),   -- 校尉 浅蓝
    cc.c3b(0x00, 0x2d, 0x77),   -- 蓝色
    cc.c3b(0x76, 0x00, 0x48),   -- 浅粉紫
    cc.c3b(0x74, 0x00, 0x77),   -- 紫色
    cc.c3b(0x43, 0x00, 0x9e),   -- 深紫色
    cc.c3b(0x9e, 0x52, 0x00),   -- 金色
    cc.c3b(0x90, 0x3a, 0x00),   -- 黄金色
    cc.c3b(0x76, 0x27, 0x00),    -- 深金色
    cc.c3b(0x8e, 0x1e, 0x00),    --红色
    cc.c3b(0x7e, 0x12, 0x00),    --红色
    cc.c3b(0xa7, 0x0e, 0x0f),    --
    cc.c3b(0xee, 0x5b, 0x26),    --
}

function Color.getOfficialColor(index)

    assert(Color.COLOR_OFFICIAL_RANK[index+1], "Invalid color: "..tostring(index+1))

    return Color.COLOR_OFFICIAL_RANK[index+1]

end

-- 品质色的描边

function Color.getOfficialColorOutline(index)

    assert(Color.COLOR_OFFICIAL_RANK_OUTLINE[index+1], "Invalid color outline: "..tostring(index+1))

    return Color.COLOR_OFFICIAL_RANK_OUTLINE[index+1]

end


function Color.getHomelandColor(index)

    assert(Color.COLOR_HOMELAND[index], "Invalid color: "..tostring(index))

    return Color.COLOR_HOMELAND[index]

end

-- 品质色的描边

function Color.getHomelandOutline(index)

    assert(Color.COLOR_HOMELAND_OUTLINE[index], "Invalid color outline: "..tostring(index+1))

    return Color.COLOR_HOMELAND_OUTLINE[index]

end

function Color.getBulletColor(index)
    assert(Color.COLOR_BULLET_QUALITY[index], "Invalid color: "..tostring(index))
    return Color.COLOR_BULLET_QUALITY[index]
end

function Color.getBulletColorOutline(index)

    assert(Color.COLOR_BULLET_QUALITY_OUTLINE[index], "Invalid color outline: "..tostring(index))

    return Color.COLOR_BULLET_QUALITY_OUTLINE[index]

end


function Color.getColor(index, isDark)

    assert(Color.COLOR_QUALITY[index], "Invalid color: "..tostring(index))

    if not isDark then
        return Color.COLOR_QUALITY[index]
    else
        return Color.getDarkColor(index)
    end

end

-- 品质色的描边

function Color.getColorOutline(index)

    assert(Color.COLOR_QUALITY_OUTLINE[index], "Invalid color outline: "..tostring(index))

    return Color.COLOR_QUALITY_OUTLINE[index]

end


-- 武将详情属性名称激活颜色
Color.COLOR_ATTR_NAME_ACTIVE = cc.c4b(0xc2, 0x50, 0x00, 0xff)

-- 武将详情属性内容激活颜色
Color.COLOR_ATTR_DES_ACTIVE = cc.c4b(0x00, 0xa7, 0x08, 0xff)

-- 武将详情属性未激活颜色
Color.COLOR_ATTR_UNACTIVE = cc.c4b(0x86, 0x55, 0x2c, 0xff)

-- 武将详情解锁提示颜色
Color.COLOR_UNLOCK_TIP = cc.c4b(0xe1, 0x1b, 0x01, 0xff)

-- 武将缘分激活颜色
Color.COLOR_KARMA_ACTIVE = cc.c4b(0xfb, 0xfe, 0xcb, 0xff)

-- 武将缘分未激活颜色
Color.COLOR_KARMA_UNACTIVE = cc.c4b(0xe1, 0xd5, 0xb1, 0xff)

-- 主要文字颜色
Color.COLOR_MAIN_TEXT = cc.c4b(0x68, 0x44, 0x28, 0xff)

-- 次要文字颜色
Color.COLOR_SECONDARY_TEXT = cc.c4b(0x86, 0x55, 0x2c, 0xff)


--常用的UI颜色
Color.uiColors = {
    GREEN = cc.c3b(0x00, 0xa7, 0x08), --普通文字  绿色
    RED = cc.c3b(0xe1, 0x1b, 0x01), --普通文字  红色
    BROWN = cc.c3b(0xc2, 0x50, 0x00), --普通文字 褐色
    BEIGE = cc.c3b(0xee, 0xca, 0x93), --米色
    THIN_YELLOW  = cc.c3b(0xff, 0xf8, 0xc6), --普通文字,浅黄色
}







----------------------------------------------------------------------------------------

Color.Gray = cc.c3b(80,80,80)
Color.Noraml = cc.c3b(255,255,255)
--弹出框背景颜色
Color.modelColor = cc.c4b(0, 0, 0, 178) --70% alpha

--弹出文字默认颜色
Color.tipTextColor = cc.c3b(0xff, 0xff, 0xcc)

Color.strokeBlack = cc.c4b(0, 0, 0, 255)
Color.strokeHalfBlack = cc.c4b(0, 0, 0, 255*0.5)
Color.strokeBrown = cc.c4b(51, 0, 0, 255)
Color.strokeYellow = cc.c4b(237,198,0, 255)
Color.strokeGreen = cc.c4b(22 ,131,138, 255)

Color.activeSkill = cc.c3b(197, 45, 0)
Color.inActiveSkill = cc.c3b(80, 62, 50)

-- 剧情副本列表 标题颜色
Color.titleGreen = cc.c3b(0xb1, 0xef, 0x65)
Color.titleRed = cc.c3b(0xc5, 0x2d, 0x00)

--页签的颜色
Color.TAB_NORMAL = cc.c3b(0x46,0x27,0x09)   --未选中
Color.TAB_DOWN = cc.c3b(0xff,0xe0,0x95)     --选中
Color.TAB_GRAY = cc.c3b(0x33,0x33,0x33)       --禁用

--白色
Color.WHITE = cc.c3b(255,255,255)
--咖啡色
Color.COFFEE = cc.c3b(131,92,66)
--红色
Color.RED = cc.c3b(230,0,0)

--浅蓝色 044
Color.BABY_BLUE = cc.c4b(68, 120, 187, 255)

--白褐色 011
Color.WHITE_BROWN = cc.c4b(0x7b, 0x3e, 0x06, 0xff)
--默认白色
Color.WHITE_DEFAULT = cc.c4b(0xff,0xf6,0xe2,0xff)

--默认描边色
Color.DEFAULT_OUTLINE_COLOR = cc.c4b(0x55,0x39,0x23,0xff)
Color.DEFAULT_OUTLINE_COLOR2 = cc.c4b(0xb6,0x6c,0x45,0xff)
--灰化描边色
Color.GRAY_OUTLINE_COLOR = cc.c4b(0x8b, 0x8a, 0x8a, 0xff)

----白色品质武将名字颜色
Color.KNIGHT_NAME_WIHTE_COLOR = cc.c4b(0xff, 0xf6, 0xe2, 0xff)

--标题描述提示 用色
Color.darkColors={
    TITLE_01 = cc.c3b(0xff,0xd6,0x69),  --一级标题
    TITLE_02 = cc.c3b(0xff,0xf6,0xe2),  --二级标题
    DESCRIPTION = cc.c3b(0xf5,0xed,0xd0),   --描述字
    ATTRIBUTE = cc.c3b(0xb1,0xef,0x66),   --增加的属性值
    TIPS_01 = cc.c3b(0xe0,0x15,0x00),  --明显的提示文字
    TIPS_02 = cc.c3b(0xd5,0xad,0x7e),   --低调的说明文字
    UN_ACTIVE = cc.c4b(0x99,0x90,0x84,0xff), --未激活颜色
}

Color.lightColors= {
    TITLE_01 = cc.c3b(0x97,0x20,0x00),  --一级标题
    TITLE_02 = cc.c3b(0x89,0x40,0x13),  --二级标题
    DESCRIPTION = cc.c3b(0x61,0x3c,0x2b),   --重点描述字
    ATTRIBUTE = cc.c3b(0x02,0xae,0x00),   --增加的属性值
    TIPS_01 = cc.c3b(0xe0,0x15,0x00),  --增强提示文字
    TIPS_02 = cc.c3b(0x97,0x64,0x2f),   --常用说明文字
    UN_ACTIVE = cc.c4b(0x69,0x69,0x69,0xff), --未激活颜色
}

---战斗用色
Color.qualityColors = {
    cc.c3b(0xff,0xff,0xff), --白色
    cc.c3b(0x99,0xff,0x33), --绿色
    cc.c3b(0x00,0xde,0xff), -- 蓝色
    cc.c3b(0xf9,0x53,0xff), --紫色
    cc.c3b(0xff,0x81,0x24), --橙色
    cc.c3b(0xff,0x29,0x12), -- 红色
    cc.c3b(0xff,0xea,0x00), -- 金色
}



-- ========================================================

local toColor3B = function(num)

    if not num then return cc.c3b(0, 0, 0) end

    local hex = 16

    -- 默认元数据是十进制，转换成hex指定的进制
    local function _hexConvert(raw, bit)
        return math.floor(raw / math.pow(hex, bit-1)) % hex
    end

    return cc.c3b(
        _hexConvert(num, 6) * hex + _hexConvert(num, 5),
        _hexConvert(num, 4) * hex + _hexConvert(num, 3),
        _hexConvert(num, 2) * hex + _hexConvert(num, 1)
    )

end

-- 浅色底部分

-- 011_白色品质 #7b3e06
Color[11] = toColor3B(0x973c05)
-- 012_黑褐色 #530e06
Color[12] = toColor3B(0x530e06)
-- 013_黑色 #1e1e1e
Color[13] = toColor3B(0x1e1e1e)
-- 014_黑白色 #020202
Color[14] = toColor3B(0x020202)
-- 031_绿色品质 #3f9f19
Color[31] = toColor3B(0x00c744)
-- 041_蓝色品质 #0084ff
Color[41] = toColor3B(0x00a2ff)
-- 043_蓝色品质 #496a8b
Color[43] = toColor3B(0x496a8b)
-- 044_蓝色品质 #2878bb
Color[44] = toColor3B(0x2878bb)
-- 051_紫色品质 #7136eb
Color[51] = toColor3B(0xc30dff)
-- 061_橙色品质 #ff6000
Color[61] = toColor3B(0xf06000)
-- 071_红色品质 #ff1100
Color[71] = toColor3B(0xed0000)
-- 073_红色 #e30000
Color[73] = toColor3B(0xe30000)
-- 081_金色品质 #a08b01
Color[81] = toColor3B(0xc49d00)
-- 083_金色 #845802
Color[83] = toColor3B(0x845802)
-- 101_灰色 #868686
Color[101] = toColor3B(0x868686)
-- 113_青色 #17a69a
Color[113] = toColor3B(0x17a69a)

-- 深色底部分

-- 021_白色品质 #fff1d4
Color[21] = toColor3B(0xff6e2)
-- 022_浅色 #d1c1a6
Color[22] = toColor3B(0xd1c1a6)
-- 023_黑白色 #fdfeff
Color[23] = toColor3B(0xfdfeff)
-- 032_绿色品质 #00ff0b
Color[32] = toColor3B(0x00c744)
-- 042_蓝色品质 #25edff
Color[42] = toColor3B(0x00a2ff)
-- 052_紫色品质 #8700ef
Color[52] = toColor3B(0xc30dff)
-- 062_橙色品质 #ff7608
Color[62] = toColor3B(0xf06000)
-- 072_红色品质 #ff0000
Color[72] = toColor3B(0xed0000)
-- 074_粉色 #ff9878
Color[74] = toColor3B(0xff9878)
-- 082_金色品质 #ffea00
Color[82] = toColor3B(0xc49d00)
-- 091_土色 #9b825b
Color[91] = toColor3B(0x9b825b)
-- 111_青色 #10fec4
Color[111] = toColor3B(0x10fec4)
-- 112_青色 #31eeff
Color[112] = toColor3B(0x31eeff)


-- 浅色底品质
Color.lightQualityColors = {
    Color[11], --白色
    Color[31], --绿色
    Color[41], -- 蓝色
    Color[51], --紫色
    Color[61], --橙色
    Color[71], -- 红色
    Color[81], -- 金色
}

-- 深色底品质
Color.darkQualityColors = {
    Color[21], --白色
    Color[32], --绿色
    Color[42], -- 蓝色
    Color[52], --紫色
    Color[62], --橙色
    Color[72], -- 红色
    Color[82], -- 金色
}

---关卡武将颜色设置的
Color.stageKnightNameColors = {
    Color.KNIGHT_NAME_WIHTE_COLOR, --白色
    Color[31], --绿色
    Color[41], -- 蓝色
    Color[51], --紫色
    Color[61], --橙色
    Color[71], -- 红色
    Color[81], -- 金色
}

--专门为关卡武将颜色设置的
function Color.getKnightNameColorOfStage(quality)
    return Color.stageKnightNameColors[quality]
end

-- 十进制的颜色数值转换成c3b

function Color.toColor3B(num)

    if not num then return cc.c3b(0, 0, 0) end

    local hex = 16

    -- 默认元数据是十进制，转换成hex指定的进制
    local function _hexConvert(raw, bit)
        return math.floor(raw / math.pow(hex, bit-1)) % hex
    end

    return cc.c3b(
        _hexConvert(num, 6) * hex + _hexConvert(num, 5),
        _hexConvert(num, 4) * hex + _hexConvert(num, 3),
        _hexConvert(num, 2) * hex + _hexConvert(num, 1)
    )

end

function Color.hexConvertColor(str)
    local colorNum = tonumber(string.format("%d",str))
    return Color.toColor3B(colorNum)
end


function Color.toHexNum(color)
    local colorStr =  string.format("0x%X%X%X",color.r,color.g,color.b)
    --local str = ""..color.r..color.g..color.b
    return checknumber(colorStr)
end

function Color.toHexStr(color)
    local colorStr =  string.format("0x%02X%02X%02X", color.r, color.g, color.b)
    return colorStr
end

-- 十进制的颜色数值转换成c4b

function Color.toColor4B(num)

    local color = toColor3B(num)

    return cc.c4b(color.r, color.g, color.b, 255)

end

-- 颜色值转换成十进制数

function Color.colorToNumber(color)

    if type(color) == "table" then
        local num = 0
        if color.r then
            num = num + color.r * 65536
        end
        if color.g then
            num = num + color.g * 256
        end
        if color.b then
            num = num + color.b
        end

        return num
    else
        return checknumber(color)
    end
end

--=========================================================================================

-- 下面是新版

-- 弹窗文字样式

-- 一级标题字
Color.COLOR_POPUP_TITLE = cc.c3b(0x97, 0x20, 0x00)
-- 小标题文字
Color.COLOR_POPUP_TITLE_TINY = cc.c3b(0x89, 0x40, 0x13)
-- 重点描述字
Color.COLOR_POPUP_DESC_NOTE = cc.c3b(0x61, 0x3c, 0x2b)
-- 常用描述字
Color.COLOR_POPUP_DESC_NORMAL = cc.c3b(0x97, 0x64, 0x2f)
-- 增强提示字
Color.COLOR_POPUP_NOTE = cc.c3b(0xe0, 0x15, 0x00)
-- 增加属性字
Color.COLOR_POPUP_ADD_PROPERTY = cc.c3b(0x02, 0xae, 0x00)
-- 未激活文字
Color.COLOR_POPUP_UNACTIVATED = cc.c3b(0x69, 0x69, 0x69)
-- 特殊强调字
Color.COLOR_POPUP_SPECIAL_NOTE = cc.c3b(0xff, 0xde, 0x00)

-- 进度条数字
Color.COLOR_POPUP_PROG_NUM = cc.c3b(0xff, 0xfe, 0xe8)



-- 获取品质色 较暗
function Color.getDarkColor(index)
    -- body
    assert(Color.COLOR_QUALITY_DARK[index], "Invalid color: "..tostring(index))

    return Color.COLOR_QUALITY_DARK[index]
end

-- 获取品质色

function Color.getColor(index, isDark)

    assert(Color.COLOR_QUALITY[index], "Invalid color: "..tostring(index))

    if not isDark then
        return Color.COLOR_QUALITY[index]
    else
        return Color.getDarkColor(index)
    end

end

-- 品质色的描边

function Color.getColorOutline(index)

    assert(Color.COLOR_QUALITY_OUTLINE[index], "Invalid color outline: "..tostring(index))

    return Color.COLOR_QUALITY_OUTLINE[index]

end

--获取暴击文字品质色
function Color.getCritColor(index, isNotDark)

    assert(type(index) == "number", "Invalid color index: "..tostring(index))

    index = index == 1 and index or (index - 1)
    index = index + 1

    return Color.getColor(index, not isNotDark)
end

-- 获取暴击品质色的描边
function Color.getCritColorOutline(index)

    assert(type(index) == "number", "Invalid color outline index: "..tostring(index))

    index = index == 1 and index or (index - 1)
    index = index + 1

    assert(Color.COLOR_QUALITY_OUTLINE[index], "Invalid color outline: "..tostring(index))

    return Color.COLOR_QUALITY_OUTLINE[index]

end


function Color.c3bToc4b(color)

    return cc.c4b(color.r, color.g, color.b, 0xff)

end

--隐私协议前言颜色
Color.COLOR_SECRET_QIANYAN = cc.c3b(0x39, 0x37, 0x37)
--隐私协议文案颜色
Color.COLOR_SECRET_WORDS = cc.c3b(0x69, 0x67, 0x67)

-- 场景文字样式

-- 模块标题字
Color.COLOR_SCENE_TITLE = cc.c3b(0x61, 0x3c, 0x2b)
-- 小标题文字
Color.COLOR_SCENE_TITLE_TINY = cc.c3b(0x75, 0x34, 0x0c)
-- 重点描述字
Color.COLOR_SCENE_DESC_NOTE = cc.c3b(0xff, 0xff, 0xff)
-- 常用描述字
Color.COLOR_SCENE_DESC_NORMAL = cc.c3b(0xee, 0xe1, 0xcf)
-- 增强提示字
Color.COLOR_SCENE_NOTE = cc.c3b(0xff, 0x90, 0x2e)
-- 增强属性字
Color.COLOR_SCENE_ADD_PROPERTY = cc.c3b(0x6e, 0xf1, 0x2d)
-- 低调说明字
Color.COLOR_SCENE_TIP = cc.c3b(0xd6, 0xd0, 0x70)

-- 场景文字样式用到的描边
Color.COLOR_SCENE_OUTLINE = cc.c4b(0x55, 0x39, 0x23, 0xff)

-- icon框上数值的颜色
Color.COLOR_SCENE_ICON_NUM = cc.c3b(0xee, 0xe1, 0xcf)

-- icon框上数值文字描边
Color.COLOR_SCENE_ICON_NUM_OUTLINE = cc.c4b(0x34, 0x30, 0x29, 0xff)




-- 特殊按钮

-- 返回
Color.COLOR_BUTTON_BACK = cc.c3b(0xa6, 0x2a, 0x08)
-- 返回投影
Color.COLOR_BUTTON_BACK_SHADOW = cc.c4b(0xee, 0xe1, 0xce, 0xff)

-- 出售
Color.COLOR_BUTTON_SELL = cc.c3b(0x61, 0x3c, 0x2b)
-- 出售投影
Color.COLOR_BUTTON_SELL_SHADOW = cc.c4b(0xee, 0xe1, 0xce, 0xff)



-- 大标签（选中）
Color.COLOR_TAB_BIG_SELECTED = cc.c3b(0xa6, 0x2a, 0x08)
-- 大标签（未选中）
Color.COLOR_TAB_BIG_UNSELECTED = cc.c3b(0x97, 0x20, 0x00)
-- 大标签投影
Color.COLOR_TAB_BIG_SHADOW = cc.c4b(0xee, 0xe1, 0xce, 0xff)

-- 小标签（选中）
Color.COLOR_TAB_LITTLE_SELECTED = cc.c3b(0x75, 0x34, 0x0c)
-- 小标签（未选中）
Color.COLOR_TAB_LITTLE_UNSELECTED = cc.c3b(0x97, 0x20, 0x00)
-- 小标签投影
Color.COLOR_TAB_LITTLE_SHADOW = cc.c4b(0xee, 0xe1, 0xce, 0xff)


-- 文字标签颜色
Color.COLOR_TAB_ITEM = cc.c3b(0x68, 0x44, 0x28)


-- 九宫框--主要文字
Color.COLOR_TITLE_MAIN = cc.c3b(0x86, 0x55, 0x2c)
-- 九宫框--次要文字
Color.COLOR_TITLE_SEC = cc.c3b(0x68, 0x44, 0x28)


-- 聊天频道颜色
Color.channelColors = {
    [1] =  {hex = 0x80ff0f,c3b = cc.c3b(0x80, 0xff, 0x0f),outlineColor =  cc.c3b(0x18, 0x36, 0x00)},--世界
    [2] =  {hex = 0x80ff0f,c3b = cc.c3b(0x80, 0xff, 0x0f),outlineColor =  cc.c3b(0x18, 0x36, 0x00)},--私聊
    [3] =  {hex = 0x1ab2ff,c3b = cc.c3b(0x1a, 0xb2, 0xff),outlineColor =  cc.c3b(0x00, 0x15, 0x40)},--军团
    [4] =  {hex = 0xffc619,c3b = cc.c3b(0xff, 0xc6, 0x19),outlineColor =  cc.c3b(0x59, 0x1e, 0x00)},--系统
    [6] =  {hex = 0xff33d0,c3b = cc.c3b(0xff, 0x33, 0xd0),outlineColor =  cc.c3b(0x59, 0x1e, 0x00)},--队伍
    [7] =  {hex = 0xc273ff,c3b = cc.c3b(0xd6, 0x95, 0xff),outlineColor =  cc.c3b(0x59, 0x1e, 0x00)},--跨服
}

addColor(import(".ColorNew"))

--副本字的颜色
Color.ChapterType =
{
    [1] = {color = cc.c3b(0xd6, 0x9f, 0x5f), outlineColor =  cc.c3b(0x58, 0x21, 0x06)},         --普通
    [2] = {color = cc.c3b(0xff, 0xf7, 0xe2), outlineColor =  cc.c3b(0xd6, 0x50, 0x17)},         --选中
    [3] = {color = cc.c3b(0x8c, 0x59, 0x06), outlineColor =  cc.c3b(0x58, 0x21, 0x06)},         --灰态
}

function Color.getChapterTypeColor(type)
    return Color.ChapterType[type].color
end

function Color.getChapterTypeOutline(type)
    return Color.ChapterType[type].outlineColor
end

--副本名字颜色
function Color.getChapterNameColor()
    return cc.c3b(0xff, 0xad, 0x39)
end

--副本名字沟边
function Color.getChapterNameOutline()
    return cc.c3b(0x6d, 0x2f, 0x0c)
end

--抽卡字色以及沟边色
function Color.getDrawCardResColor()
    return cc.c3b(0xff, 0xf7, 0xe2), cc.c3b(0x8e, 0x57, 0x00)
end

--普通聊天颜色
function Color.getChatNormalColor()
    return cc.c3b(0xa5, 0x63, 0x2d)
end

--show武将字体颜色沟边
function Color.getHeroYellowShowColor()
    return cc.c3b(0xff, 0xd8, 0x00), cc.c3b(0x4e, 0x00, 0x00)
end

--e类字体颜色,先暗，后绿
function Color.getETypeColor()
    return cc.c3b(0xb2, 0x6b, 0x24), cc.c3b(0xb2, 0xff, 0x19)
end

--f类字的颜色，描边
function Color.getFTypeColor()
    return cc.c3b(0xff, 0xd8, 0x00), cc.c3b(0x77, 0x29, 0x09)
end

--a类绿色字体
function Color.getATypeGreen()
    return cc.c3b(0x2f, 0x9f, 0x07)
end

--a类棕黄色字体
function Color.getATypeYellow()
    return cc.c3b(0xb6, 0x65, 0x11)
end

--f类棕红色字体
function Color.getFTypeRed()
    return cc.c3b(0xe0, 0x4b, 0x0a)
end

Color.DailyChooseColor =
{
    [1] = {color = cc.c3b(0xfa, 0xfa, 0xf2), outlineColor =  cc.c3b(0x65, 0x47, 0x2a)},         --难度1
    [2] = {color = cc.c3b(0xe4, 0xff, 0xc0), outlineColor =  cc.c3b(0x29, 0x53, 0x18)},         --难度2
    [3] = {color = cc.c3b(0xc0, 0xfb, 0xff), outlineColor =  cc.c3b(0x28, 0x41, 0x6b)},         --难度3
    [4] = {color = cc.c3b(0xfc, 0xc2, 0xff), outlineColor =  cc.c3b(0x5b, 0x21, 0x70)},         --难度4
    [5] = {color = cc.c3b(0xff, 0xc6, 0x7c), outlineColor =  cc.c3b(0x6f, 0x3c, 0x0e)},         --难度5
    [6] = {color = cc.c3b(0xff, 0xc2, 0xa1), outlineColor =  cc.c3b(0x83, 0x11, 0x11)},         --难度6～以上
}

function Color.getDailyChooseColor(index)
    if index > #Color.DailyChooseColor then
        index = #Color.DailyChooseColor
    end
    return Color.DailyChooseColor[index]
end


function Color.getTypeAColor()
    return cc.c3b(0x70, 0x38, 0x0d)
end

function Color.getSettlementRankColor(type)
    if type == 1 then
        return cc.c3b(0xfe, 0xe1, 0x02), cc.c3b(0x77, 0x1f, 0x00)
    elseif type == 2 then
        return cc.c3b(0xa8, 0xff, 0x00), cc.c3b(0x1e, 0x33, 0x00)
    end
end

function Color.getSummaryStarColor()
    return cc.c3b(0xff, 0xb8, 0x0c)
end

function Color.getSummaryLineColor()
    return cc.c3b(0xff, 0xb8, 0x0c)
end

function Color.getFamousNameColor()
    return cc.c3b(0xfe,0xf3,0xf3)
end

function Color.getMineGuildGreen()
    return cc.c3b(0x08, 0xff, 0x00)
end

function Color.getMineGuildRed()
    return cc.c3b(0xff, 0x00, 0x00)
end

Color.MinePercentColor = 
{
    [1] = {color = cc.c3b(0xff, 0xff, 0xff), outlineColor = cc.c3b(0x3a, 0x9a, 0x00)},      --绿
    [2] = {color = cc.c3b(0xff, 0xff, 0xff), outlineColor = cc.c3b(0xa8, 0x43, 0x00)},      --黄
    [3] = {color = cc.c3b(0xff, 0xff, 0xff), outlineColor = cc.c3b(0xa4, 0x00, 0x01)},      --红
}

function Color.getMinePercentColor(percent)
    local type = 1
    if percent > 25 and percent <= 75 then 
        type = 2
    elseif percent <= 25 then 
        type = 3
    end
    return Color.MinePercentColor[type]
end

Color.MineStateColor = 
{
    cc.c3b(0x25, 0xff, 0x01),       --绿
    cc.c3b(0xff, 0xc6, 0x00),       --黄
    cc.c3b(0xff, 0x00, 0x06),       --红
}
function Color.getMineStateColor(type)
    return Color.MineStateColor[type]
end

Color.MineGuildColor = 
{
    cc.c3b(0x2f, 0x9f, 0x07),       --绿
    cc.c3b(0xff, 0x00, 0x00),       --红
}
function Color.getMineGuildColor(type)
    return Color.MineGuildColor[type]
end

Color.MineInfoColor = 
{
    cc.c3b(0x08, 0xff, 0x00),       --绿
    cc.c3b(0xff, 0xb8, 0x0c),       --黄
    cc.c3b(0xff, 0x00, 0x00),       --红
    cc.c3b(0x76, 0x76, 0x76)        --灰色
}
function Color.getMineInfoColor(type)
    return Color.MineInfoColor[type]
end

function Color.getSmallMineGuild()
    return cc.c3b(0xff, 0xf5, 0xce)
end

function Color.getCampGray()
    return cc.c3b(0x97, 0x97, 0x97)
end

function Color.getCampWhite()
    return cc.c3b(0xff, 0xff, 0xff)
end

function Color.getCampRed()
    return cc.c3b(0xff, 0x00, 0x00)
end

function Color.getCampGreen()
    return cc.c3b(0xa8, 0xff, 0x00)
end

function Color.getCampBrownOutline()
    return cc.c4b(0xb7, 0x76, 0x41, 0xff)
end

function Color.getCampBrown()
    return cc.c3b(0xc9, 0x65, 0x28)
end

function Color.getCampScoreGray()
    return cc.c3b(0xac, 0x7f, 0x69)
end

--1绿色，2黄色，3红色
Color.BuffCountColor = 
{
    [1] = {color = cc.c3b(0xdb, 0xff, 0x0e), outline = cc.c3b(0x34, 0x99, 0x14)},
    [2] = {color = cc.c3b(0xff, 0xe6, 0x1b), outline = cc.c3b(0xb8, 0x7a, 0x11)},
    [3] = {color = cc.c3b(0xff, 0x9f, 0x16), outline = cc.c3b(0xbd, 0x22, 0x15)},
}
function Color.getBuffCountColor(index)
    return Color.BuffCountColor[index]
end

-- 战法
Color.TacticsActiveColor = cc.c3b(0x00, 0xff, 0x1e)
Color.TacticsBlackColor = cc.c3b(0, 0, 0)
Color.TacticsGrayColor = cc.c3b(0xe4, 0xe4, 0xe4)
Color.TacticsCommonColor = cc.c3b(0xb4, 0x64, 0x14)
Color.TacticsCommonColor2 = cc.c3b(0x71, 0x43, 0x06)
Color.TacticsBlueColor = cc.c3b(0x11, 0xB2, 0x00)
Color.TacticsDescriptionColor = cc.c3b(0xB4, 0x64, 0x14)

return readOnly(Color)
