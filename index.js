require('dotenv').config()
const axios = require('axios')
const Snoowrap = require('snoowrap')
const Snoostorm = require('snoostorm')
const { SubmissionStream } = Snoostorm

const client = new Snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
})

let latestId = null
const submissions = new SubmissionStream(client, { subreddit: process.env.SUBREDDIT, limit: +process.env.POST_LIMIT, pollTime: +process.env.POLL_TIME_MILLIS })

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
  const { title, author, url } = post
  const body = ` * [${title} - ${author.name}](${url})`
  axios.post(process.env.MATTERMOST_URL, {
    token: process.env.MATTERMOST_TOKEN,
    channel: process.env.MATTERMOST_CHANNEL,
    body,
    title: '**New Message On Reddit**'
  })
}
