const _ = require("lodash");
const fetch = require("node-fetch");

const getHeaders = params => ({
  headers: { Authorization: params.auth, Accept: "application/json" }
});

const getTimeOffRequests = async (params, status) => {
  const url = `https://api.bamboohr.com/api/gateway.php/${
    params.workspaceName
  }/v1/time_off/requests`;
  const query = `?start=${params.startDate}&end=${
    params.endDate
  }&status=${status}&type=83`;

  try {
    const response = await fetch(`${url}/${query}`, getHeaders(params));
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

const getEmployees = async params => {
  const url = `https://api.bamboohr.com/api/gateway.php/${
    params.workspaceName
  }/v1/employees/directory`;

  try {
    const response = await fetch(url, getHeaders(params));
    const data = await response.json();
    const { employees } = data;
    return _.keyBy(employees, "id");
  } catch (error) {
    console.log(error);
  }
};

const getVacations = async (params, employees, status) => {
  const vacations = await getTimeOffRequests(params, status);
  return vacations.map(vacation => ({
    ...vacation,
    email: employees[vacation.employeeId].workEmail,
    status
  }));
};

const getBambooData = async params => {
  const employees = await getEmployees(params);
  const approved = await getVacations(params, employees, "approved");
  const requested = await getVacations(params, employees, "requested");

  return _.groupBy([...approved, ...requested], "email");
};

module.exports = getBambooData;
