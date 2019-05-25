const fs = require("fs");
const checker = require("./checker.js");

if (!fs.existsSync("./config.json")) {
  console.error("config.json file not found");
}

const argv = require("yargs")
  .scriptName("teamweek-bamboo")
  .usage("$0 <args>")
  .default("config", "config.json")
  .config()
  .option("startDate", {
    describe: "Search vacations starting on this date. Format: YYYY-MM-DD"
  })
  .option("endDate", {
    describe: "Search vacations up to this date. Format: YYYY-MM-DD"
  })
  .option("teamweek.authToken", {
    describe:
      "Teamweek authentication token. If you don't have a token, use your login credentials with authUser and authPassword."
  })
  .option("teamweek.authUser", {
    describe:
      "Your username on Teamweek. Use this option if you don't have a token."
  })
  .option("teamweek.authPassword", {
    describe:
      "Your password on Teamweek. Use this option if you don't have a token."
  })
  .option("teamweek.workspaceId", {
    describe: "The id of your Teamweek workspace."
  })
  .option("teamweek.vacationProjectId", {
    describe: "The id of the vacations project in your Teamweek workspace."
  })
  .option("teamweek.groupId", {
    describe:
      "The id of the user group in Teamweek containing the people whose vacations you want to check."
  })
  .option("bamboo.auth", {
    describe: "BambooHR authentication token."
  })
  .option("bamboo.workspaceName", {
    describe: "The name of your BambooHR workspace.",
    default: "toggl"
  })
  .option("bamboo.timeOffId", {
    describe: 'The "time off" id for vacations on your BambooHR workspace.'
  })
  .help().argv;

checker(argv);
