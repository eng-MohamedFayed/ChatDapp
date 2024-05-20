// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Chat {
    struct Message {
        string senderUsername;
        string receiverUsername;
        string content;
        uint timestamp;
    }

    mapping(address => string) public usernames; // Mapping of Ethereum addresses to usernames
    mapping(string => address) public addressByUsername; // Mapping of usernames to Ethereum addresses
    Message[] public messages;

    event MessageSent(string indexed senderUsername, string indexed receiverUsername, string content, uint timestamp);

    function registerUser(string memory _username) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(addressByUsername[_username] == address(0), "Username already exists");
        require(bytes(usernames[msg.sender]).length == 0, "User already registered");

        addressByUsername[_username] = msg.sender;
        usernames[msg.sender] = _username;
    }

    function sendMessage(string memory _receiverUsername, string memory _content) public {
        require(bytes(usernames[msg.sender]).length > 0, "User not registered");
        require(bytes(_receiverUsername).length > 0, "Receiver username cannot be empty");
        require(addressByUsername[_receiverUsername] != address(0), "Receiver does not exist");

        messages.push(Message(usernames[msg.sender], _receiverUsername, _content, block.timestamp));
        emit MessageSent(usernames[msg.sender], _receiverUsername, _content, block.timestamp);
    }

    function getMessageCount() public view returns (uint) {
        return messages.length;
    }

    function getMessage(uint _index) public view returns (string memory, string memory, string memory, uint) {
        require(_index < messages.length, "Message index out of bounds");
        Message memory message = messages[_index];
        return (message.senderUsername, message.receiverUsername, message.content, message.timestamp);
    }

    function getMessagesBetweenUsers(string memory _user1, string memory _user2) public view returns (Message[] memory) {
        uint count = 0;
        for (uint i = 0; i < messages.length; i++) {
            if ((keccak256(abi.encodePacked(messages[i].senderUsername)) == keccak256(abi.encodePacked(_user1)) &&
                 keccak256(abi.encodePacked(messages[i].receiverUsername)) == keccak256(abi.encodePacked(_user2))) ||
                (keccak256(abi.encodePacked(messages[i].senderUsername)) == keccak256(abi.encodePacked(_user2)) &&
                 keccak256(abi.encodePacked(messages[i].receiverUsername)) == keccak256(abi.encodePacked(_user1)))) {
                count++;
            }
        }

        Message[] memory userMessages = new Message[](count);
        uint index = 0;
        for (uint i = 0; i < messages.length; i++) {
            if ((keccak256(abi.encodePacked(messages[i].senderUsername)) == keccak256(abi.encodePacked(_user1)) &&
                 keccak256(abi.encodePacked(messages[i].receiverUsername)) == keccak256(abi.encodePacked(_user2))) ||
                (keccak256(abi.encodePacked(messages[i].senderUsername)) == keccak256(abi.encodePacked(_user2)) &&
                 keccak256(abi.encodePacked(messages[i].receiverUsername)) == keccak256(abi.encodePacked(_user1)))) {
                userMessages[index] = messages[i];
                index++;
            }
        }
        return userMessages;
    }
}
