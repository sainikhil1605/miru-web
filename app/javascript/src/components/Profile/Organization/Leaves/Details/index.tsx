import React from "react";

import Header from "./Header";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const Details = ({
  leavesList,
  showYearPicker,
  editAction,
  currentYear,
  setCurrentYear,
}) => (
  <>
    <Header
      currentYear={currentYear}
      editAction={editAction}
      setCurrentYear={setCurrentYear}
      showYearPicker={showYearPicker}
    />
    <div className="mt-4 min-h-80v bg-miru-gray-100 p-4 lg:p-10">
      <div className="flex w-full flex-col">
        <div className="w-full pb-6 text-left text-xl font-semibold">
          Leaves
        </div>
        <table className="flex w-full flex-col">
          <TableHeader />
          <tbody>
            {leavesList.length > 0 ? (
              leavesList.map((leave, index) => (
                <TableRow key={index} leave={leave} />
              ))
            ) : (
              <div>No data found</div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

export default Details;
