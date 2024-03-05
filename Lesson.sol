// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NumberManager {
    uint private totalSum;

    uint public lastAddedNumber;

    constructor() {
        totalSum = 0; 
        lastAddedNumber = 0; 
    }

    
    function addNumber(uint number) public {
        increaseTotalSum(number); 
        lastAddedNumber = number; 
    }

    function getTotalSum() public view returns (uint) {
        return totalSum;
    }

    function increaseTotalSum(uint number) private {
        totalSum += number;
    }
    function resetTotalSum() public {
        totalSum = 0; 
    }
}
