/* Magic Mirror
 * Node Helper: MMM-YT-SubCount
 *
 * By Cedrik Hoffmann (https://github.com/choffmann)
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
  start: function () {
    this.finalData = [];
    this.channelIds = [];
    this.apiKey = null;
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "MMM-YT-SubCount-HERE_IS_CONFIG":
        this.apiKey = payload.apiKey;
        this.channelIds = payload.channelIds;
        this.breakDownChannelIds();
        break;

        case "MMM-YT-SubCount-START_TIMER":
          console.log(`start update timer, every ${payload.updateIntervalMinutes}`)
          setInterval(() => {
                  console.log('YT: doing node work, getting sub data')
                  this.breakDownChannelIds();
              }
              , payload.updateIntervalMinutes*60000)
      
          break

          case "UPDATE_PLEASE":
        this.crypto();
        break;
    }
  },

  breakDownChannelIds: function () {
    this.url =
      "https://youtube.googleapis.com/youtube/v3/channels?part=statistics&part=snippet";

    let comment_url =
      "https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&maxResults=3&allThreadsRelatedToChannelId="


      this.channelIds.forEach((channel) => {
      this.url = this.url + "&id=" + channel.id;

    });
    this.getData(this.url);

    // get comments
    this.channelIds.forEach((channel) => {
      this.getData2(comment_url + channel.id)
    });

  },

  getData2: function (url) {
    console.log(`getData for ${url}`)
    fetch(url + "&key=" + this.apiKey, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(`data2 text: **${JSON.stringify(data)}**`)
      for (var i=0; i < data.items.length; i++) {
        // TODO: Need to search for the right snippet, not always top level...
        console.log(`item: ${data.items[i].snippet.topLevelComment.snippet.textDisplay}`)
      }
    })
      .catch((error) => console.log("Error: ", error));
  },


  getData: function (url) {
    console.log(`getData for ${url}`)
    fetch(url + "&key=" + this.apiKey, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    .then((response) => response.json())
      .then((data) => this.handleData(data))
      .catch((error) => console.log("Error: ", error));
  },

  handleData: function (data) {
    console.log(`response data: ${data}`);
    this.sendSocketNotification("MMM-YT-SubCount-DATA_IS_READY", data);
  }
});
