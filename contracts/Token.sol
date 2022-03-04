// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Token {

	using SafeMath for uint256;

	string public name = 'Sea Token';
	string public symbol = 'SEA';
	uint256 public totalSupply;
	address public owner;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	constructor(uint256 total) {
		totalSupply = total;
		balanceOf[msg.sender] = totalSupply;
		owner = msg.sender;
	}

	function transfer(address _to, uint256 _value) public returns(bool success) {
		require(balanceOf[msg.sender] >= _value);
		balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function approve(address _spender, uint256 _value) public returns(bool success) {
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);
		balanceOf[_from] = balanceOf[_from].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);
		emit Transfer(_from, _to, _value);
		return true;
	}
}