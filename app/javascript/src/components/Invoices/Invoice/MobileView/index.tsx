import React, { useState } from "react";

import {
  PaperPlaneTiltIcon,
  PrinterIcon,
  DeleteIcon,
  DotsThreeVerticalIcon,
  ArrowLeftIcon,
  EditIcon,
} from "miruIcons";
import { useNavigate } from "react-router-dom";
import { Button, MobileMoreOptions, Badge } from "StyledComponents";

import CompanyInfo from "components/Invoices/common/CompanyInfo";
import InvoiceInfo from "components/Invoices/Generate/MobileView/Container/InvoicePreview/InvoiceInfo";
import InvoiceTotal from "components/Invoices/Generate/MobileView/Container/InvoicePreview/InvoiceTotal";
import LineItems from "components/Invoices/Generate/MobileView/Container/MenuContainer/LineItems";
import DeleteInvoice from "components/Invoices/popups/DeleteInvoice";
import getStatusCssClass from "utils/getBadgeStatus";

const MobileView = ({ invoice }) => {
  const {
    id,
    invoiceLineItems,
    tax,
    discount,
    invoiceNumber,
    status,
    company,
    amount,
    dueDate,
    issueDate,
    reference,
    client,
    amountDue,
    amountPaid,
  } = invoice;
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const subTotal = invoiceLineItems.reduce(
    (prev, curr) => prev + (curr.rate * curr.quantity) / 60,
    0
  );

  const total = Number(subTotal) + Number(tax) - Number(discount);

  return (
    <div>
      <div className="sticky flex h-12 items-center justify-between px-3 shadow-c1">
        <div className="flex items-center">
          <Button
            style="ternary"
            onClick={() => {
              navigate("/invoices");
            }}
          >
            <ArrowLeftIcon
              className="mr-4 text-miru-dark-purple-1000"
              size={16}
              weight="bold"
            />
          </Button>
          <span>Invoice #{invoiceNumber}</span>
        </div>
        <div>
          <Badge
            className={`${getStatusCssClass(status)} uppercase`}
            text={status}
          />
        </div>
      </div>
      <CompanyInfo company={company} />
      <InvoiceInfo
        amount={amount}
        currency={company.currency}
        dateFormat={company.dateFormat}
        dueDate={dueDate}
        invoiceNumber={invoiceNumber}
        issueDate={issueDate}
        reference={reference}
        selectedClient={client}
        setActiveSection={() => {}} //eslint-disable-line
        showEditButton={false}
      />
      <div className="border-b border-miru-gray-400 px-4 py-2">
        <LineItems
          isInvoicePreviewCall
          currency={company.currency}
          dateFormat={company.dateFormat}
          manualEntryArr={[]}
          selectedClient={client}
          selectedLineItems={invoiceLineItems}
          setActiveSection={() => {}} //eslint-disable-line
          setEditItem={() => {}} //eslint-disable-line
        />
      </div>
      <InvoiceTotal
        amountDue={amountDue}
        amountPaid={amountPaid}
        currency={company.currency}
        discount={discount}
        setActiveSection={() => {}} //eslint-disable-line
        showEditButton={false}
        subTotal={subTotal}
        tax={tax}
        total={total}
      />
      <div className="flex w-full justify-between p-4 shadow-c1">
        <Button
          className="mr-2 flex w-1/2 items-center justify-center px-4 py-2"
          style="primary"
        >
          <EditIcon className="text-white" size={16} weight="bold" />
          <span className="ml-2 text-center text-base font-bold leading-5 text-white">
            Edit
          </span>
        </Button>
        <Button
          className="ml-2 flex w-1/2 items-center justify-center px-4 py-2"
          style="primary"
        >
          <PaperPlaneTiltIcon className="text-white" size={16} weight="bold" />
          <span className="ml-2 text-center text-base font-bold leading-5 text-white">
            Send to
          </span>
        </Button>
        <Button onClick={() => setShowMoreOptions(true)}>
          <DotsThreeVerticalIcon
            className="ml-4 text-miru-han-purple-1000"
            size={20}
            weight="bold"
          />
        </Button>
      </div>
      {showMoreOptions && (
        <MobileMoreOptions setVisibilty={setShowMoreOptions}>
          <li className="flex cursor-pointer items-center px-5 py-2 text-sm text-miru-han-purple-1000 hover:bg-miru-gray-100 lg:py-1 xl:py-2">
            <PrinterIcon
              className="mr-4 text-miru-han-purple-1000"
              size={16}
              weight="bold"
            />
            Print
          </li>
          <li
            className="flex cursor-pointer items-center py-2 px-5 text-sm text-miru-red-400 hover:bg-miru-gray-100 lg:py-1 xl:py-2"
            onClick={() => {
              setShowMoreOptions(false);
              setShowDeleteDialog(true);
            }}
          >
            <DeleteIcon
              className="mr-4 text-miru-red-400"
              size={16}
              weight="bold"
            />
            Delete
          </li>
          {status == "DRAFT" && (
            <li className="flex cursor-pointer items-center px-5 py-2 text-sm text-miru-han-purple-1000 hover:bg-miru-gray-100 lg:py-1 xl:py-2">
              <PrinterIcon
                className="mr-4 text-miru-han-purple-1000"
                size={16}
                weight="bold"
              />
              Download
            </li>
          )}
        </MobileMoreOptions>
      )}
      {showDeleteDialog && (
        <DeleteInvoice invoice={id} setShowDeleteDialog={setShowDeleteDialog} />
      )}
    </div>
  );
};

export default MobileView;