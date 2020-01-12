const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')

beforeAll(() => {
  const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true }
  mongoose.connect(process.env.TEST_DB_URL, dbOptions, (err) => {
    if (err) {
      console.log('db not connected')
    }
  })
})

afterAll(() => {
  mongoose.connection.close();
});

describe('testing Dialogflow routes ', () => {

  it('performs a text query', async () => {
    const res = await request(app)
      .post('/api/df_text_query')
      .send({
        text: "hi",
        userId: "asdi123214"
      })
      .expect(200)
      expect(res.body.action).toBe('LaunchIntent')
  })
  

  it('successfully performs a query that contains cards', async () => {
    const res = await request(app)
      .post('/api/df_text_query')
      .send({
        text: "item cards",
        userId: "asdi123214"
      })
      .expect(200)
      expect(res.body.webhookPayload.fields.cards).toBeTruthy();
  })

  it('successfully performs a query that quick replies', async () => {
    const res = await request(app)
      .post('/api/df_text_query')
      .send({
        text: "show me cards",
        userId: "asdi123214"
      })
      .expect(200)
      expect(res.body.webhookPayload.fields.quickReplies).toBeTruthy();
  })

  it('performs an event query', async () => {
    const res = await request(app)
      .post('/api/df_event_query')
      .send({
        event: "Welcome",
        userId: "asdi123214"
      })
      .expect(200)
      expect(res.body.action).toBe('LaunchIntent')
  })

  it('saved all the messages to the database', async () => {
    const res = await request(app)
      .post('/api/df_get_chat_history')
      .send({
        userId: "asdi123214"
      })
      .expect(200)
      expect(res.body.response.messages.length).toBeGreaterThan(3)
  })
})