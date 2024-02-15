const wa = require('@open-wa/wa-automate');
const fs = require('fs');

let pendingGroupIcon = null;
wa.create({
  sessionId: "COVID_HELPER",
  multiDevice: true, //required to enable multiDevice support
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'PT_BR',
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

function start(client) {
  client.onMessage(async message => {
    if (message.body === 'Hi') {
      await client.sendText(message.from, '👋 Hello!');
    }
  });
  client.onMessage(async (message) => {
    // Check if the message content is '.owner' and if the sender is not yourself
    if (message.body.toLowerCase() === '.owner' && !message.fromMe) {
      // Get the sender's phone number (you can customize this based on your needs)
      const senderPhoneNumber = message.author;

      // Your reply message
      const replyMessage = `This is the owner. Contact: ${senderPhoneNumber}`;

      // Send the reply message with a button
      const button = { buttonText: 'Contact Owner', contactMessage: senderPhoneNumber };
      await client.sendText(message.from, replyMessage, [button]);
    }
  });
  client.onMessage(async (message) => {
    // Check if the message content is '.join' and if it includes a group link
    if (message.body.toLowerCase().startsWith('.join ') && message.fromMe === false) {
      // Extract the group link from the message
      const groupLink = message.body.slice(6).trim();

      try {
        // Use the joinGroup function to join the group
        await client.acceptInvite(groupLink);
        console.log(`Joined group: ${groupLink}`);
      } catch (error) {
        console.error(`Error joining group: ${groupLink}`, error);
      }
    }
  });
  async function updateBio() {
    const currentTime = new Date().toLocaleTimeString();
    const newBio = `${currentTime} | SUPER BOT`;

    try {
      // Set the new bio
      await client.setMyStatus(newBio);
      console.log(`Bio updated: ${newBio}`);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  }

  // Initial update
  updateBio();

  // Schedule updates every 10 seconds
  setInterval(updateBio, 10 * 1000);
  async function welcomeUser(group, user) {
    const welcomeMessage = `Welcome to the group, ${user.id.user}!`;
    const groupDescription = `Group Description: ${group.desc}`;

    try {
      // Send the welcome message
      await client.sendTextWithMentions(group.id._serialized, `${welcomeMessage}\n${groupDescription}`);
      console.log(`Sent welcome message to ${user.id.user}`);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  // Event handler for participants change
  
    
        client.onMessage(async (message) => {
          // Check if the message is from an admin and starts with '.pp'
          if (message.fromMe && message.body.toLowerCase() === '.pp') {
            // Check if the message contains a media attachment (image)
            if (message.hasMedia) {
              // Set the group icon with the attached media (image)
              try {
                const mediaData = await client.decryptMedia(message);
                await client.setGroupIcon(message.chatId, mediaData, 'group_icon.jpg');
                console.log('Group icon updated successfully.');
              } catch (error) {
                console.error('Error setting group icon:', error);
              }
            } else {
              console.log('No media attached. Please attach an image to set as the group icon.');
            }
          }
        });
        client.onMessage(async (message) => {
            // Check if the message is from an admin and starts with '.sticker'
            if (message.fromMe && message.body.toLowerCase() === '.sticker') {
              // Check if the message contains a media attachment (image)
              if (message.hasMedia && message.mediaType === 'image') {
                try {
                  // Convert the image to a sticker
                  const stickerData = await client.sendImageAsSticker(message.from, message.data, {
                    author: 'Your Bot Name',
                    pack: 'Your Pack Name',
                  });
        
                  console.log('Sticker created successfully:', stickerData);
                } catch (error) {
                  console.error('Error creating sticker:', error);
                }
              } else {
                console.log('No media attached. Please attach an image to create a sticker.');
              }
            }
        
            // Check if the message is an image sent by someone else
            if (!message.fromMe && message.hasMedia && message.mediaType === 'image') {
              try {
                // Convert the received image to a sticker
                const stickerData = await client.sendImageAsSticker(message.from, message.data, {
                  author: 'Your Bot Name',
                  pack: 'Your Pack Name',
                });
        
                console.log('Sticker created successfully:', stickerData);
              } catch (error) {
                console.error('Error creating sticker:', error);
              }
            }
          });
          client.onMessage(async (message) => {
            // Check if someone types '.invite'
            if (message.body.toLowerCase() === '.invite') {
              try {
                // Get the group invite link
                const inviteLink = await client.getGroupInviteLink(message.chatId);
                
                // Send the invite link as a message
                await client.sendText(message.chatId, `Group Invite Link: ${inviteLink}`);
                
                console.log('Group invite link sent successfully.');
              } catch (error) {
                console.error('Error sending group invite link:', error);
              }
            }
          });
  client.onMessage(async (message) => {
    // Check if the message starts with '.kick' and the sender is an admin
    if (message.body.toLowerCase().startsWith('.kick ') && await isAdmin(message.from)) {
      // Extract the tagged user from the message
      const taggedUser = message.mentionedIds[0];

      // Check if a user is tagged
      if (!taggedUser) {
        await client.sendText(message.chatId, 'Please tag the user you want to kick.');
        return;
      }

      try {
        // Kick the tagged user from the group
        await client.removeParticipant(message.chatId, taggedUser);
        console.log(`User ${taggedUser} kicked from the group by admin ${message.from}`);
      } catch (error) {
        console.error('Error kicking user:', error);
      }
    }
  });

  async function isAdmin(sender) {
    // Check if the sender is an admin in the group
    const admins = await client.getGroupAdmins(message.chatId);
    return admins.includes(sender);
  }

}
