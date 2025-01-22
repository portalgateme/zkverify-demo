// SPDX-License-Identifier: MIT

import "../core/interfaces/IComplianceManager.sol";

pragma solidity >=0.8.20;

contract MockComplianceManager is IComplianceManager {
    mapping(address => bool) public isCompliant;

    function setCompliance(address addr, bool status) external {
        isCompliant[addr] = status;
    }

    function isAuthorized(
        address,
        address who
    ) external view override returns (bool) {
        // return isCompliant[who];
        return true;
    }
}
