 // @flow

class ImpossibleError extends Error {

}

// An array class keeps elements in order when inserting or deleting takes place.
class SortedArray<T> {
  // Element storage.
  items: T[] = [];
  // Decide where an element should be placed.
  comparator: Function;
  /**
   * SortedArray constructor.
   * @param {Function(T, T)} comp - comparator of type T for sorting purpose.
   */
  constructor(comp) {
    this.comparator = comp;
  }

  /**
   * Add one element.
   * @param {T} item - element of type T.
   */
  add(item: T): void {
    let i = 0;
    for (; i < this.items.length; ++i) {
      if (this.comparator(item, this.items[i])) {
        break;
      }
    }
    this.items.splice(i, 0, item);
  }

  /**
   * Delete a given element if it is in the array.
   * @param {T} item - element of type T.
   */
  remove(item: T): void {
    let i = 0;
    for (; i < this.items.length; ++i) {
      if (item === this.items[i]) {
        this.items.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Delete a number of elements.
   * @param {number} index - start index of deletion.
   * @param {number} deleteCount - number of elements to be deleted.
   */
  delete(index: number, deleteCount: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, deleteCount);
    }
  }

  /**
   * Try to get an element at certain index.
   * undefined is returned if index parameter is out of boundary.
   * @param {number} index - index of the element.
   */
  itemAt(index: number): T | void {
    if (index >= 0 && index < this.items.length) {
      return this.items[index];
    }
    return undefined;
  }

  /**
   * Iteration over each element.
   * @param {(T)=>void} func - a function applies on each element.
   */
  forEach(func: (T) => void): void {
    this.items.forEach(func);
  }

  /**
   * Print the array content.
   */
  print(): void {
    console.log(this.items);
  }

  /**
   * Get the number of elements in the array.
   */
  size(): number {
    return this.items.length;
  }
}

// A fundamental class represents range.
class Range {
  // Low boundary. Closed.
  low: number;
  // High boundary. Open.
  high: number;

  /**
   * Range constructor.
   * @param {number} low - low boundary.
   * @param {number} high - high boundary.
   */
  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  /**
   * Return string representative of this range.
   */
  toString(): string {
    return `[${this.low},${this.high})`;
  }

  /**
   * Test if given range is valid.
   * @param {number} low - low boundary.
   * @param {number} high - high boundary.
   */
  static isValid(low: number, high: number): boolean {
    return low < high;
  }
}

// The 2-element array representative of a range, index 0 for low boundary and index 1 for high boundary.
type RangeTuple = [number, number];

// Four return data types about how certain number is related to a given Rangelist.
// This number is smaller than any range in the Rangelist.
type IndexTypeExceedingLowest = { exceedingLowest: true };
// This number is greater than any range in the Rangelist.
type IndexTypeExceedingHighest = { exceedingHighest: true };
// This number is within some range in the Rangelist, 
// and the index of the range is contained in the return data.
type IndexTypeWithinRange = number;
// This number is between two consecutive ranges but included in neither of them,
// and the indices of them are contained in the return data with index 0 for the lower range and index 1 for higher range.
type IndexTypeBetweenRanges = [number, number];
// Range toolset.
class RangeHelper {
  /**
   * Search rangelist for a number.
   * Since it's a sorted array, binary search is applied here.
   * @param {number} n - the number to be searched for.
   * @param {SortedArray<Range>} rangeArr - the rangelist to be searched in.
   */
  static searchNumberInRanges(n: number, rangeArr: SortedArray<Range>): IndexTypeBetweenRanges | 
  IndexTypeExceedingHighest | IndexTypeExceedingLowest | IndexTypeWithinRange {
    let begin: number = 0;
    let end: number = rangeArr.size() - 1;

    while(true) {
      if (end - begin <= 1) {
        break;
      }

      const mid: number = (begin + end) / 2;
      const currRange: Range = rangeArr.items[mid];

      if (currRange.low <= n && currRange.high > n) {
        return mid;
      }
      else if (currRange.low > n) {
        end = mid;
      }
      else {
        begin = mid;
      }
    }

    // Empty array
    if (end < 0) {
      return  { exceedingHighest: true };
    }
    
    // The number is within the range either with index `begin` or `end`.
    if (rangeArr.items[begin].low <= n && rangeArr.items[begin].high > n) {
      return begin;
    }
    if (rangeArr.items[end].low <= n && rangeArr.items[end].high > n) {
      return end;
    }

    // The number is lower than any range.
    if (rangeArr.items[begin].low > n) {
      return  { exceedingLowest: true };
    }

    // The number is greater than any range.
    if (rangeArr.items[end].high <= n) {
      return  { exceedingHighest: true };
    }

    // The number is between two consecutive ranges anchored with `begin` and `end` respectively.
    return [begin, end];
  }

