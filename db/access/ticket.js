const TicketResponse = require('../models/ticketModules/TicketResponse');
const TicketCategory = require('../models/ticketModules/TicketCategory');
const TicketCollector = require('../models/ticketModules/TicketCollector');
const Server = require('../models/Server');

async function getCollectors(interaction) {
    const server = await Server.findOne({ serverId: interaction.guild.id });
    if (!server) return [];
    

    let collectors = [];
    for (const collectorId of server.TicketCollectors) {
        const collector = await TicketCollector.findById(collectorId);
        collectors.push(collector);
    }

    return collectors; 
}

async function findCategory(categoryId) {
    const category = await TicketCategory.findById(categoryId);
    return category;
}

async function findResponse(responseId) {
    const response = await TicketResponse.findById(responseId);
    return response;
}

module.exports = { getCollectors, findCategory, findResponse };