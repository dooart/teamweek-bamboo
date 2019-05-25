const _ = require("lodash");
const { URLSearchParams } = require("url");
const fetch = require("node-fetch");

const INITIAL_AUTH_TOKEN =
  "Basic dGVhbXdlZWtfdGltZWxpbmU6YjhiZmFmY2MwNmJiZTU5ZmJlYWI0Y2M2ZjA3MWZkYTQ=";

const getHeaders = params => ({
  headers: { Authorization: params.auth }
});

const authenticate = async params => {
  if (params.authToken) return params.authToken;
  const url = "https://app.teamweek.com/api/v4/authenticate/token";

  const headers = {
    Authorization: INITIAL_AUTH_TOKEN
  };

  const body = new URLSearchParams();
  body.append("username", params.authUser);
  body.append("password", params.authPassword);
  body.append("grant_type", "password");

  const response = await fetch(url, {
    method: "POST",
    headers,
    body
  });

  const json = await response.json();
  return json.access_token;
};

const getTeamweekVacations = async params => {
  const url = `https://teamweek.com/api/v4/${
    params.workspaceId
  }/tasks/timeline`;
  const query = `?since=${params.startDate}&until=${params.endDate}&project=${
    params.vacationProjectId
  }&group=${params.groupId}`;

  try {
    const response = await fetch(`${url}/${query}`, getHeaders(params));
    const tasks = await response.json();
    return tasks.map(row => _.pick(row, "user_id", "start_date", "end_date"));
  } catch (error) {
    console.log(error);
  }
};

const getTeamweekMembers = async params => {
  const url = `https://teamweek.com/api/v4/${params.workspaceId}/members`;

  try {
    const response = await fetch(url, getHeaders(params));
    const users = await response.json();
    return users.map(row => _.pick(row, "id", "email"));
  } catch (error) {
    console.log(error);
  }
};

const getTeamweekMemberships = async params => {
  const url = `https://teamweek.com/api/v4/${params.workspaceId}/groups/${
    params.groupId
  }`;

  try {
    const response = await fetch(url, getHeaders(params));
    const group = await response.json();
    return group.memberships.map(row => row.user_id);
  } catch (error) {
    console.log(error);
  }
};

const getTeamweekUsers = async params => {
  let users = await getTeamweekMembers(params);
  if (params.groupId) {
    const memberships = await getTeamweekMemberships(params);
    users = users.filter(member => memberships.includes(member.id));
  }
  return _.keyBy(users, user => user.id);
};

const getTeamweekData = async params => {
  const token = await authenticate(params);
  params.auth = `Bearer ${token}`;

  const vacations = await getTeamweekVacations(params);
  const users = await getTeamweekUsers(params);
  const vacationsWithEmail = vacations.map(vacation => ({
    ...vacation,
    email: users[vacation.user_id].email
  }));
  return _.groupBy(vacationsWithEmail, "email");
};

module.exports = getTeamweekData;
