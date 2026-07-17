    document.addEventListener("DOMContentLoaded", function () {

        // =====================================================
        // ELEMENTS
        // =====================================================

        const addPrepaymentBtn = document.getElementById("addPrepaymentBtn");
        const prepaymentContainer = document.getElementById("prepaymentContainer");
        const calculateBtn = document.getElementById("calculateBtn");
        const resultsSection = document.getElementById("resultsSection");
        const scheduleBody = document.getElementById("scheduleBody");


        // =====================================================
        // FORMAT CURRENCY
        // =====================================================

        function formatCurrency(value) {

            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(Number(value) || 0);

        }


        // =====================================================
        // FORMAT TENURE
        // =====================================================

        function formatTenure(totalMonths) {

            totalMonths = Math.max(
                Math.round(Number(totalMonths) || 0),
                0
            );

            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;

            if (years === 0) {
                return `${months} Months`;
            }

            if (months === 0) {
                return `${years} Years`;
            }

            return `${years} Years ${months} Months`;

        }


        // =====================================================
        // UPDATE PREPAYMENT NUMBERS
        // =====================================================

        function updatePrepaymentNumbers() {

            const rows =
                document.querySelectorAll(".prepayment-row");

            rows.forEach(function (row, index) {

                const number =
                    row.querySelector(".prepayment-number");

                if (number) {
                    number.textContent = index + 1;
                }

            });

        }


        // =====================================================
        // CREATE PREPAYMENT ROW
        // =====================================================

        function createPrepaymentRow() {

            const row = document.createElement("div");

            row.className = "prepayment-row";

            row.innerHTML = `

                <div class="prepayment-number">
                    1
                </div>

                <div class="prepayment-field">

                    <label>
                        Payment After
                    </label>

                    <div class="input-wrapper">

                        <input
                            type="number"
                            class="prepayment-year"
                            value="0"
                            min="0"
                        >

                        <span class="input-suffix">
                            Years
                        </span>

                    </div>

                </div>

                <div class="prepayment-field">

                    <label>
                        Additional Months
                    </label>

                    <div class="input-wrapper">

                        <input
                            type="number"
                            class="prepayment-month"
                            value="0"
                            min="0"
                            max="11"
                        >

                        <span class="input-suffix">
                            Months
                        </span>

                    </div>

                </div>

                <div class="prepayment-field">

                    <label>
                        Prepayment Amount
                    </label>

                    <div class="input-wrapper">

                        <span class="input-prefix">
                            ₹
                        </span>

                        <input
                            type="number"
                            class="prepayment-amount"
                            value="500000"
                            min="1"
                        >

                    </div>

                </div>

                <div class="prepayment-field strategy-field">

                    <label>
                        After Prepayment
                    </label>

                    <div class="input-wrapper">

                        <select class="prepayment-strategy">

                            <option value="reduce_tenure">
                                Reduce Tenure - Keep EMI Same
                            </option>

                            <option value="reduce_emi">
                                Reduce EMI - Keep Tenure Same
                            </option>

                        </select>

                    </div>

                </div>

                <button
                    type="button"
                    class="remove-btn"
                    title="Remove Prepayment"
                >
                    ×
                </button>

            `;

            prepaymentContainer.appendChild(row);

            updatePrepaymentNumbers();

        }


        // =====================================================
        // ADD PREPAYMENT
        // =====================================================

        addPrepaymentBtn.addEventListener(
            "click",
            function () {

                createPrepaymentRow();

            }
        );


        // =====================================================
        // REMOVE PREPAYMENT
        // =====================================================

        prepaymentContainer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.classList.contains(
                        "remove-btn"
                    )
                ) {

                    const row =
                        event.target.closest(
                            ".prepayment-row"
                        );

                    if (row) {
                        row.remove();
                    }

                    updatePrepaymentNumbers();

                }

            }
        );


        // =====================================================
        // GET PREPAYMENTS
        // =====================================================

        function getPrepayments() {

            const rows =
                document.querySelectorAll(
                    ".prepayment-row"
                );

            const prepayments = [];


            rows.forEach(function (row, index) {

                const years =
                    Number(
                        row.querySelector(
                            ".prepayment-year"
                        ).value
                    ) || 0;


                const additionalMonths =
                    Number(
                        row.querySelector(
                            ".prepayment-month"
                        ).value
                    ) || 0;


                const amount =
                    Number(
                        row.querySelector(
                            ".prepayment-amount"
                        ).value
                    ) || 0;


                const strategy =
                    row.querySelector(
                        ".prepayment-strategy"
                    ).value;


                const month =
                    (years * 12) +
                    additionalMonths;


                if (
                    month > 0 &&
                    amount > 0
                ) {

                    prepayments.push({

                        original_number:
                            index + 1,

                        month:
                            month,

                        amount:
                            amount,

                        strategy:
                            strategy

                    });

                }

            });


            return prepayments;

        }


        // =====================================================
        // VALIDATION
        // =====================================================

        function validateInputs(
            loanAmount,
            interestRate,
            tenureYears
        ) {

            if (
                !loanAmount ||
                loanAmount <= 0
            ) {

                alert(
                    "Please enter a valid loan amount."
                );

                return false;

            }


            if (
                isNaN(interestRate) ||
                interestRate < 0
            ) {

                alert(
                    "Please enter a valid interest rate."
                );

                return false;

            }


            if (
                !tenureYears ||
                tenureYears <= 0
            ) {

                alert(
                    "Please enter a valid loan tenure."
                );

                return false;

            }


            return true;

        }


        // =====================================================
        // EMI CALCULATION
        // =====================================================

        function calculateEMI(
            principal,
            monthlyRate,
            months
        ) {

            if (
                principal <= 0 ||
                months <= 0
            ) {

                return 0;

            }


            if (monthlyRate === 0) {

                return (
                    principal /
                    months
                );

            }


            const factor =
                Math.pow(
                    1 + monthlyRate,
                    months
                );


            return (
                principal *
                monthlyRate *
                factor /
                (factor - 1)
            );

        }


        // =====================================================
        // REMAINING TENURE
        // =====================================================

        function calculateRemainingMonths(
            principal,
            monthlyRate,
            emi
        ) {

            if (
                principal <= 0 ||
                emi <= 0
            ) {

                return 0;

            }


            if (monthlyRate === 0) {

                return Math.ceil(
                    principal /
                    emi
                );

            }


            if (
                emi <=
                principal *
                monthlyRate
            ) {

                return 1200;

            }


            const months =

                -Math.log(

                    1 -

                    (
                        principal *
                        monthlyRate /
                        emi
                    )

                )

                /

                Math.log(
                    1 + monthlyRate
                );


            return Math.ceil(
                months
            );

        }


        // =====================================================
        // MAIN LOAN CALCULATION
        // =====================================================

        function calculateLoanPlan(
            loanAmount,
            annualRate,
            tenureYears,
            prepayments
        ) {

            const monthlyRate =
                annualRate /
                12 /
                100;


            const originalMonths =
                tenureYears *
                12;


            const originalEMI =
                calculateEMI(
                    loanAmount,
                    monthlyRate,
                    originalMonths
                );


            const originalInterest =
                (
                    originalEMI *
                    originalMonths
                )
                -
                loanAmount;


            // =================================================
            // PREPARE PREPAYMENTS
            // =================================================

            const validPrepayments =

                prepayments

                    .filter(function (item) {

                        return (
                            item.month > 0 &&
                            item.amount > 0
                        );

                    })

                    .map(function (
                        item,
                        index
                    ) {

                        return {

                            original_number:
                                item.original_number ||
                                index + 1,

                            month:
                                Number(
                                    item.month
                                ),

                            amount:
                                Number(
                                    item.amount
                                ),

                            strategy:
                                item.strategy ===
                                "reduce_emi"

                                    ? "reduce_emi"

                                    : "reduce_tenure"

                        };

                    })

                    .sort(function (a, b) {

                        return (
                            a.month -
                            b.month
                        );

                    });


            // =================================================
            // PREPAYMENT MAP
            // =================================================

            const prepaymentMap = {};


            validPrepayments.forEach(
                function (payment) {

                    if (
                        !prepaymentMap[
                            payment.month
                        ]
                    ) {

                        prepaymentMap[
                            payment.month
                        ] = [];

                    }


                    prepaymentMap[
                        payment.month
                    ].push(
                        payment
                    );

                }
            );


            // =================================================
            // INITIAL STATE
            // =================================================

            let balance =
                loanAmount;


            let currentEMI =
                originalEMI;


            let currentEndMonth =
                originalMonths;


            let totalInterest =
                0;


            let totalPrepayment =
                0;


            const schedule =
                [];


            const strategyHistory =
                [];


            let month =
                1;


            // =================================================
            // MONTH-WISE CALCULATION
            // =================================================

            while (
                balance > 0.01 &&
                month <= 1200
            ) {


                // =============================================
                // REGULAR EMI
                // =============================================

                const openingBalance =
                    balance;


                const interest =
                    openingBalance *
                    monthlyRate;


                let principalPaid =
                    currentEMI -
                    interest;


                if (
                    principalPaid <= 0
                ) {

                    throw new Error(
                        "EMI is too low to cover monthly interest."
                    );

                }


                let emiPaid =
                    currentEMI;


                // Last EMI adjustment

                if (
                    principalPaid >=
                    balance
                ) {

                    principalPaid =
                        balance;


                    emiPaid =
                        principalPaid +
                        interest;

                }


                balance -=
                    principalPaid;


                totalInterest +=
                    interest;


                let monthPrepayment =
                    0;


                // =============================================
                // PREPAYMENTS THIS MONTH
                // =============================================

                if (
                    prepaymentMap[
                        month
                    ] &&
                    balance > 0.01
                ) {


                    for (
                        const payment
                        of prepaymentMap[
                            month
                        ]
                    ) {


                        if (
                            balance <= 0.01
                        ) {

                            break;

                        }


                        const balanceBefore =
                            balance;


                        const actualPrepayment =
                            Math.min(
                                payment.amount,
                                balance
                            );


                        balance -=
                            actualPrepayment;


                        monthPrepayment +=
                            actualPrepayment;


                        totalPrepayment +=
                            actualPrepayment;


                        const oldEMI =
                            currentEMI;


                        const oldEndMonth =
                            currentEndMonth;


                        const oldRemainingMonths =
                            Math.max(
                                oldEndMonth -
                                month,
                                0
                            );


                        // =====================================
                        // REDUCE TENURE
                        // =====================================

                        if (
                            payment.strategy ===
                            "reduce_tenure"
                        ) {


                            let newRemainingMonths =
                                0;


                            if (
                                balance > 0.01
                            ) {

                                newRemainingMonths =

                                    calculateRemainingMonths(

                                        balance,

                                        monthlyRate,

                                        currentEMI

                                    );

                            }


                            currentEndMonth =

                                month +

                                newRemainingMonths;


                            const monthsReduced =

                                Math.max(

                                    oldEndMonth -

                                    currentEndMonth,

                                    0

                                );


                            strategyHistory.push({

                                number:
                                    payment.original_number,

                                month:
                                    month,

                                amount:
                                    actualPrepayment,

                                strategy:
                                    "reduce_tenure",

                                strategy_label:
                                    "Reduce Tenure",

                                balance_before:
                                    balanceBefore,

                                balance_after:
                                    balance,

                                old_emi:
                                    oldEMI,

                                new_emi:
                                    currentEMI,

                                old_remaining_months:
                                    oldRemainingMonths,

                                new_remaining_months:
                                    newRemainingMonths,

                                months_reduced:
                                    monthsReduced,

                                new_end_month:
                                    currentEndMonth

                            });

                        }


                        // =====================================
                        // REDUCE EMI
                        // =====================================

                        else {


                            const remainingMonths =

                                Math.max(

                                    currentEndMonth -

                                    month,

                                    0

                                );


                            if (
                                balance > 0.01 &&
                                remainingMonths > 0
                            ) {

                                currentEMI =

                                    calculateEMI(

                                        balance,

                                        monthlyRate,

                                        remainingMonths

                                    );

                            }

                            else {

                                currentEMI =
                                    0;

                            }


                            const emiReducedBy =

                                Math.max(

                                    oldEMI -

                                    currentEMI,

                                    0

                                );


                            strategyHistory.push({

                                number:
                                    payment.original_number,

                                month:
                                    month,

                                amount:
                                    actualPrepayment,

                                strategy:
                                    "reduce_emi",

                                strategy_label:
                                    "Reduce EMI",

                                balance_before:
                                    balanceBefore,

                                balance_after:
                                    balance,

                                old_emi:
                                    oldEMI,

                                new_emi:
                                    currentEMI,

                                emi_reduced_by:
                                    emiReducedBy,

                                remaining_months:
                                    remainingMonths,

                                new_end_month:
                                    currentEndMonth

                            });

                        }

                    }

                }


                // =============================================
                // SCHEDULE
                // =============================================

                schedule.push({

                    month:
                        month,

                    opening_balance:
                        openingBalance,

                    emi:
                        emiPaid,

                    principal:
                        principalPaid,

                    interest:
                        interest,

                    prepayment:
                        monthPrepayment,

                    closing_balance:
                        Math.max(
                            balance,
                            0
                        ),

                    next_emi:
                        currentEMI,

                    expected_end_month:
                        currentEndMonth

                });


                // Loan closed

                if (
                    balance <= 0.01
                ) {

                    balance =
                        0;

                    break;

                }


                month++;

            }


            // =================================================
            // FINAL RESULTS
            // =================================================

            const actualMonths =
                schedule.length;


            const monthsSaved =

                Math.max(

                    originalMonths -

                    actualMonths,

                    0

                );


            const interestSaved =

                Math.max(

                    originalInterest -

                    totalInterest,

                    0

                );


            const totalPaid =

                loanAmount +

                totalInterest;


            return {

                success:
                    true,


                original: {

                    loan_amount:
                        loanAmount,

                    emi:
                        originalEMI,

                    months:
                        originalMonths,

                    interest:
                        originalInterest

                },


                mixed_result: {

                    final_emi:
                        currentEMI,

                    actual_months:
                        actualMonths,

                    months_saved:
                        monthsSaved,

                    total_interest:
                        totalInterest,

                    interest_saved:
                        interestSaved,

                    total_prepayment:
                        totalPrepayment,

                    total_paid:
                        totalPaid

                },


                strategy_history:
                    strategyHistory,


                schedule:
                    schedule

            };

        }


        // =====================================================
        // CALCULATE BUTTON
        // =====================================================

        calculateBtn.addEventListener(
            "click",
            function () {


                const loanAmount =

                    Number(

                        document.getElementById(
                            "loanAmount"
                        ).value

                    );


                const interestRate =

                    Number(

                        document.getElementById(
                            "interestRate"
                        ).value

                    );


                const tenureYears =

                    Number(

                        document.getElementById(
                            "tenureYears"
                        ).value

                    );


                if (

                    !validateInputs(

                        loanAmount,

                        interestRate,

                        tenureYears

                    )

                ) {

                    return;

                }


                const prepayments =
                    getPrepayments();


                calculateBtn.disabled =
                    true;


                calculateBtn.textContent =
                    "Calculating Your Plan...";


                try {


                    const data =

                        calculateLoanPlan(

                            loanAmount,

                            interestRate,

                            tenureYears,

                            prepayments

                        );


                    displayResults(
                        data
                    );


                }

                catch (error) {


                    console.error(
                        error
                    );


                    alert(

                        "Error: " +

                        error.message

                    );


                }

                finally {


                    calculateBtn.disabled =
                        false;


                    calculateBtn.textContent =
                        "Calculate My Loan Plan";


                }

            }
        );


        // =====================================================
        // DISPLAY RESULTS
        // =====================================================

        function displayResults(data) {


            displayOriginalLoan(
                data.original
            );


            displayStrategyHistory(

                data.strategy_history ||
                []

            );


            displayFinalResult(

                data.mixed_result,

                data.strategy_history ||
                []

            );


            renderSchedule(

                data.schedule ||
                []

            );


            resultsSection.classList.remove(
                "hidden"
            );


            setTimeout(
                function () {

                    resultsSection.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                },
                100
            );

        }


        // =====================================================
        // ORIGINAL LOAN
        // =====================================================

        function displayOriginalLoan(
            original
        ) {


            document.getElementById(
                "originalLoanAmount"
            ).textContent =

                formatCurrency(
                    original.loan_amount
                );


            document.getElementById(
                "originalEmi"
            ).textContent =

                formatCurrency(
                    original.emi
                );


            document.getElementById(
                "originalTenure"
            ).textContent =

                formatTenure(
                    original.months
                );


            document.getElementById(
                "originalInterest"
            ).textContent =

                formatCurrency(
                    original.interest
                );

        }


        // =====================================================
        // STRATEGY HISTORY
        // =====================================================

        function displayStrategyHistory(
            history
        ) {


            const container =

                document.getElementById(
                    "strategyHistoryContainer"
                );


            container.innerHTML =
                "";


            if (
                !history ||
                history.length === 0
            ) {


                container.innerHTML = `

                    <div class="no-prepayment-message">

                        No prepayment strategy was applied.

                    </div>

                `;


                return;

            }


            history.forEach(
                function (
                    item,
                    index
                ) {


                    const card =

                        document.createElement(
                            "div"
                        );


                    card.className =
                        "strategy-history-card";


                    const isTenure =

                        item.strategy ===
                        "reduce_tenure";


                    let resultContent =
                        "";


                    // =========================================
                    // REDUCE TENURE RESULT
                    // =========================================

                    if (
                        isTenure
                    ) {


                        resultContent = `

                            <div class="decision-result">


                                <div>

                                    <span>
                                        EMI
                                    </span>

                                    <strong>

                                        ${formatCurrency(
                                            item.new_emi
                                        )}

                                    </strong>

                                    <small>
                                        Remains unchanged
                                    </small>

                                </div>


                                <div>

                                    <span>
                                        Previous Remaining Tenure
                                    </span>

                                    <strong>

                                        ${formatTenure(
                                            item.old_remaining_months
                                        )}

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        New Remaining Tenure
                                    </span>

                                    <strong>

                                        ${formatTenure(
                                            item.new_remaining_months
                                        )}

                                    </strong>

                                </div>


                                <div class="positive-result">

                                    <span>
                                        Tenure Reduced By
                                    </span>

                                    <strong>

                                        ${formatTenure(
                                            item.months_reduced
                                        )}

                                    </strong>

                                </div>


                            </div>

                        `;

                    }


                    // =========================================
                    // REDUCE EMI RESULT
                    // =========================================

                    else {


                        resultContent = `

                            <div class="decision-result">


                                <div>

                                    <span>
                                        Previous EMI
                                    </span>

                                    <strong>

                                        ${formatCurrency(
                                            item.old_emi
                                        )}

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        New EMI
                                    </span>

                                    <strong>

                                        ${formatCurrency(
                                            item.new_emi
                                        )}

                                    </strong>

                                </div>


                                <div class="positive-result">

                                    <span>
                                        EMI Reduced By
                                    </span>

                                    <strong>

                                        ${formatCurrency(
                                            item.emi_reduced_by
                                        )}

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Remaining Tenure
                                    </span>

                                    <strong>

                                        ${formatTenure(
                                            item.remaining_months
                                        )}

                                    </strong>

                                </div>


                            </div>

                        `;

                    }


                    // =========================================
                    // CARD
                    // =========================================

                    card.innerHTML = `

                        <div class="strategy-history-header">


                            <div class="strategy-step-number">

                                ${index + 1}

                            </div>


                            <div class="strategy-payment-info">


                                <span class="strategy-time">

                                    After

                                    ${formatTenure(
                                        item.month
                                    )}

                                </span>


                                <h3>

                                    ${formatCurrency(
                                        item.amount
                                    )}

                                    Prepayment

                                </h3>


                                <span class="selected-strategy ${
                                    isTenure
                                        ? "tenure-strategy"
                                        : "emi-strategy"
                                }">

                                    ${
                                        isTenure
                                            ? "Reduce Tenure"
                                            : "Reduce EMI"
                                    }

                                </span>


                            </div>


                            <div class="strategy-balance-info">


                                <span>
                                    Balance Before
                                </span>


                                <strong>

                                    ${formatCurrency(
                                        item.balance_before
                                    )}

                                </strong>


                                <span>
                                    Balance After
                                </span>


                                <strong>

                                    ${formatCurrency(
                                        item.balance_after
                                    )}

                                </strong>


                            </div>


                        </div>


                        ${resultContent}

                    `;


                    container.appendChild(
                        card
                    );

                }
            );

        }


        // =====================================================
        // FINAL RESULT
        // =====================================================

        function displayFinalResult(
            result,
            history
        ) {


            document.getElementById(
                "finalEmi"
            ).textContent =

                formatCurrency(
                    result.final_emi
                );


            document.getElementById(
                "finalTenure"
            ).textContent =

                formatTenure(
                    result.actual_months
                );


            document.getElementById(
                "monthsSaved"
            ).textContent =

                formatTenure(
                    result.months_saved
                );


            document.getElementById(
                "interestSaved"
            ).textContent =

                formatCurrency(
                    result.interest_saved
                );


            document.getElementById(
                "totalPrepayment"
            ).textContent =

                formatCurrency(
                    result.total_prepayment
                );


            document.getElementById(
                "totalInterest"
            ).textContent =

                formatCurrency(
                    result.total_interest
                );


            document.getElementById(
                "totalPaid"
            ).textContent =

                formatCurrency(
                    result.total_paid
                );


            document.getElementById(
                "totalStrategies"
            ).textContent =

                history.length;

        }


        // =====================================================
        // RENDER SCHEDULE
        // =====================================================

        function renderSchedule(
            schedule
        ) {


            scheduleBody.innerHTML =
                "";


            if (
                !schedule ||
                schedule.length === 0
            ) {


                scheduleBody.innerHTML = `

                    <tr>

                        <td colspan="8">

                            No schedule available.

                        </td>

                    </tr>

                `;


                return;

            }


            schedule.forEach(
                function (item) {


                    const row =

                        document.createElement(
                            "tr"
                        );


                    const prepayment =

                        Number(
                            item.prepayment
                        ) || 0;


                    const emiChanged =

                        Math.abs(

                            Number(
                                item.emi
                            )

                            -

                            Number(
                                item.next_emi
                            )

                        ) > 1;


                    if (
                        prepayment > 0
                    ) {

                        row.classList.add(
                            "prepayment-highlight"
                        );

                    }


                    row.innerHTML = `


                        <td>

                            ${item.month}

                        </td>


                        <td>

                            ${formatCurrency(
                                item.opening_balance
                            )}

                        </td>


                        <td>

                            ${formatCurrency(
                                item.emi
                            )}

                        </td>


                        <td>

                            ${formatCurrency(
                                item.principal
                            )}

                        </td>


                        <td>

                            ${formatCurrency(
                                item.interest
                            )}

                        </td>


                        <td class="${
                            prepayment > 0
                                ? "prepayment-value"
                                : ""
                        }">

                            ${
                                prepayment > 0

                                    ? formatCurrency(
                                        prepayment
                                    )

                                    : "—"
                            }

                        </td>


                        <td>

                            ${formatCurrency(
                                item.closing_balance
                            )}

                        </td>


                        <td class="${
                            emiChanged
                                ? "next-emi-changed"
                                : ""
                        }">

                            ${formatCurrency(
                                item.next_emi
                            )}

                        </td>


                    `;


                    scheduleBody.appendChild(
                        row
                    );

                }
            );

        }


        // =====================================================
        // INITIAL SETUP
        // =====================================================

        updatePrepaymentNumbers();

    });