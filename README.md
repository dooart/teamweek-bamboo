# Teamweek x BambooHR vacation checker

Information duplication is a wide-open door to entropy, chaos, weeping, and gnashing of teeth.

What I mean with this is: we use both Teamweek and BambooHR to schedule vacations at Toggl but these tools don't have an integration. After the 37th time I ran into a scheduling inconsistency when approving vacations, I got fed up and took a better attitude than cursing at the universe: I decided to automate the task of checking for these inconsistencies.

Of course the information discrepancy is not the tools' fault: Teamweek and BambooHR were never meant to talk to each other to begin with. And even though the people who input data into these tools are the employees, it's not their fault either: manually keeping things in sync is tedious and error-prone (also, I need an excuse for all the times I was the one who made the mistake).

Anyway, enough talk. Now let's check the crap out of those vacations!

## How to use this tool

### 1. Get your API tokens

**Bamboo**
Generate an API token in Bamboo (see [their API docs](https://www.bamboohr.com/api/documentation/) for more help) and write it down somewhere.

**Teamweek**
Teamweek currently only has OAuth support, so for the time being you'll unfortunately have to use your login credentials. I'm sorry.

### 2. Configure the tool

1. Make sure you have yarn installed
2. Run `yarn` inside this folder
3. Create a new `config.json` file with the contents of `config.json.sample`.
4. Fill in the attributes in `config.json` (run `yarn config-help` if you need more information).

### 3. Run it
Just run `yarn start`. The default check period is the **current year**.

You can specify a custom period by using the `startDate` and `endDate` options, eg.: `yarn start --startDate=2031-01-01 --endDate=2031-06-30`.

If nothing goes wrong, you should see something like this in your terminal:

```
Bamboo missing all vacations for:
 - ludwig@company.com
 - wolfgang@company.com

Bamboo missing georges@company.com's vacations:
 - 2019-09-09 to 2019-09-22

Teamweek missing johann@company.com's vacations:
 - 2019-08-27 to 2019-09-06

Bamboo missing johann@company.com's vacations:
 - 2019-08-27 to 2019-08-30

Teamweek missing piotr@company.com's vacations:
 - 2019-08-26 to 2019-09-08
```

⚠️ If there are vacations starting or ending outside the check period, the tool will asssume they start at the first day or end at the last day of the specified period.
