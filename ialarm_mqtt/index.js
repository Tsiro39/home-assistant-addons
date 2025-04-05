const mqtt = require("mqtt");
const axios = require("axios");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./ialarm-config.json", "utf-8"));
const { ialarm, mqtt: mqttCfg } = config;

const client = mqtt.connect(`mqtt://${mqttCfg.host}`, {
  username: mqttCfg.username,
  password: mqttCfg.password,
});

async function pollPanel() {
  try {
    const res = await axios.get(`http://${ialarm.host}:${ialarm.port}/status`, {
      auth: {
        username: ialarm.username,
        password: ialarm.password,
      },
    });

    const data = res.data;
    client.publish(`${mqttCfg.topicPrefix}/alarm/state`, data.alarm_state || "unknown");
  } catch (err) {
    console.error("Panel poll error:", err.message);
  }
}

client.on("connect", () => {
  console.log("Connected to MQTT");
  setInterval(pollPanel, (ialarm.pollInterval || 10) * 1000);
});
