export default class VoiceConst {
    //  VoiceErrno
public static GCLOUD_VOICE_SUCC           			= 0  // 
		
// common base err
public static GCLOUD_VOICE_PARAM_NULL 				= 4097  //  some param is null
public static GCLOUD_VOICE_NEED_SETAPPINFO 		= 4098  //  you should call SetAppInfo first before call other api
public static GCLOUD_VOICE_INIT_ERR 				= 4099  //  Init Erro
public static GCLOUD_VOICE_RECORDING_ERR 			= 4100  //  now is recording  //  can't do other operator
public static GCLOUD_VOICE_POLL_BUFF_ERR 			= 4101  //  poll buffer is not enough or null 
public static GCLOUD_VOICE_MODE_STATE_ERR 			= 4102  //  call some api  //  but the mode is not correct  //  maybe you shoud call SetMode first and correct
public static GCLOUD_VOICE_PARAM_INVALID 			= 4103  //  some param is null or value is invalid for our request  //  used right param and make sure is value range is correct by our comment 
public static GCLOUD_VOICE_OPENFILE_ERR 			= 4104  //  open a file err
public static GCLOUD_VOICE_NEED_INIT 				= 4105  //  you should call Init before do this operator
public static GCLOUD_VOICE_ENGINE_ERR 				= 4106  //  you have not get engine instance  //  this common in use c# api  //  but not get gcloudvoice instance first
public static GCLOUD_VOICE_POLL_MSG_PARSE_ERR 		= 4107  //  this common in c# api  //  parse poll msg err
public static GCLOUD_VOICE_POLL_MSG_NO 			= 4108  //  poll  //  no msg to update


// realtime err
public static GCLOUD_VOICE_REALTIME_STATE_ERR 		= 8193  //  call some realtime api  //  but state err  //  such as OpenMic but you have not Join Room first
public static GCLOUD_VOICE_JOIN_ERR 				= 8194  //  join room failed
public static GCLOUD_VOICE_QUIT_ROOMNAME_ERR 		= 8195  //  quit room err  //  the quit roomname not equal join roomname
public static GCLOUD_VOICE_OPENMIC_NOTANCHOR_ERR 	= 8196  //  open mic in bigroom  // but not anchor role
public static GCLOUD_VOICE_CREATE_ROOM_ERR 		= 8197	// create room error
public static GCLOUD_VOICE_NO_ROOM 				= 8198	// no such room
public static GCLOUD_VOICE_QUIT_ROOM_ERR 			= 8199	// quit room error
public static GCLOUD_VOICE_ALREADY_IN_THE_ROOM 	= 8200	// already in the room which in JoinXxxxRoom

// message err
public static GCLOUD_VOICE_AUTHKEY_ERR 			= 12289  //  apply authkey api error
public static CLOUD_VOICE_PATH_ACCESS_ERR 			= 12290  //  the path can not access   // may be path file not exists or deny to access
public static GCLOUD_VOICE_PERMISSION_MIC_ERR 		= 12291  //  you have not right to access micphone in android
public static GCLOUD_VOICE_NEED_AUTHKEY 			= 12292  // you have not get authkey  //  call ApplyMessageKey first
public static GCLOUD_VOICE_UPLOAD_ERR 				= 12293  //  upload file err
public static GCLOUD_VOICE_HTTP_BUSY 				= 12294  //  http is busy  // maybe the last upload/download not finish.
public static GCLOUD_VOICE_DOWNLOAD_ERR 			= 12295  //  download file err
public static GCLOUD_VOICE_SPEAKER_ERR 			= 12296  //  open or close speaker tve error
public static GCLOUD_VOICE_TVE_PLAYSOUND_ERR 		= 12297  //  tve play file error
public static GCLOUD_VOICE_AUTHING 				= 12298  //  Already in applying auth key processing
public static GCLOUD_VOICE_LIMIT              		= 12299  // upload limit

// 
public static GCLOUD_VOICE_INTERNAL_TVE_ERR 		= 20481  //  internal TVE err  //  our used
public static GCLOUD_VOICE_INTERNAL_VISIT_ERR 		= 20482  //  internal Not TVE err  //  out used
public static GCLOUD_VOICE_INTERNAL_USED 			= 20483  //  internal used  //  you should not get this err num
        
public static GCLOUD_VOICE_BADSERVER 				= 24577  //  bad server address  // should be "udp://capi.xxx.xxx.com"
public static GCLOUD_VOICE_STTING 					= 28673  //  Already in speach to text processing

public static GCLOUD_VOICE_CHANGE_ROLE 			= 32769  //  change role error
public static GCLOUD_VOICE_CHANGING_ROLE 			= 32770  //  is in changing role
public static GCLOUD_VOICE_NOT_IN_ROOM 			= 32771  //  no in room
public static GCLOUD_VOICE_COORDINATE  			= 36865  //  sync coordinate error
public static GCLOUD_VOICE_SMALL_ROOMNAME 			= 36866  //  query with a small roomname


// VoiceCompleteCode
public static GV_ON_JOINROOM_SUCC 					= 1
public static GV_ON_JOINROOM_TIMEOUT 				= 2  // join room timeout
public static GV_ON_JOINROOM_SVR_ERR 				= 3  // communication with svr occur some err =  such as err data recv from svr
public static GV_ON_JOINROOM_UNKNOWN 				= 4  // reserved =  our internal unknow err
public static GV_ON_NET_ERR 						= 5  // net err = may be can't connect to network
public static GV_ON_QUITROOM_SUCC 					= 6  // quitroom succ =  if you have join room succ first =  quit room will alway return succ
public static GV_ON_MESSAGE_KEY_APPLIED_SUCC 		= 7  // apply message authkey succ
public static GV_ON_MESSAGE_KEY_APPLIED_TIMEOUT 	= 8	 // apply message authkey timeout
public static GV_ON_MESSAGE_KEY_APPLIED_SVR_ERR 	= 9  // communication with svr occur some err =  such as err data recv from svr
public static GV_ON_MESSAGE_KEY_APPLIED_UNKNOWN 	= 10  // reserved =   our internal unknow err
public static GV_ON_UPLOAD_RECORD_DONE 			= 11  // upload record file succ
public static GV_ON_UPLOAD_RECORD_ERROR 			= 12  // upload record file occur error
public static GV_ON_DOWNLOAD_RECORD_DONE 			= 13  // download record file succ
public static GV_ON_DOWNLOAD_RECORD_ERROR 			= 14  // download record file occur error
public static GV_ON_STT_SUCC 						= 15  //  speech to text successful
public static GV_ON_STT_TIMEOUT 					= 16  //  speech to text with timeout
public static GV_ON_STT_APIERR 					= 17  //  server's error
public static GV_ON_RSTT_SUCC						= 18 // speech to text successful
public static GV_ON_RSTT_TIMEOUT					= 19 // speech to text with timeout
public static GV_ON_RSTT_APIERR					= 20 //  server's error

public static GV_ON_PLAYFILE_DONE 					= 21  // the record file played end

public static GV_ON_ROOM_OFFLINE					= 22  //  Dropped from the room
public static GV_ON_UNKNOWN 						= 23  // 
public static GV_ON_ROLE_SUCC						= 24  //  Change Role Success
public static GV_ON_ROLE_TIMEOUT 					= 25  // Change Role with tiemout
public static GV_ON_ROLE_MAX_AHCHOR 				= 26  //  To much Anchor
public static GV_ON_ROLE_NO_CHANGE 				= 27  //  The same role
public static GV_ON_ROLE_SVR_ERROR 				= 28  //  server's error

public static GV_ON_RSTT_RETRY 					= 29  //  need retry stt
}