
local HomelandBuffIcon = class("HomelandBuffIcon")
local HomelandBuffStateNode = require("app.scene.view.homeland.HomelandBuffStateNode")

local HomelandConst = require("app.const.HomelandConst")


function HomelandBuffIcon:ctor(target)
    self._target = target
    self._showType = HomelandConst.SHOW_ALL_BUFF
    self._showBuffId = 0
    
    self._buttonIcon = ccui.Helper:seekNodeByName(self._target, "ButtonIcon")
    self._buttonIcon:addClickEventListener(handler(self, self._onClickIcon))
end

function HomelandBuffIcon:updateUI()
    local datas = G_UserData:getHomeland():getBuffDatasBySort()
    local visible = #datas > 0
    self._target:setVisible(visible)

    self._showType = HomelandConst.SHOW_ALL_BUFF
end

function HomelandBuffIcon:updateOneBuffById(id)
    local datas = G_UserData:getHomeland():getBuffDatasWithBaseId(id)
    local visible = #datas > 0
    self._target:setVisible(visible)

    self._showBuffId = id
    self._showType = HomelandConst.SHOW_ONE_BUFF
end

function HomelandBuffIcon:_onClickIcon()
    local popupView = G_SceneManager:getRunningScene():getPopupByName("HomelandBuffStateNode")
    if popupView then
        popupView:close()
    else
        local popup = HomelandBuffStateNode.new(self._target, self._showBuffId)
        popup:open()
    end
end

return HomelandBuffIcon