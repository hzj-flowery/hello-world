// 

`
流水线：
CPU准备数据：
顶点着色器：
图元装配：
光栅化：
深度测试：
片元着色器：
逐片元操作：深度测试，模板测试，alpha测试混合

texImage2D参数配置表
InternalFormat	Format	        Type
RGB	            RGB	            UNSIGNED_BYTE UNSIGNED_SHORT_5_6_5
RGBA	        RGBA        	UNSIGNED_BYTE,UNSIGNED_SHORT_4_4_4_4,UNSIGNED_SHORT_5_5_5_1
LUMINANCE_ALPHA	LUMINANCE_ALPHA	UNSIGNED_BYTE
LUMINANCE	    LUMINANCE	    UNSIGNED_BYTE
ALPHA	        ALPHA	        UNSIGNED_BYTE
R8	            RED	            UNSIGNED_BYTE
R16F	        RED	            HALF_FLOAT  FLOAT
R32F	        RED	            FLOAT
R8UI	        RED_INTEGER  	UNSIGNED_BYTE
RG8	            RG	            UNSIGNED_BYTE
RG16F	        RG	            HALF_FLOAT  FLOAT
RG32F	        RG	            FLOAT
RG8UI	        RG_INTEGER	    UNSIGNED_BYTE
RGB8	        RGB	            UNSIGNED_BYTE
SRGB8	        RGB	            UNSIGNED_BYTE
RGB565	        RGB	            UNSIGNED_BYTE UNSIGNED_SHORT_5_6_5
R11F_G11F_B10F	RGB         	UNSIGNED_INT_10F_11F_11F_REV  HALF_FLOAT   FLOAT
RGB9_E5	        RGB	            HALF_FLOAT  FLOAT
RGB16F      	RGB	            HALF_FLOAT  FLOAT
RGB32F	        RGB	            FLOAT
RGB8UI	        RGB_INTEGER	    UNSIGNED_BYTE
RGBA8	        RGBA	        UNSIGNED_BYTE
SRGB8_ALPHA8	RGBA	        UNSIGNED_BYTE
RGB5_A1	        RGBA	        UNSIGNED_BYTE     UNSIGNED_SHORT_5_5_5_1
RGBA4	        RGBA	        UNSIGNED_BYTE UNSIGNED_SHORT_4_4_4_4
RGBA16F	        RGBA	        HALF_FLOAT  FLOAT
RGBA32F	        RGBA	        FLOAT
RGBA8UI	        RGBA_INTEGER	UNSIGNED_BYTE

#version 300 es:定义glsl的版本

`