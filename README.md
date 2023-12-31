# Discord-Bot-Evolved
## Overview
This is a Discord bot that will be run on our private server, containing all personally desired commands and features. We are using JavaScript with the Discord.js wrapper for our main functionality along with:
- A hosted EC2 instance to run the server
- OpenAI integrations to prompt ChatGPT and dallE
- Stripe payments
- DynamoDB tables to store user currency data (tokens and payments)
- YouTube search for an Audio Player

Below is a diagram of our current underlying infrastructure:
![Underlying Infrastructure](https://raw.githubusercontent.com/michaelortiz05/Discord-Bot-Evolved/market/images/Infrastructure.png)

This ReadMe will contain all current commands and their descriptions, along with the general processes and design ideas behind the more complicated feature sets.

## Commands
### Booking
`/book` will allow you to book meetings between multiple server members. This command is currently in progress.

### Economy
We are implementing a paid system to use APIs such as GPT and dallE. Members of the server will receive currency on a monthly basis corresponding to a chosen payment. This currency can then be exchanged for their desired API tokens.

The underlying system uses Stripe as the payment processor. A webhook is sent to the bot after a successful payment, then a DynamoDB table is updated with the user’s new currency value. We currently only have functionality in Stripe Test Mode.

`/balance` returns a user’s current balance, along with any tokens they have.

`/purchase` allows users to purchase API tokens with currency. Uses options **amount** to specify quantity **currency** to specify type.

### OpenAI
`/chat` starts or continues an interaction with GPT using the OpenAI "Chat Completions" endpoint. Responses can be tuned with *tuning.yaml*.

`/clearchat` clears the current GPT interaction of all previous chats.

`/generate` uses the dallE AI model to generate an image, then uploads it to the discord server.

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

## Additional Resources
### CloudFormation Template
As the bot evolves, we need a way to deploy the server with minimal overhead. Currently, we can pull all code in our main repo and deploy it on an EC2 instance with a CloudFormation template located in `Discord-Bot-Evolved/aws/discord-bot-template.yaml`. 

To fully deploy the bot, create an S3 bucket with a *.env* and *config.json* (information on contents of these files coming soon). Next, log into your AWS CLI profile from your computer, navigate to the `Discord-Bot-Evolved` folder and use the command:

```aws cloudformation create-stack --stack-name <STACK_NAME> --template-body file://aws/discord-bot-template.yaml --parameters ParameterKey=EnvBucketName,ParameterValue=<NAME_OF_CONFIG_BUCKET> ParameterKey=DefaultVPCID,ParameterValue=<DEFAULT_VPC_ID> ParameterKey=KeyName,ParameterValue=<EC2_KEY> --capabilities CAPABILITY_NAMED_IAM```

