local ViewBase = require("app.ui.ViewBase")
local HorseView = class("HorseView", ViewBase)
local RedPointHelper = require("app.data.RedPointHelper")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")

function HorseView:ctor()
    local resource = {
		file = Path.getCSB("HorseView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnRace = {
				events = {{event = "touch", method = "_onRaceClick"}}
			},
			_buttonHorseList = {
				events = {{event = "touch", method = "_onListClick"}}
			},
			_buttonHorseJudge = {
				events = {{event = "touch", method = "_onJudgeClick"}}
			},
			_buttonHorseShop = {
				events = {{event = "touch", method = "_onShopClick"}}
            },
            _btnHorsePhoto = {
                events = {{event = "touch", method = "_onHorsePhotoClick"}}
            },
		}
	}
	HorseView.super.ctor(self, resource, 115)
end

function HorseView:onCreate()
	self._topBar:setImageTitle("txt_sys_com_horse")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_HORSE)
end

function HorseView:onEnter()
    
    self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._redPointUpdate))
	self:_updateBtnRP()
end

function HorseView:onExit()
    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil
end

function HorseView:_onHorsePhotoClick()
    local popupHorseKarma = require("app.scene.view.horseTrain.PopupHorseKarma").new(self)
	popupHorseKarma:openWithAction()
end

function HorseView:_onRaceClick()
    G_SceneManager:showScene("horseRace")
end

function HorseView:_onListClick()
    G_SceneManager:showScene("horseList")
end

function HorseView:_onJudgeClick()
	G_SceneManager:showScene("horseJudge")
end

function HorseView:_onShopClick()
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP)
end

function HorseView:_updateBtnRP()
	local reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_LIST) --我的战马
	self._imageHorseListRP:setVisible(reach1)

	local reach2 = not require("app.scene.view.horseRace.HorseRaceHelper").isRewardFull() --马跃檀溪
	self._imageHorsePlayRP:setVisible(reach2)

	local reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_JUDGE) --相马
	self._imageHorseJudgeRP:setVisible(reach3)

	local reach4 = false --战马商店
    self._imageHorseShopRP:setVisible(reach4)
    
    -- local horsePhotoValid = G_UserData:getHorse():isHorsePhotoValid()          --战马图鉴
    local horsePhotoValid = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_BOOK, "horseBook")
    self._imageHorsePhotoRP:setVisible(horsePhotoValid)
end

function HorseView:_redPointUpdate()
    local horsePhotoValid = G_UserData:getHorse():isHorsePhotoValid()          --战马图鉴
    self._imageHorsePhotoRP:setVisible(horsePhotoValid)
end

return HorseView

