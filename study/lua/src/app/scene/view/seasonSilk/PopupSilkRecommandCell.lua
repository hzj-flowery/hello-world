-- @Author wangyu
-- @Date 10.23.2019
-- @Role

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSilkRecommandCell = class("PopupSilkRecommandCell", ListViewCellBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local PopupAlert = require("app.ui.PopupAlert")
local SeasonSilkIconCell = require("app.scene.view.seasonSilk.SeasonSilkIconCell")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function PopupSilkRecommandCell:ctor()
    self._resource      = nil
    self._imgBg         = nil
    self._listView      = nil
    self._textDesc      = nil
    self._silkList      = {}
    self._curGroupPos   = nil
    self._bgCapInsets   = nil   -- 背景scale9配置，重设图片会变

    local resource = {
        file = Path.getCSB("PopupSilkRecommandCell", "seasonSilk"),
        binding = {
			_btnApply = {
				events = {{event = "touch", method = "_onBtnApply"}}
			},
		},
    }
    self:setName("PopupSilkRecommandCell")
    PopupSilkRecommandCell.super.ctor(self, resource)
end

function PopupSilkRecommandCell:onCreate()
    self:_updateSize()
    self._listView:doLayout()
    self._listView:setSwallowTouches(false)
    self._btnApply:setString(Lang.get("season_silk_recommand_apply"))
	self._bgCapInsets = self._imgBg:getCapInsets()
end

function PopupSilkRecommandCell:onEnter()
    self:_initData()
    self:_updateListView()
end

function PopupSilkRecommandCell:_initData()
    self._silkList = {}
end

function PopupSilkRecommandCell:_updateSize()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

function PopupSilkRecommandCell:_createCell(item)
    local cell = SeasonSilkIconCell.new()
    cell:updateUI(item)
	self._listView:pushBackCustomItem(cell)
end

function PopupSilkRecommandCell:_updateListView()
    self._listView:removeAllItems()
    for i,v in ipairs(self._silkList) do
        local item = {}
        item.silkId = v
        self:_createCell(item)
    end
end

function PopupSilkRecommandCell:_onBtnApply(sender)
    if not self._curGroupPos then
        return
    end

    local callback = function()
        G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK)
        G_UserData:getSeasonSport():setModifySilkGroupName(true)
        G_UserData:getSeasonSport():c2sFightsSilkbagSetting((self._curGroupPos - 1), self._data.title, self._silkList)
    end
    
    local title = Lang.get("season_silk_recommand_confirm_title")
    local content = Lang.get("season_silk_recommand_confirm", {name = self._data.title})
    local alert = PopupAlert.new(title, content, callback)
    alert:openWithAction()
end

-- @Role    UpdateUI
function PopupSilkRecommandCell:updateUI(pos, data)
    if not data then
        return 
    end
    self._curGroupPos = pos

    self._data = data

    local index = data.index
    local bgres = nil
    if index%2==1 then
        bgres = Path.getUICommon("img_com_board_list01a")
    else
        bgres = Path.getUICommon("img_com_board_list01b")
    end
    self._imgBg:loadTexture(bgres)
    self._imgBg:setCapInsets(self._bgCapInsets)

    local descStr = Lang.get("season_silk_recommand_cell_desc", {title=data.title, desc=data.desc})
    self._textDesc:setString(descStr)
    self._silkList = {}
    for i=1,10 do
        local item = data["silkbag"..i]
        local info = require("app.config.silkbag").get(item)
        if info then
            table.insert(self._silkList, item)
        end
    end
    self:_updateListView()
end

return PopupSilkRecommandCell