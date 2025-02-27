/* eslint-disable no-unused-vars */
import React, { Fragment, useEffect, useRef, useState } from "react";

import { Country, State, City } from "country-state-city";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useOutsideClick } from "helpers";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

import teamsApi from "apis/teams";
import Loader from "common/Loader/index";
import { MobileDetailsHeader } from "common/Mobile/MobileDetailsHeader";
import { useTeamDetails } from "context/TeamDetailsContext";
import { useUserContext } from "context/UserContext";
import { teamsMapper } from "mapper/teams.mapper";

import MobileEditPage from "./MobileEditPage";
import StaticPage from "./StaticPage";
import { userSchema } from "./validationSchema";

dayjs.extend(utc);

const addressOptions = [
  { label: "Current", value: "current" },
  { label: "Permanent", value: "permanent" },
];

const schema = Yup.object().shape(userSchema);

const EmploymentDetails = () => {
  const initialErrState = {
    first_name_err: "",
    last_name_err: "",
    address_line_1_err: "",
    country_err: "",
    state_err: "",
    city_err: "",
    email_id_err: "",
    pin_err: "",
  };

  const initialSelectValue = {
    label: "",
    value: "",
    code: "",
  };
  const { memberId } = useParams();
  const {
    updateDetails,
    details: { personalDetails },
  } = useTeamDetails();
  const navigate = useNavigate();
  const { isDesktop } = useUserContext();

  const wrapperRef = useRef(null);

  const [currentCountryDetails, setCurrentCountryDetails] =
    useState(initialSelectValue);
  const [currentCityList, setCurrentCityList] = useState([]);
  const [addrType, setAddrType] = useState({ label: "", value: "" });
  const [showDatePicker, setShowDatePicker] = useState({ visibility: false });
  const [countries, setCountries] = useState([]);
  const [errDetails, setErrDetails] = useState(initialErrState);
  const [isLoading, setIsLoading] = useState(false);
  const [addrId, setAddrId] = useState();

  useOutsideClick(wrapperRef, () => setShowDatePicker({ visibility: false }));

  const assignCountries = async allCountries => {
    const countryData = await allCountries.map(country => ({
      value: country.name,
      label: country.name,
      code: country.isoCode,
    }));
    setCountries(countryData);
  };

  const getDetails = async () => {
    const res: any = await teamsApi.get(memberId);
    const addRes = await teamsApi.getAddress(memberId);
    const teamsObj = teamsMapper(res.data, addRes.data.addresses[0]);
    updateDetails("personal", teamsObj);
    if (teamsObj.addresses?.address_type?.length > 0) {
      setAddrType(
        addressOptions.find(
          item => item.value === teamsObj.addresses.address_type
        )
      );
    }
    setAddrId(addRes.data.addresses[0]?.id);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const allCountries = Country.getAllCountries();
    assignCountries(allCountries);
    getDetails();
  }, []);

  useEffect(() => {
    const currentCountry = Country.getAllCountries().filter(
      country =>
        country.name == personalDetails.addresses.country ||
        country.isoCode == personalDetails.addresses.country
    )[0];

    currentCountry &&
      setCurrentCountryDetails({
        label: currentCountry.name,
        value: currentCountry.name,
        code: currentCountry?.isoCode,
      });

    if (personalDetails.addresses.city) {
      const stateCode =
        currentCountry &&
        State.getStatesOfCountry(currentCountry?.isoCode).filter(
          state => state.name == personalDetails.addresses.state
        )[0]?.isoCode;

      setCurrentCityList(
        City.getCitiesOfState(
          currentCountry?.isoCode,
          stateCode ?? personalDetails.addresses.state
        ).map(city => ({
          label: city.name,
          value: city.name,
          ...city,
        }))
      );
    }
  }, [personalDetails]);

  const handleOnChangeCountry = selectCountry => {
    setCurrentCountryDetails(selectCountry);
    updateDetails("personal", {
      ...personalDetails,
      ...{
        addresses: {
          ...personalDetails.addresses,
          ...{ country: selectCountry.value, state: "", city: "" },
        },
      },
    });
  };

  const updatedStates = countryCode =>
    State.getStatesOfCountry(countryCode).map(state => ({
      label: state.name,
      value: state.name,
      code: state?.isoCode,
      ...state,
    }));

  const handleOnChangeAddrType = addreType => {
    setAddrType(addreType);
    updateDetails("personal", {
      ...personalDetails,
      ...{
        addresses: {
          ...personalDetails.addresses,
          ...{ address_type: addreType.value },
        },
      },
    });
  };

  const handleOnChangeState = selectState => {
    updateDetails("personal", {
      ...personalDetails,
      ...{
        addresses: {
          ...personalDetails.addresses,
          ...{ state: selectState.value },
          ...{ state: selectState.value, city: "" },
        },
      },
    });

    const cities = City.getCitiesOfState(
      currentCountryDetails.code,
      selectState.code
    ).map(city => ({ label: city.name, value: city.name, ...city }));
    setCurrentCityList(cities);
  };

  const filterCities = (inputValue: string) => {
    const city = currentCityList.filter(i =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return city.length ? city : [{ label: inputValue, value: inputValue }];
  };

  const promiseOptions = (inputValue: string) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterCities(inputValue));
      }, 1000);
    });

  const updateBasicDetails = (value, type, isAddress = false) => {
    if (isAddress) {
      updateDetails("personal", {
        ...personalDetails,
        ...{
          addresses: { ...personalDetails.addresses, ...{ [type]: value } },
        },
      });
    } else {
      updateDetails("personal", {
        ...personalDetails,
        ...{ [type]: value },
      });
    }
  };

  const handleDatePicker = date => {
    setShowDatePicker({ visibility: !showDatePicker.visibility });
    const formattedDate = dayjs(date, personalDetails.date_format).format(
      personalDetails.date_format
    );

    updateDetails("personal", {
      ...personalDetails,
      ...{ date_of_birth: formattedDate },
    });
  };

  const handleUpdateDetails = async () => {
    try {
      await schema.validate(
        {
          ...personalDetails,
          ...{
            is_email: personalDetails.email_id
              ? personalDetails.email_id.length > 0
              : false,
          },
        },
        { abortEarly: false }
      );

      await teamsApi.updateUser(memberId, {
        user: {
          first_name: personalDetails.first_name,
          last_name: personalDetails.last_name,
          date_of_birth: personalDetails.date_of_birth
            ? dayjs
                .utc(personalDetails.date_of_birth, personalDetails.date_format)
                .toISOString()
            : null,
          phone: personalDetails.phone_number,
          personal_email_id: personalDetails.email_id,
          social_accounts: {
            linkedin_url: personalDetails.linkedin,
            github_url: personalDetails.github,
          },
        },
      });

      const payload = {
        address: {
          address_line_1: personalDetails.addresses.address_line_1,
          address_line_2: personalDetails.addresses.address_line_2,
          address_type: personalDetails.addresses.address_type,
          city: personalDetails.addresses.city,
          state: personalDetails.addresses.state,
          country: personalDetails.addresses.country,
          pin: personalDetails.addresses.pin,
        },
      };
      if (addrId) {
        await teamsApi.updateAddress(memberId, addrId, {
          address: { ...personalDetails.addresses },
        });
      } else {
        await teamsApi.createAddress(memberId, payload);
      }

      setErrDetails(initialErrState);
      navigate(`/team/${memberId}`, { replace: true });
    } catch (err) {
      setIsLoading(false);
      const errObj = initialErrState;
      if (err.inner) {
        err.inner.map(item => {
          if (item.path.includes("addresses")) {
            errObj[`${item.path.split(".").pop()}_err`] = item.message;
          } else {
            errObj[`${item.path}_err`] = item.message;
          }
        });
        setErrDetails(errObj);
      }
    }
  };

  const handleOnChangeCity = selectCity => {
    updateDetails("personal", {
      ...personalDetails,
      ...{
        addresses: {
          ...personalDetails.addresses,
          ...{ city: selectCity.value },
        },
      },
    });
  };

  const handlePhoneNumberChange = phoneNumber => {
    updateBasicDetails(phoneNumber, "phone_number", false);
  };

  const handleCancelDetails = () => {
    setIsLoading(true);
    navigate(`/team/${memberId}`, { replace: true });
  };

  return (
    <Fragment>
      {isDesktop && (
        <Fragment>
          <div className="flex items-center justify-between bg-miru-han-purple-1000 px-10 py-4">
            <h1 className="text-2xl font-bold text-white">Personal Details</h1>
            <div>
              <button
                className="mx-1 cursor-pointer rounded-md border border-white bg-miru-han-purple-1000 px-3 py-2 font-bold text-white	"
                onClick={handleCancelDetails} // eslint-disable-line  @typescript-eslint/no-empty-function
              >
                Cancel
              </button>
              <button
                className="mx-1 cursor-pointer rounded-md border bg-white px-3 py-2 font-bold text-miru-han-purple-1000"
                onClick={handleUpdateDetails}
              >
                Update
              </button>
            </div>
          </div>
          {isLoading ? (
            <Loader className="min-h-70v" />
          ) : (
            <StaticPage
              addrType={addrType}
              addressOptions={addressOptions}
              countries={countries}
              currentCityList={currentCityList}
              currentCountryDetails={currentCountryDetails}
              dateFormat={personalDetails.date_format}
              errDetails={errDetails}
              handleDatePicker={handleDatePicker}
              handleOnChangeAddrType={handleOnChangeAddrType}
              handleOnChangeCity={handleOnChangeCity}
              handleOnChangeCountry={handleOnChangeCountry}
              handleOnChangeState={handleOnChangeState}
              handlePhoneNumberChange={handlePhoneNumberChange}
              personalDetails={personalDetails}
              promiseOptions={promiseOptions}
              setShowDatePicker={setShowDatePicker}
              showDatePicker={showDatePicker}
              updateBasicDetails={updateBasicDetails}
              updatedStates={updatedStates}
              wrapperRef={wrapperRef}
            />
          )}
        </Fragment>
      )}
      {!isDesktop && (
        <Fragment>
          <MobileDetailsHeader
            href={`/team/${memberId}/details`}
            title="Personal Details"
          />
          {isLoading ? (
            <div className="flex min-h-70v items-center justify-center">
              <Loader />
            </div>
          ) : (
            <MobileEditPage
              addrType={addrType}
              addressOptions={addressOptions}
              countries={countries}
              currentCountryDetails={currentCountryDetails}
              dateFormat={personalDetails.date_format}
              errDetails={errDetails}
              handleCancelDetails={handleCancelDetails}
              handleDatePicker={handleDatePicker}
              handleOnChangeAddrType={handleOnChangeAddrType}
              handleOnChangeCity={handleOnChangeCity}
              handleOnChangeCountry={handleOnChangeCountry}
              handleOnChangeState={handleOnChangeState}
              handlePhoneNumberChange={handlePhoneNumberChange}
              handleUpdateDetails={handleUpdateDetails}
              personalDetails={personalDetails}
              promiseOptions={promiseOptions}
              setShowDatePicker={setShowDatePicker}
              showDatePicker={showDatePicker}
              updateBasicDetails={updateBasicDetails}
              updatedStates={updatedStates}
              wrapperRef={wrapperRef}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default EmploymentDetails;
