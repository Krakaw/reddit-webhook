require('dotenv').config()
const axios = require('axios')
const Snoowrap = require('snoowrap')
const Snoostorm = require('snoostorm')
const { SubmissionStream } = Snoostorm

const subreddit = process.env.SUBREDDIT
const limit = +process.env.POST_LIMIT
const pollTime = +process.env.POLL_TIME_MILLIS
console.log(`Starting Webhook Bot - Watching: ${subreddit} every ${pollTime}ms`)
const client = new Snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
})

let latestId = null

const submissions = new SubmissionStream(client, { subreddit, limit, pollTime })

submissions.on('listing', (r) => {
  if (latestId === null && r.length) {
    // This is the initial load, don't post anything
    const { name } = r[0]
    latestId = name
    return
  }

  r.forEach(post => {
    sendPostToMatterMost(post)
  })
})

async function sendPostToMatterMost (post) {
  const { title, author, permalink } = post
  const url = `https://www.reddit.com${permalink}`
  const body = ` * [${title} - ${author.name}](${url})`
  console.log(`Sending: ${body}`)
  axios.post(process.env.MATTERMOST_URL, {
    token: process.env.MATTERMOST_TOKEN,
    channel: process.env.MATTERMOST_CHANNEL,
    body,
    title: '**New Message On Reddit**'
  })
}
