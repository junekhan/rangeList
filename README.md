# RangeList
This is a convenient tool to manage ranges or intervals.


An interval is represented as [m, n), where m is the inclusive begining and n is the exclusive end, and every single integer in between is included. RangeList can add(merge), remove(separate) ranges.



## Installation

    npm install

## Example
    const rl = new RangeList();

    rl.add([1, 5]);
    rl.print();

    rl.add([10, 20]);
    rl.print();

    rl.add([20, 20]);
    rl.print();

    rl.add([20, 21]);
    rl.print();

    rl.add([2, 4]);
    rl.print();

    rl.add([3, 8]);
    rl.print();

    rl.remove([10, 10]);
    rl.print();

    rl.remove([10, 11]);
    rl.print();

    rl.remove([15, 17]);
    rl.print();

    rl.remove([3, 19]);
    rl.print();

    rl.remove([10, 15]);
    rl.print();

    rl.add([3, 19]);
    rl.print();

## Output
    [1,5) 
    [1,5) [10,20) 
    [1,5) [10,20) 
    [1,5) [10,21) 
    [1,5) [10,21) 
    [1,8) [10,21) 
    [1,8) [10,21) 
    [1,8) [11,21) 
    [1,8) [11,15) [17,21) 
    [1,3) [19,21) 
    [1,3) [19,21) 
    [1,21) 