  /**
   * The implementation of adding a range in a rangelist.
   * @param {RangeTuple} rangeTuple - the range to be added.
   * @param {SortedArray<Range>} rangeArr - the target rangelist.
   */
  static addToRangeArray(rangeTuple: RangeTuple, rangeArr: SortedArray<Range>): void {
    // Adding range steps:
    //  1. get IndexTypes of adding range's low and high value respectively.
    //  2. according to the IndexTypes, determine a series of ranges that will be merged and delete them.
    //  3. put the merged range into the rangelist.
    const newLowValue = rangeTuple[0];
    const newHighValue = rangeTuple[1];
    const lowIndex = RangeHelper.searchNumberInRanges(newLowValue, rangeArr);
    const highIndex = RangeHelper.searchNumberInRanges(newHighValue - 1, rangeArr);

    // The adding range have a low value greater than any range in the rangelist, so it is the rightmost element.
    if (lowIndex.exceedingHighest) {
      if (rangeArr.size() > 0) {
        let highestRange = rangeArr.itemAt(rangeArr.size() - 1);
        // The adding range can make a larger and continuous range by merging with the rightmost range in the rangelist.
        if (highestRange && highestRange.high === newLowValue) {
          highestRange.high = newHighValue;
          return;
        }
      }
      // For an empty rangelist, simply add the new range.
      rangeArr.add(new Range(newLowValue, newHighValue));
    }
    // The adding range have a high value smaller than any range in the rangelist, so it is the leftmost element.
    else if (highIndex.exceedingLowest) {
      if (rangeArr.size() > 0) {
        let lowestRange = rangeArr.itemAt(0);
        // The adding range can make a larger and continuous range by merging with the leftmost range in the rangelist.
        if (lowestRange && lowestRange.low === newHighValue) {
          lowestRange.low = newLowValue;
          return;
        }
      }
      // For an empty rangelist, simply add the new range.
      rangeArr.add(new Range(newLowValue, newHighValue));
    }
    else {
      let lowRange: Range;
      let mergeStartIndex: number;
      // Pick lowRange and mergeStartIndex.
      // newLovalue is smaller than any existing range.
      if (lowIndex.exceedingLowest) {
        mergeStartIndex = 0;
        let lowRangeOrVoid = rangeArr.itemAt(0);
        if (lowRangeOrVoid) {
          lowRange = lowRangeOrVoid;
        }
        else {
          throw new ImpossibleError();
        }
      }
      // newLowValue is within certain exisiting range.
      else if (typeof lowIndex === "number") {
        mergeStartIndex = lowIndex;
        let lowRangeOrVoid = rangeArr.itemAt(lowIndex);
        if (lowRangeOrVoid) {
          lowRange = lowRangeOrVoid;
        }
        else {
          throw new ImpossibleError();
        }
      }
      // lowIndex is of type `[number, number]`
      else {
        let lowRangeOrVoid = rangeArr.itemAt(lowIndex[0]);
        if (lowRangeOrVoid) {
          // newLowValue happens to fill the gap between two existing ranges, merge them.
          if (lowRangeOrVoid.high === newLowValue) {
            lowRange = lowRangeOrVoid;
            mergeStartIndex = lowIndex[0];
          }
          // Only the range with bigger index should be merged with its low value being extended.
          else {
            mergeStartIndex = lowIndex[1];
            lowRangeOrVoid = rangeArr.itemAt(mergeStartIndex);
            if (typeof lowRangeOrVoid === "object") {
              lowRange = lowRangeOrVoid;
              lowRange.low = newLowValue;
            }
            else {
              throw new ImpossibleError();
            }
          }
        }
        else {
          throw new ImpossibleError();
        }
      } // End of picking lowRange and mergeStartIndex.

      let lowValue = lowRange.low;
      // The adding range covers ranges from mergeStartIndex to the rightmost range, 
      // and the greatest range should extend its upper boundary.
      if (highIndex.exceedingHighest) {
        let highRange = rangeArr.itemAt(rangeArr.size() - 1);
        if (highRange) {
          rangeArr.delete(mergeStartIndex, rangeArr.size() - mergeStartIndex);
          highRange.low = lowValue;
          highRange.high = newHighValue;
          rangeArr.add(highRange);
        }
        else {
          throw new ImpossibleError();
        }
      }
      // Merge ranges between mergeStartIndex and highIndex.
      else if (typeof highIndex === "number") {
        let highRange = rangeArr.itemAt(highIndex);
        if (highRange) {
          rangeArr.delete(mergeStartIndex, highIndex - mergeStartIndex + 1);
          highRange.low = lowValue;
          rangeArr.add(highRange);
        }
        else {
          throw new ImpossibleError();
        }
      }
      // higIndex is of type `[number, number]`
      else {
        let highRange = rangeArr.itemAt(highIndex[1]);
        if (typeof highRange === "object") {
          // newHighValue happens to fill the gap between two existing ranges, merge them.
          if (highRange.low === newHighValue) { 
            rangeArr.delete(mergeStartIndex, highIndex[1] - mergeStartIndex + 1);
            highRange.low = lowValue;
            rangeArr.add(highRange);
          }
          // Only the range with smaller index should be merged with its high value being extended.
          else {
            highRange = rangeArr.itemAt(highIndex[0]);
            if (typeof highRange === "object") {
              rangeArr.delete(mergeStartIndex, highIndex[0] - mergeStartIndex + 1);
              highRange.low = lowValue;
              highRange.high = newHighValue;
              rangeArr.add(highRange);
            }
          }
        }
      }
    }
  }

