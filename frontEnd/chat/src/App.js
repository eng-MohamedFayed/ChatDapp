import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { contractAbi, contractAddress } from './constants/constant';
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [chatPartner, setChatPartner] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3 = new Web3(provider);
        await provider.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const chatContract = new web3.eth.Contract(contractAbi, contractAddress);
        setContract(chatContract);

        const registeredUsername = await chatContract.methods.usernames(accounts[0]).call();
        if (registeredUsername) {
          setUsername(registeredUsername);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const loadMessages = async (chatPartner) => {
    try {
      const userMessages = await contract.methods.getMessagesBetweenUsers(username, chatPartner).call();
      setMessages(userMessages.map(msg => ({
        senderUsername: msg.senderUsername,
        receiverUsername: msg.receiverUsername,
        content: msg.content,
        timestamp: Number(msg.timestamp)
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error loading messages');
    }
  };

  const registerUser = async () => {
    try {
      await contract.methods.registerUser(newUsername).send({ from: account });
      setUsername(newUsername);
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Error registering user');
    }
  };

  const sendMessage = async () => {
    try {
      await contract.methods.sendMessage(chatPartner, messageContent).send({ from: account });
      loadMessages(chatPartner);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Decentralized Chat DApp</h1>
        {error && <p className="error">{error}</p>}
        {!username ? (
          <div>
            <h2>Register</h2>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <button onClick={registerUser}>Register</button>
          </div>
        ) : (
          <div>
            <h2>Welcome, {username}</h2>
            <div>
              <h3>Chat with</h3>
              <input
                type="text"
                value={chatPartner}
                onChange={(e) => {
                  setChatPartner(e.target.value);
                  loadMessages(e.target.value);
                }}
                placeholder="Enter chat partner username"
              />
            </div>
            <div>
              <h3>Send a message</h3>
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Message content"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
            <div>
              <h3>Messages</h3>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.senderUsername === username ? 'sent' : 'received'}`}
                  >
                    <strong>{msg.senderUsername}</strong>: {msg.content} <em>{new Date(msg.timestamp * 1000).toLocaleString()}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
