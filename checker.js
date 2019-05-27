const _ = require("lodash");
const moment = require("moment");
const getTeamweekData = require("./teamweek.js");
const getBambooData = require("./bamboo.js");

const DATE_FORMAT = "YYYY-MM-DD";
const normalizeVacations = (vacations, period) => {
  return vacations
    .map(vacation => {
      let start = moment(vacation.start || vacation.start_date, DATE_FORMAT);
      let end = moment(vacation.end || vacation.end_date, DATE_FORMAT);
      const periodStart = moment(period.startDate, DATE_FORMAT);
      const periodEnd = moment(period.endDate, DATE_FORMAT);
      if (start.isBefore(periodStart, "day")) {
        start = periodStart;
      }
      if (end.isAfter(periodEnd, "day")) {
        end = periodEnd;
      }
      return { start: start.format(DATE_FORMAT), end: end.format(DATE_FORMAT) };
    })
    .map(vacation => `${vacation.start} to ${vacation.end}`);
};

const compare = (teamweek, bamboo, period) => {
  const errors = [];
  const teamweekPeople = Object.keys(teamweek);
  const bambooPeople = Object.keys(bamboo);

  const missingAllInTeamweek = _.difference(bambooPeople, teamweekPeople);
  if (missingAllInTeamweek.length) {
    errors.push(
      `Teamweek missing all vacations for: \n - ${missingAllInTeamweek.join(
        "\n - "
      )}`
    );
  }

  const missingAllInBamboo = _.difference(teamweekPeople, bambooPeople);
  if (missingAllInBamboo.length) {
    errors.push(
      `Bamboo missing all vacations for: \n - ${missingAllInBamboo.join(
        "\n - "
      )}`
    );
  }

  const people = _.intersection(teamweekPeople, bambooPeople);
  people.sort().forEach(person => {
    const vacationsTeamweek = teamweek[person];
    const vacationsBamboo = bamboo[person];

    const missingInTeamweek = _.difference(
      normalizeVacations(vacationsBamboo, period),
      normalizeVacations(vacationsTeamweek, period)
    ).sort();
    if (missingInTeamweek.length) {
      errors.push(
        `Teamweek missing ${person}'s vacations: \n - ${missingInTeamweek.join(
          "\n - "
        )}`
      );
    }

    const missingInBamboo = _.difference(
      normalizeVacations(vacationsTeamweek, period),
      normalizeVacations(vacationsBamboo, period)
    ).sort();
    if (missingInBamboo.length) {
      errors.push(
        `Bamboo missing ${person}'s vacations: \n - ${missingInBamboo.join(
          "\n - "
        )}`
      );
    }
  });

  return errors;
};

const checker = async config => {
  const period = {
    startDate:
      config.startDate ||
      moment()
        .startOf("year")
        .format(DATE_FORMAT),
    endDate:
      config.endDate ||
      moment()
        .endOf("year")
        .format(DATE_FORMAT)
  };

  const teamweekParams = {
    ...config.teamweek,
    startDate: period.startDate + "T00:00:00.000Z",
    endDate: period.endDate + "T00:00:00.000Z"
  };

  const bambooParams = {
    ...config.bamboo,
    auth: `Basic ${Buffer.from(config.bamboo.auth + ":x").toString("base64")}`,
    ...period
  };

  const teamweekData = await getTeamweekData(teamweekParams);
  const bambooData = await getBambooData(bambooParams);

  const errors = compare(teamweekData, bambooData, period);
  if (errors.length) {
    errors.forEach(error => console.log(error + "\n"));
  } else {
    console.log("No inconsistencies found! 🙌");
  }
};

module.exports = checker;
