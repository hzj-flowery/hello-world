export class BinaryInput{
public strings:any;
public index:any;
public buffer:any;

        constructor(data, strings, index, buffer){
            if (strings === void 0) { strings = new Array(); }
            if (index === void 0) { index = 0; }
            if (buffer === void 0) { buffer = new DataView(data.buffer); }
            this.strings = strings;
            this.index = index;
            this.buffer = buffer;
        }
        public readByte() {
            return this.buffer.getInt8(this.index++);
        };
        public readShort() {
            var value = this.buffer.getInt16(this.index);
            this.index += 2;
            return value;
        };
        public readInt32() {
            var value = this.buffer.getInt32(this.index);
            this.index += 4;
            return value;
        };
        public readInt(optimizePositive) {
            var b = this.readByte();
            var result = b & 0x7F;
            if ((b & 0x80) != 0) {
                b = this.readByte();
                result |= (b & 0x7F) << 7;
                if ((b & 0x80) != 0) {
                    b = this.readByte();
                    result |= (b & 0x7F) << 14;
                    if ((b & 0x80) != 0) {
                        b = this.readByte();
                        result |= (b & 0x7F) << 21;
                        if ((b & 0x80) != 0) {
                            b = this.readByte();
                            result |= (b & 0x7F) << 28;
                        }
                    }
                }
            }
            return optimizePositive ? result : ((result >>> 1) ^ -(result & 1));
        };
        public readStringRef() {
            var index = this.readInt(true);
            return index == 0 ? null : this.strings[index - 1];
        };
        public readString() {
            var byteCount = this.readInt(true);
            switch (byteCount) {
                case 0:
                    return null;
                case 1:
                    return "";
            }
            byteCount--;
            var chars = "";
            var charCount = 0;
            for (var i = 0; i < byteCount;) {
                var b = this.readByte();
                switch (b >> 4) {
                    case 12:
                    case 13:
                        chars += String.fromCharCode(((b & 0x1F) << 6 | this.readByte() & 0x3F));
                        i += 2;
                        break;
                    case 14:
                        chars += String.fromCharCode(((b & 0x0F) << 12 | (this.readByte() & 0x3F) << 6 | this.readByte() & 0x3F));
                        i += 3;
                        break;
                    default:
                        chars += String.fromCharCode(b);
                        i++;
                }
            }
            return chars;
        };
        public readFloat() {
            var value = this.buffer.getFloat32(this.index);
            this.index += 4;
            return value;
        };
        public readBoolean() {
            return this.readByte() != 0;
        };
       
    }
