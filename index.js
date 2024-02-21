const unitsMapping = {
  Single: 1,
  Duplex: 2,
  Triplex: 3,
  Quadraplex: 4,
};

document.addEventListener("DOMContentLoaded", (event) => {
  const unitWrappers = document.querySelectorAll(".unit-wrapper");
  const dropdown = document.getElementById("Number-of-units");

  let units = 1;

  updateUnitsView(units);

  dropdown.addEventListener("change", (e) => {
    units = unitsMapping[e.target.value];
    updateUnitsView(units);
  });

  // rent calculator
  document
    .getElementById("wf-form-Calculator-Form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var formValues = new FormData(event.target);
      const formDataObj = {};
      formValues.forEach((value, key) => (formDataObj[key] = Number(value)));

      formDataObj["Sales-Price"] =
        formDataObj["Purchase-Price"] + formDataObj["Rehab"];

      let totalRentPerMonth = 0,
        totalMarketRent = 0;

      for (let i = 1; i <= units; i++) {
        totalRentPerMonth += formDataObj[`Unit${i}-Rent`];
        totalMarketRent += formDataObj[`Unit${i}-Market-Rent`];
      }

      // Expenses
      // Current
      const OwnerPaidUtils =
        formDataObj["Gas-and-Electric"] +
        formDataObj["Water"] +
        formDataObj["Sewer"] +
        formDataObj["Garbage"] +
        formDataObj["Land-and-Snow"];

      let currentValues = {
        grossRent: totalRentPerMonth,
        propertyManagement:
          (formDataObj["Management"] / 100) * totalRentPerMonth,
        propertyTaxes: formDataObj["Property-Tax"] / 12,
        insurance: formDataObj["Insurance"],
        ownerPaidUtilities: OwnerPaidUtils,
        vacancyReserve: (formDataObj["Vacancy"] / 100) * totalRentPerMonth,
        maintenanceReserve:
          (formDataObj["Maintenance"] / 100) * totalRentPerMonth,
      };
      let currentTotalOperatingExpenses =
        currentValues.propertyManagement +
        currentValues.propertyTaxes +
        currentValues.insurance +
        currentValues.ownerPaidUtilities +
        currentValues.vacancyReserve +
        currentValues.maintenanceReserve;
      let currentMonthlyNOI = totalRentPerMonth - currentTotalOperatingExpenses;
      let currentAnnualizedNOI = currentMonthlyNOI * 12;
      let currentCapitalizationRate = (
        (currentAnnualizedNOI / formDataObj["Sales-Price"]) *
        100
      ).toFixed(2);

      // stabilized
      let stabilizedValues = {
        grossRent: totalMarketRent,
        propertyManagement: (formDataObj["Management"] / 100) * totalMarketRent,
        propertyTaxes: formDataObj["Property-Tax"] / 12,
        insurance: formDataObj["Insurance"],
        ownerPaidUtilities: OwnerPaidUtils,
        vacancyReserve: (formDataObj["Vacancy"] / 100) * totalMarketRent,
        maintenanceReserve:
          (formDataObj["Maintenance"] / 100) * totalMarketRent,
      };
      let stabilizedTotalOperatingExpenses =
        stabilizedValues.propertyManagement +
        stabilizedValues.propertyTaxes +
        stabilizedValues.insurance +
        stabilizedValues.ownerPaidUtilities +
        stabilizedValues.vacancyReserve +
        stabilizedValues.maintenanceReserve;
      let stabilizedMonthlyNOI =
        totalMarketRent - stabilizedTotalOperatingExpenses;
      let stabilizedAnnualizedNOI = stabilizedMonthlyNOI * 12;
      let stabilizedCapitalizationRate = (
        (stabilizedAnnualizedNOI / formDataObj["Sales-Price"]) *
        100
      ).toFixed(2);

      // Mortgage
      // Current
      let loanToValueRatio = 1 - formDataObj["Down-Payment"] / 100;
      let mortgageValues = {
        salePrice: formDataObj["Sales-Price"],
        loanToValueRatio: (loanToValueRatio * 100).toFixed(2),
        downPayment:
          (formDataObj["Down-Payment"] / 100) * formDataObj["Sales-Price"],
        closingCosts:
          (formDataObj["Closing-Cost"] / 100) * formDataObj["Sales-Price"],
        principal: loanToValueRatio * formDataObj["Sales-Price"],
        interestRate: formDataObj["Interest-Rate"],
        termYears: formDataObj["Loan-Term"],
      };
      let monthlyMortgage = PMT(
        mortgageValues.interestRate / 100 / 12,
        mortgageValues.termYears * 12,
        mortgageValues.principal
      );
      let currentMonthlyNet = currentMonthlyNOI - monthlyMortgage;
      let currentAnnualizedNet = currentMonthlyNet * 12;
      let currentAnnualizedROI = (
        (currentAnnualizedNet /
          (mortgageValues.downPayment + mortgageValues.closingCosts)) *
        100
      ).toFixed(2);

      // stabilized
      let stabilizedMonthlyNet = stabilizedMonthlyNOI - monthlyMortgage;
      let stabilizedAnnualizedNet = stabilizedMonthlyNet * 12;
      let stabilizedAnnualizedROI = (
        (stabilizedAnnualizedNet /
          (mortgageValues.downPayment + mortgageValues.closingCosts)) *
        100
      ).toFixed(2);

      // dom manipulation
      const currentExpenseEl = document.querySelector(".current .expense-calc");
      const currentMortgageEl = document.querySelector(
        ".current .mortgage-calc"
      );
      const futureExpenseEl = document.querySelector(".future .expense-calc");
      const futureMortgageEl = document.querySelector(".future .mortgage-calc");

      currentExpenseEl.querySelector(
        "#gross-rent"
      ).innerText = `$${currentValues.grossRent}`;
      currentExpenseEl.querySelector(
        "#total-expenses"
      ).innerText = `$${currentTotalOperatingExpenses.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#management"
      ).innerText = `$${currentValues.propertyManagement.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#taxes"
      ).innerText = `$${currentValues.propertyTaxes.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#insurance"
      ).innerText = `$${currentValues.insurance.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#utilities"
      ).innerText = `$${currentValues.ownerPaidUtilities.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#vacancy"
      ).innerText = `$${currentValues.vacancyReserve.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#maintenance"
      ).innerText = `$${currentValues.maintenanceReserve.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#monthly-noi"
      ).innerText = `$${currentMonthlyNOI.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#annualized-noi"
      ).innerText = `$${currentAnnualizedNOI.toLocaleString()}`;
      currentExpenseEl.querySelector(
        "#capitalization"
      ).innerText = `${currentCapitalizationRate}%`;

      currentMortgageEl.querySelector(
        "#sale-price"
      ).innerText = `$${mortgageValues.salePrice}`;
      currentMortgageEl.querySelector(
        "#monthly-mortgage"
      ).innerText = `$${monthlyMortgage.toLocaleString()}`;
      currentMortgageEl.querySelector(
        "#loan-to-value"
      ).innerText = `${mortgageValues.loanToValueRatio}%`;
      currentMortgageEl.querySelector(
        "#down-payment"
      ).innerText = `$${mortgageValues.downPayment}`;
      currentMortgageEl.querySelector(
        "#closing-cost"
      ).innerText = `$${mortgageValues.closingCosts}`;
      currentMortgageEl.querySelector(
        "#principal"
      ).innerText = `$${mortgageValues.principal.toLocaleString()}`;
      currentMortgageEl.querySelector(
        "#interest-rate"
      ).innerText = `${mortgageValues.interestRate}%`;
      currentMortgageEl.querySelector(
        "#term"
      ).innerText = `${mortgageValues.termYears}`;
      currentMortgageEl.querySelector(
        "cash-invested"
      ).innerText = `$${(mortgageValues.downPayment + mortgageValues.closingCosts).toLocaleString()}`;
      currentMortgageEl.querySelector(
        "#monthly-net"
      ).innerText = `$${currentMonthlyNet.toLocaleString()}`;
      currentMortgageEl.querySelector(
        "#annualized-net"
      ).innerText = `$${currentAnnualizedNet.toLocaleString()}`;
      currentMortgageEl.querySelector(
        "#annualized-roi"
      ).innerText = `${currentAnnualizedROI}%`;

      futureExpenseEl.querySelector(
        "#gross-rent"
      ).innerText = `$${stabilizedValues.grossRent}`;
      futureExpenseEl.querySelector(
        "#total-expenses"
      ).innerText = `$${stabilizedTotalOperatingExpenses.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#management"
      ).innerText = `$${stabilizedValues.propertyManagement.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#taxes"
      ).innerText = `$${stabilizedValues.propertyTaxes.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#insurance"
      ).innerText = `$${stabilizedValues.insurance.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#utilities"
      ).innerText = `$${stabilizedValues.ownerPaidUtilities.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#vacancy"
      ).innerText = `$${stabilizedValues.vacancyReserve.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#maintenance"
      ).innerText = `$${stabilizedValues.maintenanceReserve.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#monthly-noi"
      ).innerText = `$${stabilizedMonthlyNOI.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#annualized-noi"
      ).innerText = `$${stabilizedAnnualizedNOI.toLocaleString()}`;
      futureExpenseEl.querySelector(
        "#capitalization"
      ).innerText = `${stabilizedCapitalizationRate}%`;

      futureMortgageEl.querySelector(
        "#sale-price"
      ).innerText = `$${mortgageValues.salePrice}`;
      futureMortgageEl.querySelector(
        "#monthly-mortgage"
      ).innerText = `$${monthlyMortgage.toLocaleString()}`;
      futureMortgageEl.querySelector(
        "#loan-to-value"
      ).innerText = `${mortgageValues.loanToValueRatio}%`;
      futureMortgageEl.querySelector(
        "#down-payment"
      ).innerText = `$${mortgageValues.downPayment}`;
      futureMortgageEl.querySelector(
        "#closing-cost"
      ).innerText = `$${mortgageValues.closingCosts}`;
      futureMortgageEl.querySelector(
        "#principal"
      ).innerText = `$${mortgageValues.principal.toLocaleString()}`;
      futureMortgageEl.querySelector(
        "#interest-rate"
      ).innerText = `${mortgageValues.interestRate}%`;
      futureMortgageEl.querySelector(
        "#term"
      ).innerText = `${mortgageValues.termYears}`;
      futureMortgageEl.querySelector(
        "cash-invested"
      ).innerText = `$${(mortgageValues.downPayment + mortgageValues.closingCosts).toLocaleString()}`;
      futureMortgageEl.querySelector(
        "#monthly-net"
      ).innerText = `$${stabilizedMonthlyNet.toLocaleString()}`;
      futureMortgageEl.querySelector(
        "#annualized-net"
      ).innerText = `$${stabilizedAnnualizedNet.toLocaleString()}`;
      futureMortgageEl.querySelector(
        "#annualized-roi"
      ).innerText = `${stabilizedAnnualizedROI}%`;
    });

  // Flip Calculator
  document
    .getElementById("wf-flip-Calculator-Form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var formValues = new FormData(event.target);
      const formDataObj = {};
      formValues.forEach((value, key) => (formDataObj[key] = Number(value)));

      // console.log(formDataObj);
      //   {
      //     "Purchase-Price-2": 1,
      //     "Rehab-2": 2,
      //     "Holding-Period": 3,
      //     "Resell-Price": 4,
      //     "Down-payment-for-Purchase": 0,
      //     "Down-payment-for-Renovation": 0,
      //     "Interest-Rate": 0,
      //     "Financing-Costs": 0,
      //     "Property-Tax-2": 0,
      //     "Insurance-2": 0,
      //     "Gas-and-Electric-2": 0,
      //     "Water-2": 0,
      //     "Sewer-2": 0,
      //     "Garbage-2": 0,
      //     "Land-and-Snow-2": 0,
      //     "Sales-Cost": 0,
      //     "Closing-Costs": 0
      // }

      // Expenses
      let purchasePrice = formDataObj["Purchase-Price-2"];
      let rehab = formDataObj["Rehab-2"];
      let totalCost = formDataObj["Purchase-Price-2"] + formDataObj["Rehab-2"];
      let holdingPeriod = formDataObj["Holding-Period"];
      let targetPrice = formDataObj["Resell-Price"];
      let propertyTaxes = formDataObj["Property-Tax-2"] / 12;
      let insurance = formDataObj["Insurance-2"];
      let gas = formDataObj["Gas-and-Electric-2"];
      let water = formDataObj["Water-2"];
      let sewer = formDataObj["Sewer-2"];
      let garbage = formDataObj["Garbage-2"];
      let landNSnow = formDataObj["Land-and-Snow-2"];
      const OwnerPaidUtils =
        propertyTaxes + insurance + gas + water + sewer + garbage + landNSnow;
      let totalExpenses = OwnerPaidUtils * holdingPeriod

      let salesCostPercent = formDataObj["Sales-Cost"];
      let saleFee = (salesCostPercent/100) * targetPrice

      let closingCostsPercent = formDataObj["Closing-Costs"];
      let closingCost = (closingCostsPercent / 100) * targetPrice

      // Mortgage
      let downPaymentPurchase =
        (formDataObj["Down-payment-for-Purchase"] / 100) *
        formDataObj["Purchase-Price-2"];
      let downPaymentRehab =
        (formDataObj["Down-payment-for-Renovation"] / 100) *
        formDataObj["Rehab-2"];
      let interestRatePercent = formDataObj["Interest-Rate"];
      let processingFee = formDataObj["Financing-Costs"];

      let totalDownPayment = downPaymentPurchase + downPaymentRehab
      // let totalInterest = totalDownPayment * (interestRatePercent/100) * holdingPeriod / 12
      let loanAmount = totalCost - totalDownPayment
      let interestCost = loanAmount * (interestRatePercent/100) / holdingPeriod
      let financingCost = interestCost + processingFee
      // let loanEstimate = totalInterest + processingFee
      let allInCost = totalExpenses + financingCost + loanAmount + totalDownPayment + closingCost
      let grossMargin = targetPrice - allInCost

      let netProfit = grossMargin - saleFee


      // dom manipulation
      const flipResult = document.querySelector('div[data-w-tab="Flip"]');

      flipResult.querySelector('#holding-period').innerText = `${holdingPeriod}`
      
      flipResult.querySelector('#property-taxes').innerText = `$${propertyTaxes.toLocaleString()}`
      flipResult.querySelector('#insurance').innerText = `$${insurance.toLocaleString()}`
      flipResult.querySelector('#gas-and-electric').innerText = `$${gas.toLocaleString()}`
      flipResult.querySelector('#water-and-sewer').innerText = `$${(water+sewer).toLocaleString()}`
      flipResult.querySelector('#garbage').innerText = `$${garbage.toLocaleString()}`
      flipResult.querySelector('#lawn-and-snow').innerText = `$${landNSnow.toLocaleString()}`
      flipResult.querySelector('#total-expenses').innerText = `$${totalExpenses.toLocaleString()}`
      
      flipResult.querySelector('#loan-amount').innerText = `$${loanAmount.toLocaleString()}`

      flipResult.querySelector('#interest-costs').innerText = `$${interestCost.toLocaleString()}`
      
      flipResult.querySelector('#processing-fee').innerText = `$${processingFee.toLocaleString()}`
      
      flipResult.querySelector('#financing-cost').innerText = `$${financingCost.toLocaleString()}`
      
      flipResult.querySelector('#down-payment').innerText = `$${totalDownPayment.toLocaleString()}`

      flipResult.querySelector('#closing-costs').innerText = `$${closingCost.toLocaleString()}`

      flipResult.querySelector('#all-in-cost').innerText = `$${allInCost.toLocaleString()}`


      flipResult.querySelector('#purchase-price').innerText = `$${purchasePrice.toLocaleString()}`
      flipResult.querySelector('#rehab-price').innerText = `$${rehab.toLocaleString()}`
      flipResult.querySelector('#target-price-arv').innerText = `$${targetPrice.toLocaleString()}`
      flipResult.querySelector('#sale-fee').innerText = `$${saleFee.toLocaleString()}`
      flipResult.querySelector('#gross-margin').innerText = `$${grossMargin.toLocaleString()}`
      flipResult.querySelector('#net-profiit').innerText = `$${netProfit.toLocaleString()}`
    });

  function updateUnitsView(units) {
    for (let i = 0; i < unitWrappers.length; i++) {
      const element = unitWrappers[i];
      if (i + 1 <= units) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  }
});

function PMT(rate, nper, pv) {
  return (
    (rate * pv * Math.pow(1 + rate, nper)) / (-1 + Math.pow(1 + rate, nper))
  );
}
// https://cdn.jsdelivr.net/gh/nabeelimran/custom-webflow@latest/index.min.js
