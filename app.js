const restify = require('restify');
const builder = require('botbuilder');
const axios = require('axios');
const _ = require('lodash');
const AdaptiveCards = require('adaptivecards');

// setup server
const server = restify.createServer();
const port = 3978;
server.listen(port, () => {
    console.log(`listening to ${server.name} ${server.url}`);
});

//  create a connector [chatConnector or ConsoleConnector]

const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftPassword
});

// listen for messages from users

server.post('/api/messages', connector.listen());

// Receive the messages from  user and respond 

const bot = new builder.UniversalBot(connector, function (session) {
    session.send('Hi, I\'m GE PowerBot. You can ask me any questions regd. PowerMax Systems, GRC and PMX');
    const msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            .subtitle('Try something like this')
            .buttons([
                builder.CardAction.imBack(session, "How can i find my GRC reqestor?", "How can i find my GRC reqestor?"),
                builder.CardAction.imBack(session, "How to add PMX systems to my SAP Log on tree", "How to add PMX systems to my SAP Log on tree")
        ])
    ]);
    session.send(msg).endDialog();
});

bot.dialog('Query', (session) => {
    const msg = new builder.Message(session);
    const url = 'http://localhost:3000/qna';
    const input_text = session.message.text;
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    
    axios.get(url)
        .then((response) => {
            if (_.includes(input_text, 'GRC reqestor')) {
                attachments(response.data[0].answer);
                session.send(msg).endDialog();
            } else if (_.includes(input_text, 'add PMX systems')) {
                attachments(response.data[1].answer);
                session.send(msg).endDialog();
            } else if (_.includes(input_text, 'Sap Powermax')) {
                attachments(response.data[2].answer);
                session.send(msg).endDialog();
            } else if(_.includes(input_text, 'feedback')) {
                session.send('Please ask any questions related to PMX, GRC, SAP, PowerMax');
            } else{
                session.send('No Answer available, Please try with another query');
            }
        })
        .catch( error => {
            session.send(`${error}`);
        });

    let attachments = (response) => {
            return msg.attachments([
                    new builder.HeroCard(session)
                        .title(session.message.text)
                        .text(response)
                        .buttons([
                            builder.CardAction.imBack(session, "Thank you for your feedback", "Helpful"),
                            builder.CardAction.imBack(session, "Thank you for your feedback", "not Helpful")
                    ])
            ]);
        }
}).triggerAction({
    matches: /(GRC|SAP|PMX)/i
})

bot.dialog('Feedback', (session) => {
    if (_.includes(session.message.text, 'feedback')) {
        session.send('Please ask any questions related to PMX, GRC, SAP, PowerMax');
    }
})