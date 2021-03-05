--
-- Author: liushiyin
-- Date: 2018-12-24
--

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHonorTitleItemCell = class("PopupHonorTitleItemCell", ListViewCellBase)
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local HonorTitleConst = require("app.const.HonorTitleConst")
local Path = require("app.utils.Path")

function PopupHonorTitleItemCell:ctor()
    self._btnClick = nil -- 操作按钮
    self._titleDesc = nil -- 描述 c++
    self._titleDescTime = nil -- 有效期
    self._titleImage = nil -- 称号名字
    self._less = false  -- 有效期少于一天

    self._cellValue = nil --称号数据指针
    local resource = {
        file = Path.getCSB("PopupPlayerHonorTitleCell", "playerDetail"),
        binding = {}
    }

    PopupHonorTitleItemCell.super.ctor(self, resource)
end

function PopupHonorTitleItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._btnClick:addClickEventListenerEx(handler(self, self._onBtnClick))

    local delay = cc.DelayTime:create(1) -- 添加定时器
    local sequence =
        cc.Sequence:create(
        delay,
        cc.CallFunc:create(
            function()
                if self._cellValue:getTimeType() == HonorTitleConst.TIME_TYPE_LIMIT then
                    if self._less then
                        local dateStr = PopupHonorTitleHelper.getExpireTimeString(self._cellValue:getExpireTime())
                        self._titleDescTime:setString(dateStr)
                    end
                end
            end
        )
    )
    local action = cc.RepeatForever:create(sequence)
    self:runAction(action)
end

-- function PopupHonorTitleItemCell:onEnter()

-- end

function PopupHonorTitleItemCell:updateUI(index, cellValue)
    self:setName("PopupHonorTitleItemCell" .. index)
    self._cellValue = cellValue
    self._btnClick:setVisible(self._cellValue:isIsOn())

    self._less = false
    if cellValue:getTimeType() == HonorTitleConst.TIME_TYPE_LIMIT then -- 有时效的称号
        self._titleDescTime:setColor(Colors.SYSTEM_TARGET_RED)
        local dateStr, less = PopupHonorTitleHelper.getExpireTimeString(cellValue:getExpireTime())
        self._less = less
        self._titleDescTime:setString(dateStr)
    else -- 永久
        self._titleDescTime:setColor(Colors.SYSTEM_TARGET)
        self._titleDescTime:setString(Lang.get("honor_title_permanent"))
    end
    if self._cellValue:isIsEquip() then -- 是否装备
        self._btnClick:switchToNormal()
        self._btnClick:setString(Lang.get("honor_title_unload"))
    else
        self._btnClick:switchToHightLight()
        self._btnClick:setString(Lang.get("honor_title_equip"))
    end

    self._titleDesc:setString(cellValue:getDes()) --  详细描述
    UserDataHelper.appendNodeTitle(self._titleImage, cellValue:getId(), self.__cname)
end

-- 点击装备按钮
function PopupHonorTitleItemCell:_onBtnClick()
    -- logWarn("PopupHonorTitleItemCell:_onBtnClick1")
    if not PopupHonorTitleHelper.enoughLevelAndOpendayByTitleId(self._cellValue:getId()) then
        G_Prompt:showTip(Lang.get("honor_title_not_satisfied"))
        return
    end
    if self._cellValue:isIsEquip() then
        G_UserData:getTitles():c2sEquipTitleInfo(HonorTitleConst.TITLE_UNLOAD_ID)
    else
        -- logWarn("PopupHonorTitleItemCell:_onBtnClick id"..self._cellValue:getId())
        G_UserData:getTitles():c2sEquipTitleInfo(self._cellValue:getId())
    end
end

return PopupHonorTitleItemCell
