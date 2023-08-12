# Discord-Bot-Evolved
## Overview
This is a Discord bot that we are adding to our server.
![Underlying Infrastructure](https://raw.githubusercontent.com/michaelortiz05/Discord-Bot-Evolved/market/images/Infrastructure.png)

## Commands
### Booking
`/book` will allow you to book meetings between multiple server members. This command is currently in progress.
### Economy
We are implementing a paid system to use APIs such as GPT and dallE. Members of the server will receive currency on a monthly basis corresponding to a chosen payment. This currency can then be exchanged for their desired API tokens.
The underlying system uses Stripe as the payment processor. A webhook is sent to the bot after a successful payment, then a DynamoDB table is updated with the user’s new currency value. We currently only have functionality in Stripe Test Mode.
`/balance` returns a user’s current balance, along with any tokens they have.
`/purchase` allows users to purchase API tokens with currency. Uses options **amount** to specify quantity **currency** to specify type.
### Open AI
`/chat`
`/clearchat`
`/generate`
### Audio Player
The audio player plays YouTube videos by entering the current voice channel of the user. Members of the server can add or delete songs from the queue, which will automatically play one after the other.
`/play` adds a song to the play queue. The queue will begin playing if not already. A user can input a YouTube link, video ID, or search phrase.
`/queue` displays the current song queue. Users can then click on a specific track they want to play or delete from the queue.
`/skip` skips the current song in the queue. If there is a song following, it will begin playing.
### Quotes
`/quote` places a quote in the text channel defined in *config.json*. Uses options **quote** for the text input of the quote and **orator** for who said it.
### Text to Speech
`/say` uses the audio player to say a specific message with text to speech (TTS). We are planning to add trained models to mimic real-world voices. 
### Settings
`/settings player loop` sets the looping status of the audio player, or the behavior after all tracks in the queue are finished playing. If set to *True*, the player will loop back to song 1. If set to *False*, the player will delete the queue and exit the voice channel.
`/settings market update` adds all current server members to the market DynamoDB table to keep track of currencies.
`/settings market paycheck` a test feature command to give all members of the DynamoDB table currency.
### Utility
`/destroy` turns off the bot.

