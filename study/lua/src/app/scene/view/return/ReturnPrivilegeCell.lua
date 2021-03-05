--
-- Author: hyl
-- Date: 2019-7-8 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ReturnPrivilegeCell = class("ReturnPrivilegeCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local Returnprivilege = require("app.config.return_privilege")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")

function ReturnPrivilegeCell:ctor()

    self._curInfo = nil
    self._isReset = false
    
	local resource = {
		file = Path.getCSB("ReturnPrivilegeCell", "return"),
        binding = {
			_btn = {
				events = {{event = "touch", method = "_onBtnClick"}}
			},
        },
	}
	ReturnPrivilegeCell.super.ctor(self, resource)
end

function ReturnPrivilegeCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function ReturnPrivilegeCell:update(data)
    self._curInfo = data
	--dump(data)
    
    local configInfo = Returnprivilege.get(data.id)
    --dump(configInfo)

    self._textName:setString(configInfo.privilege_txt)

    local iconPath = self:_getIconPathByType(configInfo.privilege_type)
    self._icon:loadTexture(iconPath)

    local maxTimes = configInfo.privilege_value
    
    if configInfo.privilege_type == 1 or configInfo.privilege_type == 2 then
        local strArr = string.split(configInfo.button_txt, "|")
        self._btn:setString(strArr[1])

        local isNeedReset = false

        if configInfo.privilege_type == 1 then -- 日常副本
            isNeedReset = G_UserData:getDailyDungeonData():isNeedReset()
        elseif configInfo.privilege_type == 2 then -- 过关斩将
            isNeedReset = G_UserData:getTowerData():isNeedReset()
        else
        end

        self._btn:setString( isNeedReset and strArr[1] or strArr[2])
        self._btn:setEnabled(isNeedReset == false or data.num > 0)

        self._isReset = isNeedReset
    else
        self._btn:setString(configInfo.button_txt)
        self._btn:setEnabled(true)
        self._isReset = false
    end

    local richText = Lang.get("return_progress",
        { 
            title = Lang.get("times_title"), 
            cur = data.num, curColor = Colors.colorToNumber(data.num > 0 and Colors.NORMAL_BG_ONE or Colors.BRIGHT_BG_RED), 
            max = maxTimes, maxColor = Colors.colorToNumber(Colors.NORMAL_BG_ONE )
        }
    )
    self:_createProgressRichText(richText)
end

function ReturnPrivilegeCell:_onBtnClick ()
    if G_UserData:getReturnData():isActivityEnd() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
    end
    
    dump(self._curInfo)
    local configInfo = Returnprivilege.get(self._curInfo.id)
    if configInfo == nil then return end

    if self._isReset then
        G_UserData:getReturnData():c2sReceiveAwards(2, self._curInfo.id)
    else
        print("configInfo.function_id "..configInfo.function_id)
        WayFuncDataHelper.gotoModuleByFuncId(configInfo.function_id)
    end
end

function ReturnPrivilegeCell:_getIconPathByType (type)
    local iconName = ""

    if type == 1 then
        iconName = "btn_main_enter5_resretrieval"
    elseif type == 2 then
        iconName = "btn_city_x2maoxian"
    elseif type == 3 then
        iconName = "btn_city_x2maoxian"
    elseif type == 4 then
        iconName = "btn_city_x2maoxian"
    elseif type == 5 then  
        iconName = "btn_city_x2maoxian"
    elseif type == 6 then
        iconName = "btn_main_enter_travel"
    elseif type == 7 then
        iconName = "btn_main_enter_guild"
    elseif type == 8 then
        iconName = "btn_city_x2maoxian"
    elseif type == 9 then
        iconName = "btn_city_x2maoxian"
    elseif type == 10 then
        iconName = "btn_city_x2maoxian"
    end

    return Path.getCommonIcon("main", iconName)
end

--创建富文本
function ReturnPrivilegeCell:_createProgressRichText(richText)
    self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeProgress:addChild(widget)
end

return ReturnPrivilegeCell