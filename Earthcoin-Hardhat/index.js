const express = require("express");
const app = express();
const fs = require("fs");

const StableCoinPreviousData = fs.readFileSync(
  "frontend-admin/src/abi/StableCoin.json"
);
const { exec, execSync } = require("child_process");
const {
  earthStaking: { epochSizeSeconds, startTimestamp },
  presale: { mintMultiple },
  stableCoin: stableCoinAddress,
  nftaddress: nftcontractaddress,
} = require("./scripts//deployParameters.json");

const StableCoinData = {
  address: stableCoinAddress,
  abi: JSON.parse(StableCoinPreviousData.toString()).abi,
};
let croneIsStoped;
let croneTime;
let harvestDistributionPercentage;

// Middleware
app.use(express.json());

// Routes

app.post("/deploy-all", async (req, res) => {
  // File created on deployment
  fs.writeFileSync("./scripts/deployParameters.json", JSON.stringify(req.body));

  // Runs the automated script
  exec(`sh ./shell-scripts/deploy.sh`, (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
    }
    if (stderr) {
      console.log(`exec error: ${stderr}`);
    }

    let result = JSON.stringify(stdout.split("\n"));
    result = JSON.parse(result);
    res.send(result);
    fs.writeFileSync(
      "./scripts/deployAddresses.json",
      JSON.stringify({
        EarthERC20Token: result[0], //future-change
        // ExitQueue: result[1],
        EarthStaking: result[1],
        Fruit: result[2],
        // LockedFruit: result[4],
        StableCoin: result[3], //future-change
        EarthTreasury: result[4],
        MintAllowance: result[5],
        // PresaleAllocation: result[5],
        Presale: result[6],
        Nft: result[7],

      })
    );
  });
});

app.get("/deploy-status", async (req, res) => {
  try {
    if (fs.existsSync("scripts/deployParameters.json")) {
      res.json({ status: "true" });
    } else {
      res.json({ status: "false" });
    }
  } catch (err) {
    console.log(err);
    res.send(`Error ${err}`);
  }
});

app.get("/get-address", async (req, res) => {
  try {
    if (fs.existsSync("scripts/deployAddresses.json")) {
      const deployAddresses = fs.readFileSync("scripts/deployAddresses.json");
      if (deployAddresses.toString().length == 0) return res.send({});
      return res.send(JSON.parse(deployAddresses.toString()));
    }
    return res.send({});
  } catch (error) {
    console.log(error);
    res.send(`Error ${error}`);
  }
});

app.post("/env-config", async (req, res) => {
  const { envNetwork, envKey } = req.body;
  if (!envKey.length && !envNetwork.length) {
    return res.json({ message: "Send atleast one update", status: 400 });
  }
  try {
    let data = fs.readFileSync(".env").toString();
    data = data.split("\n");

    for (let index = 0; index < data.length; index++) {
      let element = data[index].split("=");
      data[index] = element;
    }
    if (envKey.length && envNetwork.length) {
      fs.writeFileSync(
        ".env",
        `MATICTEST_PRIVATE_KEY=${envKey}\nMATICMAIN_PRIVATE_KEY=${envKey}\nNETWORK=${envNetwork}\nINFURA=${data[3][1]}
    `
      );
    } else if (envKey.length) {
      fs.writeFileSync(
        ".env",
        `MATICTEST_PRIVATE_KEY=${envKey}\nMATICMAIN_PRIVATE_KEY=${envKey}\nNETWORK=${data[2][1]}\nINFURA=${data[3][1]}
    `
      );
    } else if (envNetwork.length) {
      fs.writeFileSync(
        ".env",
        `MATICTEST_PRIVATE_KEY=${data[0][1]}\nMATICMAIN_PRIVATE_KEY=${data[1][1]}\nNETWORK=${envNetwork}\nINFURA=${data[3][1]}
    `
      );
    } else {
      fs.writeFileSync(
        ".env",
        `MATICTEST_PRIVATE_KEY=${data[0][1]}\nMATICMAIN_PRIVATE_KEY=${data[1][1]}\nNETWORK=${data[2][1]}\nINFURA=${data[3][1]}
    `
      );
    }

    res.status(200).json({ message: "Env details updated", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post("/set-allocators", async (req, res) => {
  const { users, contractAddress } = req.body;
  if (users.length === 0) {
    return res.send("Data is empty");
  }
  fs.writeFileSync(
    "./scripts/setAllocatorsParameters.json",
    JSON.stringify({
      users,
      contractAddress,
    })
  );
  try {
    execSync(
      "sh ./shell-scripts/setAllocator.sh",
      async (error, stdout, stderr) => {
        if (error) {
          console.log(`Error: ${error.message}`);
        }
        if (stderr) {
          console.log(`exec error: ${stderr}`);
        }
      }
    );
    return res.send("Staked");
  } catch (error) {
    console.log(error);
    return res.send("Server error");
  }
});

app.post("/harvest-crone", async (req, res) => {
  const { harvestPercentage, timeInterval, contractAddress, stop } = req.body;
  try {
    fs.writeFileSync(
      "./scripts/harvestParameters.json",
      JSON.stringify({
        harvestPercentage,
        contractAddress,
      })
    );
    let cronJob;

    switch (timeInterval) {
      case "minute":
        cronJob = require("./timeCron.js").minuteCron;
        break;
      case "day":
        cronJob = require("./timeCron.js").dailyCron;
        break;
      case "week":
        cronJob = require("./timeCron.js").weeklyCron;
        break;
      case "month":
        cronJob = require("./timeCron.js").monthlyCron;
        break;

      default:
        break;
    }
    if (stop) {
      cronJob.stop();
      croneIsStoped = true;
      return res.json({ status: "Stopped", isStopped: croneIsStoped });
    }
    cronJob.start();
    croneTime = timeInterval;
    croneIsStoped = false;
    harvestDistributionPercentage = harvestPercentage;
    return res.json({
      status: "Cron job started",
      isStopped: croneIsStoped,
      timeInterval: croneTime,
      harvestDistributionPercentage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error ${error}`);
  }
});

app.get("/harvest-info", (req, res) => {
  res.json({
    isStopped: croneIsStoped,
    timeInterval: croneTime,
    harvestDistributionPercentage,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App listening on ${PORT} port`));
