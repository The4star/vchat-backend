const dialogflow = require('dialogflow');
const structjson = require('structjson')

// Models
const ChatHistory = require('../models/ChatHistory');
const Message = require('../models/Message');

// keys
const {googleProjectID, dialogFlowSessionID, dialogFlowSessionLanguageCode, googleClientEmail, googlePrivateKey} = require('./keys')

const credentials = {
    client_email: googleClientEmail,
    private_key: googlePrivateKey
}

const sessionClient = new dialogflow.SessionsClient({projectId: googleProjectID, credentials});

const textQuery = async (text, userId, parameters = {}) => {
    let sessionPath = sessionClient.sessionPath(googleProjectID, dialogFlowSessionID + userId)
    let self = module.exports;

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: text,
                // The language used by the client (en-US)
                languageCode: dialogFlowSessionLanguageCode,
            },
        },
        queryParams: {
            payload: {
                data: parameters
            }
        }
    };

    let response = await sessionClient.detectIntent(request);
    await self.handleAction(response, userId)

    result = response[0].queryResult; 

    return result    
}

const eventQuery = async (event, userId, parameters = {}) => {
    let sessionPath = sessionClient.sessionPath(googleProjectID, dialogFlowSessionID + userId)
    let self = module.exports;

    const request = {
        session: sessionPath,
        queryInput: {
            event: {
                // The query to send to the dialogflow agent
                name: event,
                parameters: structjson.jsonToStructProto(parameters),
                // The language used by the client (en-US)
                languageCode: dialogFlowSessionLanguageCode,
            },
        },
    };

    let response = await sessionClient.detectIntent(request);
    await self.handleAction(response, userId)

    result = response[0].queryResult; 

    return result    
}

const handleAction = async (response, userId) => {
    let self = module.exports;
    const query = response[0].queryResult;

    // message options for saving.
    const userText = query.queryText;
    const botText = query.fulfillmentText;
    
    try {
      // find session in database or create a new session
      const sessionHistory = await ChatHistory.findOne({_id: userId}) || await self.createSession(userId)
      
      // save user message
      if (userText != 'Welcome') {
        const userMessage = await self.saveUserMessage(userText);
        sessionHistory.messages.push(userMessage);
      }

      if (botText) {
        const botmessage = await self.saveBotMessage(botText);
        sessionHistory.messages.push(botmessage);
      }

      if (query.webhookPayload && query.webhookPayload.fields && query.webhookPayload.fields.cards) {
        const botCards = query.webhookPayload.fields.cards.listValue.values;
        const botMessage = await self.saveBotMessage(null, null, botCards)
        sessionHistory.messages.push(botMessage);
      }

      if (query.webhookPayload && query.webhookPayload.fields && query.webhookPayload.fields.quickReplies) {
        const botQuickReplies = query.webhookPayload.fields.quickReplies.listValue.values;
        const botMessage = await self.saveBotMessage(null, botQuickReplies, null)
        sessionHistory.messages.push(botMessage);
      }
      sessionHistory.save();
    } catch (error) {
      console.log(error)
    }

    return response;
}

const createSession = async (userId) => {
  const session = await ChatHistory.create({
    _id: userId,
    sessions: 1,
    messages: []
  })
  return session
}

const saveUserMessage = async (userText) => {
  const message = new Message({
    speaker: 'me',
    msg: userText
  })
  await message.save()
  return message
}

const saveBotMessage = async (botText, botQuickReplies, botCards) => {
  const message = new Message({
    speaker: 'vchat',
    msg: botText,
    cards: botCards ? [] : null,
    quickReplies: botQuickReplies ? [] : null
  })

  if (botCards) {
    message.cards.push(...botCards);
  }

  if (botQuickReplies) {
    message.quickReplies.push(...botQuickReplies);
  }
  await message.save()
  return message;
}

const getChatHistory = async (userId) => {

  try {
    const sessionHistory = await ChatHistory.findById(userId).populate('messages');
    if (!sessionHistory) {
      return false       
    } else {
      await sessionHistory.updateOne({ $inc: { sessions: 1 }})
      sessionHistory.save()
      return sessionHistory
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    textQuery,
    eventQuery,
    handleAction,
    getChatHistory,
    createSession,
    saveUserMessage,
    saveBotMessage
}