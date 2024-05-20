const Chat = artifacts.require("Chat");

contract("Chat", (accounts) => {
  let chatInstance;

  before(async () => {
    chatInstance = await Chat.deployed();
  });

  it("should register a user with a unique username", async () => {
    await chatInstance.registerUser("user1", { from: accounts[0] });
    const username = await chatInstance.usernames(accounts[0]);
    assert.equal(username, "user1", "Username was not registered correctly");
  });

  it("should not allow registering with an empty username", async () => {
    try {
      await chatInstance.registerUser("", { from: accounts[1] });
      assert.fail("Expected an error for empty username");
    } catch (error) {
      assert.include(error.message, "Username cannot be empty", "Error message mismatch");
    }
  });

  it("should not allow registering with a duplicate username", async () => {
    try {
      await chatInstance.registerUser("user1", { from: accounts[1] });
      assert.fail("Expected an error for duplicate username");
    } catch (error) {
      assert.include(error.message, "Username already exists", "Error message mismatch");
    }
  });

  it("should send a message between registered users", async () => {
    await chatInstance.registerUser("user2", { from: accounts[1] });
    const receipt = await chatInstance.sendMessage("user2", "Hello, user2!", { from: accounts[0] });

    // Check event logs
    const event = receipt.logs.find(log => log.event === 'MessageSent');
    assert(event, "Event not found");

    // Extract the event arguments properly
    const { senderUsername, receiverUsername, content, timestamp } = event.args;
    assert.equal(senderUsername, "user1", "Sender username mismatch");
    assert.equal(receiverUsername, "user2", "Receiver username mismatch");
    assert.equal(content, "Hello, user2!", "Message content mismatch");

    const messageCount = await chatInstance.getMessageCount();
    assert.equal(messageCount.toNumber(), 1, "Message count should be 1");

    const message = await chatInstance.getMessage(0);
    assert.equal(message[0], "user1", "Sender username mismatch");
    assert.equal(message[1], "user2", "Receiver username mismatch");
    assert.equal(message[2], "Hello, user2!", "Message content mismatch");
  });

  it("should not send a message if the sender is not registered", async () => {
    try {
      await chatInstance.sendMessage("user1", "Hello from unregistered user!", { from: accounts[2] });
      assert.fail("Expected an error for unregistered sender");
    } catch (error) {
      assert.include(error.message, "User not registered", "Error message mismatch");
    }
  });

  it("should not send a message to a non-existent user", async () => {
    try {
      await chatInstance.sendMessage("nonexistent", "Hello!", { from: accounts[0] });
      assert.fail("Expected an error for non-existent receiver");
    } catch (error) {
      assert.include(error.message, "Receiver does not exist", "Error message mismatch");
    }
  });

  it("should retrieve messages between two users", async () => {
    await chatInstance.sendMessage("user2", "How are you?", { from: accounts[0] });
    await chatInstance.sendMessage("user1", "I'm fine, thanks!", { from: accounts[1] });

    const messages = await chatInstance.getMessagesBetweenUsers("user1", "user2");
    assert.equal(messages.length, 3, "Messages count should be 3");

    assert.equal(messages[0].content, "Hello, user2!", "First message content mismatch");
    assert.equal(messages[1].content, "How are you?", "Second message content mismatch");
    assert.equal(messages[2].content, "I'm fine, thanks!", "Third message content mismatch");
  });
});
