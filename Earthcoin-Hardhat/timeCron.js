const cron = require("node-cron");
const { exec } = require("child_process");

const minuteCron = cron.schedule("* * * * *", async () => {
  exec("sh ./shell-scripts/harvest.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
    }
    if (stderr) {
      console.log(`exec error: ${stderr}`);
    }
  });
});

const dailyCron = cron.schedule("0 8 * * *", async () => {
  exec("sh ./shell-scripts/harvest.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
    }
    if (stderr) {
      console.log(`exec error: ${stderr}`);
    }
  });
});

const weeklyCron = cron.schedule("0 0 * * 0", async () => {
  exec("sh ./shell-scripts/harvest.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
    }
    if (stderr) {
      console.log(`exec error: ${stderr}`);
    }
  });
});

const monthlyCron = cron.schedule("0 0 1 * *", async () => {
  exec("sh ./shell-scripts/harvest.sh", (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
    }
    if (stderr) {
      console.log(`exec error: ${stderr}`);
    }
  });
});

minuteCron.stop();
dailyCron.stop();
weeklyCron.stop();
monthlyCron.stop();

module.exports = { minuteCron, dailyCron, weeklyCron, monthlyCron };
