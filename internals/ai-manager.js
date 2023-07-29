const yaml = require('js-yaml');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

class ChatManager {
    constructor(tuning) {
        this.model = "gpt-3.5-turbo";
        this.chats = new Map();
        this.tuning = tuning;
        this.maxLen = 2000;
    }
    async chat(userid, message) {
        if (!this.chats.has(userid))
            this.chats.set(userid, new ChatBuilder(userid, this.tuning.systems));
        this.chats.get(userid).addMessage("user", message);
        try {
            let response = await openai.createChatCompletion({
                model: this.model,
                messages: this.chats.get(userid).messages
            })
            const response_message = response.data.choices[0].message
            // let response_message = response["choices"][0]["message"]
            this.chats.get(userid).addMessage(response_message.role, response_message.content);
            console.log(this.chats.get(userid).messages);
            if (response_message.content.length <= this.maxLen)
                return response_message.content;
            else
                return response_message.content.slice(0, this.maxLen - 3) + '...';

        } catch (e) {
            console.log("Error: ", e);
            return "Oh no! Something went wrong!"
        }
    }
    clearChat(userid) {
        return this.chats.delete(userid);
    }
}

class ChatBuilder {
    constructor(userid, systems) {
        this.messages = [];
        if (systems != undefined) {
            this.addMessage("system", systems.base);
            this.addMessage("system", systems.rp);
            let sys = this.getSystemById(userid, systems);
            console.log(sys);
            if (sys != undefined)
                this.addMessage("system", sys);
        }
    }
    getSystemById(userid, systems) {
        let system;
        switch(userid) {
            case process.env.GOD_EMPEROR:
                system = systems.godemperor;
                break;
            case process.env.MAX:
                system = systems.max;
                break;
            case process.env.RHETT:
                system = systems.rhett;
            case process.env.SEBA:
                system = systems.seba;
            case process.env.HECTOR:
                system = systems.hector;
            default:
                break;
        }
        return system;
    }
    addMessage(role, content) {
        this.messages.push({
            "role": role,
            "content": content
        })
    }
}

// gpt configuration
let tuning;
try {
	tuning = yaml.load(fs.readFileSync('./internals/tuning.yml', 'utf8'));
} catch (e) {
	console.log(e);
}
let chatManager = new ChatManager(tuning);

// dalle generate function
async function generate(properties) {
    try {
        const response = await openai.createImage(properties);
        imageurl = response.data.data[0].url;
        return imageurl;
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } 
        else 
            console.log(error.message);
    }
    return;
}

module.exports = { chatManager, generate };