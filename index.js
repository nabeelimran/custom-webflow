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

  document
    .getElementById("wf-form-Calculator-Form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var formValues = new FormData(event.target);
      const formDataObj = {};
      formValues.forEach((value, key) => (formDataObj[key] = Number(value)));

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
        propertyManagement: (formDataObj["Management"]/100) * totalRentPerMonth,
        propertyTaxes: formDataObj["Property-Tax"] / 12,
        insurance: formDataObj["Insurance"],
        ownerPaidUtilities: OwnerPaidUtils,
        vacancyReserve: (formDataObj["Vacancy"]/100) * totalRentPerMonth,
        maintenanceReserve: (formDataObj["Maintenance"]/100) * totalRentPerMonth,
      };
      let currentTotalOperatingExpenses = currentValues.propertyManagement + currentValues.propertyTaxes + currentValues.insurance + currentValues.ownerPaidUtilities + currentValues.vacancyReserve + currentValues.maintenanceReserve
      let currentMonthlyNOI = totalRentPerMonth - currentTotalOperatingExpenses
      let currentAnnualizedNOI = currentMonthlyNOI * 12
      let currentCapitalizationRate = ((currentAnnualizedNOI / formDataObj["Sales-Price"])*100).toFixed(2)

      // stabilized
      let stabilizedValues = {
        grossRent: totalMarketRent,
        propertyManagement: (formDataObj["Management"]/100) * totalMarketRent,
        propertyTaxes: formDataObj["Property-Tax"] / 12,
        insurance: formDataObj["Insurance"],
        ownerPaidUtilities: OwnerPaidUtils,
        vacancyReserve: (formDataObj["Vacancy"]/100) * totalMarketRent,
        maintenanceReserve: (formDataObj["Maintenance"]/100) * totalMarketRent,
      };
      let stabilizedTotalOperatingExpenses = stabilizedValues.propertyManagement + stabilizedValues.propertyTaxes + stabilizedValues.insurance + stabilizedValues.ownerPaidUtilities + stabilizedValues.vacancyReserve + stabilizedValues.maintenanceReserve
      let stabilizedMonthlyNOI = totalMarketRent - stabilizedTotalOperatingExpenses
      let stabilizedAnnualizedNOI = stabilizedMonthlyNOI * 12
      let stabilizedCapitalizationRate = ((stabilizedAnnualizedNOI / formDataObj["Sales-Price"])*100).toFixed(2)


      // Mortgage
      // Current 
      let loanToValueRatio = 1 - formDataObj["Down-Payment"] / 100;
      let mortgageValues = {
        salePrice: formDataObj["Sales-Price"],
        loanToValueRatio: (loanToValueRatio * 100).toFixed(2),
        downPayment:
          (formDataObj["Down-Payment"] / 100) * formDataObj["Sales-Price"],
        closingCosts: formDataObj["Closing-Cost"],
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
      let currentAnnualizedROI =
        ((currentAnnualizedNet /
          (mortgageValues.downPayment + mortgageValues.closingCosts)) *
        100).toFixed(2);

      // stabilized 
      let stabilizedMonthlyNet = stabilizedMonthlyNOI - monthlyMortgage;
      let stabilizedAnnualizedNet = stabilizedMonthlyNet * 12;
      let stabilizedAnnualizedROI =
        ((stabilizedAnnualizedNet /
          (mortgageValues.downPayment + mortgageValues.closingCosts)) *
        100).toFixed(2);



      // dom manipulation
      const currentExpenseEl = document.querySelector('.current .expense-calc');
      const currentMortgageEl = document.querySelector('.current .mortgage-calc');
      const futureExpenseEl = document.querySelector('.future .expense-calc');
      const futureMortgageEl = document.querySelector('.future .mortgage-calc');

      currentExpenseEl.querySelector('#gross-rent').innerText = `$${currentValues.grossRent}`
      currentExpenseEl.querySelector('#total-expenses').innerText = `$${currentTotalOperatingExpenses.toFixed(2)}`
      currentExpenseEl.querySelector('#management').innerText = `$${currentValues.propertyManagement.toFixed(2)}`
      currentExpenseEl.querySelector('#taxes').innerText = `$${currentValues.propertyTaxes.toFixed(2)}`
      currentExpenseEl.querySelector('#insurance').innerText = `$${currentValues.insurance.toFixed(2)}`
      currentExpenseEl.querySelector('#utilities').innerText = `$${currentValues.ownerPaidUtilities.toFixed(2)}`
      currentExpenseEl.querySelector('#vacancy').innerText = `$${currentValues.vacancyReserve.toFixed(2)}`
      currentExpenseEl.querySelector('#maintenance').innerText = `$${currentValues.maintenanceReserve.toFixed(2)}`
      currentExpenseEl.querySelector('#monthly-noi').innerText = `$${currentMonthlyNOI.toFixed(2)}`
      currentExpenseEl.querySelector('#annualized-noi').innerText = `$${currentAnnualizedNOI.toFixed(2)}`
      currentExpenseEl.querySelector('#capitalization').innerText = `${currentCapitalizationRate}%`

      currentMortgageEl.querySelector('#sale-price').innerText = `$${mortgageValues.salePrice}`
      currentMortgageEl.querySelector('#monthly-mortgage').innerText = `$${monthlyMortgage.toFixed(2)}`
      currentMortgageEl.querySelector('#loan-to-value').innerText = `${mortgageValues.loanToValueRatio}%`
      currentMortgageEl.querySelector('#down-payment').innerText = `$${mortgageValues.downPayment}`
      currentMortgageEl.querySelector('#closing-cost').innerText = `$${mortgageValues.closingCosts}`
      currentMortgageEl.querySelector('#principal').innerText = `$${mortgageValues.principal.toFixed(2)}`
      currentMortgageEl.querySelector('#interest-rate').innerText = `${mortgageValues.interestRate}%`
      currentMortgageEl.querySelector('#term').innerText = `${mortgageValues.termYears}`
      currentMortgageEl.querySelector('#monthly-net').innerText = `$${currentMonthlyNet.toFixed(2)}`
      currentMortgageEl.querySelector('#annualized-net').innerText = `$${currentAnnualizedNet.toFixed(2)}`
      currentMortgageEl.querySelector('#annualized-roi').innerText = `${currentAnnualizedROI}%`


      futureExpenseEl.querySelector('#gross-rent').innerText = `$${stabilizedValues.grossRent}`
      futureExpenseEl.querySelector('#total-expenses').innerText = `$${stabilizedTotalOperatingExpenses.toFixed(2)}`
      futureExpenseEl.querySelector('#management').innerText = `$${stabilizedValues.propertyManagement.toFixed(2)}`
      futureExpenseEl.querySelector('#taxes').innerText = `$${stabilizedValues.propertyTaxes.toFixed(2)}`
      futureExpenseEl.querySelector('#insurance').innerText = `$${stabilizedValues.insurance.toFixed(2)}`
      futureExpenseEl.querySelector('#utilities').innerText = `$${stabilizedValues.ownerPaidUtilities.toFixed(2)}`
      futureExpenseEl.querySelector('#vacancy').innerText = `$${stabilizedValues.vacancyReserve.toFixed(2)}`
      futureExpenseEl.querySelector('#maintenance').innerText = `$${stabilizedValues.maintenanceReserve.toFixed(2)}`
      futureExpenseEl.querySelector('#monthly-noi').innerText = `$${stabilizedMonthlyNOI.toFixed(2)}`
      futureExpenseEl.querySelector('#annualized-noi').innerText = `$${stabilizedAnnualizedNOI.toFixed(2)}`
      futureExpenseEl.querySelector('#capitalization').innerText = `${stabilizedCapitalizationRate}%`

      futureMortgageEl.querySelector('#sale-price').innerText = `$${mortgageValues.salePrice}`
      futureMortgageEl.querySelector('#monthly-mortgage').innerText = `$${monthlyMortgage.toFixed(2)}`
      futureMortgageEl.querySelector('#loan-to-value').innerText = `${mortgageValues.loanToValueRatio}%`
      futureMortgageEl.querySelector('#down-payment').innerText = `$${mortgageValues.downPayment}`
      futureMortgageEl.querySelector('#closing-cost').innerText = `$${mortgageValues.closingCosts}`
      futureMortgageEl.querySelector('#principal').innerText = `$${mortgageValues.principal.toFixed(2)}`
      futureMortgageEl.querySelector('#interest-rate').innerText = `${mortgageValues.interestRate}%`
      futureMortgageEl.querySelector('#term').innerText = `${mortgageValues.termYears}`
      futureMortgageEl.querySelector('#monthly-net').innerText = `$${stabilizedMonthlyNet.toFixed(2)}`
      futureMortgageEl.querySelector('#annualized-net').innerText = `$${stabilizedAnnualizedNet.toFixed(2)}`
      futureMortgageEl.querySelector('#annualized-roi').innerText = `${stabilizedAnnualizedROI}%`
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
  return rate * pv * Math.pow((1 + rate), nper) / (-1 + Math.pow((1 + rate), nper));
}
