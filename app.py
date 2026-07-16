from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)


def calculate_emi(principal, monthly_rate, months):
    if principal <= 0 or months <= 0:
        return 0

    if monthly_rate == 0:
        return principal / months

    factor = (1 + monthly_rate) ** months

    return (
        principal
        * monthly_rate
        * factor
        / (factor - 1)
    )


def calculate_remaining_months(
    principal,
    monthly_rate,
    emi
):
    """
    Calculate remaining tenure when EMI stays the same.
    """

    if principal <= 0:
        return 0

    if emi <= 0:
        return 0

    if monthly_rate == 0:
        return math.ceil(principal / emi)

    # EMI must be higher than monthly interest
    if emi <= principal * monthly_rate:
        return 1200

    months = (
        -math.log(
            1 - (
                principal
                * monthly_rate
                / emi
            )
        )
        / math.log(
            1 + monthly_rate
        )
    )

    return math.ceil(months)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():

    try:

        data = request.get_json()

        # ==========================================
        # INPUTS
        # ==========================================

        loan_amount = float(
            data.get(
                "loan_amount",
                0
            )
        )

        annual_rate = float(
            data.get(
                "interest_rate",
                0
            )
        )

        tenure_years = int(
            data.get(
                "tenure_years",
                0
            )
        )

        prepayments = data.get(
            "prepayments",
            []
        )


        # ==========================================
        # VALIDATION
        # ==========================================

        if loan_amount <= 0:

            raise ValueError(
                "Loan amount must be greater than zero."
            )


        if annual_rate < 0:

            raise ValueError(
                "Interest rate cannot be negative."
            )


        if tenure_years <= 0:

            raise ValueError(
                "Loan tenure must be greater than zero."
            )


        # ==========================================
        # ORIGINAL LOAN
        # ==========================================

        monthly_rate = (
            annual_rate
            / 12
            / 100
        )

        original_months = (
            tenure_years
            * 12
        )

        original_emi = calculate_emi(
            loan_amount,
            monthly_rate,
            original_months
        )

        original_interest = (
            original_emi
            * original_months
            - loan_amount
        )


        # ==========================================
        # PREPARE PREPAYMENTS
        # ==========================================

        valid_prepayments = []


        for index, item in enumerate(
            prepayments
        ):

            month = int(
                item.get(
                    "month",
                    0
                )
            )

            amount = float(
                item.get(
                    "amount",
                    0
                )
            )

            strategy = item.get(
                "strategy",
                "reduce_tenure"
            )


            if strategy not in [
                "reduce_tenure",
                "reduce_emi"
            ]:

                strategy = (
                    "reduce_tenure"
                )


            if (
                month > 0
                and amount > 0
            ):

                valid_prepayments.append({

                    "original_number":
                        index + 1,

                    "month":
                        month,

                    "amount":
                        amount,

                    "strategy":
                        strategy

                })


        # Apply chronologically

        valid_prepayments.sort(
            key=lambda x: x["month"]
        )


        # ==========================================
        # PREPAYMENT MAP
        # ==========================================

        prepayment_map = {}


        for payment in valid_prepayments:

            month = payment["month"]

            if month not in prepayment_map:

                prepayment_map[month] = []


            prepayment_map[
                month
            ].append(
                payment
            )


        # ==========================================
        # MIXED STRATEGY CALCULATION
        # ==========================================

        balance = loan_amount

        current_emi = original_emi

        # Current expected loan ending month
        current_end_month = (
            original_months
        )

        total_interest = 0

        total_prepayment = 0

        schedule = []

        strategy_history = []

        month = 1


        while (
            balance > 0.01
            and month <= 1200
        ):


            # ======================================
            # REGULAR EMI
            # ======================================

            opening_balance = balance


            interest = (
                opening_balance
                * monthly_rate
            )


            principal_paid = (
                current_emi
                - interest
            )


            if principal_paid <= 0:

                raise ValueError(
                    "EMI is too low to cover monthly interest."
                )


            emi_paid = current_emi


            # Last EMI adjustment

            if principal_paid >= balance:

                principal_paid = balance

                emi_paid = (
                    principal_paid
                    + interest
                )


            balance -= principal_paid

            total_interest += interest


            # ======================================
            # PREPAYMENTS FOR THIS MONTH
            # ======================================

            month_prepayment = 0


            if (
                month
                in prepayment_map
                and balance > 0.01
            ):


                for payment in (
                    prepayment_map[
                        month
                    ]
                ):


                    if balance <= 0.01:

                        break


                    balance_before_prepayment = (
                        balance
                    )


                    requested_amount = (
                        payment["amount"]
                    )


                    actual_prepayment = min(
                        requested_amount,
                        balance
                    )


                    balance -= (
                        actual_prepayment
                    )


                    month_prepayment += (
                        actual_prepayment
                    )


                    total_prepayment += (
                        actual_prepayment
                    )


                    old_emi = (
                        current_emi
                    )


                    old_end_month = (
                        current_end_month
                    )


                    old_remaining_months = max(
                        old_end_month
                        - month,
                        0
                    )


                    # ==================================
                    # OPTION 1:
                    # REDUCE TENURE
                    # ==================================

                    if (
                        payment["strategy"]
                        == "reduce_tenure"
                    ):


                        if balance > 0.01:

                            new_remaining_months = (
                                calculate_remaining_months(
                                    balance,
                                    monthly_rate,
                                    current_emi
                                )
                            )

                        else:

                            new_remaining_months = 0


                        current_end_month = (
                            month
                            + new_remaining_months
                        )


                        months_reduced = max(
                            old_end_month
                            - current_end_month,
                            0
                        )


                        strategy_history.append({

                            "number":
                                payment[
                                    "original_number"
                                ],

                            "month":
                                month,

                            "amount":
                                round(
                                    actual_prepayment,
                                    2
                                ),

                            "strategy":
                                "reduce_tenure",

                            "strategy_label":
                                "Reduce Tenure",

                            "balance_before":
                                round(
                                    balance_before_prepayment,
                                    2
                                ),

                            "balance_after":
                                round(
                                    balance,
                                    2
                                ),

                            "old_emi":
                                round(
                                    old_emi,
                                    2
                                ),

                            "new_emi":
                                round(
                                    current_emi,
                                    2
                                ),

                            "old_remaining_months":
                                old_remaining_months,

                            "new_remaining_months":
                                new_remaining_months,

                            "months_reduced":
                                months_reduced,

                            "new_end_month":
                                current_end_month

                        })


                    # ==================================
                    # OPTION 2:
                    # REDUCE EMI
                    # ==================================

                    else:


                        # Keep current ending month
                        # unchanged

                        remaining_months = max(
                            current_end_month
                            - month,
                            0
                        )


                        if (
                            balance > 0.01
                            and remaining_months > 0
                        ):

                            current_emi = (
                                calculate_emi(
                                    balance,
                                    monthly_rate,
                                    remaining_months
                                )
                            )

                        else:

                            current_emi = 0


                        emi_reduced_by = max(
                            old_emi
                            - current_emi,
                            0
                        )


                        strategy_history.append({

                            "number":
                                payment[
                                    "original_number"
                                ],

                            "month":
                                month,

                            "amount":
                                round(
                                    actual_prepayment,
                                    2
                                ),

                            "strategy":
                                "reduce_emi",

                            "strategy_label":
                                "Reduce EMI",

                            "balance_before":
                                round(
                                    balance_before_prepayment,
                                    2
                                ),

                            "balance_after":
                                round(
                                    balance,
                                    2
                                ),

                            "old_emi":
                                round(
                                    old_emi,
                                    2
                                ),

                            "new_emi":
                                round(
                                    current_emi,
                                    2
                                ),

                            "emi_reduced_by":
                                round(
                                    emi_reduced_by,
                                    2
                                ),

                            "remaining_months":
                                remaining_months,

                            "new_end_month":
                                current_end_month

                        })


            # ======================================
            # ADD MONTH TO SCHEDULE
            # ======================================

            schedule.append({

                "month":
                    month,

                "opening_balance":
                    round(
                        opening_balance,
                        2
                    ),

                "emi":
                    round(
                        emi_paid,
                        2
                    ),

                "principal":
                    round(
                        principal_paid,
                        2
                    ),

                "interest":
                    round(
                        interest,
                        2
                    ),

                "prepayment":
                    round(
                        month_prepayment,
                        2
                    ),

                "closing_balance":
                    round(
                        max(
                            balance,
                            0
                        ),
                        2
                    ),

                # EMI applicable from next month

                "next_emi":
                    round(
                        current_emi,
                        2
                    ),

                "expected_end_month":
                    current_end_month

            })


            # ======================================
            # LOAN CLOSED
            # ======================================

            if balance <= 0.01:

                balance = 0

                break


            month += 1


        # ==========================================
        # FINAL RESULTS
        # ==========================================

        actual_months = len(
            schedule
        )


        months_saved = max(
            original_months
            - actual_months,
            0
        )


        interest_saved = max(
            original_interest
            - total_interest,
            0
        )


        total_paid = (
            loan_amount
            + total_interest
        )


        # ==========================================
        # RESPONSE
        # ==========================================

        return jsonify({

            "success": True,


            # Original loan details

            "original": {

                "loan_amount":
                    round(
                        loan_amount,
                        2
                    ),

                "emi":
                    round(
                        original_emi,
                        2
                    ),

                "months":
                    original_months,

                "interest":
                    round(
                        original_interest,
                        2
                    )

            },


            # Final result based on
            # user's selected strategies

            "mixed_result": {

                "final_emi":
                    round(
                        current_emi,
                        2
                    ),

                "actual_months":
                    actual_months,

                "months_saved":
                    months_saved,

                "total_interest":
                    round(
                        total_interest,
                        2
                    ),

                "interest_saved":
                    round(
                        interest_saved,
                        2
                    ),

                "total_prepayment":
                    round(
                        total_prepayment,
                        2
                    ),

                "total_paid":
                    round(
                        total_paid,
                        2
                    )

            },


            # Result after every
            # individual user decision

            "strategy_history":
                strategy_history,


            # Complete month-wise schedule

            "schedule":
                schedule

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 400


if __name__ == "__main__":

    app.run(
        debug=True
    )