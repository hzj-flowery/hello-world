export class Utils {

    static arrayCopy(source, sourceStart, dest, destStart, numElements) {
        for (var i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
            dest[j] = source[i];
        }
    };
    static setArraySize(array, size, value) {
        if (value === void 0) { value = 0; }
        var oldSize = array.length;
        if (oldSize == size)
            return array;
        array.length = size;
        if (oldSize < size) {
            for (var i = oldSize; i < size; i++)
                array[i] = value;
        }
        return array;
    };
    static ensureArrayCapacity(array, size, value) {
        if (value === void 0) { value = 0; }
        if (array.length >= size)
            return array;
        return Utils.setArraySize(array, size, value);
    };
    static newArray(size, defaultValue) {
        var array = new Array(size);
        for (var i = 0; i < size; i++)
            array[i] = defaultValue;
        return array;
    };
    static newFloatArray(size) {
        if (Utils.SUPPORTS_TYPED_ARRAYS) {
            return new Float32Array(size);
        }
        else {
            var array = new Array(size);
            for (var i = 0; i < array.length; i++)
                array[i] = 0;
            return array;
        }
    };
    static newShortArray(size) {
        if (Utils.SUPPORTS_TYPED_ARRAYS) {
            return new Int16Array(size);
        }
        else {
            var array = new Array(size);
            for (var i = 0; i < array.length; i++)
                array[i] = 0;
            return array;
        }
    };
    static toFloatArray(array) {
        return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
    };
    static toSinglePrecision(value) {
        return Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
    };
    static webkit602BugfixHelper(alpha, blend) {
    };
    static contains(array, element, identity) {
        if (identity === void 0) { identity = true; }
        for (var i = 0; i < array.length; i++) {
            if (array[i] == element)
                return true;
        }
        return false;
    };
    static SUPPORTS_TYPED_ARRAYS = typeof (Float32Array) !== "undefined";
}