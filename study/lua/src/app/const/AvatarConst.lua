--
-- Author: Liangxu
-- Date: 2017-12-26 11:21:56
-- 变身卡常量
local AvatarConst = {}

AvatarConst.color2ImageBg = {
	[4] = "img_Turnscard_shop_zi",
	[5] = "img_Turnscard_shop_cheng",
	[6] = "img_Turnscard_shop_hong",
}

AvatarConst.color2NameBg = {
	[4] = "img_Turnscard_zise",
	[5] = "img_Turnscard_huang",
	[6] = "img_Turnscard_namebg",
}

AvatarConst.SHOP_SPECIAL_ID_1 = 9999 --变身卡商店特殊，化形羽置换
AvatarConst.SHOP_SPECIAL_ID_2 = 9998

return readOnly(AvatarConst)