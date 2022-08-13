// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor (address _cryptoDevTokenAddr) ERC20("CryptoDev LP Token", "CDLP") {
        require(_cryptoDevTokenAddr != address(0),"Token address passed is a null address!!");
        cryptoDevTokenAddress = _cryptoDevTokenAddr;
    }

    /// @dev 'getReserve' returns the no. of CD tokens owned by this contract
    function getReserve() public view returns (uint256) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    /// @dev 'addLiquidity' provides liquidity to the exchange
    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 liquidity;
        uint256 ethBalance = address(this).balance;
        uint256 cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        // If the reserve is empty
        if(cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);

            liquidity = ethBalance;
            _mint(msg.sender, liquidity);

        } else {
            uint256 ethReserve = ethBalance - msg.value;

            uint256 cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) / ethReserve;
            require(_amount >= cryptoDevTokenAmount, "Amount of tokens sent is less than minimum tokens required");

            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);

            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity; 
    }

    /// @dev returns the amount of Eth/CryptoDev Token 
    function removeLiquidity(uint256 _amount) public payable returns (uint256, uint256) {
        require(_amount > 0, "_amount must be greater than zero!!");
        uint256 ethReserve = address(this).balance;
        uint256 _totalSupply = totalSupply();

        uint256 ethAmount = (ethReserve * _amount) / _totalSupply;

        uint256 cryptoDevTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);

        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);

        return (ethAmount, cryptoDevTokenAmount);
    } 

    /// @dev returns the amount of Eth/cryptoDevTokens that would be returned to the user in the swap
    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");

        uint256 inputAmountWithFee = inputAmount * 99;

        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;

        return numerator / denominator;
    }

    /// @dev swaps Eth for CryptoDev tokens
    function ethToCryptoDevToken(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();

        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");

        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    /// @dev swaps CryptoDev token for Eth
    function cryptoDevTokenToEth(uint256 _tokensSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();

        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );

        require(ethBought >= _minEth, "insufficient output amount");
        
        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );

        payable(msg.sender).transfer(ethBought);
    }
}