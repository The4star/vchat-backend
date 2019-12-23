const express = require('express');
const router = express.Router();

const { textQuery, eventQuery, getChatHistory } = require('../config/chatbot')

router.get('/',  (req, res, next) => {
    res.send({response: 'hello'})
})

router.post('/api/df_text_query', async (req, res) => {

    try {
        const response = await textQuery(req.body.text, req.body.userId, req.body.parameters)
        res.send(response)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/api/df_event_query', async (req, res) => {
    try {
        const response = await eventQuery(req.body.event, req.body.userId, req.body.parameters)
        res.send(response)
    } catch (error) {
        res.status(500).send('error ' + error)
    }
})

router.post('/api/df_get_chat_history', async (req, res) => {
  try {
      const response = await getChatHistory(req.body.userId)
      if (response === false) {
        res.send({previousSession: false})
      } else {
        res.send({response, previousSession: true})
      }
  } catch (error) {
      res.status(500).send('error ' + error)
  }
})


module.exports = router;