  /**
   * The implementation of removing a range from a rangelist.
   * @param {RangeTuple} rangeTuple - the range to be removed.
   * @param {SortedArray<Range>} rangeArr - the target rangelist.
   */
  static removeFromRangeArray(rangeTuple: RangeTuple, rangeArr: SortedArray<Range>): void {
    // Removing range steps:
    //  1. get IndexTypes of adding range's low and high value respectively.
    //  2. according to the IndexTypes, remove a series of ranges.
    //  3. Modify low or high value of ranges who is affected but not utterly eliminated.
    // For an empty range list, stop imediately.
    if (rangeArr.size() === 0) {
      return;
    }

    const newLowValue = rangeTuple[0];
    const newHighValue = rangeTuple[1];
    const lowIndex = RangeHelper.searchNumberInRanges(newLowValue, rangeArr);
    const highIndex = RangeHelper.searchNumberInRanges(newHighValue - 1, rangeArr);

    // No range will be affected at all.
    if (lowIndex.exceedingHighest || highIndex.exceedingLowest) {
      return;
    }
    else {
      let removeStartIndex: number;
      // Determine where the removal should begin.
      // newLowValue is lesser than all existing ranges, removal begins at the first range.
      if (lowIndex.exceedingLowest) {
        removeStartIndex = 0;
      }
      // newLowValue is within certain existing range, removal begins at this range.
      else if (typeof lowIndex === 'number') {
        removeStartIndex = lowIndex;
      }
      // newLowValue is between two consecutive existing ranges without overlapping with either of them,
      // removal begins at the greater range.
      else {
        removeStartIndex = lowIndex[1];
      }

      // Determine where the removal should stop.
      let removeStopIndex: number;
      // Removal should continue to the very end of the rangelist.
      if (highIndex.exceedingHighest) {
        removeStopIndex = rangeArr.size() - 1;
      }
      else if (typeof highIndex === 'number') {
        removeStopIndex = highIndex;
      }
      // newHighValue won't affect greater range.
      else {
        removeStopIndex = highIndex[0];
      }

      let startRange = rangeArr.itemAt(removeStartIndex);
      let stopRange = rangeArr.itemAt(removeStopIndex);
      if (startRange && stopRange) {
        rangeArr.delete(removeStartIndex, removeStopIndex - removeStartIndex + 1);
        if (newLowValue > startRange.low) {
          let newRange = new Range(startRange.low, newLowValue);
          rangeArr.add(newRange);
        }
        if (newHighValue > stopRange.low && newHighValue < stopRange.high) {
          let newRange = new Range(newHighValue, stopRange.high);
          rangeArr.add(newRange);
        }
      }
      else {
        throw new ImpossibleError();
      }
    }
  }

}

class RangeList {
  rangeArr: SortedArray<Range>;

  constructor() {
    this.rangeArr = new SortedArray<Range>((one: Range, other: Range): boolean => {
      // Ranges are in ascending order.
      // If everything works properly, there shouldn't be any overlapping ranges in rangeArr.
      // Therefore, comparing low value is enough.
      return one.low < other.low;
    });
  }

  /**
   * Adds a range to the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  add(range: any) {
    let r: RangeTuple = range
    if (!Range.isValid(r[0], r[1])) {
      return;
    }

    RangeHelper.addToRangeArray(r, this.rangeArr);
  }

  /**
   * Removes a range from the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  remove(range: any) {
    let r: RangeTuple = range
    if (!Range.isValid(r[0], r[1])) {
      return;
    }

    RangeHelper.removeFromRangeArray(r, this.rangeArr);
  }

  /**
   * Prints out the list of ranges in the range list
   */
  print() {
    let text: string = "";
    this.rangeArr.forEach((r: Range) => { text = text + r.toString() + " "; })
    console.log(text);
  }
}

// Example run
const rl = new RangeList();

rl.add([1, 5]);
rl.print();
// Should display: [1, 5)

rl.add([10, 20]);
rl.print();
// Should display: [1, 5) [10, 20)

rl.add([20, 20]);
rl.print();
// Should display: [1, 5) [10, 20)

rl.add([20, 21]);
rl.print();
// Should display: [1, 5) [10, 21)

rl.add([2, 4]);
rl.print();
// Should display: [1, 5) [10, 21)

rl.add([3, 8]);
rl.print();
// Should display: [1, 8) [10, 21)

rl.remove([10, 10]);
rl.print();
// Should display: [1, 8) [10, 21)

rl.remove([10, 11]);
rl.print();
// Should display: [1, 8) [11, 21)

rl.remove([15, 17]);
rl.print();
// Should display: [1, 8) [11, 15) [17, 21)

rl.remove([3, 19]);
rl.print();
// Should display: [1, 3) [19, 21)

rl.remove([10, 15]);
rl.print();
// Should display: [1, 3) [19, 21)

rl.add([3, 19]);
rl.print();
// Should display: [1, 21)