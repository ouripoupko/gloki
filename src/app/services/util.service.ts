import { Injectable } from '@angular/core';

// credit: the following code is taken from https://github.com/sindresorhus/uint8Array-extras

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private cachedDecoders: {[encoding: string]: TextDecoder} = {
    utf8: new TextDecoder('utf8'),
  };
  private cachedEncoder = new TextEncoder();
  private byteToHexLookupTable = Object.fromEntries(
    Array.from({ length: 256 }, (_, i) => [i - 128, (((i-128) & 0xFF).toString(16).padStart(2, '0'))]));
  private hexToDecimalLookupTable: {[key: number | string]: number} = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    a: 10, b: 11, c: 12, d: 13, e: 14, f: 15, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15
  };
    
  constructor() { }

  concatInt8Arrays(arrays: Int8Array[]) {
    if (arrays.length === 0) {
      return new Int8Array(0);
    }

    const totalLength = arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);

    const returnValue = new Int8Array(totalLength);

    let offset = 0;
    for (const array of arrays) {
      returnValue.set(array, offset);
      offset += array.length;
    }

    return returnValue;
  }

  int8ArrayToString(array: Int8Array, encoding = 'utf8'): string {
    if (encoding == 'latin1') {
      return String.fromCharCode(...(new Uint8Array(array)));
    }
    this.cachedDecoders[encoding] ??= new TextDecoder(encoding);
    return this.cachedDecoders[encoding].decode(array);
  }

  stringToInt8Array(value: string): Int8Array {
    return new Int8Array(this.cachedEncoder.encode(value));
  }

  int8ArrayToHex(array: Int8Array): string {
    let hexString = '';

    for (let index = 0; index < array.length; index++) {
      hexString += this.byteToHexLookupTable[array[index]];
    }

    return hexString;
  }

  hexToInt8Array(hexString: string): Int8Array {
    const resultLength = hexString.length / 2;
    const bytes = new Int8Array(resultLength);

    if (hexString.length % 2 == 0) {
      for (let index = 0; index < resultLength; index++) {
        const highNibble = this.hexToDecimalLookupTable[hexString[index * 2]];
        const lowNibble = this.hexToDecimalLookupTable[hexString[(index * 2) + 1]];

        if (highNibble === undefined || lowNibble === undefined) {
          return new Int8Array();
        }

        bytes[index] = (highNibble << 4) | lowNibble;
      }
    }

    return bytes;
  }
}
