/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";

import ReportCard from "./reportCard";

const accounts_aging = require("../../../../../assets/images/accounts-aging.svg");
const calendar = require("../../../../images/Calendar.svg"); // eslint-disable-line
const hours = require("../../../../images/Hours.svg");
const overdueOutstandingIcon = require("../../../../images/OverdueOutstanding.svg");
const revenue = require("../../../../images/Revenue.svg");

const listDetails = [
  {
    icon: calendar,
    title: "Time Entry Report",
    description: "A summary of the time entries added by your team.",
    url: "time-entry",
    show: true,
  },
  {
    icon: overdueOutstandingIcon,
    title: "Invoices Report",
    description:
      "A detailed summary of outstanding and overdue of all clients for a period of time.",
    url: "outstanding-overdue-invoice",
    show: true,
  },
  {
    icon: hours,
    title: "Total hours logged",
    description:
      "A detailed summary of billed, unbilled and non-billable hours by team grouped by project.",
    url: "total-hours",
    show: false,
  },
  {
    icon: revenue,
    title: "Revenue Report",
    description: "A detailed report of revenue from each client.",
    url: "revenue-by-client",
    show: true,
  },
  {
    icon: accounts_aging,
    title: "Accounts Aging",
    description: "Find out which client have been taking a long time to pay",
    url: "accounts-aging",
    show: true,
  },
];

const List = () => (
  <div className="pb-14">
    <div className="mt-4 text-3xl font-bold">Reports</div>
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {listDetails.map(
        (item, key) =>
          item.show && (
            <div key={key}>
              <ReportCard
                description={item.description}
                icon={item.icon}
                title={item.title}
                url={item.url}
              />
            </div>
          )
      )}
    </div>
  </div>
);

export default List;