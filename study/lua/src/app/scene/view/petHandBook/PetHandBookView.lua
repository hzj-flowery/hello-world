--
-- Author: hedili
-- Date: 2017-02-28 15:09:42
-- 神兽图鉴
local ViewBase = require("app.ui.ViewBase")
local PetHandBookView = class("PetHandBookView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local PetHandBookCell = import(".PetHandBookCell")
local PetConst = require("app.const.PetConst")
local CSHelper = require("yoka.utils.CSHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")
local FUNC_ID_LIST = {
	FunctionConst.FUNC_PET_HAND_BOOK_ADD,	
}

function PetHandBookView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
		logWarn("PetHandBookView:waitEnterMsg   xxxxxxx")
	end
	G_UserData:getHandBook():c2sGetResPhoto()
    local signal = G_SignalManager:add(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack)
	return signal
end



function PetHandBookView:ctor()
	self._petListView = nil
	local resource = {
		file = Path.getCSB("PetHandBookView", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}

	
	PetHandBookView.super.ctor(self, resource)
end

function PetHandBookView:onCreate()
	self._petCellList = {}
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_shenshoutujian")

	
	self["_funcIcon1"]:updateUI(FUNC_ID_LIST[1])
	self["_funcIcon1"]:addClickEventListenerEx(handler(self, self._onButtonClick))

	self["_funcIcon1"]:setVisible(false)
end

function PetHandBookView:_onButtonClick( sender )

	local funcId =  sender:getTag()
	if funcId > 0 then
		 local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(funcId)
	end
end


function PetHandBookView:_iniPetList( ... )
	-- body
	self._petCellList = {}
	local pet_map = require("app.config.pet_map")
	self._petListView:removeAllChildren()
	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if G_UserData:getPet():isPetMapShow(petMapData.id) == true then
			local cell = self:pushPetCell(petMapData)
			table.insert( self._petCellList, cell)
		end
	end
end

function PetHandBookView:getPetCellById( petMapId )
	-- body
	for i, cellWidget in ipairs(self._petCellList) do
		if cellWidget:getPetMapId() == petMapId then
			return cellWidget
		end
	end
	return nil
end
function PetHandBookView:pushPetCell( petMapData )
	-- body
	local cell = PetHandBookCell.new()
	cell:updateUI(petMapData)
	self._petListView:pushBackCustomItem(cell)
	return cell
end

function PetHandBookView:onEnter()
	--神兽图鉴属性
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_PET_HAND_BOOK_ADD"])
	
	self._signalActivePetPhoto = G_SignalManager:add(SignalConst.EVENT_ACTIVE_PET_PHOTO_SUCCESS, handler(self, self._onEventActivePetPhoto))
	self:_iniPetList()
	self:_updateData()
end

function PetHandBookView:onExit()
	self._signalActivePetPhoto:remove()
	self._signalActivePetPhoto = nil
end


function PetHandBookView:_onEventActivePetPhoto(id, message )
	-- body
	logWarn('PetHandBookView:_onEventActivePetPhoto')
	local petMapId = message.id	
	local cellWidget = self:getPetCellById(petMapId)

	dump(cellWidget)
	dump(petMapId)

	self:_updateData()
	self:_playPetActiveSummary(petMapId)
	if cellWidget then
		logWarn('PetHandBookView:_onEventActivePetPhoto')
		cellWidget:procPetMapState()
	end
end



--播放缘分激活成功飘字
function PetHandBookView:_playPetActiveSummary(petMapId)
    local summary = {}

    if petMapId then
        local config = UserDataHelper.getPetMapConfig(petMapId)
        local content = Lang.get("summary_pet_map_active", {
            petMapName = config.name
        })
        local param = {
            content = content,
        } 
        table.insert(summary, param)
    end
    
    self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)
    G_Prompt:playTotalPowerSummary()
end

--加入基础属性飘字内容
function PetHandBookView:_addBaseAttrPromptSummary(summary)
	local attrList = self._recordAttr:getCurAttrList()
	for key ,value in pairs(attrList) do
		local attrId = key
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
            local param = {
                content = AttrDataHelper.getPromptContent(attrId, diffValue),
                anchorPoint = cc.p(0, 0.5),
                startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
            }
            table.insert(summary, param)
        end
	end
    return summary
end



function PetHandBookView:_updateData()
	self:_recordBaseAttr()
	G_UserData:getAttr():recordPower()
end



function PetHandBookView:_recordBaseAttr()


    local attrInfo = UserDataHelper.getPetMapAttr(param)

	dump(attrInfo)
	self._recordAttr:updateData(attrInfo)
	self._currAttrInfo = attrInfo
end

return PetHandBookView